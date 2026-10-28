import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The spatial hub writes the "view this list" link of every species list with lists.urlUi, and the
// ala-install template leaves that at lists.ala.org.au when lists_ui_url is not set, so a portal
// that only got lists_url sent its own druids to ALA, where they do not exist.
const PROMPTS = {
  LA_project_name: 'Test Lists UI',
  LA_project_shortname: 'testlistsui',
  LA_pkg_name: 'test-lists-ui',
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
  LA_use_spatial: true,
  LA_spatial_hostname: 'localhost',
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

// value of `key` inside [section], or undefined
function varIn(content, section, key) {
  let inside = false;
  for (const raw of content.split('\n')) {
    const line = raw.trim();
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      inside = header[1] === section;
      continue;
    }
    const m = inside && line.match(/^([^#;=\s]+)\s*=\s*(.*)$/);
    if (m && m[1] === key) return m[2].trim();
  }
  return undefined;
}

describe('lists_ui_url in the spatial section', () => {
  let inventory;

  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts(PROMPTS);
    inventory = fs.readFileSync('test-lists-ui-inventories/test-lists-ui-inventory.ini', 'utf8');
  }, 120000);

  it('gives the spatial hub the UI url of its own list server', () => {
    const url = varIn(inventory, 'spatial:vars', 'lists_url');
    const urlUi = varIn(inventory, 'spatial:vars', 'lists_ui_url');
    expect(url).toBeDefined();
    expect(urlUi).toBe(url);
    expect(urlUi).not.toMatch(/ala\.org\.au/);
  });
});
