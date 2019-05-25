from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.stripe import Stripe

class StripeInvoice(models.Model):
    stripe = models.ForeignKey(Stripe, on_delete=models.CASCADE, db_index=True)
    invoice_id = models.TextField(max_length=255, blank=False, null=False)
    customer_id = models.TextField(max_length=255, blank=False, null=False)
    amount_paid = models.DecimalField(blank=False,default=0.00, max_digits=10, decimal_places=2)
    tax = models.DecimalField(default=0.00, max_digits=10, decimal_places=2, null=True)
    tax_percent = models.DecimalField(default=0.00, max_digits=10, decimal_places=2, null=True)
    charge_id = models.TextField(max_length=255, blank=False, null=False)
    date_time = models.TextField(max_length=255, blank=False, null=False)
    invoice_number = models.TextField(max_length=255, blank=False, null=False)
    currency = models.TextField(max_length=10, blank=False, null=False)
    description = models.TextField(max_length=255, blank=True, null=True)
    items = models.TextField(blank=True, null=True)
    discount = models.DecimalField(blank=True,default=0.00, max_digits=10, decimal_places=2)
    invoice_pdf= models.TextField(max_length=255, blank=False, null=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    user = models.ForeignKey(User, db_index=True, on_delete=models.CASCADE, )
    date = models.DateTimeField()

    def cascade_delete(self):
        super(Stripe, self).delete()

    class Meta:
        db_table = 'next_crm_stripe_invoice'