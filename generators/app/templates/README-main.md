## <%= LA_project_name %>: Ansible Inventories<% if (LA_generate_branding){ %> and Branding <% } %>

### Inventories

Steps to deploy your inventories:
- Install `ansible` following: https://github.com/AtlasOfLivingAustralia/ala-install/#ansible-version
- Follow the [Before-Start-Your-LA-Installation](https://github.com/AtlasOfLivingAustralia/documentation/wiki/Before-Start-Your-LA-Installation) recommendations. There are some generated inventories in `<%= LA_pkg_name %>-pre-deploy/` to help with these tasks.
- We auto-generated some passwords in `<%= LA_pkg_name %>-inventories/<%= LA_pkg_name %>-local-passwords.ini` for you, but you can change them prior to deploy your services.
- Follow the `<%= LA_pkg_name %>-pre-deploy/README.md`, the `<%= LA_pkg_name %>-post-deploy/README.md` and `<%= LA_pkg_name %>-inventories/README.md` for instructions of how to deploy using ansible.

other steps from our [LA-Quick-Start-Guide](https://github.com/AtlasOfLivingAustralia/documentation/wiki/LA-Quick-Start-Guide) can be done using the `<%= LA_pkg_name %>-post-deploy/` inventories.

<% if (LA_generate_branding) { %>
### LA Branding

Initially, do a `git submodule update --init --recursive --depth=1` in your branding to download the dependencies, and later follow the `<%= LA_pkg_name %>-branding/README.md` instructions.

<% } %>
