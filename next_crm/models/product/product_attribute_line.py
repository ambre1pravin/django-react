from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from next_crm.models.product.product_attribute import Product_attribute
from next_crm.models.product.product_template import  Product_template 


class Product_attribute_line(models.Model):
	
	id              = models.AutoField(primary_key=True)
	attribute       = models.ForeignKey(Product_attribute, on_delete= models.CASCADE , db_index = True, )
	product_tmpl    = models.ForeignKey(Product_template ,  on_delete = models.CASCADE, db_index=True, blank=True,null=True, )
	create_by_user  = models.ForeignKey(User, models.SET_NULL,related_name='pro_attr_line_createdby', db_index=True, blank=True,null=True, )
	update_by_user  = models.ForeignKey(User, models.SET_NULL,related_name='pro_attr_line_updateby',  db_index=True, blank=True,null=True, )		
	created_at      = models.DateTimeField(  auto_now_add= True)
	updated_at      = models.DateTimeField(  auto_now= True)
	

	def __str__(self):
		return self.product_tmpl
	
	class Meta:
		app_label = 'next_crm'
