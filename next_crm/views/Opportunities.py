from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from datetime import datetime, time, timedelta
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from next_crm.forms import OpAttachForm
from django.contrib.auth.models import User
from next_crm.models import Messages, Column, Opportunity, Sale_order, Profile, SalesChannel,  ContactTags, \
    OpportunityLeadsource, Lostreason, AttachDocument, Opattachment
from django.db.models import Q
from django.conf import settings
from next_crm.helper.utils import Utils
import json, os, time, csv
from django.db.models import Max, Count

from next_crm.helper.company import get_currency_name, format_date
from next_crm.helper.decorator import  manage_contact, trial_over, company_module_status, user_invited

from next_crm.views.Salesteams import  users_opp_channels
from next_crm.views.General import message_create_for_create_action


@login_required(login_url="/login/")
@user_invited
def list(request, viewtype='kanban'):
    if 'ROLE_NO_ACCESS_OPPORTUNITY' not in request.user.profile.roles:
        return render(request, 'web/app.html')
    else:
        return HttpResponseRedirect('/dashboard/')

@login_required(login_url="/login/")
@user_invited
def add(request):
    if 'ROLE_NO_ACCESS_OPPORTUNITY' not in request.user.profile.roles:
        return render(request, 'web/app.html')
    else:
        return HttpResponseRedirect('/dashboard/')

@login_required(login_url="/login/")
@user_invited
def view(request, view_id):
    company_id = request.user.profile.company_id
    opportunity = Opportunity.objects.get(pk=view_id, company_id=company_id)
    if 'ROLE_NO_ACCESS_OPPORTUNITY' in request.user.profile.roles:
        return HttpResponseRedirect('/dashboard/')
    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in request.user.profile.roles and opportunity.user_id == request.user.id:
        return render(request, 'web/app.html')
    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in request.user.profile.roles:
        return HttpResponseRedirect('/dashboard/')
    elif 'ROLE_MANAGE_ALL_OPPORTUNITY' in request.user.profile.roles:
        return render(request, 'web/app.html')
    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in request.user.profile.roles:
        return render(request, 'web/app.html')



@login_required(login_url="/login/")
@user_invited
def edit(request, edit_id, viewtype=None, model=None):
    company_id = request.user.profile.company_id
    opportunity = Opportunity.objects.get(pk=edit_id, company_id=company_id)
    if 'ROLE_NO_ACCESS_OPPORTUNITY' in request.user.profile.roles:
        return HttpResponseRedirect('/dashboard/')
    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in request.user.profile.roles and opportunity.user_id == request.user.id:
        return render(request, 'web/app.html')
    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in request.user.profile.roles:
        return HttpResponseRedirect('/dashboard/')
    elif 'ROLE_MANAGE_ALL_OPPORTUNITY' in request.user.profile.roles:
        return render(request, 'web/app.html')
    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in request.user.profile.roles:
        return render(request, 'web/app.html')

@csrf_exempt
@login_required(login_url="/login/")
@user_invited
def listdata(request):
    data = list_common_data(request)
    now = datetime.now()
    print("date after min", now)
    print("date after min", now + timedelta(minutes=10))
    print("date after min", now + timedelta(minutes=(1440 * 2)))
    return HttpResponse(json.dumps(data), content_type="application/json")

def get_currency(request):
    currency_name = request.user.profile.company.currency
    if currency_name == 'euro':
        currency = '€'
    else:
        currency = '$'
    return currency

def list_common_data(request):
    data = {}
    user_obj = request.user
    company_id = request.user.profile.company_id
    company_obj = request.user.profile.company
    group_by_list = [
                        {'label': 'Stage', 'selected': False, 'key': 'stage'},
                        {'label': 'Lost Opportunities', 'selected': False, 'key': 'lost_opp'},
                        {'label': 'Sales Person', 'selected': False, 'key': 'sales_person'},
                        {'label': 'Sales Channel', 'selected': False, 'key': 'sales_team'},
                        {'label': 'Lost Reason', 'selected': False, 'key': 'lost_reason'},
                        {'label': 'Lead Source', 'selected': False, 'key': 'lead_source'},
                        {'label': 'Creation Month', 'selected': False, 'key': 'creation_month'},
                        {'label': 'Expected Closing', 'selected': False, 'key': 'expected_closing'},
                        {'label': 'Undefined', 'selected': False, 'key': 'undefined'}
                    ]
    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    if request.method == 'POST':
        filter_param_list = request.POST['won_lost_filter']
    else:
        filter_param_list = []


    if request.method == 'POST':
        my_opp_filter = request.POST['my_opp_filter']
    else:
        my_opp_filter = []

    search_field_keys = {}

    if request.method == 'POST':
        search_name_list = json.loads(request.POST['search_by_names'])
        search_by_tags = json.loads(request.POST['search_by_tags'])
        amt_eq = json.loads(request.POST['amt_eq'])
        amt_lt = json.loads(request.POST['amt_lt'])
        amt_gt = json.loads(request.POST['amt_gt'])
        search_customer = json.loads(request.POST['customer'])

        if len(search_name_list) > 0:
            search_field_keys['name'] = search_name_list

        if len(search_by_tags) > 0:
            search_field_keys['total_amount'] = search_by_tags

        if len(search_customer) > 0:
            search_field_keys['customer_name'] = search_customer

    sales_team_list = users_opp_channels(request)
    sales_channel_id = None
    selected_channel_name = None
    if request.method == 'POST' and 'sales_channel_id' in request.POST:
        sales_channel_id = request.POST['sales_channel_id']
        for index, sales_team in enumerate(sales_team_list):
            if sales_team_list[index]['is_default'] and sales_channel_id == '':
                sales_channel_id = sales_team_list[index]['id']
                selected_channel_name = sales_team_list[index]['name']
                sales_team_list[index]['selected'] = True
            elif str(sales_channel_id) == str(sales_team_list[index]['id']):
                sales_team_list[index]['selected'] = True
                selected_channel_name = sales_team_list[index]['name']

    group_by = None
    if request.method == 'POST' and 'group_by' in request.POST:
        group_by = request.POST['group_by']
        for index, grp  in enumerate(group_by_list):
            if request.POST['group_by']!='' and group_by_list[index]['key'] == str(request.POST['group_by']):
                group_by_list[index]['selected']= True

    filter_param_list = json.loads(filter_param_list)
    my_opp_filter = json.loads(my_opp_filter)

    if not group_by or group_by == "stage":
        print('case 0', filter_param_list)
        data = get_list_data_by_stage(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, amt_eq, amt_lt, amt_gt)

    if group_by == "sales_person":
        print('case sales_person')
        data = get_list_data_by_sales_person(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, amt_eq, amt_lt, amt_gt)

    if group_by == "sales_team":
        print('case sales_team')
        data = get_list_data_by_sales_team(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, amt_eq, amt_lt, amt_gt)

    if group_by == "lost_reason":
        print('case lost_reason')
        data = get_list_data_by_lost_reason(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, amt_eq, amt_lt, amt_gt)

    if group_by == "lead_source":
        print('case lead_source ')
        data = get_list_data_by_lead_source(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, amt_eq, amt_lt, amt_gt)

    if group_by == "lost_opp":
        print('case lost_opp')
        data = get_list_data_by_opp_lost(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, group_by, amt_eq, amt_lt, amt_gt)

    if group_by == "creation_month":
        print('case creation_month')
        data = get_list_data_by_creation_month(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, group_by, amt_eq, amt_lt, amt_gt)

    if group_by == "expected_closing":
        print('case expected_closing')
        data = get_list_data_by_creation_month(request, filter_param_list, my_opp_filter, sales_channel_id, roles,company_id, search_name_list, search_by_tags,  group_by, amt_eq, amt_lt, amt_gt)

    if group_by == "undefined":
        print('case undefined')
        data = get_list_data_by_undefined(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_name_list, search_by_tags, amt_eq, amt_lt, amt_gt)

    return_data ={
           'scene':{'type':'container','props': {'orientation': "horizontal"},'children':data['final_data'],'total_revenue': str(data['total_r']) +' '+get_currency(request)},
           'json_teams':sales_team_list,
           'roles':data['roles'],
           'group_by_list':group_by_list,
           'sales_channel_id':sales_channel_id,
           'group_by':group_by,
           'selected_channel_name':selected_channel_name
          }
    return return_data




def get_list_data_by_stage(request, filter_param_list, my_opp_filter,  sales_channel_id, roles, company_id, search_by_names, search_by_tags, amt_eq, amt_lt, amt_gt):
    print("amt_eq", amt_eq)
    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])
    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    columns = Column.objects.filter(company_id=company_id, is_active=True, is_undefined=False)
    if sales_channel_id:
        columns = columns.filter(sales_channel_id=sales_channel_id)
    columns = columns.order_by('order')
    total_reven = 0.0
    if len(columns) > 0 :
        for index, column in enumerate(columns):
            if column.is_default:
                column_name = column.name
            else:
                if column.sales_channel_id:
                    column_name = column.name +' ( '+column.sales_channel.name + ' )'
                else:
                    column_name = column.name

            col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id, 'columnOrder': '',
                       'probabilityStaus': column.probability_status,'columnName': column_name, 'pipelineStaus': column.pipeline_status,
                       'fold_position': column.is_fold, 'currency': get_currency(request), 'id': column.id,
                       'requirements': '','probability': column.probability,  'display_row':False,
                       'default': '','teamId': '', 'status': '',
                       'total_estimate_revenue': 0.0, 'children':[]}


            opportunities = Opportunity.objects.filter(company_id=company_id, column_id=column.id,  is_active=True)
            if sales_channel_id:
                opportunities = opportunities.filter(sales_channel_id=sales_channel_id)

            if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
                opportunities =  opportunities.filter(user_id = user_id)

            if len(won_lost_filter_list) > 0:
                if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(Q(is_won=True) | Q(is_lost=True))
                elif 'won' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=True)
                elif 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_lost= True)
            if len(my_opp_filter_list) > 0:
                if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
                elif 'my_opp' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=user_id)
                elif 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=None)

            if len(search_by_names) > 0:
                for name in search_by_names:
                    query = query | Q(name__icontains=name)
                opportunities = opportunities.filter(query)

            if len(search_by_tags) > 0:
                tags_list = []
                for name in search_by_tags:
                    tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                    if len(tags) > 0:
                        for tag in tags:
                            tags_list.append(tag.id)
                if len(tags_list) > 0:
                    opportunities = opportunities.filter(tags__contains = tags_list)

            if amt_eq:
                opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
            if amt_lt:
                opportunities = opportunities.filter(estimated_revenue__lte00=amt_lt)
            if amt_gt:
                opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)

            if opportunities:
                total_estimate_revenue = 0.00
                for index, op in enumerate(opportunities):
                    current_tag_list = []
                    customer_name = None
                    customer_email = None
                    customer_phone = None
                    customer_profile_image = None
                    sales_person_name = None
                    sales_channel_name = None
                    editable = False
                    activity = {'id':None, 'msg':None, 'type':None, 'type_class':None,  'activity_date':None}
                    if op.tags and len(op.tags) > 0:
                        tags = ContactTags.objects.filter(pk__in=op.tags)
                        if tags:
                            for tag in tags:
                                current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                    if op.estimated_revenue:
                        total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                        total_reven = float(total_reven) + float(op.estimated_revenue)
                        col_dic['total_estimate_revenue'] = str(total_estimate_revenue)

                    if op.customer:
                        customer_name = op.customer.name
                        customer_email = op.customer.email
                        customer_phone = op.customer.phone
                        customer_profile_image = op.customer.profile_image

                    if op.sales_person_id:
                        sales_person_name = op.sales_person.first_name

                    if op.sales_channel_id:
                        sales_channel_name = op.sales_channel.name
                    try:
                        message = Messages.objects.filter(opportunity_id=op.id, module_name='opportunity', action='log_activity', mark_done=False).order_by('-next_activity_date').first()
                        if message:
                            activity['id'] = message.id
                            activity['msg'] = message.message
                            activity['type'] = message.message_type
                            activity['activity_date'] = format_date(message.next_activity_date, request.user.profile.company.currency)
                            if message.message_type == 'call':
                                activity['type_class'] = 'fa-phone'
                            elif message.message_type == 'email':
                                activity['type_class'] = 'fa-at'
                            elif message.message_type == 'message':
                                activity['type_class'] = 'fa-envelope'
                    except Messages.DoesNotExist:
                        pass

                    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                        editable = True
                    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True
                    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True

                    opp_dic = {
                                'id': op.id,
                                'columnId': op.column_id,
                                'orderId': op.order,
                                'userId': op.user_id,
                                'companyId': request.user.profile.company_id,
                                'name': op.name,
                                'cardcolor': op.card_color,
                                'estimatedRevenue': str(op.estimated_revenue),
                                'probability': op.probability,
                                'customer': customer_name,
                                'customerEmails': customer_email,
                                'customerPhone': customer_phone,
                                'customer_profile_image': customer_profile_image,
                                'expectedClosing': str(op.expected_closing),
                                'leadSource': op.lead_source_id,
                                'salesperson': op.sales_person_id,
                                'sales_person_name': sales_person_name,
                                'sales_channel_id': op.sales_channel_id,
                                'sales_channel_name': sales_channel_name,
                                'ratings': op.rating,
                                'tags': op.tags,
                                'status': op.is_active,
                                'is_won': op.is_won,
                                'is_lost': op.is_lost,
                                'is_open': op.is_open,
                                'lostReasonId': op.lostreason_id,
                                'internal_notes': op.internal_notes,
                                'currenttags': current_tag_list,
                                'currency': get_currency(request),
                                'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                                'created_by':op.user.get_full_name(),
                                'sales_person_profile_img': op.user.profile.profile_image,
                                'editable':editable,
                                'activity':activity,
                    }
                    col_dic['children'].append(opp_dic)
                col_dic['children'] = sorted(col_dic['children'], key=lambda k: k['orderId'])
            column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['total_r'] = total_reven
    final_data['group_by'] = "sales_team"
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data



def get_list_data_by_sales_person(request, filter_param_list, my_opp_filter,  sales_channel_id, roles, company_id, search_by_names, search_by_tags, amt_eq, amt_lt, amt_gt):
    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])
    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    columns = Opportunity.objects.filter(company_id=company_id)

    columns = columns.extra(select={'sales_person_id': "sales_person_id"})
    columns = columns.values("sales_person_id").annotate(count_items=Count('sales_person_id'))
    total_reven = 0.0
    if len(columns) > 0 :
        for index, column in enumerate(columns):
            col_name = User.objects.get(id=column['sales_person_id']).email
            col_id = str(column['sales_person_id'])
            col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id,'columnOrder': '',
                       'probabilityStaus': '','columnName': col_name, 'pipelineStaus': '',
                       'fold_position': '','currency': get_currency(request), 'id': col_id,
                       'requirements': '','probability': '', 'is_won_col': '', 'display_row':False,
                       'default': '','teamId': '', 'status': '',
                       'total_estimate_revenue': 0.0, 'children':[]}

            opportunities = Opportunity.objects.filter(company_id=company_id, sales_person_id=column['sales_person_id'],  is_active=True)
            if sales_channel_id:
                opportunities = opportunities.filter(sales_channel_id=sales_channel_id)

            if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
                opportunities =  opportunities.filter(user_id = user_id)

            if len(won_lost_filter_list) > 0:
                if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(Q(is_won=True) | Q(is_lost=True))
                elif 'won' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=True)
                elif 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_lost= True)
            if len(my_opp_filter_list) > 0:
                if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
                elif 'my_opp' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=user_id)
                elif 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=None)

            if len(search_by_names) > 0:
                for name in search_by_names:
                    query = query | Q(name__icontains=name)
                opportunities = opportunities.filter(query)

            if len(search_by_tags) > 0:
                tags_list = []
                for name in search_by_tags:
                    tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                    if len(tags) > 0:
                        for tag in tags:
                            tags_list.append(tag.id)
                if len(tags_list) > 0:
                    opportunities = opportunities.filter(tags__contains = tags_list)
            if amt_eq:
                opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
            if amt_lt:
                opportunities = opportunities.filter(estimated_revenue__lte=amt_lt)
            if amt_gt:
                opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)

            if opportunities:
                total_estimate_revenue = 0.00
                for index, op in enumerate(opportunities):
                    current_tag_list = []
                    customer_name = None
                    customer_email = None
                    customer_phone = None
                    customer_profile_image = None
                    sales_person_name = None
                    sales_channel_name = None
                    editable = False
                    if op.tags and len(op.tags) > 0:
                        tags = ContactTags.objects.filter(pk__in=op.tags)
                        if tags:
                            for tag in tags:
                                current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                    if op.estimated_revenue:
                        total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                        total_reven = float(total_reven) + float(op.estimated_revenue)
                        col_dic['total_estimate_revenue'] = str(total_estimate_revenue)

                    if op.customer:
                        customer_name = op.customer.name
                        customer_email = op.customer.email
                        customer_phone = op.customer.phone
                        customer_profile_image = op.customer.profile_image

                    if op.sales_person_id:
                        sales_person_name = op.sales_person.first_name

                    if op.sales_channel:
                        sales_channel_name = op.sales_channel.name


                    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                        editable = True
                    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True
                    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True

                    opp_dic = {
                                'id': op.id,
                                'columnId': op.column_id,
                                'orderId': op.order,
                                'userId': op.user_id,
                                'companyId': request.user.profile.company_id,
                                'name': op.name,
                                'cardcolor': op.card_color,
                                'estimatedRevenue': str(op.estimated_revenue),
                                'probability': op.probability,
                                'customer': customer_name,
                                'customerEmails': customer_email,
                                'customerPhone': customer_phone,
                                'customer_profile_image': customer_profile_image,
                                'expectedClosing': str(op.expected_closing),
                                'leadSource': op.lead_source_id,
                                'salesperson': op.sales_person_id,
                                'sales_person_name': sales_person_name,
                                'sales_channel_id': op.sales_channel_id,
                                'sales_channel_name': sales_channel_name,
                                'ratings': op.rating,
                                'tags': op.tags,
                                'status': op.is_active,
                                'is_won': op.is_won,
                                'is_lost': op.is_lost,
                                'is_open': op.is_open,
                                'lostReasonId': op.lostreason_id,
                                'internal_notes': op.internal_notes,
                                'currenttags': current_tag_list,
                                'currency': get_currency(request),
                                'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                                'editable':editable,
                                'created_by': op.user.get_full_name(),
                                'sales_person_profile_img': op.user.profile.profile_image,
                    }
                    col_dic['children'].append(opp_dic)
            column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['total_r'] = total_reven
    final_data['group_by'] = "sales_team"
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data



def get_list_data_by_sales_team(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_by_names, search_by_tags, amt_eq, amt_lt, amt_gt):
    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])

    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    sales_team = SalesChannel.objects.filter(pk=sales_channel_id, company_id=company_id)
    total_reven = 0.0
    if len(sales_team) > 0 :
        for index, sale_team in enumerate(sales_team):
            col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id,'columnOrder': '',
                       'probabilityStaus': '','columnName': sale_team.name, 'pipelineStaus': '',
                       'fold_position': '','currency': get_currency(request), 'id': sale_team.id,
                       'requirements': '','probability': '', 'is_won_col': '', 'display_row':False,
                       'default': '','teamId': '', 'status': '',
                       'total_estimate_revenue': 0.0, 'children':[]}

            opportunities = Opportunity.objects.filter(company_id=company_id, sales_channel_id=sale_team.id, is_active=True)
            if sales_channel_id:
                opportunities = opportunities.filter(sales_channel_id=sales_channel_id)
            if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
                opportunities = opportunities.filter(user_id = user_id)
            if len(won_lost_filter_list) > 0:
                if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(Q(is_won=True) | Q(is_won=False))
                elif 'won' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=True)
                elif 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=False)
            if len(my_opp_filter_list) > 0:
                if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
                elif 'my_opp' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=user_id)
                elif 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=None)

            if len(search_by_names) > 0:
                for name in search_by_names:
                    query = query | Q(name__icontains=name)
                opportunities = opportunities.filter(query)

            if len(search_by_tags) > 0:
                tags_list = []
                for name in search_by_tags:
                    tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                    if len(tags) > 0:
                        for tag in tags:
                            tags_list.append(tag.id)
                if len(tags_list) > 0:
                    opportunities = opportunities.filter(tags__contains = tags_list)

            if amt_eq:
                opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
            if amt_lt:
                opportunities = opportunities.filter(estimated_revenue__lte=amt_lt)
            if amt_gt:
                opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)

            if opportunities:
                total_estimate_revenue = 0.00
                for index, op in enumerate(opportunities):
                    current_tag_list = []
                    customer_name = None
                    customer_email = None
                    customer_phone = None
                    customer_profile_image = None
                    sales_person_name = None
                    sales_channel_name = None
                    editable = False
                    if op.tags and len(op.tags) > 0:
                        tags = ContactTags.objects.filter(pk__in=op.tags)
                        if tags:
                            for tag in tags:
                                current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                    if op.estimated_revenue:
                        total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                        total_reven = float(total_reven) + float(op.estimated_revenue)
                        col_dic['total_estimate_revenue'] = str(total_estimate_revenue)

                    if op.customer:
                        customer_name = op.customer.name
                        customer_email = op.customer.email
                        customer_phone = op.customer.phone
                        customer_profile_image = op.customer.profile_image

                    if op.sales_person_id:
                        sales_person_name = op.sales_person.first_name

                    if op.sales_channel_id:
                        sales_channel_name = op.sales_channel.name

                    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                        editable = True
                    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True
                    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True

                    opp_dic = {
                                'id': op.id,
                                'columnId': op.column_id,
                                'orderId': op.order,
                                'userId': op.user_id,
                                'companyId': request.user.profile.company_id,
                                'name': op.name,
                                'cardcolor': op.card_color,
                                'estimatedRevenue': str(op.estimated_revenue),
                                'probability': op.probability,
                                'customer': customer_name,
                                'customerEmails': customer_email,
                                'customerPhone': customer_phone,
                                'customer_profile_image': customer_profile_image,
                                'expectedClosing': str(op.expected_closing),
                                'leadSource': op.lead_source_id,
                                'salesperson': op.sales_person_id,
                                'sales_person_name': sales_person_name,
                                'sales_channel_id': op.sales_channel_id,
                                'sales_channel_name': sales_channel_name,
                                'ratings': op.rating,
                                'tags': op.tags,
                                'status': op.is_active,
                                'is_won': op.is_won,
                                'is_lost': op.is_lost,
                                'is_open': op.is_open,
                                'lostReasonId': op.lostreason_id,
                                'internal_notes': op.internal_notes,
                                'currenttags': current_tag_list,
                                'currency': get_currency(request),
                                'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                                'editable':editable,
                                'created_by': op.user.get_full_name(),
                                'sales_person_profile_img': op.user.profile.profile_image,
                    }
                    col_dic['children'].append(opp_dic)
            column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['total_r'] = total_reven
    final_data['group_by'] = "sales_team"
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data

def get_list_data_by_lost_reason(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_by_names, search_by_tags, amt_eq, amt_lt, amt_gt):
    utils = Utils()
    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    total_reven=0.00
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])

    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    lost_reasons = Lostreason.objects.filter(company_id=company_id)
    if len(lost_reasons) > 0 :
        for index, lost_reason in enumerate(lost_reasons):
            col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id,'columnOrder': '',
                       'probabilityStaus': '','columnName': lost_reason.reason, 'pipelineStaus': '',
                       'fold_position': '','currency': get_currency(request), 'id': lost_reason.id,
                       'requirements': '','probability': '', 'is_won_col': '', 'display_row':False,
                       'default': '','teamId': '', 'status': '',
                       'total_estimate_revenue': 0.0, 'children':[]}

            opportunities = Opportunity.objects.filter(company_id=company_id,  lostreason=lost_reason, is_active=True)
            if sales_channel_id:
                opportunities = opportunities.filter(sales_channel_id=sales_channel_id)
            if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
                opportunities = opportunities.filter(user_id = user_id)
            if len(won_lost_filter_list) > 0:
                if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(Q(is_won=True) | Q(is_won=False))
                elif 'won' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=True)
                elif 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=False)
            if len(my_opp_filter_list) > 0:
                if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
                elif 'my_opp' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=user_id)
                elif 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=None)

            if len(search_by_names) > 0:
                for name in search_by_names:
                    query = query | Q(name__icontains=name)
                opportunities = opportunities.filter(query)

            if len(search_by_tags) > 0:
                tags_list = []
                for name in search_by_tags:
                    tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                    if len(tags) > 0:
                        for tag in tags:
                            tags_list.append(tag.id)
                if len(tags_list) > 0:
                    opportunities = opportunities.filter(tags__contains = tags_list)
            if amt_eq:
                opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
            if amt_lt:
                opportunities = opportunities.filter(estimated_revenue__lte=amt_lt)
            if amt_gt:
                opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)

            if opportunities:
                total_estimate_revenue = 0.00
                for index, op in enumerate(opportunities):
                    current_tag_list = []
                    customer_name = None
                    customer_email = None
                    customer_phone = None
                    customer_profile_image = None
                    sales_person_name=None
                    sales_channel_name= None
                    editable= False
                    if op.tags and len(op.tags) > 0:
                        tags = ContactTags.objects.filter(pk__in=op.tags)
                        if tags:
                            for tag in tags:
                                current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                    if op.estimated_revenue:
                        total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                        total_reven = float(total_reven) + float(op.estimated_revenue)
                        col_dic['total_estimate_revenue'] = str(total_estimate_revenue)

                    if op.customer:
                        customer_name = op.customer.name
                        customer_email = op.customer.email
                        customer_phone = op.customer.phone
                        customer_profile_image = op.customer.profile_image
                    if op.sales_person_id:
                        sales_person_name = op.sales_person.first_name
                    if op.sales_channel_id:
                        sales_channel_name = op.sales_channel.name

                    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                        editable = True
                    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True
                    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True

                    opp_dic = {
                                'id': op.id,
                                'columnId': op.column_id,
                                'orderId': op.order,
                                'userId': op.user_id,
                                'companyId': request.user.profile.company_id,
                                'name': op.name,
                                'cardcolor': op.card_color,
                                'estimatedRevenue': str(op.estimated_revenue),
                                'probability': op.probability,
                                'customer': customer_name,
                                'customerEmails': customer_email,
                                'customerPhone': customer_phone,
                                'customer_profile_image':customer_profile_image,
                                'expectedClosing': str(op.expected_closing),
                                'leadSource': op.lead_source_id,
                                'salesperson': op.sales_person_id,
                                'sales_person_name': sales_person_name,
                                'sales_channel_id': op.sales_channel_id,
                                'sales_channel_name': sales_channel_name,
                                'ratings': op.rating,
                                'tags': op.tags,
                                'status': op.is_active,
                                'is_won': op.is_won,
                                'is_lost': op.is_lost,
                                'is_open': op.is_open,
                                'lostReasonId': op.lostreason_id,
                                'internal_notes': op.internal_notes,
                                'currenttags': current_tag_list,
                                'currency': get_currency(request),
                                'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                                'editable':editable,
                                'created_by': op.user.get_full_name(),
                                'sales_person_profile_img': op.user.profile.profile_image,
                    }
                    col_dic['children'].append(opp_dic)
            column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['group_by'] = "lost_reasons"
    final_data['total_r'] = total_reven
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data



def get_list_data_by_lead_source(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_by_names, search_by_tags, amt_eq, amt_lt, amt_gt):

    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    total_reven=0.00
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])

    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    lead_sources = OpportunityLeadsource.objects.filter(company_id=company_id)
    if len(lead_sources) > 0 :
        for index, lead in enumerate(lead_sources):
            col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id,'columnOrder': '',
                       'probabilityStaus': '','columnName': lead.name, 'pipelineStaus': '',
                       'fold_position': '','currency': get_currency(request), 'id': lead.id,
                       'requirements': '','probability': '', 'is_won_col': '', 'display_row':False,
                       'default': '','teamId': '', 'status': '',
                       'total_estimate_revenue': 0.0, 'children':[]}

            opportunities = Opportunity.objects.filter(company_id=company_id, lead_source=lead.id, is_active=True)
            if sales_channel_id:
                opportunities = opportunities.filter(sales_channel_id=sales_channel_id)
            if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
                opportunities = opportunities.filter(user_id = user_id)
            if len(won_lost_filter_list) > 0:
                if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(Q(is_won=True) | Q(is_won=False))
                elif 'won' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=True)
                elif 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=False)
            if len(my_opp_filter_list) > 0:
                if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
                elif 'my_opp' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=user_id)
                elif 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=None)

            if len(search_by_names) > 0:
                for name in search_by_names:
                    query = query | Q(name__icontains=name)
                opportunities = opportunities.filter(query)

            if len(search_by_tags) > 0:
                tags_list = []
                for name in search_by_tags:
                    tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                    if len(tags) > 0:
                        for tag in tags:
                            tags_list.append(tag.id)
                if len(tags_list) > 0:
                    opportunities = opportunities.filter(tags__contains = tags_list)

            if amt_eq:
                opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
            if amt_lt:
                opportunities = opportunities.filter(estimated_revenue__lte=amt_lt)
            if amt_gt:
                opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)

            if opportunities:
                total_estimate_revenue = 0.00
                for index, op in enumerate(opportunities):
                    current_tag_list = []
                    customer_name = None
                    customer_email = None
                    customer_phone = None
                    customer_profile_image = None
                    sales_person_name=None
                    sales_channel_name= None
                    editable = False
                    if op.tags and len(op.tags) > 0:
                        tags = ContactTags.objects.filter(pk__in=op.tags)
                        if tags:
                            for tag in tags:
                                current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                    if op.estimated_revenue:
                        total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                        total_reven = float(total_reven) + float(op.estimated_revenue)
                        col_dic['total_estimate_revenue'] = str(total_estimate_revenue)

                    if op.customer:
                        customer_name = op.customer.name
                        customer_email = op.customer.email
                        customer_phone = op.customer.phone
                        customer_profile_image = op.customer.profile_image
                    if op.sales_person_id:
                        sales_person_name = op.sales_person.first_name
                    if op.sales_channel_id:
                        sales_channel_name = op.sales_channel.name

                    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                        editable = True
                    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True
                    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True

                    opp_dic = {
                                'id': op.id,
                                'columnId': op.column_id,
                                'orderId': op.order,
                                'userId': op.user_id,
                                'companyId': request.user.profile.company_id,
                                'name': op.name,
                                'cardcolor': op.card_color,
                                'estimatedRevenue': str(op.estimated_revenue),
                                'probability': op.probability,
                                'customer': customer_name,
                                'customerEmails': customer_email,
                                'customerPhone': customer_phone,
                                'customer_profile_image':customer_profile_image,
                                'expectedClosing': str(op.expected_closing),
                                'leadSource': op.lead_source_id,
                                'salesperson': op.sales_person_id,
                                'sales_person_name': sales_person_name,
                                'sales_channel_id': op.sales_channel_id,
                                'sales_channel_name': sales_channel_name,
                                'ratings': op.rating,
                                'tags': op.tags,
                                'status': op.is_active,
                                'is_won': op.is_won,
                                'is_lost': op.is_lost,
                                'is_open': op.is_open,
                                'lostReasonId': op.lostreason_id,
                                'internal_notes': op.internal_notes,
                                'currenttags': current_tag_list,
                                'currency': get_currency(request),
                                'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                                'editable':editable,
                                'created_by': op.user.get_full_name(),
                                'sales_person_profile_img': op.user.profile.profile_image,
                    }
                    col_dic['children'].append(opp_dic)
            column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['group_by'] = "lost_reasons"
    final_data['total_r'] = total_reven
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data



def get_list_data_by_opp_lost(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_by_names, search_by_tags, group_by, amt_eq, amt_lt, amt_gt):
    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    total_reven = 0.00
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])

    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    if group_by == 'lost_opp':
        col_name = 'Lost Opportunities'
        col_id = '_lost_'
        col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id,'columnOrder': '',
                   'probabilityStaus': '','columnName': col_name, 'pipelineStaus': '',
                   'fold_position': '','currency': get_currency(request), 'id': col_id,
                   'requirements': '','probability': '', 'is_won_col': '', 'display_row':False,
                   'default': '','teamId': '', 'status': '',
                   'total_estimate_revenue': 0.0, 'children':[]}

        opportunities = Opportunity.objects.filter(company_id=company_id, is_won=False, is_active=True, is_lost=True)
        if sales_channel_id:
            opportunities = opportunities.filter(sales_channel_id=sales_channel_id)
        if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
            opportunities = opportunities.filter(user_id=user_id)
        if len(my_opp_filter_list) > 0:
            if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
            elif 'my_opp' in my_opp_filter_list:
                opportunities = opportunities.filter(sales_person_id=user_id)
            elif 'unassigned' in my_opp_filter_list:
                opportunities = opportunities.filter(sales_person_id=None)

        if len(search_by_names) > 0:
            for name in search_by_names:
                query = query | Q(name__icontains=name)
            opportunities = opportunities.filter(query)

        if len(search_by_tags) > 0:
            tags_list = []
            for name in search_by_tags:
                tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                if len(tags) > 0:
                    for tag in tags:
                        tags_list.append(tag.id)
            if len(tags_list) > 0:
                opportunities = opportunities.filter(tags__contains = tags_list)
        if amt_eq:
            opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
        if amt_lt:
            opportunities = opportunities.filter(estimated_revenue__lte=amt_lt)
        if amt_gt:
            opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)
        if opportunities:
            total_estimate_revenue = 0.00
            for index, op in enumerate(opportunities):
                current_tag_list = []
                customer_name = None
                customer_email = None
                customer_phone = None
                customer_profile_image = None
                sales_person_name =None
                sales_channel_name =None
                editable = False
                if op.tags and len(op.tags) > 0:
                    tags = ContactTags.objects.filter(pk__in=op.tags)
                    if tags:
                        for tag in tags:
                            current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                if op.estimated_revenue:
                    total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                    col_dic['total_estimate_revenue'] = str(total_estimate_revenue)
                    total_reven = float(total_reven) + float(op.estimated_revenue)

                if op.customer:
                    customer_name = op.customer.name
                    customer_email = op.customer.email
                    customer_phone = op.customer.phone
                    customer_profile_image = op.customer.profile_image

                if op.sales_person_id:
                    sales_person_name = op.sales_person.first_name

                if op.sales_channel_id:
                    sales_channel_name = op.sales_channel.name


                if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                    editable = True
                elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                    editable = True
                elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                    editable = True
                opp_dic = {
                            'id': op.id,
                            'columnId': op.column_id,
                            'orderId': op.order,
                            'userId': op.user_id,
                            'companyId': request.user.profile.company_id,
                            'name': op.name,
                            'cardcolor': op.card_color,
                            'estimatedRevenue': str(op.estimated_revenue),
                            'probability': op.probability,
                            'customer': customer_name,
                            'customerEmails': customer_email,
                            'customerPhone': customer_phone,
                            'customer_profile_image':customer_profile_image,
                            'expectedClosing': str(op.expected_closing),
                            'leadSource': op.lead_source_id,
                            'salesperson': op.sales_person_id,
                            'sales_person_name': sales_person_name,
                            'sales_channel_id': op.sales_channel_id,
                            'sales_channel_name': sales_channel_name,
                            'ratings': op.rating,
                            'tags': op.tags,
                            'status': op.is_active,
                            'is_won': op.is_won,
                            'is_lost': op.is_lost,
                            'is_open': op.is_open,
                            'lostReasonId': op.lostreason_id,
                            'internal_notes': op.internal_notes,
                            'currenttags': current_tag_list,
                            'currency': get_currency(request),
                            'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                            'editable':editable,
                            'created_by': op.user.get_full_name(),
                            'sales_person_profile_img': op.user.profile.profile_image,
                }
                col_dic['children'].append(opp_dic)
        column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['total_r'] = total_reven
    final_data['group_by'] = group_by
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data


def get_list_data_by_creation_month(request, filter_param_list, my_opp_filter, sales_channel_id, roles, company_id, search_by_names, search_by_tags, group_by, amt_eq, amt_lt, amt_gt):
    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    total_reven = 0.00
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])

    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    month_year_opp = Opportunity.objects.filter(company_id=company_id, is_active=True)
    if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
        month_year_opp = month_year_opp.filter(user_id=user_id)
    if group_by == 'creation_month':
        month_year_opp = month_year_opp.exclude(created_at__isnull=True)
        month_year_opp = month_year_opp.extra(select={'month': "EXTRACT(month FROM created_at)", 'year': "to_char(created_at,'YYYY')"})
        month_year_opp = month_year_opp.values("year", "month").annotate(count_items=Count('created_at'))
    elif group_by == 'expected_closing':
        month_year_opp = month_year_opp.exclude(expected_closing__isnull=True)
        month_year_opp = month_year_opp.extra(select={'month': "EXTRACT(month FROM expected_closing)", 'year': "to_char(expected_closing,'YYYY')"})
        month_year_opp = month_year_opp.values("year", "month").annotate(count_items=Count('expected_closing'))

    month_year_opp = month_year_opp.order_by('year', 'month')
    if len(month_year_opp) > 0:
        for index, month_year in enumerate(month_year_opp):
            col_name = getMonthName(int(month_year['month'])) + ' ' + str(int(month_year['year']))
            col_id = str(int(month_year['month'])) + '_' + str(month_year['year'])
            col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id,'columnOrder': '',
                       'probabilityStaus': '','columnName': col_name, 'pipelineStaus': '',
                       'fold_position': '','currency': get_currency(request), 'id': col_id,
                       'requirements': '','probability': '', 'is_won_col': '', 'display_row':False,
                       'default': '','teamId': '', 'status': '',
                       'total_estimate_revenue': 0.0, 'children':[]}
            if group_by == 'creation_month':
                opportunities = Opportunity.objects.filter(company_id=company_id, created_at__month=month_year['month'], created_at__year=month_year['year'],)
            elif group_by == 'expected_closing':
                opportunities = Opportunity.objects.filter(company_id=company_id, expected_closing__month=month_year['month'], expected_closing__year=month_year['year'], )

            if sales_channel_id:
                opportunities = opportunities.filter(sales_channel_id=sales_channel_id)

            if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
                opportunities =  opportunities.filter(user_id=user_id)

            if len(won_lost_filter_list) > 0:
                if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(Q(is_won=True) | Q(is_won=False))
                elif 'won' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=True)
                elif 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=False)
            if len(my_opp_filter_list) > 0:
                if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
                elif 'my_opp' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=user_id)
                elif 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=None)


            if len(search_by_names) > 0:
                for name in search_by_names:
                    query = query | Q(name__icontains=name)
                opportunities = opportunities.filter(query)

            if len(search_by_tags) > 0:
                tags_list = []
                for name in search_by_tags:
                    tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                    if len(tags) > 0:
                        for tag in tags:
                            tags_list.append(tag.id)
                if len(tags_list) > 0:
                    opportunities = opportunities.filter(tags__contains = tags_list)

            if amt_eq:
                opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
            if amt_lt:
                opportunities = opportunities.filter(estimated_revenue__lte=amt_lt)
            if amt_gt:
                opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)

            if opportunities:
                total_estimate_revenue = 0.00
                for index, op in enumerate(opportunities):
                    current_tag_list = []
                    customer_name = None
                    customer_email = None
                    customer_phone = None
                    customer_profile_image = None
                    sales_person_name =None
                    sales_channel_name =None
                    editable= False
                    if op.tags and len(op.tags) > 0:
                        tags = ContactTags.objects.filter(pk__in=op.tags)
                        if tags:
                            for tag in tags:
                                current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                    if op.estimated_revenue:
                        total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                        col_dic['total_estimate_revenue'] = str(total_estimate_revenue)
                        total_reven = float(total_reven) + float(op.estimated_revenue)

                    if op.customer:
                        customer_name = op.customer.name
                        customer_email = op.customer.email
                        customer_phone = op.customer.phone
                        customer_profile_image = op.customer.profile_image

                    if op.sales_person_id:
                        sales_person_name = op.sales_person.first_name

                    if op.sales_channel_id:
                        sales_channel_name = op.sales_channel.name

                    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                        editable = True
                    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True
                    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True

                    opp_dic = {
                                'id': op.id,
                                'columnId': op.column_id,
                                'orderId': op.order,
                                'userId': op.user_id,
                                'companyId': request.user.profile.company_id,
                                'name': op.name,
                                'cardcolor': op.card_color,
                                'estimatedRevenue': str(op.estimated_revenue),
                                'probability': op.probability,
                                'customer': customer_name,
                                'customerEmails': customer_email,
                                'customerPhone': customer_phone,
                                'customer_profile_image':customer_profile_image,
                                'expectedClosing': str(op.expected_closing),
                                'leadSource': op.lead_source_id,
                                'salesperson': op.sales_person_id,
                                'sales_person_name': sales_person_name,
                                'sales_channel_id': op.sales_channel_id,
                                'sales_channel_name': sales_channel_name,
                                'ratings': op.rating,
                                'tags': op.tags,
                                'status': op.is_active,
                                'is_won': op.is_won,
                                'is_lost': op.is_lost,
                                'is_open': op.is_open,
                                'lostReasonId': op.lostreason_id,
                                'internal_notes': op.internal_notes,
                                'currenttags': current_tag_list,
                                'currency': get_currency(request),
                                'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                                'editable':editable,
                                'created_by': op.user.get_full_name(),
                                'sales_person_profile_img': op.user.profile.profile_image,
                    }
                    col_dic['children'].append(opp_dic)
            column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['total_r'] = total_reven
    final_data['group_by'] = "lost_reasons"
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data

def get_list_data_by_undefined(request, filter_param_list, my_opp_filter,  sales_channel_id, roles, company_id, search_by_names, search_by_tags, amt_eq, amt_lt, amt_gt):

    user_obj = request.user
    user_id = user_obj.id
    final_data = {}
    column_data_list=[]
    won_lost_filter_list=[]
    my_opp_filter_list=[]
    query = Q()

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])
    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])

    columns = Column.objects.filter(company_id=company_id, is_undefined=True)
    if sales_channel_id:
        columns = columns.filter(sales_channel_id=sales_channel_id)
    total_reven = 0.0
    if len(columns) > 0 :
        for index, column in enumerate(columns):
            column_name = column.name
            col_dic = {'columntype': '', 'IsUndefined': '','companyId': '', 'userId': user_id,'columnOrder': '',
                       'probabilityStaus': column.probability_status,'columnName': column_name, 'pipelineStaus': column.pipeline_status,
                       'fold_position': column.is_fold,'currency': get_currency(request), 'id': column.id,
                       'requirements': '','probability': column.probability,  'display_row':False,
                       'default': '','teamId': '', 'status': '',
                       'total_estimate_revenue': 0.0, 'children':[]}

            #print("----------",company_id, column.id, sales_channel_id)

            opportunities = Opportunity.objects.filter(company_id=company_id, column_id=column.id,  is_active=True)
            if sales_channel_id:
                opportunities = opportunities.filter(sales_channel_id=sales_channel_id)

            if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles:
                opportunities =  opportunities.filter(user_id = user_id)

            if len(won_lost_filter_list) > 0:
                if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(Q(is_won=True) | Q(is_lost=True))
                elif 'won' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_won=True)
                elif 'lost' in won_lost_filter_list:
                    opportunities = opportunities.filter(is_lost= True)
            if len(my_opp_filter_list) > 0:
                if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(Q(sales_person_id=0) | Q(sales_person_id=user_id))
                elif 'my_opp' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=user_id)
                elif 'unassigned' in my_opp_filter_list:
                    opportunities = opportunities.filter(sales_person_id=None)

            if len(search_by_names) > 0:
                for name in search_by_names:
                    query = query | Q(name__icontains=name)
                opportunities = opportunities.filter(query)

            if len(search_by_tags) > 0:
                tags_list = []
                for name in search_by_tags:
                    tags = ContactTags.objects.filter(company_id=company_id, name__icontains=name)
                    if len(tags) > 0:
                        for tag in tags:
                            tags_list.append(tag.id)
                if len(tags_list) > 0:
                    opportunities = opportunities.filter(tags__contains = tags_list)

            if amt_eq:
                opportunities = opportunities.filter(estimated_revenue__contains=amt_eq)
            if amt_lt:
                opportunities = opportunities.filter(estimated_revenue__lte=amt_lt)
            if amt_gt:
                opportunities = opportunities.filter(estimated_revenue__gte=amt_gt)

            if opportunities:
                total_estimate_revenue = 0.00
                for index, op in enumerate(opportunities):
                    current_tag_list = []
                    customer_name = None
                    customer_email = None
                    customer_phone = None
                    customer_profile_image = None
                    sales_person_name = None
                    sales_channel_name = None
                    editable = False
                    if op.tags and len(op.tags) > 0:
                        tags = ContactTags.objects.filter(pk__in=op.tags)
                        if tags:
                            for tag in tags:
                                current_tag_list.append({'id': tag.id, 'name': tag.name, 'color': tag.color})

                    if op.estimated_revenue:
                        total_estimate_revenue = float(total_estimate_revenue) + float(op.estimated_revenue)
                        total_reven = float(total_reven) + float(op.estimated_revenue)
                        col_dic['total_estimate_revenue'] = str(total_estimate_revenue)

                    if op.customer:
                        customer_name = op.customer.name
                        customer_email = op.customer.email
                        customer_phone = op.customer.phone
                        customer_profile_image = op.customer.profile_image

                    if op.sales_person_id:
                        sales_person_name = op.sales_person.first_name

                    if op.sales_channel_id:
                        sales_channel_name = op.sales_channel.name

                    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in user_obj.profile.roles:
                        editable = True
                    elif 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True
                    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in user_obj.profile.roles and user_id == op.user_id:
                        editable = True

                    opp_dic = {
                                'id': op.id,
                                'columnId': op.column_id,
                                'orderId': op.order,
                                'userId': op.user_id,
                                'companyId': request.user.profile.company_id,
                                'name': op.name,
                                'cardcolor': op.card_color,
                                'estimatedRevenue': str(op.estimated_revenue),
                                'probability': op.probability,
                                'customer': customer_name,
                                'customerEmails': customer_email,
                                'customerPhone': customer_phone,
                                'customer_profile_image': customer_profile_image,
                                'expectedClosing': str(op.expected_closing),
                                'leadSource': op.lead_source_id,
                                'salesperson': op.sales_person_id,
                                'sales_person_name': sales_person_name,
                                'sales_channel_id': op.sales_channel_id,
                                'sales_channel_name': sales_channel_name,
                                'ratings': op.rating,
                                'tags': op.tags,
                                'status': op.is_active,
                                'is_won': op.is_won,
                                'is_lost': op.is_lost,
                                'is_open': op.is_open,
                                'lostReasonId': op.lostreason_id,
                                'internal_notes': op.internal_notes,
                                'currenttags': current_tag_list,
                                'currency': get_currency(request),
                                'CreatedAt': str(op.created_at.strftime('%Y-%m-%d %H:%M:%S')),
                                'editable':editable,
                                'created_by': op.user.get_full_name(),
                                'sales_person_profile_img': op.user.profile.profile_image,
                    }
                    col_dic['children'].append(opp_dic)
            column_data_list.append(col_dic)

    final_data['final_data'] = column_data_list
    final_data['total_r'] = total_reven
    final_data['group_by'] = "sales_team"
    final_data['current_sales_team'] = sales_channel_id
    final_data['roles'] = roles
    return final_data



def compare(list1, list2):
    ln = []
    for i in list1:
        if i in list2:
            ln.append(i)
    return ln

def getSearchCondition(table, search_field_keys):
    response = {}
    search_keys = []
    search_cond = ""
    search_cond1 = ""
    search_cond2 = ""
    search_cond3 = ""
    if 'name' in search_field_keys:
        i = 0
        for name in search_field_keys['name']:
            search_keys.append('%' + name + '%')
            if i > 0:
                search_cond1 = search_cond1 + " OR "
            search_cond1 = search_cond1 + " UPPER(" + table + ".name::text) LIKE UPPER(%s) "
            i += 1

    if 'total_amount' in search_field_keys:

        i = 0
        for total_amount in search_field_keys['total_amount']:
            search_keys.append('' + total_amount + '')
            if i > 0:
                search_cond2 = search_cond2 + " OR "
            search_cond2 = search_cond2 + " UPPER(" + table + ".estimated_revenue::text) LIKE UPPER(%s) "
            i += 1

    if 'customer_name' in search_field_keys:
        i = 0
        for customer_name in search_field_keys['customer_name']:
            search_keys.append('%' + customer_name + '%')
            if i > 0:
                search_cond3 = search_cond3 + " OR "
            search_cond3 = search_cond3 + " UPPER(" + table + ".customer_name::text) LIKE UPPER(%s) "
            i += 1

    if len(search_cond1) > 0 and len(search_cond2) > 0 and len(search_cond3) > 0:
        search_cond = " AND (" + search_cond1 + ") " + " AND (" + search_cond2 + ") " + " AND (" + search_cond3 + ") "

    elif len(search_cond1) > 0 and len(search_cond2) > 0:
        search_cond = " AND (" + search_cond1 + ") " + " AND (" + search_cond2 + ") "

    elif len(search_cond1) > 0 and len(search_cond3) > 0:
        search_cond = " AND (" + search_cond1 + ") " + " AND (" + search_cond3 + ") "

    elif len(search_cond2) > 0 and len(search_cond3) > 0:
        search_cond = " AND (" + search_cond2 + ") " + " AND (" + search_cond3 + ") "

    elif len(search_cond1) > 0:
        search_cond = " AND (" + search_cond1 + ") "

    elif len(search_cond2) > 0:
        search_cond = " AND (" + search_cond2 + ") "

    elif len(search_cond3) > 0:
        search_cond = " AND (" + search_cond3 + ") "

    response['cond'] = search_cond
    response['keys'] = search_keys

    return response



def getMonthName(month_number):
    month_name_list = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
                       'November', 'December']
    index = month_number - 1
    if index >= 0 and index <= 11:
        return month_name_list[index]
    else:
        return None

def filterForOpportunity(filter_param_list, my_opp_filter, sales_channel_id, company_id, user_id, roles):
    cond = ' and op.is_active = True '
    won_lost_filter_list=[]
    my_opp_filter_list=[]

    for filter_item in filter_param_list:
        if filter_item['selected']:
            won_lost_filter_list.append(filter_item['key'])

    if len(my_opp_filter) > 0:
        for filter_item in my_opp_filter:
            if filter_item['selected']:
                my_opp_filter_list.append(filter_item['key'])


    if len(won_lost_filter_list) > 0:
        if 'won' in won_lost_filter_list and 'lost' in won_lost_filter_list:
            cond = cond + " AND (op.is_won = True OR  op.is_won = False)"
        elif 'won' in won_lost_filter_list:
            cond = cond + " AND (op.is_won = True )  "
        elif 'lost' in won_lost_filter_list:
            cond = cond + " AND (op.is_won = False )  "

    if len(my_opp_filter_list) > 0:
        if 'my_opp' in my_opp_filter_list and 'unassigned' in my_opp_filter_list:
            cond = cond + " AND (op.sales_person_id = 0 OR  op.sales_person_id =" + str(user_id) + ") "
        elif 'my_opp' in my_opp_filter_list:
            cond = cond + " AND sales_person_id = " + str(user_id)
        elif 'unassigned' in my_opp_filter_list:
            cond = cond + " AND op.sales_person_id is null"
        #print("my_opp_filter_list_condition::", my_opp_filter_list, cond)

    if sales_channel_id is not None:
        cond = cond + " AND  op.sales_channel_id =" + str(sales_channel_id)

    '''else:
        cond = cond + " AND  op.is_active = True " '''
    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in roles:
        cond = cond + " AND  op.company_id =" + str(company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in roles:
        cond = cond + " AND  op.sales_person_id =" + str(user_id)

    return cond

def getTeamOfUser(request):
    user_obj = request.user
    company_id = request.user.profile.company_id
    sales_team_list = []
    sales_teams = SalesChannel.objects.filter(company=company_id).filter(Q(team_members__contains=[user_obj.id]) | Q(team_leader_id =user_obj.id))
    return sales_teams
    '''if sales_teams:
        for team in sales_teams:
                sales_team_list.append({'id': team.id, 'name': team.name, 'selected':False, 'is_default':team.is_default})
    return sales_team_list'''





def getPaggingCond(pagging_data):
    cond = ""
    limit = settings.PAGGING_LIMIT
    offset = int(pagging_data['offset'])
    limit = offset + int(limit)

    cond = " OFFSET " + str(offset) + " LIMIT " + str(limit) + " "

    return cond




def updateopertunityorder(request):
    company_id = request.user.profile.company_id
    data = {'status':False}
    opp_id_list = json.loads(request.POST['fields'])
    column_id = request.POST['column_id']
    view_by = str(request.POST['view_by'])
    if column_id is not None  and len(opp_id_list) > 0 :
        for index, opp in enumerate(opp_id_list):
            column = Column.objects.get(pk=int(column_id), company_id=company_id)
            opportunity = Opportunity.objects.get(pk=opp)
            if opportunity:
                if view_by == 'stage':
                    opportunity.column_id = column.id
                    if column.probability:
                        opportunity.probability = column.probability
                elif view_by == 'lost_reason':
                    opportunity.lostreason_id = int(column_id)
                elif view_by == 'lead_source':
                    opportunity.lead_source_id = int(column_id)
                elif view_by == 'creation_month':
                    month_year = column_id.split('_')
                    new_date = month_year[1]+'-' + month_year[0]+'-'+ opportunity.created_at.strftime("%d")
                    opportunity.created_at = datetime.strptime(new_date, '%Y-%m-%d')
                elif view_by == 'expected_closing':
                    month_year = column_id.split('_')
                    new_date = month_year[1]+'-' + month_year[0]+'-'+ opportunity.created_at.strftime("%d")
                    opportunity.expected_closing = datetime.strptime(new_date, '%Y-%m-%d')
                opportunity.order = index
                opportunity.sales_channel = column.sales_channel
                opportunity.save()
            data['status'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")


def updatecolumnorder(request):
    data ={'ststus':False}
    col_in_order = json.loads(request.POST['fields'])
    if len(col_in_order) > 0 :
        for col in  col_in_order:
            opp_entity = Column.objects.get(pk=col['column_id'])
            opp_entity.order = col['order']
            opp_entity.save()
        data['status'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")

def savecolumn(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    fields_data = {}
    fields_data['success'] = False
    json_data = json.loads(request.POST['fields'])
    fields_data = formatFields(json_data)
    sales_channel_id = int(fields_data['sales_channel_id'])
    if sales_channel_id and sales_channel_id > 0:
        sales_team_obj = SalesChannel.objects.get(pk=sales_channel_id, company_id=company_id)
        sales_team = sales_team_obj
        if sales_team:
            max_order = Column.objects.filter(company_id=company_id).aggregate(order=Max('order'))
            col_order = 0
            if max_order:
                col_order = max_order['order'] + 1
            column_obj = Column()
            column_obj.name = fields_data['column_name']
            column_obj.user = user_obj
            column_obj.company_id = company_id
            column_obj.probability = 10
            column_obj.order = col_order
            column_obj.sales_channel = sales_team
            column_obj.save()
            fields_data['success'] = True
            fields_data['column_data'] = {
                "columnName": column_obj.name,
                "columntype": column_obj.is_default,
                "id": column_obj.id,
                "companyId": column_obj.company_id,
                "pipelineStaus": column_obj.pipeline_status,
                "probability": column_obj.probability,
                "probabilityStaus": column_obj.probability_status,
                "userId": column_obj.user_id,
                "opportunity": [],
            }
    return HttpResponse(json.dumps(fields_data), content_type="application/json")


def formatFields(json_data):

    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields


def saveOpportunty(request):
    company_id = request.user.profile.company
    user_obj = request.user
    user_id = user_obj.id
    fields_data = {}
    fields_data['success'] = False

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    fields_data = json.loads(request.POST['fields'])
    if 'sales_channel_id' in fields_data and fields_data['sales_channel_id'] != "" and fields_data['sales_channel_id'] is not None:
        column = first_column_by_sales_channel(request, fields_data['sales_channel_id'], fields_data['column_id'])

        if column is not None:
            opportunity_obj = Opportunity()
            fields_data['probability1'] = column.probability
            opportunity_obj.sales_channel = column.sales_channel
            opportunity_obj.column = column
            opportunity_obj.name = fields_data['name']
            opportunity_obj.user_id = user_id
            opportunity_obj.company = company_id
            opportunity_obj.order = 0

            if 'estimated_revenue' in fields_data and fields_data['estimated_revenue'] != "" and fields_data[
                'estimated_revenue'] is not None:
                opportunity_obj.estimated_revenue = fields_data['estimated_revenue']

            if 'probability' in fields_data and fields_data['probability'] != "" and fields_data['probability'] is not None:
                opportunity_obj.probability = fields_data['probability']
            else:
                opportunity_obj.probability = fields_data['probability1']

            if 'customer_id' in fields_data and fields_data['customer_id'] != "" and fields_data['customer_id'] is not None:
                opportunity_obj.customer_id = fields_data['customer_id']

            if 'expected_closing' in fields_data and fields_data['expected_closing'] != "" and fields_data[
                'expected_closing'] is not None:
                opportunity_obj.expected_closing = datetime.strptime(fields_data['expected_closing'], "%Y-%m-%d")

            if 'lead_source' in fields_data and fields_data['lead_source'] != "" and fields_data['lead_source'] is not None:
                opportunity_obj.lead_source_id = fields_data['lead_source']

            if 'sales-person' not in fields_data:
                opportunity_obj.sales_person_id = user_id

            elif 'sales-person' in fields_data and fields_data['sales-person'] != "" and fields_data[
                'sales-person'] is not None:
                opportunity_obj.sales_person_id = int(fields_data['sales-person'])

            if 'card_color' in fields_data and fields_data['card_color'] != "" :
                opportunity_obj.card_color = 'card-'+fields_data['card_color']
            else:
                opportunity_obj.card_color = 'card-white'


            if 'ratings' in fields_data and fields_data['ratings'] != "":
                opportunity_obj.rating = fields_data['ratings']
            if 'customtags' in fields_data and fields_data['customtags'] != "" and fields_data['customtags'] is not None:
                if len(fields_data['customtags']) > 0:
                    tags = []
                    for tag in fields_data['customtags']:
                        tags.append(tag['id'])
                    opportunity_obj.tags = tags

            if 'internalnotes' in fields_data and fields_data['internalnotes'] is not None:
                opportunity_obj.internal_notes = fields_data['internalnotes']

            opportunity_obj.save()
            saved_oppotunity_id = opportunity_obj.id
            fields_data['id'] = saved_oppotunity_id
            message = 'Opportunity ' + "\"" + opportunity_obj.name + "\"" + ' has been created by ' + request.user.get_full_name()
            action_dic = {'company_id': company_id.id, 'message': message, 'module_name':'opportunity','module_object': opportunity_obj, 'user': request.user, 'module_id': 2}
            message_create_for_create_action(action_dic)
            fields_data['success'] = True

    return HttpResponse(json.dumps(fields_data), content_type="application/json")

def getcolumnsofuser(user_obj, company_id, roles, sales_channel_id):
    column = Column.objects.all().filter(company=company_id, is_active=True)
    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in roles:
        if sales_channel_id is not None:
            column = column.filter(is_undefined=False)
        else:
            column = column.filter(is_undefined=False)
    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in roles:
        if sales_channel_id is not None:
            column = column.filter(is_undefined=False)
        else:
            column = column.filter(is_undefined=False)
    column = column.values('id', 'name', 'probability', 'is_active').order_by('order')
    return column


def updateopportunitycolor(request):
    data = {'success':False}
    json_data = json.loads(request.POST['fields'])
    opportunity = Opportunity.objects.get(pk=json_data['opportunity_id'])
    opportunity.card_color = json_data['card_color']
    opportunity.save()
    data['success'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")

def updateopportunityrating(request):
    data = {}
    data['success'] = False
    json_data = json.loads(request.POST['fields'])
    opportunity = Opportunity.objects.get(pk=json_data['opportunity_id'])
    opportunity.rating = json_data['card_rating']
    opportunity.save()
    data['success'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")

@csrf_exempt
def updateopportunitystatus(request):
    data = {'success':False}
    json_data = json.loads(request.POST['post_fields'])
    opportunity_id = int(json_data['opportunity_id'])
    card_action = str(json_data['card_action'])
    if opportunity_id > 0:
        opportunity = Opportunity.objects.get(pk=opportunity_id)
        if card_action == 'archive' and opportunity:
            opportunity.is_active = False
            opportunity.save()
            data['success'] = True
        elif card_action == 'unarchive' and opportunity:
            opportunity.is_active = True
            opportunity.save()
            data['success'] = True
        elif card_action == 'delete' and opportunity:
            opportunity.delete()
            data['success'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")


@csrf_exempt
def delete_opportunity(request):
    data = {}
    data['success'] = False
    if request.method == "POST" and request.is_ajax():
        opp_id = request.POST.get("opp_id")
        try:
            opp = Opportunity.objects.get(pk=int(opp_id))
            opp.delete()
            data['success'] = True
        except Opportunity.DoesNotExist:
            print("Opportunity.DoesNotExist")
    return HttpResponse(json.dumps(data), content_type="application/json")


def updatecolumnfold(request):
    data = {"success":False}
    json_data = json.loads(request.POST['fields'])
    try:
        column = Column.objects.get(pk=json_data['column_id'])
        column.is_fold = json_data['fold']
        column.save()
        data['success'] = True
    except Column.DoesNotExist:
        data['success'] = False
    return HttpResponse(json.dumps(data), content_type="application/json")

def updatecolumnstatus(request):
    data = {}
    data['success'] = False
    json_data = json.loads(request.POST['fields'])
    company_id = request.user.profile.company_id
    if json_data['status'] == 0:
        try:
            column = Column.objects.get(pk=json_data['column_id'])
            column.status = json_data['status']
            column.save()
            IsUndefined_col_id = Column.objects.values_list('id', flat=True).filter(company=company_id, is_undefined=True, sales_channel=column.sales_channel)[0]
            opportunity = Opportunity.objects.filter(column=json_data['column_id'], company=company_id).update(column_id=IsUndefined_col_id, sales_channel=IsUndefined_col_id.sales_channel)
            try:
                opportunity = Opportunity.objects.filter(column=json_data['column_id'], company=company_id).update(column_id=IsUndefined_col_id,sales_channel=IsUndefined_col_id.sales_channel)
            except Opportunity.DoesNotExist:
                data['success'] = True

            column = Column.objects.get(pk=IsUndefined_col_id)
            column.status = 1
            column.save()

            data['success'] = True
        except Column.DoesNotExist:
            data['success'] = False

    elif json_data['status'] == 'delete':
        column = Column.objects.get(pk=json_data['column_id'], company=company_id)
        if column:
            opportunity = Opportunity.objects.filter(column=column, company=company_id)
            if opportunity:
                undefined_col = Column.objects.get(company=company_id, is_undefined=True, sales_channel=column.sales_channel)
                if undefined_col:
                    opportunity.update(column=undefined_col, sales_channel=undefined_col.sales_channel)
            if not column.is_default:
                column.delete()
            data['success'] = True
        else:
            data['success'] = False
    return HttpResponse(json.dumps(data), content_type="application/json")


def updatecolumnarchive(request):
    company_id = request.user.profile.company_id
    data = {'success': False, 'opp_list': []}
    if 'fields' in request.POST:
        json_data = json.loads(request.POST['fields'])
        if json_data['status'] == 'archive':
            ids = json_data['op_id_list']
            op_id_list = ids.split(',')
            if len(op_id_list) > 0:
                Opportunity.objects.filter(pk__in=op_id_list, company_id=company_id).update(is_active=False)
                data['success'] = True
            else:
                data['success'] = False
        elif json_data['status'] == 'unarchive':
            opportunities = Opportunity.objects.filter(column_id=json_data['column_id'], company_id=company_id)
            if opportunities:
                opportunities.update(is_active=True)
                data['success'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")


def adddata(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}
    prob = ""
    currency_name = request.user.profile.company.currency
    if currency_name == 'euro':
        data['currency'] = '€'
    else:
        data['currency'] = '$'

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"


    data['json_users'] = getCompanyUser(company_id)
    if "ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY" in roles or "ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY" in roles:
        data['json_users'] = [{'id': user_id, 'name': user_obj.username}]
    data['fields'] = None  # contact field
    data['json_contacts'] = None  # company contact list
    data['json_teams'] = None
    data['currentsalesperson'] = user_obj.username
    data['salesperson'] = user_id
    data['default_sales_channel_id'] = None
    data['default_sales_channel_name'] = None
    data['default_column_id']= None

    sales_channel_list = users_opp_channels(request)

    if request.user.profile.default_sales_channel:
        data['default_sales_channel_id'] = request.user.profile.default_sales_channel.id
        data['default_sales_channel_name'] = request.user.profile.default_sales_channel.name
    else:
        data['default_sales_channel_id'] = sales_channel_list[0]['id']
        data['default_sales_channel_name'] = sales_channel_list[0]['name']

    if len(sales_channel_list) > 0:
        data['json_teams'] = sales_channel_list

    lead_Qset = OpportunityLeadsource.objects.filter(company=company_id)
    lead_list = []
    for lead_obj in lead_Qset:
        lead_list.append({'id': lead_obj.id,
                          'name': lead_obj.name,

                          })
    if len(lead_list) > 0:
        data['json_lead'] = lead_list
        data['currentleadlource'] = lead_obj.name

    return HttpResponse(json.dumps(data), content_type="application/json")


def getCompanyUser(company_id):
    users_data = []
    users_obj = Profile.objects.filter(company_id=company_id)
    for o in users_obj:
        users_data.append({'id': o.user.id,
                           'name': o.user.username,
                           'sales_person_profile_image':o.profile_image})
    return users_data




@login_required(login_url="/login/")
def editdata(request, edit_id):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}
    currency_name = request.user.profile.company.currency
    if currency_name == 'euro':
        data['currency'] = '€'
    else:
        data['currency'] = '$'

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    if 'current_sales_team' in request.session:
        sales_channel_id = request.session['current_sales_team']
    else:
        sales_channel_id = None

    if getOpFields(request, edit_id) is not None:
        data['opportunity'] = getOpFields(request, edit_id)


    data['json_users'] = getCompanyUser(company_id)

    if "ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY" in roles or "ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY" in roles:
        data['json_users'] = [{'id': user_id, 'name': user_obj.username}]

    data['json_contacts'] = None
    data['json_teams'] = None
    data['salesperson'] = user_id
    op_attachment = getOpAttachment(edit_id)
    if len(op_attachment) > 0:
        data['op_attachment'] = op_attachment

    selected_tag = []
    if data['opportunity']['tags'] is not None:
        tags = ContactTags.objects.filter(pk__in=data['opportunity']['tags'])
        if tags:
            for tag in tags:
                selected_tag.append({'id': tag.id, 'name': tag.name, 'color': tag.color})
    data['opportunity']['currenttags'] = selected_tag

    for user in data['json_users']:
        if user['id'] == data['opportunity']['salesperson']:
            data['opportunity']['currentsalesperson'] = user['name']

    sales_team_list = users_opp_channels(request)
    if len(sales_team_list) > 0:
        data['json_teams'] = sales_team_list

    status_lost_reason = getLostReason(company_id)
    if status_lost_reason is not None:
        data['json_lostreson'] = status_lost_reason

    if data['opportunity']['lostReasonId'] != '' and len(data['json_lostreson']) > 0:
        for lost_reason in data['json_lostreson']:
            if lost_reason['id'] == data['opportunity']['lostReasonId']:
                data['opportunity']['currentLostReason'] = lost_reason['name']
    columns = Column.objects.filter(sales_channel_id=data['opportunity']['sales_channel_id'], company=company_id, is_undefined=False)
    column_list = []
    if columns:
        for column_obj in columns:
            column_list.append({'id': column_obj.id, 'columnName': column_obj.name, 'columnType': column_obj.is_active})
        data['columns'] = column_list

    data['roles'] = roles
    data['oppotunity_id'] = edit_id

    return HttpResponse(json.dumps(data), content_type="application/json")

@login_required(login_url="/login/")
def editsave(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    fields_data = {}
    fields_data['success'] = False

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    fields_data = json.loads(request.POST['fields'])
    # fields_data = formatFields(json_data)
    try:
        opportunity_obj = Opportunity.objects.get(id=fields_data['edit_id'])
        opportunity_obj.name = fields_data['name']
        opportunity_obj.estimated_revenue = fields_data['estimated_revenue']
        opportunity_obj.probability = fields_data['probability']

        if 'customer_id' in fields_data and fields_data['customer_id'] != "" and fields_data['customer_id'] is not None:
            opportunity_obj.customer_id = fields_data['customer_id']

        if fields_data['expected_closing'] == '':
            opportunity_obj.expected_closing = None
        else:
            opportunity_obj.expected_closing = datetime.strptime(fields_data['expected_closing'], "%Y-%m-%d")

        if fields_data['ratings'] == '':
            opportunity_obj.rating = None
        else:
            opportunity_obj.rating = fields_data['ratings']

        opportunity_obj.lead_source_id = fields_data['lead_source_id']

        if fields_data['sales_person']:
            opportunity_obj.sales_person_id = int(fields_data['sales_person'])
        else:
            opportunity_obj.sales_person_id = None

        if fields_data['sales_channel_id']:
            column = first_column_by_sales_channel(request, int(fields_data['sales_channel_id']), column_id=None)
            opportunity_obj.sales_channel = column.sales_channel
            opportunity_obj.column = column

        if 'customtags' in fields_data and fields_data['customtags'] != "" and fields_data['customtags'] is not None:
            if len(fields_data['customtags']) > 0:
                tags = []
                for tag in fields_data['customtags']:
                    tags.append(tag['id'])
                opportunity_obj.tags = tags

        if 'lost_reson_id' in fields_data:
            opportunity_obj.status = 0
            opportunity_obj.op_status = 'lost'
            if fields_data['lost_reson_id'] != '':
                opportunity_obj.lostreason_id = int(fields_data['lost_reson_id'])

        opportunity_obj.internal_notes = fields_data['internal_notes']
        opportunity_obj.save()

        fields_data['success'] = True

    except Opportunity.DoesNotExist:
        fields_data['success'] = False

    return HttpResponse(json.dumps(fields_data), content_type="application/json")

def getOpFields(request, edit_id):
    try:
        op = Opportunity.objects.get(pk=edit_id)
        print("oppp", op.customer)
        lead_source_id = None
        lead_source_name = None
        customer_id = None
        customer_uuid = None
        customer_name = None
        customer_email = None
        customer_phone = None
        sales_channel_name = None
        sales_person_name = None
        sales_person_profile_image = None
        editable = False
        if op.customer:
            customer_id = op.customer.id
            customer_uuid = str(op.customer.uuid)
            customer_name = op.customer.name
            customer_email = op.customer.email
            customer_phone = op.customer.phone

        if op.lead_source_id is not None and op.lead_source_id != '' and op.lead_source_id > 0:
            lead_source_id = op.lead_source_id
            lead_source_name = op.lead_source.name

        if op.sales_channel_id:
            sales_channel_name = op.sales_channel.name

        if op.sales_person_id:
            sales_person_name =op.sales_person.get_full_name()
            sales_person_profile_image = op.sales_person.profile.profile_image

        if not op.is_won and not op.is_lost and op.is_open:
            status   = 'open'
        elif not op.is_won and op.is_lost and not op.is_open:
            status = 'lost'
        elif op.is_won and not op.is_lost and not op.is_open:
            status = 'won'
        if 'ROLE_MANAGE_ALL_OPPORTUNITY' in request.user.profile.roles:
            editable = True
        elif ('ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in request.user.profile.roles or 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in request.user.profile.roles) and request.user.id == op.user_id:
            editable = True

        opp_fields = {'id': op.id,
                      'columnId': op.column_id,
                      'orderId': op.order,
                      'userId': op.user_id,
                      'companyId': op.company_id,
                      'name': op.name,
                      'cardcolor': op.card_color,
                      'estimatedRevenue': float(op.estimated_revenue),
                      'probability': op.probability,
                      'customer_id': customer_id,
                      'customer_uuid':customer_uuid,
                      'customer_name': customer_name,
                      'customerEmails': customer_email,
                      'customerPhone': customer_phone,
                      'expectedClosing': str(op.expected_closing),
                      'lead_source_name': lead_source_name,
                      'lead_source_id': lead_source_id,
                      'salesperson': op.sales_person_id,
                      'sales_person_profile_image':sales_person_profile_image,
                      'sales_channel_id': op.sales_channel_id,
                      'sales_channel_name': sales_channel_name,
                      'sales_person_name':sales_person_name,
                      'ratings': op.rating,
                      'tags': op.tags,
                      'status': op.is_active,
                      'is_won': op.is_won,
                      'is_lost':op.is_lost,
                      'is_open': op.is_open,
                      'op_status':status,
                      'lostReasonId': op.lostreason_id,
                      'internal_notes': op.internal_notes,
                      'editable':editable
                      }
        return opp_fields

    except Opportunity.DoesNotExist:
        return None

def getLostReason(company_id):
    reason_list = []
    try:
        lost_reasons = Lostreason.objects.filter(company_id=company_id)
        if lost_reasons.exists():
            for ls in lost_reasons:
                reason_list.append({'id': ls.id, 'name': ls.reason})
        return reason_list
    except Lostreason.DoesNotExist:
        return reason_list





@login_required(login_url="/login/")
def viewdata(request, view_id):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}
    currency_name = request.user.profile.company.currency
    if currency_name == 'euro':
        data['currency'] = '€'
    else:
        data['currency'] = '$'

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    if 'current_sales_team' in request.session:
        sales_channel_id = request.session['current_sales_team']
    else:
        sales_channel_id = None

    if getOpFields(request, view_id) is not None:
        data['opportunity'] = getOpFields(request, view_id)


    data['quotation_data'] = getquatationData(view_id)
    data['total_quotation_data'] = len(getquatationData(view_id))
    data['json_users'] = getCompanyUser(company_id)

    if 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in roles:
        data['json_users'] = [{'id': user_id, 'name': user_obj.username, 'sales_person_profile_image':user_obj.profile.profile_image}]

    data['json_contacts'] = None
    data['json_teams'] = None
    data['salesperson'] = user_id

    op_attachment = getOpAttachment(view_id)

    if len(op_attachment) > 0:
        data['op_attachment'] = op_attachment

    selected_tag = []
    if data['opportunity']['tags'] is not None:
        tags = ContactTags.objects.filter(pk__in=data['opportunity']['tags'])
        if tags:
            for tag in tags:
                selected_tag.append({'id': tag.id, 'name': tag.name, 'color': tag.color})
    data['opportunity']['currenttags'] = selected_tag

    lead_Qset = OpportunityLeadsource.objects.all()
    lead_list = []

    for lead_obj in lead_Qset:
        lead_list.append({'id': lead_obj.id,
                          'name': lead_obj.name,
                          })

    # list of all opportunity for next pre view
    op_id_list = getOpIdList(request, company_id, user_id, roles, sales_channel_id)
    if len(op_id_list) > 0:
        data['op_id_list'] = op_id_list

    selected_lead = []

    for user in data['json_users']:
        if user['id'] == data['opportunity']['salesperson']:
            data['opportunity']['ƒ'] = user['name']
            data['opportunity']['sales_person_profile_image'] = user['sales_person_profile_image']

    sales_team_list = users_opp_channels(request)
    if len(sales_team_list) > 0:
        data['json_teams'] = sales_team_list

    status_lost_reason = getLostReason(company_id)
    if status_lost_reason is not None:
        data['json_lostreson'] = status_lost_reason

    if data['opportunity']['lostReasonId'] != '' and len(data['json_lostreson']) > 0:
        for lost_reason in data['json_lostreson']:
            if lost_reason['id'] == data['opportunity']['lostReasonId']:
                data['opportunity']['currentLostReason'] = lost_reason['name']

    columns = Column.objects.filter(sales_channel_id=data['opportunity']['sales_channel_id'], company=company_id, is_undefined=False)
    column_list = []
    if columns:
        for column_obj in columns:
            column_list.append({'id': column_obj.id, 'columnName': column_obj.name, 'columnType': column_obj.is_active})
        data['columns'] = column_list


    data['roles'] = roles
    data['oppotunity_id'] = view_id

    data['next'] = None
    data['prev'] = None

    prev = (Opportunity.objects
            .filter(id__lt=view_id)
            .exclude(id=view_id)
            .order_by('-id')
            .first()
            )
    next = (Opportunity.objects
            .filter(id__gt=view_id)
            .exclude(id=view_id)
            .order_by('id')
            .first())
    if prev:
        data['prev'] = prev.id
    if next:
        data['next'] = next.id

    return HttpResponse(json.dumps(data), content_type="application/json")

def getquatationData(view_id):
    quatation_list = []
    quatation_objs = Sale_order.objects.filter(opportunity_id=view_id)
    for quatation in quatation_objs:
        quatation_list.append({'id': quatation.id})

    return quatation_list

def getOpIdList(request, company_id, user_id, roles, sales_channel_id):
    op_id_list = []
    op_objs = Opportunity.objects.filter(is_active=True).order_by('id')

    if sales_channel_id is not None:
        op_objs = op_objs.filter(sales_channel_id=sales_channel_id)

    if 'ROLE_MANAGE_ALL_OPPORTUNITY' in roles or 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY' in roles:
        op_objs = op_objs.filter(company=company_id)

    elif 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' in roles:
        op_objs = op_objs.filter(sales_person_id=user_id)

    for op in op_objs:
        op_id_list.append({'id': op.id})

    return op_id_list

def updateopportunitylostreason(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}
    data['success'] = False
    requestData = json.loads(request.POST['fields'])
    op_id = requestData["opportunity_id"]
    lost_id = requestData["lost_id"]
    action = requestData["action"]

    try:
        opportunity_obj = Opportunity.objects.get(id=op_id, company_id= company_id)
        if action == 'lost' and lost_id:
            opportunity_obj.is_won = False
            opportunity_obj.is_open = False
            opportunity_obj.is_lost = True
            opportunity_obj.lostreason_id = lost_id
            opportunity_obj.save()
        else:
            if action == 'won':
                opportunity_obj.is_open = False
                opportunity_obj.is_lost = False
                opportunity_obj.is_won = True
                opportunity_obj.lostreason_id = None
                opportunity_obj.save()

        data['success'] = True

    except Opportunity.DoesNotExist:
        print("this opportuntiy doesn't exist")
        data['success'] = False

    return HttpResponse(json.dumps(data), content_type="application/json")


# its return lost reason data on lost_reason edit request
def getLostreasonByid(request, lr_id):
    data = {}
    data['success'] = False

    try:
        lost_reason = Lostreason.objects.get(id=lr_id)
        if lost_reason is not None:
            data['id'] = lost_reason.id
            data['lostname'] = lost_reason.reason
            data['success'] = True

    except Lostreason.DoesNotExist:
        print("lost reason  doesn't exist")
    return HttpResponse(json.dumps(data), content_type="application/json")

def addlostreason(request):
    company_id = request.user.profile.company_id
    data = {'success': False, 'result': []}
    data['success'] = False
    requestData = json.loads(request.POST['fields'])
    data_fields = requestData
    if data_fields['selected_id'] != '' and int(data_fields['selected_id']) > 0:
        lost_reason_obj = Lostreason.objects.get(id=data_fields['selected_id'])
    else:
        lost_reason_obj = Lostreason()

    if lost_reason_obj is not None:
        lost_reason_obj.reason = data_fields['name']
        lost_reason_obj.company_id = company_id
        lost_reason_obj.save()
        data['id'] = lost_reason_obj.id
        data['name'] = data_fields['name']
        data['success'] = True

    return HttpResponse(json.dumps(data), content_type="application/json")

def addTags(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    data = {}
    data['success'] = False
    tag_name = request.POST['tag_name']

    new_tags_obj = ContactTags(name=tag_name, user=user_obj, company_id=company_id)
    new_tags_obj.save()

    tags_Qset = ContactTags.objects.all()
    tag_list = []

    for tags_obj in tags_Qset:
        tag_list.append({'id': tags_obj.id,
                         'name': tags_obj.name,
                         'color': tags_obj.color,
                         })

    if len(tag_list) > 0:
        data['json_tags'] = tag_list

    data['tag_id'] = new_tags_obj.id
    data['tag_name'] = tag_name
    data['success'] = True

    return HttpResponse(json.dumps(data), content_type="application/json")

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

def editcolumn(request, col_id):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}
    column_data = {}

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    column = Column.objects.get(pk=col_id)

    if column is not None:
        column_data['columnName'] = column.name

        column_data['id'] = column.id
        column_data['companyId'] = column.company_id
        column_data['pipelineStaus'] = column.pipeline_status
        column_data['probability'] = column.probability
        column_data['probabilityStaus'] = column.probability_status
        column_data['teamId'] = column.sales_channel_id
        column_data['userId'] = column.user_id
    sales_team_list = users_opp_channels(request)
    data['column'] = column_data

    if len(sales_team_list) > 0:
        data['json_teams'] = sales_team_list

    return HttpResponse(json.dumps(data), content_type="application/json")

def updatecolumn(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}
    fields_data = {}

    data['success'] = False

    json_data = json.loads(request.POST['fields'])
    fields_data = formatFields(json_data)

    try:
        column = Column.objects.get(pk=fields_data['column_id'])
        column.name = fields_data['name']
        #column.sales_channel_id = fields_data['team']
        if 'pipeline_staus' in fields_data:
            column.pipeline_status = fields_data['pipeline_staus']
            if fields_data['pipeline_staus']:
                column.is_fold = False
        else:
            column.pipeline_status = False
        if 'probability_status' in fields_data:
            column.probability_status = fields_data['probability_status']
        else:
            column.probability_status = 0
        column.probability = fields_data['probability']
        opportunities = Opportunity.objects.filter(column_id=column.id, company_id=company_id)
        if opportunities:
            opportunities.update(probability=fields_data['probability'])
        column.save()
        data['success'] = True

    except Column.DoesNotExist:
        print('column object does not exist ')

    return HttpResponse(json.dumps(data), content_type="application/json")

def addteam(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    data['company_id'] = company_id
    data['user_id'] = user_id
    data['roles'] = roles

    data['json_users'] = getCompanyUser(company_id)

    return HttpResponse(json.dumps(data), content_type="application/json")


def getTeamData(request, team_id):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}
    users_data = []

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    data['company_id'] = company_id
    data['user_id'] = user_id
    data['roles'] = roles

    try:
        salesteam = SalesChannel.objects.get(pk=team_id)
        if salesteam is not None:
            data['id'] = salesteam.id
            data['teamName'] = salesteam.name
            data['TeamLeader'] = salesteam.team_leader_id
            data['UseInvoices'] = salesteam.use_invoices
            data['UseLeads'] = salesteam.use_leads
            data['UseQuotations'] = salesteam.use_quatations
            data['email'] = salesteam.email
        users_obj = Profile.objects.select_related('user').filter(user_id__in=salesteam.team_members, activation_key=None).filter(company_id=company_id)
        for sal in users_obj:
            users_data.append({'name': sal.user.username, 'id': sal.user_id})
    except SalesChannel.DoesNotExist:
        print('Sales team does not exist')

    data['json_users'] = getCompanyUser(company_id)
    data['teammember'] = users_data
    if data['TeamLeader'] != None:
        for user in data['json_users']:
            if data['TeamLeader'] == user['id']:
                data['TeamLeaderName'] = user['name']

    return HttpResponse(json.dumps(data), content_type="application/json")

def attachment(request):
    data = {}
    data['success'] = False

    if request.method == "POST":
        OpAttachentForm = OpAttachForm(request.POST, request.FILES)

        if OpAttachentForm.is_valid():
            op_attach_obj = Opattachment()
            op_attach_obj.opportunity_id = int(OpAttachentForm.cleaned_data["opportunity_id"])
            op_attach_obj.attched_file = OpAttachentForm.cleaned_data["attached_file"]
            op_attach_obj.save()

            if op_attach_obj.id is not None:
                data['file_name'] = os.path.basename(op_attach_obj.attched_file.name)
                data['attach_id'] = op_attach_obj.id
                data['success'] = True

    return HttpResponse(json.dumps(data), content_type="application/json")

def attachedfiledelete(request):
    data = {}
    data['success'] = False

    if request.method == "POST":
        file_id = json.loads(request.POST['id'])

        if file_id != '':
            attach_file_obj = Opattachment.objects.get(pk=int(file_id))

            if attach_file_obj.delete():
                data['success'] = True

    return HttpResponse(json.dumps(data), content_type="application/json")

def getOpAttachment(op_id):
    data = []

    attachment_obj_list = Opattachment.objects.filter(opportunity_id=op_id)

    if attachment_obj_list is not None:
        for attachment_obj in attachment_obj_list:
            data.append({'id': attachment_obj.id, 'name': os.path.basename(attachment_obj.attched_file.name)})

    return data


def getLeadsourceData(request, id):
    data = {}
    data['success'] = False
    leadsource_data = {}
    company_id = request.user.profile.company_id

    try:
        lead = OpportunityLeadsource.objects.get(id=int(id), company=company_id)

        leadsource_data['id'] = lead.id
        leadsource_data['name'] = lead.name

        data['success'] = True
        data['lead'] = leadsource_data

    except  OpportunityLeadsource.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type="application/json")

def getUserData(request, user_id):
    data = {}
    data['success'] = False
    user_data = {}

    try:
        user = User.objects.get(id=int(user_id))

        user_data['id'] = user.id
        user_data['name'] = user.username
        user_data['email'] = user.email
        try:
            user_extention = Profile.objects.get(user=user)
            user_data['phone'] = user_extention.phone
            user_data['mobile'] = user_extention.mobile
        except Profile.DoesNotExist:
            user_data['phone'] = ''
            user_data['mobile'] = ''

        data['success'] = True
        data['user'] = user_data

    except  User.DoesNotExist:
        pass

    return HttpResponse(json.dumps(data), content_type="application/json")

def saveUser(request):
    response = {}
    company_id = request.user.profile.company_id
    response['success'] = False
    roles = request.user.profile.roles
    data_fields = json.loads(request.POST['fields'])
    data_fields = formatFields(data_fields)

    try:
        if 'id' in data_fields and int(data_fields['id']) != 0:
            user = User.objects.get(id=int(data_fields['id']))
            user.username = data_fields['name']
            user.email = data_fields['email']
            user.save()

            profile = Profile.objects.get(user_id=int(data_fields['id']))
            profile.phone = data_fields['phone']
            profile.mobile = data_fields['mobile']
            profile.company_id = company_id
            profile.language = 'English'
            profile.roles = roles
            profile.save()
        else:
            user = User.objects.create_user(username=data_fields['name'], email=data_fields['email'])
            user.save()

            profile = Profile()
            profile.user = user
            profile.phone = data_fields['phone']
            profile.mobile = data_fields['mobile']
            profile.company_id = company_id
            profile.language = 'English'
            profile.roles = roles
            profile.save()

        response['success'] = True
        response['user'] = {'id': user.id, 'name': user.username}

    except User.DoesNotExist:
        print('user doest not filed')

    return HttpResponse(json.dumps(response), content_type="application/json")

def addLeadsource(request):
    response = {'success': False, 'result': [],'message':''}
    company_id = request.user.profile.company
    data_field = json.loads(request.POST['post_data'])
    try:
        if 'id' in data_field and int(data_field['id']) != 0:
            leadsource = OpportunityLeadsource.objects.get(id=int(data_field['id']))
            leadsource.company = company_id
            leadsource.name = data_field['name']
            leadsource.save()
        else:
            leadsource = OpportunityLeadsource()
            leadsource.name = data_field['name']
            leadsource.company = company_id
            leadsource.save()
        response['message'] = 'Lead Source Created!'
        response['success'] = True
        response['result'] = {'id': leadsource.id, 'name': leadsource.name}

    except OpportunityLeadsource.DoesNotExist:
        print('lead doest not filed')
    return HttpResponse(json.dumps(response), content_type="application/json")

def get_lead_source(request):
    return_status = {'success': False, 'result': []}
    user_company_id = request.user.profile.company_id
    lead_sources = OpportunityLeadsource.objects.filter(company_id=user_company_id)
    if request.method == "POST" and request.is_ajax():
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            lead_sources = lead_sources.filter(name__icontains=keyword)
    lead_sources = lead_sources.order_by('-id')[:10]
    if len(lead_sources) > 0:
        return_status['success'] = True
        for lead_source in lead_sources:
            temp_dic = {'id': lead_source.id, 'name': lead_source.name}
            return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')

def opportunityAction(request):
    response = {}
    response['success'] = False
    action = request.POST['action']
    id_list = json.loads(request.POST['ids'])

    if action == 'delete':
        result = Opportunity.objects.filter(id__in=id_list).delete()

        response['success'] = True

    return HttpResponse(json.dumps(response), content_type="application/json")

def addteamuser(request):
    company_id = request.user.profile.company_id
    user_obj = request.user
    user_id = user_obj.id
    data = {}

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    data['company_id'] = company_id
    data['user_id'] = user_id
    data['roles'] = roles

    data['json_users'] = getCompanyUserdata(company_id)
    return HttpResponse(json.dumps(data), content_type="application/json")

def getCompanyUserdata(company_id):
    users_data = []

    users_obj = Profile.objects.filter(company_id=company_id)

    for o in users_obj:
        users_data.append({'id': o.user.id,
                           'name': o.user.username,
                           'email': o.user.email,
                           'phone': o.phone})
    return users_data

def opportunityexport(request):
    export_status = {'success': False}
    id_list = json.loads(request.POST['ids'])
    list_dic = []
    if len(id_list) > 0:
        for i in id_list:
            opp_obj = Opportunity.objects.filter(pk=int(i))
            for o in opp_obj:
                if o.name is not None and o.name != '':
                    name = o.name
                else:
                    name = '-'

                if o.created_at is not None and o.created_at != '':
                    created_at = o.created_at.strftime('%d-%m-%Y')
                else:
                    created_at = '-'
                if o.estimated_revenue is not None and o.estimated_revenue != '':
                    estimated_revenue = float(o.estimated_revenue)
                else:
                    estimated_revenue = '-'
                if o.column_id is not None and o.column_id != '':
                    column = Column.objects.get(pk=o.column_id)
                    stage = column.name
                else:
                    stage = '-'

                if o.sales_channel_id is not None and o.sales_channel_id != '':
                    salesteam_dict = SalesChannel.objects.get(id=o.sales_channel_id)
                    sales_channel_id = salesteam_dict.name
                else:
                    sales_channel_id = '-'

                if o.sales_person is not None and o.sales_person != '':
                    sp_user = User.objects.get(id=o.sales_person)
                    sales_person = sp_user.username
                else:
                    sales_person = '-'
                list_dic.append({
                    'Created Date': created_at,
                    'Opportunity Name': name,
                    'Stage': stage,
                    'Estimated Revenue': float(estimated_revenue),
                    'Sales Team': sales_channel_id,
                    'Sales Person': sales_person,

                })

    if list_dic:
        to_csv = list_dic
        keys1 = to_csv[0].keys()
        keys = (['Created Date', 'Opportunity Name', 'Stage', 'Estimated Revenue', 'Sales Team', 'Sales Person'])
        file_path = 'media/user_csv/' + str(request.user.id)
        file_name = time.strftime("%Y%m%d-%H%M%S") + '.csv'
        if not os.path.exists(file_path):
            os.makedirs(file_path)
        uploaded_file_url = file_path + '/' + file_name
        with open(uploaded_file_url, 'w', encoding="latin-1", newline='') as fp:
            dict_writer = csv.DictWriter(fp, keys)
            dict_writer.writeheader()
            for dic in list_dic:
                keys, values = zip(*dic.items())
                dict_writer.writerow(dict(zip(keys, values)))
        export_status = {'success': True, 'file': uploaded_file_url}
    return HttpResponse(json.dumps(export_status), content_type="application/json")


def get_lost_reason(request):
    data = {'success': False, 'result': []}
    company_id = request.user.profile.company_id
    status_lost_reason = getLostReason(company_id)
    if status_lost_reason is not None:
        data['success'] = True
        data['result'] = status_lost_reason
    return HttpResponse(json.dumps(data), content_type="application/json")

def get_sales_team(request):
    company_id = request.user.profile.company_id
    return_status = {'success': False, 'result': []}
    #sales_channel = SalesChannel.objects.filter(company_id=company_id)
    sales_channel = users_opp_channels(request)
    if request.method == "POST" and request.is_ajax():
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
            filter(lambda sales_channel: sales_channel['name'] == keyword, sales_channel)
            #sales_channel = sales_channel.filter(name__icontains=keyword)
    #sales_channel = sales_channel.order_by('-id')[:10]
    if len(sales_channel) > 0:
        return_status['success'] = True
        for channel in sales_channel:
            temp_dic = {'id': channel['id'], 'name': channel['name']}
            return_status['result'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')

def get_sales_person(request):
    return_status = {'success': False, 'result': []}
    user_company_id = request.user.profile.company_id
    users = getCompanyUser(user_company_id)
    if len(users) > 0:
        return_status['success']=True
        return_status['result'] = users
    return HttpResponse(json.dumps(return_status), content_type='application/json')

def first_column_by_sales_channel(request, sales_channel_id, column_id=None):
    company_id = request.user.profile.company_id
    column = None
    if sales_channel_id:
        if column_id:
            column = Column.objects.get(pk=column_id, sales_channel_id=sales_channel_id,company=company_id, is_undefined=False)
        else:
            column = Column.objects.filter(sales_channel_id=sales_channel_id, company=company_id, is_undefined=False).order_by('order')[0]
    return column

