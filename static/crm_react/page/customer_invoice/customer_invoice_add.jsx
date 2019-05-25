import React from 'react';
import {  Link, browserHistory } from 'react-router'
import { DateField, DatePicker } from 'react-date-picker'
import 'react-date-picker/index.css'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import Customer from 'crm_react/component/customer';
import PaymentTermDropDown from 'crm_react/page/product/payment-term-drop-down';
import Product_tr from 'crm_react/page/quotation/Product_tr';
import {translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {getCookie } from 'crm_react/common/helper';
import {get_percentage} from 'crm_react/common/product-helper';
import { ToastContainer, toast } from 'react-toastify';



class  CustomerInvoiceAdd extends React.Component {
    constructor(props){
        super(props);
        var setpage = localStorage.getItem('setpage');
        this.state = {
                        result            : null,
                        items             : [],
                        optional_items    : [],
                        untaxed_amt       : 0 ,
                        total_tax_amt     : 0 ,
                        opuntaxed_amt     : 0 ,
                        optotal_tax_amt   : 0 ,
                        select_customer_id    : 0,
                        select_customer_name : '',
                        selected_tmpl_name: '',
                        selected_tmpl_id  : '',
                        order_date        :'',
                        expiration_date   : '',
                        pmt_list          :[],
                        selected_payment_id:0,
                        selected_payment_name:'',
                        email_reminder    : false,
                        processing        : false,
                        multiple_tax      :[],
                        op_multiple_tax   :[],
                        product_rows      :[],
                        notes:'',
                        module_name       :'invoice',
        }
         this.handleChangeOrderDate        = this.handleChangeOrderDate.bind(this);
         this.handleChangeExpireDate       = this.handleChangeExpireDate.bind(this);
         this.quotationadddata();
    }



    quotationadddata(){
        var opportunity_store_id      = localStorage.getItem('opportunity_store_id');
        var opportunity_store_name    = localStorage.getItem('opportunity_store_name');
        var opp_quo                   = localStorage.getItem('opp_quo');
        this.serverRequest = $.get('/quotation/adddata/', function (data) {
            this.setState({
                result              : data,
                currency            : data.currency,
                opp_quo             : opp_quo,
            });
        }.bind(this)).then(function(result){
        }.bind(this));
    }



    update_row_items(data){
        console.log("rows data", data)
        if(data.items.length > 0){
            this.setState({items:data.items,
                     tax_amt:data.tax_amt,
                     untaxed_amt:data.untaxed_amt,
                     optional_items:data.optional_items,
                     optax_amt:data.optax_amt,
                     opuntaxed_amt:data.opuntaxed_amt
            })
        }
    }


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

            let Data = {
                'customer_id':this.state.select_customer_id,
                'customer_name':this.state.select_customer_name,
                'payment_term':this.state.selected_payment_id,
                'invoice_date':this.state.order_date,
                'due_date':this.state.expiration_date,
                'products':product_rows,
                'module_name':this.state.module_name,
                'opportunity_id':this.state.opportunity_id,
                'untaxed_amt':this.state.untaxed_amt,
                'tax_amt':this.state.total_tax_amt,
                'notes':this.state.notes
            };
            if(this.state.select_customer_id > 0 && product_rows.length > 0) {
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/customer/invoice/saveCustomerInvoice//',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(Data),
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                        //this.setState({processing : true})
                    }.bind(this),
                    success: function (data) {
                        if (data.success === true) {
                            this.setState({processing : false});
                            browserHistory.push("/customer/invoice/view/" + data.encrypt_id + "/");
                        }
                    }.bind(this)
                });
            }else{
                 toast.error("Customer Name", {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
            }
        }
    }



    set_customer_id_name(data){
        this.setState({select_customer_id:data.id,select_customer_name:data.name})
    }

    set_payment_term_data(data){
        this.setState({selected_payment_id:data.id, selected_payment_name:data.name})
    }

    updateQoutationStatus(status) {
        this.handleSubmit(status);
    }

    handleChangeOrderDate(date) {
        this.setState({order_date: date});
    }

    handleChangeExpireDate(date) {
        this.setState({expiration_date: date});
    }

    handleChangeNote(event) {
        this.setState({notes: event.target.value,})
    }


    save_action_fn() {
        this.handleSubmit();
    }

    render() {
        let result         = this.state.result;
        return (
        <div>
            <ToastContainer/>
              <Header />
                <div id="crm-app" className="clearfix module__quotation module__quotation-create">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                                <AddPageTopAction
                                    list_page_link ="/customer/invoice/list/"
                                    list_page_label ="Invoice"
                                    add_page_link="/contact/invoice/add/"
                                    add_page_label ="Invoice"
                                    edit_page_link={false}
                                    edit_page_label ={false}
                                    item_name=""
                                    page="add"
                                    module="invoice"
                                    save_action ={this.save_action_fn.bind(this)}
                                />
                              <div className="row ribbon">
                                  <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                      <ul className="pull-right">
                                          <li className="active"><a href="javascript:void(0)" title={translate('label_invoice')}>{translate('label_invoice')}</a></li>
                                        </ul>
                                  </div>
                              </div>
                              <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                  <form id="customer_invoice_form">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-heading no-padding panel-heading-blank"></div>
                                        <div className="panel-body edit-form">
                                            <div className="row">
                                                <h2 className="col-sm-12 quotation-number"><input type="text" name="quotation-number" value="Draft Invoice" /></h2>
                                            </div>
                                            <div className="row row__flex">
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
                                                        <tr>
                                                            <td>
                                                                <label className="control-label">{translate('payment_term')} </label>
                                                            </td>
                                                            <td>
                                                                <PaymentTermDropDown
                                                                    field_name="payment-term"
                                                                    field_label="Payment Term"
                                                                    show_lable={true}
                                                                    set_return_data ={this.set_payment_term_data.bind(this)}
                                                                    get_data_url="/payment/get-payment-term/"
                                                                    selected_name=""
                                                                    selected_id={null}
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
                                                                <label className="control-label">{translate('invoice_date')}</label>
                                                            </td>
                                                            <td>
                                                              <div className="form-group qt_order_date">
                                                                <DateField  dateFormat="MM/DD/YYYY"
                                                                          updateOnDateClick={true}
                                                                          collapseOnDateClick={true}
                                                                          defaultValue={''}
                                                                          minDate = {new Date()}
                                                                          onChange  = {this.handleChangeOrderDate}
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
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <label className="control-label">{translate('due_date')}</label>
                                                            </td>
                                                            <td>
                                                            <div className="form-group qt_expexted_closing">
                                                             <DateField  dateFormat="MM/DD/YYYY"
                                                                    updateOnDateClick    = {true}
                                                                    collapseOnDateClick  = {true}
                                                                    value                = {this.state.expiration_date}
                                                                    selected             = {this.state.expiration_date}
                                                                    onChange             = {this.handleChangeExpireDate}
                                                                    minDate              = {new Date()}
                                                                    id                   = {"expiration_date"}
                                                                    showClock            = {false}>
                                                                <DatePicker
                                                                  navigation         = {true}
                                                                  locale             = "en"
                                                                  highlightWeekends  = {true}
                                                                  highlightToday     = {true}
                                                                  weekNumbers        = {true}
                                                                  weekStartDay       = {0}
                                                                  footer             = {false}/>
                                                              </DateField>
                                                            </div>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                            <Product_tr
                                                update_row_items={this.update_row_items.bind(this)}
                                                currency = {this.state.currency}
                                                page="add"
                                                module='invoice'
                                                items = {this.state.items}
                                                untaxed_amt={this.state.untaxed_amt}
                                                total_tax_amt={this.state.total_tax_amt}
                                                extra_option_link={null}
                                            />
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
module.exports = CustomerInvoiceAdd;
