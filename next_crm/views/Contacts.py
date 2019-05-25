from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from next_crm.helper.decorator import  manage_contact, trial_over, company_module_status, user_invited
import json, ast
from django.core.files.storage import FileSystemStorage
from PIL import Image
from next_crm.models import ContactFieldsValue, ContactFields, ContactTab, ContactTags, Contact, Messages, AttachDocument,  Opportunity, Meetings
from django.contrib.auth.models import User
from django.db.models import Q
import csv, sys, os, time
from django.conf import settings
from next_crm.helper.utils import Utils
from next_crm.helper.contact import get_profile_image
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.decorators.csrf import csrf_exempt
from django.utils.translation import ugettext
from datetime import date
from django.core.mail import EmailMultiAlternatives
from next_crm.views.General import message_create_for_create_action





# Create your views here.
@login_required(login_url="/login/")
@manage_contact
@trial_over
@user_invited
@company_module_status(module_name='Crm')
def edit(request,id):
    return render(request, 'web/app.html')

@login_required(login_url="/login/")
@trial_over
@user_invited
@company_module_status(module_name='Crm')
def list(request):
    return render(request, 'web/app.html')

@login_required(login_url="/login/")
@manage_contact
@trial_over
@user_invited
@company_module_status(module_name='Crm')
def add(request):
    return render(request, 'web/app.html')

@login_required(login_url="/login/")
@trial_over
@user_invited
@company_module_status(module_name='Crm')
def view(request, id):
    return render(request, 'web/app.html')


@login_required(login_url="/login/")
def index(request):
    user_company_id = request.user.profile.company_id
    data_list = []
    return_status = {'fields':[],'companies':[],'tags':[]}
    contact_tabs = ContactTab.objects.all().filter(company_id=user_company_id).order_by('display_weight')
    return_status['profile_image'] = get_profile_image(user_company_id)

    if contact_tabs is not None:
        for o in contact_tabs:
            default_data_fields = ContactFields.objects.all().filter(is_unused=False, company_id=user_company_id, id__in=o.fields).order_by('display_weight')
            if default_data_fields is not None:
                field_list = []
                for f in default_data_fields:
                    if f.type == 'checkbox' or f.type =='radio' or f.type =='dropdown':
                        checkbox = []
                        for d in f.default_values:
                            default_dic = {'value':d,'checked':False}
                            checkbox.append(default_dic)
                        default_value = checkbox
                    else:
                        default_value = f.default_values
                    field_dic ={'id':f.id, 'is_required':f.is_required,'name':f.label, 'type':f.type,'display_position':f.display_position,'default_values':default_value}
                    field_list.append(field_dic)

                data_list.append({'name': o.name,
                                  'id': o.id,
                                  'display_weight': o.display_weight,
                                  'is_default': o.is_default,
                                  'fields': field_list
                                  })
        return_status['fields'] = data_list
    else:
        default_data_fields = {}
    return HttpResponse(json.dumps(return_status), content_type="application/json")





@login_required(login_url="/login/")
def company(request):
    return_status = {'success': False, 'result': []}
    user_company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        contacts = Contact.objects.filter(user_company_id=user_company_id)
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            contacts = contacts.filter(name__icontains=keyword)
        if 'contact_type' in request.POST and str(request.POST['contact_type']) == 'customer':
            contacts = contacts.filter(is_customer=True)
        if 'contact_type' in request.POST and str(request.POST['contact_type']) == 'company':
            contacts = contacts.filter(contact_type='C')
        if len(contacts) > 0:
            contacts = contacts.order_by('-id')[:10]
            return_status['success'] = True
            for contact in contacts:
                full_name = None
                if contact.name and contact.email:
                    full_name = contact.name + '( '+contact.email+' )'
                temp_dic = {'id': contact.id, 'full_name':full_name, 'name': contact.name, 'email': contact.email,'phone': contact.phone,'color': contact.profile_image}
                return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@login_required(login_url="/login/")
def save(request):
    user = request.user.id
    user_company_id =request.user.profile.company_id
    return_contact_obj = None
    contact_return = {'success': False, 'contact_id': 0}
    if request.method == "POST" and request.is_ajax():
        if 'contact' in request.POST:
            contact = request.POST['contact']
            dic_data = json.loads(contact)
            if len(dic_data['main']) > 0:
                contact_data = {
                    'name': dic_data['main']['name'],
                    'first_name':dic_data['main']['first_name'],
                    'last_name': dic_data['main']['last_name'],
                    'email': dic_data['main']['email'],
                    'phone': dic_data['main']['phone'],
                    'mobile': dic_data['main']['mobile'],
                    'street': dic_data['main']['street'],
                    'street2': dic_data['main']['street2'],
                    'city': dic_data['main']['city'],
                    'zip': dic_data['main']['zip'],
                    'country': dic_data['main']['country'],
                    'is_vendor': dic_data['main']['is_vendor'],
                    'tags': dic_data['main']['tags'],
                    'is_lead': dic_data['main']['is_lead'],
                    'is_customer': dic_data['main']['is_customer'],
                    'contact_type': dic_data['main']['contact_type'],
                    'profile_image': dic_data['main']['profile_image'],
                    'user_id': user,
                    'company_id': dic_data['main']['contact_company_id'],
                    'user_company_id':user_company_id,
                    'parent_id': dic_data['main']['parent_id'],
                    'fields': dic_data['main']['fields']
                }
                return_contact_obj = save_in_db(request, contact_data)
            if len(dic_data['subcontacts']) > 0 and return_contact_obj:
                if return_contact_obj.contact_type == 'C':
                    company_id = return_contact_obj.id
                else:
                    company_id = 0
                for sub in dic_data['subcontacts']:
                    sub_contact_data = {
                        'name': sub['name'],
                        'first_name':sub['first_name'],
                        'last_name': sub['last_name'],
                        'email': sub['email'],
                        'phone': sub['phone'],
                        'mobile': sub['mobile'],
                        'street': sub['street'],
                        'street2': sub['street2'],
                        'city': sub['city'],
                        'zip': sub['zip'],
                        'country': sub['country'],
                        'is_vendor': False,
                        'is_lead':False,
                        'is_customer': False,
                        'contact_type': 'I',
                        'profile_image': sub['profile_image'],
                        'user_id': user,
                        'company_id': company_id,
                        'user_company_id': user_company_id,
                        'parent_id': return_contact_obj.id,
                        'fields': sub['fields']
                    }
                    save_in_db(request, sub_contact_data)
            if return_contact_obj.id > 0:
                contact_return = {'success': True, 'contact_id': return_contact_obj.id,'uuid':str(return_contact_obj.uuid), 'contact_name':return_contact_obj.name}
            else:
                contact_return = {'success': False,'contact_id':0,'uuid':0}
            return HttpResponse(json.dumps(contact_return), content_type='application/json')
    else:
        status= "Bad"
        return HttpResponse(status)


def save_in_db(request, contact_data):
    print("in save", contact_data)
    if contact_data['contact_type'] == "I" or contact_data['contact_type'] == "C":
        fields = contact_data['fields']
        contact = Contact()
        if contact_data['contact_type'] == "I":
            contact.first_name = contact_data['first_name']
            contact.last_name = contact_data['last_name'] if contact_data['last_name'] else None
            contact.name = contact_data['first_name'] + ' ' +contact_data['last_name']
        elif contact_data['contact_type'] == "C":
            contact.name = contact_data['name']
        contact.email = contact_data['email']
        contact.phone = contact_data['phone']
        contact.mobile = contact_data['mobile']
        contact.street = contact_data['street']
        contact.street2 = contact_data['street2']
        contact.zip = contact_data['zip']
        contact.city = contact_data['city']
        contact.country = contact_data['country']
        contact.is_vendor = contact_data['is_vendor']
        if 'tags' in  contact_data and len(contact_data['tags']) > 0:
            int_tag_list = []
            for tag in contact_data['tags']:
                int_tag_list.append(int(tag['id']))
            if len(int_tag_list) > 0:
                contact.tags = int_tag_list
        if "is_lead" in contact_data:
            contact.is_lead = contact_data['is_lead']
        contact.is_customer = contact_data['is_customer']
        contact.contact_type = contact_data['contact_type']
        contact.profile_image = contact_data['profile_image']
        contact.user_id = contact_data['user_id']
        contact.user_company_id = contact_data['user_company_id']

        if 'company_name' in contact_data and contact_data['company_name']:
            try:
                company = Contact.objects.get(name__exact=str(contact_data['company_name']), user_company_id=contact_data['user_company_id'])
                contact_data['company_id'] = company.id
            except Contact.DoesNotExist as e:
                company = Contact(name=contact_data['company_name'], contact_type='C', user_id=contact_data['user_id'], user_company_id=contact_data['user_company_id'])
                company.save()
                contact_data['company_id'] = company.id

        if contact_data['company_id'] and contact_data['company_id'] > 0:
            company = Contact.objects.get(id=contact_data['company_id'])
            contact.company = company
        if contact_data['parent_id']:
            parent = Contact.objects.get(id=contact_data['parent_id'])
            contact.parent = parent
        contact.save()
        if contact.id > 0:
            if fields is not None:
                for f in fields:
                    value = f['value']
                    contact_field_value = ContactFieldsValue()
                    contact_field_value.contact_field_value = value
                    contact_field_value.contact_id = contact.id
                    contact_field_value.contact_field_id = f['id']
                    contact_field_value.user_id = contact_data['user_id']
                    contact_field_value.company_id = contact_data['user_company_id']
                    contact_field_value.save()

            message = 'Contact ' + "\"" + contact.name + "\"" + ' has been created by ' + request.user.get_full_name().title()
            contact_create_action_dic = {'company_id': request.user.profile.company_id, 'message': message,
                                         'module_name':'contact',
                                         'module_object': contact, 'user': request.user}
            message_create_for_create_action(contact_create_action_dic)
        return contact
    else:
        return False


@login_required(login_url="/login/")
def update(request):
    user = request.user.id
    user_company_id = request.user.profile.company_id
    contact_return = {'success': False}
    update_contact_obj = None
    if request.method == "POST" and request.is_ajax():
        if 'contact' in request.POST:
            contact = request.POST['contact']
            dic_data = json.loads(contact)
            if len(dic_data['main']) > 0:
                contact_data = {
                    'id': int(dic_data['main']['contact_id']),
                    'name': dic_data['main']['name'],
                    'first_name': dic_data['main']['first_name'],
                    'last_name': dic_data['main']['last_name'],
                    'email': dic_data['main']['email'],
                    'phone': dic_data['main']['phone'],
                    'mobile': dic_data['main']['mobile'],
                    'street': dic_data['main']['street'],
                    'street2': dic_data['main']['street2'],
                    'city': dic_data['main']['city'],
                    'zip': dic_data['main']['zip'],
                    'country': dic_data['main']['country'],
                    'is_vendor': dic_data['main']['is_vendor'],
                    'is_customer': dic_data['main']['is_customer'],
                    'is_lead': dic_data['main']['is_lead'],
                    'contact_type': dic_data['main']['contact_type'],
                    'profile_image': dic_data['main']['profile_image'],
                    'tags': dic_data['main']['tags'],
                    'user_id': user,
                    'company_id': dic_data['main']['contact_company_id'],
                    'user_company_id':user_company_id,
                    'parent_id': dic_data['main']['parent_id'],
                    'fields': dic_data['main']['fields']
                }
                update_contact_obj = update_in_db(contact_data)
            if len(dic_data['subcontacts']) > 0 and update_contact_obj:
                if update_contact_obj.contact_type == 'C':
                    company_id = update_contact_obj.id
                else:
                    company_id = 0
                for sub in dic_data['subcontacts']:
                    sub_contact_data = {
                        'name': sub['name'],
                        'email': sub['email'],
                        'phone': sub['phone'],
                        'mobile': sub['mobile'],
                        'street': sub['street'],
                        'street2': sub['street2'],
                        'city': sub['city'],
                        'zip': sub['zip'],
                        'country': sub['country'],
                        'is_vendor': False,
                        'is_customer': False,
                        'is_lead': False,
                        'contact_type': 'I',
                        'profile_image': sub['profile_image'],
                        'user_id': user,
                        'user_company_id': user_company_id,
                        'company_id': company_id,
                        'parent_id': update_contact_obj.id,
                        'fields': sub['fields']
                    }
                    if 'id' in sub and int(sub['id']) > 0:
                        sub_contact_data['id'] = int(sub['id'])
                        update_in_db(sub_contact_data)
                    else:
                        save_in_db(request, sub_contact_data)
            contact_return = {'success': True}
        return HttpResponse(json.dumps(contact_return), content_type='application/json')
    else:
        contact_return = {'success': False}
        return HttpResponse(json.dumps(contact_return), content_type='application/json')


def update_in_db(contact_data):
    contact = Contact.objects.get(id=contact_data['id'])
    if contact:
        fields = contact_data['fields']
        if contact_data['contact_type'] == "I":
            contact.first_name = contact_data['first_name']
            contact.last_name = contact_data['last_name']
            contact.name = contact_data['first_name'] + ' '+ contact_data['last_name']
        elif contact_data['contact_type'] == "C":
            contact.first_name = None
            contact.last_name = None
            contact.name = contact_data['name']
        contact.email = contact_data['email']
        contact.phone = contact_data['phone']
        contact.mobile = contact_data['mobile']
        contact.street = contact_data['street']
        contact.street2 = contact_data['street2']
        contact.zip = contact_data['zip']
        contact.city = contact_data['city']
        contact.country = contact_data['country']
        contact.is_vendor = contact_data['is_vendor']
        if "is_lead" in contact_data:
            contact.is_lead = contact_data['is_lead']
        contact.is_customer = contact_data['is_customer']
        contact.contact_type = contact_data['contact_type']
        contact.profile_image = contact_data['profile_image']
        if contact_data['company_id'] is not None and  contact_data['company_id'] > 0 and contact_data['contact_type'] == 'I':
            company = Contact.objects.get(id=contact_data['company_id'])
            contact.company = company
        else:
            contact.company = None
            update_contact_type(contact_data['id'])

        if 'tags' in  contact_data and len(contact_data['tags']) > 0:
            int_tag_list = []
            for tag in contact_data['tags']:
                int_tag_list.append(int(tag['id']))
            if len(int_tag_list) > 0:
                contact.tags = int_tag_list

        if contact_data['parent_id']:
            parent = Contact.objects.get(id=contact_data['parent_id'])
            contact.parent = parent

        contact.user_id = contact_data['user_id']
        contact.user_company_id = contact_data['user_company_id']
        contact.save()
        if contact.id > 0:
            if fields is not None:
                for f in fields:
                    value = f['value']
                    try:
                        contact_field_value = ContactFieldsValue.objects.get(contact_field_id=f['id'], contact_id=contact_data['id'])
                        contact_field_value.contact_field_value = value
                        contact_field_value.company_id = contact_data['user_company_id']
                        contact_field_value.save()
                    except ContactFieldsValue.DoesNotExist:
                        contact_field_value = ContactFieldsValue(
                                                contact_field_value=value,
                                                contact_field_id=f['id'],
                                                contact_id=contact_data['id'],
                                                user_id=contact_data['user_id'],
                                                company_id=contact_data['user_company_id']
                                              )
                        contact_field_value.save()
    return contact



@login_required(login_url="/login/")
def list_ajax(request):
    start_time = time.time()
    data_list = []
    contact_main_list ={}
    page = 1
    per_page = 54
    return_status = {'success':False, 'msg':''}
    user_company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        page = int(request.POST['page'])
        if page >= 1:
            page = page
        else:
            page = 1

        filters = request.POST['contact']
        names = request.POST['names']
        emails = request.POST['emails']
        tags = request.POST['tags']
        filter_data = json.loads(filters)
        dic_name = json.loads(names)
        dic_emails = json.loads(emails)
        dic_tags = json.loads(tags)
        f1 = Q()
        f2 = Q()
        f3 = Q()
        f4 = Q()
        f5 = Q()
        query = Q()
        tag = Q()
        tag_list =[]
        company_search = False
        individual_search = False
        vendor_search = False
        customer_search = False
        contacts = Contact.objects.select_related('parent', 'company').filter(user_company_id= user_company_id)
        if len(dic_tags) > 0:
            for t in dic_tags:
                tag = tag | Q(contact_field_value__icontains=t)
                contact_field_value = ContactFieldsValue.objects.select_related('contact','contact_field').filter(company_id= user_company_id).filter(tag).filter(contact_field__name = 'tags')
                for c in contact_field_value:
                    tag_list.append(c.contact.id)
            contacts = contacts.filter(id__in=tag_list)

        if len(filter_data) > 0:
            for f in filter_data:
                if f == 'company':
                    f1 = Q(contact_type='C')
                    company_search = True
                if f == 'individual':
                    f2 = Q(contact_type='I')
                    individual_search = True
                if f == 'vendor':
                    f3 = Q(is_vendor=True)
                    vendor_search = True
                if f == 'customer':
                    f4 = Q(is_customer=True)
                    customer_search = True
                if f == 'lead':
                    f5 = Q(is_lead=True)
                    customer_search = True

            if company_search or individual_search:
                contacts = contacts.filter(f1 | f2)
            if vendor_search or customer_search:
                contacts = contacts.filter(f3 | f4 | f5)

        if len(dic_name) > 0:
            for name in dic_name:
                query = query | Q(name__icontains=name)
            contacts = contacts.filter(query)
        contacts = contacts.filter(query).order_by('-id')

        if len(dic_emails) > 0:
            for email in dic_emails:
                query = query | Q(email__icontains=email)
            contacts = contacts.filter(query)
        contacts = contacts.filter(query).order_by('-id')
    else:
        contacts = Contact.objects.select_related('parent','company').all().filter(user_company_id= user_company_id).order_by('-id')

    pagination = {'previous_page': 0, "next_page": 0, 'pagination_label': ''}
    total_records = len(contacts)
    paginator = Paginator(contacts, per_page)
    if total_records > 0:
        try:
            contacts = paginator.page(page)
        except PageNotAnInteger:
            print('NO page')
            contacts = paginator.page(1)
            #pass
        except EmptyPage:
            print("perpage", paginator.per_page)
            contacts = paginator.page(1)
            #pass

    if total_records > 0:
        if contacts and contacts.has_other_pages:
            if contacts.has_previous():
                pagination['previous_page'] = contacts.previous_page_number()
            if contacts.has_next():
                pagination['next_page'] = contacts.next_page_number()
            if contacts.start_index():
                start = contacts.start_index()
            if contacts.end_index():
                end = contacts.end_index()
        page_number_text = str(start) + " - " + str(end) + ' / ' + str(total_records)
        pagination['pagination_label'] = page_number_text

    if total_records > 0 and len(contacts) > 0:
        for contact in contacts:
            total_opportunity = 0
            total_meetings = 0
            total_sales =0
            total_opportunity = Opportunity.objects.filter(customer_id=contact.id).count()
            total_meetings = Meetings.objects.select_related('attendies').filter(attendies__contact_id=contact.id).count()
            if contact.profile_image:
                profile_image = contact.profile_image
            else:
                profile_image =settings.DEFAULT_PROFILE_IMAGE

            print("tags", contact.tags)
            contacts_main = {contact.id:{'id':contact.id, 'uuid':str(contact.uuid), 'contact_type':contact.contact_type,
                                         'name':contact.name, 'email': contact.email, 'phone': contact.phone,
                                         'mobile': contact.mobile, 'street': contact.street,'street2': contact.street2,
                                         'city': contact.city, 'zip': contact.zip, 'country': contact.country,
                                         'company_name':'', 'profile_image':profile_image, 'job_position':'',
                                         'tags': get_contact_tags(contact.tags),
                                         'total_opportunity':total_opportunity, 'total_meetings':total_meetings, 'total_sales':total_sales}}
            if contact.parent:
                contacts_main[contact.id]['name'] = contact.parent.name + ', ' + contact.name
            elif contact.company:
                contacts_main[contact.id]['name'] = contact.company.name + ', ' + contact.name
                contacts_main[contact.id]['company_name'] = contact.company.name
            else:
                contacts_main[contact.id]['name'] = contact.name
            contact_main_list.update(contacts_main)
        contact_field_valuet = ContactFieldsValue.objects.select_related('contact','contact_field').all()
        contact_field_value = contact_field_valuet.filter(user_id=request.user.id).filter(contact_id__in=contacts)
        for ct in contact_field_value:
            if ct.contact.contact_type == 'I' and ct.contact.company == None and ct.contact_field.name == "job-position" and ct.contact_field.is_default and ct.contact_field_value != '':
                contact_main_list[ct.contact.id]['job_position'] = 'Is a ' + ct.contact_field_value
            elif ct.contact.contact_type == 'I' and ct.contact.company is not None and ct.contact_field.name == "job-position" and ct.contact_field.is_default and ct.contact_field_value == '':
                company = Contact.objects.get(id=ct.contact.company_id)
                contact_main_list[ct.contact.id]['job_position'] = 'Working for ' + company.name
            elif ct.contact.contact_type == 'I' and ct.contact.company is not None and ct.contact_field.name == "job-position" and ct.contact_field.is_default and ct.contact_field_value != '':
                company = Contact.objects.get(id=ct.contact.company_id)
                contact_main_list[ct.contact.id]['job_position'] = ct.contact_field_value + ' At '+ company.name


        for k, v in contact_main_list.items():
            if type(v) is dict:
                data_list.append(v)
        column_list = sorted(data_list, key=lambda k: k['id'], reverse=True)
        return_status['column_list'] = column_list
        return_status['pagination'] = pagination
        return_status['success'] =True
    else:
        return_status['msg'] = 'No records found.'
    print("--- %s seconds ---" % (time.time() - start_time))
    return HttpResponse(json.dumps(return_status), content_type="application/json")


def company_create_edit(request):
    user = request.user.id
    user_company_id = request.user.profile.company_id
    contact_return = {'success':False, 'message':''}
    if request.method == "POST" and request.is_ajax():
        if 'contact' in request.POST:
            contact = request.POST['contact']
            dic_data = json.loads(contact)
            for d in dic_data:
                if d == 'main':
                    if dic_data[d]['profile_image']:
                        profile_image = dic_data[d]['profile_image']
                    else:
                        profile_image = settings.DEFAULT_PROFILE_IMAGE
                    contact_data = {
                        'name': dic_data[d]['name'],'email':dic_data[d]['email'], 'phone':dic_data[d]['phone'],
                        'mobile':dic_data[d]['mobile'], 'street':dic_data[d]['street'],
                        'street2':dic_data[d]['street2'], 'city':dic_data[d]['city'],'zip':dic_data[d]['zip'], 'country':dic_data[d]['country'],
                        'contact_type': dic_data[d]['contact_type'] if dic_data[d]['contact_type'] else 'I',
                        'profile_image': profile_image,
                        'is_vendor':False,
                        'is_customer': True if 'is_customer' in dic_data[d] else False,
                        'user_id': user,
                        'user_company_id': user_company_id,
                        'company_id': 0,
                        'parent_id': 0,
                        'fields': dic_data[d]['fields']
                    }
                    contact_data = save_in_db(request, contact_data)
                    if contact_data.id > 0 :
                        contact_return ={'success':True, 'contact_id':contact_data.id, 'contact_name':contact_data.name}
    else:
        contact_return['message'] = 'Some thing is wrong!'
    return HttpResponse(json.dumps(contact_return), content_type='application/json')


def company_create(request):
    user = request.user.id
    user_company_id = request.user.profile.company_id
    response = {'success':False, 'message':'', 'result': []}
    if request.method == "POST" and request.is_ajax():
        profile_image = get_profile_image(user_company_id)
        if 'post_data' in request.POST:
            contact = request.POST['post_data']
            contact_type = request.POST['contact_type']
            dic_data = json.loads(contact)
            if dic_data['name'] is not None:
                contact_data = {
                    'name': dic_data['name'],
                    'contact_type': 'C',
                    'first_name': None,
                    'last_name': None,
                    'email':None,
                    'phone':None,
                    'mobile':None,
                    'street':None,
                    'street2':None,
                    'city':None,
                    'zip':None,
                    'country':None,
                    'profile_image': profile_image,
                    'is_vendor':False,
                    'is_customer':True,
                    'is_lead': False,
                    'user_id': user,
                    'user_company_id':user_company_id,
                    'company_id': 0,
                    'parent_id': 0,
                    'fields': []
                }
                contact_data = save_in_db(request, contact_data)
                if contact_data.id > 0 :
                    response['success'] = True
                    response['message'] = contact_type +' Created!'
                    response['result'] ={'id':contact_data.id, 'name':contact_data.name}
    else:
        response['messge'] = "Some thing is wrong"
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_contact_tags(contact_tags):
    tag_list = []
    if contact_tags and len(contact_tags) > 0:
        tags = ContactTags.objects.filter(id__in=contact_tags)
        if tags:
            for tag in tags:
                tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color, 'class':'hide'})
    return tag_list


@login_required(login_url="/login/")
def view_ajax(request, uuid):
    user = request.user.id
    user_company_id = request.user.profile.company_id
    subcontact = []
    try:
       res = Contact.objects.get(uuid=uuid, user_company_id=user_company_id)
       if res:
            contact_id = res.id
            total_opportunity = Opportunity.objects.filter(customer_id=contact_id).count()
            total_meetings = Meetings.objects.select_related('attendies').filter(attendies__contact_id=contact_id).count()
            total_task = Messages.objects.all().select_related('user').filter(contact_id=contact_id, company_id=user_company_id, action='log_activity', mark_done=False).count()
            if res.company:
                company_name = res.company.name
            else:
                company_name = ''
            contact_list = {'id': res.id, 'uuid':str(res.uuid), 'name': res.name, 'first_name':res.first_name,
                            'last_name': res.last_name,
                            'is_vendor': res.is_vendor, 'is_customer': res.is_customer,
                            'profile_image': res.profile_image, 'contact_type': res.contact_type,
                            'company_name': company_name,
                            'email': res.email, 'phone': res.phone, 'mobile': res.mobile, 'street': res.street,
                            'street2': res.street2, 'city': res.city, 'zip': res.zip, 'country': res.country,
                            'tabs':view_field_value(user_company_id, res.id), 'company_id':res.company_id,
                            'total_opportunity':total_opportunity,'total_meetings':total_meetings,'total_task':total_task,
                            'tags':get_contact_tags(res.tags)
                            }
            for c in res.children.all():
                sub_contact = {'id': c.id, 'uuid':str(res.uuid), 'name': c.name, 'first_name':res.first_name,
                               'last_name': res.last_name, 'is_vendor': c.is_vendor,
                               'is_customer': c.is_customer, 'profile_image': c.profile_image,
                               'email': c.email, 'phone': c.phone, 'mobile': c.mobile, 'street': c.street, 'street2': c.street2,
                               'city': c.city, 'zip': c.zip, 'country': c.country, 'tags':get_contact_tags(c.tags),
                               'contact_type': c.contact_type, 'tabs': view_field_value(user_company_id, c.id)
                               }
                subcontact.append(sub_contact)
            contact_list['sub_contact'] = subcontact

    except Contact.DoesNotExist:
        pass
    return HttpResponse(json.dumps(contact_list), content_type="application/json")


def view_field_value(user_company_id, contact_id):
    contact_id = str(contact_id)
    tab =[]
    contact_tabs = ContactTab.objects.all().filter(company_id=user_company_id).order_by('display_weight')
    #print("contact_tabs",contact_tabs.query)
    if contact_tabs is not None:
        for o in contact_tabs:
            tab_dic = {'tab_id': o.id, 'tab_name': o.name, 'is_default': o.is_default, 'fields': []}
            field_ids = ', '.join([str(x) for x in o.fields])
            contact_fields = ContactFieldsValue.contact_field_value_data(contact_id, field_ids)
            for f in contact_fields:
                contact_field_value_id = ''
                contact_field_value = '-'
                if f.contact_field_value_id is not None and f.contact_field_value is not None:
                    contact_field_value_id = f.contact_field_value_id
                    contact_field_value = f.contact_field_value
                if f.type == 'radio' and f.contact_field_value:
                    radio_value = '-'
                    try:
                        radio = ast.literal_eval(f.contact_field_value)
                        for r in radio:
                            if r['checked']:
                                radio_value = r['value']
                            contact_field_value = radio_value
                    except:
                        contact_field_value = radio_value
                if f.type == 'checkbox' and f.contact_field_value:
                    checkbox = ast.literal_eval(f.contact_field_value)
                    checkbox_list = []
                    try:
                        for c in checkbox:
                            if c['checked']:
                                checkbox_list.append(c['value'])
                            contact_field_value = ', '.join(checkbox_list)
                    except:
                        contact_field_value = ', '.join(checkbox_list)

                if f.type == 'multiselect' and f.contact_field_value:
                    tag_list = []
                    try:
                        tags = ast.literal_eval(f.contact_field_value)
                        for t in tags:
                            tag_list.append({'color':t['color'], 'name':t['name']})
                        contact_field_value = tag_list
                    except:
                        contact_field_value = tag_list
                fields_dic = {'id': f.id, 'name': f.label, 'display_position': f.display_position,
                              'field_value_id': contact_field_value_id, 'value': contact_field_value,
                              'type':f.type
                              }
                tab_dic['fields'].append(fields_dic)
            tab.append(tab_dic)
    return tab


@login_required(login_url="/login/")
def update_ajax(request, uuid):

    user = request.user.id
    user_company_id = request.user.profile.company_id
    subcontact = []
    contact_list =[]
    total_opportunity = 0
    total_meetings = 0
    total_sales = 0

    try:
        res = Contact.objects.get(uuid=uuid)
        if res:
            contact_id = str(res.id)
            total_opportunity = Opportunity.objects.filter(customer_id=contact_id).count()
            total_meetings = Meetings.objects.select_related('attendies').filter(attendies__contact_id=contact_id).count()
            if res.company:
                company_name = res.company.name
            else:
                company_name = ''
            contact_list = {'id': res.id, 'uuid':str(res.uuid), 'name': res.name, 'first_name':res.first_name,
                            'last_name':res.last_name,
                            'is_vendor': res.is_vendor, 'is_customer': res.is_customer,'is_lead': res.is_lead,
                            'profile_image': res.profile_image, 'contact_type': res.contact_type,
                            'email':res.email, 'phone':res.phone, 'mobile':res.mobile, 'street':res.street, 'street2':res.street2,
                            'zip':res.zip, 'city':res.city, 'country':res.country,
                            'tabs': update_field_value(user_company_id, res.id),
                            'company_id': res.company_id,'company_name': company_name,
                            'total_opportunity':total_opportunity,'total_meetings':total_meetings,'total_sales':total_sales,
                            'tags': get_contact_tags(res.tags)
                            }
            for c in res.children.all():
                tabs = update_field_value(user_company_id, c.id)
                for t in tabs:
                    if t['is_default']:
                        sub_contact = {'id': c.id, 'uuid':str(c.uuid), 'name': c.name, 'first_name':res.first_name,
                                       'last_name':res.last_name,
                                       'is_vendor': c.is_vendor,
                                       'is_customer': c.is_customer, 'is_lead':c.is_lead, 'profile_image': c.profile_image,
                                       'email': c.email, 'phone': c.phone, 'mobile': c.mobile,
                                       'street': c.street, 'street2': c.street2,
                                       'zip': c.zip, 'city': c.city, 'country': c.country,
                                       'contact_type': c.contact_type, 'fields':t['fields'],
                                       'tags': get_contact_tags(c.tags),
                                       }
                        subcontact.append(sub_contact)
            contact_list['sub_contact'] = subcontact
    except Contact.DoesNotExist:
        pass
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def update_field_value(user_company_id, contact_id):
    contact_id = str(contact_id)
    tab =[]
    contact_tabs = ContactTab.objects.all().filter(company_id=user_company_id).order_by('display_weight')
    if contact_tabs is not None:
        for o in contact_tabs:
            tab_dic = {'tab_id': o.id, 'tab_name': o.name, 'is_default': o.is_default, 'fields': []}
            field_ids = ', '.join([str(x) for x in o.fields])
            contact_fields = ContactFieldsValue.contact_field_value_data(contact_id, field_ids)
            for f in contact_fields:
                contact_field_value_id = ''
                contact_field_value = ''
                default_value = f.default_values
                if f.contact_field_value_id is not None and f.contact_field_value is not None:
                    contact_field_value_id = f.contact_field_value_id
                    contact_field_value = f.contact_field_value
                if f.type == 'multiselect' and f.contact_field_value:
                    tags = []
                    try:
                        tags = ast.literal_eval(f.contact_field_value)
                        contact_field_value = tags
                    except:
                        contact_field_value = tags
                if f.type == 'dropdown':
                    contact_field_value = f.contact_field_value
                if f.type == 'radio' or f.type == 'checkbox':
                    if f.contact_field_value:
                        checkbox = ast.literal_eval(f.contact_field_value)
                        contact_field_value = checkbox
                    checkbox = []
                    for d in f.default_values:
                        default_dic = {'value': d, 'checked': False}
                        checkbox.append(default_dic)
                        default_value = checkbox

                fields_dic = {'id': f.id, 'name': f.label, 'display_position': f.display_position,
                              'field_value_id': contact_field_value_id, 'value': contact_field_value,
                              'type': f.type, 'default_values': default_value,'display_position':f.display_position
                              }
                tab_dic['fields'].append(fields_dic)
            tab.append(tab_dic)
    return tab

def update_contact_type(contact_id):
    contacts = Contact.objects.all().filter(company_id=contact_id)
    if contacts.count() >0:
        for company in contacts:
            Contact.objects.filter(pk=company.id).update(company=None)
    return True



@csrf_exempt
def simple_upload(request):
    contact_list ={'success':False, 'file':''}
    user_company_id = request.user.profile.company_id
    file_path = 'media/files/'+str(user_company_id)+ '/contact_images'
    if request.method == 'POST' and request.FILES['ufile']:
        myfile = request.FILES['ufile']
        fs = FileSystemStorage(location=file_path)
        filename = fs.save(myfile.name, myfile)
        file_size= resize_file(file_path+'/'+filename, file_path+'/'+filename)
        print("file_size::", file_size)
        uploaded_file_url = '/' + file_path + '/' + filename
        contact_list = {'success': True, 'file': uploaded_file_url}
    return HttpResponse(json.dumps(contact_list), content_type="application/json")




@csrf_exempt
def message_attatchments(request):
    company_id = request.user.profile.company_id
    contact_list ={'success':False,'file':''}
    file_path = 'media/files/'+str(company_id)+ '/messages'
    if request.method == 'POST' and request.FILES['ufile']:
        myfile = request.FILES['ufile']
        fs = FileSystemStorage(location=file_path)
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = '/' + file_path + '/' + filename
        contact_list = {'success': True, 'file_name':filename, 'file_path': uploaded_file_url}
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def get_message(request, contact_id):
    contact_list = {'success': False, 'result':[]}
    user_id = request.user.id
    messages = Messages.objects.all().select_related('user').filter(contact=contact_id).order_by('-created_at')
    message_list = []
    format = '%Y-%m-%d %H:%M %p'
    if messages:
        dic = {}
        for m in messages:
            messages_attach = AttachDocument.objects.all().filter(message=m.id)
            files_list = []
            if messages_attach:
                for f in messages_attach:
                    files =  {'file_name':f.file_name,'file_path':f.file_path}
                    files_list.append(files)
            today = date.today()
            if today == m.created_at.date():
                date_label = 'Today'
            else:
                date_label = str(m.created_at.date())
            created_at = str(m.created_at.date())
            if m.user.get_full_name():
                created_by = m.user.get_full_name()
            else:
                created_by = m.user.get_username()
            if m.message_type == 1:
                message_type = 'Email'
            else:
                message_type = 'Notes'
            ml = {'id': m.id, 'message': m.message, 'date':m.created_at.strftime(format), 'created_by':created_by, "message_type": message_type, 'files': files_list}
            if created_at in dic:
                dic['message'].append(ml)
            else:
                dic ={created_at:created_at, 'date':date_label,'message':[ml]}
            message_list.append(dic)
        output = []
        for  x in message_list:
            if x not in output:
                output.append(x)
        contact_list['result'] =output
    contact_list['success'] = True
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

@csrf_exempt
def contact_import(request):
    user_company_id = request.user.profile.company_id
    if len(request.FILES) != 0:
        return_response ={'success':False, 'file':'', 'fields':[], 'rows':[]}
        file_path = 'media/user_csv/'+str(user_company_id)
        contact_field_value = ContactFields.objects.filter(company_id=user_company_id).filter(is_default=True, is_unused=False).order_by('display_weight')
        if contact_field_value:
            return_response['total_fields'] = len(contact_field_value)
            fields = [{'id':'company_name','name':'Company Name'}]
            for d in contact_field_value:
                fields_dic = {'id':d.id,'name':d.name}
                fields.append(fields_dic)
            return_response['fields'] = fields
        if request.method == 'POST' and request.FILES['ufile']:
            #print("imppppp", request.FILES['ufile'].name.split('.')[-1])
            if request.FILES['ufile'].name.split('.')[-1] == "csv":
                myfile = request.FILES['ufile']
                fs = FileSystemStorage(location=file_path)
                filename = fs.save(myfile.name, myfile)
                uploaded_file_url = settings.BASE_DIR + '/' + file_path + '/' + filename
                print("fize", os.path.getsize(uploaded_file_url))
                file_rows =[]
                temp_list_one =[]
                temp_list_two = []
                temp_list_three = []
                temp_list_four = []
                temp_list_five = []
                temp_list_six =[]
                header_list =[]
                try:
                    with open(uploaded_file_url, "r", encoding="latin-1") as csvfile:
                        return_response['file'] = filename
                        dialect = csv.Sniffer().sniff(csvfile.read(), delimiters=';,')
                        csvfile.seek(0)
                        reader = csv.reader(csvfile, dialect=dialect)
                        try:
                            for line_number, row in enumerate(reader):
                                if line_number < 7:
                                    for i in range(len(row)):
                                        if line_number == 0:
                                            header_list.append(row[i])
                                        if line_number ==1:
                                            temp_list_one.append(row[i])
                                        if line_number ==2:
                                            temp_list_two.append(row[i])
                                        if line_number == 3:
                                            temp_list_three.append(row[i])
                                        if line_number == 4:
                                            temp_list_four.append(row[i])
                                        if line_number == 5:
                                            temp_list_five.append(row[i])
                                        if line_number == 6:
                                            temp_list_six.append(row[i])
                                else:
                                    break
                            for i in range(len(temp_list_one)):
                                file_rows.append(str(temp_list_one[i])+"\n"+str(temp_list_two[i])+"\n"+str(temp_list_three[i])+"\n"+str(temp_list_four[i])+"\n"+str(temp_list_five[i])+"\n"+str(temp_list_six[i]))
                            return_response['csv_cols'] = file_rows
                            return_response['header'] = header_list
                            return_response['success'] = True
                            return_response['msg'] = 'processing'
                        except csv.Error as e:
                            sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
                except IOError as e:
                    print("I/O error({0}): {1}".format(e.errno, e.strerror))
            else:
                return_response = {'success': False, 'file': '', 'msg': settings.LABELS[request.user.profile.language]['msg_did_not_selected_csv_file'] }
    else:
        return_response = {'success': False, 'file': '', 'msg': settings.LABELS[request.user.profile.language]['msg_did_not_selected_file']}

    if len(return_response['header']) > 0 :
        for index, header in enumerate(return_response['header']):
            return_response['rows'].append({'header':header, 'fields':return_response['fields'],'csv_values':file_rows[index]})
    return HttpResponse(json.dumps(return_response), content_type="application/json")

def contact_import_mapping(request):
    return_status = {'success': False, 'file': '','msg':''}
    if 'ROLE_MANAGE_ALL_CONTACT' in request.user.profile.roles:
        user_id = request.user.id
        user_company_id = request.user.profile.company_id
        utils = Utils()
        if request.method == "POST" and request.is_ajax():
            if 'file_name' in request.POST:
                file_name = request.POST['file_name']
                fields = json.loads(request.POST['fields'])
                if fields.count('0') == len(fields):
                    return_status = {'success': False, 'file': '', 'msg':settings.LABELS[request.user.profile.language]['msg_did_not_selected_field']}
                    return HttpResponse(json.dumps(return_status), content_type="application/json")
                file_path = settings.BASE_DIR + '/'+ 'media/user_csv/' + str(user_company_id)
                uploaded_file_url =  file_path + '/' + file_name
                try:
                    with open(uploaded_file_url, "r", encoding="latin-1") as csvfile:
                        dialect = csv.Sniffer().sniff(csvfile.read(), delimiters=';,')
                        csvfile.seek(0)
                        reader = csv.reader(csvfile, dialect=dialect)
                        file_rows = []
                        try:
                            for line_number, row in enumerate(reader):
                                if len(row) > 1:
                                    temp_dic = {}
                                    for idx, col in enumerate(fields):
                                        temp_list = []
                                        if col != '0':
                                            if row[idx]:
                                                if fields[idx] in temp_dic:
                                                    temp_list.append(utils.comma_sep_value(temp_dic[fields[idx]]))
                                                    temp_list.append(row[idx])
                                                    temp_dic[fields[idx]] = temp_list
                                                else:
                                                    temp_dic[fields[idx]] = row[idx]
                                    file_rows.append(temp_dic)
                            if len(file_rows) > 0:
                                format_and_save_contact(request, user_id, user_company_id, file_rows)
                            return_status['csv_cols'] = file_rows
                            return_status['success'] = True
                            return_status['msg'] = settings.LABELS[request.user.profile.language]['msg_import_running']
                            os.remove(uploaded_file_url)
                            os.rmdir(file_path)
                        except csv.Error as e:
                            sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
                except IOError as e:
                    print("I/O error({0}): {1}".format(e.errno, e.strerror))
                    return_status['msg'] = 'file does not exits'
    else:
        return_status['msg'] = 'You have not sufficient permissions'

    return HttpResponse(json.dumps(return_status), content_type="application/json")

def format_and_save_contact(request, user_id, user_company_id, list_data):
    list_data = list_data[1:]
    static_fields = ['first_name','last_name', 'company_name','email','phone','mobile','street','street2','zip','city','country']
    contact_data_list =[]
    utils = Utils()
    for i, d in enumerate(list_data):
        fields_list = []
        contact_data = {'first_name':'', 'last_name':'', 'is_vendor': False, 'is_customer': True, 'contact_type': 'I',
                        'profile_image': '', 'email':'','street':'','street2':'','phone':'','mobile':'','zip':'',
                        'city':'','country':'','user_id':user_id, 'user_company_id': user_company_id, 'company_id': None,
                        'parent_id': 0,'fields': []
                        }
        contact_data['profile_image'] = get_profile_image(user_company_id)

        for key in d:
            key = str(key)
            input_value = utils.comma_sep_value(d[key])
            if key  in static_fields:
                contact_data[key] = input_value
            if str(key) not in static_fields:
                temp_dic = {'id': key, 'value': input_value}
                fields_list.append(temp_dic)
        contact_data['fields'] = fields_list
        contact_data_list.append(contact_data)
        print("contact_data", contact_data)
        save_in_db(request, contact_data)
    return True


def resize_file(input_file, out_file):
    img = Image.open(input_file)  # image extension *.png,*.jpg
    new_width = 90
    new_height = 90
    img = img.resize((new_width, new_height), Image.ANTIALIAS)
    img.save(out_file)  # format may what u want ,*.png,*jpg,*.gif

def contact_export(request):
    export_status = {'success':False}
    user_company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        export_all = request.POST['export_all']
        selected_contact_raw = request.POST['selected_contact']
        selected_contact_list = json.loads(selected_contact_raw)
        contact = request.POST['contact']
        names = request.POST['names']
        emails = request.POST['emails']
        tags = request.POST['tags']
        dic_data = json.loads(contact)
        dic_name = json.loads(names)
        dic_emails = json.loads(emails)
        dic_tags = json.loads(tags)
        f1 = Q()
        f2 = Q()
        f3 = Q()
        f4 = Q()
        query = Q()
        email = Q()
        tag = Q()
        email_list = []
        tag_list = []
        company_search = False
        individual_search = False
        contacts = Contact.objects.select_related('parent', 'company')
        if export_all =='true':
            print("hello")
            # to do
        elif(len(selected_contact_list)) > 0:
            contacts = contacts.filter(id__in=selected_contact_list)
        else:
            if len(dic_emails) > 0:
                for letter in dic_emails:
                    email = email | Q(contact_field_value__icontains=letter)
                    contact_field_value = ContactFieldsValue.objects.select_related('contact', 'contact_field').filter(
                        email).filter(company_id=user_company_id).filter(contact_field__name='email')
                    for c in contact_field_value:
                        email_list.append(c.contact.id)
                contacts = contacts.filter(id__in=email_list)
            if len(dic_tags) > 0:
                for t in dic_tags:
                    tag = tag | Q(contact_field_value__icontains=t)
                    contact_field_value = ContactFieldsValue.objects.select_related('contact', 'contact_field').filter(
                        tag).filter(company_id=user_company_id).filter(contact_field__name='tags')
                    for c in contact_field_value:
                        tag_list.append(c.contact.id)
                contacts = contacts.filter(id__in=tag_list)

            if len(dic_data) > 0:
                for f in dic_data:
                    if f == 'company':
                        f1 = Q(contact_type='C')
                        company_search = True
                    if f == 'vendor':
                        f2 = Q(is_vendor=True)
                    if f == 'customer':
                        f3 = Q(is_customer=True)
                    if f == 'individual':
                        f4 = Q(contact_type='I')
                        individual_search = True
                if company_search and individual_search:
                    contacts = contacts.filter(f2).filter(f3)
                else:
                    contacts = contacts.filter(f1).filter(f2).filter(f3).filter(f4)
            if len(dic_name) > 0:
                for name in dic_name:
                    query = query | Q(name__icontains=name)
                contacts = contacts.filter(query)
        contacts = contacts.filter(query).filter(user_company_id=user_company_id).order_by('-id')
    export_contact_list =[]
    list_to_list = []
    header_names =['Name','Email','Phone','Mobile','Street','Street2','City','Zip','Country','Is Vendor','Is Customer','Contact Type',]
    for contact in contacts:
        temp_list = [contact.name, contact.email, contact.phone, contact.mobile, contact.street, contact.street2, contact.city, contact.zip, contact.country,
                     contact.is_vendor, contact.is_customer, contact.contact_type]
        return_data = view_field_value(user_company_id, contact.id)
        for v in return_data:
            for f in v['fields']:
                if f['id'] not in export_contact_list:
                    export_contact_list.append(f['id'])
                    header_names.append(f['name'])
                if f['type'] == 'multiselect' and f['value']:
                    tags = []
                    try:
                        for t in ast.literal_eval(json.dumps(f['value'])):
                            tags.append(t['name'])
                        contact_field_value = ', '.join(tags)
                    except:
                        contact_field_value = ''
                    temp_list.append(contact_field_value)
                else:
                    temp_list.append(f['value'])
        list_to_list.append(temp_list)
    if list_to_list:
        file_path = 'media/user_csv/' + str(request.user.id)
        file_name = time.strftime("%Y%m%d-%H%M%S") + '.csv'
        if not os.path.exists(file_path):
            os.makedirs(file_path)
        uploaded_file_url =  file_path + '/' + file_name
        with open(uploaded_file_url, 'w', encoding="latin-1", newline='') as fp:
            a = csv.writer(fp, delimiter=';')
            data = [header_names]
            a.writerows(data)
            a.writerows(list_to_list)
        export_status = {'success': True, 'file':uploaded_file_url}
    return HttpResponse(json.dumps(export_status), content_type="application/json")


def customer_list(request):
    user = request.user.id
    contact_return = {'success':False,'contact':[]}
    contacts = Contact.objects.filter(user_id=user,is_customer=True)[:54]
    if contacts:
        for c in contacts:
            temp_dic = {'id':c.id,'name':c.name}
            contact_return['contact'].append(temp_dic)
        contact_return['success'] =True
    return HttpResponse(json.dumps(contact_return), content_type='application/json')

#ADDED Manish in his code
def contact_listemail(request):
    user = request.user.id
    contact_return = {'success':False,'contact':[]}
    # contacts = Contact.objects.filter(user_id=user,is_customer=True)[:54]
    contacts = Contact.objects.filter(user_id=user, email__isnull=False)
    if contacts:
        for c in contacts:
            temp_dic = {'id':c.id,'name':c.name, 'email':c.email}
            contact_return['contact'].append(temp_dic)
        contact_return['success'] =True
    return HttpResponse(json.dumps(contact_return), content_type='application/json')


@login_required(login_url="/")
def delete_contacts(request):
    return_status = {'success': False,'msg':''}
    if request.method == "POST" and request.is_ajax():
        contacts = request.POST['contacts']
        dic_data = json.loads(contacts)
        if len(dic_data) > 0:
            for d in dic_data:
                contact = Contact.objects.get(pk=d)
                try:
                    if contact:
                        Contact.cascade_delete(contact)
                        Messages.delete_messge(d, 1, 'contact')
                        return_status['success'] = True
                except Contact.DoesNotExist:
                    return_status['msg'] = settings.LABELS[request.user.profile.language]['msg_contact_not_exits']
        if return_status['success']:
            return_status['msg'] = settings.LABELS[request.user.profile.language]['msg_contact_delete']

    return HttpResponse(json.dumps(return_status), content_type="application/json")
