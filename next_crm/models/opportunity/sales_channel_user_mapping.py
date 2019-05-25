from django.db import models
from django.contrib.auth.models import User
from next_crm.models.opportunity.sales_channel import SalesChannel

class SalesChannelUserMapping(models.Model):
    id             = models.AutoField(primary_key=True)
    sales_channel  = models.ForeignKey(SalesChannel, on_delete=models.CASCADE, db_index=True, blank=False, null=False)
    user           = models.ForeignKey(User,  on_delete=models.CASCADE, db_index=True, blank=False, null=False)

    def __unicode__(self):
        return self.name

    class Meta:

        db_table = 'next_crm_sales_channel_user_mapping'
        unique_together = ["sales_channel", "user"]
