from django.http import HttpResponse
from django.shortcuts import render
import json, os,  re
from django.contrib.auth.decorators import login_required
from next_crm.models import Contact, Messages,  AttachDocument, MessageContactMap, Opportunity, Meetings, Countries,Company, CompanyModulesMapping, Stripe, StripeInvoice
from django.contrib.auth.models import User
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.db.models import Q
from datetime import datetime, date, timedelta
from django.utils.timezone import now
from next_crm.helper.utils import Utils
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt






@login_required(login_url="/login/")
def next_activity(request):
    return render(request, 'web/app.html')

def get_date(next_activity_date):
    if next_activity_date:
        todaymy = str(date.today())
        expected_closing = str(next_activity_date)
        d1 = datetime.strptime(todaymy, "%Y-%m-%d")
        d2 = datetime.strptime(expected_closing, "%Y-%m-%d")
        if (d2 - d1).days == 0:
            date_create = 'Today'
        elif (d2 - d1).days == 1:
            date_create = 'Tomorrow'
        elif (d2 - d1).days == -1:
            date_create = 'Yesterday'
        elif (d2 - d1).days:
            date_create = (d2 - d1).days
            if (date_create < 2):
                date_use = (d2 - d1).days
                newstr = -date_use
                date_create = newstr, ' days overdue'
            elif (date_create > 2):
                date_create = 'Due in ', (d2 - d1).days, ' days'
    return date_create

def get_message(request):
    return_list = {'success': False, 'is_admin':False, 'result':[],'activities':[],'today_messages':[],'yesterday_messages':[], 'messages':[], 'activity_done':0, 'activity_not_done':0}

    if request.user.is_superuser or request.user.profile.is_admin:
        return_list['is_admin'] = True

    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        master_id = request.POST['master_id']
        module_id = int(request.POST['module_id'])
        module_name = str(request.POST['module_name'])
        filter = request.POST['filter']
        f1 = Q()
        messages = Messages.objects.all().select_related('user').filter(module_name=module_name, company_id=company_id)
        if module_id == 1:
            messages = messages.filter(contact_id=master_id, module_name=module_name)
        elif module_id == 2:
            messages = messages.filter(opportunity_id=master_id, module_name=module_name)
        elif module_id == 3:
            messages = messages.filter(sales_order_id=master_id, module_name=module_name)


        if filter:
            if filter == 'Incomplited':
                f1 = Q(mark_done=False)
            if filter == 'Complited':
                f1 = Q(mark_done=True)
            if filter == 'all-Activities':
                f1 = Q(action='log_activity')
            if filter == 'all-notes':
                f1 = Q(message_type='notes') | Q(action='log_activity')

            messages = messages.filter(f1)
        messages = messages.order_by('-created_at')
        if messages:

            for m in messages:
                over_due = False
                deleteable = False
                files_list = []
                email_to =[]
                if (request.user == m.user or request.user.profile.is_admin or request.user.is_supperuser) and (m.message_type != 'create_action'):
                    deleteable = True
                if m.mark_done:
                    if m.action == 'log_activity':
                        return_list['activity_done'] = return_list['activity_done'] + 1
                    mark_done_div_class = 'media done'
                else:
                    mark_done_div_class = 'media undone'
                    if m.action == 'log_activity':
                        return_list['activity_not_done'] = return_list['activity_not_done'] + 1


                if m.message_type == 'send_email':
                    messages_to = MessageContactMap.objects.all().filter(message_id=m.id)
                    if messages_to:
                        for msg_to in messages_to:
                            email_to.append(msg_to.contact.name)

                if m.message_type == 'notes' or m.message_type == 'email_sent':
                    messages_attach = AttachDocument.objects.all().filter(message=m.id, module_name=module_name)
                    if messages_attach:
                        for f in messages_attach:
                            files =  {'file_name':f.file_name,'file_path':f.file_path}
                            files_list.append(files)
                today = date.today()
                if m.action == 'log_activity' and m.action != None:
                     date_label = 'Planned'
                elif m.action == None and today == m.created_at.date():
                     date_label = 'Today'
                elif m.action == None and today != m.created_at.date():
                     date_label = str(m.created_at.date())

                created_at = str(m.created_at.date())
                if m.user.get_full_name():
                    created_by = m.user.get_full_name()
                else:
                    created_by = m.user.get_username()

                message_type = m.message_type
                class_name = 'fa fa-tasks'
                todaymy = str(date.today())
                d1 = datetime.strptime(todaymy, "%Y-%m-%d")
                if m.message_type != 'notes' and m.next_activity_date:
                    expected_closing = str(m.next_activity_date)
                    d2 = datetime.strptime(expected_closing, "%Y-%m-%d")
                else:
                    d2 = datetime.strptime(str(m.created_at.date()),  "%Y-%m-%d")

                if (d2 - d1).days == 0:
                    date_create= 'Today'
                elif (d2 - d1).days == 1:
                    date_create= 'Tomorrow'
                elif (d2 - d1).days == -1:
                    date_create= 'Yesterday'
                elif (d2 - d1).days :
                    date_create= (d2 - d1).days
                    if (date_create < 2):
                      date_use=(d2 - d1).days
                      newstr = -date_use
                      date_create= newstr, ' days overdue'
                      over_due = True
                    elif (date_create > 2):
                      date_create= 'Due in ' ,(d2-d1).days, ' days'
                ml = {'id': m.id, 'mark_done_div_class':mark_done_div_class, 'deleteable':deleteable, 'over_due':over_due, 'message': m.message, 'date':date_create,'class_name':class_name, 'created_at':m.get_date(), 'created_by':created_by, 'profile_image': m.user.profile.profile_image, "message_type": message_type.title(), 'files': files_list, 'email_to':', '.join(email_to), 'action' : m.action,'mark_done' :m.mark_done}

                if m.action == 'log_activity' and m.action != None:
                    return_list['activities'].append(ml)
                elif date_create == 'Today' and m.action != 'log_activity':
                    return_list['today_messages'].append(ml)
                elif date_create == 'Yesterday' and m.action != 'log_activity':
                    return_list['yesterday_messages'].append(ml)
                else:
                    return_list['messages'].append(ml)
        return_list['success'] = True
    return HttpResponse(json.dumps(return_list), content_type="application/json")

def message_create(request):
    return_status = {'success': False}
    user_id = request.user.id
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        if 'email_data' in request.POST:
            email_data = request.POST['email_data']
            dic_data = json.loads(email_data)
            module_id = int(dic_data['module_id'])
            if 'master_id' in dic_data and dic_data['master_id'] and module_id > 0:
                module_name = str(dic_data['module_name'])

                message_data ={'message':dic_data['message'],'master_id':dic_data['master_id'],'module_id':module_id,
                                   'module_name':module_name, 'message_type':dic_data['message_type'],
                                   'attachements':dic_data['attachements']}
                message_status = save_message(request, message_data)
                return_status['success'] = message_status['success']
    return HttpResponse(json.dumps(return_status), content_type="application/json")


def save_message(request, message_data):
    return_status = {'success': True}
    user_id = request.user.id
    company_id = request.user.profile.company_id
    try:
        user = User.objects.get(pk=user_id)
        message = Messages()
        message.company_id = company_id
        clean = re.compile('<.*?>')
        message.message = re.sub(clean, '', message_data['message'])

        if message_data['module_name'] == 'contact':
            message.contact_id = message_data['master_id']
        elif message_data['module_name'] == 'opportunity':
            message.opportunity_id = message_data['master_id']
        elif message_data['module_name'] == 'quotation':
            message.sales_order_id = message_data['master_id']
        elif message_data['module_name'] == 'sales-order':
            message.sales_order_id = message_data['master_id']
        elif message_data['module_name'] == 'sales-order':
            message.invoice_id = message_data['invoice']

        message.module_name = message_data['module_name']
        message.user = user
        message.message_type = message_data['message_type']
        message.save()
        if len(message_data['attachements']) > 0:
            for attachement in message_data['attachements']:
                message_attatchments = AttachDocument()
                message_attatchments.file_name = attachement['file_name']
                message_attatchments.file_path = attachement['file_path']
                message_attatchments.module_name = message_data['module_name']
                message_attatchments.message = message
                message_attatchments.save()
        return_status = {'success': True}
    except User.DoesNotExist:
        print('User DoesNotExist')
    return return_status


def activity_change(request):
    return_status = {'success': False}
    company_id = request.user.profile.company_id
    if request.method == "POST" and request.is_ajax():
        action = str(request.POST['action'])
        module_id = int(request.POST['module_id'])
        master_id = int(request.POST['master_id'])
        module_name = request.POST['module_name']
        if master_id > 0 and module_id > 0:
            try:
                messages = Messages.objects.all().select_related('user').filter(module_name=module_name, company_id=company_id, action='log_activity')
                if module_id == 1:
                    messages = messages.filter(contact_id=master_id)
                    if action == 'all-complete':
                        messages.update(mark_done=True)
                    elif action == 'all-incomplete':
                        messages.update(mark_done=False)
                elif module_id == 2:
                    messages = messages.filter(opportunity_id=master_id)
                    if action == 'all-complete':
                        messages.update(mark_done=True)
                    elif action == 'all-incomplete':
                        messages.update(mark_done=False)
                return_status['success'] = True
            except Messages.DoesNotExist:
                print('Messages DoesNotExist')
    return HttpResponse(json.dumps(return_status), content_type="application/json")


def getMessageData(request, m_id):
    data = {}
    data['success'] = False
    user_data = {} 
    try:
        user = Messages.objects.get(pk=int(m_id))
        user_data['id'] = user.id
        user_data['summary'] = user.message
        user_data['next_activity'] = user.message_type
        user_data['master_id'] = user.master_id
        mydate1=user.next_activity_date
        new_today_date1 = mydate1.strftime("%m/%d/%Y") 
        user_data['next_activity_date'] = new_today_date1
        mydate =user.next_activity_reminder
        new_today_date = mydate.strftime("%m/%d/%Y") 
        user_data['next_activity_reminder'] = new_today_date
        data['success'] = True
        data['user'] = user_data 
    except  Messages.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type = "application/json")


def MessageDelete(request, m_id):
    response = {}
    response['success']  = False
    try:
        message = Messages.objects.get(pk = m_id)
        messages_attach = AttachDocument.objects.all().filter(message=message)
        if messages_attach:
            for file in messages_attach:
                file_path = settings.BASE_DIR + file.file_path
                if os.path.isfile(file_path):
                    os.remove(file_path)
        message.delete()
        response['success'] = True
    except  Messages.DoesNotExist:
        pass
    return HttpResponse(json.dumps(response), content_type = "application/json")


def db_save_message(request, message_data):
    user_id = request.user.id
    company_id = request.user.profile.company_id
    #module_id = int(message_data['module_id'])
    module_name = str(message_data['module_name'])
    if module_name:
        contact_id = None
        opportunity_id = None
        sales_order_id = None
        invoice_id = None
        if module_name == 'contact':
            contact_id = message_data['master_id']
        elif module_name == 'opportunity':
            opportunity_id = message_data['master_id']
        elif module_name == 'quotation':
            sales_order_id = message_data['master_id']
        elif module_name == 'sales-order':
            sales_order_id = message_data['master_id']
        elif module_name == 'invoice':
            invoice_id = message_data['master_id']

        message_data ={'company_id':company_id, 'user_id':user_id, 'contact_id':contact_id,
                       'opportunity_id':opportunity_id, 'sales_order_id':sales_order_id,
                       'module_name':module_name,'message':message_data['summary'],'message_type':message_data['next_activity'],
                       'next_activity_date': message_data['next_activity_date'], 'next_activity_reminder':message_data['next_activity_reminder'],
                       'action':message_data['action'],'mark_done':False, 'mark_read':False
                       }
        if 'id' in message_data and message_data['id']:
            message_obj = Messages.save_message(message_data, message_data['id'])
        else:
            message_obj= Messages.save_message(message_data, None)

    return message_obj


def logactivity(request):
    user_id = request.user.id
    company_id = request.user.profile.company_id
    json_data   = json.loads(request.POST['fields'])

    fields_data  = {'success':False, 'result':[]}
    return_message = {}
    today = date.today()

    if json_data['next_activity_date']:
        next_activity_date = datetime.strptime(json_data['next_activity_date'],"%m/%d/%Y")
    else:
        next_activity_date = today
    if json_data['next_activity_reminder']:
        next_activity_reminder = datetime.strptime(json_data['next_activity_reminder'],"%m/%d/%Y")
    else:
        next_activity_reminder = today

    if 'master_id' in json_data and json_data['master_id'] and 'module_name' in json_data:
        json_data['next_activity_date'] = next_activity_date
        json_data['next_activity_reminder'] = next_activity_reminder
        message_obj = db_save_message(request, json_data)
        if message_obj:
            fields_data['success'] = True
            return_message['id'] = message_obj.id
            return_message['message']=message_obj.message
            return_message['message_type'] = message_obj.message_type
            return_message['next_activity_date'] = str(message_obj.next_activity_date)
            return_message['next_activity_reminder'] = str(message_obj.next_activity_reminder)
            return_message['action'] = message_obj.action
            return_message['mark_done'] = message_obj.mark_done
            fields_data['result'].append(return_message)
    return HttpResponse(json.dumps(fields_data),  content_type = "application/json")

@login_required(login_url="/login/")
def fetch_activity(request):
    year, week, _ = now().isocalendar()
    company_id = request.user.profile.company_id
    return_result = {'success': False, 'result': []}
    messages = Messages.objects.select_related('user').filter(company_id=company_id,user_id=request.user.id)
    page = 1
    per_page = 100
    if request.method == "POST" and request.is_ajax():
        page = int(request.POST['page'])
        if page >= 1:
            page = page
        else:
            page = 1
        f1 = Q()
        f2 = Q()
        f3 = Q()
        f4 = Q()
        f5 = Q()
        filters = request.POST['filters']
        filter_data = json.loads(filters)
        if len(filter_data) > 0:
            for f in filter_data:
                if f=='today_activity':
                    date_list = [str(date.today()), str(date.today())]
                    f1 = Q(next_activity_date__range=date_list)

                if f=='next_week_activity':
                    f2 = Q(next_activity_date__week=week)

                if f=='overdue_activity':
                    overdue_date = date.today() + timedelta(-int(7))
                    f3 = Q(next_activity_date__lte=overdue_date)
                if f=='done':
                    f4 = Q(mark_done=True)
                if f=='not_done':
                    f5 = Q(mark_done=False)
            messages = messages.filter(f1 & f2 & f3 & f4 & f5)
    messages=  messages.order_by('id')
    pagination = {'previous_page': 0, "next_page": 0, 'pagination_label': ''}
    total_records = len(messages)
    paginator = Paginator(messages, per_page)
    if total_records > 0:
        try:
            messages = paginator.page(page)
        except PageNotAnInteger:
            print('NO page')
            messages = paginator.page(1)
            #pass
        except EmptyPage:
            print("perpage", paginator.per_page)
            messages = paginator.page(1)
            #pass

    if total_records > 0:
        if messages and messages.has_other_pages:
            if messages.has_previous():
                pagination['previous_page'] = messages.previous_page_number()
            if messages.has_next():
                pagination['next_page'] = messages.next_page_number()
            if messages.start_index():
                start = messages.start_index()
            if messages.end_index():
                end = messages.end_index()
        page_number_text = str(start) + " - " + str(end) + ' / ' + str(total_records)
        pagination['pagination_label'] = page_number_text

    if messages:
        return_result['success']= True
        for message in messages:
            summary = message.message[0:200]+'...'
            created_by = message.user.username
            if message.next_activity_date:
                next_activity_date = get_date(message.next_activity_date)
                if message.mark_done:
                    mark_done_div_class='media done'
                else:
                    mark_done_div_class='media undone'
                if message.module_id == 1:
                    try:
                        contact = Contact.objects.get(pk=message.contact_id)
                        module = 'Contact'
                        icon_class = 'icon-contact'
                        activity_link = '/contact/view/'+ str(contact.id) + '/'
                        temp_dic = {'id': message.id, 'model_name': module,
                                    'activity_type': message.message_type,
                                    'summary': summary,
                                    'link': activity_link,
                                    'activity_date': next_activity_date,
                                    'icon_class':icon_class,
                                    'mark_done':message.mark_done,
                                    'mark_read': message.mark_read,
                                    'mark_done_div_class':mark_done_div_class,
                                    'created_by':created_by,
                                    }
                        return_result['result'].append(temp_dic)
                    except Contact.DoesNotExist:
                        pass
                elif message.module_id == 2:
                    try:
                        opp = Opportunity.objects.get(pk=message.opportunity_id)
                        module = 'Opportunity'
                        icon_class = 'icon-opportunity'
                        activity_link = '/opportunity/view/' + str(opp.id) + '/'
                        temp_dic = {'id': message.id, 'model_name': module,
                                    'activity_type': message.message_type,
                                    'summary': summary,
                                    'link': activity_link,
                                    'activity_date': next_activity_date,
                                    'icon_class': icon_class,
                                    'created_by': created_by,
                                    }
                        return_result['result'].append(temp_dic)
                    except Opportunity.DoesNotExist:
                        pass
                elif message.module_id == 3:
                    try:
                        opp = Opportunity.objects.get(pk=message.master_id)
                        module = 'Quotation'
                        icon_class = 'icon-quotations'
                        activity_link = '/contact/view/' + str(message.master_id) + '/'
                        temp_dic = {'id': message.id, 'model_name': module,
                                    'activity_type': message.message_type,
                                    'summary': summary,
                                    'link': activity_link,
                                    'activity_date': next_activity_date,
                                    'icon_class': icon_class,
                                    'created_by': created_by,
                                    }
                    except Opportunity.DoesNotExist:
                        pass
    return_result['pagination'] = pagination
    return HttpResponse(json.dumps(return_result), content_type="application/json")


def delete_activity(request):
    return_result = {'success': False, 'result': [],'msg':''}
    if request.method == "POST" and request.is_ajax():
        message_list = request.POST['delete_activity_list']
        action = request.POST['action']
        id_list = json.loads(message_list)
        if len(id_list)>0:
            if action == 'delete':
                Messages.objects.filter(id__in=id_list).delete()
                return_result['success']=True
                return_result['msg'] = 'Deleted'
            if action == 'all_read':
                Messages.objects.filter(id__in=id_list).update(mark_read=True)
                return_result['success']=True
                return_result['msg'] = 'All Read'
            if action == 'all_done':
                Messages.objects.filter(id__in=id_list).update(mark_done=True)
                return_result['success']=True
                return_result['msg'] = 'All Done'

    return HttpResponse(json.dumps(return_result), content_type="application/json")

def mark_read(request):
    return_result = {'success': False, 'result': [], 'msg': ''}
    if request.method == "POST" and request.is_ajax():
        message_id = request.POST['message_id']
        message_status = request.POST['message_status']
        try:
            message = Messages.objects.get(pk=int(message_id))
            if message.mark_done:
                message.mark_done = False
            else:
                message.mark_done = True
            message.save()
            return_result['success'] = True
        except Messages.DoesNotExist:
            print("Messages.DoesNotExist:")

    return HttpResponse(json.dumps(return_result), content_type="application/json")


def get_class_by_msg_type(msg_type):
    return_icon = 'icon'
    if msg_type =='email' or msg_type =='message':
        return_icon = 'icon-email'
    elif msg_type =='call':
        return_icon = 'icon-quotations'
    elif msg_type =='meeting':
        return_icon = 'icon-contact'
    return return_icon

@login_required(login_url="/login/")
def notification_activity(request):
    year, week, _ = now().isocalendar()
    company_id = request.user.profile.company_id
    return_result = {'success': False, 'result': []}
    how_many_days = 3
    messages = Messages.objects.select_related('user').filter(company_id=company_id, mark_done=False, mark_read=False, user_id=request.user.id,next_activity_reminder__gte=datetime.now()-timedelta(days=how_many_days))
    if messages:
        return_result['success']= True
        for message in messages:
            summary = message.message[0:200]
            if message.next_activity_date:
                next_activity_date = get_date(message.next_activity_date)
                if message.module_id == 1:
                    try:
                        contact = Contact.objects.get(pk=message.contact_id)
                        module = 'Contact'
                        activity_link = '/contact/view/'+ str(contact.id) + '/'
                        temp_dic = {'id': message.id, 'model_name': module,
                                    'activity_type': message.message_type,
                                    'summary': summary,
                                    'link': activity_link,
                                    'activity_date': next_activity_date,
                                    'icon_class':get_class_by_msg_type(message.message_type),
                                    'mark_done':message.mark_done,
                                    'mark_read': message.mark_read,
                                    'created_by':message.user.username,
                                    }
                        return_result['result'].append(temp_dic)
                    except Contact.DoesNotExist:
                        pass
                elif message.module_id == 2:
                    try:
                        opp = Opportunity.objects.get(pk=message.opportunity_id)
                        module = 'Opportunity'
                        activity_link = '/opportunity/view/' + str(opp.id) + '/kanban'
                        temp_dic = {'id': message.id, 'model_name': module,
                                    'activity_type': message.message_type,
                                    'summary': summary,
                                    'link': activity_link,
                                    'activity_date': next_activity_date,
                                    'icon_class': get_class_by_msg_type(message.message_type),
                                    'created_by': message.user.username,
                                    }
                        return_result['result'].append(temp_dic)
                    except Opportunity.DoesNotExist:
                        pass
                elif message.module_id == 3:
                    try:
                        opp = Opportunity.objects.get(pk=message.master_id)
                        module = 'Quotation'
                        icon_class = 'icon-quotations'
                        activity_link = '/contact/view/' + str(message.master_id) + '/'
                        temp_dic = {'id': message.id, 'model_name': module,
                                    'activity_type': message.message_type,
                                    'summary': summary,
                                    'link': activity_link,
                                    'activity_date': next_activity_date,
                                    'icon_class': icon_class,
                                    'created_by': message.user.username,
                                    }
                    except Opportunity.DoesNotExist:
                        pass
    return HttpResponse(json.dumps(return_result), content_type="application/json")

@login_required(login_url="/")
def get_contacts_by_keyword(request):
    return_status = {'success': False,'result':[]}
    if request.method == "POST" and request.is_ajax():
        company_id = request.user.profile.company_id
        keyword = request.POST['keyword']
        contacts = Contact.objects.filter(user_company_id=company_id, is_customer=True, name__icontains= keyword)
        if len(contacts) > 0:
            return_status['success'] = True
            for c in contacts:
                if c.email:
                    return_status['result'].append({'id':c.id, 'name':c.name,'email':c.email})
    return HttpResponse(json.dumps(return_status), content_type="application/json")

@login_required(login_url="/")
@csrf_exempt
def get_recipient(request):
    return_status = {'success': False,'result':[]}
    company_id = request.user.profile.company_id
    if request.method == "POST":
        keyword = request.body
        contacts = Contact.objects.filter(user_company_id=company_id, name__icontains= keyword.decode("utf-8"))
        if len(contacts) > 0:
            return_status['success'] = True
            for c in contacts:
                if c.email:
                    return_status['result'].append({'id':c.id, 'login':c.name, 'email':c.email})
    return HttpResponse(json.dumps(return_status), content_type="application/json")



def validate_email(email):
    if len(email) > 7:
        if re.match("^.+\\@(\\[?)[a-zA-Z0-9\\-\\.]+\\.([a-zA-Z]{2,3}|[0-9]{1,3})(\\]?)$", email) != None:
            return True
    return False

@login_required(login_url="/")
def send_message(request):
    sender_email = request.user.email
    company_id = request.user.profile.company_id
    return_status = {'success': False, 'result': []}
    if request.method == "POST" and request.is_ajax():
        send_to = []
        contact_ids = []
        external_emails = []
        internal_recipients = json.loads(request.POST['internal_recipients'])
        external_recipients = json.loads(request.POST['external_recipients'])
        if len(external_recipients) > 0:
            external_emails = external_recipients[-1].split(',')


        if len(internal_recipients) > 0 and len(external_emails) > 0:
            for ir in internal_recipients:
                if ir['email'] not in send_to and validate_email(ir['email']):
                    send_to.append(ir['email'])
            for extr_email in external_emails:
                if extr_email not in send_to:
                    send_to.append(extr_email)
        elif len(internal_recipients) > 0 and len(external_emails) == 0:
            for ir in internal_recipients:
                if ir['email'] not in send_to and validate_email(ir['email']):
                    send_to.append(ir['email'])
        elif len(internal_recipients) == 0 and len(external_emails) > 0:
            for extr_email in external_recipients:
                if validate_email(extr_email):
                    send_to.append(extr_email)

        message_text = request.POST['message_text']
        master_id = int(request.POST['master_id'])
        module_id = int(request.POST['module_id'])
        module_name = str(request.POST['module_name'])

        if master_id > 0 and module_id > 0 and module_name !='':
            message_data ={
                            'module_id':module_id, 'master_id':master_id, 'module_name':module_name,
                            'summary':message_text, 'action':None, 'next_activity':'send_email',
                            'next_activity_date':None, 'next_activity_reminder':None
                          }
            message_obj = db_save_message(request, message_data)
            for email in send_to:
               contact_data = Contact.get_contact_by_email(email, company_id)
               if contact_data:
                   contact_ids.append(contact_data.id)
               else:
                    contact = Contact(name=email, email=email, profile_image=settings.DEFAULT_PROFILE_IMAGE, user_id=request.user.id, user_company_id=request.user.profile.company_id)
                    contact.save()
                    contact_ids.append(contact.id)
            if len(contact_ids) > 0:
                for contact in contact_ids:
                    mapping= MessageContactMap(message_id=message_obj.id, contact_id=contact)
                    mapping.save()

            if len(send_to):
                util = Utils()
                util.sent_email_from_messgage(sender_email, send_to, message_text)
                return_status = {'success': True}

    return HttpResponse(json.dumps(return_status), content_type="application/json")


@login_required(login_url="/login/")
def fetch_country(request):
    return_status = {'success': False, 'countries_list': []}
    keyword = None
    if request.method == "POST" and request.is_ajax():
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
    if keyword:
        countries = Countries.objects.filter(label__icontains=keyword)
        if len(countries) > 0:
            return_status['success'] = True
            for country in countries:
                temp_dic = {'id': country.id, 'name': country.label}
                return_status['countries_list'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')

@csrf_exempt
def fetch_all_admin(request):
    return_status = {'success': False, 'users': [], 'msg': ""}
    if request.method == "POST":
        if request.POST['api_key'] == settings.API_KEY:
            users = User.objects.select_related('profile', 'company').filter(is_active=True, profile__is_super_admin=True).filter(profile__activation_key__isnull=True)
            if len(users) > 0:
                return_status['success'] = True
                for user in users:
                    modules = []
                    try:
                        stripe = Stripe.objects.get(company_id=user.company.id)
                        plan = stripe.plan
                        subscription_date = str(stripe.created_at)
                    except Stripe.DoesNotExist:
                        plan = None
                        subscription_date = None
                    try:
                        user_obj = User.objects.select_related('profile').filter(profile__company_id=user.company.id, is_active=True).filter(profile__activation_key__isnull=True)
                        user_count = user_obj.count()
                    except User.DoesNotExist:
                        user_count = 0
                    try:
                        install_modules = CompanyModulesMapping.objects.select_related('module').filter(company_id=user.company.id, is_installed=True)
                        for mod in install_modules:
                            modules.append({'module_id':mod.module.id, 'module_name':mod.module.name})
                    except CompanyModulesMapping.DoesNotExist:
                        modules = []

                    comapny_dic ={'company_id':user.company.id,
                                  'company_name':user.company.company,
                                  'company_status': user.company.company_status,
                                  'billing_company_name': user.company.billing_company_name,
                                  'billing_street': user.company.billing_street,
                                  'billing_city': user.company.billing_city,
                                  'billing_zip': user.company.billing_zip,
                                  'billing_country': user.company.billing_country,
                                  'plan': plan,
                                  'subscription_date': subscription_date,
                                  'created_at': str(user.company.created_at),
                                  }

                    temp_dic = {'user_id': user.id,
                                'first_name':user.first_name,
                                'last_name':user.last_name,
                                'user_phone':user.profile.phone,
                                'user_email': user.email,
                                'company_detail':comapny_dic,
                                'no_of_active_users':user_count,
                                'date_joined':str(user.date_joined),
                                'active_modules':modules}
                    return_status['users'].append(temp_dic)
            else:
                return_status['msg'] = "No Record found"
        else:
            return_status['msg'] = "api key is not valid"
    else:
        return_status['msg'] = "api key is required"
    return HttpResponse(json.dumps(return_status), content_type='application/json')

@csrf_exempt
def fetch_stripe_payments(request):
    return_status = {'success': False, 'payments': [], 'msg': ""}
    if request.method == "POST":
        if request.POST['api_key'] == settings.API_KEY:
            payments = StripeInvoice.objects.filter()
            if len(payments) > 0:
                return_status['success'] = True
                for payment in payments:
                    payment_desc ={'invoice_id':payment.invoice_id,
                                  'id':payment.id,
                                  'customer_id':payment.customer_id,
                                  'amount_paid':str(payment.amount_paid),
                                  'tax':str(payment.tax),
                                  'tax_percent':str(payment.tax_percent),
                                  'charge_id':payment.charge_id,
                                  'date_time':str(payment.date_time),
                                  'invoice_number':payment.invoice_number,
                                  'currency':payment.currency,
                                  'description':payment.description,
                                  'items':payment.items,
                                  'discount':str(payment.discount),
                                  'invoice_pdf':payment.invoice_pdf,
                                  'company_id':payment.company_id,
                                  'user_id':payment.user_id,
                                  'stripe_id':payment.stripe_id,
                                  'date':str(payment.date),
                                  }

                    return_status['payments'].append(payment_desc)
            else:
                return_status['msg'] = "No Record found"
        else:
            return_status['msg'] = "api key is not valid"
    else:
        return_status['msg'] = "api key is required"
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@csrf_exempt
def fetch_company_user(request):
    return_status = {'success': False, 'users': [], 'msg': ""}
    if request.method == "POST":
        if request.POST['api_key'] == settings.API_KEY:
            users = User.objects.select_related('profile').filter(is_active=True, profile__is_super_admin=False).filter(profile__activation_key__isnull=True)
            if len(users) > 0:
                return_status['success'] = True
                for user in users:
                    temp_dic = {'user_id': user.id,
                                'first_name': user.first_name,
                                'last_name': user.last_name,
                                'user_phone': user.profile.phone,
                                'user_email': user.email,
                                'company_id': user.profile.company_id,
                                'date_joined': str(user.date_joined),
                                'role': user.profile.roles}
                    return_status['users'].append(temp_dic)
        else:
            return_status['msg'] = "api key is not valid"
    else:
        return_status['msg'] = "api key is required"
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@csrf_exempt
def fetch_all_user(request):
    return_status = {'success': False, 'users': [], 'msg': ""}
    keyword = None
    if request.method == "POST":
        if request.POST['api_key'] == settings.API_KEY:
            companies = Company.objects.select_related().all()

            if len(companies) > 0:
                return_status['success'] = True
                for company in companies:
                    try:
                        stripe = Stripe.objects.get(company_id=company.id)
                        plan = stripe.plan
                    except Stripe.DoesNotExist:
                        plan = None

                    temp_dic = {'user_id': company.user_id,'company_id':company.id, 'email_user':company.user.email,
                               'first_name':company.user.first_name,'last_name':company.user.last_name,'user_phone':'',
                                'company_name':company.company, 'type_of_status':company.company_status,
                                'company_email':company.email,'plan':plan}
                    return_status['users'].append(temp_dic)
        else:
            return_status['msg'] = "api key is not valid"
    else:
        return_status['msg'] = "api key is required"
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@csrf_exempt
def get_customer_detail(request):
    return_status = {'success': False, 'users': [], 'msg': ""}
    keyword = None
    if request.method == "POST":
        if request.POST['api_key'] == settings.API_KEY:
            companies = Company.objects.select_related().all()

            if len(companies) > 0:
                return_status['success'] = True
                for company in companies:
                    try:
                        stripe = Stripe.objects.get(company_id=company.id)
                        plan = stripe.plan
                    except Stripe.DoesNotExist:
                        plan = None

                    temp_dic = {'user_id': company.user_id,'company_id':company.id, 'email_user':company.user.email,
                               'first_name':company.user.first_name,'last_name':company.user.last_name,'user_phone':'',
                                'company_name':company.company, 'type_of_status':company.company_status,
                                'company_email':company.email,'plan':plan}
                    return_status['users'].append(temp_dic)
        else:
            return_status['msg'] = "api key is not valid"
    else:
        return_status['msg'] = "Invalid request"
    return HttpResponse(json.dumps(return_status), content_type='application/json')


def generate_pdf(request, report_id, report_for):
    report_id = str(report_id)
    if report_for == 'quotation' or report_for == 'sales_order':
        document_header_url = settings.LOCAL_HOST_NAME + 'quotation/document_header/' + report_id + '/' + report_for + '/'
        document_footer_url = settings.LOCAL_HOST_NAME + 'quotation/document_footer/' + report_id + '/'
        document_content_url = settings.LOCAL_HOST_NAME+'quotation/document/'+report_id+'/'
    elif report_for == 'invoice':
        document_header_url = settings.LOCAL_HOST_NAME + 'invoice/invoice_header/' + report_id + '/' + report_for + '/'
        document_footer_url = settings.LOCAL_HOST_NAME + 'invoice/invoice_footer/' + report_id + '/'
        document_content_url = settings.LOCAL_HOST_NAME + 'invoice/document/'+report_id+'/'
    file_name ='aa.pdf'
    file_path = settings.MEDIA_ROOT+'/'+file_name
    util = Utils()
    return util.generate_pdf_from_url(document_header_url, document_footer_url,  document_content_url, file_path)

def remove_file_from_path(request):
    return_status = {'success': False}
    if request.method == "POST" and request.is_ajax():
        if 'file_path' in request.POST:
            file_path = settings.BASE_DIR + request.POST['file_path']
            if os.path.isfile(file_path):
                os.remove(file_path)
                return_status['success'] = True
    return HttpResponse(json.dumps(return_status), content_type='application/json')

def message_create_for_create_action(dic_data ):
    message = Messages()
    message.company_id = dic_data['company_id']
    message.message = dic_data['message']
    message.module_name = dic_data['module_name']

    if dic_data['module_name'] == 'contact':
        message.contact = dic_data['module_object']
    if dic_data['module_name'] == 'opportunity':
        message.opportunity = dic_data['module_object']
    if dic_data['module_name'] == 'quotation' or dic_data['module_name'] == 'sales-order':
        message.sales_order = dic_data['module_object']
    if dic_data['module_name'] == 'invoice':
        message.invoice = dic_data['module_object']

    message.user = dic_data['user']
    message.message_type = 'create_action'
    message.save()
