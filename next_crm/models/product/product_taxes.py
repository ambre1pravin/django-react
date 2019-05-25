import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from next_crm.models.company import Company


class Product_taxes(models.Model):

	PERCENTAGE = 'percentage'
	FIXED      = 'fixed'
	COMPUTATION_TYPE = (
        (PERCENTAGE, 'Percentage'),
        (FIXED, 'Fixed')
    )

	ON_SALE       = 'sale'
	WHOLESALE_TAX = 'wholesale'
	SCOPE_TYPE = (
        (ON_SALE, 'Sale'),
        (WHOLESALE_TAX, 'Wholesale Tax')
    )
	
	id          = models.AutoField(primary_key=True)
	uuid 		= models.UUIDField(default=uuid.uuid4, editable=False)
	name        = models.CharField(max_length=255, blank=True )
	value       = models.DecimalField(max_digits=11, decimal_places=2, null=True, blank=True, default=0.00)
	computation = models.CharField(choices = COMPUTATION_TYPE,  max_length=25, blank=True )
	scope       = models.CharField(choices = SCOPE_TYPE,  max_length=25, blank=True )
	user        = models.ForeignKey(User, models.SET_NULL, db_index=True, blank=True,null=True, )
	company 	= models.ForeignKey(Company, db_index=True, on_delete=models.CASCADE, blank=False, null=False)
	created_at  = models.DateTimeField(default=timezone.now)
	is_default	= models.BooleanField(default=False )
	is_deleted	= models.BooleanField(default=False )
	

	def __str__(self):
		return self.name
	
	class Meta:
		app_label = 'next_crm'
