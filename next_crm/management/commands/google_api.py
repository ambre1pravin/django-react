from __future__ import print_function
from django.core.management.base import BaseCommand
import httplib2
import os
from apiclient import discovery
from oauth2client import client
from oauth2client import tools
from oauth2client.file import Storage
from django.conf import settings
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.contrib import xsrfutil
from oauth2client.contrib.django_util.storage import DjangoORMStorage
from django.contrib.auth.models import User
from next_crm.helper.google import get_user_credentials, get_service
import ast, base64, json

import datetime
from next_crm.models.calendar.meetings import Meetings
from next_crm.models.calendar.attendies import Attendies
from next_crm.models.calendar.calendar_tags import CalendarTags
from next_crm.models import Contact
import  pendulum
import pytz
from django.utils import timezone

flags = None

SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'
CLIENT_SECRET_FILE = 'client_secret.json'
APPLICATION_NAME = 'Google Calendar API Python Quickstart'

class Command(BaseCommand):
    def handle(self, *args, **options):
        #self.import_file()
        self.upload_event()

    def import_file(self):
        user_id = 1
        try:
            cs = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            cs = User.objects.create_user(username="test", email="test@gmail.com", password="test", is_superuser=True)

        flow = OAuth2WebServerFlow(client_id=settings.GOOGLE_OAUTH2_CLIENT_ID,
                                   client_secret=settings.GOOGLE_OAUTH2_CLIENT_SECRET,
                                   scope=settings.GOOGLE_OAUTH2_CLIENT['scope'],
                                   redirect_uri=settings.GOOGLE_OAUTH2_CLIENT['redirect_uri']
                                   )
        print(flow)

        flow.params['access_type'] = 'offline'
        flow.params['prompt'] = 'select_account consent'
        credential = get_user_credentials(cs)
        print("credential", credential)

        if credential is None or credential.invalid == True:
            # User not authenticated. Initiate the OAuth process
            security_token = xsrfutil.generate_token(settings.GOOGLE_OAUTH2_CLIENT_SECRET, user_id)
            decoded_token = security_token.decode('utf-8')
            state_data = {'security_token': decoded_token, 'user_id': user_id}
            state_data_json = json.dumps(state_data, ensure_ascii=False)
            flow.params["state"] = base64.b64encode(state_data_json.encode('utf-8'))
            authorize_url = flow.step1_get_authorize_url()

            #return HttpResponseRedirect(authorize_url)  # Go to Authorizing page
        else:
            #credentials = get_credentials()

            http = credential.authorize(httplib2.Http())
            service = discovery.build('calendar', 'v3', http=http)

            now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
            print('Getting the upcoming 10 events')
            eventsResult = service.events().list(
                calendarId='primary', timeMin=now, maxResults=10, singleEvents=True,
                orderBy='startTime').execute()
            events = eventsResult.get('items', [])

            if not events:
                print('No upcoming events found.')
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                print(start, event['summary'])


    def upload_event(self):
        user_id = 11
        user = User.objects.get(pk=user_id)
        print(user.id)
        if user.profile.google_client_id and user.profile.google_client_secret:
            meetings = Meetings.objects.all().filter(user_id=user.id)
            if meetings:
                for meeting in meetings:
                    save_event_to_google(meeting, user)



def save_event_to_google(meeting_obj, user, update_event=False):
    print(meeting_obj, user, update_event)
    user_time_zone = user.profile.user_time_zone
    service = get_service(user)
    if service:
        try:
            meeting = Meetings.objects.get(pk=meeting_obj.id)
            start_time = pendulum.create(meeting.start_time.year, meeting.start_time.month, meeting.start_time.day,
                                         meeting.start_time.hour, meeting.start_time.minute, meeting.start_time.second,tz=user_time_zone)
            end_time = pendulum.create(meeting.end_time.year, meeting.end_time.month,
                                       meeting.end_time.day, meeting.end_time.hour,
                                       meeting.end_time.minute, meeting.end_time.second, tz=user_time_zone)
            event = {'summary': meeting.event,
                     'location': meeting.location,
                     'description': meeting.event,
                     'start': {'dateTime': str(start_time), 'timeZone': user_time_zone},
                     'end': {'dateTime': str(end_time), 'timeZone': user_time_zone},
                     'attendees': [],
                     'reminders': {'useDefault': False,
                                   'overrides': [{'method': 'email', 'minutes': 24 * 60},
                                                 {'method': 'popup', 'minutes': 10},
                                                 ]
                                   }
                     }
            attendies = Attendies.objects.select_related('contact').filter(event_id=meeting.id)
            if len(attendies) > 0:
                for attendie in attendies:
                    if attendie.contact.email:
                        event['attendees'].append({'email': attendie.contact.email})
            if update_event:
                updated_event = service.events().update(calendarId='primary', eventId=meeting_obj.google_event_id, body=event).execute()
                return updated_event
            else:
                event = service.events().insert(calendarId='primary', body=event).execute()
                #print('Event created: %s' % (event.get('htmlLink')))
                return event
        except Meetings.DoesNotExist:
            print("Meetings.DoesNotExist")
    else:
        print("credential does not exits")

def delete_google_event(user, event_id):
    service = get_service(user)
    service.events().delete(calendarId='primary', eventId=event_id).execute()

