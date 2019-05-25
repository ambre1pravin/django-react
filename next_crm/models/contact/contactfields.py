from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from django.contrib.postgres.fields import ArrayField


class ContactFields(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User,db_index=True,on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=255, blank=True)
    label = models.CharField(max_length=255)
    is_default = models.BooleanField(default=True)
    is_required = models.BooleanField(default=True)
    display_weight = models.IntegerField(blank=True,null=True)
    display_position = models.CharField(max_length=255)
    is_unused = models.BooleanField(default=True)
    default_values = ArrayField(models.CharField(max_length=200), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)



    class Meta:
        db_table = 'next_crm_contact_fields'
