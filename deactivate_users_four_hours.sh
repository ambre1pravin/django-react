#!/bin/bash
su crm
curl https://cronitor.link/qurpho/run
source crm/bin/activate
cd /home/crm/next_crm
export DJANGO_SETTINGS_MODULE="settings.smishra"
python manage.py deactivate_users_four_hours
deactivate
curl https://cronitor.link/qurpho/complete



##!/bin/bash
#su crm
#curl https://cronitor.link/qurpho/run
#workon crm
#cd sites/next_crm/
#export DJANGO_SETTINGS_MODULE="settings.staging"
#python manage.py generate_hourly_invoice
#deactivate
#curl https://cronitor.link/qurpho/complete

#https://cronitor.link/qu