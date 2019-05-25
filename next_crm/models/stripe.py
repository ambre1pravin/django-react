from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company

class Stripe(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, db_index=True)
    token = models.TextField(max_length=255, blank=False, null=False)
    customer_id = models.TextField(max_length=255, blank=False, null=False)
    subscription_id = models.TextField(max_length=255, blank=False, null=False)
    plan = models.TextField(max_length=255, blank=False, null=False, default='monthly')
    amount = models.DecimalField(blank=False,default=0.00, max_digits=10, decimal_places=2)
    discount = models.IntegerField(blank=False, default=0)
    selected_users = models.IntegerField(blank=False, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField('date_published', auto_now=True)


    def cascade_delete(self):
        super(Stripe, self).delete()

    def save_update_stripe(user_id, company_id, token, customer_id, plan, amount, total_users, subscription_id):
        try:
            stripe_payments = Stripe.objects.get(company_id=company_id)
            stripe_payments.token = token
            stripe_payments.customer_id = customer_id
            stripe_payments.plan = plan
            stripe_payments.amount = amount
            stripe_payments.selected_users = total_users
            stripe_payments.subscription_id = subscription_id
            stripe_payments.save()
        except Stripe.DoesNotExist:
            stripe_payments = Stripe.objects.create(user_id=user_id, company_id=company_id,
                                                    token=token,
                                                    customer_id=customer_id, plan=plan,
                                                    amount=amount, subscription_id=subscription_id,
                                                    selected_users=total_users)
        return stripe_payments

    class Meta:
        db_table = 'next_crm_stripe_payments'