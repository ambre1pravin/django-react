import React from 'react';
import { Link, browserHistory } from 'react-router'
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import  {IMAGE_PATH} from 'crm_react/common/state';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import ContactHeader from 'crm_react/page/contact/contact-header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import EditSubContactModal from 'crm_react/page/contact/edit-sub-contact-modal';
import CreateSubContactModal from 'crm_react/page/contact/create-sub-contact-modal';
import ContactDefaultFieldForm from 'crm_react/page/contact/contact-default-field-form';
import ContactOtherFieldForm from 'crm_react/page/contact/contact-other-field-form';
import { get_contact_info, getCookie, processForm, get_input_value, add_sub_contact_button_text} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';


class  ContactAdd extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            contact_name: this.props.contact_name!=undefined ? this.props.contact_name :'',
            result:[],
            selected_tags:[],
            subcontacts:[],
            sub_contact_open_modal_state:true,
            sub_contact_profile_image_full_path: '/static/front/images/profile.png',
            is_vendor:this.props.is_vendor!=undefined ? this.props.is_vendor: false,
            is_customer: this.props.is_customer!=undefined ? this.props.is_customer: false,
            is_lead:this.props.is_lead!=undefined ? this.props.is_lead: false,
            is_company:false,
            is_individual:true,
            save_button_disable:'btn btn-primary',
            contact_company_id:0,
            main_contact_profile_image:'/static/front/images/profile.png',
            first_name:null,
            last_name:null,

        };

        this.handleSubContactCreateSaveClick = this.handleSubContactCreateSaveClick.bind(this);
        this.handleEditSubContactEditSaveClick = this.handleEditSubContactEditSaveClick.bind(this);
        this.handleCreateEditComapny = this.handleCreateEditComapny.bind(this);
        this.set_lead_return_data = this.set_lead_return_data.bind(this);
        this.set_contact_name = this.set_contact_name.bind(this);

        this.serverRequest = $.get('/contact/index/', function (data) {
            this.setState({result:data.fields, main_contact_profile_image:data.profile_image});
        }.bind(this));

    }


    handle_is_company(){
        this.setState({is_company: !this.state.is_company});
        this.setState({is_individual: !this.state.is_individual})
    }


    handle_is_indvidual(event){
        this.setState({is_company: !this.state.is_company});
        this.setState({is_individual: !this.state.is_individual})
    }


    handle_is_vender(){
       this.setState({is_vendor: !this.state.is_vendor});
    }

    handle_is_customer(){
     this.setState({is_customer: !this.state.is_customer})
    }

    handle_is_lead(event){
        this.setState({is_lead: !this.state.is_lead})
    }

    //on change company

   set_lead_return_data(data){
        this.setState({contact_company_id: data.id})
   }

   return_selectd_tags(selected_tags){
       this.setState({selected_tags:selected_tags})
   }



    // profile image upload
    handleImageOnChange(){
         $("#message_file_upload_from").submit();
         $("#message_file_uploader").unbind().load(function() {  // This block of code will execute when the response is sent from the server.
           var result =  JSON.parse($("#message_file_uploader").contents().text());
            if(result.success === 'true' || result.success === true){
                this.setState({ main_contact_profile_image : result.file})
            }
        }.bind(this));
    }

    // save contact
    handleSaveContact (){
        console.log(":this.state.first_name", this.state.first_name);
        if ( $('#contact-main-form').valid() ) {
            var constact = {}
             var main_form_data = processForm('#contact-main-form', this.state.main_contact_profile_image, this.state.main_contact_profile_image);
                constact.main = main_form_data;
                constact.main.contact_type = (this.state.is_individual) ? 'I' : 'C';
                constact.main.name = this.state.contact_name;
                constact.main.first_name = (this.state.is_individual) ? this.state.first_name : null;
                constact.main.last_name = (this.state.is_individual) ? this.state.last_name : null;
                constact.main.is_vendor = this.state.is_vendor;
                constact.main.tags = this.state.selected_tags;
                constact.main.parent_id = this.state.contact_company_id;
                constact.main.is_customer = this.state.is_customer;
                constact.main.is_lead = this.state.is_lead;
                constact.main.contact_company_id = this.state.contact_company_id;
            var subcontacts = this.state.subcontacts;
            constact.subcontacts = subcontacts;


            console.log("post contact data here", constact);



            if(this.state.save_button_disable !=='btn btn-primary disabled'){
                $.ajax({
                     type: "POST",
                     dataType: "json",
                     url: '/contact/save/',
                    data: {
                        contact :JSON.stringify(constact),
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                        this.setState({save_button_disable:'btn btn-primary disabled', processing:true})
                    }.bind(this),
                    success: function (data) {
                       if(data.success === true){

                           if(data.contact_id > 0){

                               if(this.props.display_header == undefined ) {
                                   browserHistory.push('/contact/view/' + data.uuid + '/');
                               }else{
                                   NotificationManager.success('customer Created!', 'Success message',5000);
                                   this.props.handle_click_comapny(data.contact_id, data.contact_name);
                                   this.props.handleClose();
                               }

                           }else{
                                NotificationManager.error(translate('label_some_thing_wrong'), translate('label_error'),5000);
                           }
                       }else{
                            NotificationManager.error(data.msg, translate('label_error'),5000);
                       }
                       this.setState({processing: false});
                    }.bind(this)
                });
            }else{
                NotificationManager.error(translate('label_please_wait'), translate('label_error'),5000);
            }
        }
    }


    /*** open Modal for create new subcontact **/
    openCreateSubContactModal(){
         if(this.state.result.length > 0 ){
            let remainder = this.state.subcontacts.length % 15;
            let default_profile_image = '/static/front/images/image_'+ remainder  + '.png';
            let sub_contact_profile_image_full_path = default_profile_image;
            this.setState({sub_contact_profile_image_full_path : sub_contact_profile_image_full_path});
            ModalManager.open(<CreateSubContactModal
                    field ={this.state.result}
                    title = {translate('add_contact')}
                    modal_id = "create-sub-contact-modal"
                    form_id =  "create-sub-contact-form"
                    profile_image ={default_profile_image}
                    onRequestClose={() => this.state.sub_contact_open_modal_state}
                    onChildClick ={ this.handleSubContactCreateSaveClick.bind(null)}/>
               );
         }
    }


    /** New subcontact Save button handle*/
    handleSubContactCreateSaveClick(index) {
        var form_object = $('#create-sub-contact-form');
        if (form_object.valid()) {
            var form_data = processForm('#create-sub-contact-form',
                            this.state.sub_contact_profile_image_full_path ,
                            this.state.main_contact_profile_image
                );
            let subcontacts = this.state.subcontacts;
            console.log("sub contact here --->", subcontacts);
            subcontacts.push(form_data);
            this.setState({subcontacts: subcontacts});
            this.setState({sub_contact_open_modal_state:true});
            form_object[0].reset();
            ModalManager.close(<CreateSubContactModal modal_id = "create-sub-contact-modal" onRequestClose={() => true} />);
        }else{
           // NotificationManager.error(translate('label_please_enter_name'), translate('label_error'),5000);
        }
    }

    /** Editsubcontact Save button handle*/
    handleEditSubContactEditSaveClick(index ,fields_data){
        let subcontacts =  this.state.subcontacts;
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
        let fields = this.state.result;
        let edit_contact_field_value = {};
        if(fields.length > 0){
            fields.map((field, i) =>{
                if(field.is_default){
                    edit_contact_field_value.contact_name = get_contact_info(index, this.state.subcontacts, 'name');
                    edit_contact_field_value.first_name = get_contact_info(index, this.state.subcontacts, 'first_name');
                    edit_contact_field_value.last_name = get_contact_info(index, this.state.subcontacts, 'last_name');
                    edit_contact_field_value.contact_id =  get_contact_info(index, this.state.subcontacts, 'id');
                    edit_contact_field_value.profile_image = get_contact_info(index, this.state.subcontacts, 'image');
                    edit_contact_field_value.email = get_contact_info(index, this.state.subcontacts, 'email');
                    edit_contact_field_value.phone = get_contact_info(index, this.state.subcontacts, 'phone');
                    edit_contact_field_value.mobile = get_contact_info(index, this.state.subcontacts, 'mobile');
                    edit_contact_field_value.street = get_contact_info(index, this.state.subcontacts, 'street');
                    edit_contact_field_value.street2 = get_contact_info(index, this.state.subcontacts, 'street2');
                    edit_contact_field_value.city = get_contact_info(index, this.state.subcontacts, 'city');
                    edit_contact_field_value.zip = get_contact_info(index, this.state.subcontacts, 'zip');
                    edit_contact_field_value.country = get_contact_info(index, this.state.subcontacts, 'country');
                    edit_contact_field_value.fields = [];
                    field.fields.map((f, i) =>{
                        var edit_contact_field = {
                            "id":     f.id,
                            "type":   f.type,
                            "name":   f.name,
                            "display_position": f.display_position,
                            "default_values":f.default_values,
                            "input_value": get_input_value(index, f.id, this.state.subcontacts)
                        };
                        edit_contact_field_value.fields.push(edit_contact_field)
                    });
                }
            } );
            if(edit_contact_field_value.fields.length > 0 ){
                ModalManager.open(<EditSubContactModal
                        fields ={edit_contact_field_value}
                        title = "Sub Contact"
                        modal_id = "edit-sub-contact-modal"
                        index ={index}
                        onEditSubContact ={ this.handleEditSubContactEditSaveClick.bind(null)}
                        onRequestClose={() => true}/>
                );
            }
        }
    }

    handleCreateEditComapny(data){
        this.setState({contact_company_id:data.contact_id})
    }


    /**  Existing Subcontact Cross button handle*/
    handleRemoveSubContact(index){
       let subcontacts =  this.state.subcontacts;
         subcontacts.forEach(function(result, i) {
            if(i === index) {
              subcontacts.splice(i, 1);
            }
         });
       this.setState({subcontacts: subcontacts});
    }

    // render tab html
    render_tabs(){
        let result = this.state.result;
        return (
           result ?
                <ul role="tablist" className="nav nav-tabs nav-tabs-custom top-border">
                {
                    result.map((tab, i) =>{
                        let tab_id =  'field-tab-'+ i;
                        let href = '#'+tab_id;
                        {
                            return <li role="presentation" className="" key={i}>
                                <a data-toggle="tab" role="tab" aria-controls={tab_id} href={href} aria-expanded="true">{tab.name}</a>
                            </li>
                        }
                    })
                }
                </ul>
           :null
       );
    }


    render_subContacts(){
        let subcontacts_array = this.state.subcontacts;
        return (
            subcontacts_array.length > 0 ?
                <div id="sub-contacts" className="panel panel-default">
                    <div  className="row">
                        {
                            subcontacts_array.map((subcontacts, i) =>{
                            return <div className="col-xs-12 col-ms-6 col-sm-4 col-md-3 col-lg-3" key={i} >
                                    <div className="media" data-toggle="modal" data-target="#sub_contact_modal">
                                        <div className="media-left" >
                                            <img src= {subcontacts.profile_image} onClick={this.openEditSubContactModal.bind(this,i)} className="img-circle"  />
                                        </div>
                                        <div className="media-body media-middle">
                                            <h4>{subcontacts.first_name + ' ' + subcontacts.last_name}</h4>
                                            <div>{subcontacts.email}</div>
                                            <div>{subcontacts.city}</div>
                                        </div>
                                    </div>
                                    <a className="remove-icon-sprite subcontact_cross"  onClick={this.handleRemoveSubContact.bind(this,i)}></a>
                                </div>
                            })
                        }
                    </div>
                </div>
            :null
        );
    }

    set_contact_name(contact_name){
       this.setState({contact_name: contact_name})
    }

    set_name(name_type, name){
        console.log(name_type , name);
        if(name_type === 'first_name') {
            this.setState({first_name: name});
        }else if(name_type === 'last_name') {
            this.setState({last_name: name});
        }
    }

    render_form() {
        let result = this.state.result;
        return (
            result.length > 0 ?
             <form id="contact-main-form" autoComplete="Off">
               <div className="tab-content">
               {
                  result.map((db_field, i) =>{
                    {
                        let tab_content;
                        let css_active ;
                        let data_status;
                        let tab_id =  'field-tab-'+ i

                        if(db_field.is_default){
                             tab_content = <ContactDefaultFieldForm
                                             fields={db_field.fields}
                                             is_individual={this.state.is_individual}
                                             company_create = {this.handleCreateEditComapny.bind(null)}
                                             set_contact_name = {this.set_contact_name.bind(null)}
                                             set_name = {this.set_name.bind(this)}
                                             set_lead_return_data = {this.set_lead_return_data.bind(null)}
                                             profile_image = {this.state.main_contact_profile_image}
                                             return_selectd_tags = {this.return_selectd_tags.bind(this)}
                                             key={'_cdf_'+ i}
                                            contact_name={this.state.contact_name}
                                            />;
                             css_active = 'tab-pane active';
                             data_status = 1;
                        }else{
                             tab_content =  <ContactOtherFieldForm fields={db_field.fields} key={'_cof_'+i}/>
                             css_active = 'tab-pane';
                             data_status = 0;
                        }
                        {
                          return <div className={css_active} id={tab_id} data-tab-id={i} role="tabpanel" key={i} data-status={data_status}>
                                 {tab_content}
                            </div>
                         }
                    }
                  })
               }
               </div>
             </form>
             :null
        );
    }

    save_action_fn(){
        this.handleSaveContact()
    }

    render() {
        let processing = this.state.processing;
        const marginLeft ={marginTop:'10px'};
        return (
            <div>
                { this.props.display_header == undefined ?
                    <ContactHeader header_css="crm-header clearfix module__contact module__contact-create"/>
                    : null
                }

                <div id="crm-app" className="clearfix module__contact module__contact-create">
                 <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <AddPageTopAction
                                list_page_link ="/contact/list/"
                                list_page_label ="Contact"
                                add_page_link="/contact/add/"
                                add_page_label ="Add Contact"
                                edit_page_link={false}
                                edit_page_label ={false}
                                item_name=""
                                page="add"
                                module="contact"
                                save_action ={this.save_action_fn.bind(this)}
                            />
                            <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-8">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-heading no-padding">
                                            <div className="row">
                                                <div className="col-xs-12 col-sm-7 col-md-6 col-lg-6">
                                                    <ul className="list-inline">
                                                        <li>
                                                            <div className="radio" onClick={this.handle_is_company.bind(this)}>
                                                               <input id="ct-company"
                                                                    name="contact-type"
                                                                    type="radio"
                                                                    checked={this.state.is_company ? "checked":null}
                                                               />
                                                                <label onClick={this.handle_is_company.bind(this)}>{translate('label_company')}</label>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="radio" onClick={this.handle_is_indvidual.bind(this)}>
                                                                <input id="ct-individual"
                                                                    name="contact-type"
                                                                    type="radio"
                                                                    checked={this.state.is_individual ? "checked":null}
                                                                />
                                                                <label onClick={this.handle_is_indvidual.bind(this)}>{translate('label_individual')}</label>
                                                            </div>
                                                        </li>
                                                        <li>|</li>
                                                        <li>
                                                            <div className="checkbox" onClick={this.handle_is_vender.bind(this)}>
                                                                <input type="checkbox"
                                                                    name="is_vendor"
                                                                    checked={this.state.is_vendor}
                                                                    value={this.state.is_vendor}
                                                                />
                                                                <label>{translate('label_is_vendor')}</label>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="checkbox"  onClick={this.handle_is_lead.bind(this)}>
                                                                 <input type="checkbox"
                                                                     name="is_lead"
                                                                     checked={this.state.is_lead}
                                                                     value={this.state.is_lead}
                                                                 />
                                                                <label>{translate('label_is_lead')}</label>
                                                            </div>
                                                        </li>

                                                        <li>
                                                            <div className="checkbox" onClick={this.handle_is_customer.bind(this)}>
                                                                 <input type="checkbox"
                                                                     name="is_customer"
                                                                     checked={this.state.is_customer}
                                                                     value={this.state.is_customer}
                                                                 />
                                                                <label>{translate('label_is_customer')}</label>
                                                            </div>
                                                        </li>

                                                    </ul>
                                                </div>
                                                { this.props.display_header == undefined ?
                                                    <div className="col-xs-12 col-sm-7 col-md-6 col-lg-6 pull-right">
                                                        <ul className="pull-right panel-tabular__top-actions">
                                                            <li>
                                                                <Link to="javascript:" title="Opportunities"><i
                                                                    className="fa fa-star"></i>
                                                                    <p className="push-left-5  inline-block">
                                                                        <span>0</span>{'Opportunities'}
                                                                    </p></Link>
                                                            </li>
                                                            <li>
                                                                <Link to="javascript:" title="Meetings"><i
                                                                    className="cal-icon-sprite"></i>
                                                                    <p className="push-left-5  inline-block">
                                                                        <span>0</span>{translate('label_meetings')}</p>
                                                                </Link>
                                                            </li>
                                                            <li>
                                                                <Link to="javascript:" title="Meetings"><i
                                                                    className="note-icon-sprite"></i>
                                                                    <p className="push-left-5  inline-block">
                                                                        <span>0</span>{translate('label_task')}</p>
                                                                </Link>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    :null
                                                }
                                            </div>
                                        </div>
                                        <div className="panel-body edit-form">
                                            <span className="hidden">
                                                <div className="o_hidden_input_file ">
                                                    <form id="message_file_upload_from" target="message_file_uploader" action={'/contact/upload/'} method="post" encType='multipart/form-data' className="o_form_binary_form">
                                                        <input type="file" name="ufile" id="message_attatchment_file" className="o_form_input_file" onChange={this.handleImageOnChange.bind(this)} />

                                                    </form>
                                                    <iframe name="message_file_uploader" id="message_file_uploader" className="hidden"></iframe>
                                                </div>
                                            </span>
                                            {this.render_form()}
                                        </div>
                                            {this.render_tabs()}
                                    </div>
                                        <button className="btn btn-new new-sub-contact" onClick={this.openCreateSubContactModal.bind(this)}>{add_sub_contact_button_text(this.state.contact_name, this.state.is_company) }</button>
                                        {this.render_subContacts()}
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
               </div>
               <NotificationContainer/>
               <LoadingOverlay processing={processing}/>
            </div>
        );
    }
}
module.exports = ContactAdd;