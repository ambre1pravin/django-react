from django.db import models
from datetime import datetime
from django.contrib.auth.models import User
from next_crm.models.sales_order.sale_order import Sale_order
from next_crm.models.email_template import EmailTemplate



class Email_reminder(models.Model):


	id             = models.AutoField(primary_key=True)
	sale           = models.ForeignKey(Sale_order, models.SET_NULL, db_index=True, blank=True,null=True)
	numbers        = models.IntegerField(null=True, db_index=True,blank=True)
	event_type     = models.CharField(max_length=50, blank=True )
	email_template = models.ForeignKey(EmailTemplate, models.SET_NULL, db_index=True, blank=True,null=True)
	company        = models.IntegerField(null=True, db_index=True,blank=True)
	created_at     = models.DateTimeField(auto_now_add= True)
	updated_at     = models.DateTimeField(auto_now= True )
	create_by_user = models.ForeignKey(User, models.SET_NULL,related_name='er_create_by', db_index=True, blank=True,null=True, )
	update_by_user = models.ForeignKey(User, models.SET_NULL,related_name='er_update_by',  db_index=True, blank=True,null=True, )


	def __str__(self):
		return self.event_type
	
	class Meta:
		app_label = 'next_crm'
