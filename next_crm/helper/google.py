import httplib2
from django.conf import settings
from googleapiclient.discovery import build
from next_crm.models import Credentials
from oauth2client.client import OAuth2Credentials
from oauth2client.contrib.django_util.storage import DjangoORMStorage
from oauth2client.client import AccessTokenRefreshError
from apiclient import errors
from apiclient import discovery


def get_user_credentials(client_service, client_id, client_secret):
    """Retrives the clients credentials from storage"""
    storage = DjangoORMStorage(Credentials, "id", client_service, "credential")
    local_credentials = storage.get()  # load the user's credentials from storage
    if local_credentials:
        credentials = OAuth2Credentials(access_token=local_credentials.access_token,
                                        client_id=client_id,
                                        client_secret=client_secret,
                                        refresh_token=local_credentials.refresh_token,
                                        token_expiry=local_credentials.token_expiry,
                                        token_uri=local_credentials.token_uri,
                                        user_agent=local_credentials.user_agent,
                                        scopes=settings.GOOGLE_OAUTH2_CLIENT['scope']
                                        )
        try:
            if credentials.access_token_expired:
                credentials.refresh(httplib2.Http())  # Refresh access token
                storage.put(credentials)
            return credentials
        except AccessTokenRefreshError:
            # The access token is stale. Should be storing the refresh tokens?
            return None
    else:
        return None

def get_user_info(credentials):

    """Send a request to the UserInfo API to retrieve the user's information.

    Args:
    credentials: oauth2client.client.OAuth2Credentials instance to authorize the
                 request.
    Returns:
    User information as a dict.
    """
    user_info_service = build(
        serviceName='oauth2', version='v2',
        http=credentials.authorize(httplib2.Http())
    )
    user_info = None
    try:
        user_info = user_info_service.userinfo().get().execute()
    except errors.HttpError:
        return None

    if user_info:
        return user_info

def get_service(user):
    google_client_id = user.profile.google_client_id
    google_client_secret = user.profile.google_client_secret
    user_time_zone = user.profile.user_time_zone
    if user.profile.google_client_id and user.profile.google_client_secret and user_time_zone:
        credential = get_user_credentials(user, google_client_id, google_client_secret)
        if credential:
            http = credential.authorize(httplib2.Http())
            service = discovery.build('calendar', 'v3', http=http)
            return service
        else:
            return None
    else:
        return None
