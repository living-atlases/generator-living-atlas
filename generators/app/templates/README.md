## <%= LA_project_name %>: Ansible Inventories

These are some generated inventories to use to set up some machines on EC2 or other cloud provider with LA software.

### Initial Setup

To use this, add the following into your `/etc/hosts` (of your working machine, and new service machine/s) and/or in your <%= LA_domain %> `DNS`. So these hostname should be accessible from your local working machine but also remotely between each machine/s so the hostname should resolve correctly.

```<% let i=12; LA_machines.forEach(machine => { %>
12.12.12.<%= i %>  <%= machine %><%; i++ }) %>
```

You'll need to replace `12.12.12.1` etc with the IP address of some new Ubuntu 16 instance in your provider.

These machines should have an user `ubuntu` with `sudo` permissions.

You should generate and use some ssh key and copy `~/.ssh/MyKey.pub` in thouse machines under `~ubuntu/.ssh/authorized_keys` (via `ssh-copy-id` for avoid issues).

You can test your initial setup with some `ssh` command like:
```
ssh -i ~/.ssh/MyKey.pem ubuntu@12.12.12.1 sudo ls /root
```
that should work.

### Run ansible

With access to this machine/s you can run ansible:

```
export AI=<location-of-your-cloned-ala-install-repo>

#  For this demo to run well, we recommend a machine of 16GB RAM, 4 CPUs.
<% let baseInv=`-i ${LA_pkg_name}-inventory.yml -i ${LA_pkg_name}-local-extras.yml`; %>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu <%= baseInv %> $AI/ansible/ala-demo.yml --limit <%= LA_domain %>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu <%= baseInv %> $AI/ansible/ala-demo.yml --limit <%= LA_domain %>
<% for(var j=0; j < LA_services_machines.length; j++) {
let isSpatialInv = LA_services_machines[j].map.name === 'spatial';
let isCasInv = LA_services_machines[j].map.name === 'cas';
let extraInv;
if (isSpatialInv) {
    extraInv = `-i ${LA_pkg_name}-spatial-inventory.yml -i ${LA_pkg_name}-spatial-local-extras.yml`;
}
if (isCasInv) {
    extraInv = `-i ${LA_pkg_name}-cas-inventory.yml -i ${LA_pkg_name}-cas-local-extras.yml --extra-vars "ala_install_repo=$AI"`;
}
%>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu <%= baseInv %> <%- extraInv %> $AI/ansible/<%= LA_services_machines[j].map.playbook %>.yml --limit <%= LA_services_machines[j].machine %><% } %>
```
#### ansible-playbook wrapper

Also there is the utility `ansiblew` an `ansible-playbook` wrapper that can help you to exec this commands and can be easily modificable by you to your needs. It depends on `python-docopt` package. Help output:

```
$ ./ansiblew --help

This is an ansible wrapper to help you to exec the different playbooks with your
inventories.

By default don't exec nothing only show the commands. With --nodryrun you can exec
the real commands.

With 'main' only operates over your main host.

Usage:
   ansiblew --alainstall=<dir_of_ala_install_repo> [options] [ main | collectory | ala_hub | biocache_service | ala_bie | bie_index | images | lists | regions | logger | solr | cas | biocache_backend | biocache_cli | spatial |  all ]
   ansiblew -h | --help
   ansiblew -v | --version

Options:
  --nodryrun             Exec the ansible-playbook commands
  -p --properties        Only update properties
  -l --limit=<hosts>     Limit to some inventories hosts
  -s --skip=<tags>       Skip tags
  -h --help              Show help options.
  -d --debug             Show debug info.
  -v --version           Show ansiblew version.
----
ansiblew 0.1.0
Copyright (C) 2019 living-atlases.gbif.org
Apache 2.0 License
```
So you can install the CAS service or the spatial service with commands like:

```bash
./ansiblew --alainstall=../ala-install cas --nodryrun
```

and

```bash
./ansiblew --alainstall=../ala-install spatial --nodryrun
```

or all the services with something like:

```bash
./ansiblew --alainstall=../ala-install all --nodryrun
```

### Rerunning the generator

You can rerun the generator with the option `--replay` to use all the previous responses and regenerate the inventories with some modification (if for instance you want to add a new service, or using a new version of this generator with improvements).

We recommend to override and set variables adding then to `<%= LA_pkg_name %>-local-extras.yml` and `<%= LA_pkg_name %>-spatial-local-extras.yml` without modify the generated `<%= LA_pkg_name %>-inventory.yml` and `<%= LA_pkg_name %>-spatial-inventory.yml`, so you can rerun the generator in the future without lost local changes.
