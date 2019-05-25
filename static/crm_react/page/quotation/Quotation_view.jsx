import React from 'react';
import { Link } from 'react-router'
import state, { ROLES, ID} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import ProductHeader from 'crm_react/component/product-header';
import ProductTabs from 'crm_react/component/product-tabs';
import ProductExtraOptionLink from 'crm_react/component/product-extra-option-link';
import { getCookie} from 'crm_react/common/helper';
import RibbonRowSalesQuotationInvoice from 'crm_react/page/sales_order/ribbon-row-sales-quotation-invoice';
import Message from 'crm_react/component/message';
const form_group = {borderStyle:'none'};
class  QuotationView extends React.Component {
  constructor(props) 
  {
    super(props);
    this.state = {
                result                 : null ,
                items                  : [],
                Invoicing              : '',
                total_Invoicing_data   : null,
                optional_items         : [],
                op_id_list : [],
                main_contact_id:'',
                main_contact_email:'',
                parameter       : [],
                untaxed_amt            : 0 ,
                tax_amt                : 0 ,
                selected_customer_id   : '',
                selected_customer_name : '',
                email                  : '',
                master_id              : this.props.params.Id,
                message_modal_is_open  : false,
                qout_email_modal       : false,
                view_pagging           : false,
                action_checkbox        : false,
                invoice_modal          : false,
                timer                  : 5000,
                qout_status            : null,
                processing             : false,
                url                    : null,
                quotationID            : null,
    };

      


    this.getQuotationById = this.getQuotationById.bind(this);
    this.storData         = this.storData.bind(this);
    localStorage.setItem('setpage1','quotation');
  }

  storData(){
      var store1 = localStorage.getItem('search');
      var storetotal1 = localStorage.getItem('searchtotal');
      var storecustomer1 = localStorage.getItem('searchcustomer');
      var parameter1 = localStorage.getItem('parameter');
      var parameter = parameter1 ? JSON.parse(parameter1) : []
      var store = store1 ? JSON.parse(store1) : []
      var storetotal = storetotal1 ? JSON.parse(storetotal1) : []
      var storecustomer = storecustomer1 ? JSON.parse(storecustomer1) : []
      var keydata = localStorage.getItem('keydata');
      var keydata1 = keydata ? JSON.parse(keydata) : []
      if (keydata1!== null && keydata1!='' && keydata1!==undefined ){
          localStorage.setItem('keydata1',JSON.stringify(keydata1));
      }else{
           localStorage.setItem('keydata1',[]);
      }

      if (parameter!== null && parameter!='' && parameter!==undefined ){
          localStorage.setItem('parameter1',JSON.stringify(parameter));
      }else{
           localStorage.setItem('parameter1',[]);
      }

      if (store!== null && store!='' && store!==undefined ){
          localStorage.setItem('search1',JSON.stringify(store));
      }else{
           localStorage.setItem('search1',[]);
      }
        
      if (storetotal!== null && storetotal!='' && storetotal!==undefined ){
          localStorage.setItem('searchtotal1',JSON.stringify(storetotal));
      }
      else{
           localStorage.setItem('searchtotal1',[]);
        }      

        if (storecustomer!== null && storecustomer!='' && storecustomer!==undefined ){
          localStorage.setItem('searchcustomer1',JSON.stringify(storecustomer));
         }
      else{
           localStorage.setItem('searchcustomer1',[]);
        }
  }

  componentDidMount(){
      this.storData();
      var quot_id = this.props.params.Id;
      this.getQuotationById(quot_id);
      this.Contactlist()
  }

  Contactlist(){
      this.serverRequest = $.get('/contact/customeremail/', function (data) {
          if(data.success==true){
            this.setState({result_contact: data,});
          }
      }.bind(this));
  }

    get_total_invoice_by_id() {
        this.serverRequest = $.get('/customer/invoice/customerinvoicetotal/' + this.props.params.Id + '/', function (data) {
            this.setState({
                customer_invoice_total_amount: data.total_amount !== undefined ? data.total_amount : [],
                customer_invoice_tax_amount: data.tax_amount !== undefined ? data.tax_amount : [],
                total_Invoicing_data: data.total_Invoicing_data,
                processing: false,
            });
        }.bind(this));
    }

    getQuotationById(id){
      this.setState({processing:true});
      this.serverRequest = $.get('/quotation/adddata/', function (data) {
          this.setState({
              taxes_list : data.json_taxes!==undefined ? data.json_taxes : [],
              select_ls_value : data.json_taxes!==undefined && data.json_taxes!='' ? data.json_taxes : '' ,
              processing : false,
          });
      }.bind(this));

      this.get_total_invoice_by_id();

      this.serverRequest = $.get('/quotation/viewdata/'+ id + '/', function (data) {

          if(data.success==true){

            this.setState({
                processing : false,
                result                 : data,
                qout_status            : data.quotation!==undefined && data.quotation.status!=null ? data.quotation.status : '' ,
                quotation              : data.quotation!==undefined ? data.quotation : null,
                quotationID            : data.quotation.id,
                url                    : data.quotation.url,
                name                   : data.quotation.name,
                expiration_date        : data.quotation.expiration_date,
                userId                 : data.quotation.user_id,
                total_amount           : data.quotation.total_amount,
                total_amount_untaxed   : data.quotation.amount_untaxed,
                tax_amount             : data.quotation.tax_amount,
                currency               : data.quotation.currency,
                items                  : data.quotation.products!==undefined && data.quotation.products.length>0 ? data.quotation.products : [],
                optional_items         : data.quotation.optional_products!==undefined && data.quotation.optional_products.length>0 ? data.quotation.optional_products    : [],
                email_reminder_data    : data.quotation.email_reminder_data!==undefined && data.quotation.email_reminder_data.length>0 ? data.quotation.email_reminder_data    : [],
                quot_id                : id,
                selected_customer_id   : data.quotation!==undefined && data.quotation.customer_id!=null ? data.quotation.customer_id : ''  ,
                selected_customer_name : data.quotation!==undefined && data.quotation.customer_name!=null ? data.quotation.customer_name : '' ,
                Invoicing              : data.Invoicing,
                total_Invoicing_data   : data.total_Invoicing_data,
                invoice_status         : data.Invoicing.invoice_status,
                text_invoice           : data.text_invoice,
                text_invoice12         : data.text_invoice12,
                payment_term           : data.quotation!==undefined && data.quotation.payment_term_id!=null ? data.quotation.payment_term_id : '' ,
                email_reminder         : data.quotation.email_reminder_data!==undefined && data.quotation.email_reminder_data.length>0 ? true : false,
                processing             : false,
            });

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
    }.bind(this));
  }

  /*start : Email handlign*/


    set_quotation_status(qout_status) {
        this.setState({qout_status: qout_status});
    }

  render_products_body(items){
      return (
            <tbody>
            {items && items.length > 0 ?
                items.map((pro, i)=>{
                    return(
                          <tr key = {i} >
                              <td>&nbsp;</td>
                              <td className="desc_width">{pro.product_name}</td>
                              <td className="desc_width">{pro.product_description}</td>
                              <td className="fieldwith">{pro.product_qty!=''?pro.product_qty:'1'}</td>
                              <td className="fieldwith">{pro.product_uom_name}</td>
                              <td className="fieldwith">
                                  <span>{pro.unit_price!='' ? pro.unit_price : '0.00'}</span>
                                  <span className="push-left-2">{this.state.currency}</span>
                              </td>
                              <td className="fieldwith" >{pro.product_tax_name!=''?pro.product_tax_name : '0.00'}</td>
                              <td className="fieldwith">{pro.discount!=''?pro.discount : '0.00'}</td>
                              <td className="subtotalright fieldwith">
                                 <span>{pro.price_subtotal!='' ? pro.price_subtotal:''}</span>
                                  <span className="push-left-2">{this.state.currency}</span>
                              </td>
                          </tr>
                      )
                })
              :null
            }
          </tbody>
      );
  }

  render() {

    let result         = this.state.result;
    let quotation      = this.state.quotation;
    let items          = this.state.items;
    let userId         = this.state.userId;
    let optional_items = this.state.optional_items;
    let email_reminder_data = this.state.email_reminder_data;
    let Invoicing      = this.state.Invoicing;


    if (this.state.email_reminder == true) {
       var checked ="checked"
    }else if (this.state.email_reminder == false) {
       var checked =""
    }

    var message_props_data = {
       'email':this.state.email,
       'master_id':this.state.quotationID,
       'module_id':3,
       'module_name':'quotation',
    };

    console.log("message_props_data", message_props_data)

    return (
    <div>
      <Header />
        <div id="crm-app" className="clearfix module__quotation module__quotation-view">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">

                <AddPageTopAction
                    list_page_link ={'/quotation/list/'}
                    list_page_label ="Quotation"
                    add_page_link="/quotation/add/"
                    add_page_label ="Add Quotation"
                    edit_page_link={'/quotation/edit/' + this.props.params.Id + '/'}
                    edit_page_label ={translate('edit_quotation')}
                    item_name = {quotation && quotation.name!==undefined ?quotation.name  : null }
                    page="view"
                    module="quotation"
                    save_action ={false}
                />
                <RibbonRowSalesQuotationInvoice
                    module ="quotation"
                    q_id = {this.state.quot_id}
                    quotation_status ={this.state.qout_status}
                    preview_url={'/htm/'+this.state.url+'/quotation/'}
                    print_url={'/generate_pdf/'+this.state.url+'/quotation/'}
                    set_quotation_status_fn = {this.set_quotation_status.bind(this)}
                    get_total_invoice_by_id = {this.get_total_invoice_by_id.bind(this)}
                />
                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular">
                          <div className="panel-heading no-padding panel-heading-blank">
                          <br/>
                          {this.state.total_Invoicing_data?
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
                              <form>
                              <div className="row">
                                  <h2 className="col-sm-12 quotation-number">{quotation && quotation.name !== undefined ? quotation.name:null }</h2>
                              </div>
                              <div className="row row__flex">                            
                                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                              <table className="detail_table">
                                <tbody>
                                  <tr>
                                      <td><label className={quotation && quotation.customer_name!='' ?"control-label" :"text-muted control-label"}>{'Lead Contact'}</label></td>
                                      <td>
                                          <div className="form-group" style={form_group}>{quotation?quotation.customer_name:null}</div>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td><label className={quotation && quotation.qout_tmpl_name!='' ?"control-label" :"text-muted control-label"}>{translate('quotation_template')}</label></td>
                                      <td>
                                          <div className="form-group" style={form_group}>{quotation && quotation.qout_tmpl_name!='' ?quotation.qout_tmpl_name  : null }{'\u00A0'}</div>
                                      </td>
                                  </tr>
                                </tbody>
                              </table>
                                  </div>
                                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                              <table className="detail_table">
                                <tbody>
                                  <tr>
                                    <td><label className={quotation && quotation.expiration_date1!='' ? "control-label" :"text-muted control-label"}>{translate('expiration_date')}</label></td>
                                    <td>
                                      <div className="form-group" style={form_group}>{quotation?quotation.expiration_date1: null }</div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td><label className={quotation && quotation.pay_tm_name!='' ? "control-label" :"text-muted control-label"}>{translate('payment_term')}</label></td>
                                    <td>
                                      <div className="form-group" style={form_group}>{quotation && quotation.pay_tm_name!='' ?quotation.pay_tm_name : null }</div>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                                  </div>
                              </div> 
                              </form>
                          </div>
                          <ProductTabs module="quotation"/>
                          <div className="tab-content">
                              <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                  <table className="quotation-product-detail table list-table">
                                   <ProductHeader module={'quotation'} item_type={'optional'}/>
                                   {this.render_products_body(items)}
                                  </table>
                                  <div className="row">
                                    <div className="col-xs-12 col-sm-6 col-md-5 col-lg-6 note push-left-20">
                                        <p className="terms-cond">
                                        {quotation && quotation.notes!=null ?quotation.notes.split("\n").map(function(item, i) {
                                            return (<span key ={i}>{item}<br/></span>)
                                            })
                                        :null
                                        }
                                        </p>
                                    </div>
                                  <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3 pull-right quotation-total">
                                  <table>
                                      <tr>
                                          <td>{translate('untaxed_total_amount')} :</td>
                                          <td>
                                              <span>{quotation && quotation.amount_untaxed!=null ? quotation.amount_untaxed.toFixed(2):'0.00'}</span>
                                              <span className="push-left-2">{this.state.currency}</span>
                                          </td>
                                      </tr>
                                      { quotation && quotation.multiple_tax.length > 0  ?
                                          quotation.multiple_tax.map((product, i)=>{
                                              return <tr key={'tax_'+i}>
                                                        <td>{'Tax ('+product.tax_name+') :'}</td>
                                                        <td>
                                                            <span>{product.tax_amount!=null && product.tax_amount != 0 ? product.tax_amount.toFixed(2):'0.00'}</span>
                                                            <span className="push-left-2">{this.state.currency}</span>
                                                        </td>
                                              </tr>
                                        })
                                      :null
                                      }
                                      <tr>
                                          <td>{'Total Tax'} :</td>
                                          <td>
                                              <span>{quotation && quotation.tax_amount!=null && quotation.tax_amount!='' ? quotation.tax_amount.toFixed(2):'0.00'}</span>
                                              <span className="push-left-2">{this.state.currency}</span>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td>{'Total'} :</td>
                                          <td>
                                              <span className="lead">
                                                {quotation && quotation.total_amount!=null ? quotation.total_amount.toFixed(2):'0.00'}
                                                <span className="push-left-2">{this.state.currency}</span>
                                              </span>
                                          </td>
                                      </tr>
                                  </table>
                                  </div>
                                  </div>
                              </div>
                              <div id="field-tab-2" role="tabpanel" className="tab-pane">
                                  <table className="quotation-product-detail suggested-products table list-table">
                                      <ProductHeader module={'quotation'} item_type={'optional'}/>
                                      {this.render_products_body(optional_items)}
                                  </table>
                                <div className="row">
                                 <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3 pull-right quotation-total">
                                  <table>
                                      <tr>
                                          <td>{translate('untaxed_total_amount')} :</td>
                                          <td>
                                              <span>{quotation && quotation.opamount_untaxed!=null ? quotation.opamount_untaxed.toFixed(2):'0.00'}</span>
                                              <span className="push-left-2">{this.state.currency}</span>
                                          </td>
                                      </tr>
                                      { quotation && quotation.op_product_multiple_tax.length > 0  ?
                                          quotation.op_product_multiple_tax.map((product, i)=>{
                                              return <tr key={'tax_'+i}>
                                                        <td>{'Tax ('+product.tax_name+') :'}</td>
                                                        <td>
                                                            <span>{product.tax_amount!=null && product.tax_amount != 0 ? product.tax_amount.toFixed(2):'0.00'}</span>
                                                            <span className="push-left-2">{this.state.currency}</span>
                                                        </td>
                                              </tr>
                                        })
                                      :null
                                      }
                                      <tr>
                                          <td>{'Total Tax'} :</td>
                                          <td><span>{quotation && quotation.optax_amount!=null ?quotation.optax_amount.toFixed(2):'0.00'}</span>
                                              <span className="push-left-2">{this.state.currency}</span>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td>{'Total'} :</td>
                                          <td><span className="lead">
                                              {quotation && quotation.optotal_amount!=null ?quotation.optotal_amount.toFixed(2):'0.00'}
                                              <span className="push-left-2">{this.state.currency}</span></span>
                                          </td>
                                      </tr>
                                  </table>
                                  </div>
                                  </div>
                              </div>
                              <ProductExtraOptionLink url={this.state.url} />
                          </div>
                        </div> {/*<!-- end .panel -->*/}
                    </div>
                    {   this.state.quotationID > 0 ?
                        <Message ref="msgcomponet" props_data={message_props_data}/>
                    :null
                    }
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
module.exports = QuotationView;
