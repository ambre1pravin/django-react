from django.core.management.base import BaseCommand
from next_crm.models import DefaultDataFields,  Modules, Roles, Countries


class Command(BaseCommand):
    def handle(self, *args, **options):
        self.load_modules()
        self.load_roles()
        self.load_default_data_fields()
        self.load_default_countries()



    def load_modules(self):
        Modules.objects.create(slug='crm',name='Crm')
        Modules.objects.create(slug='sales',name='Sales')
        Modules.objects.create(slug='opportunity',name='Opportunity')



    def load_roles(self):

        Roles.objects.create(code='ROLE_MANAGE_ALL_CONTACT', label='Manage Contact',  module='contact')
        Roles.objects.create(code='ROLE_VIEW_CONTACT', label='See Contact',  module='contact')
        Roles.objects.create(code='ROLE_NO_ACCESS_CONTACT', label='No Access', module='contact')

        Roles.objects.create(code='ROLE_MANAGE_ALL_CALENDAR', label='View all calendars and manage it',  module='calendar')
        Roles.objects.create(code='ROLE_VIEW_OWN_MANAGE_OWN_CALENDAR', label='View own calendar and manage it',  module='calendar')
        Roles.objects.create(code='ROLE_NO_ACCESS_CALENDAR', label='No Access', module='calendar')

        Roles.objects.create(code='ROLE_MANAGE_ALL_OPPORTUNITY', label='View all opportunity, manage it, and create sales channel', module='opportunity')
        Roles.objects.create(code='ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY', label='View own opportunites and manage it', module='opportunity')
        Roles.objects.create(code='ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY', label='View all opportunities but manage own opportunities only', module='opportunity')
        Roles.objects.create(code='ROLE_NO_ACCESS_OPPORTUNITY', label='No Access', module='opportunity')

        Roles.objects.create(code='ROLE_MANAGE_ALL_QUOTATION', label='View all quotations and manage it', module='quotation')
        Roles.objects.create(code='ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION', label='View own quotations and manage it', module='quotation')
        Roles.objects.create(code='ROLE_VIEW_ALL_MANGE_OWN_QUOTATION', label='View all quotations but manage own quotations only', module='quotation')
        Roles.objects.create(code='ROLE_NO_ACCESS_QUOTATION', label='No Access', module='quotation')

        Roles.objects.create(code='ROLE_MANAGE_ALL_INVOICE', label='View all invoices and manage it', module='invoice')
        Roles.objects.create(code='ROLE_VIEW_OWN_MANAGE_OWN_INVOICE', label='View own invoices and manage it', module='invoice')
        Roles.objects.create(code='ROLE_VIEW_ALL_MANGE_OWN_INVOICE', label='View all invoices but manage own invoices only', module='invoice')
        Roles.objects.create(code='ROLE_NO_ACCESS_INVOICE', label='No Access', module='invoice')

        Roles.objects.create(code='ROLE_MANAGE_ALL_SALES', label='Manage Sales', module='sales')
        Roles.objects.create(code='ROLE_VIEW_SALES', label='See Sales', module='sales')
        Roles.objects.create(code='ROLE_NO_ACCESS_SALES', label='No Access', module='sales')

        Roles.objects.create(code='ROLE_ACCESS_RIGHT', label='Access Right', module='application')
        Roles.objects.create(code='ROLE_ACCESS_SETTING', label='Access Setting', module='application')
        Roles.objects.create(code='ROLE_NO_ACCESS_APPLICATION', label='No Access', module='application')

    def load_default_data_fields(self):

        DefaultDataFields.objects.create(module_id='1', name='website', type='single-line', label='Website',
                                         is_default=True, is_required=False, display_weight='7', is_unused=False,
                                         display_position="left", default_values=[], language='English')



        DefaultDataFields.objects.create(module_id='1', name='job-position', type='single-line', label='Job Position',
                                         is_default=True, is_required=False, display_weight='8', is_unused=False,
                                         display_position="right", default_values=[], language='English')



        DefaultDataFields.objects.create(module_id='1', name='fax', type='single-line', label='Fax',
                                         is_default=True, is_required=False, display_weight='10', is_unused=False,
                                         display_position="right", default_values=[], language='English')


        DefaultDataFields.objects.create(module_id='1', name='language', type='drop-down', label='Language',
                                         is_default=True, is_required=False, display_weight='12', is_unused=False,
                                         display_position="right", default_values=['English', 'French'], language='English')

        DefaultDataFields.objects.create(module_id='1', name='gender', type='drop-down', label='Gender',
                                         is_default=True, is_required=False, display_weight='13', is_unused=False,
                                         display_position="right", default_values=['Male', 'Female'], language='English')

        DefaultDataFields.objects.create(module_id='1', name='internal_notes', type='multi-line',
                                         label='internal_notes',
                                         is_default=True, is_required=False, display_weight='14', is_unused=False,
                                         display_position="right", default_values=[], language='English')


        #For French

        DefaultDataFields.objects.create(module_id='1', name='website', type='single-line', label='Site Internet',
                                         is_default=True, is_required=False, display_weight='7', is_unused=False,
                                         display_position="left", default_values=[],language='French')

        DefaultDataFields.objects.create(module_id='1', name='job-position', type='single-line', label='Poste',
                                         is_default=True, is_required=False, display_weight='8', is_unused=False,
                                         display_position="right", default_values=[],language='French')


        DefaultDataFields.objects.create(module_id='1', name='fax', type='single-line', label='Fax',
                                         is_default=True, is_required=False, display_weight='10', is_unused=False,
                                         display_position="right", default_values=[],language='French')


        DefaultDataFields.objects.create(module_id='1', name='language', type='drop-down', label='La langue',
                                         is_default=True, is_required=False, display_weight='12', is_unused=False,
                                         display_position="right", default_values=['English', 'French'],language='French')

        DefaultDataFields.objects.create(module_id='1', name='gender', type='drop-down', label='Le genre',
                                         is_default=True, is_required=False, display_weight='13', is_unused=False,
                                         display_position="right", default_values=['Male', 'Female'],language='French')

        DefaultDataFields.objects.create(module_id='1', name='internal_notes', type='multi-line',
                                         label='Notes internes',
                                         is_default=True, is_required=False, display_weight='14', is_unused=False,
                                         display_position="right", default_values=[],language='French')

    def load_default_countries(self):
        Countries.objects.create(code='AF', label='Afghanistan', is_vat=False, is_europe=False)
        Countries.objects.create(code='AL', label='Albania', is_vat=True, is_europe=True)
        Countries.objects.create(code='DZ', label='Algeria', is_vat=False, is_europe=False)
        Countries.objects.create(code='AS', label='American Samoa', is_vat=True, is_europe=True)
        Countries.objects.create(code='AD', label='Andorra, Principality of', is_vat=True, is_europe=True)
        Countries.objects.create(code='AO', label='Angola', is_vat=False, is_europe=False)
        Countries.objects.create(code='AI', label='Anguilla', is_vat=False, is_europe=False)
        Countries.objects.create(code='AQ', label='Antarctica', is_vat=False, is_europe=False)
        Countries.objects.create(code='AG', label='Antigua and Barbuda', is_vat=False, is_europe=False)
        Countries.objects.create(code='AR', label='Argentina', is_vat=False, is_europe=False)
        Countries.objects.create(code='AM', label='Armenia', is_vat=True, is_europe=True)
        Countries.objects.create(code='AW', label='Aruba', is_vat=False, is_europe=False)
        Countries.objects.create(code='AU', label='Australia', is_vat=False, is_europe=False)
        Countries.objects.create(code='AT', label='Austria', is_vat=True, is_europe=True)
        Countries.objects.create(code='AZ', label='Azerbaijan', is_vat=True, is_europe=True)
        Countries.objects.create(code='BS', label='Bahamas', is_vat=False, is_europe=False)
        Countries.objects.create(code='BH', label='Bahrain', is_vat=False, is_europe=False)
        Countries.objects.create(code='BD', label='Bangladesh', is_vat=False, is_europe=False)
        Countries.objects.create(code='BB', label='Barbados', is_vat=False, is_europe=False)
        Countries.objects.create(code='BY', label='Belarus', is_vat=True, is_europe=True)
        Countries.objects.create(code='BE', label='Belgium', is_vat=True, is_europe=True)
        Countries.objects.create(code='BZ', label='Belize', is_vat=False, is_europe=False)
        Countries.objects.create(code='BJ', label='Benin', is_vat=False, is_europe=False)
        Countries.objects.create(code='BM', label='Bermuda', is_vat=False, is_europe=False)
        Countries.objects.create(code='BT', label='Bhutan', is_vat=False, is_europe=False)
        Countries.objects.create(code='BO', label='Bolivia', is_vat=False, is_europe=False)
        Countries.objects.create(code='BQ', label='Bonaire, Sint Eustatius and Saba', is_vat=False, is_europe=False)
        Countries.objects.create(code='BA', label='Bosnia-Herzegovina', is_vat=True, is_europe=True)
        Countries.objects.create(code='BW', label='Botswana', is_vat=False, is_europe=False)
        Countries.objects.create(code='BV', label='Bouvet Island', is_vat=False, is_europe=False)
        Countries.objects.create(code='BR', label='Brazil', is_vat=False, is_europe=False)
        Countries.objects.create(code='IO', label='British Indian Ocean Territory', is_vat=False, is_europe=False)
        Countries.objects.create(code='BN', label='Brunei Darussalam', is_vat=False, is_europe=False)
        Countries.objects.create(code='BG', label='Bulgaria', is_vat=True, is_europe=True)
        Countries.objects.create(code='BF', label='Burkina Faso', is_vat=False, is_europe=False)
        Countries.objects.create(code='BI', label='Burundi', is_vat=False, is_europe=False)
        Countries.objects.create(code='KH', label='Cambodia', is_vat=False, is_europe=False)
        Countries.objects.create(code='CM', label='Cameroon', is_vat=False, is_europe=False)
        Countries.objects.create(code='CA', label='Canada', is_vat=False, is_europe=False)
        Countries.objects.create(code='IC', label='Canary Islands', is_vat=False, is_europe=False)
        Countries.objects.create(code='CV', label='Cape Verde', is_vat=False, is_europe=False)
        Countries.objects.create(code='KY', label='Cayman Islands', is_vat=False, is_europe=False)
        Countries.objects.create(code='CF', label='Central African Republic', is_vat=False, is_europe=False)
        Countries.objects.create(code='TD', label='Chad', is_vat=False, is_europe=False)
        Countries.objects.create(code='CL', label='Chile', is_vat=False, is_europe=False)
        Countries.objects.create(code='CN', label='China', is_vat=False, is_europe=False)
        Countries.objects.create(code='CX', label='Christmas Island', is_vat=False, is_europe=False)
        Countries.objects.create(code='CC', label='Cocos (Keeling) Islands', is_vat=False, is_europe=False)
        Countries.objects.create(code='CO', label='Colombia', is_vat=False, is_europe=False)
        Countries.objects.create(code='KM', label='Comoros', is_vat=False, is_europe=False)
        Countries.objects.create(code='CG', label='Congo', is_vat=False, is_europe=False)
        Countries.objects.create(code='CD', label='Congo, Democratic Republic of the', is_vat=False, is_europe=False)
        Countries.objects.create(code='CK', label='Cook Islands', is_vat=False, is_europe=False)
        Countries.objects.create(code='CR', label='Costa Rica', is_vat=False, is_europe=False)
        Countries.objects.create(code='HR', label='Croatia', is_vat=True, is_europe=True)
        Countries.objects.create(code='CU', label='Cuba', is_vat=False, is_europe=False)
        Countries.objects.create(code='CW', label='Curaçao', is_vat=False, is_europe=False)
        Countries.objects.create(code='CY', label='Cyprus', is_vat=True, is_europe=True)
        Countries.objects.create(code='CZ', label='Czech Republic', is_vat=True, is_europe=True)
        Countries.objects.create(code='CI', label='Côte d Ivoire', is_vat=False, is_europe=False)
        Countries.objects.create(code='DK', label='Denmark', is_vat=False, is_europe=False)
        Countries.objects.create(code='DJ', label='Djibouti', is_vat=False, is_europe=False)
        Countries.objects.create(code='FR', label='France', is_vat=False, is_europe=True)






