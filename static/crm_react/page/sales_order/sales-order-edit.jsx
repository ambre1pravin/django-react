import React from 'react';
import {Link, browserHistory } from 'react-router'
import { DateField, DatePicker } from 'react-date-picker'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import Customer from 'crm_react/component/customer';
import QuotationTemplateDropDown from 'crm_react/page/product/quotation-template-drop-down';
import PaymentTermDropDown from 'crm_react/page/product/payment-term-drop-down';
import ProductHeader from 'crm_react/component/product-header';
import Product_tr from 'crm_react/page/quotation/Product_tr';
import {translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import { getCookie} from 'crm_react/common/helper';
import {get_percentage} from 'crm_react/common/product-helper';
import { ToastContainer, toast } from 'react-toastify';



class  SalersOrderEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            edit_id: 0,
            result: null,
            quotation: null,
            Invoicing: '',
            total_Invoicing_data: null,
            items: [],
            optional_items: [],
            products_list: [],
            uom_list: [],
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
            op_id_list: [],
            main_contact_id: '',
            main_contact_email: '',
            input_value: '',
            parameter: [],
            email: '',
            master_id: this.props.params.Id,
            url: null,
            pmt_list:[],
            processing:false
        };

        this.getQuotationById = this.getQuotationById.bind(this);
        var store = localStorage.getItem('searchsale');
        if (store !== null && store != '') {
            localStorage.setItem('searchsales', store);
        }else {
            localStorage.setItem('searchsales', []);
        }
        localStorage.setItem('setpage1', 'salers');
    }

    componentDidMount() {
        var quot_id = this.props.params.Id;
        var store = localStorage.getItem('searchsale');
        if (store !== null && store != '') {
            localStorage.setItem('searchsales', store);
        }else {
            localStorage.setItem('searchsales', []);
        }
        this.setState({edit_id: quot_id});
        this.getQuotationById(quot_id);
    }



   set_customer_id_name(data) {
        this.setState({selected_customer_id: data.id, selected_customer_name: data.name})
   }

   set_payment_term_data(data){
        this.setState({selected_payment_id:data.id, selected_payment_name:data.name})
   }

    set_quotation_template(data){
        if(this.state.selected_tmpl_id !== data.id ){
            if(confirm("To change template you will loss the previous data!!")){
                this.setState({selected_tmpl_id:data.id, selected_tmpl_name:data.name})
                this.get_template_product(data.uuid)
            }
        }
    }

    get_template_product(template_uuid){
        this.serverRequest = $.get('/quot/template/editdata/'+template_uuid, function (data) {
            if(data.success==true){
                this.setState({items:[]})
                let product = data.template.products;
                let temp_items = [];
                if(product.length > 0 ){
                    for(var i=0; i < product.length; i++){
                        let dic = {'id':'key_'+i+1,
                                    'name': product[i].product_name,
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
                        temp_items.push(dic)
                    }
                    this.setState({items:temp_items,total_tax_amt:data.template.tax_amount, untaxed_amt:data.template.amount_untaxed})
                }
            }
        }.bind(this))
    }

   get_total_invoice_by_id(){
        this.serverRequest = $.get('/customer/invoice/customerinvoicetotal/'+this.props.params.Id+ '/', function (data) {
            this.setState({
                customer_invoice_total_amount    : data.total_amount!==undefined ? data.total_amount : [],
                customer_invoice_tax_amount      : data.tax_amount!==undefined ? data.tax_amount : [],
                total_Invoicing_data   : data.total_Invoicing_data,
            });
        }.bind(this));
    }

    getQuotationById(id) {
        this.serverRequest = $.get('/quotation/adddata/', function (data) {
            this.setState({
                pmt_list: data.json_paytm !== undefined ? data.json_paytm : [],
                taxes_list: data.json_taxes !== undefined ? data.json_taxes : [],
                select_ls_value: data.json_taxes !== undefined && data.json_taxes != '' ? data.json_taxes : '',
            });

        }.bind(this));

        this.get_total_invoice_by_id();


        var id = this.props.params.Id;
        this.serverRequest = $.get('/quotation/editdata/' + id +'/', function (data) {
            if (data.success == true) {
                this.setState({
                    result: data,
                    qout_status: data.quotation !== undefined && data.quotation.status != null ? data.quotation.status : '',
                    quotation: data.quotation !== undefined ? data.quotation : null,
                    untaxed_amt: data.quotation !== undefined ? data.quotation.amount_untaxed : 0.00,
                    expiration_date: data.quotation !== undefined ? data.quotation.expiration_date : '',
                    total_tax_amt: data.quotation !== undefined ? data.quotation.tax_amount : 0.00,
                    total_amt: data.quotation !== undefined ? data.quotation.total_amount : 0.00,
                    name: data.quotation.name,
                    url: data.quotation.url,
                    currency: data.quotation.currency,
                    total_amount: data.quotation !== undefined ? data.quotation.total_amount : 0.00,
                    opuntaxed_amt: data.quotation !== undefined ? data.quotation.opamount_untaxed : 0.00,
                    optotal_tax_amt: data.quotation !== undefined ? data.quotation.optax_amount : 0.00,
                    optotal_amt: data.quotation !== undefined ? data.quotation.optotal_amount : 0.00,
                    selected_customer_id: data.quotation !== undefined && data.quotation.customer_id != null ? data.quotation.customer_id : '',
                    selected_customer_name: data.quotation !== undefined && data.quotation.customer_name != null ? data.quotation.customer_name : '',
                    selected_tmpl_id: data.quotation !== undefined && data.quotation.qout_tmpl_id != null ? data.quotation.qout_tmpl_id : '',
                    selected_tmpl_name: data.quotation !== undefined && data.quotation.qout_tmpl_id != null ? data.quotation.qout_tmpl_name : '',
                    selected_payment_name: data.quotation !== undefined && data.quotation.payment_term != null ? data.quotation.pay_tm_name : '',
                    selected_payment_id: data.quotation !== undefined && data.quotation.payment_term_id != null ? data.quotation.payment_term_id : '',
                    payment_term: data.quotation !== undefined && data.quotation.payment_term_id != null ? data.quotation.payment_term_id : '',
                    notes: data.quotation !== undefined ? data.quotation.notes : '',
                    taxes_list: data.json_taxes !== undefined ? data.json_taxes : [],
                    quotationID: data.quotation.id,
                    quot_id: id,
                    Invoicing: data.Invoicing,
                    total_Invoicing_data: data.total_Invoicing_data,
                    total_amount_untaxed: data.quotation.amount_untaxed,
                    invoice_status: data.Invoicing.invoice_status,
                    text_invoice: data.text_invoice,
                    text_invoice12: data.text_invoice12,

                });

                if (data.quotation.products !== undefined && data.quotation.products.length > 0) {
                    var temp_arr = []
                    data.quotation.products.forEach(function (element, i) {
                        temp_arr.push({
                            'id': i + 1,
                            'name': element.product_name,
                            'pro_qty': element.product_qty,
                            'unit_price': element.unit_price,
                            'pro_uom': '',
                            'discount': element.discount,
                            'discription': element.product_description,
                            'selected_product': element.product_name,
                            'selected_product_id': element.uuid,
                            'selected_uom': element.product_uom_name != null ? element.product_uom_name : null,
                            'selected_uom_id': element.product_uom != null ? element.product_uom : null,
                            'json_taxes': data.json_taxes !== undefined ? data.json_taxes : [],
                            'selected_tax_id': element.product_tax_id,
                            'selected_tax_name': element.product_tax_name,
                            'selected_tax_value':element.product_tax_value,
                            'selected_tax_computation':element.product_tax_computation,
                            'tax_amt': element.tax_price,
                            'subtotal': element.price_subtotal,
                        });
                    });
                    this.setState({items: temp_arr})
                }
                if (data.quotation.optional_products !== undefined && data.quotation.optional_products.length > 0) {
                    var temp_arr = []
                    data.quotation.optional_products.forEach(function (element, i) {
                        temp_arr.push({
                            'id': i + 1,
                            'name': element.product_name,
                            'pro_qty': element.product_qty,
                            'unit_price': element.unit_price,
                            'pro_uom': '',
                            'discount': element.discount,
                            'discription': element.product_description,
                            'selected_product': element.product_name,
                            'selected_product_id': element.uuid,
                            'selected_uom': element.product_uom_name != null ? element.product_uom_name : null,
                            'selected_uom_id': element.product_uom != null ? element.product_uom : null,
                            'selected_tax_id': element.product_tax_id,
                            'selected_tax_name': element.product_tax_name,
                            'selected_tax_value':element.product_tax_value,
                            'selected_tax_computation':element.product_tax_computation,
                            'tax_amt': element.tax_price,
                            'subtotal': element.price_subtotal,
                        });
                    });
                    this.setState({optional_items: temp_arr})
                }

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
            var status = this.props.params.state !== undefined ? this.props.params.state : '';
            if (status !== '') {
                if (status == 'sent') {
                    browserHistory.push("/sales/order/edit/" + this.props.params.Id +'/');
                    //this.openEmailModal();
                }else {
                    browserHistory.push("/sales/order/edit/" + this.props.params.Id+'/');
                    //this.updateQoutationStatus(status);
                }
            }
        }.bind(this)).then(function (result) {
            var selected_tmpl_id = this.state.selected_tmpl_id;
        }.bind(this));
    }


    handleView(preview_id) {
        var preview_type = 'edit';
        browserHistory.push("/quotation/preview/" + preview_id + "/" + preview_type);
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
                        'quot_tmpl':this.state.selected_tmpl_id,
                        'order_date':this.state.order_date,
                        'expexted_closing':this.state.expiration_date,
                        'payment_term':this.state.selected_payment_id,
                        'products':product_rows,
                        'optional_products':[],
                        'options_numbers':[],
                        'module_name':this.state.module_name,
                        'opportunity_id':this.state.opportunity_id,
                        'untaxed_amt':this.state.untaxed_amt,
                        'tax_amt':this.state.total_tax_amt,
                        'notes':this.state.notes,
                        'id':this.state.edit_id,
                        };
            if(this.state.selected_customer_id > 0 && product_rows.length > 0) {
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/quotation/updateQuatation/',
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
                            browserHistory.push("/sales/order/view/" + data.uuid + "/");
                        }
                    }.bind(this)
                });
            }else{
                 toast.error("Customer Name", {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
            }
        }
    }

    handleChangeNote(event){
        this.setState({notes : event.target.value,})
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

  render() {
    let result         = this.state.result;
    let quotation      = this.state.quotation;
    let items          = this.state.items;
    let optional_items = this.state.optional_items;
    let Invoicing      = this.state.Invoicing;
    let text_invoice    = this.state.text_invoice;
    let text_invoice12    = this.state.text_invoice12;
    let total_amount              = this.state.untaxed_amt+this.state.total_tax_amt;
    let optotal_amount            = this.state.opuntaxed_amt+this.state.optotal_tax_amt;
    var message_props_data={
        'email':this.state.main_contact_email,
        'master_id':this.state.master_id
       };

    return (
    <div>
      <Header />
    <div id="crm-app" className="clearfix module__quotation module__quotation-edit">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">

                <AddPageTopAction
                    list_page_link ="/sales/order/list/"
                    list_page_label ="Sales Order"
                    add_page_link={false}
                    add_page_label ={false}
                    edit_page_link={false}
                    edit_page_label ={translate('label_salers')}
                    item_name = {quotation && quotation.name!==undefined ?quotation.name:null}
                    page="edit"
                    module="sales-order"
                    save_action ={this.save_action_fn.bind(this)}
                />


                <div className="row crm-stuff">
                  <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <form id = "quotation_edit_form">
                      <div className="panel panel-default panel-tabular">
                        <div className="panel-heading no-padding panel-heading-blank">
                        <br/>

                          {this.state.total_Invoicing_data ?
                              <Link to={'/customer/invoice/customerlist/' + this.props.params.Id +'/'}  title={translate('create_invoice')} >
                                  <button type="button" name="save_as_invoice" className="btn btn-sm pull-right btn-default save_as_invoice">
                                       <i className="fa fa-fw o_button_icon fa-pencil-square-o"></i>
                                          <b className="text-primary"> {this.state.total_Invoicing_data} Invoices</b>
                                  </button>
                              </Link>
                            :null
                          }

                        </div>
                        <div className="panel-body edit-form">
                            <div className="row">
                              <h2 className="col-sm-12 quotation-number">
                                {quotation && quotation.name!==undefined ?quotation.name  : '' }
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
                                          <label className="control-label">{translate('quotation_template')}</label>
                                      </td>
                                      <td>
                                            <QuotationTemplateDropDown
                                                field_name="quotation-template"
                                                field_label="Quotation Template"
                                                show_lable={true}
                                                set_return_data ={this.set_quotation_template.bind(this)}
                                                get_data_url="/quot/get-quot-template/"
                                                selected_name={this.state.selected_tmpl_name}
                                                selected_id={this.state.selected_tmpl_id}
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
                                            {quotation?
                                              <DateField
                                                  dateFormat="MM/DD/YYYY"
                                                  updateOnDateClick={true}
                                                  collapseOnDateClick={true}
                                                  minDate = {new Date()}
                                                  defaultValue = {quotation && quotation.order_date!='' && quotation.order_date!='None' ? window.getFormattedDate(quotation.order_date) : '' }
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
                                            <label className="control-label">{translate('expiration_date')}</label>
                                        </td>
                                        <td>
                                          <div className="form-group qt_expexted_closing">
                                          {quotation?
                                           <DateField  dateFormat="MM/DD/YYYY"
                                                                      updateOnDateClick={true}
                                                                      collapseOnDateClick={true}
                                                                      minDate = {new Date()}
                                                                      defaultValue={quotation && quotation.expiration_date!='' && quotation.expiration_date!='None' ? window.getFormattedDate(quotation.expiration_date) : '' }
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
                                          <label className="control-label">{translate('payment_term')} </label>
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
                            </div> 
                        </div>
                        {this.state.items.length > 0  || this.state.optional_items.length > 0 ?
                            <Product_tr
                                update_row_items={this.update_row_items.bind(this)}
                                currency = {this.state.currency}
                                page="edit"
                                module='sales-order'
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
module.exports = SalersOrderEdit;
