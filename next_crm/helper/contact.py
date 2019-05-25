from next_crm.models import Contact
from django.core.validators import validate_email
from django.core.exceptions import ValidationError


def get_profile_image(user_company_id):
    try:
        number = Contact.objects.all().filter(user_company_id=user_company_id).count()
    except Contact.DoesNotExist:
        number = 1
    remainder = number % 15
    if remainder == 0:
        remainder = 1
    return '/static/front/images/image_' + str(remainder) + '.png'

def contact_change_status(contact_id, contact_type):
    if contact_id > 0:
        contact = Contact.objects.get(pk=contact_id)
        is_vendor = contact.is_vendor
        is_customer= contact.is_customer
        is_lead = contact.is_lead
        if contact_type == 'lead':
            is_lead = True
        if contact_type == 'customer':
            is_customer= True
        contact.is_vendor = is_vendor
        contact.is_customer = is_customer
        contact.is_lead = is_lead
        contact.save()
    return True

def get_customer_by_id_list(id_list):
    email_list = []
    contacts = Contact.objects.filter(id__in=(id_list))
    for ct in contacts:
        if ct.email:
            email_list.append({'email_list': ct.email, 'name': ct.name})
    return email_list


def get_valid_email(email_list):
    valid = False
    chek_verify = []
    email_list_verify = []
    for x_email_list in email_list:
        try:
            valid = True
            valid_email = validate_email(x_email_list['email_list'])
        except:
            email_list_verify.append({'name': x_email_list['name']})
            valid = False
        # return valid
        if valid == False:
            chek_verify = email_list_verify
    return chek_verify

def test_validate_email(email):
    try:
        validate_email(email)
    except ValidationError:
        return False
    return True