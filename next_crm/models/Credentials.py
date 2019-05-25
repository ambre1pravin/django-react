from django.db import models
from django.contrib.auth.models import User
from oauth2client.contrib.django_util.models import CredentialsField


class Credentials(models.Model):
    id = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    credential = CredentialsField()

    def __unicode__(self):
        return self
