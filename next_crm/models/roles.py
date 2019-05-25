from django.db import models
from next_crm.models.modules import Modules



class Roles(models.Model):

    code = models.CharField(max_length=50, blank=True)
    label = models.TextField(max_length=500, blank=True)
    module = models.CharField(max_length=50, blank=False)


    def cascade_delete(self):
        super(Roles, self).delete()

    class Meta:
        app_label = 'next_crm'
