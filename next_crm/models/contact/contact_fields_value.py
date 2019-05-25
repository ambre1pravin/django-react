from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.contact.contactfields import ContactFields
from next_crm.models.contact.contact import Contact

class ContactFieldsValue(models.Model):

    id = models.AutoField(primary_key=True)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE,db_index=True)
    user = models.ForeignKey(User, db_index=True,on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    contact_field = models.ForeignKey(ContactFields, on_delete=models.CASCADE)
    contact_field_value = models.TextField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def contact_field_value_data(contact_id, field_list):
        sql = " SELECT next_crm_contact_fields.*, next_crm_contact_fields_value.id as contact_field_value_id,"
        sql = sql + " next_crm_contact_fields_value.contact_field_value as contact_field_value"
        sql = sql + " FROM next_crm_contact_fields LEFT OUTER JOIN next_crm_contact_fields_value ON "
        sql = sql + " (next_crm_contact_fields.id = next_crm_contact_fields_value.contact_field_id AND next_crm_contact_fields_value.contact_id= " + contact_id + ")"
        sql = sql + " where next_crm_contact_fields.id in (" + field_list + ") order by next_crm_contact_fields.display_weight asc "
        contact_fields = ContactFields.objects.raw(sql)
        return contact_fields

    class Meta:
        db_table = 'next_crm_contact_fields_value'
