import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('generator-living-atlas:app', () => {
  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts({
      LA_project_name: 'Test LA',
      LA_project_shortname: 'testla',
      LA_pkg_name: 'test-la',
      LA_domain: 'example.org',
      LA_hostnames: 'localhost',
      LA_use_species: true,
      LA_use_images: true,
      LA_use_regions: true,
      LA_use_CAS: false,
      LA_use_species_lists: false,
      LA_use_biocache_store: true,
      LA_use_pipelines: false,
      LA_use_solrcloud: false,
      LA_use_spatial: false,
      LA_collectory_hostname: 'localhost',
      LA_images_hostname: 'localhost',
      LA_regions_hostname: 'localhost',
      LA_ala_bie_hostname: 'localhost',
      LA_bie_index_hostname: 'localhost',
      LA_solr_hostname: 'localhost',
      LA_biocache_backend_hostname: 'localhost',
      LA_enable_ssl: true,
      LA_generate_branding: true,
      LA_use_git: false,
    });
  }, 120000);

  it('creates the main inventory', () => {
    assert.file(['test-la-inventories/test-la-inventory.ini']);
  });

  it('creates the pre-deploy and post-deploy machine-level playbooks', () => {
    assert.fileContent('test-la-pre-deploy/pre-deploy.yml', /hosts: la_pre_deploy_hosts/);
    assert.fileContent('test-la-post-deploy/post-deploy.yml', /hosts: la_pre_deploy_hosts/);
    assert.fileContent('test-la-post-deploy/post-deploy.yml', /hosts: la_postfix_hosts/);
  });
});
