from django.db import models
from next_crm.models.contact.contact import Contact
from next_crm.models.common.messages import Messages


class MessageContactMap(models.Model):
    id = models.AutoField(primary_key=True)
    message = models.ForeignKey(Messages, on_delete=models.CASCADE, db_index=True)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, db_index=True, blank=False, null=False)

    def cascade_delete(self):
        super(MessageContactMap, self).delete()

    class Meta:
        db_table = 'next_crm_message_contact_map'