import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { serviceGroupsWithDuplicatedMachines } from '../test-utils/inventory-utils.js';

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
        // Mandatory servers
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
      });
  }, 60000);

  const inventory = 'test-dc-inventories/test-dc-inventory.ini';
  const devInventory = 'test-dc-inventories/test-dc-dev-docker-inventory.ini';

  it('sets data_dir to /data/docker-compose in [docker_compose:vars]', () => {
    assert.fileContent(inventory, /\[docker_compose:vars\]/);
    assert.fileContent(inventory, /data_dir=\/data\/docker-compose/);
  });

  it('generates a local development docker inventory mapped to localhost', () => {
    assert.file([devInventory]);
    assert.fileContent(devInventory, /ansible_connection=local/);
  });

  it('does not register the same machine twice in any service group (dpkg race guard)', () => {
    for (const inv of [inventory, devInventory]) {
      const offenders = serviceGroupsWithDuplicatedMachines(fs.readFileSync(inv, 'utf8'));
      expect(offenders).toEqual([]);
    }
  });
});
