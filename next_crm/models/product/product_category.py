import uuid
from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company


class Product_category(models.Model):
	
	id         = models.AutoField(primary_key=True)
	uuid 		= models.UUIDField(default=uuid.uuid4, editable=False)
	parent     = models.ForeignKey('self',models.SET_NULL,  null=True)
	name       = models.CharField(max_length=255, blank=True )
	user       = models.ForeignKey(User, models.SET_NULL, db_index=True, blank=True,null=True, )
	company    = models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False )
	created_at = models.DateTimeField(auto_now_add= True)
	updated_at = models.DateTimeField(auto_now= True)
	

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
