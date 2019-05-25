from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company


class Meetings (models.Model):

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, db_index=True,on_delete=models.CASCADE)
    event = models.CharField(max_length=255)
    start_time = models.DateTimeField(auto_now_add = False)
    end_time = models.DateTimeField(auto_now = False)
    all_day = models.BooleanField(default=False)
    location = models.TextField(max_length=255,blank=True, null=True)
    priority_level = models.IntegerField(blank=True, null=True)
    meeting_type = models.IntegerField(blank=True, null=True)
    tags = models.TextField(blank=True, null=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    google_event_id = models.TextField(max_length=255, blank=True, null=True)


    def __unicode__(self):
        return self.name

    def cascade_delete(self):
        super(Meetings, self).delete()

    class Meta:
        app_label = 'next_crm'

