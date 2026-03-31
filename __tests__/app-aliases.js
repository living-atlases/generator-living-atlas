import path from 'path';
import { fileURLToPath } from 'url';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('generator-living-atlas:app with multiple services on same host', () => {
  let runResult;

  beforeAll(async () => {
    runResult = await helpers
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

        // Map services to 'localhost'
        LA_collectory_hostname: 'localhost',
        LA_images_hostname: 'localhost',
        LA_solr_hostname: 'localhost',
        LA_regions_hostname: 'localhost',
        LA_ala_bie_hostname: 'localhost',
        LA_bie_index_hostname: 'localhost',
        // Confirmations
        LA_use_species_lists: false,
        LA_use_biocache_store: false,
        LA_use_pipelines: false,
        LA_use_solrcloud: false,
      });
  });

  it('creates inventory with aliases when multiple services on same host', () => {
    // Assert aliases are defined in [all]
    assert.fileContent('test-la-alias-inventory.ini', /localhost\.collectory ansible_host=localhost/);
    assert.fileContent('test-la-alias-inventory.ini', /localhost\.images ansible_host=localhost/);
    assert.fileContent('test-la-alias-inventory.ini', /localhost\.regions ansible_host=localhost/);
    assert.fileContent('test-la-alias-inventory.ini', /localhost\.ala_bie ansible_host=localhost/);

    // Assert groups use aliases
    assert.fileContent('test-la-alias-inventory.ini', /\[collectory\]\nlocalhost\.collectory/);
    assert.fileContent('test-la-alias-inventory.ini', /\[image-service\]\nlocalhost\.images/);
    assert.fileContent('test-la-alias-inventory.ini', /\[regions\]\nlocalhost\.regions/);
  });

  it('creates physical server group for common tasks', () => {
    assert.fileContent('test-la-alias-inventory.ini', /\[localhost\]/);
    assert.fileContent('test-la-alias-inventory.ini', /\[localhost\]\nlocalhost\.collectory/);
  });

  it('adds explanatory comments about aliases', () => {
    assert.fileContent('test-la-alias-inventory.ini', /# NOTE: When multiple services are deployed on the same physical server/);
  });
});
