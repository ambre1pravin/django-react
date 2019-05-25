import React from 'react';
import {Link, browserHistory } from 'react-router'
import { DateField, DatePicker } from 'react-date-picker'
import 'react-date-picker/index.css'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import Customer from 'crm_react/component/customer';
import QuotationTemplateDropDown from 'crm_react/page/product/quotation-template-drop-down';
import PaymentTermDropDown from 'crm_react/page/product/payment-term-drop-down';
import Product_tr from 'crm_react/page/quotation/Product_tr';
import {translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {getCookie} from 'crm_react/common/helper';
import {get_percentage} from 'crm_react/common/product-helper';
import { ToastContainer, toast } from 'react-toastify';



class  QuotTemplateAdd extends React.Component {
    constructor(){
        super();
        this.state = {
                    tempate_name      : null,
                    expiration_delay  :30,
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
                    selected_payment_id:0,
                    selected_payment_name:'',
                    email_reminder    : false,
                    processing        : false,
                    module_name :'quotation-template',
                    notes:'',
                    toast_msg:null
        }

        this.handleChangeOrderDate        = this.handleChangeOrderDate.bind(this);
        this.handleChangeExpireDate       = this.handleChangeExpireDate.bind(this);
        this.quotationadddata();
    }

    set_customer_id_name(data){
       this.setState({select_customer_id:data.id,select_customer_name:data.name})
    }

    set_payment_term_data(data){
        this.setState({selected_payment_id:data.id, selected_payment_name:data.name})
    }

    set_quotation_template(data){
        this.setState({selected_tmpl_id:data.id, selected_tmpl_name:data.name})
    }

    on_change_name(event){
        this.setState({tempate_name:event.target.value})
    }

    on_change_expiration_delay(event){
        this.setState({expiration_delay:event.target.value})
    }


    quotationadddata(){
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

    handleSubmit(quot_status=''){
        let items = this.state.items;
        let product_rows = [];
        let toast_msg = null;
        if(items.length > 0){
            for(var i=0; i < items.length; i++){
                if(items[i].selected_product_id !=''){
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
            }
            let Data ={}
                Data['products'] = product_rows;
                Data['optional_products'] = []
                Data['options_numbers'] = []
                Data['module_name']=this.state.module_name;
                Data['untaxed_amt']=this.state.untaxed_amt;
                Data['tax_amt']=this.state.total_tax_amt;
                Data['notes']=this.state.notes;

            if(product_rows.length > 0) {
                let post_url = null, response_url=null;
                if(this.state.module_name=='sales-order'){
                    if(this.state.select_customer_id > 0){
                         post_url = '/quotation/saveQuatation/'
                         response_url = "/sales/order/view/"
                         Data['customer_id'] = this.state.select_customer_id;
                         Data['customer_name'] = this.state.select_customer_name
                         Data['quot_tmpl'] = this.state.selected_tmpl_id
                         Data['order_date'] = this.state.order_date
                         Data['expexted_closing'] = this.state.expiration_date
                         Data['payment_term'] = this.state.selected_payment_id

                         Data['opportunity_id'] =this.state.opportunity_id;

                     }else{
                        toast_msg =  "Customer Required!!";
                     }
                }else{
                    if(this.state.tempate_name!=null && this.state.tempate_name!=''){
                        post_url = '/quot/template/saveTemplate/';
                        response_url = "/quot/template/view/";
                        Data['name'] = this.state.tempate_name;
                        Data['expiration_delay']=this.state.expiration_delay;
                    }else{
                        toast_msg =  "Template Name Required!!";
                    }
                }
                if(post_url!=null && toast_msg == null){
                    $.ajax({
                        type: "POST",
                        cache: false,
                        url: post_url,
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
                                browserHistory.push( response_url + data.uuid + "/");
                            }
                        }.bind(this)
                    });
                }else{
                    toast.error(toast_msg, {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
                    toast_msg = null
                }
            }else{
                 toast.error("Product not selected", {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
                 toast_msg = null
            }
        }
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

    update_row_items(data){
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

    save_action_fn(){
        this.handleSubmit();
    }

    render() {
        let result              = this.state.result;
        let items             = this.state.items;
        let optional_items    = this.state.optional_items;
        return (
            <div>
              <Header />
                <div id="crm-app" className="clearfix module__quotation module__quotation-create">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                                <AddPageTopAction
                                    list_page_link ={this.state.module_name == 'sales-order' ? "/sales/order/list/": "/quot/template/list/"}
                                    list_page_label ="Quotation Template"
                                    add_page_link="/contact/add/"
                                    add_page_label ="Quotation Template"
                                    edit_page_link={false}
                                    edit_page_label ={false}
                                    item_name=""
                                    page="add"
                                    module="sales-order"
                                    save_action ={this.save_action_fn.bind(this)}
                                />
                                {this.state.module_name == 'sales-order' ?
                                   <div className="row ribbon">
                                      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                          <ul className="pull-right">
                                              <li className="active"><a href="javascript:void(0)" title={translate('label_quotation')}>{translate('label_quotation')}</a></li>
                                            </ul>
                                      </div>
                                  </div>
                                :null
                               }
                              <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                  <form id="quotation_form">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-heading no-padding panel-heading-blank">
                                        </div>
                                        <div className="panel-body edit-form">
                                            <div className="row">
                                                <h2 className="col-sm-12 quotation-number">
                                                    {this.state.module_name == 'sales-order' ? 'New Sales Order':'New Quotation Template' }
                                                </h2>
                                            </div>
                                            <div className="row row__flex">
                                                <div className={this.state.module_name == 'sales-order'?"col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right":"col-xs-12 col-sm-12 col-md-6 col-lg-6"}>
                                                    <table className="detail_table">
                                                      <tbody>
                                                      {this.state.module_name=='sales-order' ?
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
                                                        :
                                                            <tr>
                                                                <td>
                                                                    <label className="control-label">
                                                                        Template Name<span className="text-primary">*</span>
                                                                    </label>
                                                                </td>
                                                                <td>
                                                                    <div className="form-group">
                                                                        <input type="text"
                                                                            className="form-control"
                                                                            name="name" placeholder="Name..."
                                                                            value={this.state.tempate_name}
                                                                            onChange={this.on_change_name.bind(this)}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        }

                                                        { this.state.module_name == 'sales-order' ?
                                                            <tr>
                                                                <td>
                                                                    <label className="control-label">{translate('quotation_template')}</label>
                                                                </td>
                                                                <td>
                                                                    <QuotationTemplateDropDown
                                                                        field_name="quotation-template"
                                                                        field_label="Quotation Template"
                                                                        show_lable={true}
                                                                        set_return_data ={this.set_quotation_template.bind(this)}
                                                                        get_data_url="/quot/get-quot-template/"
                                                                        selected_name=""
                                                                        selected_id={null}
                                                                        item_selected={false}
                                                                        create_option={false}
                                                                        create_edit_option={false}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        :
                                                            <tr>
                                                                <td>
                                                                    <label className="control-label">{'Expiration Delay'}</label>
                                                                </td>
                                                                <td>
                                                                    <div className="form-group">
                                                                        <input
                                                                            className="form-control"
                                                                            value={this.state.expiration_delay}
                                                                            type="text" placeholder="Expiration Delay..."
                                                                            onChange={this.on_change_expiration_delay.bind(this)}
                                                                        />
                                                                        <span className="emailalis">Days</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        }
                                                      </tbody>
                                                    </table>
                                                </div>
                                                {this.state.module_name == 'sales-order' ?
                                                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                                    <table className="detail_table">
                                                      <tbody>
                                                        <tr>
                                                            <td>
                                                                <label className="control-label">{translate('order_date')}</label>
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
                                                                <label className="control-label">{translate('expiration_date')}</label>
                                                            </td>
                                                            <td>
                                                            <div id ="expiration_date"className="form-group qt_expexted_closing">
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
                                                :null
                                                }
                                            </div>
                                        </div>
                                        <Product_tr
                                            update_row_items={this.update_row_items.bind(this)}
                                            currency = {this.state.currency}
                                            page="add"
                                            module='quotation-template'
                                            extra_option_link={null}
                                            items = {this.state.items}
                                            untaxed_amt={this.state.untaxed_amt}
                                            total_tax_amt={this.state.total_tax_amt}
                                        />
                                    </div>  {/*end .panel*/}
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
module.exports = QuotTemplateAdd;
