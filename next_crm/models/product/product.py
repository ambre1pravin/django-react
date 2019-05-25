import uuid
from django.db import models
from django.contrib.auth.models import User
from next_crm.models.product.product_template import  Product_template
from next_crm.models.opportunity.sales_channel import SalesChannel
from next_crm.models.company import Company

class Product(models.Model):
	
	id                   = models.AutoField(primary_key=True)
	uuid 				 = models.UUIDField(default=uuid.uuid4, editable=False)
	weight               = models.FloatField(null=True)
	volume               = models.FloatField(null=True)
	internal_reference   = models.CharField(max_length=255, blank=True , null= True , db_index=True)
	template_name        = models.CharField(max_length=255, blank=True , null= True, db_index=True )
	image_path           = models.CharField(max_length=255, blank=True , null= True)
	product_tmpl         = models.ForeignKey(Product_template ,  on_delete = models.CASCADE, db_index=True, blank=True,null=True, )
	create_by_user       = models.ForeignKey(User, models.SET_NULL,related_name='product_create_by', db_index=True, blank=True,null=True, )
	update_by_user       = models.ForeignKey(User, models.SET_NULL,related_name='product_update_by',  db_index=True, blank=True,null=True, )
	company              = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False )
	created_at           = models.DateTimeField(auto_now_add= True)
	updated_at           = models.DateTimeField(auto_now= True )
	active               = models.BooleanField(default=True )
	sales_person      	 = models.ForeignKey(User, models.SET_NULL, db_index=True, blank=True,null=True, related_name='product_sales_person',)
	sales_channel        = models.ForeignKey(SalesChannel, models.SET_NULL, db_index=True, blank=True,null=True)
	status               = models.CharField(max_length=50,blank=True,null=True,db_index=True)

	def __str__(self):
		return self.template_name
	
	class Meta:
		app_label = 'next_crm'
