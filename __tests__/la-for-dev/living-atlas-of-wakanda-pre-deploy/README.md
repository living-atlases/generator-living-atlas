# Additional inventory and playbook with LA pre deploy tasks

Run it with:
```
# Get the depencencies
ansible-galaxy install -r requirements.yml --roles-path roles --force

# Run the playbook
ansible-playbook -i ../living-atlas-of-wakanda-inventories/living-atlas-of-wakanda-inventory.ini ../ -i inventory.yml pre-deploy.yml
```
