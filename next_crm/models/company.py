from django.db import models
from django.contrib.auth.models import User
from next_crm.models.countries import Countries

class Company(models.Model):
    TRIAL = 'trial'
    PROSPECTS = 'prospects'
    CLIENT = 'client'
    USER_TYPE = (
        (TRIAL, 'trial'),
        (PROSPECTS, 'prospects'),
        (CLIENT, 'client'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company = models.CharField(max_length=30, blank=True)
    company_status = models.CharField(max_length=10, choices=USER_TYPE, default=TRIAL)
    email = models.TextField(max_length=255, blank=False, null=False)
    phone = models.TextField(max_length=30, blank=True)
    mobile = models.TextField(max_length=30, blank=True)
    language = models.CharField(max_length=30, blank=True)
    currency = models.CharField(max_length=30, blank=True)
    street = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=30, blank=True)
    zip = models.CharField(max_length=30, blank=True)
    country = models.ForeignKey(Countries, on_delete=models.CASCADE, null=True, related_name='country')
    billing_company_name = models.CharField(max_length=30, blank=True)
    billing_street = models.CharField(max_length=30, blank=True)
    billing_city = models.CharField(max_length=30, blank=True)
    billing_zip = models.CharField(max_length=30, blank=True)
    billing_country = models.ForeignKey(Countries, on_delete=models.CASCADE, null=True, related_name='billing_country')
    quotation_term_and_condition = models.TextField(blank=True, null=True)
    sales_term_and_condition = models.TextField(blank=True, null=True)
    invoice_term_and_condition = models.TextField(blank=True, null=True)
    quotation_legacy_information = models.TextField(blank=True, null=True)
    profile_image = models.TextField(max_length=50, blank=True,null=True)
    timezone = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def cascade_delete(self):
        self.user.delete()
        super(Company, self).delete()