from django.db import models
from next_crm.models.common.messages import Messages


class MessageAttatchments (models.Model):
    id = models.AutoField(primary_key=True)
    message = models.ForeignKey(Messages, on_delete=models.CASCADE, db_index=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_path = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)

    def cascade_delete(self):
        super(Messages, self).delete()

    class Meta:
        app_label = 'next_crm'
