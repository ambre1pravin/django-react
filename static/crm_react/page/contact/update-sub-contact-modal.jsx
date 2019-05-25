import React,{Component} from 'react';
import {NotificationManager} from 'react-notifications';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import state, {MACHINE_DEFAULT_DATA,IMAGE_PATH} from 'crm_react/common/state';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import FormDateField from 'crm_react/page/contact/form-date-field';
import { translate} from 'crm_react/common/language';
import { modal_style } from 'crm_react/common/helper';

class UpdateSubContactModal extends Component{
    constructor(props) {
        super(props);

      this.state = {
            contact_name: '',
            contact_id:0,
            fields : null,
            onRequestClose : this.props.onRequestClose,
            title : this.props.title,
      }

      this.state = {
            contact_id: this.props.data.contact_id !=undefined ? this.props.data.contact_id : 0,
            contact_name: this.props.data.name,
            profile_image: this.props.data.profile_image,
            fields : this.props.data.fields,
            tags : this.props.data.tags,
      }

    }


    renderField(field_type, field_id, field_name, default_value, in_value, display_position){
        let  input_value = in_value !== undefined ? in_value :''

        var data = {'data_id':field_id,
                    'name':field_name,
                    'type':field_type,
                    'input_value': input_value,
                    'default_value':default_value,
                    'display_position':display_position,
                    'display_type':'',
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
            case "date":
                return <FormDateField key={field_id}
                        component_data ={data}
                />
        }
    }


    handleChangeName(e){
        this.setState({contact_name:e.target.value})
    }


    _render_contact_name(){
        let name = this.state.contact_name ? this.state.contact_name : ''
        return (
            <td>
                <div className="form-group">
                    <input type="text" value={name} onChange={this.handleChangeName.bind(this)} className="edit-input form-control" required="required" ref="name"  name="name" id="name" />
                </div>
            </td>
        );
    }

    _render_profile_image(){
         let profile_image = this.state.profile_image
         let image_src =  IMAGE_PATH + '/'+ profile_image
        return (
            <td rowSpan="2">
                <div className="edit-dp">
                    <img width="98" height="98" className="img-circle custom_profile_image" data-index="main_form" id="uimage" src={image_src} />
                       <span className="fa fa-pencil edit"></span>
                </div>
            </td>
        );
    }

     _render_name_and_profile_image(contact_name){
        return (
                <tr>
                    { this._render_profile_image() }
                    { this._render_contact_name() }
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
        console.log("Left Side")
        console.log(this.state.fields)
        this.state.fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={
                        'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'default_values':f.default_values,
                        'input_value':f.value,
                        'display_position':f.display_position
                    }
                    left_side_fields.push(fields_data)
               }
            }
        })
        return(
        left_side_fields.length > 0 ?
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>
                        { this._render_name_and_profile_image() }

                        { this._renderCompanyName() }
                        {
                            left_side_fields.map((f, k) =>{
                                {
                                    return this.renderField(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position)
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
         console.log("right Side")

        this.state.fields.map((f, k) =>{
            {
                if(f.display_position == 'right'){
                    var fields_data ={
                        'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'default_values':f.default_values,
                        'input_value':f.value,
                        'display_position':f.display_position
                    }
                    right_side_fields.push(fields_data)
                }
            }
        })
        //console.log(right_side_fields)
        return(
        right_side_fields.length > 0 ?
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                <table className="detail_table">
                    <tbody>
                        {
                            right_side_fields.map((f, k) =>{
                                {
                                    return this.renderField(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position)
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

    handleSave(index) {
        var form_object = $('#sub_contact_edit_form');
        if (form_object.valid()) {
            var form_data = this.processForm();
            this.props.onEditSubContact(index,form_data);
            let modal_id = 'edit-sub-contact-modal'
            ModalManager.close(<UpdateSubContactModal  modal_id = {modal_id}  onRequestClose={() => true} />);
        }else{
            NotificationManager.error('Please enter name.', 'Error',5000);
        }
    }

    handleClose(index) {
        ModalManager.close(<UpdateSubContactModal  modal_id = "view-sub-contact-modal"  onRequestClose={() => true} />);
    }

    processForm() {
        var form_object = $('#sub_contact_edit_form');
            var contact = {};
            var    fields =[];
                   contact.name = form_object.find('input[name="name"]').val();
                   contact.contact_id = this.state.contact_id;
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
                            "field_id":     data_id,
                            "field_value":  ths.find('input').val(),
                            "field_type":   type
                            };
                    contact.fields.push(field);
                }
                if(type === 'multi-line'){
                    var field = {
                    "field_id":     data_id,
                    "field_value":   ths.find('textarea').val(),
                    "field_type":   type
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
                            "field_id":     data_id,
                            "field_value":  checkbox,
                            "field_type":   type

                    };
                    console.log(JSON.stringify(checkbox))
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
                            "field_id":     data_id,
                            "field_value":  radio,
                            "field_type":   type

                    };
                    contact.fields.push(field);
                }
            }

        });
       return contact;
    }

   render(){
        var bodyStyle = {overflow :'auto',maxHeight: '75vh'}
      return (
         <Modal
             style={modal_style}
            onRequestClose={this.state.onRequestClose}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handleClose.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">{this.props.title}</h4>
                    </div>
                    <div className="modal-body" style={bodyStyle}>
                        { this._renderBody() }
                    </div>
                    <div  className="modal-footer">
                        <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('button_close')}</button>
                        {
                          (this.props.display_type  != 'view')?
                            <button className="btn btn-primary" type="button" onClick={this.handleSave.bind(this,this.props.index,this.props.field)}>{translate('button_save')}</button>
                          :null
                        }
                    </div>

                </div>
            </div>
         </Modal>
      );
   }
}

module.exports = UpdateSubContactModal;