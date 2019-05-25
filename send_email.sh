#!/bin/bash
su crm
curl https://cronitor.link/qurpho/run
source crm/bin/activate
cd /home/crm/next_crm
export DJANGO_SETTINGS_MODULE="settings.smishra"
python manage.py send_email
deactivate
curl https://cronitor.link/qurpho/complete
