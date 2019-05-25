from .base import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'crm',
        'USER': 'postgres',
        'PASSWORD': 'admin',
        'HOST': 'localhost',
        'PORT': 5432,
    }
}

CSV_FILE = 'users.csv'
client_id ='917916054347-6e1iurbajkurcgssm6sggg5g1v5mb68i.apps.googleusercontent.com'
client_secret ='Ll84Y3525s0nQEPnDT_ILgSB'
api_key='AIzaSyDkdKr2KL9xBkicp5OL4bBZMdEIi0yEScY'


GOOGLE_OAUTH2_CLIENT_ID = '917916054347-6e1iurbajkurcgssm6sggg5g1v5mb68i.apps.googleusercontent.com'
GOOGLE_OAUTH2_CLIENT_SECRET = 'Ll84Y3525s0nQEPnDT_ILgSB'

GOOGLE_OAUTH2_CLIENT = {
    'scope': 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.readonly',
    'redirect_uri': 'http://46.255.162.226:8001/google/auth/'
}

DEFAULT_ROLES = ["ROLE_MANAGE_ALL_CONTACT", "ROLE_MANAGE_ALL_CALENDAR", "ROLE_MANAGE_ALL_OPPORTUNITY", "ROLE_MANAGE_ALL_QUOTATION",
                    "ROLE_MANAGE_ALL_INVOICE", "ROLE_MANAGE_ALL_SALES", "ROLE_ACCESS_RIGHT", "ROLE_ACCESS_SETTING"
                ]
CONTACT_ROLES = {'ROLE_MANAGE_ALL_CONTACT':'Manage Contact',
                 'ROLE_VIEW_CONTACT':'See Contact',
                 'ROLE_NO_ACCESS_CONTACT':'No Access'
                }

CALENDAR_ROLES = {'ROLE_MANAGE_ALL_CALENDAR':'View all calendars and manage it',
                  'ROLE_VIEW_OWN_MANAGE_OWN_CALENDAR':'View own calendar and manage it',
                  'ROLE_NO_ACCESS_CALENDAR':'No Access'
                }

OPPORTUNITY_ROLES = {'ROLE_MANAGE_ALL_OPPORTUNITY':'View all opportunity, manage it, and create sales channel',
                     'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY':'View own opportunites and manage it',
                     'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY':'View all opportunities but manage own opportunities only',
                     'ROLE_NO_ACCESS_OPPORTUNITY':'No Access'
                    }

QUOTATION_ROLES = {'ROLE_MANAGE_ALL_QUOTATION': 'View all quotations and manage it',
                    'ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION': 'View own quotations and manage it',
                    'ROLE_VIEW_ALL_MANGE_OWN_QUOTATION': 'View all quotations but manage own quotations only',
                    'ROLE_NO_ACCESS_QUOTATION': 'No Access'
                }

INVOICE_ROLES = {'ROLE_MANAGE_ALL_INVOICE': 'View all invoices and manage it',
                 'ROLE_VIEW_OWN_MANAGE_OWN_INVOICE': 'View own invoices and manage it',
                 'ROLE_VIEW_ALL_MANGE_OWN_INVOICE': 'View all invoices but manage own invoices only',
                 'ROLE_NO_ACCESS_INVOICE': 'No Access'
                }

SALES_ROLES = {'ROLE_MANAGE_ALL_SALES':'Manage Sales',
               'ROLE_VIEW_SALES':'See Sales',
               'ROLE_NO_ACCESS_SALES':'No Access'
               }

APPLICATION_ROLES = {'ROLE_ACCESS_ADMIN': 'Admin',
                    'ROLE_ACCESS_STAFF': 'Staff',
                }


LANGUAGES = {'en':'ENGLISH','fr':'FRENCH'}

LABELS ={'en':{'msg_contact_delete':"Contact supprimé !!",
                    'msg_did_not_selected_csv_file':"You did not selected csv file.",
                    'msg_did_not_selected_file':"You did not selected any file.",
                    'msg_did_not_selected_field':"You did not selected any fields.",
                    'msg_import_running':"Import is running, whenever, you can use the system.",
                    'msg_contact_not_exits':"Contact DoesNotExist.",
                    "button_new_field": "New Field",
                    "text_unused_fields":"Unused Field",
                    "text_single_line":"Single Line",
                    "text_checkbox":"Checkbox",
                    "text_radio":"Radio",
                    "text_phone":"Phone",
                    "text_multiline":"Multi Line",
                    "text_date":"Date",
                    "text_drop_down":"Drop Down",
                    "text_settings":"Settings",
                    "text_contact":"Contact",
                    "text_add_new_tab":"Add New Tab",
                    "text_save_all":"Save All",
                    "text_select_option":"Select Option",
                    "text_set_properties":"Set Properties",
                    "text_rename":"Rename",
                    "text_delete":"Delete",
                    "text_drag_info":"You can drag & drop somes elements below to customize this tabs.",
                    "text_update_sueess":"Update Successfully..",
                    "text_email_exits":"This email already exits",
                    "text_activate":"Activate",
                    "text_deactivate":"Deactivate",
                    "text_staff":"Staff",
                    "text_admin":"Admin",
                    "msg_user_deactivate":"User has been deactivated.",
                    "msg_user_activate":'User has been activated.',
                    },

         'fr':{'msg_contact_delete':'Contact Deleted !!',
                   'msg_did_not_selected_csv_file':"Vous n'avez pas sélectionné le fichier csv.",
                   'msg_did_not_selected_file': "Vous n'avez sélectionné aucun fichier.",
                   'msg_did_not_selected_field':"You did not selected any fields.",
                   'msg_import_running': "L'importation est en cours d'exécution, chaque fois que vous pouvez utiliser le système.",
                   'msg_contact_not_exits':"Contact DoesNotExist.",
                   "button_new_field": "Nouveau champ",
                    "text_unused_fields":"Champ non utilisé",
                    "text_single_line":"Une seule ligne",
                    "text_checkbox":"Case à cocher",
                    "text_radio":"Radio",
                    "text_phone":"Téléphone",
                    "text_multiline":"Multi Line",
                    "text_date":"Rendez-vous amoureux",
                    "text_drop_down":"Menu déroulant",
                    "text_settings": "Paramètres",
                    "text_contact": "Contact",
                    "text_add_new_tab":"Ajouter une nouvelle onglet",
                    "text_save_all": "Sauver tous",
                    "text_select_option": "Sélectionner une option",
                    "text_set_properties": "Définir les propriétés",
                   "text_rename": "Rebaptiser",
                   "text_delete": "Effacer",
                    "text_drag_info":"Vous pouvez faire glisser et déposer quelques éléments ci-dessous pour personnaliser ces onglets.",
                    "text_update_sueess":"Update Successfully..",
                    "text_email_exits":"This email already exits",
                   "text_activate": "Activate",
                   "text_deactivate": "Deactivate",
                   "text_staff": "Staff",
                   "text_admin": "Admin",
                   "msg_user_deactivate": "L'utilisateur a été désactivé.",
                   "msg_user_activate": "L'utilisateur a été activé.",
                   }
         }
STRIPE_SETTINGS ={'stripe_key_test_public':'pk_test_QQJjm8qIyrqX00dfiQYrPzSd','stripe_key_test_secret':'sk_test_gvT4ClANlRptQUH6Y6tB4baW'}
STRIPE_PLANS = {
        'user-0-percent-monthly': 'user-0-percent-monthly',
        'user-25-percent-yearly': 'user-25-percent-yearly',
        'user-40-percent-yearly': 'user-40-percent-yearly',
        'user-50-percent-yearly': 'user-50-percent-yearly',

        'crm-0-percent-monthly': 'crm-0-percent-monthly',
        'crm-25-percent-yearly': 'crm-25-percent-yearly',
        'crm-40-percent-yearly': 'crm-40-percent-yearly',
        'crm-50-percent-yearly': 'crm-50-percent-yearly',

        'sales-0-percent-monthly': 'sales-0-percent-monthly',
        'sales-25-percent-yearly': 'sales-25-percent-yearly',
        'sales-40-percent-yearly': 'sales-40-percent-yearly',
        'sales-50-percent-yearly': 'sales-50-percent-yearly',

        'opportunity-0-percent-monthly': 'opportunity-0-percent-monthly',
        'opportunity-25-percent-yearly': 'opportunity-25-percent-yearly',
        'opportunity-40-percent-yearly': 'opportunity-40-percent-yearly',
        'opportunity-50-percent-yearly': 'opportunity-50-percent-yearly',
}

PRICES ={
    'user_25_percent_yearly_price': 117,
    'user_0_percent_monthly_price': 13,
    'user_40_percent_yearly_price': 93.60,
    'user_50_percent_yearly_price': 90,
    'crm_25_percent_yearly_price': 45,
    'crm_0_percent_monthly_price': 5,
    'crm_40_percent_yearly_price': 36,
    'crm_50_percent_yearly_price': 30,
    'sales_25_percent_yearly_price': 81,
    'sales_0_percent_monthly_price': 9,
    'sales_40_percent_yearly_price': 64.80,
    'sales_50_percent_yearly_price': 54,
    'opportunity_25_percent_yearly_price': 27,
    'opportunity_0_percent_monthly_price': 3,
    'opportunity_40_percent_yearly_price': 21.60,
    'opportunity_50_percent_yearly_price': 18,
}
VAT ={'percent': 20, 'value':0.2}
DEFAULT_PROFILE_IMAGE = '/static/front/images/profile.png'
DEFAULT_COMPANY_LOGO ='/static/front/images/image-upload.png'
COLOR_CODES =['#808080','#800000','#808000','#00FF00','#008000','#FF00FF','#800080','#28df94','#73df28','#6f1439']
ADMIN_COLOR ='#df2873'
TIME_ZONE_NAME =['Africa/Abidjan','Africa/Accra','Africa/Accra','Africa/Addis_Ababa','Asia/Kolkata','Europe/Paris']
IMAGE_FILE_EXTENTIONS = ['.jpg', '.png', '.jpeg', '.PNG']
HOST_NAME_WITHOUT_SLASH = "http://app.saalz.com"
HOST_NAME = "http://app.saalz.com/"
SETTINGS_EXPORT = ['HOST_NAME',]
GLOBAL_SETTINGS = {
    'BASE_URL_SITE': 'http://app.saalz.com/',
    'PAGGING_LIMIT': 10
}
PAGGING_LIMIT = 50
LOCAL_HOST_NAME = 'http://127.0.0.1/'
