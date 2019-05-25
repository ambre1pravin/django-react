from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
import json,ast
from django.core.files.storage import FileSystemStorage
from PIL import Image
from next_crm.models import ContactFieldsValue, ContactFields, ContactTab, ContactTags, Contact, Messages, MessageAttatchments
from django.contrib.auth.models import User
from django.db.models import Q
import csv,sys,os, time
from django.conf import settings
from next_crm.helper.utils import Utils



# Create your views here.
@login_required(login_url="/login/")
def edit(request,id):
    return render(request, 'web/contact/list.html')

@login_required(login_url="/login/")
def list(request):
    return render(request, 'web/contact/list.html')

@login_required(login_url="/login/")
def add(request):
    return render(request, 'web/contact/list.html')

@login_required(login_url="/login/")
def view(request, id):
    return render(request, 'web/contact/list.html')

@login_required(login_url="/login/")
def index(request):

    utils = Utils()
    user_id = request.user.id
    data_list = []
    result_dic = {'fields':[],'companies':[],'tags':[], 'profile_image':'/static/front/images/profile.png'}
    contact_tabs = ContactTab.objects.all().filter(user_id=user_id).order_by('display_weight')
    try:
        c = Contact.objects.all().filter(user_id=user_id).count()
    except Contact.DoesNotExist:
        c = 1
    result_dic['profile_image'] = utils.get_profile_image(c)

    if contact_tabs is not None:
        for o in contact_tabs:
            default_data_fields = ContactFields.objects.all().filter(id__in=o.fields).order_by('display_weight')
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
                    field_dic ={'id':f.id,'name':f.label, 'type':f.type,'display_position':f.display_position,'default_values':default_value}
                    field_list.append(field_dic)

                data_list.append({'name': o.name,
                                  'id': o.id,
                                  'display_weight': o.display_weight,
                                  'is_default': o.is_default,
                                  'fields': field_list
                                  })
        result_dic['fields'] = data_list
    else:
        default_data_fields = {}
    return HttpResponse(json.dumps(result_dic), content_type="application/json")


@login_required(login_url="/login/")
def tags(request):
    user_id = request.user.id
    data_list = []
    contact_tags = ContactTags.objects.all().filter(Q(user_id=user_id) | Q(user_id__isnull=True))
    if contact_tags is not None:
        for o in contact_tags:
            data_list.append({'name': o.name,
                              'id': o.id,
                              'color': o.color
                              })
    return HttpResponse(json.dumps(data_list), content_type="application/json")


@login_required(login_url="/login/")
def company(request):
    data_list = []
    user_id = request.user.id
    company = Contact.objects.all().filter(user_id=user_id).filter(contact_type="C")
    if company is not None:
        for o in company:
            data_list.append({'name': o.name,
                              'id': o.id
                              })
    return HttpResponse(json.dumps(data_list), content_type="application/json")


@login_required(login_url="/login/")
def save(request):
    user = request.user.id
    return_contact_obj = None
    contact_return = {'success': False, 'contact_id': 0}
    if request.method == "POST" and request.is_ajax():
        if 'contact' in request.POST:
            contact = request.POST['contact']
            dic_data = json.loads(contact)
            if len(dic_data['main']) > 0:
                contact_data = {
                    'name': dic_data['main']['name'],
                    'is_vendor': dic_data['main']['is_vendor'],
                    'is_customer': dic_data['main']['is_customer'],
                    'contact_type': dic_data['main']['contact_type'],
                    'profile_image': dic_data['main']['profile_image'],
                    'user_id': user,
                    'company_id': dic_data['main']['contact_company_id'],
                    'parent_id': dic_data['main']['parent_id'],
                    'fields': dic_data['main']['fields']
                }
                return_contact_obj = save_in_db(contact_data)
            if len(dic_data['subcontacts']) > 0 and return_contact_obj:
                for sub in dic_data['subcontacts']:
                    sub_contact_data = {
                        'name': sub['name'],
                        'is_vendor': False,
                        'is_customer': False,
                        'contact_type': 'I',
                        'profile_image': sub['profile_image'],
                        'user_id': user,
                        'company_id': 0,
                        'parent_id': return_contact_obj.id,
                        'fields': sub['fields']
                    }
                    save_in_db(sub_contact_data)
            if return_contact_obj.id > 0:
                contact_return = {'success': True, 'contact_id': return_contact_obj.id}
            else:
                contact_return = {'success': False,'contact_id':0}
            return HttpResponse(json.dumps(contact_return), content_type='application/json')
    else:
        status= "Bad"
        return HttpResponse(status)


def save_in_db(contact_data):
    if contact_data['name']:
        fields = contact_data['fields']
        contact = Contact()
        contact.name = contact_data['name']
        contact.is_vendor = contact_data['is_vendor']
        contact.is_customer = contact_data['is_customer']
        contact.email = 'suysh342@gmail.com'
        contact.contact_type = contact_data['contact_type']
        contact.profile_image = contact_data['profile_image']
        contact.user_id = contact_data['user_id']
        if contact_data['company_id'] > 0:
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
                    contact_field_value.save()
        return contact
    else:
        return False


@login_required(login_url="/login/")
def update(request):
    user = request.user.id
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
                    'is_vendor': dic_data['main']['is_vendor'],
                    'is_customer': dic_data['main']['is_customer'],
                    'contact_type': dic_data['main']['contact_type'],
                    'profile_image': dic_data['main']['profile_image'],
                    'user_id': user,
                    'company_id': dic_data['main']['contact_company_id'],
                    'parent_id': dic_data['main']['parent_id'],
                    'fields': dic_data['main']['fields']
                }
                update_contact_obj = update_in_db(contact_data)
            if len(dic_data['subcontacts']) > 0 and update_contact_obj:
                for sub in dic_data['subcontacts']:
                    sub_contact_data = {
                        'name': sub['name'],
                        'is_vendor': False,
                        'is_customer': False,
                        'contact_type': 'I',
                        'profile_image': sub['profile_image'],
                        'user_id': user,
                        'company_id': 0,
                        'parent_id': update_contact_obj.id,
                        'fields': sub['fields']
                    }
                    if 'id' in sub:
                        sub_contact_data['id'] = int(sub['id'])
                        update_in_db(sub_contact_data)
                    else:
                        save_in_db(sub_contact_data)
            contact_return = {'success': True}
        return HttpResponse(json.dumps(contact_return), content_type='application/json')
    else:
        contact_return = {'success': False}
        return HttpResponse(json.dumps(contact_return), content_type='application/json')


def update_in_db(contact_data):

    contact = Contact.objects.get(id=contact_data['id'])
    fields = contact_data['fields']
    contact.name = contact_data['name']
    contact.is_vendor = contact_data['is_vendor']
    contact.is_customer = contact_data['is_customer']
    contact.contact_type = contact_data['contact_type']
    contact.profile_image = contact_data['profile_image']
    if contact_data['company_id'] is not None and  contact_data['company_id'] > 0 and contact_data['contact_type'] == 'I':
        company = Contact.objects.get(id=contact_data['company_id'])
        contact.company = company
    else:
        contact.company = None
        update_contact_type(contact_data['id'])

    if contact_data['parent_id']:
        parent = Contact.objects.get(id=contact_data['parent_id'])
        contact.parent = parent

    contact.user_id = contact_data['user_id']
    contact.save()
    if contact.id > 0:
        if fields is not None:
            for f in fields:
                value = f['value']
                try:
                    contact_field_value = ContactFieldsValue.objects.get(contact_field_id=f['id'],contact_id=contact_data['id'])
                    contact_field_value.contact_field_value = value
                    contact_field_value.save()
                except ContactFieldsValue.DoesNotExist:
                    contact_field_value = ContactFieldsValue(contact_field_value=value, contact_field_id=f['id'],contact_id=contact_data['id'],user_id=contact_data['user_id'])
                    contact_field_value.save()
    return contact



@login_required(login_url="/login/")
def list_ajax(request):
    data_list = []
    contact_main_list ={}
    if request.method == "POST" and request.is_ajax():
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
        tag_list =[]
        company_search = False
        individual_search = False
        contacts = Contact.objects.select_related('parent', 'company')
        if len(dic_emails) > 0:
            for letter in dic_emails:
                email = email | Q(contact_field_value__icontains=letter)
                contact_field_value = ContactFieldsValue.objects.select_related('contact','contact_field').filter(email).filter(user_id= request.user.id).filter(contact_field__name = 'email')
                for c in contact_field_value:
                    email_list.append(c.contact.id)
            contacts = contacts.filter(id__in=email_list)
        if len(dic_tags) > 0:
            for t in dic_tags:
                tag = tag | Q(contact_field_value__icontains=t)
                contact_field_value = ContactFieldsValue.objects.select_related('contact','contact_field').filter(tag).filter(user_id= request.user.id).filter(contact_field__name = 'tags')
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
        contacts = contacts.filter(query).filter(user_id=request.user.id).order_by('-id')[:54]
    else:
        contacts = Contact.objects.select_related('parent','company').all().filter(user_id=request.user.id).order_by('-id')[:54]
    for contact in contacts:
        if contact.profile_image:
            profile_image = contact.profile_image
        else:
            profile_image ='/static/front/images/profile.png'
        contacts_main = {contact.id:{'id':contact.id,'name':contact.name,'company_name':'', 'email':'','profile_image':profile_image,'phone':'','zip':'','job_position':''}}
        if contact.parent:
            contacts_main[contact.id]['name'] = contact.parent.name + ', ' + contact.name
        elif contact.company:
            contacts_main[contact.id]['name'] = contact.company.name + ', ' + contact.name
            contacts_main[contact.id]['company_name'] = contact.company.name
        else:
            contacts_main[contact.id]['name'] = contact.name
        contact_main_list.update(contacts_main)
    contact_field_valuet = ContactFieldsValue.objects.select_related('contact','contact_field').all()
    contact_field_value = contact_field_valuet.filter(contact_id__in=contacts)
    for ct in contact_field_value:
        if ct.contact_field.name == "phone" and ct.contact_field.is_default and ct.contact_field_value != '':
            contact_main_list[ct.contact.id]['phone'] = ct.contact_field_value
        if ct.contact_field.name == "zip":
            contact_main_list[ct.contact.id]['zip'] = 'zip'
        if ct.contact_field.name == "email" and ct.contact_field.is_default:
            contact_main_list[ct.contact.id]['email'] = ct.contact_field_value
        if ct.contact_field.name == "tags" and ct.contact_field.is_default and ct.contact_field_value:
            tags = ast.literal_eval(ct.contact_field_value)
            contact_main_list[ct.contact.id]['tags'] = tags
        if ct.contact.contact_type == 'I' and ct.contact.company == None and ct.contact_field.name == "job-position" and ct.contact_field.is_default and ct.contact_field_value != '':
            contact_main_list[ct.contact.id]['job_position'] = 'Is a ' + ct.contact_field_value
        elif ct.contact.contact_type == 'I' and ct.contact.company is not None and ct.contact_field.name == "job-position" and ct.contact_field.is_default and ct.contact_field_value == '':
            company = Contact.objects.get(id=ct.contact.company_id)
            contact_main_list[ct.contact.id]['job_position'] = 'working for ' + company.name
        elif ct.contact.contact_type == 'I' and ct.contact.company is not None and ct.contact_field.name == "job-position" and ct.contact_field.is_default and ct.contact_field_value != '':
            company = Contact.objects.get(id=ct.contact.company_id)
            contact_main_list[ct.contact.id]['job_position'] = ct.contact_field_value + ' At '+ company.name

    for k, v in contact_main_list.items():
        if type(v) is dict:
            data_list.append(v)
    column_list = sorted(data_list, key=lambda k: k['id'], reverse=True)
    return HttpResponse(json.dumps(column_list), content_type="application/json")


def company_create_edit(request):
    user = request.user.id
    contact_return = {'success':False}
    if request.method == "POST" and request.is_ajax():
        if 'contact' in request.POST:
            contact = request.POST['contact']
            dic_data = json.loads(contact)
            for d in dic_data:
                if d == 'main':
                    if dic_data[d]['profile_image']:
                        profile_image = dic_data[d]['profile_image']
                    else:
                        profile_image = '/static/front/images/profile.png'
                    contact_data = {
                        'name': dic_data[d]['name'],
                        'contact_type': 'C',
                        'profile_image': profile_image,
                        'is_vendor':False,
                        'is_customer':False,
                        'user_id': user,
                        'company_id': 0,
                        'parent_id': 0,
                        'fields': dic_data[d]['fields']
                    }
                    contact_data = save_in_db(contact_data)
                    if contact_data.id > 0 :
                        contact_return ={'success':True, 'contact_id':contact_data.id, 'contact_name':contact_data.name}
    else:
        status = "Bad"
    return HttpResponse(json.dumps(contact_return), content_type='application/json')

def company_create(request):
    user = request.user.id
    contact_return = {'success':False}
    if request.method == "POST" and request.is_ajax():
        if 'contact' in request.POST:
            contact = request.POST['contact']
            dic_data = json.loads(contact)
            if dic_data['name'] is not None:
                contact_data = {
                    'name': dic_data['name'],
                    'contact_type': 'C',
                    'profile_image': '/static/front/images/profile.png',
                    'is_vendor':False,
                    'is_customer':False,
                    'user_id': user,
                    'company_id': 0,
                    'parent_id': 0,
                    'fields': dic_data['fields']
                }
                contact_data = save_in_db(contact_data)
                if contact_data.id > 0 :
                    contact_return ={'success':True, 'contact_id':contact_data.id, 'contact_name':contact_data.name}
    else:
        status = "Bad"
    return HttpResponse(json.dumps(contact_return), content_type='application/json')


@login_required(login_url="/login/")
def view_ajax(request, contact_id):
    contact_id = str(contact_id)
    user = request.user.id
    subcontact = []
    try:
        res = Contact.objects.get(id=contact_id)
        if res:
            if res.company:
                company_name = res.company.name
            else:
                company_name = ''
            contact_list = {'id':res.id, 'name':res.name, 'is_vendor':res.is_vendor, 'is_customer':res.is_customer,
                            'profile_image': res.profile_image, 'contact_type': res.contact_type,
                            'tabs':view_field_value(user, res.id),
                            'company_id':res.company_id,
                            'company_name':company_name,
                            }
            for c in res.children.all():
                sub_contact = {'id': c.id, 'name': c.name, 'is_vendor': c.is_vendor,
                               'is_customer': c.is_customer, 'profile_image': c.profile_image,
                               'contact_type': c.contact_type, 'tabs': view_field_value(user, c.id)
                               }
                subcontact.append(sub_contact)
            contact_list['sub_contact'] = subcontact

    except Contact.DoesNotExist:
        pass
    return HttpResponse(json.dumps(contact_list), content_type="application/json")


def view_field_value(user_id, contact_id):
    contact_id = str(contact_id)
    tab =[]
    contact_tabs = ContactTab.objects.all().filter(user_id=user_id).order_by('display_weight')
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
                    radio = ast.literal_eval(f.contact_field_value)
                    radio_value = '-'
                    for r in radio:
                        if r['checked']:
                            radio_value = r['value']
                        contact_field_value = radio_value
                if f.type == 'checkbox' and f.contact_field_value:
                    checkbox = ast.literal_eval(f.contact_field_value)
                    checkbox_list = []
                    for c in checkbox:
                        if c['checked']:
                            checkbox_list.append(c['value'])
                        contact_field_value = ', '.join(checkbox_list)

                if f.type == 'multiselect' and f.contact_field_value:
                    tags = ast.literal_eval(f.contact_field_value)
                    tag_list = []
                    for t in tags:
                        tag_list.append({'color':t['color'], 'name':t['name']})
                    contact_field_value = tag_list
                fields_dic = {'id': f.id, 'name': f.label, 'display_position': f.display_position,
                              'field_value_id': contact_field_value_id, 'value': contact_field_value,
                              'type':f.type
                              }
                tab_dic['fields'].append(fields_dic)
            tab.append(tab_dic)
    return tab


@login_required(login_url="/login/")
def update_ajax(request, contact_id):
    contact_id = str(contact_id)
    user = request.user.id
    subcontact = []
    contact_list =[]
    try:
        res = Contact.objects.get(id=contact_id)
        if res:
            if res.company:
                company_name = res.company.name
            else:
                company_name = ''
            contact_list = {'id': res.id, 'name': res.name, 'is_vendor': res.is_vendor, 'is_customer': res.is_customer,
                            'profile_image': res.profile_image, 'contact_type': res.contact_type,
                            'tabs': update_field_value(user, res.id),
                            'company_id': res.company_id,
                            'company_name': company_name,
                            }
            for c in res.children.all():
                tabs = update_field_value(user, c.id)
                for t in tabs:
                    if t['is_default']:
                        sub_contact = {'id': c.id, 'name': c.name, 'is_vendor': c.is_vendor,
                                       'is_customer': c.is_customer, 'profile_image': c.profile_image,
                                       'contact_type': c.contact_type, 'fields':t['fields']
                                       }
                        subcontact.append(sub_contact)
            contact_list['sub_contact'] = subcontact
    except Contact.DoesNotExist:
        pass
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def update_field_value(user_id, contact_id):
    contact_id = str(contact_id)
    tab =[]

    contact_tabs = ContactTab.objects.all().filter(user_id=user_id).order_by('display_weight')
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
                    tags = ast.literal_eval(f.contact_field_value)
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




def simple_upload(request):

    contact_list ={'success':False, 'file':''}
    file_path = 'media/user_profiles/'+str(request.user.id)
    if request.method == 'POST' and request.FILES['ufile']:
        myfile = request.FILES['ufile']
        fs = FileSystemStorage(location='media/user_profiles/'+str(request.user.id))
        filename = fs.save(myfile.name, myfile)
        resize_file(file_path+'/'+filename, file_path+'/'+filename)
        uploaded_file_url = '/' + file_path + '/' + filename
        #uploaded_file_url = fs.url(uploaded_file_url)
        contact_list = {'success': True, 'file': uploaded_file_url}
    return HttpResponse(json.dumps(contact_list), content_type="application/json")


def create_tag(request):
    user_id = request.user.id
    contact_list = {'success': False}
    if request.method == "POST" and request.is_ajax():
        tag_name = request.POST['tag_name']
        c = ContactTags.objects.all().count()
        remainder = c % 10
        if remainder==0:
            remainder = 1
        try:
            tags = ContactTags.objects.get(name=tag_name,user=user_id)
        except ContactTags.DoesNotExist:
            tags = ContactTags(name=tag_name, color=remainder, user_id=user_id)
            tags.save()
        tag = {'id':tags.id,'color':tags.color,'name':tags.name}
        contact_list = {'success': True,'tag':tag}

    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def message_create(request):
    return_status = {'success': False}
    user_id = request.user.id
    if request.method == "POST" and request.is_ajax():
        if 'email_data' in request.POST:
            email_data = request.POST['email_data']
            dic_data = json.loads(email_data)
            try:
                contact = Contact.objects.get(pk=dic_data['contact_id'])
                user = User.objects.get(pk=user_id);
                message = Messages()
                message.message = dic_data['message']
                message.contact = contact
                message.user = user
                message.message_type = dic_data['message_type']
                message.save()
                if dic_data['attachements']:
                    for attachement in dic_data['attachements']:
                        print(attachement['file_path'])
                        message_attatchments = MessageAttatchments()
                        message_attatchments.file_name = attachement['file_name']
                        message_attatchments.file_path = attachement['file_path']
                        message_attatchments.message = message
                        message_attatchments.save()
                return_status = {'success': True}
            except Contact.DoesNotExist:
                print('Contact DoesNotExist')
    return HttpResponse(json.dumps(return_status), content_type="application/json")

def send_email(request):
    from django.core.mail import send_mail
    from django.http import HttpResponse
    return_status = {'success': False}
    res = send_mail("hello suyash from django", "comment tu vas?", "suyash343@gmail.com", ['suyash343@gmail.com'],fail_silently=False)
    return HttpResponse('%s' % res)

def message_attatchments(request):
    contact_list ={'success':False,'file':''}
    file_path = 'media/user_profiles/'+str(request.user.id)
    if request.method == 'POST' and request.FILES['ufile']:
        myfile = request.FILES['ufile']
        fs = FileSystemStorage(location='media/user_profiles/'+str(request.user.id))
        filename = fs.save(myfile.name, myfile)
        uploaded_file_url = '/' + file_path + '/' + filename
        contact_list = {'success': True, 'file_name':filename, 'file_path': uploaded_file_url}
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def get_message(request, contact_id):
    from datetime import datetime,date
    import time
    contact_list = {'success': False, 'result':[]}
    user_id = request.user.id
    messages = Messages.objects.all().select_related('user').filter(contact=contact_id).order_by('-created_at')
    message_list = []
    format = '%Y-%m-%d %H:%M %p'
    if messages:
        dic = {}
        for m in messages:
            messages_attach = MessageAttatchments.objects.all().filter(message=m.id)
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
    return HttpResponse(json.dumps(contact_list), content_type="application/json")


def contact_import(request):
    if len(request.FILES) != 0:
        contact_list ={'success':False,'file':''}
        file_path = 'media/user_csv/'+str(request.user.id)
        contact_field_value = ContactFields.objects.filter(user_id=request.user.id).filter(is_default=True).order_by('display_weight')
        if contact_field_value:
            contact_list['total_fields'] = len(contact_field_value)
            fields = []
            for d in contact_field_value:
                fields_dic = {'id':d.id,'name':d.name}
                fields.append(fields_dic)
            contact_list['fields'] = fields
        if request.method == 'POST' and request.FILES['ufile']:
            myfile = request.FILES['ufile']
            fs = FileSystemStorage(location='media/user_csv/'+str(request.user.id))
            filename = fs.save(myfile.name, myfile)
            uploaded_file_url = settings.BASE_DIR + '/' + file_path + '/' + filename
            file_rows =[]
            temp_list_one =[]
            temp_list_two = []
            temp_list_three = []
            temp_list_four = []
            temp_list_five = []
            header_list =[]

            try:
                with open(uploaded_file_url, "r", encoding="latin-1") as csvfile:
                    contact_list['file'] = filename
                    dialect = csv.Sniffer().sniff(csvfile.read(), delimiters=';,')
                    csvfile.seek(0)
                    reader = csv.reader(csvfile, dialect=dialect)
                    try:
                        for line_number, row in enumerate(reader):
                            if line_number < 6:
                                temp_dic = {}
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
                            else:
                                break
                        for i in range(len(temp_list_one)):
                            file_rows.append(str(temp_list_one[i])+"\n"+str(temp_list_two[i])+"\n"+str(temp_list_three[i])+"\n"+str(temp_list_four[i])+"\n"+str(temp_list_five[i]))
                        contact_list['csv_cols'] = file_rows
                        contact_list['header'] = header_list
                        contact_list['success'] = True
                    except csv.Error as e:
                        sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
            except IOError as e:
                print("I/O error({0}): {1}".format(e.errno, e.strerror))
    else:
        contact_list = {'success': False, 'file': '', 'msg':'You did not selected any file.'}
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def contact_import_mapping(request):
    contact_list = {'success': False, 'file': ''}
    user_id = request.user.id
    utils = Utils()
    if request.method == "POST" and request.is_ajax():
        if 'file_name' in request.POST:
            file_name = request.POST['file_name']
            fields = json.loads(request.POST['fields'])
            if fields.count('0') == len(fields):
                contact_list = {'success': False, 'file': '', 'msg':'You did not selected any fields.'}
                return HttpResponse(json.dumps(contact_list), content_type="application/json")
            file_path = 'media/user_csv/' + str(request.user.id)
            uploaded_file_url = settings.BASE_DIR + '/' + file_path + '/' + file_name
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
                            format_and_save_contact(user_id, file_rows)
                        contact_list['csv_cols'] = file_rows
                        contact_list['success'] = True
                        os.remove(uploaded_file_url)
                    except csv.Error as e:
                        sys.exit('file %s, line %d: %s' % (uploaded_file_url, reader.line_num, e))
            except IOError as e:
                print("I/O error({0}): {1}".format(e.errno, e.strerror))
    return HttpResponse(json.dumps(contact_list), content_type="application/json")

def format_and_save_contact(user_id, list_data):
    contact_data_list =[]
    utils = Utils()
    for i, d in enumerate(list_data):
        fields_list = []
        contact_data = {'name': '', 'is_vendor': False, 'is_customer': True, 'contact_type': 'I',
                        'profile_image': '', 'user_id': user_id, 'company_id': 0,
                        'parent_id': 0,
                        'fields': []
                        }
        contact_data['profile_image'] = utils.get_profile_image(i)
        for key in d:
            value = utils.comma_sep_value(d[key])
            if key == 'name':
                contact_data['name'] = value
            else:
                temp_dic = {'id':key, 'value':value }
                fields_list.append(temp_dic)
        contact_data['fields'] = fields_list
        contact_data_list.append(contact_data)
        save_in_db(contact_data)
    return True


def resize_file(input_file, out_file):
    img = Image.open(input_file)  # image extension *.png,*.jpg
    new_width = 90
    new_height = 90
    img = img.resize((new_width, new_height), Image.ANTIALIAS)
    img.save(out_file)  # format may what u want ,*.png,*jpg,*.gif
