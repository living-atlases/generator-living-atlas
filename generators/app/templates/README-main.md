## <%= LA_project_name %>: Ansible Inventories<% if (LA_generate_branding){ %> and Branding <% } %>

### Inventories

Steps to deploy your inventories:
- Follow the [Before-Start-Your-LA-Installation](https://github.com/AtlasOfLivingAustralia/documentation/wiki/Before-Start-Your-LA-Installation) recommendations.
- Install `ansible` following: https://github.com/AtlasOfLivingAustralia/ala-install/#ansible-version
- We auto-generated some passwords in `<%= LA_pkg_name %>-inventories/<%= LA_pkg_name %>-local-passwords.ini` for you, but you can change them prior to deploy your services.
- Follow the `<%= LA_pkg_name %>-inventories/README.md` for instructions of how to deploy using ansible.

and other steps from our [LA-Quick-Start-Guide](https://github.com/AtlasOfLivingAustralia/documentation/wiki/LA-Quick-Start-Guide).

<% if (LA_generate_branding) { %>
### LA Branding

Initially, do a `git submodule update --init --recursive --depth=1` in your branding to download the dependencies, and later follow the `<%= LA_pkg_name %>-branding/README.md` instructions.

<% } %>
