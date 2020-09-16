## <%= LA_project_name %>: Ansible Inventories

These are some generated inventories to use to set up some machines on EC2 or other cloud provider with LA software.

### Urls of your LA node

- Main landing page: <%= LA_urls_prefix %><%= LA_domain %>
- Collections: <%= LA_urls_prefix %><%= LA_collectory_url %><%= LA_collectory_path %>
- Collections administration: <%= LA_urls_prefix %><%= LA_collectory_url %><%= LA_collectory_path %>/admin
- Collections alaAdmin: <%= LA_urls_prefix %><%= LA_collectory_url %><%= LA_collectory_path %>/alaAdmin
- Biocache (occurrences): <%= LA_urls_prefix %><%= LA_ala_hub_url %><%= LA_ala_hub_path %>
- Biocache administration: <%= LA_urls_prefix %><%= LA_ala_hub_url %><%= LA_ala_hub_path %>/admin
- Biocache webservice: <%= LA_urls_prefix %><%= LA_biocache_service_url %><%= LA_biocache_service_path %>
<% if (LA_use_species) { %>
- Species: <%= LA_urls_prefix %><%= LA_ala_bie_url %><%= LA_ala_bie_path %>
- Species webservice: <%= LA_urls_prefix %><%= LA_bie_index_url %><%= LA_bie_index_path %>
- Species webservice administration: <%= LA_urls_prefix %><%= LA_bie_index_url %><%= LA_bie_index_path %>/admin
<%_ } _%>
- SOLR non-public web interface: http://<%= LA_solr_url %>:8983 (You should use ssh port redirection to access this)
<% if (LA_use_CAS) { %>- CAS Auth system: https://<%= LA_cas_url %>/cas
- User details: https://<%= LA_cas_url %>/userdetails
- User details administration: https://<%= LA_cas_url %>/userdetails/admin
- User details alaAdmin https://<%= LA_cas_url %>/userdetails/alaAdmin
- Apikey management: https://<%= LA_cas_url %>/apikey/
- CAS management administration: https://<%= LA_cas_url %>/cas-management/<% } %>
- Logger: <%= LA_urls_prefix %><%= LA_logger_url %><%= LA_logger_path %>/
- Logger administration: <%= LA_urls_prefix %><%= LA_logger_url %><%= LA_logger_path %>/admin
<%_ if (LA_use_images) { _%>
- Images service: <%= LA_urls_prefix %><%= LA_images_url %><%= LA_images_path %>/
- Images service administration: <%= LA_urls_prefix %><%= LA_images_url %><%= LA_images_path %>/admin
<%_ } _%>
<% if (LA_use_species_lists) { %>- Species list: <%= LA_urls_prefix %><%= LA_lists_url %><%= LA_lists_path %>
- Species list administration: <%= LA_urls_prefix %><%= LA_lists_url %><%= LA_lists_path %>/admin<% } %>
<% if (LA_use_regions) { %>- Regions: <%= LA_urls_prefix %><%= LA_regions_url %>
- Regions administration: <%= LA_urls_prefix %><%= LA_regions_url %>/alaAdmin<% } %>
<% if (LA_use_spatial) { %>- Spatial: <%= LA_urls_prefix %><%= LA_spatial_url %>
- Spatial Webservice: <%= LA_urls_prefix %><%= LA_spatial_url %>/ws
- Spatial Geoserver: <%= LA_urls_prefix %><%= LA_spatial_url %>/geoserver/<% } %>
<%_ if (LA_use_webapi) { _%>
- Web API: <%= LA_urls_prefix %><%= LA_webapi_url %><%= LA_webapi_path %>/
- Web API administration: <%= LA_urls_prefix %><%= LA_webapi_url %><%= LA_webapi_path %>/admin
<%_ } _%>
<%_ if (LA_use_alerts) { _%>
- Alerts service: <%= LA_urls_prefix %><%= LA_alerts_url %><%= LA_alerts_path %>/
- Alerts service administration: <%= LA_urls_prefix %><%= LA_alerts_url %><%= LA_alerts_path %>/admin
<%_ } _%>
<%_ if (LA_use_doi) { _%>
- DOI service: <%= LA_urls_prefix %><%= LA_doi_url %><%= LA_doi_path %>/
- DOI service administration: <%= LA_urls_prefix %><%= LA_doi_url %><%= LA_doi_path %>/admin
<%_ } _%>
<%_ if (LA_use_dashboard) { _%>
- Dashboard: <%= LA_urls_prefix %><%= LA_dashboard_url %><%= LA_dashboard_path %>/
- Dashboard administration: <%= LA_urls_prefix %><%= LA_dashboard_url %><%= LA_dashboard_path %>/alaAdmin
<%_ } _%>

### Initial Setup

To use this, add the following into your `/etc/hosts` (of your working machine, and new service machine/s) and/or in your <%= LA_domain %> `DNS`. So these hostname should be accessible from your local working machine but also remotely between each machine/s so the hostname should resolve correctly.

```<% let i=12; LA_machines.forEach(machine => { %>
12.12.12.<%= i %>  <%= machine %><%; i++ }) %>
```

You'll need to replace `12.12.12.1` etc with the IP address of some new Ubuntu instances in your provider.

These machines should have an user `ubuntu` with `sudo` permissions.

You should generate and use some ssh key and copy `~/.ssh/MyKey.pub` in those machines under `~ubuntu/.ssh/authorized_keys` (via `ssh-copy-id` for avoid issues). See the `dot-ssh-config` as sample.

You can test your initial setup with some `ssh` command like:
```
ssh -i ~/.ssh/MyKey.pem ubuntu@12.12.12.1 sudo ls /root
```
that should work.

### Run ansible

With access to this machine/s you can run ansible with commands like:

```
export AI=<location-of-your-cloned-ala-install-repo>

#  For this demo to run well, we recommend a machine of 16GB RAM, 4 CPUs.
<% let baseInv=`-i ${LA_pkg_name}-inventory.yml -i ${LA_pkg_name}-local-extras.yml`; let passInv = `-i ${LA_pkg_name}-local-passwords.yml`; %>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu <%= baseInv %> <%= passInv %> $AI/ansible/ala-demo.yml --limit <%= LA_domain %>
<% for(var j=0; j < LA_services_machines.length; j++) {
let isSpatialInv = LA_services_machines[j].map.name === 'spatial';
let isCasInv = LA_services_machines[j].map.name === 'cas';
let extraInv = `-i ${LA_pkg_name}-local-passwords.yml`;
if (isSpatialInv) {
    extraInv = `-i ${LA_pkg_name}-spatial-inventory.yml -i ${LA_pkg_name}-spatial-local-extras.yml -i ${LA_pkg_name}-local-passwords.yml`;
}
if (isCasInv) {
    extraInv = `-i ${LA_pkg_name}-cas-inventory.yml -i ${LA_pkg_name}-cas-local-extras.yml -i ${LA_pkg_name}-local-passwords.yml --extra-vars "ala_install_repo=$AI"`;
}
%>
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu <%= baseInv %> <%- extraInv %> $AI/ansible/<%= LA_services_machines[j].map.playbook %>.yml --limit <%= LA_services_machines[j].machine %><% } %>
```
#### ansible-playbook wrapper

Also there is the utility `ansiblew` an `ansible-playbook` wrapper that can help you to exec these commands and can be easily modificable by you to your needs. It depends on `python-docopt` package. Help output:

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

You can rerun the generator with the option `yo living-atlas --replay` to use all the previous responses and regenerate the inventories with some modification (if for instance you want to add a new service, or using a new version of this generator with improvements).

You can also use `yo living-atlas --replay-dont-ask` if you only want to repeat the inventories generation (for instance, with a new version of the living-atlas generator to get some update, or when you edit carefully the `../.yo-rc.json` answers file to, for instance, enable ssl or some service, and only want to regenerate the inventories with the changes).

Also, you can use `--debug` to see some verbose debug info.

We recommend to override and set variables adding then to `<%= LA_pkg_name %>-local-extras.yml` and `<%= LA_pkg_name %>-spatial-local-extras.yml` without modify the generated `<%= LA_pkg_name %>-inventory.yml` and `<%= LA_pkg_name %>-spatial-inventory.yml`, so you can rerun the generator in the future without lost local changes. The `*-local-extras.sample` files will be updated with future versions of this generator, so you can compare from time to time these samples with your `*-local-extras.yml` files to add new vars, etc.

