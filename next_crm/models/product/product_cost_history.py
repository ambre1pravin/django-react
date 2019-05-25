from django.db import models
from next_crm.models.company import Company
from next_crm.models.product.product_template import Product_template 


class Product_cost_history(models.Model):
	
	id         = models.AutoField(primary_key=True)
	product    = models.ForeignKey(Product_template, on_delete = models.CASCADE,related_name="cost_history_of_product" , db_index=True,  null=True)
	cost       = models.FloatField(null=True, db_index=True)
	company    = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False )
	created_at = models.DateTimeField( auto_now= True)
	

	def __str__(self):
		return 'self.name'
	
	class Meta:
		app_label = 'next_crm'
