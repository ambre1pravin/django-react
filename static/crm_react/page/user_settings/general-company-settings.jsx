import React from 'react';
import {NotificationManager} from 'react-notifications';
import { translate} from 'crm_react/common/language';
import { validate_email, getCookie, js_uc_first} from 'crm_react/common/helper';
import Dropzone from  'react-dropzone'
const request = require('superagent');


class  GeneralCompanySettings extends React.Component {
	constructor(props) {
        super(props);
        this.handle_save = this.handle_save.bind(this)
        this.state = {
            company_id:'',
            company_name:'',
            email:'',
            phone:'',
            mobile:'',
            language:'',
            currency:'',
            street:'',
            city:'',
            zip:'',
            company_country_name:'',
            billing_country_name:'',
            billing_company_name:'',
            billing_street:'',
            billing_city:'',
            billing_zip:'',
            billing_country:'',
            quotation_term_and_condition:'',
            sales_term_and_condition:'',
            term_condition_invoice:'',
            invoice_term_and_condition:'',
            company_countries:[],
            billing_countries:[],
            billing_country_id:'',
            company_country_id:'',
            input_value:'',
            legacy_information_char_count : 0,
            company_drop_down_class:'dropdown autocomplete',
            profile_image:'',

        }



        this.serverRequest = $.get('/company/get_company_info/', function (data) {
            if(data.success === true){
                let legacy_information ,legacy_char_count = '';
                if(data.company.quotation_legacy_information !=null){
                    legacy_information = data.company.quotation_legacy_information
                    legacy_char_count = legacy_information.length
                }
                this.setState({company_id:data.company.company_id, company_name: data.company.name,
                                email: data.company.email, phone: data.company.phone,
                                mobile: data.company.mobile, language: data.company.language,
                                currency: data.company.currency, street: data.company.street,
                                city: data.company.city, zip: data.company.zip,
                                company_country_name : data.company.company_country_name, company_country_id : data.company.company_country_id,
                                billing_country_name : data.company.billing_country_name, billing_country_id : data.company.billing_country_id,
                                billing_company_name: data.company.billing_company_name,
                                billing_street: data.company.billing_street, billing_city: data.company.billing_city,
                                billing_zip: data.company.billing_zip, billing_country: data.company.billing_country,
                                quotation_term_and_condition: data.company.quotation_term_and_condition,
                                sales_term_and_condition: data.company.sales_term_and_condition,
                                invoice_term_and_condition: data.company.invoice_term_and_condition,
                                legacy_information: legacy_information,
                                legacy_information_char_count : legacy_char_count ,
                                profile_image:data.company.profile_image,

                            })
            }
            console.log(this.state.company_name)
        }.bind(this));



	}

    handle_drop_down_state(field_name, value){
        if(field_name == 'language'){
	        this.setState({language: value})
        }else if(field_name == 'currency'){
	        this.setState({currency: value})
        }
    }

    handle_input_state(field_name, event){
	    if(field_name == 'name'){
	        this.setState({company_name: event.target.value})
        }else if(field_name == 'email'){
	        this.setState({email: event.target.value})
        }else if(field_name == 'phone'){
	        this.setState({phone:event.target.value})
        }else if(field_name == 'mobile'){
	        this.setState({mobile:event.target.value})
        }else if(field_name == 'street'){
	        this.setState({street:event.target.value})
        }else if(field_name == 'city'){
	        this.setState({city:event.target.value})
        }else if(field_name == 'zip'){
	        this.setState({zip:event.target.value})
        }else if(field_name == 'billing_company_name'){
	        this.setState({billing_company_name:event.target.value})
        }else if(field_name == 'billing_street'){
	        this.setState({billing_street:event.target.value})
        }else if(field_name == 'billing_city'){
	        this.setState({billing_city:event.target.value})
        }else if(field_name == 'billing_zip'){
	        this.setState({billing_zip:event.target.value})
        }else if(field_name == 'quotation_term_and_condition'){
	        this.setState({quotation_term_and_condition:event.target.value})
        }else if(field_name == 'sales_term_and_condition'){
	        this.setState({sales_term_and_condition:event.target.value})
        }else if(field_name == 'invoice_term_and_condition'){
	        this.setState({invoice_term_and_condition:event.target.value})
        }else if(field_name == 'legacy_information'){
            if(event.target.value.length <=120) {
                console.log(event.target.value.length)
                this.setState({legacy_information: event.target.value, legacy_information_char_count:event.target.value.length})
            }
        }
    }


    onDrop(accepted, rejected) {
        const req = request.post('/user/image-upload/');
          if (accepted.length > 0 ){
              accepted.forEach(file => {
                  req.attach('image', file);
              });
              req.set('csrfmiddlewaretoken', getCookie('csrftoken'));
              req.end((err, res) => {
                  var obj = JSON.parse(res.text);
                  console.log(obj.url)
                  if(obj.success && obj.url!=''){
                    this.setState({ profile_image:obj.url})
                  }
              });
          }
    }

    handle_save(){
        var company_country_id = 0,
            billing_country_id = 0,
            billing_company_name = '',
            legacy_information ='',
            quotation_term_and_condition = '',
            sales_term_and_condition = '',
            invoice_term_and_condition = '';

        if(this.state.company_country_id > 0){
            company_country_id = this.state.company_country_id
        }

        if(this.state.billing_country_id){
            billing_country_id = this.state.billing_country_id;
        }

        if(this.state.billing_company_name){
            billing_company_name = this.state.billing_company_name;
        }

        if(this.state.legacy_information){
            legacy_information = this.state.legacy_information
        }

        if(this.state.quotation_term_and_condition){
            quotation_term_and_condition = this.state.quotation_term_and_condition;
        }

        if(this.state.sales_term_and_condition){
            sales_term_and_condition = this.state.sales_term_and_condition;
        }

        if(this.state.invoice_term_and_condition){
            invoice_term_and_condition = this.state.invoice_term_and_condition;
        }

        $.ajax({
            type: "POST",
            dataType: "json",
            url: '/company/save/',
            data: {
                company_id: this.state.company_id,
                company_name : this.state.company_name,
                email: this.state.email,
                phone: this.state.phone,
                mobile: this.state.mobile,
                language: this.state.language,
                currency: this.state.currency,
                street: this.state.street,
                city: this.state.city,
                zip: this.state.zip,
                company_country_id : company_country_id,
                billing_country_id : billing_country_id,
                billing_company_name : billing_company_name,
                billing_street:this.state.billing_street,
                billing_city:this.state.billing_city,
                billing_zip:this.state.billing_zip,
                quotation_term_and_condition:quotation_term_and_condition,
                sales_term_and_condition:sales_term_and_condition,
                invoice_term_and_condition:invoice_term_and_condition,
                legacy_information:legacy_information,
                profile_image:this.state.profile_image,
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.props.process_state_change(true)
            }.bind(this),
            success: function (data) {
                if (data.success === true) {
                    this.props.process_state_change(false);
                    NotificationManager.success(data.msg, translate('label_success'), 5000);
                } else {
                    this.props.process_state_change(false);
                    NotificationManager.error(data.msg, translate('label_error'), 5000);
                }
            }.bind(this)
        });
    }

   handle_key_press(country_for, e){
       var lower_string = e.target.value;
       var csrftoken = getCookie('csrftoken');
       if(lower_string.length >=2 ){
            $.ajax({
                type: "POST",
                cache: false,
                url: '/general/fetch_country/',
                data: {
                    keyword :lower_string,
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                  //this.setState({input_value:e.target.value});
                }.bind(this),
                success: function (data) {
                    if (data.success){
                        if(country_for == 'company'){
                            this.setState({company_countries:data.countries_list, company_drop_down_class:'dropdown autocomplete open'});
                        } else if(country_for == 'billing'){
                            this.setState({billing_countries:data.countries_list, company_drop_down_class:'dropdown autocomplete open'});
                        }
                    }else{
                       this.setState({company_countries:[],billing_countries:[], company_drop_down_class:'dropdown autocomplete open'});
                    }
                }.bind(this)
            });
       }else{
           if(country_for == 'company') {
               this.setState({
                   company_countries: [],
                   company_drop_down_class: 'dropdown autocomplete ',
                   company_country_name: e.target.value
               });
           }else if(country_for == 'billing'){
                this.setState({
                   company_countries: [],
                   company_drop_down_class: 'dropdown autocomplete ',
                   billing_country_name: e.target.value
               });
           }
       }
       if(country_for == 'company') {
           this.setState({company_country_name: e.target.value});
       }else if(country_for == 'billing'){
           this.setState({billing_country_name: e.target.value});
       }
    }


    handle_click_country(country_for, country_id, name, ){
       if(country_id > 0) {
           if(country_for =='billing') {
               this.setState({billing_country_id: country_id, billing_country_name : name});
           }else if(country_for =='company'){
               this.setState({company_country_id: country_id, company_country_name : name});
           }
       }
    }


    render() {
        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <div className="row top-actions">
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <ul className="breadcrumbs-top"><li>Company Info</li></ul>
                        <button id ='save_all'  className="btn btn-primary" onClick={this.handle_save.bind(this)}>{translate('button_save')}</button>
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6"></div>
                </div>
                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular">
                            <ul className="nav nav-tabs" role="tablist">
                                <li role="presentation" className="active"><a href="#access_right" aria-controls="access_right" role="tab" data-toggle="tab">{' General Setting'}</a></li>
                                <li role="presentation"><a href="#quotation" aria-controls="preference" role="tab" data-toggle="tab">{'Sales'}</a></li>
                            </ul>
                            <form className="contact-main-form">
                            <div className="tab-content panel-body edit-form">
                                <div id="access_right" role="tabpanel" className="tab-pane fade in active">
                                    <div className="row row__flex">
                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 border-right">
                                            <table className="detail_table">
                                                <tbody>
                                                <tr>
                                                    <td rowspan="2">
                                                        <div className="form-group edit-name">
                                                            <input value={this.state.company_name}  className={"edit-name form-control " } required="" name="name"  onChange={this.handle_input_state.bind(this,'name')} placeholder={translate('label_name')}   type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="2">
                                                        <div className="form-group">
                                                            <input value={this.state.email}  className={"edit-name form-control " } required="" name="email"  onChange={this.handle_input_state.bind(this,'email')} placeholder={'Email'}   type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="2">
                                                        <div className="form-group">
                                                            <input value={this.state.phone} className={"edit-name form-control " } required="" name="phone" onChange={this.handle_input_state.bind(this,'phone')}  placeholder={'Phone'}   type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="2">
                                                        <div className="form-group">
                                                            <input value={this.state.mobile}  className={"edit-name form-control " } required="" name="mobile"  onChange={this.handle_input_state.bind(this,'mobile')} placeholder={'Mobile'}   type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="2">
                                                        <div className="form-group">
                                                            <div className="dropdown">
                                                                <input value={js_uc_first(this.state.language)} placeholder={translate('label_language')} className="form-control" data-toggle="dropdown" name="Language" aria-expanded="false" type="text" />
                                                                <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                    <i className="fa fa-angle-down black"></i>
                                                                </span>
                                                                <div className="dd-options">
                                                                    <ul className="options-list">
                                                                        <li onClick={this.handle_drop_down_state.bind(this, 'language', 'fr')}>{'French'}</li>
                                                                        <li onClick={this.handle_drop_down_state.bind(this, 'language', 'en')}>{'English'}</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="2">
                                                        <div className="form-group">
                                                            <div className="dropdown">
                                                                <input value={js_uc_first(this.state.currency)} placeholder={'Currency'} className="form-control" data-toggle="dropdown" name="Language" aria-expanded="false" type="text" />
                                                                <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                    <i className="fa fa-angle-down black"></i>
                                                                </span>
                                                                <div className="dd-options">
                                                                    <ul className="options-list">
                                                                        <li onClick={this.handle_drop_down_state.bind(this,'currency', 'dollar')}>{'Dollar'}</li>
                                                                        <li onClick={this.handle_drop_down_state.bind(this,'currency', 'euro')}>{'Euro'}</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="2">
                                                        <div className="form-group">
                                                            <textarea rows="1" cols="150" value={this.state.legacy_information} name="legency_info" placeholder={'Legacy information'} onChange={this.handle_input_state.bind(this,'legacy_information')}>{this.state.legacy_information}</textarea>
                                                        </div>
                                                        <p className="text-info">{'For Legacy information Max 120 characters allow '+ this.state.legacy_information_char_count}</p>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                                            <table className="detail_table">
                                                <tbody>
                                                <tr>
                                                    <td>
                                                        <div className="edit-dp">
                                                            <Dropzone
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
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                            <table className="detail_table">
                                                <tbody>
                                                <tr>
                                                    <td colSpan="2">
                                                        <div className="form-group"><h3>Address</h3></div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">Street</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.street} className="edit-name form-control " name="street" onChange={this.handle_input_state.bind(this,'street')} placeholder="Street" type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">City</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.city} className="edit-name form-control " name="city" onChange={this.handle_input_state.bind(this,'city')} placeholder="City" type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">Zip</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.zip} className="edit-name form-control " name="zip" onChange={this.handle_input_state.bind(this,'zip')} placeholder="Zip" type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">Country</label></td>
                                                    <td>
                                                    {
                                                        <div className="form-group">
                                                            <div className={this.state.company_drop_down_class}>
                                                                <input placeholder="Country" type="text" value= {this.state.company_country_name}   onChange={this.handle_key_press.bind(this, 'company')}  name="Country"  className="form-control"  />
                                                                <span data-toggle="dropdown" role="button">
                                                                    <i className="fa fa-angle-down black"></i>
                                                                </span>
                                                                <div className="dd-options">
                                                                    <ul className="options-list">
                                                                    {
                                                                        this.state.company_countries ?
                                                                            this.state.company_countries.map((country, i) =>{
                                                                               return <li key={i} data-id={country.id} onClick={this.handle_click_country.bind(this, 'company', country.id, country.name)}>{country.name}</li>
                                                                            })
                                                                        : null
                                                                    }
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan="2">
                                                        <div className="form-group"><h3>Billing Address</h3></div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">Company Name</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.billing_company_name} className="edit-name form-control " name="billing_company_name" onChange={this.handle_input_state.bind(this,'billing_company_name')} placeholder="Company Name" type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">Street</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.billing_street} className="edit-name form-control " name="billing_street" onChange={this.handle_input_state.bind(this,'billing_street')} placeholder="Street" type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">City</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.billing_city} className="edit-name form-control " name="billing_city" onChange={this.handle_input_state.bind(this,'billing_city')} placeholder="City" type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">Zip</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.billing_zip} className="edit-name form-control " name="billing_zip" onChange={this.handle_input_state.bind(this,'billing_zip')} placeholder="Zip" type="text" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="control-label">Billing Country</label></td>
                                                    <td>
                                                    {
                                                        <div className="form-group">
                                                            <div className={this.state.company_drop_down_class}>
                                                                <input placeholder="Country" type="text" value= {this.state.billing_country_name}   onChange={this.handle_key_press.bind(this, 'billing')} name="Country"  className="form-control"  />
                                                                <span data-toggle="dropdown" role="button">
                                                                    <i className="fa fa-angle-down black"></i>
                                                                </span>
                                                                <div className="dd-options">
                                                                    <ul className="options-list">
                                                                    {
                                                                        this.state.billing_countries ?
                                                                            this.state.billing_countries.map((country, i) =>{
                                                                               return <li key={i} data-id={country.id} onClick={this.handle_click_country.bind(this, 'billing', country.id, country.name)}>{country.name}</li>
                                                                            })
                                                                        : null
                                                                    }
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div id="quotation" role="tabpanel" className="tab-pane">
                                    <div className="row row__flex">
                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                            <table className="detail_table">
                                                <tbody>
                                                    <tr><td colSpan="2"><div className="form-group"> <h3>Terms and Conditions:</h3></div></td></tr>
                                                    <tr>
                                                        <td><label className="control-label">Quotation</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <textarea rows="3" cols="150" value={this.state.quotation_term_and_condition} name="quotation_term_and_condition" placeholder={'quotation_term_and_condition'} onChange={this.handle_input_state.bind(this,'quotation_term_and_condition')}>{this.state.quotation_term_and_condition}</textarea>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">Sales Order</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <textarea rows="3" cols="150" value={this.state.sales_term_and_condition} name="sales_term_and_condition" placeholder={'sales_term_and_condition'} onChange={this.handle_input_state.bind(this,'sales_term_and_condition')}>{this.state.sales_term_and_condition}</textarea>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><label className="control-label">Invoice</label></td>
                                                        <td>
                                                            <div className="form-group">
                                                                <textarea rows="3" cols="150" value={this.state.invoice_term_and_condition} name="invoice_term_and_condition" placeholder={'invoice_term_and_condition'} onChange={this.handle_input_state.bind(this,'invoice_term_and_condition')}>{this.state.invoice_term_and_condition}</textarea>
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
module.exports = GeneralCompanySettings;
