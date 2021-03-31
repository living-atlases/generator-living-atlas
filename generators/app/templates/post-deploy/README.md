# Additional inventory and playbook with LA post deploy tasks

Run it with:
```
# Get the depencencies
ansible-galaxy install -r requirements.yml --force 

# Run the playbook
ansible-playbook -i ../<%= LA_pkg_name %>-inventories/<%= LA_pkg_name %>-inventory.ini ../ -i inventory.yml post-deploy.yml
```
