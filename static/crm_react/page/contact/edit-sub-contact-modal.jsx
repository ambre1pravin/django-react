import React,{Component} from 'react';
import {NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import FormDateField from 'crm_react/page/contact/form-date-field';
import InputText from 'crm_react/page/contact/input-text';
import { translate} from 'crm_react/common/language';
import { modal_style, get_field_by_position , ModalbodyStyle } from 'crm_react/common/helper';

class EditSubContactModal extends Component{
    constructor(props) {
        super(props);

      this.state = {
            contact_name: '',
            first_name:this.props.fields.first_name,
            last_name:this.props.fields.last_name,
            email:this.props.fields.email,
            phone:this.props.fields.phone,
            mobile:this.props.fields.mobile,
            street:'',
            street2:'',
            zip:'',
            city:'',
            country:'',
            contact_id:0,
            fields : null,
            onRequestClose : this.props.onRequestClose,
            title : this.props.title,
      };

      this.state = {
            contact_id:this.props.fields.contact_id !=undefined ? this.props.fields.contact_id : 0,
            contact_name:this.props.fields.contact_name,
            first_name:this.props.fields.first_name,
            last_name:this.props.fields.last_name,
            email:this.props.fields.email,
            phone:this.props.fields.phone,
            mobile:this.props.fields.mobile,
            street:this.props.fields.street,
            street2:this.props.fields.street2,
            zip:this.props.fields.zip,
            city:this.props.fields.city,
            country:this.props.fields.country,
            profile_image: this.props.fields.profile_image,
            fields : this.props.fields.fields,
      }
    }


    render_field(field_type, field_id, field_name, default_value, in_value, display_position, is_required){
        let  input_value = in_value !== undefined ? in_value :'';

        var data = {'data_id':field_id,
                    'name':field_name,
                    'type':field_type,
                    'input_value': input_value,
                    'default_value':default_value,
                    'display_position':display_position,
                    'display_type':'',
                    'is_required':is_required
                };


        switch(field_type) {
            case "single-line":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "phone":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "mobile":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "drop-down":
                return <DropDown key={field_id}
                        component_data ={data}
                />;
            case "checkbox":
                return <Checkbox key={field_id}
                        component_data ={data}
                />;
            case "radio":
                return <Radio key={field_id}
                        component_data ={data}
                />;
            case "multi-line":
                return <MultiLine key={field_id}
                    component_data ={data}
                />;
            case "date":
                return <FormDateField key={field_id}
                        component_data ={data}
                />
        }
    }


    handle_change(name_type, e){
        if(name_type === 'first_name') {
            this.setState({first_name: e.target.value})
        }else if(name_type === 'last_name'){
            this.setState({last_name: e.target.value})
        }
    }


    render_contact_name(){
        let name = this.state.contact_name ? this.state.contact_name : '';
        return (
            <td className="fc-individual-name">
                <div className="form-group edit-name pull-left">
                    <input type="text" name="first-name" placeholder="First Name" value={this.state.first_name}
                           className="form-control tourist-place-1" onChange={this.handle_change.bind(this,'first_name')}/>
                </div>
                <div className="form-group edit-name pull-right">
                    <input type="text" name="last-name" placeholder="Last Name" value={this.state.last_name}
                           className="form-control" onChange={this.handle_change.bind(this,'last_name')}/>
                </div>
            </td>
        );
    }

    render_profile_image(){
        return (
            <td rowSpan="2">
                <div className="edit-dp">
                    <img width="98" height="98" className="img-circle custom_profile_image" data-index="main_form" id="uimage" src={this.state.profile_image} />
                       <span className="fa fa-pencil edit"></span>
                </div>
            </td>
        );
    }

     render_name_and_profile_image(contact_name){
        return (
                <tr>
                    { this.render_profile_image() }
                    { this.render_contact_name() }
                </tr>
        );
    }

    _renderCompanyName(){
        return (
                <tr>
                    <td></td>
                </tr>
        );
    }


    _leftFieldsRender(){
        let left_side_fields = [] ;
        console.log("Left Side");
        console.log(this.state.fields);
        this.state.fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={
                        'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'default_values':f.default_values,
                        'input_value':f.input_value,
                        'display_position':f.display_position
                    };
                    left_side_fields.push(fields_data)
               }
            }
        });
        return(
        left_side_fields.length > 0 ?
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>
                         { this.render_name_and_profile_image() }
                         { this._renderCompanyName() }

                         { <InputText value={this.state.phone} name='phone' label='Phone' /> }
                         { <InputText value={this.state.mobile} name='mobile' label='Mobile'/> }
                         { <InputText value={this.state.email} name='email' label='Email' /> }
                         { <InputText value={this.state.street} name='street' label='Street'/> }
                         { <InputText value={this.state.street2} name='street2'label='Street2' /> }
                         { <InputText value={this.state.zip} name='zip' label='Zip'/> }
                         { <InputText value={this.state.city} name='city' label='City'/> }
                         { <InputText value={this.state.country} name='country' label='Country'/> }

                         {
                            left_side_fields.map((f, k) =>{
                                {
                                    return this.render_field(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position, f.is_required)
                                }
                            })
                         }
                    </tbody>
                </table>
            </div>
        :null
        );
    }


    _rightFieldsRender(){
        let right_side_fields = [] ;
        this.state.fields.map((f, k) =>{
            {
                if(f.display_position == 'right'){
                    var fields_data ={
                        'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'default_values':f.default_values,
                        'input_value':f.input_value,
                        'display_position':f.display_position
                    };
                    right_side_fields.push(fields_data)
                }
            }
        });
        return(
        right_side_fields.length > 0 ?
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                <table className="detail_table">
                    <tbody>
                        {
                            right_side_fields.map((f, k) =>{
                                {
                                    return this.render_field(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position, f.is_required)
                                }
                            })
                        }
                    </tbody>
                </table>
            </div>
        :null
        );
    }

    _renderBody(){
        return (
            <div className="modal-body">
            <form className="edit-form" id="sub_contact_edit_form">
                <div className="tab-pane active">
                <div className="row">
                    { this._leftFieldsRender() }
                    { this._rightFieldsRender() }
                </div>
                </div>
            </form>
            </div>
        );
    }

    handle_save(index) {
        var form_object = $('#sub_contact_edit_form');
        if (form_object.valid()) {
            var form_data = this.process_form();
            this.props.onEditSubContact(index,form_data);
            let modal_id = 'edit-sub-contact-modal';
            ModalManager.close(<EditSubContactModal  modal_id = {modal_id}  onRequestClose={() => true} />);
        }else{
            NotificationManager.error('Please enter name.', 'Error',5000);
        }
    }

    handle_close(index) {
        ModalManager.close(<EditSubContactModal  modal_id = "edit-sub-contact-modal"  onRequestClose={() => true} />);
    }

    process_form() {
        var form_object = $('#sub_contact_edit_form');
            var contact = {};
            var    fields =[];
                   contact.id = this.state.contact_id;
                   contact.name = form_object.find('input[name="name"]').val();
                   contact.first_name = form_object.find('input[name="first-name"]').val();
                   contact.last_name = form_object.find('input[name="last-name"]').val();
                   contact.email = form_object.find('input[name="email"]').val();
                   contact.phone = form_object.find('input[name="phone"]').val();
                   contact.mobile = form_object.find('input[name="mobile"]').val();
                   contact.street = form_object.find('input[name="street"]').val();
                   contact.street2 = form_object.find('input[name="street2"]').val();
                   contact.zip = form_object.find('input[name="zip"]').val();
                   contact.city = form_object.find('input[name="city"]').val();
                   contact.country = form_object.find('input[name="country"]').val();
                   contact.fields = fields;
                   contact.profile_image= this.state.profile_image;
        form_object.find('div.form-group').each(function() {
            var ths = $(this),
            data_id = ths.attr('data-id');
            if(data_id > 0){
                var value  =  ths.find('input').val(),
                    type = ths.attr('data-type');
                if(type === 'single-line' || type === 'drop-down' || type === 'date' || type === 'phone'|| type === 'mobile'){
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
                    "value":   ths.find('textarea').val(),
                    "type":   type
                    };
                    contact.fields.push(field);
                }
                if(type === 'multiselect'){
                    var tags = [];
                    if(ths.find('ul.tagbox li').length > 0){
                        $.each(ths.find('ul.tagbox li'), function(t, li){
                            var tag = {'id': $(this).attr('data-id') , 'name':$(this).attr('data-tag-name'),'color':$(this).attr('data-color')};
                            tags.push(tag);
                        });
                    }
                    var field = {
                        "id":     data_id,
                        "value":  tags,
                        "type":   type
                    };
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
                    var field = {
                            "id":     data_id,
                            "value":  checkbox,
                            "type":   type

                    };
                    //console.log(JSON.stringify(checkbox))
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
                    var field = {
                            "id":     data_id,
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
      return (
         <Modal
           style={modal_style}
            onRequestClose={this.state.onRequestClose}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg sub-contact module__contact module__contact-create in">
                <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handle_close.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">{this.props.title}</h4>
                    </div>
                    <div className="modal-body" style={ModalbodyStyle}>
                        { this._renderBody() }
                    </div>
                    <div  className="modal-footer">
                        <button className="btn btn-default" type="button" onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                        {
                          (this.props.display_type  != 'view')?
                            <button className="btn btn-primary" type="button" onClick={this.handle_save.bind(this,this.props.index,this.props.field)}>{translate('button_save')}</button>
                          :null
                        }
                    </div>

                </div>
            </div>
         </Modal>
      );
   }
}

module.exports = EditSubContactModal;