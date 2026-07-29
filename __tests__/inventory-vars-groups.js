import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helpers from 'yeoman-test';
import { varsSectionsWithoutGroup } from '../test-utils/inventory-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Every `[x:vars]` section needs group x to exist. Ansible's ini plugin refuses the
// section otherwise and, since it fills the inventory as it reads it, drops the whole
// rest of the file — plus any later inventory referencing a group from that lost tail.
// It only warns, so a deploy happily runs on a half-read inventory: this is how gbif-es
// lost 49 sections of its inventory and 10 of its local-extras (2026-07-28), including
// the vars of every solrcloud and zookeeper host.
//
// Three machines, and vm3 running a single service: a group named after the host only
// exists for hosts running several (it is `<host>_group` then), so vm3 is the case that
// used to emit `[vm3.example.org:vars]` with no group behind it.
const PROMPTS = {
  LA_project_name: 'Test Vars Groups',
  LA_project_shortname: 'testvg',
  LA_pkg_name: 'test-vg',
  LA_domain: 'example.org',
  LA_hostnames: 'vm1.example.org vm2.example.org vm3.example.org',
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
  LA_collectory_hostname: 'vm1.example.org',
  LA_logger_hostname: 'vm1.example.org',
  LA_images_hostname: 'vm3.example.org',
  LA_solr_hostname: 'vm2.example.org',
  LA_biocache_backend_hostname: 'vm2.example.org',
  LA_cas_hostname: 'vm1.example.org',
  LA_spatial_hostname: 'vm2.example.org',
  LA_biocache_service_hostname: ['vm2.example.org'],
  LA_ala_hub_hostname: ['vm1.example.org'],
  LA_branding_hostname: 'vm1.example.org',
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
};

describe('every [x:vars] section has its group declared', () => {
  let inventory;
  let devInventory;
  let extras;

  beforeAll(async () => {
    await helpers.run(path.join(__dirname, '../generators/app')).withPrompts(PROMPTS);
    inventory = fs.readFileSync('test-vg-inventories/test-vg-inventory.ini', 'utf8');
    devInventory = fs.readFileSync('test-vg-inventories/test-vg-dev-docker-inventory.ini', 'utf8');
    extras = fs.readFileSync('test-vg-inventories/test-vg-local-extras.ini', 'utf8');
  }, 120000);

  it('declares every group used by a :vars section in the main inventory', () => {
    expect(varsSectionsWithoutGroup(inventory)).toEqual([]);
  });

  it('declares every group used by a :vars section in the dev docker inventory', () => {
    expect(varsSectionsWithoutGroup(devInventory)).toEqual([]);
  });

  it('declares every group used by a :vars section once local-extras is loaded too', () => {
    expect(varsSectionsWithoutGroup([inventory, extras])).toEqual([]);
  });
});

// NOTE: the per-host docker block (nginx_docker_internal_aliases / docker_extra_hosts),
// which is where this actually bit gbif-es, cannot be driven from here: it needs
// LA_docker_extra_hosts_by_host / LA_etc_hosts, hidden prompts only the toolkit ever
// writes, and yeoman-test cannot inject a prompt whose `when` is false. That fix was
// verified by regenerating gbif-es's own inventory: the section is now named
// [gbif-es-images-2021_group] and `ansible-inventory --list` parses the file whole.
