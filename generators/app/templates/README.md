## <%= LA_project_name %>: Ansible Inventories

These are some generated inventories to use to set up some machines on EC2 or other cloud provider with LA software.

### Initial Setup

To use this, add the following into your `/etc/hosts` (of your working machine, and new service machine/s) and/or in your <%= LA_domain %> `DNS`. So these hostname should be accessible from your local working machine but also remotely between each machine/s so the hostname should resolve correctly.

```
12.12.12.11  <%= LA_pkg_name %> <%= LA_domain %>
<% if (LA_use_spatial) { %>12.12.12.12  spatial.<%= LA_domain %><% } %>
<% if (LA_collectory_uses_subdomain) { %>12.12.12.13  <%= LA_collectory_hostname %><% } %>
<% if (LA_ala_hub_uses_subdomain) { %>12.12.12.14  <%= LA_ala_hub_hostname %><% } %>
<% if (LA_biocache_service_uses_subdomain) { %>12.12.12.15  <%= LA_biocache_service_hostname %><% } %>
<% if (LA_ala_bie_uses_subdomain) { %>12.12.12.16  <%= LA_ala_bie_hostname %><% } %>
<% if (LA_bie_index_uses_subdomain) { %>12.12.12.17  <%= LA_bie_index_hostname %><% } %>
<% if (LA_lists_uses_subdomain) { %>12.12.12.18  <%= LA_lists_hostname %><% } %>
<% if (LA_images_uses_subdomain) { %>12.12.12.19  <%= LA_images_hostname %><% } %>
<% if (LA_logger_uses_subdomain) { %>12.12.12.20  <%= LA_logger_hostname %><% } %>
<% if (LA_use_CAS) { %>12.12.12.21  <%= LA_cas_hostname %><% } %>
```

You'll need to replace `12.12.12.12` etc with the IP address of some new Ubuntu 16 instance in your provider.

These machines should have an user `ubuntu` with `sudo` permissions.

You should generate and use some ssh key and copy `~/.ssh/MyKey.pub` in thouse machines under `~ubuntu/.ssh/authorized_keys` (via `ssh-copy-id` for avoid issues).

You can test your initial setup with some `ssh` command like:
```
ssh -i ~/.ssh/MyKey.pem ubuntu@12.12.12.12 sudo ls /root
```
that should work.

### Run ansible

With access to this machine/s you can run ansible:

```
#  For this demo to run well, we recommend a machine of 16GB RAM, 4 CPUs.
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -s -i inventories/<%= LA_pkg_name %>.yml ../ansible/ala-demo.yml
<% if (LA_use_spatial) { %>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -s -i inventories/spatial.<%= LA_pkg_name %>.yml ../ansible/spatial.yml
<% } %>
```

### TODO

- [x] Add basic services (`collectory`, `ala-hub`, etc).
- [x] Add domain/context and service subdomains support
- [x] Add `http`/`https` urls support (this does **not** include `ssl` certificates management)
- [X] Add `regions` service
- [X] Add `species-list` service
- [X] Add `spatial` service
- [ ] Add `regions` role to playbook
- [ ] Add `CAS` 5 service
- [x] Disable caches when using the same host for collectory & biocache
