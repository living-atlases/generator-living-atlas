import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generator = path.join(__dirname, '../generators/app');

// LA_etc_hosts, LA_docker_extra_hosts_by_host and LA_nginx_docker_internal_aliases_by_host
// are toolkit-only answers (no prompt), so drive the generator over a .yo-rc.json, as
// hub-inventory.js does. The base is the single-host docker-compose portal of the hubs
// fixture; only the three maps change.
async function runWith(values) {
  return helpers
    .run(generator)
    .withOptions({ 'replay-dont-ask': true })
    .doInDir((dir) => {
      const rc = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'hubs', '.yo-rc.json'), 'utf8')
      );
      Object.assign(rc['generator-living-atlas'].promptValues, values);
      fs.writeFileSync(path.join(dir, '.yo-rc.json'), JSON.stringify(rc));
    });
}

function extraHostsOf(inventory) {
  const m = inventory.match(/^docker_extra_hosts='(.*)'$/m);
  return m ? JSON.parse(m[1]) : [];
}

// A portal half migrated: the VMs' /etc/hosts (LA_etc_hosts) still names the VM that
// served records-ws and sensitive-data-service before the docker stack took them over.
describe('docker_extra_hosts of a VM + docker-compose portal', () => {
  let extra;

  beforeAll(async () => {
    await runWith({
      LA_etc_hosts: [
        '10.0.0.8 old-frontend records-ws.l-a.site sensitive-data-service.l-a.site',
        '10.0.0.9 solr-vm solr.l-a.site',
      ].join('\n'),
      LA_nginx_docker_internal_aliases_by_host: {
        localhost: ['records-ws.l-a.site', 'records.l-a.site'],
      },
      LA_docker_extra_hosts_by_host: {
        localhost: ['sensitive-data-service.l-a.site:10.0.0.3'],
      },
    });
    extra = extraHostsOf(fs.readFileSync('lademo-inventories/lademo-inventory.ini', 'utf8'));
  }, 120000);

  it('never maps a name this host serves itself to another machine', () => {
    expect(extra.filter((e) => e.startsWith('records-ws.l-a.site:'))).toEqual([]);
  });

  it('keeps the per-host mapping of a name, not the VM one', () => {
    expect(extra.filter((e) => e.startsWith('sensitive-data-service.l-a.site:'))).toEqual([
      'sensitive-data-service.l-a.site:10.0.0.3',
    ]);
  });

  it('still adds the /etc/hosts names nothing else answers for', () => {
    expect(extra).toEqual(
      expect.arrayContaining(['old-frontend:10.0.0.8', 'solr-vm:10.0.0.9', 'solr.l-a.site:10.0.0.9'])
    );
  });
});
