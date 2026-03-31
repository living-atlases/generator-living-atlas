import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('generator-living-atlas:app docker_compose data_dir', () => {
  let runResult;

  beforeAll(async () => {
    runResult = await helpers
      .run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        LA_project_name: 'Test Docker Compose',
        LA_project_shortname: 'testdc',
        LA_pkg_name: 'test-dc',
        LA_domain: 'example.org',
        LA_hostnames: 'localhost',
        LA_use_docker_compose: true,
        LA_use_docker_swarm: false,
        LA_use_species: false,
        LA_use_images: false,
        LA_use_regions: false,
        LA_use_CAS: false,
        LA_use_species_lists: false,
        LA_use_biocache_store: false,
        LA_use_pipelines: false,
        LA_use_solrcloud: false,
        LA_use_spatial: false,
        LA_use_gatus: false,
        LA_use_portainer: false,
        // Mandatory servers
        LA_collectory_hostname: 'localhost',
        LA_logger_hostname: 'localhost',
        LA_solr_hostname: 'localhost',
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
      });
  }, 60000);

  it('sets data_dir to /data/docker-compose in [docker_compose:vars]', () => {
    assert.fileContent('test-dc-inventory.ini', /\[docker_compose:vars\]/);
    assert.fileContent('test-dc-inventory.ini', /data_dir=\/data\/docker-compose/);
  });
});
