import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL,IMAGE_PATH} from 'crm_react/common/state';
import ContactFormDefaultTabContent from 'crm_react/page/contact/contact-form-default-tab-content';
import ContactFormOtherTabContent from 'crm_react/page/contact/contact-form-other-tab-content';
import EditSubContactModal from 'crm_react/page/contact/edit-sub-contact-modal';
import CreateSubContactModal from 'crm_react/page/contact/create-sub-contact-modal';



class  ContactView extends React.Component {

	constructor(props) {
        super(props);

        this.state = {
            edit_result: null,
            tabs: null,
            subcontacts: [],
            tags:[],
            displayTags:[],
            companies:[],
            companies_ajax:false,
            company_name:'',
            c_name:'',
            sub_contact:[],
            sub_contact_open_modal_state:true,
            single_contact: [],
            sub_conact_color_count: 0,
            default_fields:null,
            sub_contact_profile_image_full_path: IMAGE_PATH +'/' + 'image_0'+  '.png',
            contact_name:'',
            profile_image:'',
            is_vendor: null,
            is_customer:null,
            is_company:null,
            is_individual:true,
            has_subcontact: false,
            title : this.props.title,
            email:'',
            contact_id:'',
            parent_id:0,
            contact_company_id:0,
            contact_company_name:'',
        }
        this.handleSubContactCreateSaveClick = this.handleSubContactCreateSaveClick.bind(this)
        this.handleEditSubContactEditSaveClick = this.handleEditSubContactEditSaveClick.bind(this)
        this.callbackParent = this.callbackParent.bind(this)
        this.handleCompanyChange = this.handleCompanyChange.bind(this)
        this.handleCreateEditComapny = this.handleCreateEditComapny.bind(this)

        this.serverRequest = $.get(BASE_FULL_URL+'/contact/field/', function (data) {
            let temp_array = {};
             data.map((machine, i) =>{
                {
                    machine.tabs.map((field, j) =>{
                        if(field.is_default_tab ){
                            temp_array.is_default_tab = field.is_default_tab
                            temp_array.tab_id = field.tab_id
                            temp_array.tab_name = field.tab_name
                            temp_array.contact_name = ''
                            temp_array.left_fields = [];
                            temp_array.right_fields = [];
                            if(field.left_fields !== undefined){
                                field.left_fields.map((l_field, k) =>{
                                    var left_side_field = {
                                        "id":     l_field.id,
                                        "type":   l_field.type,
                                        "name":   l_field.name,
                                        "default_value": l_field.defaultValues,
                                        "input_value":l_field.contactFieldValue,
                                    };
                                    temp_array.left_fields.push(left_side_field)
                                });
                            }
                            if(field.right_fields !== undefined){
                                field.right_fields.map((r_field, k) =>{
                                    var right_side_field = {
                                        "id":     r_field.id,
                                        "name":  r_field.name,
                                        "type":   r_field.type,
                                        "default_value":  r_field.defaultValues,
                                        "input_value": r_field.contactFieldValue,
                                    };
                                    temp_array.right_fields.push(right_side_field)
                                });
                            }
                        }
                    })
                }
            })
            let default_fields = [];
                default_fields.push(temp_array);
            this.setState({
                    result:data,
                    tabs:data,
                    default_fields : default_fields

            });
        }.bind(this));

        this.serverRequest = $.get(BASE_FULL_URL+'/contact/viewajax/'+this.props.selectid+'/', function (data) {

            let is_vendor = (data.is_vendor == 1) ? true : null
            let is_customer = (data.is_customer == 1) ? true : null
            let is_individual = (data.contact_type == 'Individual') ? true : false
            let is_company = (data.contact_type == 'Company') ? true : null
            let email = (data.email != undefined) ? data.email : ''
            let contact_id = (data.id != undefined) ? data.id : ''
            let parent_id = (data.parent_id != undefined) ? data.parent_id : 0
            let contact_company_id = (data.contact_company_id != undefined) ? data.contact_company_id : 0
            let contact_company_name = (data.contact_company_name != undefined) ? data.contact_company_name : ''

            this.setState({
                 edit_result :  data.fields,
                 contact_name : data.contact_name,
                 profile_image :data.profile_image,
                 is_vendor : is_vendor,
                 is_customer :is_customer,
                 is_individual:is_individual,
                 is_company:is_company,
                 email: email,
                 contact_id:contact_id,
                 parent_id:parent_id,
                 contact_company_id:contact_company_id,
                 contact_company_name:contact_company_name,
            });
            if(data.subcontact !=undefined){
                let subcontacts =[];
                    data.subcontact.map((contact, i) =>{
                        let temp_array = {};
                        var fields =[];
                          temp_array.name = contact.name
                          temp_array.contact_id = contact.id
                          temp_array.profile_image = contact.profile_image
                          temp_array.fields =fields;

                          if(contact.fields.left_fields !== undefined){
                              contact.fields.left_fields.map((field, j)=>{
                                var temp_field = {
                                        "field_id":     field.id,
                                        "field_value":  field.contactFieldValue,
                                        "field_type":   field.type,
                                        "field_name":   field.name
                                    };
                                    temp_array.fields.push(temp_field);
                                });
                          }
                          if(contact.fields.right_fields !== undefined){
                              contact.fields.right_fields.map((field, k)=>{
                                   var temp_field  = {
                                        "field_id":     field.id,
                                        "field_value":  field.contactFieldValue,
                                        "field_type":   field.type,
                                        "field_name":   field.name
                                    };
                                    temp_array.fields.push(temp_field);
                               });
                          }
                          subcontacts.push(temp_array)
                    });
                    this.setState({ subcontacts : subcontacts})
            }

        }.bind(this));


        /*** Fetch tags ***/
        this.serverRequest = $.get(BASE_FULL_URL+'/contact/tags/', function (tagdata) {
          this.setState({
                tags:tagdata,
                displayTags:tagdata,
          });
        }.bind(this));

        /*** Fetch companies ***/
        this.serverRequest = $.get(BASE_FULL_URL+'/contact/company/', function (company) {
          this.setState({
                companies:company,
                companies_ajax :true
          });

        }.bind(this));



    }
    handleIsVender(event){
       this.setState({is_vendor: event.target.checked});
    }

    handleIsCustomer(event){
     this.setState({is_customer: event.target.checked})
    }

    handleIsCompany(event){
         if(event.target.checked){
            this.setState({is_company: true})
            this.setState({is_individual: false})
         }else{
            this.setState({is_company: false})
            this.setState({is_individual: true})
         }
    }

    handleIsIndvidual(event){
        if(event.target.checked){
            this.setState({is_company: false})
            this.setState({is_individual: true})
        }else{
            this.setState({is_company: true})
            this.setState({is_individual: false})
        }
    }

    callbackParent(company_name){
        this.setState({c_name:company_name});
    }

    //on change company
    handleCompanyChange(company_id){
       if(company_id > 0){
           this.setState({contact_company_id:company_id});
       }
    }

    handleRemoveSubContact(index){
       let subcontacts =  this.state.subcontacts;
         subcontacts.forEach(function(result, i) {
            if(i === index) {
              subcontacts.splice(i, 1);
            }
        });
        this.setState({subcontacts: subcontacts});
    }

    /*** open Modal for create new subcontact **/
    openCreateSubContactModal(){
         if(this.state.default_fields.length > 0 ){
            let remainder = this.state.subcontacts.length % 10;
            let default_profile_image = 'image_'+ remainder  + '.png'
            let sub_contact_profile_image_full_path = IMAGE_PATH +'/' + default_profile_image
            this.setState({sub_contact_profile_image_full_path : default_profile_image})
            ModalManager.open(<CreateSubContactModal
                    field ={this.state.default_fields}
                    title = "Create Contact"
                    modal_id = "create-sub-contact-modal"
                    form_id =  "create-sub-contact-form"
                    profile_image ={default_profile_image}
                    onRequestClose={() => this.state.sub_contact_open_modal_state}
                    tags = {this.state.tags}
                    onChildClick ={ this.handleSubContactCreateSaveClick.bind(null)}/>
               );
         }
    }
    /** New subcontact Save button handle*/
    handleSubContactCreateSaveClick(index) {
        var form_object = $('#create-sub-contact-form');
        if (form_object.valid()) {
            var subcontactName = form_object.find('input[name="name"]').val()
            var form_data =  this.processForm('#create-sub-contact-form');
            let subcontacts = this.state.subcontacts;
            subcontacts.push(form_data);
            this.setState({subcontacts: subcontacts});
            this.setState({sub_contact_open_modal_state:true})
            form_object[0].reset();
            ModalManager.close(<CreateSubContactModal modal_id = "create-sub-contact-modal" onRequestClose={() => true} />);
        }else{
            NotificationManager.error('Please enter name.', 'Error',5000);
        }
    }
    handleEditSubContactEditSaveClick(index ,fields_data){
           let subcontacts =  this.state.subcontacts
             subcontacts.forEach(function(result, i) {
                if(i === index) {
                  subcontacts[i] = fields_data;
                }
            });
        this.setState({subcontacts: subcontacts});
        ModalManager.close(<EditSubContactModal onRequestClose={() => true}/>);
    }
    /* open modal for Edit sub contact*/
    openEditSubContactModal(index){
        this.setState({single_contact :[]});
        let temp_array = {};
        if(this.state.default_fields.length > 0){
             this.state.default_fields.map((field, i) =>{
                {
                    if(field.is_default_tab ){
                        temp_array.is_default_tab = field.is_default_tab
                        temp_array.sub_contact_index = index
                        temp_array.tab_id = field.tab_id
                        temp_array.tab_name = field.tab_name
                        temp_array.contact_name = this.get_contact_name(index)
                        temp_array.contact_id =  this.get_contact_id(index)
                        temp_array.profile_image = this.get_contact_profile_image(index)
                        temp_array.left_fields = [];
                        temp_array.right_fields = [];
                        if(field.left_fields !== undefined){
                            field.left_fields.map((l_field, k) =>{
                                var left_side_field = {
                                    "id":     l_field.id,
                                    "type":   l_field.type,
                                    "name":   l_field.name,
                                    "default_value": l_field.default_value,
                                    "input_value":this.get_input_value(index,l_field.id),
                                };
                                temp_array.left_fields.push(left_side_field)
                            });
                        }
                        if(field.right_fields !== undefined){
                            field.right_fields.map((r_field, k) =>{
                                var right_side_field = {
                                    "id":     r_field.id,
                                    "name":  r_field.name,
                                    "type":   r_field.type,
                                    "default_value":  r_field.default_value,
                                    "input_value": this.get_input_value(index,r_field.id),
                                };
                                temp_array.right_fields.push(right_side_field)
                            });
                        }
                    }
                }
            })
        let single_contact = [];
         single_contact.push(temp_array);
         this.setState({single_contact : single_contact})
             if(single_contact.length > 0 ){
                ModalManager.open( <EditSubContactModal
                        field ={single_contact}
                        tags = {this.state.tags}
                        title = "SubContact"
                        modal_id = "edit-sub-contact-modal"
                        index ={index}
                        onEditSubContact ={ this.handleEditSubContactEditSaveClick.bind(null)}
                        onRequestClose={() => false}/>
                   );
             }
         }
    }
    get_input_value(index,field_id){
         var return_value ='';

         if( this.state.subcontacts.length > 0){
            this.state.subcontacts.forEach(function(item, i) {
                if(i === index) {
                   item.fields.forEach(function(fields_item, j) {
                        if(field_id == fields_item.field_id){
                            return_value = fields_item.field_value;
                        }
                   })
                }
            });
         }
        return return_value
    }

    get_contact_name(index){
         var return_value ='';
         if( this.state.subcontacts.length > 0){
            this.state.subcontacts.forEach(function(item, i) {
                if(i === index) {
                   return_value = item.name;
                }
            });
         }
        return return_value
    }
    get_contact_id(index){
         var return_value ='';
         if( this.state.subcontacts.length > 0){
            this.state.subcontacts.forEach(function(item, i) {
                if(i === index) {
                   return_value = item.contact_id;
                }
            });
         }
        return return_value
    }

    get_contact_profile_image(index){
         var return_value ='';
         if( this.state.subcontacts.length > 0){
            this.state.subcontacts.forEach(function(item, i) {
                if(i === index) {
                   return_value = item.profile_image;
                }
            });
         }
        return return_value
    }

    handleCreateEditComapny(data){
        let companies = this.state.companies;
        companies.push(data)
        this.setState({companies : companies})
    }

    saveContact (){
        if ( $('#contact-main-form').valid()) {
            var contact = {}
            var main_form_data = this.processForm('#contact-main-form')
                contact.main =main_form_data
            var subcontacts = this.state.subcontacts
            contact.subcontacts = subcontacts
            contact.main.contact_type = this.state.is_individual
            contact.main.is_vendor = this.state.is_vendor
            contact.main.is_customer = this.state.is_customer
            contact.main.contact_id = this.state.contact_id
            contact.main.parent_id = this.state.parent_id
            contact.main.contact_company_id =this.state.contact_company_id
            $.ajax({
                 type: "POST",
                 cache: false,
                 dataType: "json",
                 url: BASE_FULL_URL + '/contact/update/',
                data: {
                    contact :contact
                },
                beforeSend: function () {
                }.bind(this),
                success: function (data) {
                   if(data.success === true){
                    ModalManager.close(<ContactView modal_id = "edit-contact-modal" onRequestClose={() => true} />);
                       NotificationManager.success(data.message, 'Success message',5000);
                   }else{
                        NotificationManager.error(data.message, 'Error',5000);
                   }

                }.bind(this)
            });
        }else{
           NotificationManager.error('Please enter name.', 'Error', 5000, () => {
           });
        }
    }
    processForm(form_id) {
        var form_object = $(form_id);
        var contact = {};
        var fields =[];
           contact.name = form_object.find('input[name="name"]').val();
           contact.profile_image= this.state.sub_contact_profile_image_full_path;
           contact.fields = fields;
        form_object.find('div.form-group').each(function() {
            var ths = $(this),
            data_id = ths.attr('data-id');
            if(data_id > 0){
                var value  =  ths.find('input').val(),
                    type = ths.attr('data-type');
                if(type === 'single-line' || type === 'drop-down' || type === 'date'|| type === 'phone'|| type === 'mobile'){
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
                        "field_type":   type,
                        "field_name":   name
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
                            "field_id":     ths.closest('div.form-group').attr('data-id'),
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
                            "field_id":     ths.closest('div.form-group').attr('data-id'),
                            "field_value":  JSON.stringify(radio),
                            "field_type":   type

                    };
                    contact.fields.push(field);
                }
            }
        });
       return contact;
    }
    _renderTabs(){

        let result = this.state.edit_result
        return (
           this.state.edit_result  ?
                <ul role="tablist" className="nav nav-tabs custTab top-border">
                {
                      result.map((field, j) =>{
                        let tab_id =  'field-tab-'+ j
                        let href = '#'+tab_id
                        let css_active = field.is_default_tab ? 'active':'tab-pane'
                            {
                            return <li role="presentation" className={css_active } key={j}>
                                    <a data-toggle="tab" role="tab" aria-controls={tab_id} href={href} aria-expanded="true">{field.tab_name}</a>
                                </li>
                            }
                    })
                }
                </ul>
           :null
       );
    }
    _renderResult() {
            let tags = this.state.tags.length > 0 ? this.state.tags : []
            return (
            this.state.edit_result  ?
               <form className="edit-form" id="contact-main-form">
               <div className="tab-content">
               {
                     this.state.edit_result.map((field, j) =>{
                        let tab_id =  'field-tab-'+ j

                        let tab_content = field.is_default_tab && this.state.companies.length> 0 && this.state.tags.length >0 ?
                               <ContactFormDefaultTabContent
                                    left_fields={field.left_fields}
                                    right_fields={field.right_fields}
                                    tags = {this.state.tags}
                                    default_fields ={this.state.default_fields}
                                    companies = {this.state.companies}
                                    on_company_change ={ this.callbackParent.bind(null)}
                                    handleCompanyChange = {this.handleCompanyChange.bind(null)}
                                    company_create = {this.handleCreateEditComapny.bind(null)}
                                    c_name = {this.state.company_name}
                                    contact_name = {this.state.contact_name}
                                    is_individual={this.state.is_individual}
                                    company_id ={this.state.contact_company_id}
                                    contact_company_name= {this.state.contact_company_name}/>
                               : <ContactFormOtherTabContent
                                    left_fields={field.left_fields}
                                    right_fields={field.right_fields}
                                    tags = {tags}
                                    companies = {this.state.companies}/>
                        let css_active = field.is_default_tab ? 'tab-pane active':'tab-pane'
                        {
                          return <div className={css_active} id={tab_id} data-tab-id={j} role="tabpanel" key={j} data-status={field.is_default_tab}>
                                 {tab_content}
                            </div>
                        }
                    })
               }
               </div>
               </form>
             :null
            );
    }
    handleLangChange(index) {
        ModalManager.close(<ContactView modal_id = "edit-contact-modal"  onRequestClose={() => true} />);
    }


  render() {
    var bodyStyle = {overflow :'auto',maxHeight: '75vh'}
    return (
   
        <Modal
            onRequestClose={() => true}

            effect={Effect.Fall}>

            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handleLangChange.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">{this.state.title}</h4>
                    </div>

                    <div className="modal-body" style={bodyStyle}>

                      
                          
                            
                             
                                    
                                        { this._renderResult()}

                                        

                                        <button type="button" className="btn btn-primary" onClick={this.openCreateSubContactModal.bind(this)}>Create Sub Contact</button>
                                    <div>
                                        <div id="sub-contacts" className="row">
                                            {
                                                this.state.subcontacts ?
                                                this.state.subcontacts.map((subcontacts, i) =>{
                                                    return <div className="col-xs-6 col-sm-3 col-lg-3 col-md-3" key={i} >
                                                            <div className="media" data-toggle="modal" data-target="#sub_contact_modal">
                                                                <div className="media-left" onClick={this.openEditSubContactModal.bind(this,i)}>
                                                                    <img width="82" height="82" src= {IMAGE_PATH + '/'+ subcontacts.profile_image} className="media-object img-circle"  />
                                                                </div>
                                                                <div className="media-body media-middle">
                                                                    <h4>{subcontacts.name}</h4>
                                                                    <div className="h4"></div>
                                                                </div>
                                                            </div>
                                                            <a className="remove-icon-sprite subcontact_cross"  onClick={this.handleRemoveSubContact.bind(this,i)}></a>
                                                        </div>
                                                        })
                                                :null
                                            }
                                        </div>

                                    </div>
                                    
                            


                    </div>
                     <div  className="modal-footer">
                        <button className="btn btn-default" type="button" onClick={this.handleLangChange.bind(this)}>Close</button>
                        <button className="btn btn-primary" type="button" onClick={this.saveContact.bind(this)}>Save</button>
                    </div>

                </div>    
            </div>    
        </Modal>
    );
  }

}
module.exports = ContactView;


