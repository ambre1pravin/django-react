from django.db import models
from next_crm.models.email_template import EmailTemplate
from next_crm.models.common.messages import Messages
from next_crm.models.sales_order.sale_order import Sale_order
from next_crm.models.sales_order.customer_invoice import Customer_invoice


class AttachDocument(models.Model):
    id = models.AutoField(primary_key=True)
    module_name = models.CharField(max_length=15, blank=False, null=False)
    email_template = models.ForeignKey(EmailTemplate, on_delete=models.CASCADE, db_index=True,blank=True, null=True)
    message = models.ForeignKey(Messages, on_delete=models.CASCADE, db_index=True, blank=True, null=True)
    sales_order = models.ForeignKey(Sale_order, on_delete=models.CASCADE, db_index=True, blank=True, null=True)
    invoice = models.ForeignKey(Customer_invoice, on_delete=models.CASCADE, db_index=True, blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_path = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)

    def cascade_delete(self):
        super(AttachDocument, self).delete()


    class Meta:
        db_table = 'next_crm_attach_document'