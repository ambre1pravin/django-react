from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company


class ContactTags(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    user = models.ForeignKey(User, blank=True, null=True,on_delete=models.CASCADE,)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    color = models.CharField(max_length=9, default='color-1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


    def __unicode__(self):
        return self.name

    class Meta:
        db_table = 'next_crm_contact_tags'
