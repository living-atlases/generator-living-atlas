## Living Atlas of Wakanda: Ansible Inventories

These are some generated inventories to use to set up some machines on EC2 or other cloud provider with LA software.

### Initial Setup

To use this, add the following into your `/etc/hosts` (of your working machine, and new service machine/s) and/or in your living-atlas.wk `DNS`. So these hostname should be accessible from your local working machine but also remotely between each machine/s so the hostname should resolve correctly.

```
12.12.12.11  living-atlas-of-wakanda living-atlas.wk
12.12.12.12  spatial.living-atlas.wk









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
ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -s -i inventories/living-atlas-of-wakanda.yml ../ansible/ala-demo.yml

ansible-playbook --private-key ~/.ssh/MyKey.pem -u ubuntu -s -i inventories/spatial.living-atlas-of-wakanda.yml ../ansible/spatial.yml

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
