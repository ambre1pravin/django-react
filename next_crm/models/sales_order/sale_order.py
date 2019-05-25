import uuid
from django.db import models
from django.contrib.auth.models import User
from next_crm.models.opportunity.sales_channel import  SalesChannel
from next_crm.models.opportunity.opportunity import  Opportunity
from next_crm.models.payment_term.payment_term  import Payment_term
from next_crm.models.delivery_method.delivery_method  import Delivery_method
from next_crm.models.quotation_template.quotation_template  import Quotation_template
from next_crm.models.company import Company
from next_crm.models.contact.contact import Contact


class Sale_order(models.Model):


	id               		 = models.AutoField(primary_key=True)
	uuid 				 	 = models.UUIDField(default=uuid.uuid4, editable=False)
	name             		 = models.CharField(max_length=255, blank=True )
	sales_channel        	 = models.ForeignKey(SalesChannel, models.SET_NULL, db_index=True, blank=True,null=True, )
	customer      		 	 = models.ForeignKey(Contact, on_delete=models.CASCADE,db_index=True)
	customer_name	  		 = models.CharField(max_length=255, null=True, blank=True )
	sales_person 			 = models.ForeignKey(User, models.SET_NULL, db_index=True, blank=True, null=True)
	opportunity      		 = models.ForeignKey(Opportunity, models.SET_NULL, db_index=True, blank=True,null=True, ) 
	company          		 = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False )
	customer_invoice_id 	 = models.IntegerField(null=True, db_index=True)
	created_at       		 = models.DateTimeField(auto_now_add= True)
	updated_at       		 = models.DateTimeField(auto_now= True )
	create_by_user   	     = models.ForeignKey(User, models.SET_NULL,related_name='so_create_by', db_index=True, blank=True,null=True, )
	update_by_user   	     = models.ForeignKey(User, models.SET_NULL,related_name='so_update_by',  db_index=True, blank=True,null=True, )
	notes            	     = models.TextField(blank=True,null=True) #terms and condition 
	customer_order_reference = models.CharField(max_length=255, blank=True, null=True ) #this is text field for customer reference
	expiration_date  		 = models.DateField(null=True, db_index=True)
	order_date  		     = models.DateField(null=True, db_index=True)
	payment_term      		 = models.ForeignKey(Payment_term, models.SET_NULL, db_index=True, blank=True,null=True, ) 
	delivery_method      	 = models.ForeignKey(Delivery_method, models.SET_NULL, db_index=True, blank=True,null=True, ) 
	qout_template        	 = models.ForeignKey(Quotation_template, models.SET_NULL, db_index=True, blank=True,null=True, ) 
	amount_untaxed           = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	tax_amount               = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	total_amount 			 = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	opamount_untaxed         = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	optax_amount             = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	optotal_amount           = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00 )
	status                   = models.CharField(max_length=255, blank=True )  #status should be in ['draft', 'sent', 'sale', 'done', 'cancel']
	invoice_status           = models.CharField(max_length=255, blank=True ) #it should be ['to invoice', 'no']
	module_type            	 = models.TextField(blank=True)


	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
