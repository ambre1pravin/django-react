import { translate} from 'crm_react/common/language';

export function get_contact_info(index, contact_list, return_type) {
    var return_value ='';
    if( contact_list.length > 0){
        contact_list.forEach(function(item, i) {
            if(i === index) {
                if(return_type == 'name') {
                    return_value = item.name;
                }else if(return_type =='first_name'){
                    return_value = item.first_name;
                }else if(return_type =='last_name'){
                    return_value = item.last_name;
                }else if(return_type =='id'){
                    return_value = item.id;
                }else if(return_type =='image'){
                    return_value = item.profile_image;
                }else if(return_type =='email'){
                    return_value = item.email;
                }else if(return_type =='phone'){
                    return_value = item.phone;
                }else if(return_type =='mobile'){
                    return_value = item.mobile;
                }else if(return_type =='street'){
                    return_value = item.street;
                }else if(return_type =='street2'){
                    return_value = item.street2;
                }else if(return_type =='zip'){
                    return_value = item.zip;
                }else if(return_type =='city'){
                    return_value = item.city;
                }else if(return_type =='country'){
                    return_value = item.country;
                }
            }
        });
    }
    return return_value
}

export function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length +1));
                break;
            }
        }
    }
    return cookieValue;
}

export function  get_input_value(index, field_id ,contact_list){
    var return_value ='';
    if(contact_list[index].fields !=undefined){
        contact_list[index].fields.forEach(function(fields_item, j) {
            if(field_id == fields_item.id){
                return_value = fields_item.value;
            }
       })
    }
    return return_value
}

export function delete_item_array(items, item_id){
    let items_array =  items;
         items_array.forEach(function(result, i) {
            if(result.id === item_id) {
              items_array.splice(i, 1);
            }
        });
    return items_array
}

export function processForm(form_id, sub_contact_profile_image_full_path, main_conatact_profile_image){
    console.log(form_id +" ::::: " + sub_contact_profile_image_full_path + " ::::: " + main_conatact_profile_image);
    var form_object = $(form_id);
    var contact = {};
    var fields =[];
    contact.name = form_object.find('input[name="name"]').val();
    contact.first_name = form_object.find('input[name="first-name"]').val();
    contact.last_name = form_object.find('input[name="last-name"]').val();
    contact.email = form_object.find('input[name="email"]').val();
    contact.phone = form_object.find('input[name="phone"]').val();
    contact.mobile = form_object.find('input[name="mobile"]').val();
    contact.street = form_object.find('input[name="street"]').val();
    contact.street2 = form_object.find('input[name="street2"]').val();
    contact.city = form_object.find('input[name="city"]').val();
    contact.zip = form_object.find('input[name="zip"]').val();
    contact.country = form_object.find('input[name="country"]').val();
    contact.tags = form_object.find('input[id="hidden_tags"]').val();
    contact.profile_image = (form_id == '#create-sub-contact-form') ? sub_contact_profile_image_full_path : main_conatact_profile_image;
    contact.fields = fields;
    form_object.find('div.form-group').each(function() {
        var ths = $(this),
        data_id = ths.attr('data-id');
        if(data_id > 0){
            var type = ths.attr('data-type'),
                name = ths.attr('data-name'),
                display_position = ths.attr('data-position');
            if(type === 'single-line' || type === 'drop-down' || type === 'date'|| type === 'phone'|| type === 'mobile'){

                var field = {"id":data_id, "value":ths.find('input').val(), "type":type, "name":name,"display_position": display_position};
                contact.fields.push(field);
            }
            if(type === 'multi-line'){
                var field = {"id":data_id, "value":ths.find('textarea').val(), "type":type, "name":name, "display_position":display_position};
                contact.fields.push(field);
            }
            if(type === 'checkbox'){
               var checkbox =[];
                $.each(ths.find('input[type="checkbox"]'), function(){
                    var c_this = $(this);
                    if(c_this.is(":checked")){
                        var chk ={'value':c_this.val(),'checked': true};
                        checkbox.push(chk);
                    }else{
                         var chk ={'value':c_this.val(),'checked': false};
                         checkbox.push(chk);
                    }
                });
                var field = {"id":ths.closest('div.form-group').attr('data-id'), "value":checkbox, "type":type, "name":name, "display_position":display_position};
                contact.fields.push(field);
            }
            if(type === 'radio'){
               var radio =[];
                $.each(ths.find('input[type="radio"]'), function(){
                    var c_this = $(this);
                    if(c_this.is(":checked")){
                        var chk ={'value':c_this.val(),'checked': true};
                        radio.push(chk);
                    }else{
                         var chk ={'value':c_this.val(),'checked': false};
                         radio.push(chk);
                    }
                });
                var field = {"id":ths.closest('div.form-group').attr('data-id'), "value":radio, "type":type, "name":name, "display_position": display_position};
                contact.fields.push(field);
            }
        }
    });
    console.log("return process form data");
    console.log(contact);
   return contact;
}


export function success_call_back(data){
    alert("hello");
    console.log(data);
    return  data;
}


export function validate_email(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

export let get_field_by_position = (fields, position) => {
            let left_side_fields = [];
            fields.filter((e, i) => {
                if (e.display_position == position) left_side_fields.push({ 'id':e.id,'type':e.type, 'name':e.name,
            'default_values':e.default_values,'input_value':'','display_position':e.display_position,'is_required':e.is_required })
            } );

    return left_side_fields
};

/*var newOne = () => {
 console.log("Hello World..!");
}*/

export function js_uc_first(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const modal_style = {overlay: {
                           position: 'fixed',
                           top: 0,
                           left: 0,
                           right: 0,
                           bottom: 0,
                           zIndex: 99999999,
                           overflow: 'hidden',
                           perspective: 1300,
                           backgroundColor: 'rgba(0, 0, 0, 0.3)'
                       },
                       content: {
                           position: 'relative',
                           margin: '1% auto',
                           width: '100%',
                           height: '100%',
                           border : '',
                           background: '',
                           overflow: '',
                           borderRadius: '',
                           outline: '',
                           boxShadow: '',
                       }
                    };

export const ModalbodyStyle = {overflow :'auto',maxHeight: '65vh'};

export function add_sub_contact_button_text(contact_name, is_company){
    let contact_type ='';
    if(is_company){
        contact_type = translate('label_company')
    }else{
        contact_type = translate('label_individual')
    }
    return translate('label_create_sub_contact') + ' to ' + contact_name  + ' ( ' + contact_type + ' )';
}

export function get_random_arbitrary(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export const applyDrag = (arr, dragResult) => {
  const { removedIndex, addedIndex, payload } = dragResult;
  if (removedIndex === null && addedIndex === null) return arr;

  const result = [...arr];
  let itemToAdd = payload;

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0];
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd);
  }

  return result;
};

export const generateItems = (count, creator) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(creator(i));
  }
  return result;
};

export const  make_unique=(a)=>{
    let unique = a.filter((it, i, ar) => ar.indexOf(it) === i);
    return unique;

};

export function is_string_blank (keyword){
    if(/\S/.test(keyword)){
        return true
    }else{
        return false
    }
};


export function is_int(n) {
    return n != "" && !isNaN(n) && Math.round(n) == n;
}

export function is_float(n){
    return n != "" && !isNaN(n) && Math.round(n) != n;
}

export const form_group = {borderStyle:'none'};
export const cursor_pointer = {cursor: 'pointer'};