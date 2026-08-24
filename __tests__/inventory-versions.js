import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import helpers from 'yeoman-test';
import { duplicatedVersionVars } from '../test-utils/inventory-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// gh-45 (NLPHH, 2026-08-16): every `*_version` was written twice, e.g.
//
//   775: collectory_version = 1.6.4    <- fallback defaults block
//   806: collectory_version = 1.3.12   <- toolkit block, effective by position
//
// The toolkit block won only because ini parsers keep the last occurrence.
// Whatever the toolkit pins must be the only assignment in the file.
//
// The versions block is driven by LA_software_versions, a hidden `store: true`
// prompt (`when: () => false`) that only la-toolkit ever writes: yeoman-test
// cannot answer it via withPrompts, and the --replay-dont-ask path needs a full
// stored configuration this test has no business reconstructing. So render the
// block on its own -- it depends on nothing else -- and drive it directly.
const TEMPLATE = fs.readFileSync(
  path.join(__dirname, '../generators/app/templates/quick-start-inventory.ini'),
  'utf8'
);

// The self-contained region: from the fallback defaults header up to (but not
// including) the next unrelated section.
function versionsBlock() {
  const start = TEMPLATE.indexOf('# Default fallback versions');
  expect(start).toBeGreaterThan(-1);
  const end = TEMPLATE.indexOf('<%_ if (LA_use_doi) { _%>', start);
  expect(end).toBeGreaterThan(start);
  return TEMPLATE.slice(start, end);
}

const render = (softwareVersions) =>
  ejs.render(
    versionsBlock(),
    softwareVersions === undefined
      ? {}
      : { LA_software_versions: softwareVersions }
  );

const valueOf = (rendered, name) => {
  const match = rendered.match(new RegExp(`^${name}\\s*=\\s*(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

describe('inventory *_version assignments (gh-45)', () => {
  it('assigns every *_version exactly once when the toolkit pins versions', () => {
    const rendered = render([
      ['collectory_version', '6.0.0'],
      ['cas_version', '6.5.6-3'],
      ['pipelines_version', 'latest'],
    ]);

    expect(duplicatedVersionVars(rendered)).toEqual([]);
  });

  it('uses the toolkit value, not the stale fallback', () => {
    const rendered = render([
      ['collectory_version', '6.0.0'],
      ['pipelines_version', 'latest'],
    ]);

    expect(valueOf(rendered, 'collectory_version')).toBe('6.0.0');
    // The fallback still carries a 2022 Debian package string; it must not
    // reach the file at all once the toolkit has pinned pipelines.
    expect(valueOf(rendered, 'pipelines_version')).toBe('latest');
    expect(rendered).not.toMatch(/gbp85d7b3/);
  });

  it('still emits a fallback for services the toolkit did not pin', () => {
    const rendered = render([['collectory_version', '6.0.0']]);

    expect(valueOf(rendered, 'cas_version')).toBe('5.3.12-2');
    expect(valueOf(rendered, 'alerts_version')).toBe('1.5.3');
    expect(duplicatedVersionVars(rendered)).toEqual([]);
  });

  // The toolkit never pins biocollect, ecodata or dashboard, so for those three
  // the fallback IS the effective version -- it goes straight into
  // `livingatlases/<svc>:<version>` in the generated compose file. They used to
  // carry 2022 defaults (5.2.6 / 3.3.1 / 2.2) that were never published as
  // container images, so the deploy died on the pull. Pin the assertions so a
  // future edit cannot quietly reintroduce a tag that does not exist.
  it('falls back to published container tags for the unpinned services', () => {
    const rendered = render([['collectory_version', '6.0.0']]);

    expect(valueOf(rendered, 'biocollect_version')).toBe('8.4');
    expect(valueOf(rendered, 'ecodata_version')).toBe('5.9.2');
    expect(valueOf(rendered, 'dashboard_version')).toBe('2.6');
    expect(valueOf(rendered, 'pdf_service_version')).toBe('1.3');
  });

  it('emits the full fallback set when the toolkit sends nothing', () => {
    for (const rendered of [render([]), render(undefined)]) {
      expect(valueOf(rendered, 'collectory_version')).toBe('1.6.4');
      expect(valueOf(rendered, 'cas_version')).toBe('5.3.12-2');
      expect(duplicatedVersionVars(rendered)).toEqual([]);
    }
  });
});

// gh-44: the docker_compose service used to emit a per-service play pointing at
// ala-install/ansible/docker-compose.yml, which does not exist in the fork (it
// has docker-common.yml and docker-swarm.yml), so every CLI run aborted with
// "the playbook ... could not be found".
const PROMPTS = {
  LA_project_name: 'Test Versions',
  LA_project_shortname: 'testver',
  LA_pkg_name: 'test-ver',
  LA_domain: 'example.org',
  LA_hostnames: 'localhost',
  LA_use_docker_compose: true,
  LA_use_docker_swarm: false,
  LA_use_species: false,
  LA_use_images: true,
  LA_use_regions: false,
  LA_use_CAS: false,
  LA_use_species_lists: false,
  LA_use_biocache_store: true,
  LA_use_pipelines: false,
  LA_use_solrcloud: false,
  LA_use_spatial: false,
  LA_use_gatus: false,
  LA_use_portainer: false,
  // Without this the docker_compose service never reaches LA_services_in_use,
  // and the ansiblew assertions below would pass vacuously.
  LA_docker_compose_hostname: 'localhost',
  LA_collectory_hostname: 'localhost',
  LA_logger_hostname: 'localhost',
  LA_images_hostname: 'localhost',
  LA_solr_hostname: 'localhost',
  LA_biocache_backend_hostname: 'localhost',
  LA_cas_hostname: 'localhost',
  LA_spatial_hostname: 'localhost',
  LA_biocache_service_hostname: ['localhost'],
  LA_ala_hub_hostname: ['localhost'],
  LA_branding_hostname: 'localhost',
  LA_collectory_uses_subdomain: true,
  LA_ala_hub_uses_subdomain: true,
  LA_biocache_service_uses_subdomain: true,
  LA_logger_uses_subdomain: true,
  LA_solr_uses_subdomain: true,
  LA_branding_uses_subdomain: true,
  LA_cas_uses_subdomain: true,
  LA_spatial_uses_subdomain: true,
  LA_gatus_uses_subdomain: true,
  LA_portainer_uses_subdomain: true,
  LA_enable_ssl: true,
  LA_generate_branding: true,
  LA_use_git: true,
};

describe('ansiblew playbooks for a docker-compose portal (gh-44)', () => {
  let ansiblew;

  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts(PROMPTS);
    ansiblew = fs.readFileSync('test-ver-inventories/ansiblew', 'utf8');
  }, 120000);

  it('never references a nonexistent ala-install docker-compose playbook', () => {
    expect(ansiblew).not.toMatch(/ansible\/docker-compose\.yml/);
  });

  it('drives the compose leg through la-docker-compose site.yml', () => {
    expect(ansiblew).toMatch(/playbooks\/site\.yml/);
  });

  it('does not offer docker_compose as a per-service target', () => {
    const usage = ansiblew.split('\n').find((l) => l.includes('ansiblew --alainstall='));
    expect(usage).toBeDefined();
    expect(usage).not.toMatch(/\bdocker_compose\b/);
  });

  it('still emits the real ala-install plays for VM services', () => {
    expect(ansiblew).toMatch(/ansible\/collectory-by-type\.yml/);
  });
});
