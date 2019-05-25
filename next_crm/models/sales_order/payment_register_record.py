from django.db import models
from datetime import datetime
from django.contrib.auth.models import User
from next_crm.models.sales_order.payment_register import Payment_register




class Payment_register_record(models.Model):

	id               		 = models.AutoField(primary_key=True)
	payment_amount	  		 = models.FloatField(null=True,blank=True )
	total_payment_amount	 = models.FloatField(null=True,blank=True )
	payment_register   	     = models.ForeignKey(Payment_register, models.SET_NULL,related_name='pr_id', db_index=True, blank=True,null=True, )
	payment_date  		 	 = models.DateField(null=True, db_index=True)
	payment_difference		 = models.FloatField(null=True,blank=True )
	payment_journal          = models.CharField(max_length=255, null=True, blank=True ) 
	payment_memo             = models.CharField(max_length=255, null=True, blank=True )
	customer_invoice_id      = models.IntegerField(null=True, db_index=True) 
	unreconcile			 	 = models.IntegerField(default=0, db_index=True)
	
	def __str__(self):
		return self.payment_memo
	
	class Meta:
		app_label = 'next_crm'
