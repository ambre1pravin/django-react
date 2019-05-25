from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import HttpResponse,HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from next_crm.models.calendar.meetings import Meetings
from next_crm.models.calendar.attendies import Attendies
from next_crm.models.calendar.calendar_tags import CalendarTags
from next_crm.models import Contact
import json, ast
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from next_crm.management.commands.google_api import save_event_to_google,delete_google_event


@login_required(login_url="/login/")
def list(request, url=None):
    print(url)
    return render(request, 'web/app.html')

@login_required(login_url="/login/")
@csrf_exempt
def event_save(request):
    user = User.objects.get(id=request.user.id)
    company_id = request.user.profile.company_id
    meeting_return = {'success':False,'msg':''}
    if request.method == "POST" and request.is_ajax():
        if 'event' in request.POST:
            google_event_update = False
            event_dic = json.loads(request.POST['event'])
            if 'event_id' in event_dic and event_dic['event_id']:
                event_id = event_dic['event_id']
                google_event_update  = True
            else:
                event_id = None

            start_time = datetime.strptime(event_dic['start_time'], "%Y-%m-%d %H:%M:%S")
            end_time = datetime.strptime(event_dic['end_time'], "%Y-%m-%d %H:%M:%S")
            meeting_data = {
                    'user':user,
                    'event_id':event_id,
                    'event': event_dic['event'],
                    'start_time': start_time,
                    'end_time': end_time,
                    'all_day':event_dic['all_day'],
                    'priority_level': event_dic['priority_level'],
                    'meeting_type': event_dic['meeting_type'],
                    'company_id':company_id,
                    'tags':event_dic['selected_tags'],
                    'attendies': event_dic['attendies'],
                    'location':None
            }

            meeting = save_in_db(meeting_data)
            if meeting :
                meeting_return = {'success': True, 'meeting': meeting.id, 'event': meeting.event, 'msg': 'Meeting saved!!'}
                if google_event_update:
                    google_event = save_event_to_google(meeting, user, google_event_update)
                if user.profile.google_client_id and user.profile.google_client_secret:
                    google_event = save_event_to_google(meeting,  user, google_event_update)
                    if google_event:
                        meeting.google_event_id =google_event.get('id')
                        meeting.save()

    else:
        status = "Bad"
    return HttpResponse(json.dumps(meeting_return), content_type='application/json')


@login_required(login_url="/login/")
@csrf_exempt
def get_all_meetings(request):
    meeting_return = {'success': False, 'result': [],'syncronize_button':False}
    user_company_id = request.user.profile.company_id
    select_fav_ids = json.loads(request.POST['select_fav_ids'])
    names = json.loads(request.POST['names'])
    post_attendies = json.loads(request.POST['attendies'])
    post_tags = json.loads(request.POST['tags'])
    select_fav_ids.append(request.user.id)
    meetings_list = []
    search_tag_list = []
    search_attendies_list =[]
    if request.user.profile.google_client_id and request.user.profile.google_client_secret and request.user.profile.user_time_zone:
        meeting_return['syncronize_button'] = True
    try:

        if len(post_tags) > 0:
            search_tags = CalendarTags.objects.select_related('tag').filter(company=user_company_id)
            search_tags = search_tags.filter(tag__name__in=post_tags)
            if search_tags:
                for t in search_tags:
                    search_tag_list.append(t.event_id)

        if len(post_attendies) > 0:
            search_attendies = Attendies.objects.select_related('contact').filter(company=user_company_id)
            search_attendies = search_attendies.filter(contact__name__in=post_attendies)
            if search_attendies:
                for t in search_attendies:
                    search_attendies_list.append(t.event_id)


        meetings = Meetings.objects.select_related('user').all().filter(company=user_company_id)
        if 'ROLE_VIEW_OWN_MANAGE_OWN_CALENDAR' in request.user.profile.roles:
             meetings = meetings.filter(user_id = request.user.id)

        if len(select_fav_ids) > 0:
            meetings = meetings.filter(user__in=select_fav_ids)

        if len(names) > 0:
            meetings = meetings.filter(event__in=names)
        if len(search_tag_list) > 0:
            meetings = meetings.filter(id__in=search_tag_list)
        if len(search_attendies_list) > 0:
            meetings = meetings.filter(id__in=search_attendies_list)
        meetings = meetings.order_by('-start_time')



        if meetings:
            for m in meetings:

                attendies_image = []
                tags_lists =[]
                attendies = Attendies.objects.select_related('contact').filter(event_id=m.pk)
                if len(attendies) > 0 :
                    for attendie in attendies:
                        attendies_image.append({'id':attendie.contact.id,
                                                'name':attendie.contact.name,
                                                'color':attendie.contact.profile_image
                                                })
                tags = CalendarTags.objects.select_related('tag').filter(event_id=m.pk)
                if len(tags) > 0 :
                    for tag in tags:
                        tags_lists.append({'id':tag.tag.id,
                                            'name':tag.tag.name,
                                            'color':tag.tag.color
                                        })

                if m.all_day:
                    start = '{0:%Y-%m-%d}'.format(m.start_time)
                    end = '{0:%Y-%m-%d}'.format(m.end_time)
                else:
                    start =  str(m.start_time)
                    end =  str(m.end_time)

                meeting_data = {
                    'id': m.pk,
                    'user': m.user_id,
                    'title': m.event,
                    'start': start,
                    'end': end,
                    'location':m.location,
                    'all_day': m.all_day,
                    'attendees': attendies_image,
                    'tags':tags_lists,
                    'color':m.user.profile.color,
                    'borderColor':'red'
                }
                meetings_list.append(meeting_data)
            meeting_return['result'] = meetings_list
            meeting_return['success'] = True
    except Meetings.DoesNotExist:
            print("Meeting Does not Exists")
    return HttpResponse(json.dumps(meeting_return), content_type='application/json')


def save_in_db(data):
    try:
        if data['event_id']:
            meetings = Meetings.objects.get(id= data['event_id'])
            user_id  = meetings.user_id
        else:
            meetings = Meetings.objects.get(user_id=data['user'], event=data['event'], start_time=data['start_time'],
                                            end_time=data['end_time'], all_day=data['all_day'])
            user_id = data['user']
        meetings.user_id = user_id
        meetings.event = data['event']
        meetings.start_time = data['start_time']
        meetings.end_time = data['end_time']
        meetings.all_day = data['all_day']
        meetings.priority_level = data['priority_level']
        meetings.meeting_type = data['meeting_type']
        meetings.tags = data['tags']
        meetings.company_id = data['company_id']
        meetings.location = data['location']
        meetings.save()
    except Meetings.DoesNotExist:
        meetings = Meetings(user=data['user'],
                            event=data['event'],
                            start_time=data['start_time'],
                            end_time=data['end_time'],
                            all_day=data['all_day'],
                            priority_level = data['priority_level'],
                            meeting_type = data['meeting_type'],
                            tags = data['tags'],
                            company_id=data['company_id'],
                            location = data['location']
                          )
        meetings.save()
    if len(data['attendies']) > 0:
        in_db_list = []
        post_attendie =[]
        attendies_in_db = Attendies.objects.filter(event=meetings)
        if attendies_in_db:
            for attendie in attendies_in_db:
                in_db_list.append(attendie.contact_id)

        for attendie in data['attendies']:
            post_attendie.append(int(attendie['id']))

        for attendie in data['attendies']:
            save_attendie_in_db(data['company_id'], meetings, attendie['id'])

    if len(data['tags']) >0:
        for tag in data['tags']:
            save_tag_in_db(data['company_id'], meetings,tag['id'])
            print((meetings,tag['id']))
    return meetings


def save_attendie_in_db(company_id, event, contact_id):
    try:
        attendie = Attendies.objects.get(event=event, contact_id=contact_id)
        attendie.event = event
        attendie.contact_id = contact_id
        attendie.company_id = company_id
        attendie.save()
    except Attendies.DoesNotExist:
        attendie = Attendies(event=event, contact_id=contact_id, company_id= company_id)
        attendie.save()
    return attendie


def save_tag_in_db(company_id, event,tag_id):
    try:
        tag = CalendarTags.objects.get(event=event,tag_id=tag_id)
        tag.event = event
        tag.tag_id = tag_id
        tag.company_id = company_id
        tag.save()
    except CalendarTags.DoesNotExist:
        tag = CalendarTags(event=event, tag_id=tag_id, company_id=company_id)
        tag.save()
    return tag


def get_attendies(request):
    user_company_id = request.user.profile.company_id
    return_status = {'success': False, 'attendies_list': []}
    contacts = Contact.objects.filter(user_company_id=user_company_id)[:7]
    if len(contacts) > 0:
            return_status['success'] = True
            for contact in contacts:
                temp_dic = {'id':contact.id, 'name':contact.name,'color':contact.profile_image}
                return_status['attendies_list'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')



def search_attendies(request):
    return_status = {'success': False, 'attendies_list': []}
    user_company_id = request.user.profile.company_id
    keyword = None
    if request.method == "POST" and request.is_ajax():
        if 'keyword' in request.POST:
            keyword = request.POST['keyword']
    if keyword:

        contacts = Contact.objects.filter(user_company_id=user_company_id).filter(name__icontains=keyword)

        if len(contacts) > 0:
            return_status['success'] = True
            for contact in contacts:
                temp_dic = {'id':contact.id, 'name':contact.name,'color':contact.profile_image}
                return_status['attendies_list'].append(temp_dic)
    return HttpResponse(json.dumps(return_status), content_type='application/json')


@login_required(login_url="/login/")
def get_favorite(request):
    user_company_id = request.user.profile.company_id
    favorite_list=[]
    users = User.objects.filter(profile__company_id=user_company_id, is_active=True)
    if 'ROLE_VIEW_OWN_MANAGE_OWN_CALENDAR' in request.user.profile.roles:
        users = users.filter(id = request.user.id)
    users = users.order_by('-id')
    users = users[:10]
    for user in users:
        if user.is_staff:
            user_type = 'staff'
        else:
            user_type = 'admin'

        if user.id == request.user.id:
            logged_in_user = True
            user_name = user.email + ' [ ME ] '
        else:
            logged_in_user = False
            user_name = user.email
        temp_dic = {'id': user.id, 'color':user.profile.color, 'user_type':user_type, 'logged_in_user':logged_in_user, 'name': user_name , 'profile_image': '/static/front/images/avtar1.png'}
        favorite_list.append(temp_dic)
    return HttpResponse(json.dumps(favorite_list), content_type='application/json')


@login_required(login_url="/login/")
@csrf_exempt
def delete_event(request):
    company_id = request.user.profile.company_id
    meeting_return = {'success':False,'msg':''}
    if request.method == "POST" and request.is_ajax():
        if 'event' in request.POST:
            event_id = json.loads(request.POST['event'])
            meeting = Meetings.objects.get(pk=event_id, company_id=company_id)
            if 'ROLE_VIEW_OWN_MANAGE_OWN_CALENDAR' in request.user.profile.roles or meeting.user_id==request.user.id:
                   meeting.delete()
                   meeting_return ={'success':True, 'msg':'Meeting Deleted!!'}
                   if meeting.google_event_id:
                        delete_google_event(request.user,meeting.google_event_id)
            else:
                meeting_return = {'success': True, 'msg': 'You are not authorized.'}
    else:
        status = "Bad"
    return HttpResponse(json.dumps(meeting_return), content_type='application/json')