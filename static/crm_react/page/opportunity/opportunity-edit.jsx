import React from 'react';
import {Link, browserHistory} from 'react-router'
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {DateField, DatePicker} from 'react-date-picker'
import 'react-date-picker/index.css'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';

import LoadingOverlay  from 'crm_react/common/loading-overlay';
import Customer from 'crm_react/component/customer';
import MultiSelect from 'crm_react/page/contact/multiselect';

import RibbonRow from 'crm_react/page/opportunity/ribbon-row';
import {getCookie} from 'crm_react/common/helper';

class OpportunityEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            result: null,
            lost: false,
            RoleOfUser: '',
            customer_emails: '',
            email: '',
            master_id: this.props.opportunity_id,
            value: '',
            name: '',
            customer_name: '',
            customer_id: '',
            customer_email: '',
            customer_phone: '',
            lead_source_name: '',
            lead_source_id:'',
            sales_person_name: '',
            sales_person_id: '',
            sales_channel_id: '',
            sales_channel_name: '',
            estimated_revenue: 0.00,
            probability: '',
            expected_closing: '',
            rating: '',
            selected_tags: [],
            internal_notes: '',
            column_id: '',
            show_customer_extra_field: false,
            processing :false,


        };
        this.handle_save = this.handle_save.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.get_data_by_id();
    }

    get_data_by_id() {
        this.serverRequest = $.get('/opportunity/editdata/' + this.props.opportunity_id +'/', function (data) {
            this.setState({
                result: data,
                opportunityID: data.oppotunity_id,
                name: data.opportunity.name !== undefined ? data.opportunity.name : '',
                lost: data.opportunity.status !== null && data.opportunity.status != '1' ? true : false,

                customer_name: data.opportunity.customer_id !== undefined && data.opportunity.customer_id != '' ? data.opportunity.customer_name : '',
                customer_id: data.opportunity.customer_id !== undefined && data.opportunity.customer_id != '' ? data.opportunity.customer_id : '',
                customer_emails: data.opportunity.customerEmails !== undefined ? data.opportunity.customerEmails : '',
                customer_phone: data.opportunity.customerPhone !== undefined ? data.opportunity.customerPhone : '',

                lead_source_id: data.opportunity.lead_source_id !== undefined ? data.opportunity.lead_source_id : '',
                lead_source_name: data.opportunity.lead_source_name !== undefined ? data.opportunity.lead_source_name : '',

                sales_channel_name: data.opportunity.sales_channel_name !== undefined && data.opportunity.sales_channel_name != '' ? data.opportunity.sales_channel_name : '',
                sales_channel_id: data.opportunity.sales_channel_id !== undefined && data.opportunity.sales_channel_id != '' ? data.opportunity.sales_channel_id : '',

                sales_person_name: data.opportunity.currentsalesperson !== undefined && data.opportunity.currentsalesperson != '' ? data.opportunity.currentsalesperson : '',
                sales_person_id: data.opportunity.salesperson !== undefined && data.opportunity.salesperson != '' ? data.opportunity.salesperson : '',

                expected_closing: data.opportunity.expectedClosing != null && data.opportunity.expectedClosing != 'None' ? data.opportunity.expectedClosing : '',
                rating : data.opportunity.ratings,

                lostid: data.opportunity.lostReasonId !== null && data.opportunity.lostReasonId != '0' ? data.opportunity.lostReasonId : '',
                lostname: data.opportunity.currentLostReason !== undefined ? data.opportunity.currentLostReason : '',
                RoleOfUser: data.op_user_permission,
                estimated_revenue: data.opportunity.estimatedRevenue !== undefined ? data.opportunity.estimatedRevenue : '',
                internal_notes: data.opportunity.internal_notes ,
                probability: data.opportunity.probability,
            });

        }.bind(this));

    }


    handleChange(event) {
        const target = event.target;
        const name = target.name;
        const value = target.value;
        this.setState({[name]: value})
    }




    on_change_date(date){
        this.setState({expected_closing: moment(date).format('YYYY-MM-DD')})
    }

    handle_save(redirect) {
        let result = this.state.result,
            name = this.state.name;
        var col_id;
        var post_data= {'edit_id':this.props.opportunity_id,'name' :name, 'probability':this.state.probability,
        'customer_id' :this.state.customer_id, 'lead_source_id':this.state.lead_source_id,
        'sales_person' :this.state.sales_person_id, 'sales_channel_id':this.state.sales_channel_id,
        'expected_closing' :this.state.expected_closing, 'ratings':this.state.rating,
        'internal_notes' :this.state.internal_notes, 'column_id':col_id,
        'selected_tags':this.state.selected_tags, 'estimated_revenue':this.state.estimated_revenue

        };
        if ( $('#opportunuty_form').valid() ) {
            var csrftoken = getCookie('csrftoken');
            if (result && name != '') {
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/opportunity/editSave/',
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
                            browserHistory.push("/opportunity/view/" + data.edit_id + '/');
                        }
                    }.bind(this)
                });
            } else {
                this.setState({processing: false});
                NotificationManager.error('Opportunity name', 'The following fields:', 5000);
            }
        }
    }


//suyash
    handle_lost_reason_state(lost_reason_id){
        let result = this.state.result;
        result.opportunity.lostReasonId = lost_reason_id;
        this.setState({lost_reason_id: null, result:result});
        this.get_data_by_id();
    }

    handle_col_change(){
        this.get_data_by_id();
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
        this.handle_save()
    }

    set_rating(rate) {
        this.setState({rating: rate})
    }

    set_customer_id_name(data) {
        this.setState({
            show_customer_extra_field: true,
            customer_name: data.name,
            customer_id: data.id,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone
        })
    }

    retrun_selectd_tags(data) {
        let selected_tags = this.state.selected_tags;
        this.setState({selected_tags: data})
    }

    set_lead_return_data(data){
        console.log("lead data", data)
        this.setState({lead_source_id: data.id})
    }

    set_sales_person_retun_data(data){
        console.log("lead data", data)
        this.setState({sales_person_id: data.id})
    }

    set_sales_team_return_data(data){
        this.setState({sales_channel_id: data.id})
    }

    render(){
        let result = this.state.result;
        console.log("result", this.state.sales_person_name);

        var message_props_data = {
            'email': this.state.main_contact_email,
            'master_id': this.state.master_id
        };

        return (
            <div>
                <Header processing={this.state.processing}/>

                <div id="crm-app" className="clearfix module__opportunity module__opportunity-edit">

                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                                <AddPageTopAction
                                    list_page_link="/opportunity/list/"
                                    list_page_label="Opportunity"
                                    add_page_link={false}
                                    add_page_label={false}
                                    edit_page_link={false}
                                    edit_page_label={translate('button_edit') + '' + translate('your_opportunity')}
                                    item_name={result && result.opportunity.name !== undefined ? result.opportunity.name : null }
                                    page="edit"
                                    module="opportunity"
                                    save_action={this.save_action_fn.bind(this)}
                                />
                                {result ?
                                    <RibbonRow
                                        result={result}
                                        woncloumn_id={result.woncloumn_id}
                                        lostReasonId={result.opportunity.lostReasonId}
                                        default_col={result.columns}
                                        is_won={result.opportunity.is_won}
                                        op_status={result.opportunity.op_status}
                                        opp_id={this.props.opportunity_id}
                                        handle_lost_reason_state={this.handle_lost_reason_state.bind(this)}
                                        handle_col_change={this.handle_col_change.bind(this)}
                                        page="edit"
                                        editable={result && result.opportunity.editable? result.opportunity.editable : false}
                                    />
                                 : null
                                }
                                <div className="row crm-stuff">
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                        <div className="panel panel-default panel-tabular">
                                            <div className="panel-heading no-padding">
                                                <div className="row">
                                                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                                        <ul className="list-inline pull-right panel-tabular__top-actions">
                                                            {result && this.state.lost ?
                                                                <li id="lost-hover-action"
                                                                    className="text-muted lost-show"
                                                                    >
                                                                    <a href="javascript:void(0)">
                                                                        <i className="fa fa-archive"></i>
                                                                        <p className="inline-block o_not_hover">{translate('archive')}</p>
                                                                        <p className="inline-block o_hover">{translate('unarchive')}</p>
                                                                    </a>
                                                                </li>
                                                                : null
                                                            }
                                                            <li>
                                                                <a href={'/calendar/index/'}>
                                                                    <i className="cal-icon-sprite"></i>
                                                                    <p className="inline-block">
                                                                        <span>{result && result.opportunity.nextActivityId ? '1' : '0'} </span>{translate('meetings')}
                                                                    </p>
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a href="javascript:void(0)">
                                                                    <i className="note-icon-sprite"></i>
                                                                    <p className="inline-block">
                                                                        <span>0</span>{translate('quotes')} </p>
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
                                                             <td style={{'width':'50%'}}>
                                                                <div className="oe-name form-group edit-name">
                                                                    <input value={this.state.name} onChange={this.handleChange}
                                                                           name="name"
                                                                           className="form-control"
                                                                           placeholder={translate('opportunity_name')}
                                                                           required ref="name"   id="name"
                                                                    />
                                                                </div>
                                                             </td>
                                                             <td>
                                                                  {result && result.opportunity.is_won ? <span className="label pull-right label-success ">Won</span> : null}
                                                                  {result && result.opportunity.is_lost ? <span className="label pull-right label-danger ">Lost</span> : null}
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                                    <p className="oe-price">
                                                        <input
                                                            value={this.state.estimated_revenue}
                                                            name="estimated_revenue"
                                                            onChange={this.handleChange}
                                                            className="form-control auto-width"
                                                        />
                                                        <span>{result ? result.currency : null }</span>
                                                        <span className="push-left-10">{translate('at')}</span>
                                                        <input
                                                            value={this.state.probability}
                                                            name="probability"
                                                            onChange={this.handleChange}
                                                            className="form-control auto-width push-left-10"
                                                        />
                                                        <span className="push-left-10">%</span>
                                                    </p>
                                                    <div className="row">
                                                        <div
                                                            className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                            <table className="detail_table">
                                                                <tbody>
                                                                {result ?
                                                                    <Customer
                                                                        field_name="customer"
                                                                        field_label="Customer"
                                                                        show_lable={true}
                                                                        customer_type ='customer'
                                                                        set_return_data ={this.set_customer_id_name.bind(this)}
                                                                        get_data_url="/contact/company/"
                                                                        post_data_url="/contact/company_create/"
                                                                        selected_name={this.state.customer_name}
                                                                        selected_id={this.state.customer_id}
                                                                        item_selected={false}
                                                                        create_option={true}
                                                                        create_edit_option={false}

                                                                    />
                                                                    : null
                                                                }

                                                                {result ?
                                                                    <Customer
                                                                        field_name="lead_source"
                                                                        field_label="Lead Source"
                                                                        show_lable={true}
                                                                        customer_type ='customer'
                                                                        set_return_data={this.set_lead_return_data.bind(this)}
                                                                        get_data_url="/opportunity/get_lead_source/"
                                                                        post_data_url="/opportunity/addLeadsource/"
                                                                        selected_name={this.state.lead_source_name}
                                                                        selected_id={this.state.lead_source_id}
                                                                        item_selected={true}
                                                                        create_option={true}
                                                                        create_edit_option={false}
                                                                    />
                                                                    : null
                                                                }

                                                                {result ?
                                                                    <Customer
                                                                        field_name="sales_person"
                                                                        field_label="Sales Person"
                                                                        show_lable={true}
                                                                        customer_type ='customer'
                                                                        set_return_data ={this.set_sales_person_retun_data.bind(this)}
                                                                        get_data_url="/opportunity/get_sales_persion/"
                                                                        post_data_url={false}
                                                                        selected_name={this.state.sales_person_name}
                                                                        selected_id={this.state.sales_person_id}
                                                                        item_selected={true}
                                                                        create_option={false}
                                                                        create_edit_option={false}
                                                                    />
                                                                    :null
                                                                }

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
                                                                        item_selected={true}
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
                                                                            {result ?
                                                                                <DateField dateFormat="YYYY-MM-DD"
                                                                                           updateOnDateClick={true}
                                                                                           collapseOnDateClick={true}
                                                                                           defaultValue={result && result.opportunity.expectedClosing ? result.opportunity.expectedClosing : '' }
                                                                                           showClock={false}>
                                                                                    <DatePicker
                                                                                        navigation={true}
                                                                                        locale="en"
                                                                                        highlightWeekends={true}
                                                                                        highlightToday={true}
                                                                                        weekNumbers={true}
                                                                                        weekStartDay={0}
                                                                                        onChange={this.on_change_date.bind(this)}
                                                                                        footer={false}/>
                                                                                </DateField>
                                                                                : null
                                                                            }
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {this.render_rating()}
                                                                {result ?
                                                                    <MultiSelect
                                                                        field_name="tag"
                                                                        field_label="Tags"
                                                                        selected_tags={this.state.selected_tags}
                                                                        show_lable={true}
                                                                        get_data_url="/contact/tags/"
                                                                        post_data_url="/contact/tag_create/"
                                                                        create_option={true}
                                                                        create_edit_option={false}
                                                                        retrun_selectd_tags={this.retrun_selectd_tags.bind(this)}
                                                                    />
                                                                    : null
                                                                }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>

                                                </form>
                                            </div>

                                            <div>
                                                <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
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
                                                        <textarea onChange={this.handleChange} id="internal_notes_id"
                                                                  name="internal_notes" className="form-control"
                                                                  value={this.state.internal_notes}
                                                                  placeholder={translate('write_notes')}>
                                                        </textarea>
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
module.exports = OpportunityEdit;