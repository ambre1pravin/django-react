from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from django.contrib.postgres.fields import ArrayField


class ContactTab(models.Model):
    id = models.AutoField(primary_key=True)
    module_id = models.IntegerField(blank=True, null=True)
    user = models.ForeignKey(User,db_index=True, on_delete=models.CASCADE,)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    fields =ArrayField(ArrayField(models.IntegerField()))
    display_weight = models.IntegerField(blank=True, null=True)
    is_default = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)


    def __unicode__(self):
        return self.name

    class Meta:
        db_table = 'next_crm_contact_tabs'
