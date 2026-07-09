import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { serviceGroupsWithDuplicatedMachines } from '../test-utils/inventory-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('generator-living-atlas:app with multiple services on same host', () => {
  const inventory = 'test-la-alias-inventories/test-la-alias-inventory.ini';

  beforeAll(async () => {
    await helpers
      .run(path.join(__dirname, '../generators/app'))
      .withPrompts({
        LA_project_name: 'Test LA Alias',
        LA_project_shortname: 'Test LA Alias',
        LA_pkg_name: 'test-la-alias',
        LA_domain: 'test-alias.org',
        LA_hostnames: 'localhost',
        // Services that allow multiple on same host
        LA_use_species: true,
        LA_use_images: true,
        LA_use_regions: true,
        LA_use_CAS: false,
        LA_use_spatial: true,

        // Map services to 'localhost'
        LA_collectory_hostname: 'localhost',
        LA_images_hostname: 'localhost',
        LA_solr_hostname: 'localhost',
        LA_regions_hostname: 'localhost',
        LA_ala_bie_hostname: 'localhost',
        LA_bie_index_hostname: 'localhost',
        LA_spatial_hostname: 'localhost',
        // Confirmations
        LA_use_species_lists: false,
        LA_use_biocache_store: true,
        LA_biocache_backend_hostname: 'localhost',
        LA_use_pipelines: false,
        LA_use_solrcloud: false,
      });
  }, 120000);

  it('creates inventory with aliases when multiple services on same host', () => {
    // Assert aliases are defined in [all]
    assert.fileContent(inventory, /localhost\.collectory ansible_host=localhost/);
    assert.fileContent(inventory, /localhost\.images ansible_host=localhost/);
    assert.fileContent(inventory, /localhost\.regions ansible_host=localhost/);
    assert.fileContent(inventory, /localhost\.ala_bie ansible_host=localhost/);

    // Assert groups use aliases
    assert.fileContent(inventory, /\[collectory\]\nlocalhost\.collectory/);
    assert.fileContent(inventory, /\[image-service\]\nlocalhost\.images/);
    assert.fileContent(inventory, /\[regions\]\nlocalhost\.regions/);
  });

  it('creates physical server group for common tasks', () => {
    assert.fileContent(inventory, /\[localhost_group\]/);
    assert.fileContent(inventory, /\[localhost_group\]\nlocalhost\.collectory/);
  });

  it('adds explanatory comments about aliases', () => {
    assert.fileContent(inventory, /# NOTE: When multiple services are deployed on the same physical server/);
  });

  it('lists every physical server with its bare name in [la_pre_deploy_hosts]', () => {
    // Machine identity: bootstrap (--limit <vm>) and machine-level pre/post-deploy
    // plays need the bare hostname, even when the host only exists as service
    // aliases elsewhere (issue seen in ala-install-deploy-tests: a VM whose bare
    // name is not in the inventory never gets the ansible user created).
    assert.fileContent(inventory, /\[la_pre_deploy_hosts\]\nlocalhost\n/);
  });

  it('creates a deduplicated [la_postfix_hosts] machine group', () => {
    assert.fileContent(inventory, /\[la_postfix_hosts\]/);
    const content = fs.readFileSync(inventory, 'utf8');
    const section = content.split(/\[la_postfix_hosts\]\n/)[1].split(/\n\[/)[0];
    const entries = section.split('\n').filter((l) => l.trim() !== '' && !l.startsWith('#'));
    expect(new Set(entries).size).toBe(entries.length);
  });

  it('uses the spatial alias in the spatial service groups', () => {
    assert.fileContent(inventory, /\[spatial\]\nlocalhost\.spatial/);
    assert.fileContent(inventory, /\[geoserver\]\nlocalhost\.spatial/);
    assert.fileContent(inventory, /\[geonetwork\]\nlocalhost\.spatial/);
    assert.fileContent(inventory, /\[spatial-hub\]\nlocalhost\.spatial nginx_vhost_fast_mode=false/);
    assert.fileContent(inventory, /\[spatial-service\]\nlocalhost\.spatial nginx_vhost_fast_mode=false/);
  });

  it('does not register the same machine twice in any service group (dpkg race guard)', () => {
    const offenders = serviceGroupsWithDuplicatedMachines(fs.readFileSync(inventory, 'utf8'));
    expect(offenders).toEqual([]);
  });
});
