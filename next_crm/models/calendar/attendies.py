from django.db import models
from django.contrib.auth.models import User
from next_crm.models.contact.contact import Contact
from next_crm.models.calendar.meetings import Meetings
from next_crm.models.company import Company


class Attendies (models.Model):

    id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Meetings, on_delete=models.CASCADE, db_index=True)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, db_index=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)


    def __unicode__(self):
        return self.id

    def cascade_delete(self):
        super(Attendies, self).delete()

    class Meta:
        app_label = 'next_crm'
        unique_together = ('event', 'contact')

