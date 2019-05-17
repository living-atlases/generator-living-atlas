## <%= LA_project_name %>: Ansible Inventories

These are some generated inventories to use to set up some machines on EC2 or other cloud provider with LA software.

### Initial Setup

To use this, add the following into your `/etc/hosts` (of your working machine, and new service machine/s) and/or in your <%= LA_domain %> `DNS`. So these hostname should be accessible from your local working machine but also remotely between each machine/s so the hostname should resolve correctly.

```<% let i=12; LA_machines.forEach(machine => { %>
12.12.12.<%= i %>  <%= machine %><%; i++ }) %>
<% if (LA_use_CAS) { %>12.12.12.<%= i %>  <%= LA_cas_hostname %><% }; i++ %>
<% if (LA_use_spatial) { %>12.12.12.<%= i %>  <%= `spatial.${LA_domain}` %><% } %>
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

ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -s -i <%= LA_pkg_name %>/quick-start-inventory.yml $AI/ansible/ala-demo.yml --limit <%= LA_domain %>
<% for(var j=0; j < LA_services_machines.length; j++) { %>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -s -i <%= LA_pkg_name %>/quick-start-inventory.yml $AI/ansible/<%= LA_services_machines[j].map.playbook %>.yml --limit <%= LA_services_machines[j].machine %><% } %>
<% if (LA_use_spatial) { %>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -s -i <%= LA_pkg_name %>/quick-start-spatial-inventory.yml $AI/ansible/spatial.yml<% } %>
```
