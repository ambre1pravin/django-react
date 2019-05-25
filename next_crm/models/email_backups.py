from django.db import models

class EmailBackups(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.CharField(max_length=50, blank=False, null=False)

    class Meta:
        db_table = 'next_crm_email_backup'