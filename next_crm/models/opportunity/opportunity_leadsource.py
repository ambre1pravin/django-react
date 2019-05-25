from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company

class OpportunityLeadsource(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    company = models.ForeignKey(Company, blank=True, null=True, db_index=True,on_delete=models.CASCADE)

    def __unicode__(self):
        return self.name

    class Meta:
        db_table = 'next_crm_op_lead_source'
