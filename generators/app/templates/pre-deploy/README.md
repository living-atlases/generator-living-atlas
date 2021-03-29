# Addionial inventory and playbook with LA pre deploy tasks

Run it with:
```
# Get the depencencies
ansible-galaxy install -r requirements.yml --force 

# Run the playbook
ansible-playbook -i inventory.yml pre-deploy.yml
```
