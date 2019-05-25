import React from 'react';
import {NotificationManager} from 'react-notifications';
import {  Link, browserHistory} from 'react-router'
import state, {IMAGE_PATH, LOGED_IN_USER} from 'crm_react/common/state';
import { translate} from 'crm_react/common/language';
import { validate_email, is_string_blank} from 'crm_react/common/helper';
import Dropzone from  'react-dropzone'
const request = require('superagent');


class  CreateUser extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            login_user:'',
            new_user_name:'',
            new_user_email:'',
            new_user_password:'',
            new_user_phone:'',
            new_user_mobile:'',
            new_user_first_name:'',
            new_user_last_name:'',
            field_error_class :'',
            email_wrong_class:'',
            signature:'',
            google_client_id:'',
            google_client_secret:'',
            user_time_zone:'',

            contact_value_label:'Manage Contact',
            contact_value:'ROLE_MANAGE_ALL_CONTACT',

            calendar_value_label:'View all calendars and manage it',
            calendar_value:'ROLE_MANAGE_ALL_CALENDAR',

            oppertunity_value_label:'view all opportunity, manage it, and create sales channel',
            oppertunity_value:'ROLE_MANAGE_ALL_OPPORTUNITY',

            sales_value_label:'Manage Sales',
            sales_value:'ROLE_MANAGE_ALL_SALES',

            quotation_value_label:'View all quotations and manage it',
            quotation_value:'ROLE_MANAGE_ALL_QUOTATION',

            invoice_value_label:'View all invoices and manage it',
            invoice_value:'ROLE_MANAGE_ALL_INVOICE',

            application_value_label:'Staff : user cannot install applications neither adding new user',
            application_value:'Staff:',

            language_value_label:'French',
            language_value:'French',
            activation_link:'',
            read_only:false,
            profile_image:'/static/front/images/profile.png',

        };

        if(this.props.user_id !=undefined){
            //this.setState({read_only : true})
            this.serverRequest = $.get('/user/get-user/'+this.props.user_id+'/', function (data) {
                if(data.success){
                    this.setState({new_user_name:data.user.username,
                                    new_user_email:data.user.email,
                                    language_value:data.user.language,
                                    language_value_label:data.user.language_label,
                                    contact_value:data.user.contact_role_value,
                                    contact_value_label:data.user.contact_role_label,
                                    calendar_value_label:data.user.calendar_role_label,
                                    calendar_value:data.user.calendar_role_value,

                                    oppertunity_value_label:data.user.opportunity_role_label,
                                    oppertunity_value:data.user.opportunity_role_value,

                                    quotation_value_label: data.user.quotation_role_label,
                                    quotation_value: data.user.quotation_role_value,

                                    invoice_value_label: data.user.invoice_role_label,
                                    invoice_value: data.user.invoice_role_value,

                                    application_value_label: data.user.application_role_label,
                                    application_value: data.user.application_role_value,

                                    sales_value_label:data.user.sales_role_label,
                                    sales_value:data.user.sales_role_value,
                                    read_only : true,
                                    new_user_phone:data.user.phone,
                                    new_user_mobile:data.user.mobile,
                                    new_user_first_name:data.user.first_name,
                                    new_user_last_name:data.user.last_name,
                                    signature:data.user.signature,
                                    profile_image : data.user.profile_image,
                                    google_client_id:data.user.google_client_id,
                                    google_client_secret:data.user.google_client_secret,
                                    user_time_zone:data.user.user_time_zone
                                })
                }
            }.bind(this));
        }
        this.handle_save = this.handle_save.bind(this);

    }

    handle_contact_value(field,index,value){
	    if(field=='contact') {
            this.setState({contact_value: index, contact_value_label: value});
        }else if(field=='calendar'){
	        this.setState({calendar_value:index, calendar_value_label:value});
        }else if(field=='oppertunity'){
            this.setState({oppertunity_value:index, oppertunity_value_label:value});
        }else if(field=='sales'){
            this.setState({sales_value:index, sales_value_label:value});
        }else if(field=='quotation'){
             this.setState({quotation_value:index, quotation_value_label:value});
        }else if(field=='invoice'){
            this.setState({invoice_value:index, invoice_value_label:value});
        }else if(field=='language'){
            this.setState({language_value:index, language_value_label:value});
        }else if(field=='application'){
            this.setState({application_value:index, application_value_label:value});
        }
    }


    handle_input(field, event){
        //alert(field)
        if(field =='username'){
            this.setState({new_user_name : event.target.value});
        }else if(field =='email'){
            this.setState({new_user_email : event.target.value});
        }else if(field =='password'){
            this.setState({new_user_password : event.target.value});
        }else if(field =='phone'){
            this.setState({new_user_phone : event.target.value});
        }else if(field =='mobile'){
            this.setState({new_user_mobile : event.target.value});
        }else if(field =='first_name'){
            this.setState({new_user_first_name : event.target.value});
        }else if(field =='last_name'){
            this.setState({new_user_last_name : event.target.value});
        }

    }


    onDrop(accepted, rejected) {
        var csrftoken = getCookie('csrftoken');
        const req = request.post('/user/image-upload/');
          if (accepted.length > 0 ){
              accepted.forEach(file => {
                  req.attach('image', file);
              });
              req.set('csrfmiddlewaretoken', csrftoken);
              req.end((err, res) => {
                  var obj = JSON.parse(res.text);
                  if(obj.success && obj.url!=''){
                    this.setState({ profile_image:obj.url});
                  }
              });
          }
    }
    handle_save(){
        let roles =[    this.state.contact_value,
                        this.state.calendar_value,
                        this.state.oppertunity_value,
                        this.state.sales_value,
                        this.state.quotation_value,
                        this.state.invoice_value,
                        this.state.application_value,
                   ];
        var user_id = (this.props.user_id !=undefined && this.props.user_id > 0) ? this.props.user_id : 0;
        var check_email = validate_email(this.state.new_user_email);
        if(check_email){
            this.setState({email_wrong_class: '' });
        }else{
            this.setState({email_wrong_class:'field-error error-focus'});
        }

        if(this.state.new_user_email!='') {
            if(is_string_blank(this.state.new_user_first_name) && is_string_blank(this.state.new_user_last_name)) {
                if (check_email) {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        url: '/user/save/',
                        data: {
                            user_id: user_id,
                            name: this.state.new_user_name,
                            email: this.state.new_user_email,
                            password: this.state.new_user_password,
                            language: this.state.language_value,
                            phone: this.state.new_user_phone,
                            mobile: this.state.new_user_mobile,
                            first_name: this.state.new_user_first_name,
                            last_name: this.state.new_user_last_name,
                            profile_image: this.state.profile_image,
                            signature: this.state.signature,
                            roles: JSON.stringify(roles),
                            google_client_id: this.state.google_client_id,
                            google_client_secret: this.state.google_client_secret,
                            user_time_zone: this.state.user_time_zone
                        },
                        beforeSend: function () {
                            this.props.process_state_change(true)
                        }.bind(this),
                        success: function (data) {
                            if (data.success === true) {
                                if (data.user > 0) {
                                    this.setState({activation_link: data.activation_link});
                                    this.props.process_state_change(false);
                                    NotificationManager.success(data.msg, translate('label_success'), 5000);
                                    browserHistory.push('/user/list/');
                                } else {
                                    NotificationManager.error(data.msg, translate('label_success'), 5000);
                                }
                            } else {
                                this.props.process_state_change(false);
                                NotificationManager.error(data.msg, translate('label_error'), 5000);
                            }
                        }.bind(this)
                    });
                } else {
                    this.setState({email_wrong_class: 'field-error error-focus'});
                    NotificationManager.error('Wrong email.', translate('label_error'), 5000);
                }
            }else{
                NotificationManager.error('First Name and Last Name is required.', translate('label_error'), 5000);
            }
        }else{
            this.setState({field_error_class:'field-error error-focus'});
            NotificationManager.error('username and email can not be blank.', translate('label_error'), 5000);
        }
    }

    render() {
        var marginTop ={marginTop:'25px'};
        var marginLeft ={marginLeft:'10px', marginTop:'10px'};
        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <div className="row top-actions">
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <ul className="breadcrumbs-top">
                            <li>
                                <Link to={'/user/list/'}>{translate('label_user')}</Link>
                            </li>
                            <li>{translate('label_new')}</li>
                        </ul>
                        <button id ='save_all' onClick={this.handle_save.bind(this)} className="btn btn-primary">{translate('button_save')}</button>
                        <Link to={'/user/list/'}>
                            <button className="btn btn-primary btn-discard btn-transparent" style={marginLeft}>{translate('button_discard')}</button>
                        </Link>

                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6"></div>
                </div>
                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular">
                            <div className="panel-body edit-form">
                                <div className="row row__flex">
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 border-right">
                                        <table className="detail_table">
                                            <tbody>
                                                <tr>
                                                    <td><label className="control-label">{'Email'} <span className="text-primary">*</span></label></td>
                                                    <td>
                                                        <div className="form-group edit-name">
                                                            <input value={this.state.new_user_email} className={"edit-name form-control " + this.state.email_wrong_class} required="" name="email"  placeholder={translate('label_email')}  type="text" onChange={this.handle_input.bind(this,'email')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">{'Passoword'} </label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.new_user_password} name="password"  placeholder={translate('label_password')}  type="password" onChange={this.handle_input.bind(this,'password')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">{'Phone'}</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.new_user_phone}  name="phone"  placeholder="Phone"  type="text" onChange={this.handle_input.bind(this,'phone')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                 <tr>
                                                    <td><label className="control-label">{'Mobile'}</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.new_user_mobile}   name="mobile"  placeholder="Mobile"  type="text" onChange={this.handle_input.bind(this,'mobile')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">{'First Name'} <span className="text-primary">*</span></label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.new_user_first_name}  name="first_name"  placeholder="First Name"  type="text" onChange={this.handle_input.bind(this,'first_name')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">{'Last Name'} <span className="text-primary">*</span></label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.new_user_last_name}  name="first_name"  placeholder="Last Name"  type="text" onChange={this.handle_input.bind(this,'last_name')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                                        {<table className="detail_table">
                                            <tbody>
                                                <tr>
                                                    <td rowSpan="2">
                                                        <div className="edit-dp">
                                                            < Dropzone
                                                                accept="image/jpeg, image/png"
                                                                style={{width:'100px',height:'100px'}}
                                                                onDrop={this.onDrop.bind(this)}
                                                            >
                                                            <img  src={ this.state.profile_image } width="98" height="98" />
                                                            <i className="fa fa-pencil edit"></i>
                                                           </Dropzone>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        }
                                    </div>
                                </div>
                            </div>
                            <ul className="nav nav-tabs" role="tablist">
                                <li role="presentation" className="active"><a href="#access_right" aria-controls="access_right" role="tab" data-toggle="tab">{translate('label_access_right')}</a></li>
                                <li role="presentation"><a href="#preference" aria-controls="preference" role="tab" data-toggle="tab">{translate('label_preference')}</a></li>
                            </ul>
                            <form className="contact-main-form">
                            <div className="tab-content panel-body edit-form">
                                <div id="access_right" role="tabpanel" className="tab-pane fade in active">
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">

                                            <table className="detail_table">
                                                <tbody>
                                                    <tr>
                                                        <td colSpan="2">
                                                            <div className="form-group">
                                                                <h3>{translate('label_application')}</h3>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_application')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.application_value_label} placeholder={translate('label_application')} className="form-control" data-toggle="dropdown" name="application" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this, 'application', 'Admin','Admin : can installation application and add new user')}>Admin</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'application', 'Staff','Staff : user cannot install applications neither adding new user')}>Staff</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_contact')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.contact_value_label} placeholder={translate('label_contact')} className="form-control" data-toggle="dropdown" name="contact" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this, 'contact', 'ROLE_MANAGE_ALL_CONTACT' ,'Manage Contact')}>Manage Contact</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'contact', 'ROLE_VIEW_CONTACT', 'See Contact')}>See Contact</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'contact', 'ROLE_NO_ACCESS_CONTACT','No Access')}>No Access</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_calendar')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.calendar_value_label} placeholder={translate('label_calendar')} className="form-control" data-toggle="dropdown" name="calendar" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this, 'calendar','ROLE_NO_ACCESS_CALENDAR','No Access')}>No Access</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'calendar','ROLE_MANAGE_ALL_CALENDAR','View all calendars and manage it')}>View all calendars and manage it</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'calendar', 'ROLE_VIEW_OWN_MANAGE_OWN_CALENDAR', 'View own calendar and manage it')}>View own calendar and manage it</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_opportunities')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.oppertunity_value_label} placeholder={translate('label_opportunities')} className="form-control" data-toggle="dropdown" name="opportunity" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this,'oppertunity', 'ROLE_NO_ACCESS_OPPORTUNITY','No Access')}>No Access</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'oppertunity','ROLE_MANAGE_ALL_OPPORTUNITY', 'View all opportunities and manage it')}>View all opportunities and manage it</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'oppertunity','ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY', 'View own opportunites and manage it')}>View own opportunites and manage it</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'oppertunity', 'ROLE_VIEW_ALL_MANGE_OWN_OPPORTUNITY', 'View all opportunities but manage own opportunities only')}>View all opportunities but manage own opportunities only</li>

                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_quotation')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.quotation_value_label} placeholder="Quotations" className="form-control" data-toggle="dropdown" name="quotation" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this, 'quotation','ROLE_NO_ACCESS_QUOTATION','No Access')}>No Access</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'quotation','ROLE_MANAGE_ALL_QUOTATION', 'View all quotations and manage it')}>View all quotations and manage it</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'quotation','ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION', 'View own quotations and manage it')}>View own quotations and manage it</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'quotation','ROLE_VIEW_ALL_MANGE_OWN_QUOTATION', 'View all quotations but manage own quotations only')}>View all quotations but manage own quotations only</li>

                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_invoice')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.invoice_value_label} placeholder="Invoices" className="form-control" data-toggle="dropdown" name="invoice" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this, 'invoice','ROLE_NO_ACCESS_INVOICE','No Access')}>No Access</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'invoice','ROLE_MANAGE_ALL_INVOICE', 'View all invoices and manage it')}>View all invoices and manage it</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'invoice','ROLE_VIEW_OWN_MANAGE_OWN_INVOICE', 'View own invoices and manage it')}>View own invoices and manage it</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'invoice','ROLE_VIEW_ALL_MANGE_OWN_INVOICE', 'View all invoices but manage own invoices only')}>View all invoices but manage own invoices only</li>

                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_sales')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.sales_value_label} placeholder={translate('label_sales')} className="form-control" data-toggle="dropdown" name="sales" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this, 'sales', 'ROLE_NO_ACCESS_SALES','No Access')}>No Access</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'sales','ROLE_MANAGE_ALL_SALES','Manage Sales')}>Manage Sales</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'sales','ROLE_VIEW_SALES','See Sales')}>See Sales</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                        </div>
                                    </div>
                                </div>
                                <div id="preference" role="tabpanel" className="tab-pane">
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                            <table className="detail_table">
                                                <tbody>
                                                    <tr>
                                                        <td colSpan="2">
                                                            <div className="form-group">
                                                                <h3>Localization</h3>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">{translate('label_language')}</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <div className="dropdown">
                                                                    <input value={this.state.language_value_label} placeholder={translate('label_language')} className="form-control" data-toggle="dropdown" name="Language" aria-expanded="false" type="text" />
                                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                        <i className="fa fa-angle-down black"></i>
                                                                    </span>
                                                                    <div className="dd-options">
                                                                        <ul className="options-list">
                                                                            <li onClick={this.handle_contact_value.bind(this, 'language', 'fr', 'fr')}>{'French'}</li>
                                                                            <li onClick={this.handle_contact_value.bind(this, 'language','en','en')}>{'English'}</li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

}
module.exports = CreateUser;
