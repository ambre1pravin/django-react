import React from 'react';
import {  Link, browserHistory } from 'react-router'
import state, {ROLES, ID} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import { getCookie} from 'crm_react/common/helper';
import RibbonRowSalesQuotationInvoice from 'crm_react/page/sales_order/ribbon-row-sales-quotation-invoice';
import Message from 'crm_react/component/message';


class  SalersOrderView extends React.Component {
  constructor(props){
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
                email:'',
                master_id:this.props.params.Id,
                view_pagging    : false,
                action_checkbox : false,
                processing : false,
                url        :null,
                qout_status:null,
                quotationID:null
    };

      var store = localStorage.getItem('searchsale');
       if (store!== null && store!=''){
        localStorage.setItem('searchsales',store);
       }
       else{
         localStorage.setItem('searchsales',[]);
       }

       this.serverRequest = $.get('/general/get_message/'+this.state.master_id+'/', function (data) {
          this.setState({messages:data.result});
       }.bind(this));

        this.getQuotationById = this.getQuotationById.bind(this);
        localStorage.setItem('setpage1','salers');
  }

  componentDidMount(){
    var store = localStorage.getItem('searchsale');
    if (store!== null && store!=''){
        localStorage.setItem('searchsales',store);
       }
    else{
         localStorage.setItem('searchsales',[]);
      }
    var quot_id = this.props.params.Id;
    this.getQuotationById(quot_id);
    this.Contactlist()
  }

  Contactlist(){
      this.serverRequest = $.get('/contact/customeremail/', function (data) {
      if(data.success==true){
        this.setState({
            result_contact                : data,
        });
      }
      }.bind(this));
  }

  getQuotationById(id){
      this.serverRequest = $.get('/sales/order/adddata/', function (data) {
      this.setState({
          taxes_list    : data.json_taxes!==undefined ? data.json_taxes : [],
          select_ls_value : data.json_taxes!==undefined && data.json_taxes!='' ? data.json_taxes : '' ,
          });
    }.bind(this));

    this.get_total_invoice_by_id();

    this.serverRequest = $.get('/quotation/viewdata/'+id+'/', function (data) {
      if(data.success==true){
        this.setState({
            result                 : data,
            qout_status            : data.quotation!==undefined && data.quotation.status!=null ? data.quotation.status : '' ,
            quotation              : data.quotation!==undefined ? data.quotation : null,
            quotationID            : data.quotation.id,
            url                    : data.quotation.url,
            name                   : data.quotation.name,
            userId                 : data.quotation.user_id,
            total_amount           : data.quotation.total_amount,
            total_amount_untaxed   : data.quotation.amount_untaxed,
            tax_amount             : data.quotation.tax_amount,
            currency               : data.quotation.currency,
            items                  : data.quotation.products!==undefined && data.quotation.products.length>0 ? data.quotation.products : [],
            optional_items         : data.quotation.optional_products!==undefined && data.quotation.optional_products.length>0 ? data.quotation.optional_products    : [],
            quot_id                : id,
            selected_customer_id   : data.quotation!==undefined && data.quotation.customer_id!=null ? data.quotation.customer_id : ''  ,
            selected_customer_name : data.quotation!==undefined && data.quotation.customer_name!=null ? data.quotation.customer_name : '' ,
            Invoicing              : data.Invoicing,
            total_Invoicing_data   : data.total_Invoicing_data,
            invoice_status         : data.Invoicing.invoice_status,
            text_invoice           : data.text_invoice,
            text_invoice12         : data.text_invoice12,
            payment_term           : data.quotation!==undefined && data.quotation.payment_term_id!=null ? data.quotation.payment_term_id : '' ,


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

    get_total_invoice_by_id(){
        this.serverRequest = $.get('/customer/invoice/customerinvoicetotal/'+this.props.params.Id+ '/', function (data) {
            console.log("total invoice count", data.total_Invoicing_data)
            this.setState({
                customer_invoice_total_amount    : data.total_amount!==undefined ? data.total_amount : [],
                customer_invoice_tax_amount      : data.tax_amount!==undefined ? data.tax_amount : [],
                total_Invoicing_data   : data.total_Invoicing_data?data.total_Invoicing_data:"nnnnn",
            });
        }.bind(this));
    }


  set_quotation_status(qout_status){
      this.setState({qout_status: qout_status});
  }

  handleView(preview_id){
    var payment_term = this.state.payment_term;
    var preview_type = 'view';
    browserHistory.push("/quotation/preview/"+preview_id+"/"+preview_type);
  }

  handleViewPrint(preview_id)
  {

    browserHistory.push("/sales-pdf/pdf_download/"+preview_id);
  }




  render() {
    
    let result         = this.state.result;
    let quotation      = this.state.quotation;
    let items          = this.state.items;
    let userId         = this.state.userId;
    let optional_items = this.state.optional_items;
    let Invoicing      = this.state.Invoicing;
    let text_invoice    = this.state.text_invoice;
    let text_invoice12    = this.state.text_invoice12;

    var message_props_data = {
       'email':this.state.email,
       'master_id':this.state.quotationID,
       'module_id':3,
       'module_name':'sales-order',
    };
    return (
    <div>
      <Header />
        <div id="crm-app" className="clearfix module__quotation module__quotation-view">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                <AddPageTopAction
                    list_page_link ="/sales/order/list/"
                    list_page_label ="Sales Order"
                    add_page_link="/sales/order/add/"
                    add_page_label ="Add Sales Order"
                    edit_page_link={'/sales/order/edit/'+this.props.params.Id + '/'}
                    edit_page_label ={ translate('edit_salers')}
                    item_name = {quotation && quotation.name!==undefined ?quotation.name:null}
                    page="view"
                    module="sales-order"
                    save_action ={false}
                />
                <RibbonRowSalesQuotationInvoice
                    module ="sales-order"
                    q_id = {this.props.params.Id}
                    quotation_status ={this.state.qout_status}
                    preview_url={'/htm/'+this.state.url+'/sales_order/'}
                    print_url={'/generate_pdf/'+this.state.url+'/sales_order/'}
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
                                  <h2 className="col-sm-12 quotation-number">{quotation && quotation.name!==undefined ?quotation.name  : '' }</h2>
                              </div>
                              <div className="row row__flex">                            
                                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                      <table className="detail_table">
                                        <tbody>
                                          <tr>
                                              <td>
                                                  <label className={quotation && quotation.customer_name?"control-label":"text-muted control-label"}>{'Customer'}</label>
                                              </td>
                                              <td>
                                                <div className="">{quotation?quotation.customer_name:''}</div>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td>
                                                  <label className={quotation && quotation.qout_tmpl_name?"control-label":"text-muted control-label"}>{translate('quotation_template')}</label>
                                              </td>
                                              <td>
                                                  <div className="">{quotation && quotation.qout_tmpl_name!==undefined ?quotation.qout_tmpl_name: null }</div>
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
                                      <label className={quotation && quotation.expiration_date1?"control-label":"text-muted control-label"}>{translate('expiration_date')}</label>
                                    </td>
                                    <td>
                                      <div className="">
                                         {quotation?quotation.expiration_date1:null }
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                        <label className={quotation && quotation.pay_tm_name!==undefined && quotation.pay_tm_name?"control-label":"text-muted control-label"}>{translate('payment_term')}</label>
                                    </td>
                                    <td>
                                      <div className="">
                                        {quotation && quotation.pay_tm_name!==undefined ?quotation.pay_tm_name:null }
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
                              <li role="presentation" className = "active" >
                                  <a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="false">
                                      {translate('order_lines')}
                                  </a>
                              </li>
                          </ul>

                          <div className="tab-content">
                              <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                  <table className="quotation-product-detail table list-table">
                                      <thead>
                                          <tr>
                                            <th>&nbsp;</th>
                                            <th className="desc_width">{translate('product')}</th>
                                            <th className="desc_width">{translate('description')}</th>
                                            <th className="fieldwith">{translate('order_qty')}</th>
                                            <th className="fieldwith">{translate('unit_of_measure')}</th>
                                            <th className="fieldwith">{translate('unit_price')}</th>
                                            <th className="fieldwith">{translate('taxes')}</th>
                                            <th className="fieldwith">{translate('discount')} (%)</th>
                                            <th className="fieldwith subtotalright">{translate('subtotal')}</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                        {result && items.length>0 ?
                                            items.map((pro, i)=>{
                                                return(
                                                      <tr key = {i} >
                                                          <td>&nbsp;</td>
                                                          <td className="desc_width">{pro.product_name}</td>
                                                          <td className="desc_width">{pro.product_description}</td>
                                                          <td className="fieldwith">{pro.product_qty!=''?pro.product_qty:'1'}</td>
                                                          <td className="fieldwith">{pro.product_uom_name}</td>
                                                          <td className="fieldwith">{pro.unit_price!=''?pro.unit_price : '0.00'} {this.state.currency}</td>
                                                          <td className="fieldwith">{pro.product_tax_name!=''?pro.product_tax_name : ''}</td>
                                                          <td className="fieldwith">{pro.discount!=''?pro.discount : '0.00'}</td>
                                                          <td className="fieldwith subtotalright">{pro.price_subtotal!='' ?pro.price_subtotal:''} {this.state.currency}</td>
                                                      </tr>
                                                  )
                                            })    
                                          :null
                                        }
                                      </tbody>
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
                                                  <td>{quotation && quotation.amount_untaxed!=null ?quotation.amount_untaxed.toFixed(2):'0.00'} {this.state.currency}</td>
                                              </tr>
                                              { quotation && quotation.multiple_tax.length > 0  ?
                                                  quotation.multiple_tax.map((product, i)=>{
                                                      return <tr key={'tax_'+i}>
                                                                <td>{'Tax ('+product.tax_name+') :'}</td>
                                                                <td>{product.tax_amount!=null && product.tax_amount != 0 ?product.tax_amount.toFixed(2):'0.00'} {this.state.currency} </td>
                                                            </tr>
                                                })
                                              :null
                                              }
                                              <tr>
                                                  <td>{'Total Tax'} :</td>
                                                  <td>{quotation && quotation.tax_amount!=null ?quotation.tax_amount.toFixed(2):'0.00'} {this.state.currency}</td>
                                              </tr>
                                              <tr>
                                                  <td>{'Total'} :</td>
                                                  <td><span className="lead">
                                                  {quotation && quotation.total_amount!=null ?quotation.total_amount.toFixed(2):'0.00'} {this.state.currency}</span></td>
                                              </tr>
                                          </table>
                                      </div>
                                  </div>
                              </div>
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
        <LoadingOverlay processing={this.state.processing}/>
    </div>
    );
  }
}
module.exports = SalersOrderView;
