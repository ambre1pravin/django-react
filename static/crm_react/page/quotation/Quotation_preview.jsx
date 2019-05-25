import React from 'react';
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';

class  QuotationPreview extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
                result                 : null ,
                items                  : [],
                optional_items         : [],
                preview_id             : 0 ,
                view_id                : this.props.params.Id,
                op_id_list             : [],
                main_contact_id        : '',
                main_contact_email     : '',
                parameter              : [],
                untaxed_amt            : 0 ,
                tax_amt                : 0 ,
                selected_customer_id   : '',
                selected_customer_name : '',
                email                  : '',
                master_id              : this.props.params.Id,
                message_modal_is_open  : false,
                qout_email_modal       : false,
    }
   this.getQuotationById = this.getQuotationById.bind(this)
  }

 
  componentDidMount(){

    var quot_id = this.props.params.Id;
    this.getQuotationById(quot_id);

  }

  getQuotationById(id){



    this.serverRequest = $.get('/quotation/viewdata/'+id+'/', function (data) {
      if(data.success==true){
        this.setState({
            result                 : data,
            qout_status            : data.quotation!==undefined && data.quotation.status!=null ? data.quotation.status : '' ,
            quotation              : data.quotation!==undefined ? data.quotation : null,
            quotationID            : data.quotation.id,
            customer_email         : data.quotation!==undefined && data.quotation.customer_email!=null ? data.quotation.customer_email : '' ,
            items                  : data.quotation.products!==undefined && data.quotation.products.length>0 ? data.quotation.products : [],
            optional_items         : data.quotation.optional_products!==undefined && data.quotation.optional_products.length>0 ? data.quotation.optional_products    : [],
            quot_id                : id,
            order_date             : data.quotation!==undefined && data.quotation.order_date!=null ? data.quotation.order_date : ''  ,
            expiration_date        : data.quotation!==undefined && data.quotation.expiration_date!=null ? data.quotation.expiration_date : ''  ,
            selected_customer_id   : data.quotation!==undefined && data.quotation.customer_id!=null ? data.quotation.customer_id : ''  ,
            selected_customer_name : data.quotation!==undefined && data.quotation.customer_name!=null ? data.quotation.customer_name : '' ,
            profile_image          : data.quotation!==undefined && data.quotation.profile_image!=null ? data.quotation.profile_image : '' ,
            payment_term           : data.quotation!==undefined && data.quotation.payment_term!=null ? data.quotation.payment_term : '' ,
        })
      }
       }.bind(this)).then(function(payment_term){
      var  payment_term_id = payment_term.quotation.payment_term
      this.serverRequest = $.get('/payment/term/getTermData/'+payment_term_id, function (data) {

          this.setState({
              resultterm1   : data,
              resultterm    : data.term!==undefined ? data.term : null,
              del_id        : id,

          })

           
      }.bind(this));
   
    }.bind(this))


  }
   


  render(styles) {

    let result         = this.state.result;
    let quotation      = this.state.quotation;
    let items          = this.state.items;
    let optional_items = this.state.optional_items;
    let profile_image  = this.state.profile_image;
    let resultterm1    = this.state.resultterm1;
    let resultterm     = this.state.resultterm;

    var pathname = window.location.pathname;
    var n = pathname.search("edit");
    
    if(pathname.indexOf('edit') != -1){

        var preview_view = 'edit';
    }
    else{

        var preview_view = 'view';
    }
    return (
    <div>
      <Header/>
      <div id="crm-app" className="clearfix module__quotation module__quotation-create">
        <div className="container-fluid">
        <div className="row">
            <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
               <div className="row top-actions">
                <div className="col-xs-12 col-sm-12">
                      <ul className="breadcrumbs-top">
                            <li><Link to={'/quotation/list/'} className="breadcumscolor" title={translate('label_quotation')}>{translate('label_quotation')}</Link></li>
                           <li><Link to={'/quotation/'+preview_view +'/'+this.props.params.Id} title={'Quotation ' + preview_view}>{quotation?quotation.name:''}</Link></li>
                            <li>Preview</li>
                      </ul>
                </div>
                </div>
                  <div className="row ribbon">
                      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                          <ul className="pull-left">
                                  <li className="active"><a href={'/quotation/pdf_download/'+this.props.params.Id} target="_blank" title={translate('print')}>{translate('print')}</a></li>
                          </ul>
                        </div>
                    </div>
                  
                <div className="panel panel_online panel-default">
                    <div className="panel-heading_online panel-heading">

                        <h3 className="panel-title profile "><img src={BASE_FULL_URL + profile_image } alt="logo" className="img-circle"/> </h3>
                    </div>
                    <div className="panel-body">
                        <h1 className="quatation-name_online">Your Quotation {quotation?quotation.name:''}</h1>
                        <table className="quotation-detail_online">
                            <tr>
                                <td>Customer:</td>
                                <td>{quotation?quotation.customer_name:''}
                                      {'\u00A0'}</td>
                            </tr>
                            <tr>
                                <td>Bill To:</td>
                                <td><i className="fa fa-map-marker"></i>&nbsp;&nbsp;{quotation?quotation.address_street:''}
                                    <br />{quotation?quotation.address_street2:''}
                                    <br />{quotation?quotation.address_city + ' ' + quotation.address_state:''}
                                   <br />{quotation?quotation.address_country + ' ' + quotation.address_zip:''}
                                </td>
                            </tr>
                        </table>
                        <table className="quotation-detail_online">
                            <tr>
                                <td>Your Contact:</td>
                                <td><i className="fa fa-envelope"></i>&nbsp;&nbsp;{quotation?quotation.customer_email:''}
                                <br/><i className="fa fa-phone"></i>&nbsp;&nbsp;{quotation?quotation.mobile:''}
                                      {'\u00A0'}
                                </td>
                            </tr>
                            <tr>
                                <td>Quote Date:</td>
                                <td>
                                 {quotation?quotation.order_date1:''}
                                          {'\u00A0'}</td>
                            </tr>
                            <tr>
                                <td>Expiration Date:</td>
                                <td>
                                 {quotation?quotation.expiration_date1:''}
                                          {'\u00A0'}</td>
                            </tr>
                             <tr>
                                <td>Payment Term :</td>
                                <td>
                                 {quotation?quotation.pay_tm_name:''}
                                          {'\u00A0'}</td>
                            </tr>
                        </table>
                        <div className="clearfix"></div>
                        <h2 className="product-service-head_online">Product and Services</h2>
                        <table className="products_online">
                            <thead>
                                <tr>
                                    <th>Products</th>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit of Measure</th>
                                    <th>Unit Price</th>
                                    <th>Taxes</th>
                                    <th>Discount (%)</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                      {result && items.length>0 ?
                                            items.map((pro, i)=>{
                                                return(
                                                      <tr key = {i} > 

                                                          <td data-th="Product">{pro.product_name}</td>
                                                          <td data-th="Product" className="desc_width">{pro.product_description}</td>
                                                          <td data-th="Order Qty">{pro.product_qty!=''?pro.product_qty:'1'}</td>
                                                          <td data-th="Unit Of Measure">{pro.product_uom_name}</td>
                                                          <td data-th="Unit Price">{pro.unit_price!=''?pro.unit_price : '0.00'}</td>
                                                          <td>{pro.product_tax_name!=''?pro.product_tax_name : ''}</td>
                                                          <td data-th="Discount (%)">{pro.discount!=''?pro.discount : '0.00'}</td>
                                                          <td data-th="Subtotal" className="subtotalright">{pro.price_subtotal!='' ?pro.price_subtotal:''} €</td>
                                                      </tr>
                                                  )
                                            })    
                                          :''                                         
                                        }
                            </tbody>
                        </table>
                        <div className="total-box_online pull-right">
                            &nbsp;&nbsp;   <p><strong>Subtotal:</strong><span>{quotation && quotation.amount_untaxed!=null ?quotation.amount_untaxed:'0.00'} €</span></p>
                            &nbsp;&nbsp;  <p><strong>Taxes:</strong><span>{quotation && quotation.tax_amount!=null ?quotation.tax_amount:'0.00'} €</span></p>
                            &nbsp;&nbsp; <p><strong>Total:</strong><span> {quotation && quotation.total_amount!=null ?quotation.total_amount:'0.00'} €</span></p>
                        </div>
                        <div className="clearfix"></div>
                        <h2 className="product-service-head_online">Optional Products</h2>
                        <table className="products_online">
                            <thead>
                                <tr>
                                    <th>Products</th>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit of Measure</th>
                                    <th>Unit Price</th>
                                    <th>Discount (%)</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                        {result && optional_items.length>0 ?
                                            optional_items.map((pro, i)=>{
                                                return(
                                                      <tr key = {i} >
                                                          <td data-th="Product">{pro.product_name}</td>
                                                          <td data-th="Product" className="desc_width">{pro.product_description}</td>
                                                          <td data-th="Order Qty">{pro.product_qty!=''?pro.product_qty:'1'}</td>
                                                          <td data-th="Unit Of Measure">{pro.product_uom_name}</td>
                                                          <td data-th="Unit Price">{pro.unit_price!=''?pro.unit_price : '0.00'}</td>
                                                          <td data-th="Discount (%)">{pro.discount!=''?pro.discount : '0.00'}</td>
                                                          <td data-th="Subtotal">{pro.price_subtotal!='' ?pro.price_subtotal:''} €</td>
                                                          <td>&nbsp;</td>
                                                      </tr>
                                                  )
                                            })    
                                          :''}
                            </tbody>
                        </table>
                        <div className="total-box_online pull-right">
                            <p><strong>Subtotal:</strong><span>{quotation && quotation.opamount_untaxed!=null ?quotation.opamount_untaxed:'0.00'} €</span></p>
                            <p><strong>Taxes:</strong><span>{quotation && quotation.optax_amount!=null ?quotation.optax_amount:'0.00'} €</span></p>
                            <p><strong>Total:</strong><span> {quotation && quotation.optotal_amount!=null ?quotation.optotal_amount:'0.00'} €</span></p>
                        </div>
                        <div className="clearfix"></div>
                        <div className="text-box_online">
                        {quotation?quotation.notes:''}
                            {'\u00A0'}

                             <div className="pull-right">

                              <p><strong>Payment Term:</strong>&nbsp;&nbsp;&nbsp;<span>{quotation?quotation.pay_tm_name:''}</span></p>
                               
                                        {resultterm ?
                                            resultterm.map((pro, i)=>{
                                                return(
                                                      <tr key = {i} >
                                                          <td data-th="Product">day {pro.number_days!=''?pro.number_days : '0.00'} </td>
                                                          ==
                                                          <td data-th="Product">{pro.value!=''?pro.value : '0.00'}</td>
                                                          
                                                        
                                                          <td>&nbsp;</td>
                                                      </tr>
                                                  )
                                            })    
                                          :''}
                      
                              

                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
 </div>
  
    </div>
    
    );
    
  }
}
module.exports = QuotationPreview;




