import uuid
from django.db import models
from django.contrib.auth.models import User
from next_crm.models.payment_term.payment_term  import Payment_term
from next_crm.models.product.product_taxes import  Product_taxes
from next_crm.models.payment_term.term import Term
from next_crm.models.company import Company


class Customer_invoice(models.Model):

	id               		 = models.AutoField(primary_key=True)
	encrypt_id 				 = models.UUIDField(default=uuid.uuid4, editable=False)
	name             		 = models.CharField(max_length=255, blank=True )
	customer_id      		 = models.IntegerField(null=True, db_index=True)
	customer_name	  		 = models.CharField(max_length=255, null=True, blank=True )
	invoice_date  		 	 = models.DateField(null=True, db_index=True)
	due_date  		 	 	 = models.DateField(null=True, db_index=True)
	sales_person     		 = models.IntegerField(null=True, db_index=True)
	company 				 = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	created_at       		 = models.DateTimeField(auto_now_add= True)
	updated_at       		 = models.DateTimeField(auto_now= True )
	create_by_user   	     = models.ForeignKey(User, models.SET_NULL,related_name='in_create_by', db_index=True, blank=True,null=True, )
	update_by_user   	     = models.ForeignKey(User, models.SET_NULL,related_name='in_update_by',  db_index=True, blank=True,null=True, )
	quotation_id	         = models.IntegerField(null=True, db_index=True)
	quotation_name	  		 = models.CharField(max_length=255, null=True, blank=True )
	invoice_status           = models.CharField(max_length=255, null=True, blank=True ) 
	status                   = models.CharField(max_length=255, blank=True )  #status should be in ['draft', 'open', 'paid']
	total_amount             = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	subtotal_amount          = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	amount_due               = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	tax_amount               = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	Taxes         			 = models.ForeignKey(Product_taxes , models.SET_NULL, db_index=True, blank=True,null=True, )
	payment_term      		 = models.ForeignKey(Payment_term, models.SET_NULL, db_index=True, blank=True,null=True, )
	term 					 = models.ForeignKey(Term, models.SET_NULL, db_index=True, blank=True, null=True, )
	checkbox_email           = models.BooleanField(default=False)
	email_template           = models.IntegerField(null=True,blank=True)
	unreconcile			 	 = models.IntegerField(default=0, db_index=True)
	notes 					 = models.TextField(blank=True, null=True)
	email_sent_by_cron		 = models.BooleanField(default=False)
	email_sent_on			=  models.DateField(null=True)
	invoice_creation_type	=  models.CharField(max_length=255, blank=True )

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
