import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';
import { parseIniGroups } from '../test-utils/inventory-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generator = path.join(__dirname, '../generators/app');

// LA_hubs never reaches the generator through a prompt: it is not even registered
// as one (see additionalToolkitVariables in generators/app/libs.js). It arrives in
// .yo-rc.json, which --replay-dont-ask reads wholesale as the answers. So a hub test
// has to run the generator over a fixture directory, not withPrompts().
async function runWithFixture(fixture) {
  return helpers
    .run(generator)
    .withOptions({ 'replay-dont-ask': true })
    .doInDir((dir) => {
      fs.copyFileSync(
        path.join(__dirname, 'fixtures', fixture, '.yo-rc.json'),
        path.join(dir, '.yo-rc.json')
      );
    });
}

const read = (p) => fs.readFileSync(p, 'utf8');

describe('data hubs on docker compose', () => {
  let full; // lademohub: records + species + regions, own branding
  let recordsOnly; // lademohub2: records only, no branding of its own
  let portal;

  beforeAll(async () => {
    await runWithFixture('hubs');
    full = read('lademohub-inventories/lademohub-inventory.ini');
    recordsOnly = read('lademohub2-inventories/lademohub2-inventory.ini');
    portal = read('lademo-inventories/lademo-inventory.ini');
  }, 120000);

  it('renders container paths, not host paths, for what the app itself reads', () => {
    // The config is written to the host at /data/lademohub-hub, but the container
    // mounts it at /data/ala-hub, which is where the stock war looks.
    expect(full).toContain(
      'biocache_grouped_facets_url=file:///data/ala-hub/config/grouped_facets_default.json'
    );
    expect(full).not.toContain('file:///data/lademohub-hub/config');
    // ... while the host-side data dir still carries the hub identity.
    expect(full).toContain('biocache_hub = lademohub-hub');
    expect(full).toContain('bie_hub = lademohub-bie-hub');
    expect(full).toContain('regions = lademohub-regions');
  });

  it('gives every hub app its own container name and vhost appname', () => {
    expect(full).toContain('biocache_hub_docker_host = la_biocache-hub-lademohub');
    expect(full).toContain('bie_hub_appname = lademohub-bie-hub');
    expect(full).toContain('bie_hub_upstream_host = la_bie-hub-lademohub');
    expect(full).toContain('regions_appname = lademohub-regions');
    expect(full).toContain('regions_upstream_host = regions-lademohub');
    expect(full).toContain('branding_appname = branding-lademohub');
  });

  it('declares one inventory alias per hub service, resolvable to its machine', () => {
    const { groups } = parseIniGroups(full);
    expect(groups['biocache-hub-lademohub']).toEqual(['localhost.ala_hub_lademohub']);
    expect(groups['bie-hub-lademohub']).toEqual(['localhost.ala_bie_lademohub']);
    expect(groups['regions-lademohub']).toEqual(['localhost.regions_lademohub']);
    expect(groups['branding-lademohub']).toEqual(['localhost.branding_lademohub']);
    // Without the [all] entry ansible would try to ssh to the alias name itself.
    expect(full).toContain('localhost.ala_hub_lademohub ansible_host=localhost');
  });

  it('does not wire species or regions for a records-only hub', () => {
    const { groups } = parseIniGroups(recordsOnly);
    expect(groups['bie-hub-lademohub2']).toBeUndefined();
    expect(groups['regions-lademohub2']).toBeUndefined();
    // An unconditional :children entry would make ansible auto-create the empty
    // group and inject it into the canonical one.
    expect(recordsOnly).not.toContain('[bie-hub:children]');
    expect(recordsOnly).not.toContain('[regions:children]');
    expect(recordsOnly).toContain('[biocache-hub:children]');
  });

  it('tells the docker leg which hubs to render, once, in the compose vars', () => {
    const matches = portal.match(/^la_hubs = .*$/gm) || [];
    expect(matches).toHaveLength(1);
    const hubs = JSON.parse(matches[0].replace(/^la_hubs = /, ''));
    expect(hubs.map((h) => h.pkg)).toEqual(['lademohub', 'lademohub2']);
    expect(hubs[0]).toMatchObject({ use_species: true, use_regions: true });
    expect(hubs[1]).toMatchObject({ use_species: false, use_regions: false });
    // Branding is per hub: one builds its own, the other reuses the portal's.
    expect(hubs[0].branding_source).toBe(
      'https://github.com/living-atlases/base-branding'
    );
    expect(hubs[1].branding_source).toBeNull();
    // and it has to sit in the docker_compose scope, not in [all:vars]
    const composeVars = portal.slice(portal.indexOf('[docker_compose:vars]'));
    expect(composeVars).toContain('la_hubs = ');
  });

  it('gives a hub without the branding service no branding of its own', () => {
    // The toolkit always fills branding_source with a default path, so the
    // SERVICE toggle is what says "this hub has no branding": with it off the
    // hub claims no branding group and la-docker-compose builds nothing for it,
    // leaving it to consume the branding its header_and_footer_baseurl serves.
    const records = read('lademohub2-inventories/lademohub2-inventory.ini');
    expect(records).not.toContain('[branding-lademohub2]');
    expect(records).not.toContain('[branding:children]');

    const portal = read('lademo-inventories/lademo-inventory.ini');
    const hubs = JSON.parse(
      portal.match(/^la_hubs = (.*)$/m)[1]
    );
    const bySource = Object.fromEntries(
      hubs.map((h) => [h.pkg, h.branding_source])
    );
    expect(bySource.lademohub2).toBeNull();
    expect(bySource.lademohub).toEqual(expect.stringContaining('base-branding'));
  });

  it('gives a hub the portal-style certs even if its stored flag says otherwise', () => {
    // lademohub carries LA_variable_use_la_site_certs: false in the fixture --
    // a stale la-toolkit hub-creation default, not a deliberate choice: nobody
    // wants nginx serving snakeoil on a public *.l-a.site vhost. The hub sits
    // on the same domain as the portal (l-a.site), so the domain auto-detect
    // must win over that stored false (build #401, la-docker-compose).
    expect(full).toContain('ssl_certificate_server_dir=/etc/letsencrypt/live/l-a.site');
    expect(full).not.toContain('ssl-cert-snakeoil');
  });

  it('does not duplicate the portal machine-level playbooks per hub', () => {
    expect(fs.existsSync('lademohub-pre-deploy')).toBe(false);
    expect(fs.existsSync('lademohub-post-deploy')).toBe(false);
    expect(fs.existsSync('lademo-pre-deploy')).toBe(true);
  });

  it('lets a hub deploy reach the host that renders the compose stack', () => {
    const ansiblew = read('lademohub-inventories/ansiblew');
    expect(ansiblew).toContain('docker_compose,docker_compose_hosts');
    expect(ansiblew).toContain('la_hub_only=%s');
    // Renaming the portal's own hub through global extra-vars is the bug this guards.
    expect(ansiblew).toContain("if ladocker:");
  });

  it('makes the portal compose run load the hub inventories', () => {
    // docker-compose.yml is one file for the whole stack: without the hub groups the
    // portal run renders it WITHOUT the hubs and the next `up` removes their containers.
    const ansiblew = read('lademo-inventories/ansiblew');
    const lines = ansiblew.split('\n');
    const loop = lines.findIndex((l) => l.includes('for hubPkg in ['));
    expect(loop).toBeGreaterThan(-1);
    expect(lines[loop]).toContain('"lademohub"');
    expect(lines[loop]).toContain('"lademohub2"');
    // ...and only there: a VM portal must not gain the hub hosts.
    expect(lines.slice(0, loop).join('\n')).toContain('if ladocker:');
    // --docker-local rewrites addresses to localhost, so the hub side has to be the
    // localhost-mode twin or its aliases name machines this run does not have.
    expect(ansiblew).toContain(
      'hubSuffix = "dev-docker-inventory.ini" if docker_local else "inventory.ini"'
    );
  });

  it('gives each hub a localhost-mode inventory of its own', () => {
    expect(fs.existsSync('lademohub-inventories/lademohub-dev-docker-inventory.ini')).toBe(true);
    const local = read('lademohub-inventories/lademohub-dev-docker-inventory.ini');
    const real = read('lademohub-inventories/lademohub-inventory.ini');
    expect(local).toContain('ansible_host=localhost');
    // Same hub, same groups: only the addresses change.
    const groups = (t) => t.match(/^\[.*\]$/gm);
    expect(groups(local)).toEqual(groups(real));
  });
});

describe('data hubs on VMs are unaffected', () => {
  let full;

  beforeAll(async () => {
    await runWithFixture('hubs-vm');
    full = read('lademohub-inventories/lademohub-inventory.ini');
  }, 120000);

  it('keeps host paths and bare machine names', () => {
    expect(full).toContain(
      'biocache_grouped_facets_url=file:///data/lademohub-hub/config/grouped_facets_default.json'
    );
    const { groups } = parseIniGroups(full);
    expect(groups['biocache-hub-lademohub']).toEqual(['localhost']);
  });

  it('emits none of the compose-only wiring', () => {
    expect(full).not.toContain('biocache_hub_docker_host');
    expect(full).not.toContain('bie_hub_appname');
    expect(full).not.toContain('regions_appname');
    expect(full).not.toContain('branding_appname');
  });
});
