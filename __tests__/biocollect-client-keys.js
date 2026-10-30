import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generator = path.join(__dirname, '../generators/app');

const BIOCOLLECT = {
  LA_use_biocollect: true,
  LA_biocollect_hostname: 'localhost',
  LA_use_ecodata: true,
  LA_ecodata_hostname: 'localhost',
  LA_use_pdfgen: true,
  LA_pdfgen_hostname: 'localhost',
};

const KEY = /^(biocollect|ecodata)_client_(id|secret) *=/;

function passwordsPath(dir) {
  const inventories = fs.readdirSync(dir).find((f) => f.endsWith('-inventories'));
  const file = fs.readdirSync(path.join(dir, inventories)).find((f) => f.endsWith('-local-passwords.ini'));
  return path.join(dir, inventories, file);
}

const count = (content, key) => content.split('\n').filter((l) => l.startsWith(`${key} =`)).length;

function writeRc(dir, values) {
  const rc = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'hubs', '.yo-rc.json'), 'utf8'));
  Object.assign(rc['generator-living-atlas'].promptValues, values);
  fs.writeFileSync(path.join(dir, '.yo-rc.json'), JSON.stringify(rc));
}

// init-cas-admin.yml registers an OIDC client per service with a client id. A new passwords file
// gets them all, but only then: a portal generated before biocollect had a compose service, or
// one that dropped them, needs them added when it turns biocollect on.
describe('biocollect and ecodata OIDC clients of an existing portal', () => {
  let dir;

  beforeAll(async () => {
    // Not the temporary dir of helpers.run: the next run would wipe it.
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'biocollect-keys-'));
    writeRc(dir, {});
    await helpers.run(generator).cd(dir).withOptions({ 'replay-dont-ask': true });
  }, 120000);

  it('are added when it enables biocollect, keeping the keys it had', async () => {
    const file = passwordsPath(dir);
    const old = fs.readFileSync(file, 'utf8').split('\n').filter((l) => !KEY.test(l)).join('\n');
    fs.writeFileSync(file, old);
    const collectory = old.split('\n').find((l) => l.startsWith('collectory_client_id ='));
    expect(collectory).toBeDefined();

    writeRc(dir, BIOCOLLECT);
    await helpers.run(generator).cd(dir).withOptions({ 'replay-dont-ask': true, force: true });

    const passwords = fs.readFileSync(file, 'utf8');
    for (const key of ['biocollect', 'ecodata']) {
      expect(count(passwords, `${key}_client_id`)).toBe(1);
      expect(count(passwords, `${key}_client_secret`)).toBe(1);
    }
    expect(passwords).toContain(collectory);
  }, 120000);
});
