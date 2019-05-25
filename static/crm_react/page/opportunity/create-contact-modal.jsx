import React,{Component} from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {NotificationManager} from 'react-notifications';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import MultiSelect from 'crm_react/page/contact/multiselect';
import FormDateField from 'crm_react/page/contact/form-date-field';
import InputText from 'crm_react/page/contact/input-text';
import state, {IMAGE_PATH} from 'crm_react/common/state';
import { getCookie , get_field_by_position,  modal_style, ModalbodyStyle} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';


class CreateContactModal extends Component{
    constructor(props) {
        super(props);
          this.state = {
                company_name: this.props.company_name,
                email:'',
                phone:'',
                mobile:'',
                street:'',
                street2:'',
                city:'',
                zip:'',
                country:'',
                fields : this.props.field,
                title: this.props.title,
                profile_image:'/static/front/images/profile.png',
                tags: this.props.tags,
          }
    }

    render_field(field_type,field_id,field_name,default_value, in_value,display_position, is_required){
        let  input_value = in_value !== undefined ? in_value :''
        var data = {'data_id':field_id,
                    'name':field_name,
                    'type':field_type,
                    'input_value': input_value,
                    'default_value':default_value,
                    'display_position':display_position,
                    'display_type':'',
                    'is_required':is_required,
                }


        switch(field_type) {
            case "single-line":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />
            case "phone":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />
            case "mobile":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />
            case "drop-down":
                return <DropDown key={field_id}
                        component_data ={data}
                />
            case "checkbox":
                return <Checkbox key={field_id}
                        component_data ={data}
                />
            case "radio":
                return <Radio key={field_id}
                        component_data ={data}
                />
            case "multi-line":
                return <MultiLine key={field_id}
                    component_data ={data}
                />
            case "multiselect":
                return <MultiSelect key={field_id}
                           component_data ={data}
                           tags ={this.state.tags}
                />
            case "date":
                return <FormDateField key={field_id}
                        component_data ={data}
                />
        }
    }

    handle_change(e){
        this.setState({company_name:e.target.value})
    }

    render_contact_name(){
        let name = this.state.company_name
        return (
            <td>
                <div className="form-group">
                    <input type="text" value={name} onChange={this.handle_change.bind(this)} className="edit-input form-control" required="required" ref="name" placeholder={translate('label_name')} name="name" id="name" />
                </div>
            </td>
        );
    }

    render_profile_image(){
         let profile_image = this.state.profile_image
         let image_src =  IMAGE_PATH + profile_image
        return (
            <td rowSpan="2">
                <div className="edit-dp">
                   <img width="98" height="98" className="img-circle custom_profile_image" data-index="main_form" id="uimage" src={image_src}/>
                </div>
            </td>
        );
    }

    render_name_and_profile_image(){
        return (
                <tr>
                    { this.render_profile_image() }
                    { this.render_contact_name() }
                </tr>
        );
    }

    render_company_name(){
        return (
                <tr>
                    <td></td>
                </tr>
        );
    }

    left_fields_render(){
        let left_side_fields = [] ;
        let fields = this.state.fields;
        left_side_fields = get_field_by_position(fields,'left')
        return(

            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>
                         { this.render_name_and_profile_image() }

                         { this.render_company_name() }

                         { <InputText value="" name='phone' label='Phone' /> }
                         { <InputText value="" name='mobile' label='Mobile'/> }
                         { <InputText value="" name='email' label='Email' /> }
                         { <InputText value="" name='street' label='Street'/> }
                         { <InputText value="" name='street2'label='Street2' /> }
                         { <InputText value="" name='zip' label='Zip'/> }
                         { <InputText value="" name='city' label='City'/> }
                         { <InputText value="" name='country' label='Country'/> }

                         { left_side_fields.length > 0 ?
                            left_side_fields.map((f, k) =>{
                                {
                                    return this.render_field(f.type,f.id,f.name,f.default_values,f.default_values,f.display_position, f.is_required)
                                }
                             })
                            :null
                         }
                    </tbody>
                </table>
            </div>

        );
    }


    right_fields_render(){
        let right_side_fields = [] ;
        let fields = this.state.fields;
        right_side_fields = get_field_by_position(fields,'right')
        return(

            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                <table className="detail_table">
                    <tbody>
                        { right_side_fields.length > 0 ?
                            right_side_fields.map((f, k) =>{
                                {
                                    return this.render_field(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position, f.is_required)
                                }
                            })
                            :null
                        }
                    </tbody>
                </table>
            </div>
        );
    }

    render_body(){
        let left_fields, right_fields ,contact_name;
        this.props.field.map((machine, i) =>{
            {
                if(machine.is_default_tab){
                    left_fields =machine.left_fields
                    right_fields =machine.right_fields
                    contact_name= machine.contact_name
                }
            }
        })

        return (
            <div className="modal-body" style={ModalbodyStyle}>
            <form className="edit-form" id={this.props.form_id}>
                <div className="tab-pane active">
                <div className="row">
                    { this.left_fields_render() }
                    { this.right_fields_render() }
                </div>
                </div>
            </form>
            </div>
        );
    }

    handle_lang_change(index) {
        var form_data = this.process_form();
        this.props.onChildClick(index,form_data);

    }

    handle_company_modal(index) {
        ModalManager.close(<CreateCompanyNewModal modal_id = "create-company-modal"  onRequestClose={() => true} />);
    }

    handle_create_company(){
        if ( $('#create-company-form').valid()) {
            var csrftoken = getCookie('csrftoken');
            var contact = {}
            var main_form_data = this.process_form('#create-company-form')
                contact.main = main_form_data
            var subcontacts = this.state.subcontacts
            contact.subcontacts = subcontacts
            console.log(contact)
            $.ajax({
                 type: "POST",
                 cache: false,
                 dataType: "json",
                 url: '/contact/company_create_edit/',
                 data: {
                    contact :JSON.stringify(contact),
                    csrfmiddlewaretoken: csrftoken
                 },
                beforeSend: function () {
                    ///this.setState({save_button_disable:false})
                }.bind(this),
                success: function (data) {
                   if(data.success === true){
                       var contact_data ={'contact_id':data.contact_id,'contact_name':data.contact_name}
                       this.props.company_create_edit(contact_data)
                       ModalManager.close(<CreateCompanyNewModal modal_id = "create-company-modal"  onRequestClose={() => true} />);
                       NotificationManager.success('Company Created!', 'Success message',5000);
                   }else{
                        NotificationManager.error("Error", 'Error',5000);
                   }

                }.bind(this)
            });
        }else{
           NotificationManager.error('Please enter name.', 'Error', 5000, () => {

           });
        }
    }

    process_form(form_id) {
        var form_object = $(form_id);
        var contact = {};
        var fields =[];
           contact.name = form_object.find('input[name="name"]').val();
           contact.email = form_object.find('input[name="email"]').val();
           contact.phone = form_object.find('input[name="phone"]').val();
           contact.mobile = form_object.find('input[name="mobile"]').val();
           contact.street = form_object.find('input[name="street"]').val();
           contact.street2 = form_object.find('input[name="street2"]').val();
           contact.city = form_object.find('input[name="city"]').val();
           contact.zip = form_object.find('input[name="zip"]').val();
           contact.country = form_object.find('input[name="country"]').val();
           contact.contact_type = 'C';
           contact.profile_image= this.state.profile_image;
           contact.fields = fields;
        form_object.find('div.form-group').each(function() {
            var ths = $(this),
            data_id = ths.attr('data-id');
            if(data_id > 0){
                var type = ths.attr('data-type');
                if(type === 'single-line' || type === 'drop-down' || type === 'date'|| type === 'phone'|| type === 'mobile'){
                    var field = {
                            "id":     data_id,
                            "value":  ths.find('input').val(),
                            "type":   type
                            };
                    contact.fields.push(field);
                }
                if(type === 'multi-line'){
                    var field = {
                    "id":     data_id,
                    "value":  ths.find('textarea').val(),
                    "type":   type
                    };
                    contact.fields.push(field);
                }
                if(type === 'multiselect'){
                    var tags = [];
                    if(ths.find('ul.tagbox li').length > 0){
                        $.each(ths.find('ul.tagbox li'), function(t, li){
                            var tag = {'id': $(this).attr('data-id') , 'name':$(this).attr('data-tag-name'),'color':$(this).attr('data-color')}
                            tags.push(tag);
                        });
                    }
                    var field = {
                        "id":     data_id,
                        "value":  tags,
                        "type":   type,
                        "name":   name
                    };
                    contact.fields.push(field);
                }
                if(type === 'checkbox'){
                   var checkbox =[];
                    $.each(ths.find('input[type="checkbox"]'), function(){
                        var c_this = $(this);
                        if(c_this.is(":checked")){
                            var chk ={'value':c_this.val(),'checked': true}
                            checkbox.push(chk);
                        }else{
                             var chk ={'value':c_this.val(),'checked': false}
                             checkbox.push(chk);
                        }
                    });
                    var field = {
                            "id":     ths.closest('div.form-group').attr('data-id'),
                            "value":  checkbox,
                            "type":   type

                    };
                    contact.fields.push(field);
                }
                if(type === 'radio'){
                   var radio =[];
                    $.each(ths.find('input[type="radio"]'), function(){
                        var c_this = $(this);
                        if(c_this.is(":checked")){
                            var chk ={'value':c_this.val(),'checked': true}
                            radio.push(chk);
                        }else{
                             var chk ={'value':c_this.val(),'checked': false}
                             radio.push(chk);
                        }
                    });
                    var field = {
                            "id":     ths.closest('div.form-group').attr('data-id'),
                            "value":  radio,
                            "type":   type

                    };
                    contact.fields.push(field);
                }
            }
        });
       return contact;
    }

   render(){
      const { field, onRequestClose, title, modal_id, form_id } = this.props;
      return (
         <Modal
            style={modal_style}
            onRequestClose={onRequestClose}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg">
            <div className="modal-content">
                <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handle_company_modal.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                    <h4 className="modal-title">{title}</h4>
                </div>
                { this.render_body() }
                <div  className="modal-footer">
                    <button className="btn btn-default" type="button" onClick={this.handle_company_modal.bind(this)}>{translate('button_close')}</button>
                    <button className="btn btn-primary" type="button" onClick={this.handle_create_company.bind(this)}>{translate('button_save')}</button>
                </div>
            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = CreateContactModal;
