## Living Atlas of Wakanda: Ansible Inventories and Branding 

### Inventories

Steps to deploy your inventories:
- Install `ansible` following: https://github.com/AtlasOfLivingAustralia/ala-install/#ansible-version
- Follow the [Before-Start-Your-LA-Installation](https://github.com/AtlasOfLivingAustralia/documentation/wiki/Before-Start-Your-LA-Installation) recommendations. There are some generated inventories in `living-atlas-of-wakanda-pre-deploy/` to help with these tasks.
- We auto-generated some passwords in `living-atlas-of-wakanda-inventories/living-atlas-of-wakanda-local-passwords.ini` for you, but you can change them prior to deploy your services.
- Follow the `living-atlas-of-wakanda-pre-deploy/README.md`, the `living-atlas-of-wakanda-post-deploy/README.md` and `living-atlas-of-wakanda-inventories/README.md` for instructions of how to deploy using ansible.

other steps from our [LA-Quick-Start-Guide](https://github.com/AtlasOfLivingAustralia/documentation/wiki/LA-Quick-Start-Guide) can be done using the `living-atlas-of-wakanda-post-deploy/` inventories.


### LA Branding

Initially, do a `git submodule update --init --recursive --depth=1` in your branding to download the dependencies, and later follow the `living-atlas-of-wakanda-branding/README.md` instructions.


