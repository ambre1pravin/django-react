import React from 'react';
import {Link, browserHistory } from 'react-router'
import { DateField, DatePicker } from 'react-date-picker'
import 'react-date-picker/index.css'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import Product_tr from 'crm_react/page/quotation/Product_tr';
import Customer from 'crm_react/component/customer';
import PaymentTermDropDown from 'crm_react/page/product/payment-term-drop-down';
import ProductHeader from 'crm_react/component/product-header';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import { getCookie} from 'crm_react/common/helper';
import { ToastContainer, toast } from 'react-toastify';

class  CustomerInvoiceEdit extends React.Component {

  constructor(props){
    super(props);
    this.state = {
                edit_id                : 0 ,
                result                 : null ,
                quotation              : null ,
                items: [],
                optional_items: [],
                untaxed_amt: 0.00,
                tax_amt: 0,
                total_tax_amt: 0.00,
                opuntaxed_amt: 0.00,
                optotal_tax_amt: 0.00,
                selected_customer_name: '',
                selected_customer_id: '',
                selected_tmpl_name: '',
                selected_tmpl_id  : '',
                selected_payment_id:0,
                selected_payment_name:'',
                main_contact_id: '',
                main_contact_email: '',
                input_value: '',
                master_id: this.props.params.Id,
                notes                  :'',
                is_editable            : true,
                processing             :false,

    }
      this.getQuotationById();
  }

  set_customer_id_name(data){
      this.setState({selected_customer_id:data.id, selected_customer_name:data.id});
  }

  set_payment_term_data(data){
        this.setState({selected_payment_id:data.id, selected_payment_name:data.name})
  }



  getQuotationById(){
        this.setState({processing : true});
        var id = this.props.params.Id;
        this.serverRequest = $.get('/customer/invoice/editdata/'+ this.props.params.Id +'/', function (data) {
          if(data.success==true){
             this.setState({
                processing             : false,
                is_editable            :data.Invoicing.is_editable,
                result                 : data,
                qout_status            : data.Invoicing!==undefined && data.Invoicing.status!=null ? data.Invoicing.status : '' ,
                Invoicing              : data.Invoicing!==undefined ? data.Invoicing : null ,
                products_list          : data.json_products!==undefined ? data.json_products : [],
                untaxed_amt            : data.Invoicing!==undefined ? data.Invoicing.subtotal_amount : 0.00,
                total_tax_amt          : data.Invoicing!==undefined ? data.Invoicing.tax_amount :0.00,
                total_amt              : data.Invoicing!==undefined ? data.Invoicing.total_amount : 0.00,
                due_date               : data.Invoicing!==undefined ? data.Invoicing.due_date :'',
                invoice_date           : data.Invoicing!==undefined ? data.Invoicing.invoice_date :'',
                name                   : data.Invoicing.name,
                status_invoice         : data.Invoicing.status,
                currency               : data.Invoicing.currency,
                total_amount           : data.Invoicing!==undefined ? data.Invoicing.total_amount : 0.00,
                selected_customer_id   : data.Invoicing!==undefined && data.Invoicing.customer_id!=null ? data.Invoicing.customer_id : ''  ,
                selected_customer_name : data.Invoicing!==undefined && data.Invoicing.customer_name!=null ? data.Invoicing.customer_name : '' ,
                selected_tmpl_id       : data.Invoicing!==undefined && data.Invoicing.qout_tmpl_id!=null ? data.Invoicing.qout_tmpl_id : '' ,
                selected_tmpl_name     : data.Invoicing!==undefined && data.Invoicing.qout_tmpl_id!=null ? data.Invoicing.qout_tmpl_name : '' ,
                selected_payment_name : data.Invoicing!==undefined && data.Invoicing.payment_term!=null ? data.Invoicing.pay_tm_name : '' ,
                selected_payment_id   : data.Invoicing!==undefined && data.Invoicing.payment_term!=null ? data.Invoicing.payment_term : '' ,
                payment_term_days      : data.Invoicing!==undefined && data.Invoicing.payment_term_days!=null ? data.Invoicing.payment_term_days : '' ,
                notes                  : data.Invoicing!==undefined ? data.Invoicing.notes : '',
                taxes_list             : data.json_taxes!==undefined ? data.json_taxes : [],
                InvoicingID            : data.Invoicing.id,
                pmt_list               : data.json_paytm!==undefined ? data.json_paytm : [],
                payment                : data.Invoicing.payment!==undefined && data.Invoicing.payment.length>0 ? data.Invoicing.payment : [],
             });

             if(data.Invoicing.products!==undefined && data.Invoicing.products.length>0){
                    var temp_arr = []
                    data.Invoicing.products.forEach(function(element, i) {
                        temp_arr.push({'id':i+1,
                                'id': i + 1,
                                'name': element.product_name,
                                'pro_qty': element.product_qty,
                                'unit_price': element.unit_price,
                                'pro_uom': '',
                                'discount': element.discount,
                                'discription': element.product_description,
                                'selected_product': element.product_name,
                                'selected_product_id': element.uuid,
                                'selected_uom': element.product_uom_name != null ? element.product_uom_name : '',
                                'selected_uom_id': element.product_uom != null ? element.product_uom : '',
                                'selected_tax_id': element.product_tax_id,
                                'selected_tax_name': element.product_tax_name,
                                'selected_tax_value':element.product_tax_value,
                                'selected_tax_computation':element.product_tax_computation,
                                'tax_amt': element.tax_price,
                                'subtotal': element.price_subtotal,
                        });
                    });
                  this.setState({items:temp_arr})
             }
             if(data.op_id_list!==undefined && data.op_id_list.length>0 ){
                  var id_list = data.op_id_list;
                  var id_array      = [];
                  for(var i in id_list) {
                      if(id_list.hasOwnProperty(i) && !isNaN(+i)) {
                          id_array[+i] = id_list[i].id;
                      }
                  }
                  this.setState({op_id_list : id_array});
             }
          }

        }.bind(this)).then(function(result){
            var status = this.props.params.state!==undefined ? this.props.params.state : '';
            if(status!==''){
              if(status=='sent'){
                  browserHistory.push("/quotation/edit/"+this.props.params.Id);
              }else{
                  browserHistory.push("/quotation/edit/"+this.props.params.Id);
                  this.updateQoutationStatus(status);
              }
            }
        }.bind(this)).then(function(result){
        }.bind(this));
  }


  handleView(preview_id){
        browserHistory.push("/quotation/preview/"+preview_id);
  }



   update_row_items(data){
        console.log("rows data", data)
        if(data.items.length > 0){
            this.setState({items:data.items, tax_amt:data.tax_amt, untaxed_amt:data.untaxed_amt,
             optional_items:data.optional_items, optax_amt:data.optax_amt, opuntaxed_amt:data.opuntaxed_amt
            })
        }
   }


  save_action_fn() {
      this.handleSubmit()
  }
/* save data to db*/
  handleSubmit(){
        let items = this.state.items;
        let product_rows = [];
        if(items.length > 0){
            for(var i=0; i < items.length; i++){
                product_rows.push(
                    {'product_id':items[i].selected_product_id,
                    'uom':items[i].selected_uom_id,
                    'tax':items[i].selected_tax_id,
                    'description':items[i].discription,
                    'order_qty':items[i].pro_qty,
                    'unit_price':items[i].unit_price,
                    'tax_amt':items[i].tax_amt,
                    'discount':items[i].discount,
                    'subtotal':items[i].subtotal,
                    }
                );
            }
            let Data = {'customer_id':this.state.selected_customer_id,
                        'customer_name':this.state.selected_customer_name,
                        'invoice_date':this.state.order_date,
                        'due_date':this.state.expiration_date,
                        'payment_term':this.state.selected_payment_id,
                        'products':product_rows,
                        'optional_products':[],
                        'options_numbers':[],
                        'module_name':this.state.module_name,
                        'opportunity_id':this.state.opportunity_id,
                        'untaxed_amt':this.state.untaxed_amt,
                        'tax_amt':this.state.total_tax_amt,
                        'notes':this.state.notes,
                        'id':this.props.params.Id,
                        'status_invoice':this.state.status_invoice
            };
            if(this.state.selected_customer_id > 0 && product_rows.length > 0) {
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/customer/invoice/updateInvoice/',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(Data),
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                        this.setState({processing : true})
                    }.bind(this),
                    success: function (data) {
                        if (data.success === true) {
                            this.setState({processing : false});
                            browserHistory.push("/customer/invoice/view/" + data.encrypt_id +'/');
                        }
                    }.bind(this)
                });
            }else{
                 toast.error("Customer Name", {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
            }
        }
  }


  render() {

    let result         = this.state.result;
    let Invoicing      = this.state.Invoicing;
    let items          = this.state.items;
    let payment        = this.state.payment;
    let optional_items = this.state.optional_items;

    var message_props_data={
        'email':this.state.main_contact_email,
        'master_id':this.state.master_id
       }
    return (
        <div>
          <Header />
          <NotificationContainer/>
          <div id="crm-app" className="clearfix module__quotation module__quotation-edit">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                      <AddPageTopAction
                            list_page_link ="/customer/invoice/list/"
                            list_page_label ="Invoice"
                            add_page_link={false}
                            add_page_label ={false}
                            edit_page_link={false}
                            edit_page_label ={translate('label_salers')}
                            item_name = {this.state.name!= null && this.state.name!='' ?this.state.name  : 'Invoice' }
                            page="edit"
                            module="sales-order"
                            save_action ={this.save_action_fn.bind(this)}
                      />

                    <div className="row crm-stuff">
                      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <form id="invoice_edit_form">
                          <div className="panel panel-default panel-tabular">
                            <div className="panel-heading no-padding panel-heading-blank">
                            </div>
                            {this.state.status_invoice != 'draft' ?
                                   <div className="panel-body edit-form">

                                  <div className="row">
                                      <h2 className="col-sm-12 quotation-number">
                                        {this.state.name!= null && this.state.name!='' ?this.state.name  : 'Invoice' }</h2>
                                  </div>
                                  <div className="row row__flex">
                                      <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                      <table className="detail_table">
                                        <tbody>
                                          {result  && this.state.is_editable ?
                                                <Customer
                                                    field_name="customer"
                                                    field_label="Customer"
                                                    show_lable={true}
                                                    customer_type ='customer'
                                                    set_return_data ={this.set_customer_id_name.bind(this)}
                                                    get_data_url="/contact/company/"
                                                    post_data_url="/contact/company_create/"
                                                    selected_name={this.state.selected_customer_name}
                                                    selected_id={this.state.selected_customer_id}
                                                    item_selected={false}
                                                    create_option={true}
                                                    create_edit_option={false}
                                                />
                                            :<tr>
                                                <td><label className="text-muted control-label">{'Customer'}</label></td>
                                                <td>
                                                    <div className="form-group">{this.state.selected_customer_name}</div>
                                                </td>
                                            </tr>
                                          }
                                          <tr>
                                              <td>
                                                  <label className={this.state.selected_payment_name?"control-label":"text-muted control-label"}>{translate('payment_term')}</label>
                                              </td>
                                              <td>
                                                {result && this.state.is_editable ?
                                                    <PaymentTermDropDown
                                                        field_name="payment-term"
                                                        field_label="Payment Term"
                                                        show_lable={true}
                                                        set_return_data ={this.set_payment_term_data.bind(this)}
                                                        get_data_url="/payment/get-payment-term/"
                                                        selected_name={this.state.selected_payment_name}
                                                        selected_id={this.state.selected_payment_id}
                                                        item_selected={false}
                                                        create_option={false}
                                                        create_edit_option={false}
                                                    />
                                                    :<div className="form-group">{this.state.selected_payment_name}</div>
                                                }
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
                                              <label className="text-muted control-label">Invoice Date</label>
                                            </td>
                                            <td>
                                              <div className="form-group">
                                                 {Invoicing?Invoicing.invoice_date:null}
                                              </div>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td>
                                                <label className="text-muted control-label">Due Date</label>
                                            </td>
                                            <td>
                                              <div className="form-group">
                                               {Invoicing?Invoicing.due_date:null}
                                              </div>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                              </div>
                            :
                            <div className="panel-body edit-form">
                                <div className="row">
                                    <h2 className="col-sm-12 quotation-number">
                                      <input type="text" name="quotation-number" value={Invoicing && Invoicing.name!==undefined ?Invoicing.name  : 'Draft Invoice' } />
                                    </h2>
                                </div>
                                <div className="row row__flex">
                                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                    <table className="detail_table">
                                      <tbody>
                                          {
                                              result?
                                                <Customer
                                                    field_name="customer"
                                                    field_label="Customer"
                                                    show_lable={true}
                                                    customer_type ='customer'
                                                    set_return_data ={this.set_customer_id_name.bind(this)}
                                                    get_data_url="/contact/company/"
                                                    post_data_url="/contact/company_create/"
                                                    selected_name={this.state.selected_customer_name}
                                                    selected_id={this.state.selected_customer_id}
                                                    item_selected={false}
                                                    create_option={true}
                                                    create_edit_option={false}
                                                />
                                              :null
                                          }
                                          <tr>
                                              <td>
                                                  <label className={this.state.selected_payment_id ? "control-label":"text-muted control-label"}>{translate('payment_term')} </label>
                                              </td>
                                              <td>
                                                <PaymentTermDropDown
                                                    field_name="payment-term"
                                                    field_label="Payment Term"
                                                    show_lable={true}
                                                    set_return_data ={this.set_payment_term_data.bind(this)}
                                                    get_data_url="/payment/get-payment-term/"
                                                    selected_name={this.state.selected_payment_name}
                                                    selected_id={this.state.selected_payment_id}
                                                    item_selected={false}
                                                    create_option={false}
                                                    create_edit_option={false}
                                                />
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
                                              <label className={Invoicing && Invoicing.invoice_date? "control-label":"text-muted control-label"}>{translate('order_date')}</label>
                                          </td>
                                          <td>
                                            <div className="form-group qt_order_date">
                                            {Invoicing?
                                                  <DateField
                                                        dateFormat="MM/DD/YYYY"
                                                        updateOnDateClick={true}
                                                        collapseOnDateClick={true}
                                                        minDate = {new Date()}
                                                        defaultValue = {Invoicing && Invoicing.invoice_date!='' && Invoicing.invoice_date!='None' ? window.getFormattedDate(Invoicing.invoice_date) : '' }
                                                        showClock={false} >
                                                        <DatePicker
                                                        navigation={true}
                                                        locale="en"
                                                        highlightWeekends={true}
                                                        highlightToday={true}
                                                        weekNumbers={true}
                                                        weekStartDay={0}
                                                        footer={false}/>
                                                  </DateField >
                                              :null
                                            }
                                            </div>
                                          </td>
                                          </tr>
                                          <tr>
                                            <td>
                                                <label className={Invoicing && Invoicing.due_date? "control-label":"text-muted control-label"}>{translate('order_date')}>{translate('expiration_date')}</label>
                                            </td>
                                            <td>
                                              <div className="form-group qt_expexted_closing">
                                             {Invoicing?
                                                  <DateField
                                                      dateFormat="MM/DD/YYYY"
                                                      updateOnDateClick={true}
                                                      collapseOnDateClick={true}
                                                      minDate = {new Date()}
                                                      defaultValue = {Invoicing && Invoicing.due_date!='' && Invoicing.due_date!='None' ? window.getFormattedDate(Invoicing.due_date) : '' }
                                                      showClock={false}>
                                                   <DatePicker
                                                        navigation={true}
                                                        locale="en"
                                                        highlightWeekends={true}
                                                        highlightToday={true}
                                                        weekNumbers={true}
                                                        weekStartDay={0}
                                                        footer={false}/>
                                                   </DateField >
                                              :null
                                             }
                                              </div>
                                            </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                            </div>
                            }

                            {this.state.items.length > 0  || this.state.optional_items.length > 0 ?
                                <Product_tr
                                    update_row_items={this.update_row_items.bind(this)}
                                    currency = {this.state.currency}
                                    page="edit"
                                    module='invoice'
                                    extra_option_link={this.state.url}
                                    items = {this.state.items}
                                    optional_items = {this.state.optional_items}
                                    untaxed_amt={this.state.total_amount}
                                    total_tax_amt={this.state.total_tax_amt}
                                    opuntaxed_amt={this.state.opuntaxed_amt}
                                    optotal_tax_amt={this.state.optotal_tax_amt}
                                />
                                :null
                            }
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
           <LoadingOverlay processing={this.state.processing}/>
        </div>
    );
  }
}
module.exports = CustomerInvoiceEdit;
