from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.product.product_uom_category import  Product_uom_category


class Product_unit_of_measure(models.Model):
	
	id         	= models.AutoField(primary_key=True)
	name       	= models.CharField(max_length=255, blank=True )
	category   	= models.ForeignKey(Product_uom_category, models.SET_NULL, db_index=True, blank=True,null=True,)
	uom_type   	= models.CharField(max_length=255, blank=True) #its value should be reference or bigger or smaller
	factor     	= models.FloatField(null=True)
	create_by   = models.ForeignKey(User, models.SET_NULL, related_name="pro_uom_created_by", db_index=True, blank=True,null=True, )
	update_by   = models.ForeignKey(User, models.SET_NULL, related_name="pro_uom_updated_by", db_index=True, blank=True,null=True, )
	company 	= models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	created_at 	= models.DateTimeField(auto_now_add= True)
	updated_at 	= models.DateTimeField(auto_now= True )
	

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
