# Additional inventory and playbook with LA pre deploy tasks

Run it with:
```
# Get the depencencies
ansible-galaxy install -r requirements.yml --roles-path roles --force

# Run the playbook
ansible-playbook -i ../<%= LA_pkg_name %>-inventories/<%= LA_pkg_name %>-inventory.ini ../ -i inventory.yml pre-deploy.yml
```
