from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company

class SalesChannel(models.Model):
    id             = models.AutoField(primary_key=True)
    name           = models.CharField(max_length=255 )
    company        = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    is_default     = models.BooleanField(default=False)
    '''use_opportunity = models.BooleanField(default=False)
    use_quatations = models.BooleanField(default=False)
    use_invoices   = models.BooleanField(default=False)
    use_leads      = models.BooleanField(default=False)'''
    team_leader    = models.ForeignKey(User, related_name='team_leader', on_delete=models.CASCADE, db_index=True, blank=False,null=False, )
    created_by = models.ForeignKey(User, related_name='created_by', on_delete=models.CASCADE, db_index=True, blank=False, null=False, )

    def __unicode__(self):
        return self.name

    def cascade_delete(self):
        super(Company, self).delete()

    class Meta:
        db_table = 'next_crm_sales_channel'


