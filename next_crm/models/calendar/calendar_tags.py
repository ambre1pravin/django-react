from django.db import models
from django.contrib.auth.models import User
from next_crm.models.contact.contact_tags import ContactTags
from next_crm.models.calendar.meetings import Meetings
from next_crm.models.company import Company


class CalendarTags (models.Model):

    id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Meetings, on_delete=models.CASCADE, db_index=True)
    tag = models.ForeignKey(ContactTags, on_delete=models.CASCADE, db_index=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)

    def __unicode__(self):
        return self.id

    def cascade_delete(self):
        super(ContactTags, self).delete()

    class Meta:
        db_table = "next_crm_calendar_tags"
        unique_together = ('event', 'tag')

