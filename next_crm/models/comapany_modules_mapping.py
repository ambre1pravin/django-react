from django.db import models
from django.contrib.auth.models import User
from next_crm.models.company import Company
from next_crm.models.modules import Modules



class CompanyModulesMapping(models.Model):
    id = models.AutoField(primary_key=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, db_index=True)
    module = models.ForeignKey(Modules, on_delete=models.CASCADE, db_index=True)
    is_installed = models.BooleanField(default=False)

    def cascade_delete(self):
        super(CompanyModulesMapping, self).delete()

    def save_update_company_modules_mapping(slug, company_id, is_installed=True):
        module = Modules.objects.get(slug=slug)
        try:
            company_modules_mapping = CompanyModulesMapping.objects.get(module=module, company_id=company_id)
            if is_installed:
                company_modules_mapping.is_installed = True
            else:
                company_modules_mapping.is_installed = False
            company_modules_mapping.save()
        except CompanyModulesMapping.DoesNotExist:
            company_modules_mapping = CompanyModulesMapping.objects.create(module=module, company_id=company_id,
                                                                           is_installed=True)
        return company_modules_mapping

    class Meta:
        db_table = 'next_crm_company_modules_mapping'