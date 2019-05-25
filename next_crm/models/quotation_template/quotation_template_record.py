from django.db import models
from django.contrib.auth.models import User
from next_crm.models.product.product import Product 
from next_crm.models.product.product_unit_of_measure import  Product_unit_of_measure
from next_crm.models.quotation_template.quotation_template  import Quotation_template
from next_crm.models.product.product_taxes import  Product_taxes
from next_crm.models.company import Company

class Quotation_template_record(models.Model):

	id                 			= models.AutoField(primary_key=True)
	quotation_template 			= models.ForeignKey(Quotation_template, on_delete=models.CASCADE,  db_index=True, )
	Product            			= models.ForeignKey(Product, on_delete=models.CASCADE, db_index=True, blank=True,null=True, )
	discription        			= models.CharField(max_length=500, blank=True )
	company 					= models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
	created_at         			= models.DateTimeField(auto_now_add= True)
	updated_at     				= models.DateTimeField(auto_now= True )
	create_by_user 				= models.ForeignKey(User, models.SET_NULL,related_name='quo_create_by', db_index=True, blank=True,null=True, )
	update_by_user 				= models.ForeignKey(User, models.SET_NULL,related_name='quo_update_by',  db_index=True, blank=True,null=True, )
	product_uom       			= models.ForeignKey(Product_unit_of_measure , models.SET_NULL,related_name='quot_tmpl_product_uom', db_index=True, blank=True,null=True, )
	Taxes          				= models.ForeignKey(Product_taxes , models.SET_NULL, db_index=True, blank=True,null=True, )
	product_qty       			= models.IntegerField(null=True, db_index=True,blank=True)  
	unit_price     	   			= models.FloatField(null=True, blank=True)
	tax_price      				= models.FloatField(null=True, blank=True)
	price_subtotal 				= models.FloatField(null=True, blank=True) # unit_price * product_qty
	price_total    				= models.FloatField(null=True, blank=True) # price_subtotal+tax of price_subtotal
	price_reduce   				= models.FloatField(null=True, blank=True) # diffrence between sale price and discounted price(unit wise)
	discount       				= models.FloatField(null=True, blank=True) 
	line_type      				= models.CharField(max_length=50, blank=True ) # it should be order or optional	 	 
	
	
	
	def __str__(self):
		return self.status
	
	class Meta:
		app_label = 'next_crm'
