import uuid
from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from django.conf import settings
from django.contrib.postgres.fields import ArrayField


class Contact (models.Model):

    INDIVIDUAL = 'I'
    COMPANY = 'C'
    CONTACT_TYPE = (
        (INDIVIDUAL, 'Individual'),
        (COMPANY, 'Company'),
    )

    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    parent = models.ForeignKey('self',blank=True, null=True, related_name='children', on_delete=models.CASCADE)
    company = models.ForeignKey('self',blank=True, null=True,  related_name='+', on_delete=models.CASCADE, )
    user = models.ForeignKey(User,db_index=True, on_delete=models.CASCADE,)
    user_company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    name = models.TextField(blank=False, null=False)
    first_name = models.TextField(max_length=255, blank=True, null=True)
    last_name = models.TextField(max_length=255, blank=True, null=True)
    contact_type = models.CharField(max_length=2, choices=CONTACT_TYPE, default=INDIVIDUAL)
    profile_image = models.CharField(max_length=255, blank=True, default=settings.DEFAULT_PROFILE_IMAGE)
    email = models.TextField(max_length=255, blank=True, null=True)
    phone = models.TextField(max_length=255, blank=True, null=True)
    mobile = models.TextField(max_length=255, blank=True, null=True)
    street = models.TextField(max_length=255, blank=True, null=True)
    street2 = models.TextField(max_length=255, blank=True, null=True)
    city = models.TextField(max_length=255, blank=True, null=True)
    zip = models.TextField(max_length=255, blank=True, null=True)
    country = models.TextField(max_length=255, blank=True, null=True)
    is_vendor = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=False)
    is_lead = models.BooleanField(default=False)
    tags = ArrayField(models.IntegerField(), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)

    def __unicode__(self):
        return self.name

    def get_contact_by_email(email, company_id):
        try:
            data = Contact.objects.filter(email=email, company_id=company_id).first()
        except Contact.DoesNotExist:
            data = None
        return data


    def cascade_delete(self):
        super(Contact, self).delete()

    class Meta:
        app_label = 'next_crm'

    def notify(self):
        print("suyash"+self.id)

