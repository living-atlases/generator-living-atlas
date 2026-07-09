import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Returns the [section] an INI key line belongs to (nearest header above it).
function sectionOfKey(content, keyRegex) {
  let section = null;
  let found = null;
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    const h = line.match(/^\[([^\]]+)\]$/);
    if (h) {
      section = h[1];
      continue;
    }
    if (keyRegex.test(line)) found = section;
  }
  return found;
}

// nginx.conf is one file per VM shared by every co-located service. The http{}-block
// vars (log_format "postdata", server_names_hash_bucket_size) must live in [all:vars],
// never in a single service group, or a co-located service rewriting nginx.conf drops
// them and `nginx -t` fails validating another service's vhost (issue seen in
// ala-install-deploy-tests #1402: image-service dropped logger's postdata log_format).
describe('nginx machine-global http{} vars live in [all:vars]', () => {
  let inv;

  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts({
      LA_project_name: 'Test Nginx MG',
      LA_project_shortname: 'testngx',
      LA_pkg_name: 'test-ngx',
      LA_domain: 'example.org',
      LA_hostnames: 'localhost',
      // logger + images on the same host: the exact co-location that broke #1402
      LA_use_species: false,
      LA_use_images: true,
      LA_use_regions: false,
      LA_use_CAS: false,
      LA_use_species_lists: false,
      LA_use_biocache_store: true,
      LA_use_pipelines: false,
      LA_use_solrcloud: false,
      LA_use_spatial: false,
      LA_use_docker_swarm: false,
      LA_use_docker_compose: false,
      LA_collectory_hostname: 'localhost',
      LA_images_hostname: 'localhost',
      LA_logger_hostname: 'localhost',
      LA_solr_hostname: 'localhost',
      LA_biocache_backend_hostname: 'localhost',
    });
    inv = fs.readFileSync('test-ngx-inventories/test-ngx-inventory.ini', 'utf8');
  }, 120000);

  it('places nginx_other_log_formats and hash_bucket under [all:vars] (VM mode)', () => {
    expect(sectionOfKey(inv, /^nginx_other_log_formats=/)).toBe('all:vars');
    expect(sectionOfKey(inv, /^nginx_server_names_hash_bucket_size=/)).toBe('all:vars');
    // exactly one definition each (no leftover copy in logger-service / biocache group)
    expect((inv.match(/^nginx_other_log_formats=/gm) || []).length).toBe(1);
    expect((inv.match(/^nginx_server_names_hash_bucket_size=/gm) || []).length).toBe(1);
    // the logger vhost access_log directive stays (it is vhost-local, not http{})
    expect(inv).toMatch(/logger_service_extra_postdata_logging=/);
  });

  // The vars must be emitted before the `<% if LA_use_docker_swarm %>` block that
  // opens [docker_swarm_managers:vars]; otherwise, with swarm enabled, they would be
  // captured by that group instead of [all:vars]. Assert this on the template source
  // (a full swarm generation would need the whole swarm prompt set).
  it('emits the vars before any group :vars header in the template (all modes)', () => {
    const tpl = fs.readFileSync(
      path.join(__dirname, '../generators/app/templates/quick-start-inventory.ini'),
      'utf8'
    );
    const lines = tpl.split('\n');
    const allVars = lines.findIndex((l) => l.trim() === '[all:vars]');
    const logFmt = lines.findIndex((l) => /^nginx_other_log_formats=/.test(l.trim()));
    const hashBucket = lines.findIndex((l) => /^nginx_server_names_hash_bucket_size=/.test(l.trim()));
    const swarmHeader = lines.findIndex((l) => /docker_swarm_managers:vars/.test(l));
    expect(allVars).toBeGreaterThan(-1);
    expect(logFmt).toBeGreaterThan(allVars);
    expect(hashBucket).toBeGreaterThan(allVars);
    // before the swarm group opens, so they stay under [all:vars] when swarm is on
    expect(logFmt).toBeLessThan(swarmHeader);
    expect(hashBucket).toBeLessThan(swarmHeader);
  });
});
