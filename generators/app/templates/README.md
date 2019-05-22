## <%= LA_project_name %>: Ansible Inventories

These are some generated inventories to use to set up some machines on EC2 or other cloud provider with LA software.

### Initial Setup

To use this, add the following into your `/etc/hosts` (of your working machine, and new service machine/s) and/or in your <%= LA_domain %> `DNS`. So these hostname should be accessible from your local working machine but also remotely between each machine/s so the hostname should resolve correctly.

```<% let i=12; LA_machines.forEach(machine => { %>
12.12.12.<%= i %>  <%= machine %><%; i++ }) %>
<% if (LA_use_CAS) { %>12.12.12.<%= i %>  <%= LA_cas_hostname %><% }; i++ %>
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

ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -i <%= LA_pkg_name %>/quick-start-inventory.yml $AI/ansible/ala-demo.yml --limit <%= LA_domain %>
<% for(var j=0; j < LA_services_machines.length; j++) { %>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -i <%= LA_pkg_name %>/quick-start-inventory.yml $AI/ansible/<%= LA_services_machines[j].map.playbook %>.yml --limit <%= LA_services_machines[j].machine %><% } %>
```
#### ansible-playbook wrapper

Also there is the utility `ansiblew` an `ansible-playbook` wrapper that can help you to exec this commands and can be easily modificable by you to your needs. It depends on `python-docopt` package. Help output:

```
$ ./ansiblew -h

This is an ansible wrapper to help you to exec the different playbooks with your
inventories.

By default don't exec nothing only show the commands. With --nodryrun you can exec
the real commands.

With 'main' only operates over your main host.

Usage:
   ansiblew --alainstall=<dir_of_ala_install_repo> [options] [ main | collectory | ala_hub | biocache_service | ala_bie | bie_index | images | lists | regions | logger | solr | spatial |  all ]
   ansiblew -h | --help
   ansiblew -v | --version

Options:
  --nodryrun             Exec the ansible-playbook comands
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
