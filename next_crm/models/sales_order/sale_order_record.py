from django.db import models
from datetime import datetime
from django.contrib.auth.models import User
from next_crm.models.product.product import Product 
from next_crm.models.product.product_unit_of_measure import  Product_unit_of_measure
from next_crm.models.sales_order.sale_order import Sale_order
from next_crm.models.sales_order.customer_invoice import Customer_invoice
from next_crm.models.product.product_taxes import  Product_taxes
from next_crm.models.company import Company


class Sale_order_record(models.Model):


	id             = models.AutoField(primary_key=True)
	order          = models.ForeignKey(Sale_order, models.SET_NULL, db_index=True, blank=True,null=True,)
	invoice        = models.ForeignKey(Customer_invoice, models.SET_NULL, db_index=True, blank=True,null=True,)
	Product        = models.ForeignKey(Product, models.SET_NULL, db_index=True, blank=True,null=True, )
	discription    = models.CharField(max_length=500, blank=True ) 
	customer	   = models.IntegerField( db_index=True,) #here put customer reference field
	sales_person   = models.IntegerField(null=True, db_index=True,blank=True)  
	company 	   = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	created_at     = models.DateTimeField(auto_now_add= True)
	updated_at     = models.DateTimeField(auto_now= True )
	create_by_user = models.ForeignKey(User, models.SET_NULL,related_name='sor_create_by', db_index=True, blank=True,null=True, )
	update_by_user = models.ForeignKey(User, models.SET_NULL,related_name='sor_update_by',  db_index=True, blank=True,null=True, )
	product_qty    = models.FloatField(null=True, blank=True)
	product_uom    = models.ForeignKey(Product_unit_of_measure , models.SET_NULL,related_name='product_uom', db_index=True, blank=True,null=True, )
	Taxes          = models.ForeignKey(Product_taxes , models.SET_NULL, db_index=True, blank=True,null=True, )
	unit_price     = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	tax_price      = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	price_subtotal = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)# unit_price * product_qty
	price_total    = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00) # price_subtotal+tax of price_subtotal
	price_reduce   = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00) # diffrence between sale price and discounted price(unit wise)
	discount       = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	line_type      = models.CharField(max_length=50, blank=True ) # it should be order or optional	 
	status         = models.CharField(max_length=255, blank=True, db_index=True, )  #status should be in ['draft', 'sent', 'sale', 'done']
	invoice_status = models.CharField(max_length=255, blank=True, db_index=True, ) #it should be ['to invoice', 'no']
	down_payment   = models.IntegerField(default=0, db_index=True)


	def __str__(self):
		return self.status
	
	class Meta:
		app_label = 'next_crm'
