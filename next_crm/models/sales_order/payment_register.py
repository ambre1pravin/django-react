import uuid
from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.sales_order.customer_invoice import Customer_invoice

class Payment_register(models.Model):
	id               		 = models.AutoField(primary_key=True)
	uuid					 = models.UUIDField(default=uuid.uuid4, editable=False)
	customer_invoice      	 = models.ForeignKey(Customer_invoice, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	company 				 = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	payment_amount	  		 = models.FloatField(null=True,blank=True )	
	total_payment_amount	 = models.FloatField(null=True,blank=True )
	payment_date  		 	 = models.DateField(null=True, db_index=True)
	payment_journal          = models.CharField(max_length=255, null=True, blank=True ) 
	payment_memo             = models.CharField(max_length=255, null=True, blank=True )
	payment_difference		 = models.FloatField(null=True,blank=True )
	reason                   = models.CharField(max_length=255, null=True, blank=True ) 
	created_at       		 = models.DateTimeField(auto_now_add= True)
	updated_at       		 = models.DateTimeField(auto_now= True )
	create_by_user   	     = models.ForeignKey(User, models.SET_NULL,related_name='py_create_by', db_index=True, blank=True,null=True, )
	update_by_user   	     = models.ForeignKey(User, models.SET_NULL,related_name='py_update_by',  db_index=True, blank=True,null=True, )
	unreconcile			 	 = models.IntegerField(default=0, db_index=True)
	name             		 = models.CharField(max_length=255, blank=True )
	customer_id      		 = models.IntegerField()
	customer_name	  		 = models.CharField(max_length=255, null=True, blank=True )
	status                   = models.CharField(max_length=255, blank=True ) 	
	payment_method_type      = models.CharField(max_length=255, blank=True ) 

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
