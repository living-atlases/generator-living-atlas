import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ala-install reads specieslist_service_url in two roles that want it differently:
// bie-index uses it as is (with /ws) and bie-hub appends /ws/species/<guid> to it. With
// the /ws from [all:vars], bie-hub asked for /ws/ws/species/<guid> (404) and species pages
// came out without their lists. bie-hub gets its own value, without /ws.
const PROMPTS = {
  LA_project_name: 'Test Lists',
  LA_project_shortname: 'testlists',
  LA_pkg_name: 'test-lists',
  LA_domain: 'example.org',
  LA_hostnames: 'localhost',
  LA_use_species: true,
  LA_use_images: true,
  LA_images_hostname: 'localhost',
  LA_use_regions: false,
  LA_use_CAS: false,
  LA_use_species_lists: true,
  LA_use_biocache_store: true,
  LA_use_pipelines: false,
  LA_use_solrcloud: false,
  LA_use_spatial: false,
  LA_collectory_hostname: 'localhost',
  LA_ala_bie_hostname: 'localhost',
  LA_bie_index_hostname: 'localhost',
  LA_lists_hostname: 'localhost',
  LA_solr_hostname: 'localhost',
  LA_biocache_backend_hostname: 'localhost',
  LA_enable_ssl: true,
  LA_generate_branding: false,
  LA_use_git: false,
};

// value of `key` inside [section] (any section but bie-hub's when section is null), or undefined
function varIn(content, section, key) {
  let inside = false;
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      inside = section === null ? header[1] !== 'bie-hub:vars' : header[1] === section;
      continue;
    }
    const m = inside && line.match(/^([^#;=\s]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) return m[2].trim();
  }
  return undefined;
}

describe('specieslist_service_url for bie-index and bie-hub', () => {
  let inventory;

  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts(PROMPTS);
    inventory = fs.readFileSync('test-lists-inventories/test-lists-inventory.ini', 'utf8');
  }, 120000);

  it('keeps the /ws in the global value bie-index reads', () => {
    expect(varIn(inventory, null, 'specieslist_service_url')).toMatch(/\/ws$/);
  });

  it('gives bie-hub the lists base URL without /ws', () => {
    const all = varIn(inventory, null, 'specieslist_service_url');
    const hub = varIn(inventory, 'bie-hub:vars', 'specieslist_service_url');
    expect(hub).toBeDefined();
    expect(hub).not.toMatch(/\/ws\/?$/);
    expect(`${hub}/ws`).toBe(all);
  });
});
