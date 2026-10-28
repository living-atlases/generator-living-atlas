import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The alerts page links to four example searches. They were hardcoded to ALA's hubs
// (biocache/bie/regions/collections.ala.org.au), so every portal sent its users there.
const PROMPTS = {
  LA_project_name: 'Test Alerts Search',
  LA_project_shortname: 'testalertssearch',
  LA_pkg_name: 'test-alerts-search',
  LA_domain: 'example.org',
  LA_hostnames: 'localhost',
  LA_use_species: true,
  LA_use_images: true,
  LA_images_hostname: 'localhost',
  LA_use_regions: true,
  LA_regions_hostname: 'localhost',
  LA_use_CAS: false,
  LA_use_species_lists: false,
  LA_use_biocache_store: true,
  LA_use_pipelines: false,
  LA_use_solrcloud: false,
  LA_use_spatial: false,
  LA_use_alerts: true,
  LA_alerts_hostname: 'localhost',
  LA_collectory_hostname: 'localhost',
  LA_ala_bie_hostname: 'localhost',
  LA_bie_index_hostname: 'localhost',
  LA_solr_hostname: 'localhost',
  LA_biocache_backend_hostname: 'localhost',
  LA_enable_ssl: true,
  LA_generate_branding: false,
  LA_use_git: false,
};

const KEYS = ['occurrence_searchUrl', 'regions_searchUrl', 'speciesPages_searchUrl', 'collection_searchUrl'];

describe('alerts example search urls', () => {
  let inventory;

  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts(PROMPTS);
    inventory = fs.readFileSync('test-alerts-search-inventories/test-alerts-search-inventory.ini', 'utf8');
  }, 120000);

  it.each(KEYS)('%s points at this portal, not at ALA', (key) => {
    const m = inventory.match(new RegExp(`^${key}\\s*=\\s*(.*)$`, 'm'));
    expect(m).not.toBeNull();
    expect(m[1]).toMatch(/^https:\/\/[^/]*example\.org/);
    expect(m[1]).not.toMatch(/ala\.org\.au/);
  });
});
