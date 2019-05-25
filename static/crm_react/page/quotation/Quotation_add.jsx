import React from 'react';
import {Link, browserHistory } from 'react-router'
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import { DateField, DatePicker } from 'react-date-picker'
import 'react-date-picker/index.css'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import Product_tr from 'crm_react/page/quotation/Product_tr';
import Reminder_tr from 'crm_react/page/quotation/Reminder_tr';
import Customer from 'crm_react/component/customer';
import QuotationTemplateDropDown from 'crm_react/page/product/quotation-template-drop-down';
import PaymentTermDropDown from 'crm_react/page/product/payment-term-drop-down';
import {translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {get_percentage} from 'crm_react/common/product-helper';
import { ToastContainer, toast } from 'react-toastify';


class  QuotationAdd extends React.Component {
    constructor(){
        super();
        this.state = {
                    result            : null ,
                    items             : [],
                    optional_items    : [],
                    total_tax_amt      :0,
                    untaxed_amt       :0,
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
                    module_name :'quotation',
                    notes:''
        }
        this.handleChangeEmailReminder    = this.handleChangeEmailReminder.bind(this);
        this.quotationadddata()
    }


   set_customer_id_name(data) {
        this.setState({selected_customer_name: data.name, selected_customer_id: data.id })
   }

   set_payment_term_data(data){
        this.setState({selected_payment_id:data.id, selected_payment_name:data.name})
   }

   set_quotation_template(data){
        this.setState({selected_tmpl_id:data.id, selected_tmpl_name:data.name, items:[]})
        this.get_template_product(data.uuid)
   }

   get_template_product(template_uuid){
        this.serverRequest = $.get('/quot/template/editdata/'+template_uuid, function (data) {
            if(data.success==true){
                let product = data.template.products
                if(product.length > 0 ){
                    for(var i=0; i < product.length; i++){
                        let dic = {'id':'key_'+i+1,
                                    'name': 'test2',
                                    'pro_qty': product[i].product_qty,
                                    'unit_price': product[i].unit_price,
                                    'discount': product[i].discount,
                                    'discription': product[i].product_description,
                                    'selected_product': product[i].product_name,
                                    'selected_product_id': product[i].uuid,
                                    'selected_tax_name': product[i].product_tax_name,
                                    'selected_tax_id': product[i].product_tax_id,
                                    'selected_tax_value':product[i].product_tax_value,
                                    'selected_tax_computation':product[i].product_tax_computation,
                                    'selected_uom':product[i].product_uom_name,
                                    'selected_uom_id':product[i].product_uom,
                                    'tax_amt': product[i].tax_price,
                                    'subtotal': product[i].price_subtotal,
                                    'type':'order'
                                   }
                        this.state.items.push(dic)
                    }

                    this.setState({items:this.state.items, total_tax_amt:data.template.tax_amount, untaxed_amt:data.template.amount_untaxed})
                }
            }
        }.bind(this))
   }


    quotationadddata(){
          var opportunity_store_id      = localStorage.getItem('opportunity_store_id');
          var opportunity_store_name    = localStorage.getItem('opportunity_store_name');
          var opp_quo                   = localStorage.getItem('opp_quo');
          this.serverRequest = $.get('/quotation/adddata/', function (data) {
            this.setState({
                    result              : data,
                    products_list       : data.json_products!==undefined ? data.json_products : [],
                    uom_list            : data.json_uom!==undefined ? data.json_uom : [],
                    taxes_list          : data.json_taxes!==undefined ? data.json_taxes : [],
                    selected_tmpl_id    : data.selected_tmpl_id!==undefined && data.selected_tmpl_id!='' ? data.selected_tmpl_id :'',
                    selected_tmpl_name  : data.selected_tmpl_name!==undefined && data.selected_tmpl_name!='' ? data.selected_tmpl_name :'',
                    pmt_list            : data.json_paytm!==undefined ? data.json_paytm : [],
                    currency            : data.currency,
                    opportunity_id      : opportunity_store_id,
                    opportunity_name    : opportunity_store_name,
                    opp_quo             : opp_quo,
            });
          }.bind(this)).then(function(result){
            //this.handleTemplateSelection(result.selected_tmpl_id,result.selected_tmpl_name);
          }.bind(this));
    }

   update_row_items(data){
        console.log("rows data", data)
        if(data.items.length > 0){
            this.setState({items:data.items, tax_amt:data.tax_amt, untaxed_amt:data.untaxed_amt,
             optional_items:data.optional_items, optax_amt:data.optax_amt, opuntaxed_amt:data.opuntaxed_amt
            })
        }
   }

    handleSubmit(){
        let items = this.state.items;
        let optional_items = this.state.optional_items;
        let product_rows = [];
        let optional_product_rows = [];
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
        }
        if(optional_items.length > 0){
            for(var i=0; i < optional_items.length; i++){
                optional_product_rows.push(
                    {'product_id':optional_items[i].selected_product_id,
                    'uom':optional_items[i].selected_uom_id,
                    'tax':optional_items[i].selected_tax_id,
                    'description':optional_items[i].discription,
                    'order_qty':optional_items[i].pro_qty,
                    'unit_price':optional_items[i].unit_price,
                    'tax_amt':optional_items[i].tax_amt,
                    'discount':optional_items[i].discount,
                    'subtotal':optional_items[i].subtotal,
                    }
                );
            }
        }

        let Data = {'customer_id':this.state.selected_customer_id,
                    'customer_name':this.state.selected_customer_name,
                    'quot_tmpl':this.state.selected_tmpl_id,
                    'order_date':this.state.order_date,
                    'expexted_closing':this.state.expiration_date,
                    'payment_term':this.state.selected_payment_id,
                    'products':product_rows,
                    'optional_products':optional_product_rows,
                    'options_numbers':[],
                    'module_name':this.state.module_name,
                    'opportunity_id':this.state.opportunity_id,
                    'untaxed_amt':this.state.untaxed_amt,
                    'tax_amt':this.state.total_tax_amt,
                    'opuntaxed_amt':this.state.opuntaxed_amt,
                    'optax_amt':this.state.optotal_tax_amt,
                    'notes':this.state.notes
                    };
            if(this.state.selected_customer_id > 0 && product_rows.length > 0) {
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/quotation/saveQuatation/',
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
                            browserHistory.push("/quotation/view/" + data.uuid + "/");
                        }
                    }.bind(this)
                });
            }else{
                 toast.error("Customer Name", {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
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

    handleChangeEmailReminder(event) {
        var email_all = $(".email_all");
        var email_alls = $(".email_alls");
        var name = event.target.name;
        var value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.setState({
            email_reminder: value,
        });
        if (event.target.checked) {
            email_all.show();
            this.setState({email_reminder: true})
        }
        if (event.target.checked == false) {
            email_all.hide();
            email_alls.hide();
        }
    }

    save_action_fn(){
      this.handleSubmit();
    }

    render() {

        return (
            <div>
              <Header />
                <div id="crm-app" className="clearfix module__quotation module__quotation-create">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                                <AddPageTopAction
                                    list_page_link ="/quotation/list/"
                                    list_page_label ="Quotation"
                                    add_page_link="/quotation/add/"
                                    add_page_label ="Add Quotation"
                                    edit_page_link={false}
                                    edit_page_label ={false}
                                    page="add"
                                    module="quotation"
                                    save_action ={this.save_action_fn.bind(this)}
                                />
                              <div className="row ribbon">
                                  <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                      <ul className="pull-right">
                                          <li className="active"><a href="javascript:void(0)" title={translate('label_quotation')}>{translate('label_quotation')}</a></li>
                                        </ul>
                                  </div>
                              </div>
                              <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                  <form id="quotation_form">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-heading no-padding panel-heading-blank">
                                        </div>
                                        <div className="panel-body edit-form">
                                            <div className="row">
                                                <h2 className="col-sm-12 quotation-number">
                                                    New Quotation
                                                </h2>
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
                                                      </tbody>
                                                    </table>
                                                </div>
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
                                                                              onChange  = {this.handleChangeOrderDate.bind(this)}
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
                                                                        onChange             = {this.handleChangeExpireDate.bind(this)}
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
                                            </div>
                                        </div>
                                        <Product_tr
                                            update_row_items={this.update_row_items.bind(this)}
                                            currency = {this.state.currency}
                                            page="add"
                                            module='quotation'
                                            items = {this.state.items}
                                            untaxed_amt={this.state.untaxed_amt}
                                            total_tax_amt={this.state.total_tax_amt}
                                            extra_option_link={null}
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
module.exports = QuotationAdd;
