import React from 'react';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {browserHistory } from 'react-router'
import {ROLES, ID} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import RibbonRow from 'crm_react/page/opportunity/ribbon-row';
import Message from 'crm_react/component/message';
import { form_group } from 'crm_react/common/helper';
import ContactView from 'crm_react/page/contact/contact-view';

class OpportunityView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null,
            lost_reason_id:null,
            processing:false,
            customer:null,
        };
        this.get_ajax_response();
    }

    get_ajax_response(){
        this.serverRequest = $.get('/opportunity/viewdata/' + this.props.opportunity_id+'/', function (data) {
                this.setState({result: data, processing:false})

        }.bind(this));
    }

    handleNextPrev(Action, current_id) {
        var id_array = this.state.op_id_list;
        if (id_array.length == 0)
            return false;
        var current_index = '0';
        var next_op_id = '';
        var arr_length = id_array.length;
        current_index = id_array.indexOf(current_id);
        if (Action == 'pre') {
            if (current_index == 0) {
                next_op_id = id_array[arr_length - 1];
            }else {
                next_op_id = id_array[current_index - 1];
            }
        }
        if (Action == 'next') {
            if (current_index == arr_length - 1) {
                next_op_id = id_array['0'];
            }else {
                next_op_id = id_array[current_index + 1];
            }
        }
        if (next_op_id !== undefined && next_op_id != '' && next_op_id != 0) {
            browserHistory.push( "/opportunity/view/" + next_op_id);
            this.getOpportunityById(next_op_id);
        }
    }

    handle_lost_reason_state(lost_reason_id){
        let result = this.state.result;
        result.opportunity.lostReasonId = lost_reason_id;
        this.setState({lost_reason_id: null, result:result, processing:true});
        this.get_ajax_response();
    }

    handle_col_change(){
        this.setState({processing:true});
        this.get_ajax_response();
    }

    render_rating(rate){
        let rating_html;
        if(rate ==1){
            rating_html =<div className="ratings">
                        <i className="fa fa-star selected" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                    </div>
        }else if(rate == 2){
            rating_html =<div className="ratings">
                        <i className="fa fa-star selected" aria-hidden="true"></i>
                        <i className="fa fa-star selected" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                    </div>
        }else if(rate ==3){
            rating_html =<div className="ratings">
                        <i className="fa fa-star selected" aria-hidden="true"></i>
                        <i className="fa fa-star selected" aria-hidden="true"></i>
                        <i className="fa fa-star selected" aria-hidden="true"></i>
                    </div>
        }else{
            rating_html =<div className="ratings">
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <i className="fa fa-star" aria-hidden="true"></i>
                    </div>
        }
        return(
            <div className="form-group ratings-wrap">{rating_html}</div>
        );
    }

    render() {
        let result = this.state.result;
        let customer = this.state.customer;
        let default_col=[];
        if (result) {
            default_col = result.columns;
        }
       var message_props_data = {
           'email':'temp@gmail.com',
           'master_id':this.props.opportunity_id,
           'module_id':2,
           'module_name':'opportunity'
       };
       console.log("contact info", customer)
        return (
            <div>
                <Header processing={this.state.processing}/>
                <div id="crm-app" className="clearfix module__opportunity">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                                <AddPageTopAction
                                    list_page_link ="/opportunity/list/"
                                    list_page_label ="Opportunity"
                                    add_page_link="/opportunity/add/"
                                    add_page_label ="Add New Opportunity"
                                    edit_page_link={result && result.opportunity.editable? '/opportunity/edit/' + this.props.opportunity_id+ '/' : null}
                                    edit_page_label ={translate('edit_opportunity')}
                                    item_name = {result && result.opportunity.name !== undefined ? result.opportunity.name:null}
                                    page="view"
                                    module="opportunity"
                                    save_action ={false}
                                />
                                {result ?
                                    <RibbonRow
                                        result={result}
                                        woncloumn_id={result.woncloumn_id}
                                        lostReasonId={result.opportunity.lostReasonId}
                                        is_won={result.opportunity.is_won}
                                        op_status={result.opportunity.op_status}
                                        default_col={default_col}
                                        opp_id={this.props.opportunity_id}
                                        handle_lost_reason_state={this.handle_lost_reason_state.bind(this)}
                                        handle_col_change={this.handle_col_change.bind(this)}
                                        page="view"
                                        editable={result && result.opportunity.editable? result.opportunity.editable : false}
                                    />
                                 : null
                                }
                                <div className="row crm-stuff">
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-8">
                                        <div className="panel panel-default panel-tabular">
                                            <div className="panel-heading no-padding">
                                                <div className="row">
                                                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                                        <ul className="pull-right panel-tabular__top-actions">
                                                            <li>
                                                                <a href="#" title="Check Meetings"><i className="cal-icon-sprite"></i>
                                                                <p className="inline-block"><span className="text-highlight">0</span> Meetings</p></a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel-body">
                                                 <table className="detail_table">
                                                     <tbody>
                                                         <tr>
                                                             <td style={{'width':'50%'}}>
                                                                <div className="oe-name form-group edit-name">
                                                                    <h2 className="oe-name">{result && result.opportunity.name}</h2>
                                                                </div>
                                                             </td>
                                                             <td>
                                                                  {result && result.opportunity.is_won ? <span className="label pull-right label-success ">Won</span> : null}
                                                                  {result && result.opportunity.is_lost ? <span className="label pull-right label-danger ">Lost</span> : null}
                                                             </td>
                                                         </tr>
                                                     </tbody>
                                                 </table>
                                               {result && result.opportunity.estimatedRevenue ?
                                                <p className="oe-price">
                                                        <span className="auto-width">{result.opportunity.estimatedRevenue}</span>
                                                        <span >{result ? result.currency : null }</span>
                                                    { result.opportunity.probability ?
                                                        <span>
                                                            <span className="push-left-10">{translate('at')}</span>
                                                            <span className="auto-width push-left-10">{result.opportunity.probability}</span>
                                                            <span>%</span>
                                                        </span>
                                                        :null
                                                    }
                                                </p>
                                                :null
                                                }
                                                <div className="row row__flex">
                                                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                        <table className="detail_table">
                                                             <tbody>
                                                                   <tr>
                                                                        <td><label className={result && result.opportunity.customer_name?'control-label':'text-muted control-label'}>Customer</label></td>
                                                                        <td><div className="form-group">{result && result.opportunity.customer_name?result.opportunity.customer_name:null}</div></td>
                                                                   </tr>
                                                                   {result && result.opportunity.customerEmails?
                                                                       <tr>
                                                                            <td><label className={result && result.opportunity.customerEmails?'control-label':'text-muted control-label'}>Email</label></td>
                                                                            <td><div className="form-group">{result && result.opportunity.customerEmails?result.opportunity.customerEmails:null}</div></td>
                                                                       </tr>
                                                                       :null
                                                                   }
                                                                   {result && result.opportunity.customerPhone?
                                                                   <tr>
                                                                        <td><label className={result && result.opportunity.customerPhone?'control-label':'text-muted control-label'}>Phone</label></td>
                                                                        <td><div className="form-group">{result && result.opportunity.customerPhone?result.opportunity.customerPhone:null}</div></td>
                                                                   </tr>
                                                                       :null
                                                                   }
                                                                    <tr>
                                                                        <td>
                                                                            <label className={result && result.opportunity.sales_person_name?'control-label':'text-muted control-label'}>Sales Person</label>
                                                                        </td>
                                                                        <td>
                                                                            <div className="form-group">
                                                                                <div className="selected-sales-person" >
                                                                                    <img src={result && result.opportunity.sales_person_profile_image?result.opportunity.sales_person_profile_image:''} alt={result && result.opportunity.sales_person_name} title={result && result.opportunity.sales_person_name} className="img-circle" width="30" height="30"/>
                                                                                    <span className="push-left-2">{result && result.opportunity.sales_person_name?result.opportunity.sales_person_name:null}</span>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                   <tr>
                                                                        <td><label className={result && result.opportunity.sales_channel_name?'control-label':'text-muted control-label'}>Sales Team</label></td>
                                                                        <td>
                                                                            <div className="form-group">
                                                                                {result && result.opportunity.sales_channel_id > 0 ? result.opportunity.sales_channel_name: null }
                                                                                </div>
                                                                        </td>
                                                                   </tr>
                                                             </tbody>
                                                        </table>

                                                    </div>
                                                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                                        <table className="detail_table">
                                                           <tbody>
                                                               <tr>
                                                                    <td><label className={result && result.opportunity.expectedClosing?'control-label':'text-muted control-label'}>Expecting Closing</label></td>
                                                                    <td><div className="form-group">{result && result.opportunity.expectedClosing}</div></td>
                                                               </tr>
                                                               <tr>
                                                                    <td>
                                                                        <label className={result && result.opportunity.ratings?'control-label':'text-muted control-label'} >Rating</label>
                                                                    </td>
                                                                    <td>
                                                                        {result && result.opportunity.ratings ? this.render_rating(result.opportunity.ratings):this.render_rating(4)}
                                                                    </td>
                                                               </tr>
                                                               <tr>
                                                                    <td>
                                                                        <label className= {result && result.opportunity.currenttags.length > 0 ?'control-label':'text-muted control-label'}>Tags</label>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group">
                                                                            <ul className="list-inline tagbox">
                                                                            {result && result.opportunity.currenttags!=undefined && result.opportunity.currenttags.length > 0 ?
                                                                              result.opportunity.currenttags.map((tag ,i)=>{
                                                                                return(
                                                                                    <li key={'tag_'+i } className={"color-"+tag.color}><i className="fa fa-circle-o"></i><span>{tag.name}</span></li>
                                                                                  )
                                                                              }):null
                                                                            }
                                                                            </ul>
                                                                        </div>
                                                                    </td>
                                                               </tr>
                                                           </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <ul className="nav nav-tabs nav-tabs-custom">
                                                    <li role="presentation" className="active">
                                                        <a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab">Internal Notes</a>
                                                    </li>
                                                    <li role="presentation" className="">
                                                        <a href="#field-tab-contact" aria-controls="field-tab-contact" role="tab" data-toggle="tab">Customer Information</a>
                                                    </li>
                                                </ul>
                                                <div className="panel-body edit-form">
                                                    <div className="tab-content">
                                                        <div role="tabpanel" className="tab-pane active" id="field-tab-1">
                                                            <p>{result && result.opportunity.InternalNotes}</p>
                                                        </div>
                                                        <div role="tabpanel" className="tab-pane " id="field-tab-contact">
                                                        { result && result.opportunity.customer_uuid ?
                                                            <ContactView contact_id ={result.opportunity.customer_uuid} use_self={false}/>
                                                            :null
                                                        }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Message ref="msgcomponet" props_data={message_props_data}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationContainer/>
            </div>
        );
    }
}
module.exports = OpportunityView;
