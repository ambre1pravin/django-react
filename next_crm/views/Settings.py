from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from next_crm.models import ContactFields,ContactTab,DefaultDataFields
import json
from django.conf import settings

# Create your views here.
@login_required(login_url="/login/")
def setting(request):
    user_id = request.user.id
    company_id = request.user.profile.company_id
    if request.is_ajax():
        json_response = {'success': False, 'msg':''}
        lst = []
        if 'post_data' in request.POST:
            data = request.POST['post_data']
            dic_data =  json.loads(data)
            print("dic_data", dic_data)
            for d in dic_data:
                if d == 'deleted-tabs':
                    delete_tab_list = dic_data['deleted-tabs']
                    if len(delete_tab_list) > 0:
                        for d2 in delete_tab_list:
                            delete_tab(d2)
                else:
                    tab_field_list = []
                    is_default_tab = True if dic_data[d]['is_default'] == 'true' else False
                    tab_data_dic = {'id': dic_data[d]['id'],
                                    'module_id': 1,
                                    'name': dic_data[d]['label'],
                                    'fields': tab_field_list,
                                    'display_weight': dic_data[d]['position'],
                                    'is_default': is_default_tab,
                                    'user_id': user_id,
                                    'company_id':company_id
                                    }
                    print("dd-->", tab_data_dic)
                    if 'tabFields' in dic_data[d]:
                        tab_field_list = save_contact_field_data(dic_data[d]['tabFields'],user_id,company_id)
                        if 'unused_fields' in dic_data[d]:
                            for un in dic_data[d]['unused_fields']:
                                if int(un) > 0 and int(un)!=int(501):
                                    make_default_field_unused(un)
                                    tab_field_list.append(un)
                        if len(tab_field_list) > 0:
                            tab_data_dic['fields'] = tab_field_list
                            save_contact_tab_data(tab_data_dic)
                            json_response['success'] =True
                            json_response['msg'] = 'All settings have been saved.'

        return HttpResponse(json.dumps(json_response), content_type='application/json')

    else:
        data_list =[]
        contact_tabs = ContactTab.objects.all().filter(user_id=request.user.id,company_id=company_id).order_by('display_weight')
        if contact_tabs is not None:
                for o in contact_tabs:
                    default_data_fields = ContactFields.objects.all().filter(id__in=o.fields).order_by('display_weight')
                    if default_data_fields is not None:
                        data_list.append({'name': o.name,
                                          'id':o.id,
                                          'display_weight':o.display_weight,
                                          'is_default': o.is_default,
                                          'fields': default_data_fields
                                          })
                        print(default_data_fields)
        else:
            default_data_fields ={}
        labels = {
                    'button_new_field':settings.LABELS['en']['button_new_field'],
                    'text_unused_fields':settings.LABELS['en']['text_unused_fields'],
                    'text_single_line': settings.LABELS['en']['text_single_line'],
                    'text_checkbox': settings.LABELS['en']['text_checkbox'],
                    'text_radio': settings.LABELS['en']['text_radio'],
                    'text_phone': settings.LABELS['en']['text_phone'],
                    'text_multiline': settings.LABELS['en']['text_multiline'],
                    'text_date': settings.LABELS['en']['text_date'],
                    'text_drop_down': settings.LABELS['en']['text_drop_down'],
                    'text_settings': settings.LABELS['en']['text_settings'],
                    'text_contact': settings.LABELS['en']['text_contact'],
                    'text_add_new_tab': settings.LABELS['en']['text_add_new_tab'],
                    'text_save_all': settings.LABELS['en']['text_save_all'],
                    'text_select_option': settings.LABELS['en']['text_select_option'],
                    'text_set_properties': settings.LABELS['en']['text_set_properties'],
                    'text_rename': settings.LABELS['en']['text_rename'],
                    'text_delete': settings.LABELS['en']['text_delete'],
                    'text_drag_info': settings.LABELS['en']['text_drag_info'],

                }
        return render(request, 'web/settings/contact_setting.html', {'default_data_fields': data_list,'labels':labels})


def contact_setting_save(request):
    if request.is_ajax():
        json_response = {'success': 'true'}
        return HttpResponse(json.dumps(json_response),content_type='application/json')

def save_contact_field_data(fields, user_id, company_id):
    counter = 0
    field_lst = []
    for i in fields:
        counter += 1
        options = []
        if i['type'] == 'drop-down' or i['type'] == 'checkbox' or i['type'] == 'radio':
            options = i['options']

        if 'id' in i and i['id'] != '0' and i['id'] != 'new':
            object_id = i['id']
            try:
                contact_field = ContactFields.objects.get(pk=object_id)
                contact_field.name = i['label'].replace(" ", "-").lower()
                contact_field.type = i['type']
                contact_field.label = i['label']
                contact_field.is_default = True if i['default'] == 'true' else False
                contact_field.is_required = True if i['is_required'] == 'true' else False
                contact_field.display_weight = counter
                contact_field.display_position = i['direction']
                contact_field.is_unused = False

                contact_field.default_values = options
                contact_field.user_id = user_id
                contact_field.company_id = company_id
                contact_field.save()
                #save_default_value(default_data)
                field_lst.append(contact_field.id)
            except ContactFields.DoesNotExist:
                contact_field = ContactFields()
                contact_field.name = i['label'].replace(" ", "-").lower()
                contact_field.type = i['type']
                contact_field.label = i['label']
                contact_field.is_default = True if i['default'] == 'true' else False
                contact_field.is_required = True if i['is_required'] == 'true' else False
                contact_field.display_weight = counter
                contact_field.display_position = i['direction']
                contact_field.is_unused = False
                contact_field.default_values = options
                contact_field.user_id = user_id
                contact_field.company_id = company_id
                contact_field.save()
                field_lst.append(contact_field.id)
        elif i['id'] == 'new':
            contact_field = ContactFields()
            contact_field.name = i['label'].replace(" ", "-").lower()
            contact_field.type = i['type']
            contact_field.label = i['label']
            contact_field.is_default = True if i['default'] == 'true' else False
            contact_field.is_required = True if i['is_required'] == 'true' else False
            contact_field.display_weight = counter
            contact_field.display_position = i['direction']
            contact_field.is_unused =  False
            contact_field.default_values = options
            contact_field.user_id = user_id
            contact_field.company_id = company_id
            contact_field.save()
            #save_default_value(default_data)
            field_lst.append(contact_field.id)
    return field_lst


def save_contact_tab_data(tab_data):
    if tab_data['id'] != 'new':
        try:
            contact_tab = ContactTab.objects.get(pk=tab_data['id'])
            contact_tab.module_id = tab_data['module_id']
            contact_tab.name = tab_data['name']
            contact_tab.fields = tab_data['fields']
            contact_tab.display_weight = tab_data['display_weight']
            contact_tab.is_default = tab_data['is_default']
            contact_tab.user_id = tab_data['user_id']
            contact_tab.company_id = tab_data['company_id']
            contact_tab.save()
        except ContactTab.DoesNotExist:
            contact_tab = ContactTab()
            contact_tab.module_id = tab_data['module_id']
            contact_tab.name = tab_data['name']
            contact_tab.fields = tab_data['fields']
            contact_tab.display_weight = tab_data['display_weight']
            contact_tab.is_default = tab_data['is_default']
            contact_tab.user_id = tab_data['user_id']
            contact_tab.company_id = tab_data['company_id']
            contact_tab.save()
    elif tab_data['id']=='new':
        tab_data['is_default']=False
        contact_tab = ContactTab()
        contact_tab.module_id = tab_data['module_id']
        contact_tab.name = tab_data['name']
        contact_tab.fields = tab_data['fields']
        contact_tab.display_weight = tab_data['display_weight']
        contact_tab.is_default = tab_data['is_default']
        contact_tab.user_id = tab_data['user_id']
        contact_tab.company_id = tab_data['company_id']
        contact_tab.save()
    return True




def delete_tab(tab_id):
    t = ContactTab.objects.get(pk=tab_id)
    if t is not None:
        fields = t.fields
        for i in fields:
            delete_fields(i)
        t.delete()

def delete_fields(field_id):
    d = ContactFields.objects.get(pk=field_id)
    if d is not None:
        d.delete()

def make_default_field_unused(field_id):
    contact_field = ContactFields.objects.get(pk=field_id)
    if contact_field is not None:
        contact_field.is_unused = True
        contact_field.save()

def save_default_value(data):
    print ('test',data)
