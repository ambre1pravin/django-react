from django.db import models
from django.contrib.auth.models import User


class Country(models.Model):


    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    company = models.IntegerField(null=True)



    def __unicode__(self):
        return self.name

    class Meta:
        app_label = 'next_crm'
