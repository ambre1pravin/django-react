import React from 'react';
import { Link, browserHistory } from 'react-router'
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { DateField, DatePicker } from 'react-date-picker'
import 'react-date-picker/index.css'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import Customer from 'crm_react/component/customer';
import MultiSelect from 'crm_react/page/contact/multiselect';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {getCookie,is_string_blank } from 'crm_react/common/helper';

class  opportunityadd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null,
            user_json: [],
            RoleOfUser: '',
            name: '',
            name_class: null,
            customer_name: '',
            customer_id: '',
            customer_email: '',
            customer_phone: '',
            lead_source: '',
            sales_person_name: '',
            sales_person_id: '',
            sales_channel_id: '',
            sales_channel_name: '',
            estimated_revenue: '',
            probabilitydata: '',
            probability: '',
            expected_closing: '',
            rating: '',
            customtags: [],
            internalnotes: '',
            column_id: '',
            internal_notes_id: '',
            processing: false,
        };

        this.handle_change = this.handle_change.bind(this)

        this.serverRequest = $.get('/opportunity/adddata/', function (data) {
            this.setState({
                result: data,
                sales_person_name: data.currentsalesperson !== undefined && data.currentsalesperson != '' ? data.currentsalesperson : '',
                sales_person_id: data.salesperson !== undefined && data.salesperson != '' ? data.salesperson : '',
                sales_channel_name: data.default_sales_channel_name !== undefined && data.default_sales_channel_name != '' ? data.default_sales_channel_name : '',
                sales_channel_id: data.default_sales_channel_id !== undefined && data.default_sales_channel_id != '' ? data.default_sales_channel_id : '',
                user_json: data.json_users !== undefined ? data.json_users : [],
                lead_source: data.leadSource !== undefined ? data.leadSource : '',
                select_ls_value: data.leadSource !== undefined && data.leadSource != '' ? data.leadSource : '',
                select_ls_id: data.leadSource !== undefined && data.leadSource != '' ? data.leadSource : '',
                probabilitydata: data.probability !== undefined && data.probability != '' ? data.probability : '',
                RoleOfUser: data.roles,
                column_id: data.default_column_id
            });


        }.bind(this));

    }

    handle_change(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({[name]: value});
    }

    input_on_click(){
        this.setState({name_class:null})
    }

    handle_change_probability(event) {
        this.setState({
            probabilitydata: event.target.value,
        })
    }

    on_change_notes(event){
        this.setState({internal_notes_id:event.target.value})
    }

    retrun_selectd_tags(data){
        let customtags = this.state.customtags;
        this.setState({customtags:data})
    }

    on_change_date(date){
        this.setState({expected_closing: moment(date).format('YYYY-MM-DD')})
    }

    handle_add_submit(modal_name = '') {
        let result = this.state.result,
            name = this.state.name;
        var col_id;
        if(is_string_blank(name)) {
            if (result && this.state.name != '' && this.state.column_id!='') {
                var post_data = {
                    'name': name, 'probability': this.state.probabilitydata,
                    'customer_id': this.state.customer_id, 'lead_source': this.state.lead_source,
                    'sales_person': this.state.sales_person_id, 'sales_channel_id': this.state.sales_channel_id,
                    'expected_closing': this.state.expected_closing, 'ratings': this.state.rating,
                    'internalnotes': this.state.internal_notes_id, 'column_id': this.state.column_id,
                    'customtags': this.state.customtags, 'estimated_revenue': this.state.estimated_revenue

                };
                var csrftoken = getCookie('csrftoken');
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/opportunity/save/',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(post_data),
                        csrfmiddlewaretoken: csrftoken,
                    },
                    beforeSend: function () {
                        this.setState({processing: true})
                    }.bind(this),
                    success: function (data) {
                        if (data.success === true) {
                            this.setState({processing: false});
                            browserHistory.push("/opportunity/view/" + data.id + '/');

                        }
                    }.bind(this)
                });
            } else {
                this.setState({processing: false});
                NotificationManager.error('Opportunity name', 'The following fields:', 5000);
            }
        }else{
            this.setState({name_class:'error'})
        }
    }




    //suyash code start
    set_rating(rate) {
        this.setState({rating: rate})
    }

    set_customer_id_name(data){
        this.setState({
            customer_name:data.name,
            customer_id:data.id,
            customer_email:data.customer_email,
            customer_phone:data.customer_phone
        })

    }

    set_lead_return_data(data){
        this.setState({lead_source: data.id})
    }

    set_sales_person_retun_data(data){
        this.setState({sales_person_id: data.id})
    }
    set_sales_team_return_data(data){
        this.setState({sales_channel_id: data.id})
    }

    render_rating() {
        let rating = this.state.rating;
        let rating_html;
        if (rating == 1) {
            rating_html = <span>
                        <span className="ratingicon glyphicon star-red-icon-sprite"
                              onClick={this.set_rating.bind(this, 1)}></span>
                        <span className="ratingicon glyphicon star-gray-icon-sprite"
                              onClick={this.set_rating.bind(this, 2)}></span>
                        <span className="ratingicon glyphicon star-gray-icon-sprite"
                             onClick={this.set_rating.bind(this, 3)}></span>
                    </span>
        } else if (rating == 2) {
            rating_html = <span>
                        <span className="ratingicon glyphicon star-red-icon-sprite"
                              onClick={this.set_rating.bind(this, 1)}></span>
                        <span className="ratingicon glyphicon star-red-icon-sprite"
                              onClick={this.set_rating.bind(this, 2)}></span>
                        <span className="ratingicon glyphicon star-gray-icon-sprite"
                              onClick={this.set_rating.bind(this, 3)}></span>
                    </span>
        } else if (rating == 3) {

            rating_html = <span>
                        <span className="ratingicon glyphicon star-red-icon-sprite"
                              onClick={this.set_rating.bind(this, 1)}></span>
                        <span className="ratingicon glyphicon star-red-icon-sprite"
                              onClick={this.set_rating.bind(this, 2)}></span>
                        <span className="ratingicon glyphicon star-red-icon-sprite"
                              onClick={this.set_rating.bind(this, 3)}></span>
                    </span>
        } else {
            rating_html = <span>
                        <span className="ratingicon glyphicon star-gray-icon-sprite"
                             onClick={this.set_rating.bind(this, 1)}></span>
                        <span className="ratingicon glyphicon star-gray-icon-sprite"
                              onClick={this.set_rating.bind(this, 2)}></span>
                        <span className="ratingicon glyphicon star-gray-icon-sprite"
                              onClick={this.set_rating.bind(this, 3)}></span>
                    </span>
        }
        return (
            <tr>
                <td>
                    <label className="control-label">{translate('label_rating')}</label>
                </td>
                <td>
                    <div className="form-group">
                        {rating_html}
                    </div>
                </td>
            </tr>
        );
    }

    save_action_fn() {
        this.handle_add_submit()
    }

  render() {
    let result = this.state.result;

    console.log("cccc", this.state.column_id);

    var tag_data = {'data_id':'1',
                'name':'Tags',
                'type':'multiselect',
                'input_value': '',
                'default_value':'',
                'display_position': 'right',
                'display_type':'',
                'is_required':"true",
    };
    return (
        <div>
            <Header />
            <div id="crm-app" className="clearfix module__opportunity module__opportunity-edit">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                            <AddPageTopAction
                                list_page_link ="/opportunity/list/"
                                list_page_label ={translate('your_opportunity')}
                                add_page_link="/opportunity/add/"
                                add_page_label ="Add Opportunity"
                                edit_page_link={false}
                                edit_page_label ={false}
                                item_name=""
                                page="add"
                                module="opportunity"
                                save_action ={this.save_action_fn.bind(this)}
                            />
                            <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-heading no-padding">
                                            <div className="row">
                                                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                                    <ul className="list-inline pull-right panel-tabular__top-actions">
                                                        <li>
                                                            <a href="#" title={translate('check_meetings')}>
                                                                <i className="cal-icon-sprite"></i>
                                                                <p className="inline-block">
                                                                    <span>0</span>
                                                                    {translate('meetings')}
                                                                </p>
                                                            </a>
                                                        </li>
                                                        <li>
                                                            <a href="javascript:void(0)">
                                                                <i className="note-icon-sprite"></i>
                                                                <p className="inline-block">
                                                                    <span>0</span>
                                                                    {translate('quotes')}
                                                                </p>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel-body edit-form">
                                        <form id="opportunuty_form" method="post" action="" autoComplete="Off">
                                                 <table className="detail_table">
                                                     <tbody>
                                                     <tr>
                                                         <td>

                                                    <div className="oe-name form-group edit-name">
                                                    <input type="text" onChange={this.handle_change} name="name"
                                                           className={"form-control "+this.state.name_class} value={this.state.name}
                                                           placeholder={translate('opportunity_name')}
                                                           required ref="name"   id="name"
                                                           onClick={this.input_on_click.bind(this)}
                                                    />
                                                    {this.state.name_class ?
                                                        <label id="name-error" className="error"
                                                               for="name">This field is required.</label>
                                                        :null
                                                    }
                                                    </div>

                                                         </td>
                                                     </tr>
                                                     </tbody>
                                                 </table>
                                                <p className="oe-price">
                                                            <input type="text" name="estimated_revenue"
                                                                   onChange={this.handle_change}
                                                                   className="form-control auto-width"
                                                                   placeholder={'0.00'}
                                                                   value={this.state.estimated_revenue}/>
                                                            <span>{result ? result.currency : null }</span>
                                                            <span className="push-left-10">{translate('at')}</span>
                                                            <input type="text" name="probability"
                                                                   onChange={(event) => this.handle_change_probability(event)}
                                                                   className="form-control auto-width push-left-10"
                                                                   value={this.state.probabilitydata} />
                                                            <span className="push-left-10">%</span>
                                                </p>
                                                <div className="row">
                                                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                        <table className="detail_table">
                                                            <tbody>
                                                            <Customer
                                                                field_name="customer"
                                                                field_label="Customer"
                                                                show_lable={true}
                                                                customer_type ='customer'
                                                                set_return_data ={this.set_customer_id_name.bind(this)}
                                                                get_data_url="/contact/company/"
                                                                post_data_url="/contact/company_create/"
                                                                selected_name=""
                                                                selected_id={null}
                                                                item_selected={false}
                                                                create_option={true}
                                                                create_edit_option={false}
                                                            />

                                                            <Customer
                                                                field_name="lead_source"
                                                                field_label="Lead Source"
                                                                show_lable={true}
                                                                customer_type ='customer'
                                                                set_return_data ={this.set_lead_return_data.bind(this)}
                                                                get_data_url="/opportunity/get_lead_source/"
                                                                post_data_url="/opportunity/addLeadsource/"
                                                                selected_name=""
                                                                selected_id={null}
                                                                item_selected={false}
                                                                create_option={true}
                                                                create_edit_option={false}
                                                            />


                                                            <Customer
                                                                field_name="sales_person"
                                                                field_label="Sales Person"
                                                                show_lable={true}
                                                                customer_type ='customer'
                                                                set_return_data ={this.set_sales_person_retun_data.bind(this)}
                                                                get_data_url="/opportunity/get_sales_persion/"
                                                                post_data_url={false}
                                                                selected_name=""
                                                                selected_id={null}
                                                                item_selected={true}
                                                                create_option={false}
                                                                create_edit_option={false}
                                                            />
                                                            {result ?
                                                                <Customer
                                                                    field_name="sales_team"
                                                                    field_label={translate('sales_team')}
                                                                    show_lable={true}
                                                                    customer_type ='customer'
                                                                    set_return_data ={this.set_sales_team_return_data.bind(this)}
                                                                    get_data_url="/opportunity/get_sales_team/"
                                                                    post_data_url="/opportunity/addLeadsource/"
                                                                    selected_name={this.state.sales_channel_name}
                                                                    selected_id={this.state.sales_channel_id}
                                                                    item_selected={false}
                                                                    create_option={false}
                                                                    create_edit_option={false}
                                                                />
                                                                :null
                                                            }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                                        <table className="detail_table">
                                                            <tbody>
                                                            <tr>
                                                                <td><label
                                                                    className="control-label">{translate('label_expecting_closing')}</label>
                                                                </td>
                                                                <td>
                                                                    <div className="form-group expected_closing">
                                                                        <DateField dateFormat="YYYY-MM-DD"
                                                                                   updateOnDateClick={true}
                                                                                   collapseOnDateClick={true}
                                                                                   defaultValue={''}
                                                                                   showClock={false}>

                                                                            <DatePicker
                                                                                navigation={true}
                                                                                locale="en"
                                                                                highlightWeekends={true}
                                                                                highlightToday={true}
                                                                                weekNumbers={true}
                                                                                weekStartDay={0}

                                                                                onChange={this.on_change_date.bind(this)}
                                                                            />

                                                                        </DateField>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            {this.render_rating()}
                                                            <MultiSelect
                                                                field_name="tag"
                                                                field_label="Tags"
                                                                selected_tags={[]}
                                                                show_lable={true}
                                                                get_data_url="/contact/tags/"
                                                                post_data_url="/contact/tag_create/"
                                                                create_option={true}
                                                                create_edit_option={false}
                                                                retrun_selectd_tags={this.retrun_selectd_tags.bind(this)}
                                                            />
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                        </form>
                                        </div>
                                        <div>
                                            <ul className="nav nav-tabs nav-tabs-custom " role="tablist">
                                                <li role="presentation" className="active">
                                                    <a href="#field-tab-1"
                                                          aria-controls="field-tab-1"
                                                          role="tab"
                                                          data-toggle="tab">{translate('label_internal_notes')}
                                                    </a>
                                                </li>
                                            </ul>
                                            <div className="tab-content custCon edit-form panel-body">
                                                <div role="tabpanel" className="tab-pane form-group active"
                                                     id="field-tab-1">
                                                    <textarea id="internal_notes_id" className="form-control"
                                                              placeholder={translate('write_notes')} onChange={this.on_change_notes.bind(this)}></textarea>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NotificationContainer/>
            <LoadingOverlay processing={this.state.processing}/>
        </div>
    );
  }
}
module.exports = opportunityadd;
