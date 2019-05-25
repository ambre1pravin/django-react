import React from 'react';
import {Link} from 'react-router'
import state, {ROLES, ID} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {getCookie} from 'crm_react/common/helper';
import SendByEmail from 'crm_react/page/email_template/send-by-email';
import RegisterPaymentModal from 'crm_react/page/customer_invoice/register-payment-modal';
import CreateInvoice  from 'crm_react/page/quotation/create-invoice-modal';


class RibbonRowSalesQuotationInvoice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    update_status(qout_status) {
        var qout_id = this.props.q_id;
        var action_url = null
        if(this.props.module == 'quotation' || this.props.module == 'sales-order'){
            action_url = '/sales-order/updateQuotStatus/'
        }else if(this.props.module == 'CustomerInvoice'){
            action_url = '/customer/invoice/UpdateInvoiceStatus/'
        }
        if (qout_id && action_url!=null) {
            $.ajax({
                type: "POST",
                cache: false,
                url: action_url,
                data: {
                    q_id: qout_id,
                    status: qout_status,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.set_quotation_status_fn(qout_status);
                    }
                }.bind(this)
            });
        }
    }

    open_create_invoice_modal() {
        ModalManager.open(
            <CreateInvoice
                module={this.props.module}
                q_id={this.props.q_id}
                modal_id="create-invoice-modal"
                title={'Invoice Order'}
                onRequestClose={() => true}
                get_total_invoice_by_id={this.props.get_total_invoice_by_id.bind(this)}
            >
            </CreateInvoice>
        );
    }



    open_email_modal() {
        ModalManager.open(
            <SendByEmail
                q_id={this.props.q_id}
                preview_url={'/htm/' + this.state.url + '/sales_order/'}
                print_url={'/generate_pdf/' + this.state.url + '/sales_order/'}
                module={this.props.module}
                title={'Send Email'}
                modal_id="send-email"
                onRequestClose={() => true}
            >
            </SendByEmail>
        );
    }

    getQuotationById(){

    }

    update_register_payment(){
          ModalManager.open(
              <RegisterPaymentModal
                title     = "Register Payment"
                invoice_id ={this.props.q_id}
                onRequestClose = {() => true}
                modal_id= "register_payment_modal"
                set_quotation_status_fn={this.props.set_quotation_status_fn.bind(this)}
              />
          );
    }

    render() {
        console.log("this.props.quotation_status", this.props.quotation_status);
        return (
            <div className="row ribbon">
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    {ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION") || ROLES.includes("ROLE_MANAGE_ALL_QUOTATION") || userId == ID ?
                        <ul className="pull-left">

                            {this.props.module == 'CustomerInvoice' && this.props.quotation_status == 'draft' ?
                                <li>
                                    <a
                                        onClick={this.update_status.bind(this, 'open')}
                                        href="javascript:void(0)"
                                        title={'Validate'}>{'Validate'}
                                    </a>
                                </li>
                                : null
                            }
                            {this.props.module == 'CustomerInvoice' && this.props.quotation_status != 'draft' && this.props.quotation_status != 'paid' ?
                                <li>
                                    <a
                                        onClick={this.update_register_payment.bind(this)}
                                        href="javascript:void(0)"
                                        title={translate('register_payment')}>{translate('register_payment')}
                                    </a>
                                </li>
                                : null
                            }

                            { this.props.module == 'CustomerInvoice' && this.props.quotation_status != 'draft' ?
                                <li>
                                    <Link to="javascript:void(0)"
                                          onClick={this.open_email_modal.bind(this)}
                                          title={translate('send_by_email')}>{translate('send_by_email')}</Link>
                                </li>
                                : null
                            }
                            { this.props.module == 'CustomerInvoice' ?
                                <li>
                                    <Link to={this.props.preview_url} target="_blank"
                                          title={translate('print')}>{'Preview'}</Link>
                                </li>
                                : null
                            }
                            { this.props.module == 'CustomerInvoice'  && this.props.quotation_status != 'draft' ?
                                <li>
                                    <Link to={this.props.print_url} target="_blank"
                                          title={translate('print')}>{translate('print')}</Link>
                                </li>
                                : null
                            }
                            { this.props.module == 'CustomerInvoice' && this.props.quotation_status != 'draft' ?
                                <li>
                                    <a href="javascript:void(0)"
                                       onClick={this.update_status.bind(this, 'draft')}
                                       title={translate('cancel')}>{translate('cancel')}</a>
                                </li>
                                : null
                            }

                            { (this.props.module == 'quotation' || this.props.module == 'sales-order') && this.props.quotation_status != 'cancel' ?
                                <li>
                                    <Link to="javascript:void(0)"
                                          onClick={this.open_email_modal.bind(this)}
                                          title={translate('send_by_email')}>{translate('send_by_email')}</Link>
                                </li>
                                : null
                            }

                            { this.props.module == 'quotation' || this.props.module == 'sales-order' ?
                                <li>
                                    <Link to={this.props.preview_url} target="_blank"
                                          title={translate('print')}>{'Preview'}</Link>
                                </li>
                                : null
                            }
                            { this.props.module == 'quotation' || this.props.module == 'sales-order' ?
                                <li>
                                    <Link to={this.props.print_url} target="_blank"
                                          title={translate('print')}>{translate('print')}</Link>
                                </li>
                                : null
                            }

                            {(this.props.module == 'quotation' || this.props.module == 'sales-order') && this.props.quotation_status != 'cancel' && this.props.quotation_status == 'draft' ?
                                <li>
                                    <a className={this.props.quotation_status == 'sent' ? 'active' : '' }
                                       href="javascript:void(0)"
                                       id={this.state.qout_status == 'sale' ? 'saleshide' : '' }
                                       onClick={this.update_status.bind(this, 'sale')}
                                       title={translate('confirm_sale')}>{translate('confirm_sale')}
                                    </a>
                                </li>
                                : null
                            }

                            {(this.props.module == 'quotation' || this.props.module == 'sales-order') && this.props.quotation_status == 'sale' ?
                                <li>
                                    <a href="javascript:void(0)"
                                       onClick={this.open_create_invoice_modal.bind(this)}
                                       title={translate('create_invoice')}>{translate('create_invoice')}</a>
                                </li> : null
                            }

                            {(this.props.module == 'quotation' || this.props.module == 'sales-order') && this.props.quotation_status != 'cancel' ?
                                <li>
                                    <a href="javascript:void(0)"
                                       onClick={this.update_status.bind(this, 'cancel')}
                                       title={translate('cancel')}>{translate('cancel')}</a>
                                </li>
                                : null
                            }


                            {(this.props.module == 'quotation' || this.props.module == 'sales-order') && this.props.quotation_status == 'cancel' ?
                                <li>
                                    <a title={translate('set_to_quotation')}
                                       onClick={this.update_status.bind(this, 'draft')}>{translate('set_to_quotation')}</a>
                                </li>
                                : null
                            }
                        </ul>
                        : null
                    }
                    <ul className="pull-right">
                        { this.props.module == 'CustomerInvoice' ?
                            <li><a className={this.props.quotation_status == 'draft' ? 'active' : null }
                                   href="javascript:void(0)" title="DRAFT">DRAFT</a></li>
                            : null
                        }
                        { this.props.module == 'CustomerInvoice' ?
                            <li><a className={this.props.quotation_status == 'open' ? 'active' : null }
                                   href="javascript:void(0)" title="OPEN">OPEN</a></li>
                            : null
                        }
                        { this.props.module == 'CustomerInvoice' ?
                            <li><a className={this.props.quotation_status == 'paid' ? 'active' : null }
                                   href="javascript:void(0)" title="PAID">PAID</a></li>
                            : null
                        }
                        { this.props.module == 'quotation' || this.props.module == 'sales-order' ?
                            <li>
                                <a href="javascript:void(0)"
                                   className={this.props.quotation_status == 'draft' ? 'active' : null}
                                   title={translate('label_quotation')}>{translate('label_quotation')}</a>
                            </li>
                            : null
                        }
                        { this.props.module == 'quotation' || this.props.module == 'sales-order' ?
                            <li>
                                <a href="javascript:void(0)"
                                   className={this.props.quotation_status == 'sent' ? 'active' : null}
                                   title={translate('quotation_sent')}>{translate('quotation_sent')}</a>
                            </li>
                            : null
                        }
                        { this.props.module == 'quotation' || this.props.module == 'sales-order' ?
                            <li>
                                <a href="javascript:void(0)"
                                   className={this.props.quotation_status == 'sale' ? 'active' : null}
                                   title={translate('sales_order')}>{translate('sales_order')}</a>
                            </li>
                            : null
                        }
                        { this.props.module == 'quotation' || this.props.module == 'sales-order' ?
                            <li className="active">
                                <a href="javascript:void(0)"
                                   className={this.props.quotation_status == 'cancel' ? 'active' : null}
                                   title={translate('cancelled')}>{translate('cancelled')}</a>
                            </li>
                            : null
                        }
                    </ul>
                </div>
            </div>
        )
    }
}

module.exports = RibbonRowSalesQuotationInvoice;
