from django.db import models
from next_crm.models.opportunity.opportunity import Opportunity
from django.conf import settings


class Opattachment(models.Model):
    id             = models.AutoField(primary_key=True)
    opportunity    = models.ForeignKey(Opportunity, on_delete=models.CASCADE, db_index=True )
    attched_file   = models.FileField(upload_to = 'media')


    def __unicode__(self):
        return self.opportunity_id

    class Meta:
        app_label = 'next_crm'

