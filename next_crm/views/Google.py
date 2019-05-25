import ast, base64, json
from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from oauth2client.client import OAuth2WebServerFlow
from oauth2client.contrib import xsrfutil
from oauth2client.contrib.django_util.storage import DjangoORMStorage
from django.contrib.auth.models import User
from next_crm.helper.google import get_user_credentials
import httplib2
from apiclient import discovery
import datetime
from next_crm.views.Calender import save_in_db

from next_crm.models import Credentials
from django.contrib.auth.decorators import login_required


@login_required
def google_connect(request):
    user_id = request.user.id
    google_client_id = request.user.profile.google_client_id
    google_client_secret = request.user.profile.google_client_secret
    if google_client_id and google_client_secret:
        try:
            cs = User.objects.get(pk=user_id)
            flow = OAuth2WebServerFlow(client_id=google_client_id,
                                       client_secret=google_client_secret,
                                       scope = settings.GOOGLE_OAUTH2_CLIENT['scope'],
                                       redirect_uri = settings.GOOGLE_OAUTH2_CLIENT['redirect_uri']
                                       )
            flow.params['access_type'] = 'offline'
            flow.params['prompt'] = 'select_account consent'
            credential = get_user_credentials(cs, google_client_id, google_client_secret)
            if credential is None or credential.invalid == True:
                # User not authenticated. Initiate the OAuth process
                security_token = xsrfutil.generate_token(google_client_secret, user_id)
                decoded_token = security_token.decode('utf-8')
                state_data = {'security_token': decoded_token, 'user_id': user_id}
                state_data_json = json.dumps(state_data,ensure_ascii = False)
                flow.params["state"] = base64.b64encode(state_data_json.encode('utf-8'))
                authorize_url = flow.step1_get_authorize_url()
                return HttpResponseRedirect(authorize_url)  # Go to Authorizing page
            else:
                # fetch events
                http = credential.authorize(httplib2.Http())
                service = discovery.build('calendar', 'v3', http=http)
                now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
                eventsResult = service.events().list(
                    calendarId='primary', timeMin=now, maxResults=10, singleEvents=True,
                orderBy='startTime').execute()
                events = eventsResult.get('items', [])
                if events:
                    for event in events:
                        print("test", event)
                        location = None
                        if 'location' in event:
                            location = event['location']
                        meeting_data = {
                            'user': request.user,
                            'event_id': None,
                            'event': event['summary'],
                            'start_time': event['start']['dateTime'][:19],
                            'end_time': event['end']['dateTime'][:19],
                            'all_day': False,
                            'priority_level': 1,
                            'meeting_type': 1,
                            'company_id': request.user.profile.company_id,
                            'tags': [],
                            'attendies': [],
                            'location':location
                        }
                        meeting = save_in_db(meeting_data)
                return HttpResponseRedirect('/calender/list/')
        except User.DoesNotExist:
            print("DoesNotExist")
    else:
        print('google client_id does not exits ')


def oauth2callback(request):
    google_client_id = request.user.profile.google_client_id
    google_client_secret = request.user.profile.google_client_secret
    request_get = request.GET
    state = request_get.get('state', '')
    flow = OAuth2WebServerFlow(client_id=google_client_id,
                               client_secret=google_client_secret,
                               scope=settings.GOOGLE_OAUTH2_CLIENT['scope'],
                               redirect_uri=settings.GOOGLE_OAUTH2_CLIENT['redirect_uri']
                               )
    credential = flow.step2_exchange(request_get)
    state_data = ast.literal_eval(json.loads(json.dumps(base64.b64decode(state).decode('utf-8'))))
    user_id = state_data['user_id']
    client_service = User.objects.get(pk=user_id)
    storage = DjangoORMStorage(Credentials, "id", client_service, "credential")
    storage.put(credential)  # Store the token with reference to this user
    return HttpResponseRedirect('/calender/list/')

@login_required
def google_sync(request):
    return_status = {'success': False, 'syncronized': False}
    if request.user.profile.google_client_id and request.user.profile.google_client_secret and request.user.profile.user_time_zone:
        return_status['syncronized'] = True
    return HttpResponse(json.dumps(return_status), content_type='application/json')
