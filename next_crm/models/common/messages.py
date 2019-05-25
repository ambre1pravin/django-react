from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.modules import Modules
from next_crm.models.contact.contact import Contact
from next_crm.models.opportunity.opportunity import Opportunity
from next_crm.models.sales_order.sale_order import Sale_order
from next_crm.models.sales_order.customer_invoice import Customer_invoice
from datetime import datetime
from django.utils import timezone
import math



class Messages (models.Model):
    id = models.AutoField(primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    user = models.ForeignKey(User,db_index=True,on_delete=models.CASCADE)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, db_index=True, blank=True, null=True )
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, db_index=True, blank=True, null=True)
    sales_order = models.ForeignKey(Sale_order, on_delete=models.CASCADE, db_index=True, blank=True, null=True)
    invoice = models.ForeignKey(Customer_invoice, on_delete=models.CASCADE, db_index=True, blank=True, null=True)
    module_name = models.CharField(max_length=15, blank=False, null=False)
    message = models.TextField(blank=True, null=True)
    message_type = models.CharField(max_length=255, null=True)
    next_activity_date = models.DateField(blank=True, null=True)
    next_activity_reminder = models.DateField(blank=True, null=True)
    action    = models.CharField(max_length=255,null=True)
    mark_done = models.BooleanField(default=False, db_index=True)
    mark_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField('date_published', auto_now=True)

    def __unicode__(self):
        return self.id


    def save_message(post_data, message_id=None):
        message_data ={'company_id':post_data['company_id'], 'user_id':post_data['user_id'], 'contact_id':post_data['contact_id'],
                       'opportunity_id':post_data['opportunity_id'], 'sales_order_id':post_data['sales_order_id'],
                       'module_name':post_data['module_name'].lower(),'message':post_data['message'],'message_type':post_data['message_type'].lower(),
                       'next_activity_date': post_data['next_activity_date'], 'next_activity_reminder':post_data['next_activity_reminder'],
                       'action':post_data['action'],'mark_done':post_data['mark_done'],'mark_read':post_data['mark_read']
                       }
        if message_id:
            message = Messages.objects.get(message_id=message_id)
            for key, value in post_data.items():
                setattr(message, key, value)
            message.save()
        else:
            message = Messages(**message_data)
            message.save()
        return message

    def get_date(self):
        now = timezone.now()
        diff = now - self.created_at

        if diff.days == 0 and diff.seconds >= 0 and diff.seconds < 60:
            seconds = diff.seconds
            if seconds == 1:
                return str(seconds) + "Second ago"
            else:
                return str(seconds) + " Second ago"
        if diff.days == 0 and diff.seconds >= 60 and diff.seconds < 3600:
            minutes = math.floor(diff.seconds / 60)
            if minutes == 1:
                return str(minutes) + " Minute ago"
            else:
                return str(minutes) + " Minute ago"
        if diff.days == 0 and diff.seconds >= 3600 and diff.seconds < 86400:
            hours = math.floor(diff.seconds / 3600)
            if hours == 1:
                return str(hours) + " Hour ago"
            else:
                return str(hours) + " Hour ago"

        # 1 day to 30 days
        if diff.days >= 1 and diff.days < 30:
            days = diff.days
            if days == 1:
                return str(days) + " Day ago"
            else:
                return str(days) + " Days ago"

        if diff.days >= 30 and diff.days < 365:
            months = math.floor(diff.days / 30)
            if months == 1:
                return str(months) + " Month ago"
            else:
                return str(months) + " Months ago"

        if diff.days >= 365:
            years = math.floor(diff.days / 365)
            if years == 1:
                return str(years) + " Year ago"
            else:
                return str(years) + " Years ago"

    def cascade_delete(self):
        super(Contact, self).delete()

    def delete_messge(master_id, model_id, module_name):
        if model_id ==1 and module_name == 'contact':
            message = Messages.objects.filter(module_name=module_name, module_id= model_id, contact_id=master_id)
            if message:
                message.delete()


    class Meta:
        app_label = 'next_crm'
