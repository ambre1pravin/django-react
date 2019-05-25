from django.shortcuts import render
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
import json
import os
from django.contrib.auth.models import User
from next_crm.models import Column, SalesChannel, SalesChannelUserMapping, Profile
from django.db.models import Q
from django.conf import settings

@login_required(login_url="/login/")

def list(request):
    if request.user.is_superuser or 'ROLE_MANAGE_ALL_OPPORTUNITY' in request.user.profile.roles:
        return render(request, 'web/app.html')
    else:
        return HttpResponseRedirect('/dashboard/')

@login_required(login_url="/login/")
def add(request):
    if request.user.is_superuser or 'ROLE_MANAGE_ALL_OPPORTUNITY' in request.user.profile.roles:
        return render(request, 'web/app.html')
    else:
        return HttpResponseRedirect('/dashboard/')

@login_required(login_url="/login/")
def edit(request, edit_id):
    if request.user.is_superuser or 'ROLE_MANAGE_ALL_OPPORTUNITY' in request.user.profile.roles:
        return render(request, 'web/app.html')
    else:
        return HttpResponseRedirect('/dashboard/')

@login_required(login_url="/login/")
def view(request, view_id):
    return render(request, 'web/app.html')

@login_required(login_url="/login/")
def listdata(request):
    data         = {'result':[],'success':False}
    sales_team_list = get_sales_team_by_user(request)
    if sales_team_list:
        data['result'] = sales_team_list
        data['success'] = True
    return HttpResponse(json.dumps(data), content_type="application/json")


@login_required(login_url="/login/")
def adddata(request):
    company_id  = request.user.profile.company_id
    user_obj    = request.user
    user_id     = user_obj.id
    data        = {}

    try:
        roles = request.user.profile.roles
    except Profile.DoesNotExist:
        roles = "ADMIN"

    data['company_id']         = company_id
    data['user_id']            = user_id
    data['roles']= roles

    data['json_users'] = getCompanyUser(company_id)
    return HttpResponse(json.dumps(data), content_type="application/json")



def saveteam(request):
    user_obj = request.user
    company_obj = request.user.profile.company
    data = {}
    data['success'] = False
    json_data = json.loads(request.POST['fields'])
    team_id = json_data['team_id'] if 'team_id' in json_data and json_data['team_id'] != '' else None
    if team_id is not None and int(team_id) > 0:
        salesteam = SalesChannel.objects.get(pk=int(team_id))
    else:
        salesteam = SalesChannel()
    salesteam.name = json_data['name']
    salesteam.created_by = user_obj
    salesteam.use_opportunity = True
    salesteam.company = company_obj
    if 'sales_manager_id' in json_data and json_data['sales_manager_id'] != '':
        salesteam.team_leader_id = json_data['sales_manager_id']
    salesteam.save()
    if salesteam.id > 0:
        if len(json_data['team_member']) > 0:
            channel_mapping = SalesChannelUserMapping.objects.filter(sales_channel_id=salesteam.id)
            if channel_mapping:
                channel_mapping.delete()
            for team in json_data['team_member']:
                user_id = team["id"]
                profile = Profile.objects.get(user_id=user_id)
                if 'is_default' in team and team['is_default']:
                    if profile.default_sales_channel !=salesteam:
                        profile.default_sales_channel = salesteam
                        profile.save()
                else:
                    try:
                        mapping = SalesChannelUserMapping.objects.get(sales_channel_id=salesteam.id, user_id=user_id)
                        mapping.sales_channel_id = salesteam.id
                        mapping.user_id = user_id
                        mapping.save()
                    except SalesChannelUserMapping.DoesNotExist:
                        obj = SalesChannelUserMapping(sales_channel_id=salesteam.id, user_id = user_id)
                        obj.save()
                    if profile.default_sales_channel == salesteam:
                        default_channel = get_company_default_channel(company_obj.id)
                        profile.default_sales_channel = default_channel
                        profile.save()

        else:
            if salesteam.id:
                channel_user_mapping = SalesChannelUserMapping()
                channel_user_mapping.user_id = user_obj.id
                channel_user_mapping.sales_channel_id = salesteam.id
                channel_user_mapping.is_default = True
                channel_user_mapping.save()
        assign_default_column(request, salesteam)
        #assign_default_channel_if_user_not_assign(request)

    data['id'] = salesteam.id
    data['name'] = json_data['name']
    data['success'] = True

    return HttpResponse(json.dumps(data), content_type="application/json")






def get_sales_team_by_user(request):
    user_obj = request.user
    company_id = request.user.profile.company_id
    user_default_channel = request.user.profile.default_sales_channel
    sales_team_list =[]
    if request.user.is_superuser or 'ROLE_MANAGE_ALL_OPPORTUNITY' in request.user.profile.roles:
        sales_teams = SalesChannel.objects.filter(company_id=company_id)
        if sales_teams:
            for team in sales_teams:
                team_leader = None
                if team.team_leader:
                    team_leader = team.team_leader.email
                sales_team_list.append({'id': team.id, 'is_default': False, 'is_channel_default':team.is_default,'name': team.name,'item_selected':False, 'selected': False, 'team_leader':team_leader})
    else:
        sales_teams = SalesChannelUserMapping.objects.select_related('sales_channel').filter(sales_channel__company_id=company_id)
        sales_teams = sales_teams.filter(user_id=user_obj.id)
        if sales_teams:
            for team in sales_teams:
                team_leader = None
                if team.sales_channel.team_leader:
                    team_leader = team.sales_channel.team_leader.email
                sales_team_list.append({'id': team.sales_channel_id, 'is_channel_default':team.sales_channel.is_default,'is_default':False, 'name': team.sales_channel.name,'item_selected':False,'selected':False,'team_leader':team_leader})

    if user_default_channel:
        if len(sales_team_list) > 0:
            for list in sales_team_list:
                if list['id'] !=user_default_channel.id:
                    sales_team_list.append({'id': user_default_channel.id, 'is_channel_default': True,
                                            'is_default': True, 'name': user_default_channel.name, 'item_selected': True,
                                            'selected': True, 'team_leader': ''})
    sales_team_list.sort(key=lambda item: item['name'], reverse=False)
    return sales_team_list

def users_opp_channels(request):
    user_obj = request.user
    company_id = request.user.profile.company_id
    user_default_channel = request.user.profile.default_sales_channel
    sales_team_list =[]
    if request.user.is_superuser :
        sales_teams = SalesChannel.objects.filter(company_id=company_id)
        if sales_teams:
            for team in sales_teams:
                team_leader = None
                if team.team_leader:
                    team_leader = team.team_leader.email
                sales_team_list.append({'id': team.id, 'is_default': False, 'is_channel_default':team.is_default,'name': team.name,'item_selected':False, 'selected': False, 'team_leader':team_leader})
    else:
        sales_teams = SalesChannelUserMapping.objects.select_related('sales_channel').filter(sales_channel__company_id=company_id)
        sales_teams = sales_teams.filter(user_id=user_obj.id)
        if sales_teams:
            for team in sales_teams:
                team_leader = None
                if team.sales_channel.team_leader:
                    team_leader = team.sales_channel.team_leader.email
                sales_team_list.append({'id': team.sales_channel_id, 'is_channel_default':team.sales_channel.is_default,'is_default':False, 'name': team.sales_channel.name,'item_selected':False,'selected':False,'team_leader':team_leader})

    if user_default_channel:
        sales_team_list.append({'id': user_default_channel.id, 'is_channel_default': True,
                                'is_default': True, 'name': user_default_channel.name, 'item_selected': True,
                                'selected': True, 'team_leader': ''})
    opp_channel_list= []
    if len(sales_team_list) > 0:
        for index, channel in enumerate(sales_team_list):
            if channel['id'] != user_default_channel.id:
                opp_channel_list.append(sales_team_list[index])
    if user_default_channel:
        opp_channel_list.append({'id': user_default_channel.id, 'is_channel_default': True,
                                'is_default': True, 'name': user_default_channel.name, 'item_selected': True,
                                'selected': True, 'team_leader': ''})
    opp_channel_list.sort(key=lambda item: item['name'], reverse=False)
    return opp_channel_list


def get_company_default_channel(company_id):
    try:
        sales_channel = SalesChannel.objects.get(company_id=company_id, is_default=True)
        return sales_channel
    except (SalesChannel.DoesNotExist):
        return None

def assign_default_channel_if_user_not_assign(request):
    company_id = request.user.profile.company_id
    all_company_user = Profile.objects.select_related('user', 'company').filter(company_id=company_id)
    if all_company_user:
        for user in all_company_user:
            try:
                mapping = SalesChannelUserMapping.objects.select_related('sales_channel').get(sales_channel__is_default=True, user_id=user.id)
                if not mapping.is_default:
                    mapping.is_default = True
                    mapping.save()
            except (SalesChannelUserMapping.DoesNotExist):
                pass
        return True
    else:
        return False



def assign_default_column(request, sales_channel):
    user_obj = request.user
    company_id = request.user.profile.company_id
    columns = Column.objects.filter(company_id=company_id, sales_channel=sales_channel)
    if columns.count() == 0:
        new_column = [
            {'name': 'New',  'is_undefined': False, 'is_active': True, 'order': 0},
            {'name': 'Qualification', 'is_undefined': False, 'is_active': True, 'order': 1},
            {'name': 'Proposition',  'is_undefined': False, 'is_active': True, 'order': 2},
            {'name': 'Undefined',  'is_undefined': True, 'is_active': True, 'order': 3},
        ]
        for column_dict in new_column:
            column_obj = Column()
            column_obj.name = column_dict['name']
            column_obj.user = user_obj
            column_obj.order = column_dict['order']
            column_obj.company_id=company_id
            column_obj.is_default = True
            column_obj.is_won = column_dict['is_won']
            column_obj.is_undefined = column_dict['is_undefined']
            column_obj.is_active = column_dict['is_active']
            column_obj.sales_channel = sales_channel
            column_obj.save()

def add_default_sales_channel_on_signup(request):
    user_obj = request.user
    company_id = request.user.profile.company_id
    if user_obj and company_id:
        salesteam_obj = SalesChannel()
        salesteam_obj.name = 'Default channel'
        salesteam_obj.company_id = company_id
        salesteam_obj.team_leader = user_obj
        salesteam_obj.created_by = user_obj
        salesteam_obj.is_default = True
        salesteam_obj.save()
        if salesteam_obj:
            channel_user_mapping = SalesChannelUserMapping()
            channel_user_mapping.user_id = user_obj.id
            channel_user_mapping.sales_channel_id = salesteam_obj.id
            channel_user_mapping.is_default = True
            channel_user_mapping.save()
        assign_default_column(request, salesteam_obj)
        return salesteam_obj
    else:
        return False

def getCompanyUser(company_id):
    users_data = []
    users_obj = Profile.objects.select_related('user', 'company').filter(company_id=company_id)
    for o in users_obj:
        if o.user.first_name and o.user.last_name:
            name = o.user.first_name + ' ' + o.user.last_name
        else:
            name = o.user.email
        if o.phone:
            phone = o.phone
        elif o.mobile:
            phone = o.mobile
        else:
            phone = 'N/A'

        users_data.append({
                'id':o.user.id,
                'name':o.user.get_full_name(),
                'email':o.user.email,
                'phone':phone,
                'profile_image':o.profile_image,
                'language':o.language,
                'default_channel':o.default_sales_channel.id,
                'default_channel_name': o.default_sales_channel.name

        })

    return users_data



def editdata(request, edit_id):
    company_id  = request.user.profile.company_id
    data = {}
    data['success'] = False
    sales_team = {}
    assigned_team_member = []
    default_member = []
    team_member_list = []
    data['json_users'] = []
    channel_user_list = []

    try:
        sales_ch_obj = SalesChannel.objects.get(id=int(edit_id))
        sales_team['id'] = sales_ch_obj.id
        sales_team['name'] = sales_ch_obj.name
        team_leader_id = sales_ch_obj.team_leader_id
        sales_team['team_leader_id']= sales_ch_obj.team_leader_id
        try:
            user_extention = User.objects.get(id = team_leader_id)
            sales_team['team_leader_name'] = user_extention.email
        except User.DoesNotExist:
            sales_team['username'] = ''

        users_obj = SalesChannelUserMapping.objects.select_related('user').filter(sales_channel_id=int(edit_id))
        company_users = Profile.objects.select_related('user', 'company').filter(company_id=company_id)
        if len(users_obj) > 0:
            for sal in users_obj:
                assigned_team_member.append(sal.user)
                channel_user_list.append(sal.user.id)
        if len(company_users) > 0:
            for index, profile_user in enumerate(company_users):
               is_assigned = False
               if profile_user.user.id in channel_user_list:
                   is_assigned = True
               temp_dic = {'id':profile_user.user.id,
                           'name':profile_user.user.username,
                           'email':profile_user.user.email,
                           'phone':profile_user.phone,
                           'profile_image':profile_user.profile_image,
                           'is_default':False,
                           'is_assigned':is_assigned,
                           'language':profile_user.language,
                           'default_channel':profile_user.default_sales_channel.id,
                           'default_channel_name':profile_user.default_sales_channel.name
                           }
               if profile_user.default_sales_channel ==  sales_ch_obj:
                   default_member.append(profile_user.user)
                   temp_dic['is_default'] = True
               data['json_users'].append(temp_dic)

        join_team_member = set([*assigned_team_member, *default_member])
        if len(join_team_member) > 0:
            for team in join_team_member:
                is_default = False
                if team.profile.default_sales_channel == sales_ch_obj:
                    is_default = True
                team_member_list.append({'name':team.username, 'id':team.id,'email':team.email,'profile_image': team.profile.profile_image, 'is_default':is_default,'language':team.profile.language})

        data['success'] = True
        data['team_member'] = team_member_list
        data['user'] = sales_team

    except  SalesChannel.DoesNotExist:
        pass
    return HttpResponse(json.dumps(data), content_type = "application/json")


def formatFields(json_data):
    fields = {}
    for json_obj in json_data:
        fields[json_obj["name"]] = json_obj["value"]

    return fields

def deletesales(request):
    company_id = request.user.profile.company_id
    data = {}
    data['success'] = False
    id_list  = json.loads(request.POST['ids'])
    if len(id_list) > 0:
        for i in id_list:
            try:
                quot_obj = SalesChannel.objects.get(pk=int(i))
                try:
                    user_profile = Profile.objects.filter(company_id=company_id, default_sales_channel=quot_obj)
                    if len(user_profile) > 0:
                        default_channel = get_company_default_channel(company_id)
                        if default_channel:
                            user_profile.update(default_sales_channel=default_channel)
                    quot_obj.delete()
                    data['success'] = True
                except Profile.DoesNotExist:
                    print("Default channel does not exits for this channel", quot_obj.name, quot_obj.id)
            except SalesChannel.DoesNotExist:
                print("channel does not exits", i)
    return HttpResponse(json.dumps(data), content_type= 'application/json')


