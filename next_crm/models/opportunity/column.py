from django.db import models
from django.contrib.auth.models import User
from next_crm.models.opportunity.sales_channel import  SalesChannel
from next_crm.models.company import Company



class Column(models.Model):
    
    id                 = models.AutoField(primary_key=True)
    name               = models.CharField(max_length=255 , blank=True)
    user               = models.ForeignKey(User, models.SET_NULL, db_index=True, blank=True,null=True, )
    company            = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    order              = models.IntegerField(default=0, db_index=True)
    is_fold            = models.BooleanField(default=False)
    is_active          = models.BooleanField(default=True)
    is_undefined       = models.BooleanField(default=False)
    is_default         = models.BooleanField(default=False)
    sales_channel      = models.ForeignKey(SalesChannel, on_delete=models.CASCADE, db_index=True, blank=False, null=False )
    pipeline_status    = models.BooleanField(default=True)
    probability_status = models.BooleanField(default=False)
    probability        = models.CharField(max_length=255, blank=True )
    requirements       = models.CharField(max_length=255, blank=True )

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'next_crm_opp_column'

