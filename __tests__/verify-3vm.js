import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';
import { serviceGroupsWithDuplicatedMachines } from '../test-utils/inventory-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reproduces the ala-install-deploy-tests scenario: 3 distinct VMs, services
// spread across them (test-1 hubs, test-2 species/images, test-3 solrcloud).
describe('3-VM inventory (ala-install-deploy-tests scenario)', () => {
  const inventory = 'test-3vm-inventories/test-3vm-inventory.ini';

  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts({
      LA_project_name: 'Test 3VM',
      LA_project_shortname: 'test3vm',
      LA_pkg_name: 'test-3vm',
      LA_domain: 'example.org',
      LA_hostnames: 'vm1 vm2 vm3',
      LA_use_docker_swarm: false,
      LA_use_docker_compose: false,
      LA_use_species: true,
      LA_use_images: true,
      LA_use_regions: true,
      LA_use_CAS: true,
      LA_use_species_lists: false,
      LA_use_biocache_store: true,
      LA_use_pipelines: false,
      LA_use_solrcloud: true,
      LA_use_spatial: true,
      // test-1: hubs + biocache backend
      LA_collectory_hostname: 'vm1',
      LA_ala_hub_hostname: ['vm1'],
      LA_biocache_service_hostname: ['vm1'],
      LA_biocache_backend_hostname: 'vm1',
      LA_branding_hostname: 'vm1',
      LA_spatial_hostname: 'vm1',
      // test-2: species / images / regions / cas
      LA_images_hostname: 'vm2',
      LA_regions_hostname: 'vm2',
      LA_ala_bie_hostname: 'vm2',
      LA_bie_index_hostname: 'vm2',
      LA_cas_hostname: 'vm2',
      LA_logger_hostname: 'vm2',
      // test-3: solrcloud + zookeeper
      LA_solr_hostname: 'vm3',
      LA_solrcloud_hostname: ['vm3'],
      LA_zookeeper_hostname: ['vm3'],
    });
  }, 120000);

  it('lists all three bare VM names in [la_pre_deploy_hosts]', () => {
    const content = fs.readFileSync(inventory, 'utf8');
    const section = content.split(/\[la_pre_deploy_hosts\]\n/)[1].split(/\n\[/)[0];
    const entries = section.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    // eslint-disable-next-line no-console
    console.log('la_pre_deploy_hosts =', JSON.stringify(entries));
    expect(new Set(entries)).toEqual(new Set(['vm1', 'vm2', 'vm3']));
  });

  it('has no service group with the same machine twice', () => {
    const offenders = serviceGroupsWithDuplicatedMachines(fs.readFileSync(inventory, 'utf8'));
    expect(offenders).toEqual([]);
  });
});
