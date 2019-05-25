import React from 'react';
import ReactTooltip from 'react-tooltip'
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie, cursor_pointer} from 'crm_react/common/helper';
import LoadingOverlay  from 'crm_react/common/loading-overlay';

class CreateInvoice extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            processing:false,
            invoice_type:'manual',
            radio_invoice:'delivered',
            percentage:null,
            fixed_amount:null,
            send_by_email:false,
            template_name: null,
            template_id:null,
            templates:[],
            template_result:{},
        };
        this.serverRequest = $.get('/quotation/default-template/'+this.props.module+'/', function (data) {
            let template_result = {'template_id':data.result.id, 'module':this.props.module, 'editor_txt':data.result.description, 'subject':data.result.subject,'template_name':data.result.name};
            this.setState({template_id:data.result.id, template_name:data.result.name,template_result:template_result});
        }.bind(this));
    };

    handle_close() {
        ModalManager.close(<CreateInvoice modal_id="create-invoice-modal" onRequestClose={() => true}/>);
    }

    handle_invoice_type(invoice_type){
       if(invoice_type == 'manual')
        this.setState({invoice_type:invoice_type, send_by_email:false});
       else
        this.setState({invoice_type:invoice_type});
    }

    handle_radio_invoice(radio_invoice){
       this.setState({radio_invoice:radio_invoice});
    }

    handle_send_by_email(){
        this.setState({send_by_email:!this.state.send_by_email});
    }

    handle_change_percentage(event){
        this.setState({percentage :event.target.value})
    }

    handle_change_fixed_amt(event){
        this.setState({fixed_amount :event.target.value})
    }

    handle_click_div() {
        $.ajax({
            type: "POST",
            cache: false,
            url: '/quotation/getEmailTemplate/'+this.props.module+'/',
            data: {
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({loading: true});
            }.bind(this),
            success: function (data) {
                if (data.success) {
                    this.setState({
                        templates: data.email_template_json,
                        drop_down_class: 'dropdown autocomplete open'
                    });
                } else {
                    this.setState({
                        templates: [],
                        drop_down_class: 'dropdown autocomplete open'
                    });
                }
            }.bind(this)
        });
    }

    handle_change_template_name(event){
        this.setState({template_name :event.target.value})
    }

    select_template(index){
        let templates =  this.state.templates;
        if(templates.length > 0){
            this.setState({template_id:templates[index].id, template_name:templates[index].name})
        }
    }

    handle_save(){
        var action_url = null;
        var field_data = {};
        if(this.state.invoice_type =='manual'){
            action_url = '/customer/invoice/CreateInvoice/';
            field_data = {
                'invoice_type': this.state.invoice_type,
                'radio_type': this.state.radio_invoice,
                'percentage_value': this.state.percentage,
                'quotation_id': this.props.q_id,
                'fixed_amount': this.state.fixed_amount
            };
        }else if(this.state.invoice_type =='auto'){
            action_url = '/customer/invoice/AutoCreateInvoice/';
            field_data = {
                'invoice_type': this.state.invoice_type,
                'send_by_email': this.state.send_by_email,
                'quotation_id': this.props.q_id,
                'email_template_id': this.state.send_by_email ? this.state.template_id: 0
            };
        }

        if(action_url!=null) {
            $.ajax({
                type: "POST",
                cache: false,
                url: action_url,
                data: {
                    ajax: true,
                    fields: JSON.stringify(field_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success == true) {
                        this.handle_close();
                        this.props.get_total_invoice_by_id();
                    }else if(data.success == false && data.msg){
                        NotificationManager.error(data.msg, translate('label_error'),5000);
                    }
                }.bind(this)
            });
        }
    }


    render_body(){
        return(
            <div className="row crm-stuff">
                <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                    <div className="bg-primary">
                      <span className="push-left-5">This will follow the rules set in the payment.</span>
                    </div>
                    <table className="col-xs-8 col-sm-8 col-md-8 col-lg-8 edit-form" id="invoicetable" width={'100%'}>
                      <tbody>
                          <tr>
                              <td width={'50%'}><label className="control-label">Invoice Type</label></td>
                              <td>
                                <input
                                    name="invoicetype"
                                    value="manual"
                                    type="radio"
                                    style={cursor_pointer}
                                    onClick={this.handle_invoice_type.bind(this, 'manual')}
                                    checked={this.state.invoice_type == 'manual'? true : false}
                                />
                                <label
                                    className="push-left-5"
                                    style={cursor_pointer}
                                    onClick={this.handle_invoice_type.bind(this, 'manual')}>Manual Invoice</label>
                                <br/>
                                <input
                                    name="invoicetype"
                                    value="manual"
                                    type="radio"
                                    style={cursor_pointer}
                                    onClick={this.handle_invoice_type.bind(this, 'auto')}
                                    checked={this.state.invoice_type == 'auto'? true : false}
                                />
                                <label
                                    className="push-left-5"
                                    style={cursor_pointer}
                                    onClick={this.handle_invoice_type.bind(this, 'auto')}>Automatically Invoice</label>
                                <br/>
                              </td>
                          </tr>

                          { this.state.invoice_type=='auto'?
                          <tr>
                              <td width={'50%'}>&nbsp;</td>
                              <td>
                                <input
                                    name="checkbox_email"
                                    value="1"
                                    type="checkbox"
                                    style={cursor_pointer}
                                    checked={this.state.send_by_email ? true : false}
                                    onClick={this.handle_send_by_email.bind(this)}
                                />
                                 <label htmlFor="checkbox_email ">
                                    <span className="push-left-5" style={cursor_pointer} onClick={this.handle_send_by_email.bind(this)}>Send by Mail</span>
                                    <span  data-tip data-for={'email_send'} className="glyphicon glyphicon-info-sign text-primary push-left-2"></span>
                                    <ReactTooltip place="top" id={'email_send'}  type="info" effect="float">
                                        <span>Your customer must have a valid email otherwise the email will be not send !</span>
                                    </ReactTooltip>
                                 </label>
                              </td>
                          </tr>
                          :null
                          }

                          { this.state.invoice_type=='auto' && this.state.send_by_email ?
                              <tr><td colSpan="2" width={'50%'}>
                              <span className="text-primary" >Invoices will be send by mail 5 days before the due date of each invoice.</span>
                                  <br/>
                              </td></tr>
                           :null
                          }

                          { this.state.invoice_type=='auto' && this.state.send_by_email ?
                                <tr>
                                    <td>
                                        <label className="control-label">Create & Use Template :</label>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <div className="dropdown autocomplete">
                                                <input type="text"
                                                       autocomplete="off"
                                                       value={this.state.template_name}
                                                       onChange={this.handle_change_template_name.bind(this)}
                                                       className="form-control"
                                                       data-toggle="dropdown"
                                                       style={cursor_pointer}
                                                       onClick={this.handle_click_div.bind(this)}
                                                />
                                                <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                    <i id="main_form_tags_down_icon" className="fa fa-angle-down black"></i>
                                                </span>
                                                <div className="dd-options">
                                                    <ul className="options-list">
                                                    {   this.state.templates ?
                                                            this.state.templates.map((item, t) =>{
                                                             if(t <= 10)
                                                                return <li key={'_template_'+t}  onClick={this.select_template.bind(this,t)} >{item.name}</li>
                                                            })
                                                        : null
                                                    }
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                           :null
                          }
                          { this.state.invoice_type=='manual'?
                              <tr><td colSpan="2" width={'50%'}>
                              <span className="text-primary" style={{'marginTop':'10px'}}>Invoices will be created in draft so that you can review them before validation.</span>
                              </td></tr>
                           :null
                          }
                          { this.state.invoice_type=='manual'?
                          <tr className="invoicemanual" >
                             <td width={'50%'}>
                                   <b>{translate('what_do_you_want_to_invoice')}</b>
                             </td>
                             <td>
                                  <input
                                       name="radioinvoice"
                                       value="delivered"
                                       type="radio"
                                       style={cursor_pointer}
                                       checked={this.state.radio_invoice == 'delivered'? true : false}
                                       onClick={this.handle_radio_invoice.bind(this,'delivered')}
                                  />
                                  <label
                                      style={cursor_pointer}
                                      className="push-left-5"
                                      onClick={this.handle_radio_invoice.bind(this,'delivered')}>{translate('invoiceable_lines')}{' ( Full amount )'}</label>
                                  <br/>
                                  <input
                                       name="radioinvoice"
                                       value="percentage"
                                       type="radio"
                                       style={cursor_pointer}
                                       checked={this.state.radio_invoice == 'percentage'? true : false}
                                       onClick={this.handle_radio_invoice.bind(this,'percentage')}
                                  />
                                  <label style={cursor_pointer}
                                         className="push-left-5"
                                         onClick={this.handle_radio_invoice.bind(this,'percentage')}>{translate('down_payment_percentage')}</label>
                                  <br/>
                                  <input
                                       name="radioinvoice"
                                       value="manual_fixed"
                                       type="radio"
                                       style={cursor_pointer}
                                       checked={this.state.radio_invoice == 'fixed'? true : false}
                                       onClick={this.handle_radio_invoice.bind(this,'fixed')}
                                  />
                                  <label style={cursor_pointer}
                                         className="push-left-5"
                                         onClick={this.handle_radio_invoice.bind(this,'fixed')}>{translate('down_payment_fixed_amount')}</label>
                                  <br/>
                                  <input
                                       name="radioinvoice"
                                       value="balance"
                                       type="radio"
                                       style={cursor_pointer}
                                       checked={this.state.radio_invoice == 'balance'? true : false}
                                       onClick={this.handle_radio_invoice.bind(this,'balance')}
                                  />
                                  <label style={cursor_pointer}
                                         className="push-left-5"
                                         onClick={this.handle_radio_invoice.bind(this,'balance')}>{'Balance'}{' ( Remaining amount )'}</label>
                             </td>
                          </tr>
                          :null
                          }
                          { (this.state.invoice_type=='manual') && (this.state.radio_invoice == 'percentage' || this.state.radio_invoice == 'fixed') ?
                              <tr>
                                <td width={'50%'}>
                                    <b>Down Payment Amount</b>
                                </td>
                                <td className="edit-form">
                                { this.state.radio_invoice == 'percentage'?
                                      <input
                                          type="text"
                                          value={this.state.percentage}
                                          name="email"
                                          className="form-group extratd edit-name"
                                          placeholder="0.00"
                                          onChange={this.handle_change_percentage.bind(this)}
                                      />
                                  :null
                                  }
                                  {this.state.radio_invoice == 'fixed'?
                                      <input
                                          type="text"
                                          value={this.state.fixed_amount}
                                          name="email"
                                          className="form-group extratd edit-name"
                                          placeholder="0.00"
                                          onChange={this.handle_change_fixed_amt.bind(this)}
                                      />
                                  :null
                                  }
                                  {this.state.radio_invoice == 'percentage' ? <span className="">%</span> :null }
                                </td>
                              </tr>
                          :null
                          }
                      </tbody>
                    </table>
                </div>
            </div>
        );
    }

    render() {
        const {field, onRequestClose, title, modal_id, form_id} = this.props;
        return (
            <Modal
                style={modal_style}
                onRequestClose={onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close" type="button" onClick={this.handle_close.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body" style={ModalbodyStyle}>
                        { this.render_body() }
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default pull-left" type="button"
                                    onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                            <button className="btn btn-primary pull-left" type="button" onClick={this.handle_save.bind(this)}>{translate('button_save')}</button>
                        </div>
                    </div>
                </div>
                <LoadingOverlay processing={this.state.processing}/>
            </Modal>
        );
    }
}
module.exports = CreateInvoice;
