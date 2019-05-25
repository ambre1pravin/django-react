from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from django.contrib.postgres.fields import ArrayField
from next_crm.models.opportunity.sales_channel import SalesChannel
from django.conf import settings




class Profile(models.Model):
    user = models.OneToOneField(User, unique=True, related_name ='profile', on_delete=models.CASCADE)
    phone = models.TextField(max_length=50, blank=True)
    language = models.CharField(max_length=50, blank=True)
    is_super_admin = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    roles = ArrayField(ArrayField(models.CharField(max_length=255, blank=True)))
    activation_key = models.CharField(max_length=40, blank=True, null=True)
    mobile = models.TextField(max_length=50, blank=True)
    profile_image = models.TextField(max_length=50, blank=True, default=settings.DEFAULT_PROFILE_IMAGE)
    temp_pass = models.TextField(max_length=50, blank=True)
    signature = models.TextField(blank=True, null=True)
    color = models.TextField(max_length=10, blank=True, default='#DF2873')
    google_client_id = models.CharField(max_length=225, blank=True, null=True)
    google_client_secret = models.CharField(max_length=225, blank=True, null=True)
    user_time_zone = models.CharField(max_length=225, blank=True, null=True)
    default_sales_channel = models.ForeignKey(SalesChannel, on_delete=models.CASCADE, db_index=True, blank=True, null=True)

    def cascade_delete(self):
        super(Profile, self).delete()

