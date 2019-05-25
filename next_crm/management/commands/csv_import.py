from django.core.management.base import BaseCommand
from next_crm.views.Auth import insert_default_data_fields,save_temp_data
from next_crm.models import ContactFieldsValue,ContactFields,DefaultDataFields,ContactTab,ContactTags,Contact
from django.contrib.auth.models import User
import csv
from django.conf import settings
import os
import glob
import sys
class Command(BaseCommand):
    def handle(self, *args, **options):
        self.import_file()

    def import_file(self):
        try:
            with open(settings.CSV_FILE, "r", encoding="utf-8") as csvfile:
                dialect = csv.Sniffer().sniff(csvfile.read(), delimiters=';,')
                csvfile.seek(0)
                reader = csv.reader(csvfile, dialect=dialect)
            #with open(settings.CSV_FILE, "r", encoding="utf-8") as infile:
                #reader = csv.reader(infile, delimiter=';,', skipinitialspace=True)
                file_rows = []
                try:
                    column_headers = ["Name", "193", "193", "194", "196", "194", "197", "198", "199","0","0"]
                    print(column_headers)
                    for line_number, row in enumerate(reader):
                        if line_number < 2:
                            temp_dic = {}
                            for idx, col in enumerate(column_headers):
                                temp_list = []
                                if col !='0':
                                    if row[idx]:
                                        if column_headers[idx] in temp_dic:
                                                print("found")
                                                temp_list.append(temp_dic[column_headers[idx]])
                                                temp_list.append(row[idx])
                                                temp_dic[column_headers[idx]] = temp_list
                                        else:
                                            temp_dic[column_headers[idx]] = row[idx]
                            file_rows.append(temp_dic)
                    if len(file_rows) > 0:
                        self.format_and_save_contact(file_rows)
                except csv.Error as e:
                    sys.exit('file %s, line %d: %s' % (settings.CSV_FILE, reader.line_num, e))
        except IOError as e:
            print ("I/O error({0}): {1}".format(e.errno, e.strerror))

    def format_and_save_contact(user_id, list_data):
        contact_data_list = []
        for i, d in enumerate(list_data):
            fields_list = []
            contact_data = {'name': '', 'is_vendor': False, 'is_customer': True, 'contact_type': 'I',
                            'profile_image': '', 'user_id': user_id, 'company_id': 0,
                            'parent_id': 0,
                            'fields': []
                            }
            contact_data['profile_image'] = 1
            for key in d:
                if type(d[key]) is list:
                    field_value =  ",".join(d[key])
                else:
                    field_value = d[key]
                if key == 'name':
                    contact_data['name'] = field_value
                else:
                    temp_dic = {'id': key, 'value': field_value}
                    fields_list.append(temp_dic)
            contact_data['fields'] = fields_list

            print(contact_data)
            contact_data_list.append(contact_data)

        return True
    def process_line(self, line):
        line_elements = line
        column_headers = ["Name","193","194","194","196","197","198","199"]

        '''rows_data = result.get("rows")
        column_headers = result.get('columnHeaders')
        if rows_data:
            for row in rows_data:
                row_data = {}
                for idx, col in enumerate(column_headers):
                    row_data[col['name']] = row[idx]
                ga_data.append(row_data)'''
        #print(line_elements[0])
        #print(line_elements[1])
        print(line_elements[2])
        print(line_elements[3])
        print(line_elements[4])
        print(line_elements[5])
        #self.contact_default_field(8)
        #print(line_elements[6])
        #print(line_elements[7])
        #print(line_elements[8])
        #print(line_elements[9])
        #print(line_elements[10])
        #print(line_elements[11])
        #print(line_elements[12])
        #print(line_elements[13])
        #print(line_elements[14])


    def file_len(self,file_name):
        with open(file_name) as f:
            i = 0
            for i, l in enumerate(f):
                pass
        return i + 1

    def contact_default_field(self, user_id):
        field_list = []
        contact_field_value = ContactFields.objects.filter(user_id=user_id).filter(is_default=True).order_by('display_weight')
        if contact_field_value:
            for field in contact_field_value:
                field_dic = {'id':field.id, 'name':field.name}
                field_list.append(field_dic)
        print(field_list)