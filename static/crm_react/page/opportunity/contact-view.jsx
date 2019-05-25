import React from 'react';
import {Link} from 'react-router'
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import state, {
    IMAGE_PATH, ROLES
} from 'crm_react/common/state';

import ContactHeader from 'crm_react/page/contact/contact-header';
import ViewSubContactModal from 'crm_react/page/contact/view-sub-contact-modal';
import { translate} from 'crm_react/common/language';
import Message from 'crm_react/component/message';

const form_group = {borderStyle:'none'}
class  ContactView extends React.Component {

	constructor(props) {
        super(props);
        this.state = {
            result:[],
            contact_id:'',
            email:'',
            phone:'',
            mobile:'',
            street:'',
            street2:'',
            city:'',
            zip:'',
            country:'',
            parent_id:0,
            subcontacts:[],
            contact_company_id:0,
            profile_image:'',
            selected_company_name:'',
            edit_result:null,
            tabs : [],
            main_contact_name:'',
            main_contact_id:'',
            message_modal_is_open :false,
            total_opportunity:0,
            total_meetings:0,
            total_task:0
        }

        this.serverRequest = $.get('/contact/view_ajax/'+this.props.contact_id+'/', function (data) {
            this.setState({
                    result:data.tabs,
                    profile_image:data.profile_image,
                    email:data.email,
                    phone:data.phone,
                    mobile:data.mobile,
                    street:data.street,
                    street2:data.street2,
                    city:data.city,
                    zip:data.zip,
                    country:data.country,
                    edit_result:true,
                    tabs :data.tabs,
                    main_contact_name:data.name,
                    main_contact_id:data.id,
                    subcontacts:data.sub_contact,
                    selected_company_name:data.company_name,
                    total_opportunity:data.total_opportunity,
                    total_meetings:data.total_meetings,
                    total_task:data.total_task
                  });
        }.bind(this));

    }

    render_string_value(value){
        let display_value;
        if(value){
            display_value = value
        }else{
            display_value ='-'
        }
        return(<td><div className="form-group" style={form_group}>{display_value}</div></td>);
    }

    render_multiselect(value){
        return(
            <td>
                <div>
                    <ul className="list-inline tagbox">
                        {
                            value.length > 0 ?
                             value.map((selectedTags, i) =>{
                                    return <li data-id={selectedTags.id} key={i}>
                                            <i className={'fa fa-circle-o  color-' +selectedTags.color}></i>
                                            <span>{selectedTags.name}</span>
                                    </li>
                                 })
                            :null
                        }
                    </ul>
                </div>
            </td>
        );
    }

    render_fields(tab_fields){
        let fields = tab_fields
            return (
                    fields.map((f, i) =>{
                       let tab_content;
                       if(f.type == 'multiselect'){
                          if(f.value === '-'){
                                tab_content = f.value
                          }else{
                                tab_content = this.render_multiselect(f.value)
                          }
                       }else{
                            tab_content = this.render_string_value(f.value)
                       }
                       {
                          return <tr key={i}>
                                <td><label className="text-muted control-label">{f.name}</label></td>
                                 {tab_content}
                            </tr>
                       }
                    })
            );
    }

    render_contact_name(){
        return (
            <tr>
                <td rowSpan="2">
                    <div className="edit-dp">
                    <img className="" data-index="main_form" id="uimage" src={IMAGE_PATH + this.state.profile_image} width="98" height="98" />
                    <input autoComplete="off" id="hidden_profile_image" value="" type="hidden" />
                    </div>
                </td>
                <td>
                    <div className="form-group name " style={form_group}>{this.state.main_contact_name}</div>
                </td>
            </tr>
        );
    }

    render_company_name(){
        return (
            <tr>
            <td>
                <div id="company" className="form-group name" style={form_group}>
                    {this.state.selected_company_name}
                </div>
            </td>
            </tr>
        );
    }

    render_default_tab_data(tab_fields){
        let fields = tab_fields
        let left_side_fields = [] ;
        let right_side_fields = [] ;
        fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                    }
                    left_side_fields.push(fields_data)
                }else{
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                    }
                    right_side_fields.push(fields_data)
                }
            }
        })

        return (
            <div>
                <div className="row row__dp-name">
                   <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                        <table className="detail_table detail_table-top">
                            <tbody>
                                 { this.render_contact_name() }
                                 { this.render_company_name() }
                            </tbody>
                        </table>
                   </div>
                </div>
                <div className="row row__flex">
                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                        <table className="detail_table">
                            <tbody>
                                 <tr>
                                    <td><label className="control-label">Phone</label></td>
                                    <td><div className="form-group"  style={form_group}>{this.state.phone}</div></td>
                                 </tr>

                                 <tr>
                                    <td><label className="control-label">Mobile</label></td>
                                    <td><div className="form-group" style={form_group}>{this.state.mobile}</div></td>
                                 </tr>
                                 <tr>
                                    <td><label className="control-label">Email</label></td>
                                    <td><div className="form-group" style={form_group}>{this.state.email}</div></td>
                                 </tr>
                                 <tr>
                                    <td><label className="control-label">Address</label></td>
                                    <td>
                                        <div className="form-group" style={form_group}>
                                            <p>{this.state.street}</p>
                                            <p>{this.state.street2}</p>
                                            <p>{this.state.zip}</p>
                                            <p>{this.state.city}</p>
                                        </div>

                                    </td>
                                 </tr>

                                 <tr>
                                    <td><label className="text-muted control-label">Country</label></td>
                                    <td><div className="form-group" style={form_group}>{this.state.country}</div></td>
                                 </tr>
                                { this.render_fields(left_side_fields) }
                            </tbody>
                        </table>
                    </div>
                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                        <table className="detail_table">
                            <tbody>
                             { this.render_fields(right_side_fields) }
                             {/*<Customer />*/}
                             </tbody>
                         </table>

                    </div>
                </div>
            </div>
        );
    }


    render_custom_tab_data(tab_fields){
        let fields = tab_fields
        let left_side_fields = [] ;
        let right_side_fields = [] ;
        fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                    }
                    left_side_fields.push(fields_data)
                }else{
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                    }
                    right_side_fields.push(fields_data)
                }
            }
        })
        return (
            <div className="row">
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                    <table className="detail_table">
                        <tbody>
                            { this.render_fields(left_side_fields) }
                        </tbody>
                    </table>
                </div>
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <table className="detail_table">
                        <tbody>
                            { this.render_fields(right_side_fields) }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }


    render_form(){
        let tabs = this.state.tabs
        return (
        tabs.length > 0 ?
           <div className="tab-content">
                {
                    tabs.map((tab, i) =>{
                        let tab_id =  'field-tab-'+ i
                        let tab_content;
                        let tab_class;
                        if(tab.is_default){
                             tab_content =  this.render_default_tab_data(tab.fields)
                             tab_class = 'tab-pane active'
                        }else{
                             tab_content =  this.render_custom_tab_data(tab.fields)
                             tab_class = 'tab-pane'
                        }
                        {
                          return <div className={tab_class} id={tab_id}  key ={i}>
                                 {tab_content}
                            </div>
                         }
                     })
                }
           </div>
        :null
        );
    }
    open_edit_sub_contact_modal(index){
        let subcontact = this.state.subcontacts
        if( subcontact.length > 0){
            subcontact.forEach(function(item, i) {
                if(i === index) {
                    if(item.tabs.length > 0){
                        item.tabs.forEach(function(tab, j) {
                         if(tab.is_default){
                            var data = { 'name': item.name,
                                         'email': item.email,
                                         'phone': item.phone,
                                         'mobile': item.mobile,
                                         'street': item.street,
                                         'street2': item.street2,
                                         'zip': item.zip,
                                         'city': item.city,
                                         'country': item.country,
                                         'profile_image':item.profile_image,
                                         'is_vendor':item.is_vendor,
                                         'contact_type':item.contact_type,
                                         'is_customer':item.is_customer,
                                         'fields':tab.fields
                                        }
                            ModalManager.open( <ViewSubContactModal
                                data ={data}
                                title = {translate('label_sub_contact')}
                                modal_id = "view-sub-contact-modal"
                                index ={index}
                                display_type= 'view'
                                onRequestClose={() => false}/>
                            );
                         }
                        })
                    }
                }
            });
        }
    }
    render_subContacts(){
        let subcontacts_array = this.state.subcontacts
        return (
            subcontacts_array.length > 0 ?
                <div id="sub-contacts" className="panel panel-default">
                    <div  className="row">
                        {
                            subcontacts_array.map((subcontacts, i) =>{
                            return <div className="col-xs-12 col-ms-6 col-sm-4 col-md-3 col-lg-3" key={i} >
                                    <div className="media" data-toggle="modal" data-target="#sub_contact_modal">
                                        <div className="media-left" onClick={this.open_edit_sub_contact_modal.bind(this,i)}>
                                            <img  src= {IMAGE_PATH +  subcontacts.profile_image} className="img-circle"  />
                                        </div>
                                        <div className="media-body media-middle">
                                            <h4>{subcontacts.name}</h4>
                                            <div className="h4"></div>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
            :null
        );
    }

    render_tabs(){
        let tabs = this.state.tabs
        return (
           tabs.length > 0 ?
                <ul role="tablist" className="nav nav-tabs nav-tabs-custom top-border">
                {
                    tabs.map((tab, i) =>{
                        let tab_id =  'field-tab-'+ i
                        let href = '#'+tab_id
                        {
                            return <li role="presentation" className="" key={i}>
                                <a data-toggle="tab" role="tab" aria-controls={tab_id} href={href} aria-expanded="true">{tab.tab_name}</a>
                            </li>
                        }
                    })
                }
                </ul>
           :null
       );
    }

    render() {
       var message_props_data = {
           'email':this.state.email,
           'master_id':this.state.main_contact_id,
           'model_id':1
       }
        return (
            <div>
               <ContactHeader header_css="crm-header clearfix module__contact module__contact-view"/>
               <div id="crm-app" className="clearfix module__contact module__contact-view">
                 <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div className="row top-actions">
                                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                    <ul className="breadcrumbs-top">
                                        <li><Link to={'/contact/list/'}>{translate('label_contact')}</Link></li>
                                        <li>{this.state.main_contact_name}</li>
                                    </ul>
                                   {
                                     ROLES.includes("ROLE_MANAGE_ALL_CONTACT") ?
                                        <Link to={'/contact/edit/' + this.state.main_contact_id + '/'} className="btn btn-new btn-edit">{translate('button_edit')} {translate('label_contact')}</Link>
                                     :null
                                   }
                                   {
                                    ROLES.includes("ROLE_MANAGE_ALL_CONTACT") ?
                                        <Link to={'/contact/add/'} className="btn btn-new">{translate('add_contact')}</Link>
                                    :null
                                   }
                                </div>
                                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 text-right"></div>
                            </div>
                            { this.state.edit_result ?
                            <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-heading no-padding">
                                            <div className="row">
                                                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6"></div>
                                                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                                    <ul className="list-inline pull-right panel-tabular__top-actions">
                                                        <li>
                                                            {
                                                                this.state.total_meetings > 0 ?
                                                                <Link to="/opportunity/list/">
                                                                    <i className="fa fa-star"></i>
                                                                    <p className={"inline-block text-primary"}>
                                                                        <span>{this.state.total_opportunity}</span> {translate('label_oppertunities')}
                                                                    </p>
                                                                </Link>
                                                                :<div>
                                                                    <i className="fa fa-star"></i>
                                                                    <p className={ "inline-block"}>
                                                                        <span>{this.state.total_opportunity}</span> {translate('label_oppertunities')}
                                                                    </p>
                                                                </div>
                                                            }
                                                        </li>
                                                        <li>
                                                            {
                                                                this.state.total_meetings > 0 ?
                                                                <Link to="/calender/list/">
                                                                    <i className="cal-icon-sprite"></i>
                                                                    <p className={"inline-block text-primary"}>
                                                                        <span>{this.state.total_meetings}</span> {translate('label_meetings')}
                                                                    </p>
                                                                </Link>
                                                                :<Link to="">
                                                                    <i className="cal-icon-sprite"></i>
                                                                    <p className={ "inline-block"}>
                                                                        <span>{this.state.total_meetings}</span> {translate('label_meetings')}
                                                                    </p>
                                                                </Link>
                                                            }
                                                        </li>
                                                        <li>
                                                            <a href="#" title={translate('label_task')}><i className="note-icon-sprite"></i>
                                                            <p className= {this.state.total_task > 0 ? "inline-block text-primary" : "inline-block"}><span>{this.state.total_task}</span>  {translate('label_task')}</p></a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel-body">
                                            {this.render_form()}
                                        </div>
                                            {this.render_tabs()}
                                    </div>
                                    {this.render_subContacts()}
                                    {
                                      <Message ref="msgcomponet" props_data={message_props_data}/>
                                    }
                                </div>
                            </div>
                            :null
                            }
                        </div>
                    </div>
                  </div>
                </div>
            </div>
        );
    }
}
module.exports = ContactView;


