import uuid
from django.db import models

from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.product.product_category import  Product_category
from next_crm.models.product.product_unit_of_measure import  Product_unit_of_measure
from next_crm.models.product.product_taxes import  Product_taxes
from next_crm.models.opportunity.sales_channel import SalesChannel


class Product_template(models.Model):


	id                   = models.AutoField(primary_key=True)
	uuid 				 = models.UUIDField(default=uuid.uuid4, editable=False)
	name                 = models.CharField(max_length=255, blank=True )
	can_be_sold          = models.BooleanField(default=True, db_index=True)
	can_be_purchased     = models.BooleanField(default=True, db_index=True)
	can_be_expended      = models.BooleanField(default=False, db_index=True)
	event_subscription   = models.BooleanField(default=False, db_index=True)

	product_type         = models.CharField(max_length=50,   blank=True,null=True,db_index=True)
	product_category     = models.ForeignKey(Product_category , models.SET_NULL, db_index=True, blank=True,null=True, )
	sale_price           = models.FloatField(null=True)
	uofm                 = models.ForeignKey(Product_unit_of_measure , models.SET_NULL,related_name='unit_of_measure', db_index=True, blank=True,null=True, )
	purchase_uofm        = models.ForeignKey(Product_unit_of_measure , models.SET_NULL,related_name='purchase_unit_of_measure', db_index=True, blank=True,null=True, )
	description          = models.TextField(blank=True,null=True)
	tax_on_sale          = models.ForeignKey(Product_taxes , models.SET_NULL, related_name='tax_onsale', db_index=True, blank=True,null=True, )
	wholesale_tax        = models.ForeignKey(Product_taxes  , models.SET_NULL, related_name='tax_onwholesale', db_index=True, blank=True,null=True, )
	notes                = models.TextField(blank=True,null=True)
	vendors_notes        = models.TextField(blank=True,null=True)
	create_by_user       = models.ForeignKey(User, models.SET_NULL,related_name='create_by', db_index=True, blank=True,null=True, )
	update_by_user       = models.ForeignKey(User, models.SET_NULL,related_name='update_by',  db_index=True, blank=True,null=True, )
	company 			 = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	created_at           = models.DateTimeField(auto_now_add= True)
	updated_at           = models.DateTimeField(auto_now= True )
	state                = models.BooleanField(default=True);
	active               = models.BooleanField(default=True);
	weight               = models.FloatField(null=True)
	warrnety             = models.FloatField(null=True)
	color                = models.CharField(max_length=255, blank=True )
	volume               = models.FloatField(null=True)
	sales_channel        = models.ForeignKey(SalesChannel, models.SET_NULL, db_index=True, blank=True,null=True)




	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
