import React from 'react';
import { Link, browserHistory } from 'react-router'
import state, { ROLES,ID,} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import ProductHeader from 'crm_react/component/product-header';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {getCookie } from 'crm_react/common/helper';
const form_group = {borderStyle:'none'};
import RibbonRowSalesQuotationInvoice from 'crm_react/page/sales_order/ribbon-row-sales-quotation-invoice';
class  CustomerInvoiceView extends React.Component {

  constructor(props){
    super(props);
    this.state = {
                result                 : null ,
                items                  : [],
                Invoicing              : '',
                total_Invoicing_data   : '',
                optional_items         : [],
                op_id_list : [],
                main_contact_id:'',
                main_contact_email:'',
                parameter       : [],
                untaxed_amt            : 0 ,
                tax_amt                : 0 ,
                selected_customer_id   : '',
                selected_customer_name : '',
                email:'',
                master_id:this.props.params.Id,
                message_modal_is_open :false,
                invoice_email_modal : false,
                view_pagging    : false,
                action_checkbox : false,
                invoice_modal:false,
                register_payment_modal:false,
                credit_note_modal     :false,
                shown: false,
                processing             :false,
                status_invoice : '',
                edit_link : true,
                notes:'',
                uuid  : null,
    };

    this.storData = this.storData.bind(this);
    this.getQuotationById = this.getQuotationById.bind(this)
  }

    componentDidMount() {
        var quot_id = this.props.params.Id;
        this.getQuotationById(quot_id);
        this.storData()
    }

    storData() {
        var store1 = localStorage.getItem('search');
        var storetotal1 = localStorage.getItem('searchtotal');
        var storecustomer1 = localStorage.getItem('searchcustomer');
        var parameter1 = localStorage.getItem('parameter');
        var parameter = parameter1 ? JSON.parse(parameter1) : [];
        var store = store1 ? JSON.parse(store1) : [];
        var storetotal = storetotal1 ? JSON.parse(storetotal1) : [];
        var storecustomer = storecustomer1 ? JSON.parse(storecustomer1) : [];
        var keydata = localStorage.getItem('keydata');
        var keydata1 = keydata ? JSON.parse(keydata) : [];

        if (keydata1 !== null && keydata1 != '' && keydata1 !== undefined) {
            localStorage.setItem('keydata1', JSON.stringify(keydata1));
        }else {
            localStorage.setItem('keydata1', []);
        }

        if (parameter !== null && parameter != '' && parameter !== undefined) {
            localStorage.setItem('parameter1', JSON.stringify(parameter));
        }else {
            localStorage.setItem('parameter1', []);
        }

        if (store !== null && store != '' && store !== undefined) {
            localStorage.setItem('search1', JSON.stringify(store));
        }else {
            localStorage.setItem('search1', []);
        }

        if (storetotal !== null && storetotal != '' && storetotal !== undefined) {
            localStorage.setItem('searchtotal1', JSON.stringify(storetotal));
        }else {
            localStorage.setItem('searchtotal1', []);
        }

        if (storecustomer !== null && storecustomer != '' && storecustomer !== undefined) {
            localStorage.setItem('searchcustomer1', JSON.stringify(storecustomer));
        }else {
            localStorage.setItem('searchcustomer1', []);
        }
    }


    getQuotationById(id) {
        this.setState({processing: true});

        this.serverRequest = $.get('/quotation/adddata/', function (data) {

            this.setState({
                taxes_list: data.json_taxes !== undefined ? data.json_taxes : [],
                select_ls_value: data.json_taxes !== undefined && data.json_taxes != '' ? data.json_taxes : '',
            });

        }.bind(this));

        this.serverRequest = $.get('/customer/invoice/customerinvoicetotal/' + this.props.params.Id + '/', function (data) {
            this.setState({
                customer_invoice_total_amount: data.total_amount !== undefined ? data.total_amount : [],
                customer_invoice_tax_amount: data.tax_amount !== undefined ? data.tax_amount : [],
            });
        }.bind(this));

        this.serverRequest = $.get('/customer/invoice/viewdata/' + this.props.params.Id + '/', function (data) {
            if (data.success == true) {
                this.setState({
                    processing: false,
                    result: data,
                    Uncounil_Payment_data: data.Uncounil_Payment_data !== undefined ? data.Uncounil_Payment_data : null,
                    Invoicing: data.Invoicing !== undefined ? data.Invoicing : null,
                    selected_customer_id: data.Invoicing !== undefined && data.Invoicing.customer_id != null ? data.Invoicing.customer_id : '',
                    selected_customer_name: data.Invoicing !== undefined && data.Invoicing.customer_name != null ? data.Invoicing.customer_name : '',
                    items: data.Invoicing.products !== undefined && data.Invoicing.products.length > 0 ? data.Invoicing.products : [],
                    invoice_status: data.Invoicing.invoice_status,
                    status_invoice: data.Invoicing.status,
                    customer_id: data.Invoicing.customer_id,
                    name: data.Invoicing.name,
                    currency: data.Invoicing.currency,
                    invoice_date: data.Invoicing.invoice_date,
                    due_date: data.Invoicing.due_date,
                    sales_person: data.Invoicing.sales_person,
                    quotation_id: data.Invoicing.quotation_id,
                    quotation_name: data.Invoicing.quotation_name,
                    unreconcile: data.Invoicing.unreconcile,
                    total_amount: data.Invoicing.total_amount,
                    subtotal_amount: data.Invoicing.subtotal_amount,
                    amount_due: data.Invoicing.amount_due,
                    paid_amount: data.Invoicing.paid_amount,
                    tax_amount: data.Invoicing.tax_amount,
                    invoice_id: data.Invoicing.id,
                    payment_term_days: data.Invoicing.payment_term_days,
                    Taxes: data.Invoicing.Taxes,
                    payment: data.Invoicing.payment !== undefined && data.Invoicing.payment.length > 0 ? data.Invoicing.payment : [],
                    edit_link: data.Invoicing.edit_link,
                    notes: data.Invoicing.notes,
                    uuid: data.Invoicing.uuid,
                });

                if (data.op_id_list !== undefined && data.op_id_list.length > 0) {
                    var id_list = data.op_id_list;
                    var id_array = [];
                    for (var i in id_list) {
                        if (id_list.hasOwnProperty(i) && !isNaN(+i)) {
                            id_array[+i] = id_list[i].id;
                        }
                    }
                    this.setState({op_id_list: id_array});
                }
            }

        }.bind(this)).then(function (result) {
            var customer_id = this.state.customer_id;
        }.bind(this));

    }


    handleNextPrev(Action, current_id) {
        var id_array = this.state.op_id_list;
        if (id_array.length == 0)
            return false
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
            browserHistory.push("/customer/invoice/view/" + next_op_id);
            this.getQuotationById(next_op_id);
        }
    }

    handlepro_tax(pro_tax) {
        $.ajax({
            type: "POST",
            cache: false,
            url: '/product/getTaxesById/' + pro_tax,
            data: {
                ajax: true,
                csrfmiddlewaretoken: getCookie('csrftoken'),
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success === true) {
                    this.setState({
                        tax_name: data.name,
                        tax_value: data.value,
                        computation: data.computation,
                        tax_scope: data.scope,
                    })
                }
            }.bind(this)
        });
    }


    handleInvoicesubmit() {
        var total_amount = this.state.total_amount;
        var total_amount_untaxed = this.state.total_amount_untaxed;
        var tax_amount = this.state.tax_amount;
        var customer_invoice_total_amount = this.state.customer_invoice_total_amount;
        var customer_invoice_tax_amount = this.state.customer_invoice_tax_amount;
        var invoicedownpayment = $('#invoicedownpayment').val();
        var radioinvoice = $('#radioinvoice:checked').val();
        var pro_tax = $('#pro_tax').val();

        if (radioinvoice == 'all') {
            var total_amount12 = (parseFloat(total_amount_untaxed) - (parseFloat(customer_invoice_total_amount)));
            var tax_amount_main = (parseFloat(tax_amount)) - (parseFloat(customer_invoice_tax_amount))
            var subtotal_amount = (parseFloat(total_amount12) + parseFloat(tax_amount_main));
        } else if (radioinvoice == 'delivered') {
            var subtotal_amount = parseFloat(total_amount);
        } else if (radioinvoice == 'percentage') {
            var subtotal_amount = (total_amount_untaxed * invoicedownpayment) / 100;
        } else if (radioinvoice == 'fixed') {
            var subtotal_amount = invoicedownpayment;
        }
        var customer_id_value = this.state.selected_customer_id;
        var customer_name_value = this.state.selected_customer_name;
        var quotation_name = this.state.name;
        var quotation_id = this.state.quot_id;
        var Data = $('#CreateInvoiceModal1').serializeArray();
        Data.push({'name': 'customer_id', 'value': customer_id_value});
        Data.push({'name': 'customer_name', 'value': customer_name_value});
        Data.push({'name': 'quotation_id', 'value': quotation_id});
        Data.push({'name': 'quotation_name', 'value': quotation_name});
        Data.push({'name': 'subtotal_amount', 'value': subtotal_amount});
        Data.push({'name': 'pro_tax', 'value': pro_tax});
        $.ajax({
            type: "POST",
            cache: false,
            url: '/customer/invoice/CreateInvoice/',
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
                csrfmiddlewaretoken: getCookie('csrftoken'),
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success == true) {

                    this.getQuotationById(this.props.params.Id);

                }
            }.bind(this)
        });
    }

    handleCloseMeassageModal() {
        this.setState({message_modal_is_open: false});
    }

    /*End : Email handlign*/
    handleUnreconcile(unreconcile, id, Amount) {
        var status_invoice = 'open';
        var invoice_id = this.state.invoice_id;
        var total_amount = this.state.total_amount;
        if (unreconcile == 0) {
            var idpayment_amount = Amount;
        }else {
            var idpayment_amount = this.state.idpayment_amount;
        }
        var Data = {
            'unreconcile': unreconcile,
            'id': id,
            'invoice_id': invoice_id,
            'idpayment_amount': idpayment_amount,
            'total_amount': total_amount
        };
        $.ajax({
            type: "POST",
            cache: false,
            url: '/customer/invoice/Unreconcile/' + invoice_id,
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
                csrfmiddlewaretoken: getCookie('csrftoken'),
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success === true) {
                    this.setState({status_invoice: status_invoice});
                    this.getQuotationById(this.props.params.Id);
                }
            }.bind(this)
        });

    }


    OpenPopup(id) {
        $.ajax({
            type: "POST",
            cache: false,
            url: '/customer/invoice/getPaymentRegisterData/',
            data: {
                ajax: true,
                fields: id,
                csrfmiddlewaretoken: getCookie('csrftoken'),
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success === true) {
                    this.setState({
                        id_id: data.id,
                        idpayment_amount: data.payment_amount,
                        idpayment_date: data.payment_date,
                        idpayment_journal: data.payment_journal,
                        idpayment_memo: data.payment_memo,
                        idpayment_difference: data.payment_difference,
                        idcustomer_invoice_id: data.customer_invoice_id,
                        idreason: data.reason,
                        idunreconcile: data.unreconcile,
                    });

                }
            }.bind(this)
        });

    }


    handleView(preview_id) {
        browserHistory.push("/quotation/preview/" + preview_id);
    }


    handleViewPrint(preview_id) {
        browserHistory.push("/quotation/pdf_download/" + preview_id);
    }


    set_quotation_status(status) {
        this.getQuotationById(this.props.params.Id)
        //this.setState({status_invoice: status});
    }

    render() {

    let result         = this.state.result;
    let items          = this.state.items;
    let payment        = this.state.payment;
    let Invoicing      = this.state.Invoicing;
    let Uncounil_Payment_data    = this.state.Uncounil_Payment_data
    var setpage = localStorage.getItem('setpage');
    var setpage_q_s = localStorage.getItem('setpage_q_s');
    var quotation_name = localStorage.getItem('quotation_name');
    var quotation_id = localStorage.getItem('quotation_id');
    return (
    <div>
        <Header />
        <div id="crm-app" className="clearfix module__quotation module__quotation-view">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                        <AddPageTopAction
                            list_page_link ="/customer/invoice/list/"
                            list_page_label ="Invoice"
                            add_page_link="/customer/invoice/add/"
                            add_page_label ="Add Invoice"
                            edit_page_link={'/customer/invoice/edit/'+this.props.params.Id + '/'}
                            edit_page_label ={ 'Edit Invoice'}
                            item_name = {this.state.name != null && this.state.name != '' ? this.state.name : 'Invoice' }
                            page="view"
                            module="sales-order"
                            save_action ={false}
                        />
                        <RibbonRowSalesQuotationInvoice
                            module="CustomerInvoice"
                            q_id={this.props.params.Id}
                            quotation_status={this.state.status_invoice}
                            preview_url={'/htmin/' + this.state.uuid + '/'}
                            print_url={'/generate_pdf/' + this.state.uuid + '/invoice/'}
                            set_quotation_status_fn={this.set_quotation_status.bind(this)}
                        />
                        <div className="row crm-stuff">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div className="panel panel-default panel-tabular">
                                    <div className="panel-heading no-padding panel-heading-blank">
                                        <br/>
                                        {this.state.Invoicing.length > 0 ?
                                            <button type="button" name="save_as_invoice"
                                                    className="btn btn-sm pull-right btn-default save_as_invoice">
                                                <i className="fa fa-fw o_button_icon fa-pencil-square-o"></i>
                                                <Link to={'/customer/invoice/customerlist/' + this.props.params.Id}
                                                      title={translate('create_invoice')}><b> {this.state.total_Invoicing_data}
                                                    Invoices</b></Link>
                                                <span></span>
                                            </button>
                                            : null
                                        }
                                    </div>
                            <div className="panel-body edit-form">
                                <form>
                                    <div className="row">
                                        <h2 className="col-sm-12 quotation-number">
                                            {this.state.name != null && this.state.name != '' ? this.state.name : 'Invoice' }</h2>
                                    </div>
                                    <div className="row row__flex">
                                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                            <table className="detail_table">
                                                <tbody>
                                                <tr>
                                                    <td>
                                                        <label
                                                            className={Invoicing.customer_name ? "control-label" : "text-muted control-label"}>{'Customer'}</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group"
                                                             style={form_group}>{Invoicing ? Invoicing.customer_name : ''}</div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <label
                                                            className={Invoicing.pay_tm_name ? "control-label" : "text-muted control-label"}>{translate('payment_term')}</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group" style={form_group}>
                                                            {Invoicing ? Invoicing.pay_tm_name : '' }
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
                                                    <td>
                                                        <label
                                                            className={Invoicing.invoice_date ? "control-label" : "text-muted control-label"}>Invoice Date</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group" style={form_group}>
                                                            {Invoicing ? Invoicing.invoice_date : ''}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <label
                                                            className={Invoicing.due_date ? "control-label" : "text-muted control-label"}>Due Date</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group" style={form_group}>
                                                            {Invoicing ? Invoicing.due_date : ''}
                                                        </div>
                                                    </td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </form>
                            </div>
                          <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                              <li role="presentation" data-id="999" className = "active" ><a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="false">{translate('invoice_lines')}</a></li>
                          </ul>
                          <div className="tab-content">
                              <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                  <table className="quotation-product-detail table list-table">
                                      <ProductHeader module={'invoice'} item_type={'order'}/>
                                      <tbody>
                                      {result && items.length > 0 ?
                                            items.map((pro, i)=>{
                                                return(
                                                      <tr key = {i} >
                                                          <td>&nbsp;</td>
                                                          <td className="invoicecustomerwidth">{pro.product_name}</td>
                                                          <td className="invoicecustomerwidth desc_width">{pro.product_description}</td>
                                                          <td className="fieldwith">{pro.product_qty!=''?pro.product_qty:'1'}</td>
                                                          <td className="fieldwith">{pro.product_uom_name}</td>
                                                          <td className="fieldwith">{pro.unit_price!=''?pro.unit_price.toFixed(2) : '0.00'}</td>
                                                          <td className="fieldwith">{pro.product_tax_name!=''?pro.product_tax_name: ''}</td>
                                                          <td className="subtotalright fieldwith">{pro.price_subtotal!='' ?pro.price_subtotal.toFixed(2):''}</td>
                                                      </tr>
                                                  )
                                            })
                                          :null
                                        }
                                      </tbody>
                                  </table>
                                  <div className="row">
                                  <div className="col-xs-12 col-sm-6 col-md-5 col-lg-6 note">
                                      <p className="terms-cond push-left-20">{this.state.notes}</p>
                                  </div>
                                  <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3 pull-right quotation-total">
                                  <table>
                                      <tr>
                                          <td>{translate('untaxed_total_amount')} :</td>
                                          <td>{this.state.subtotal_amount!=null && this.state.subtotal_amount != 0 ?this.state.subtotal_amount.toFixed(2):'0.00'} {this.state.currency}</td>
                                      </tr>
                                      { result && result.Invoicing.multiple_tax.length > 1  ?
                                          result.Invoicing.multiple_tax.map((product, i)=>{
                                              return (<tr key={'tax_' + i}>
                                                  <td>{'Tax (' + product.tax_name + ') :'}</td>
                                                  <td>{product.tax_amount != null && product.tax_amount != 0 ? product.tax_amount.toFixed(2) : '0.00'} {this.state.currency} </td>
                                              </tr>)
                                        })
                                      :null
                                      }
                                      <tr>
                                          <td>{'Total Tax'} :</td>
                                          <td>{this.state.tax_amount!=null && this.state.tax_amount != 0 ?this.state.tax_amount.toFixed(2):'0.00'} {this.state.currency}</td>
                                      </tr>

                                      <tr>
                                          <td>{'Total'} :</td>
                                          <td><span className="lead">
                                          {this.state.total_amount!=null && this.state.total_amount != 0 ?this.state.total_amount.toFixed(2):'0.00'} {this.state.currency} </span></td>
                                      </tr>
                                      {result && payment.length >0 ?
                                            payment.map((pay, i)=>{
                                                return (
                                                    <tr className={pay.unreconcile == 0 || pay.unreconcile == 2 ? '' : 'hide'}>
                                                        <td data-th="Product">
                                                            <a className="js_payment_info fa fa-info-circle popup"
                                                               data-toggle="collapse" data-target="myPopup"
                                                               onClick={this.OpenPopup.bind(this, pay.id)}
                                                               data-placement="right"
                                                               title={pay.reason}></a>&nbsp;&nbsp; Paid
                                                            on {pay.payment_date}
                                                            <p>
                                                                <div tabIndex="-1" role="dialog"
                                                                     aria-labelledby="basicModal" aria-hidden="true"
                                                                     className="popuptext fade" id="myPopup">
                                                                    <div className="modal-content1">
                                                                        <div className="modal-header1">
                                                                            <h8>Payment Information</h8>
                                                                        </div>
                                                                        <div className="modal-body1">
                                                                            <tr className="bordernone">
                                                                                <td className="bordernone"></td>
                                                                                <td className="bordernone">Customer
                                                                                    Payment
                                                                                </td>
                                                                            </tr>
                                                                            <tr className="bordernone">
                                                                                <td className="bordernone">Name :</td>
                                                                                <td className="bordernone">{this.state.idpayment_memo}</td>
                                                                            </tr>
                                                                            <tr className="bordernone">
                                                                                <td className="bordernone">Date :</td>
                                                                                <td className="bordernone">{this.state.idpayment_date}</td>
                                                                            </tr>
                                                                            <tr className="bordernone">
                                                                                <td className="bordernone">Payment
                                                                                    Method :
                                                                                </td>
                                                                                <td className="bordernone">{this.state.idpayment_journal}</td>
                                                                            </tr>
                                                                            <tr className="bordernone">
                                                                                <td className="bordernone">Memo :</td>
                                                                                <td className="bordernone">{this.state.idpayment_memo}</td>
                                                                            </tr>
                                                                            <tr className="bordernone">
                                                                                <td className="bordernone">Amount :</td>
                                                                                <td className="bordernone">{this.state.idpayment_amount}</td>
                                                                            </tr>
                                                                            {this.state.idreason != '' && this.state.idreason !== null ?
                                                                                <tr className="bordernone">
                                                                                    <td className="bordernone">Reason
                                                                                        :
                                                                                    </td>
                                                                                    <td className="bordernone">{this.state.idreason}</td>
                                                                                </tr>
                                                                                : null
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </p>
                                                        </td>
                                                        <td data-th="Product ">{pay.payment_amount.toFixed(2)}</td>
                                                    </tr>
                                                )
                                            })
                                          :null
                                        }
                                      {this.state.status_invoice != 'draft' ?
                                          <tr>
                                              <td>{translate('amount_due')} :</td>
                                              <td>{this.state.amount_due != null && this.state.amount_due != 0 ? this.state.amount_due.toFixed(2) : '0.00'} {this.state.currency}</td>
                                          </tr>
                                          : null
                                      }
                                     {result && Uncounil_Payment_data.length>0 && this.state.status_invoice != 'paid' && this.state.status_invoice != 'draft' ?
                                         <tr className="bordernone">
                                             <td colSpan="2">
                                                 <div name="outstanding_credits_debits_widget"
                                                      className="o_field_widget o_readonly_modifier">
                                                     <div>
                                                         <div>
                                                             <strong className="pull-left" id="outstanding">Outstanding
                                                                 credits</strong>
                                                         </div>
                                                         {result && Uncounil_Payment_data.length > 0 && this.state.status_invoice != 'paid' && this.state.status_invoice != 'draft' ?
                                                             Uncounil_Payment_data.map((pay, i) => {
                                                                 return (
                                                                     <div>
                                                                         <table>
                                                                             <tbody>
                                                                             <tr className="bordernone">
                                                                                 <td><a
                                                                                     className="oe_form_field outstanding_credit_assign"
                                                                                     onClick={this.handleUnreconcile.bind(this, 0, pay.piid, pay.picustomer_invoice_diffrence)}
                                                                                     role="button"
                                                                                     title="assign to invoice">
                                                                                     Add </a></td>
                                                                                 <td><span
                                                                                     className="oe_form_field">{pay.picustomer_invoice_name}</span>
                                                                                 </td>
                                                                                 <td><span
                                                                                     className="oe_form_field oe_form_field_float oe_form_field_monetary">{this.state.currency} {pay.picustomer_invoice_diffrence}</span>
                                                                                 </td>
                                                                             </tr>
                                                                             </tbody>
                                                                         </table>

                                                                     </div>
                                                                 )
                                                             })
                                                             : null
                                                         }
                                                     </div>
                                                 </div>
                                             </td>
                                         </tr>
                                        :null
                                     }
                                  </table>
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
        </div>
        <NotificationContainer/>
        <LoadingOverlay processing={this.state.processing}/>
    </div>
    );
  }
}
module.exports = CustomerInvoiceView;
