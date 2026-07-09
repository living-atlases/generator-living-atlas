// Helpers to parse a generated Ansible INI inventory in tests.

// Groups that describe machine/cluster topology on purpose: they are expected
// to reference the same physical machine that service aliases point to.
const MACHINE_GROUPS = new Set([
  'all',
  'la_pre_deploy_hosts',
  'la_postfix_hosts',
  'cluster_master',
  'cluster_nodes',
  'jenkins_master',
  'jenkins_slaves',
  'docker_swarm_managers',
  'docker_swarm_workers',
  'docker_compose_hosts',
]);

function parseGroups(content) {
  const groups = new Map(); // group -> [entryName, ...]
  let current = null;
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#') || line.startsWith(';')) continue;
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      const name = header[1];
      // :vars and :children sections are not host lists
      current = name.includes(':') ? null : name;
      if (current && !groups.has(current)) groups.set(current, []);
      continue;
    }
    if (current) {
      const entry = line.split(/\s+/)[0];
      if (entry.includes('=')) continue; // stray var line
      groups.get(current).push(entry);
    }
  }
  return groups;
}

// Map every inventory entry to its physical machine using the ansible_host
// declarations of the [all] alias section; entries without one are machines.
function machineOf(entry, aliasToMachine) {
  return aliasToMachine.get(entry) || entry;
}

function parseAliases(content) {
  const aliasToMachine = new Map();
  for (const line of content.split('\n')) {
    const m = line.match(/^(\S+)\s+.*ansible_host=(\S+)/);
    if (m) aliasToMachine.set(m[1], m[2]);
  }
  return aliasToMachine;
}

/**
 * Returns the list of service groups that contain two *different* entries
 * resolving to the same physical machine. Such a group would make a single
 * Ansible play run twice in parallel on the same VM (apt/dpkg lock races).
 * Duplicated identical names are ignored (Ansible merges them into one host).
 */
export function serviceGroupsWithDuplicatedMachines(content) {
  const groups = parseGroups(content);
  const aliasToMachine = parseAliases(content);
  const offenders = [];
  for (const [group, entries] of groups.entries()) {
    if (MACHINE_GROUPS.has(group) || group.endsWith('_group')) continue;
    const distinct = [...new Set(entries)];
    const machines = distinct.map((e) => machineOf(e, aliasToMachine));
    if (new Set(machines).size !== machines.length) {
      offenders.push(group);
    }
  }
  return offenders;
}

export { parseGroups, parseAliases };
