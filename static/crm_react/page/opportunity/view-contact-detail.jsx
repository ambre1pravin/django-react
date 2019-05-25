import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL,IMAGE_PATH} from 'crm_react/common/state';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import MultiSelect from 'crm_react/page/contact/multiselect';
import FormDateField from 'crm_react/page/contact/form-date-field';
import {translate} from 'crm_react/common/language';

class ViewContactDetail extends Component{
    constructor(props) {
        super(props);

      this.state = {
            contact_name: '',
            left_fields : null,
            right_fields : null,
        }
      let left_fields, right_fields ,contact_name, profile_image;
      let title = this.props.title
        this.props.field.map((machine, i) =>{
            {
                if(machine.is_default_tab){
                    left_fields =machine.left_fields
                    right_fields =machine.right_fields
                    contact_name= machine.contact_name
                    profile_image= machine.profile_image
                }
            }
        })

      this.state = {
            contact_name: contact_name,
            left_fields : left_fields,
            right_fields : right_fields,
            title: title,
            profile_image:profile_image,
      }

      

    }
    componentWillReceiveProps(nextProps)
    {
        this.setState ({
            contact_name: '',
            left_fields : null,
            right_fields : null,
        });
        let left_fields, right_fields ,contact_name, profile_image;
      let title = nextProps.title
        nextProps.field.map((machine, i) =>{
            {
                if(machine.is_default_tab){

                    this.setState({
                        contact_name: machine.contact_name,
                        left_fields : machine.left_fields,
                        right_fields : machine.right_fields,
                        title: title,
                        profile_image:machine.profile_image,

                    });
                    
                }
            }
        })
        
    }
   _renderSingleLine(field_type,field_id,field_name,default_value,in_value){

        let  input_value = in_value !== undefined ? in_value :''
        switch(field_type) {
            case "single-line":
                 return <SingleLine key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                            default_value={default_value}/>
            case "phone":
                 return <SingleLine key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                            default_value={default_value}/>
            case "mobile":
                 return <SingleLine key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                            default_value={default_value}/>
            case "drop-down":
                return <DropDown key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                            default_value={default_value}/>
            case "checkbox":

                 let checkbox=[]
                 let string_to_arrr = (input_value) ? JSON.parse(input_value) : [];
                 if(string_to_arrr.length > 0){
                    for( var i = 0 ; i < string_to_arrr.length; i++){
                        var checked = (string_to_arrr[i].checked == 'true' || string_to_arrr[i].checked == true) ? true : false
                        var chk={'value':string_to_arrr[i].value,'checked': checked}
                        checkbox.push(chk);
                    }
                 }else{
                    if( typeof default_value !=undefined  && default_value != ''){
                        let default_value_new = default_value.split(',')
                        if(default_value_new .length > 0){
                             for( var i = 0 ; i < default_value_new.length; i++){
                                var chk ={'value':default_value_new[i],'checked': false}
                                 checkbox.push(chk);
                             }
                         }
                     }
                 }
                return <Checkbox key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                           default_value={checkbox}/>
            case "radio":
                 let radio=[]
                 let radio_arrr = (input_value) ? JSON.parse(input_value) : [];
                 if(radio_arrr.length > 0){
                    for( var i = 0 ; i < radio_arrr.length; i++){
                        var checked = (radio_arrr[i].checked == 'true' || radio_arrr[i].checked == true) ? true : false
                        var chk={'value':radio_arrr[i].value,'checked': checked}
                        radio.push(chk);
                    }
                 }else{
                    if( typeof default_value !=undefined  && default_value != ''){
                        let default_value_new = default_value.split(',')
                        if(default_value_new .length > 0){
                             for( var i = 0 ; i < default_value_new.length; i++){
                                var chk ={'value':default_value_new[i],'checked': false}
                                 radio.push(chk);
                             }
                         }
                     }
                 }
                return <Radio key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                            default_value={radio}/>
            case "multi-line":
                return <MultiLine key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                            default_value={default_value}/>
            case "multiselect":
                 let selected_tags =[]
                 let selected_tags_arrr = (input_value) ? JSON.parse(input_value) : [];
                 let all_tags = (this.props.tags != undefined && this.props.tags. length > 0 ) ? this.props.tags : []
                 if(selected_tags_arrr.length > 0){
                    for( var i = 0 ; i < selected_tags_arrr.length; i++){
                        var chk={
                            'value':selected_tags_arrr[i].id,
                            'name':selected_tags_arrr[i].name,
                            'color':selected_tags_arrr[i].color
                            }
                        selected_tags.push(chk);
                    }
                 }
                return <MultiSelect key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            tags ={this.props.tags}
                            input_value={input_value}
                            default_value={default_value}
                            selected_tags={selected_tags}/>
            case "date":
                return <FormDateField key={field_id}
                            data_id={field_id}
                            name={field_name}
                            type={field_type}
                            input_value={input_value}
                            default_value={default_value}/>

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

    _render_name_and_profile_image(contact_name){
        return (
                <tr>
                    <td>
                        <label className="text-muted control-label">Contact Name</label>
                     </td>
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
        return(
        this.state.left_fields.length ?
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>
                        { this._render_name_and_profile_image() }

                        
                        {
                            this.state.left_fields.map((f, k) =>{
                                {
                                    return this._renderSingleLine(f.type,f.id,f.name,f.default_value,f.input_value)
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
        return(
        this.state.right_fields.length?
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                <table className="detail_table">
                    <tbody>
                        {
                            this.state.right_fields.map((f, k) =>{
                                {
                                    
                                    return this._renderSingleLine(f.type,f.id,f.name,f.default_value,f.input_value)
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
            
            <form className="edit-form" id="main_contact_view_form">
                
                <div className="row">
                    {this.state.left_fields ? this._leftFieldsRender(this.state.left_fields,this.state.contact_name) : '' }
                    { this._rightFieldsRender(this.state.right_fields) }
                </div>
            </form>
           
        );
    }
    handleChange(index) {
        var form_data = this.processForm();
        this.props.onEditSubContact(index,form_data);
        let modal_id = 'edit-sub-contact-modal'
        ModalManager.close(<EditSubContactModal  modal_id = {modal_id}  onRequestClose={() => true} />);
    }
    
    processForm() {
        var form_object = $('#sub_contact_edit_form');
            var contact = {};
            var    fields =[];
                   contact.name = form_object.find('input[name="name"]').val();
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
                if(type === 'multiselect'){
                    var tags = [];
                    if(ths.find('ul.tagbox li').length > 0){
                        $.each(ths.find('ul.tagbox li'), function(t, li){
                            var tag = {'id': $(this).attr('data-id') , 'name':$(this).attr('data-tag-name'),'color':$(this).attr('data-color')}
                            tags.push(tag);
                        });
                    }
                    var field = {
                        "field_id":     data_id,
                        "field_value":  JSON.stringify(tags),
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
                            "field_value":  JSON.stringify(checkbox),
                            "field_type":   type

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
                            "field_id":     data_id,
                            "field_value":  JSON.stringify(radio),
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
            <div>

                    { this._renderBody() }

            </div>     

        
      );
   }
}

module.exports = ViewContactDetail;