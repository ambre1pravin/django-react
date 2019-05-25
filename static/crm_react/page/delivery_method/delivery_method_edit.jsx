import React from 'react';
import { Link, browserHistory } from 'react-router'
import 'react-date-picker/index.css'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import PricingRulesModal from 'crm_react/page/delivery_method/pricing_rules_modal';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';
import {SortableHandle} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);


class  DeliveryMethodEdit extends React.Component {
	constructor() 
  {
    super();
    this.state = {
                result         : null ,
                order_check       : false,
 
    }
    
    this.getDeliveryById   = this.getDeliveryById.bind(this)
    this.handleChange      = this.handleChange.bind(this)
    this.handleparentTerm  = this.handleparentTerm.bind(this)
  }

  componentDidMount(){

    var delv_id = this.props.params.Id;

    this.setState({edit_id:delv_id})
    this.getDeliveryById(delv_id);
    this.handleparentTerm(delv_id);

  }

  getDeliveryById(id){
    
    this.serverRequest = $.get('/delivery/method/editdata/'+id, function (data) {
      if(data.success==true){
         this.setState({
            result                : data,
            delivery              : data.delivery !==undefined ? data.delivery : null,
            name                  : data.delivery.name !==undefined ? data.delivery.name: null,
            order_check           : data.delivery.order_check,
            order_value           : data.delivery.order_value,
            provider              : data.delivery.provider,
            description           : data.delivery.description,
            margin                : data.delivery.margin,
            fixed_price_value     : data.delivery.fixed_price_value,
            fixed_price           : data.delivery.provider == "fixed_price" ? true: false,
            based_on_rules        : data.delivery.provider == "based_on_rules" ? true: false,

          });
        }
    }.bind(this)).then(function(result) {

      var provider = result.delivery.provider; 
      if (provider == 'based_on_rules') {
        $('#fixed_edit').hide();
        $('#based_edit').show();
      }
      else if (provider == 'fixed_price') {
         $('#fixed_edit').show();
         $('#based_edit').hide();
         $('#based1_edit').hide();
      }

      var order_check = result.delivery.order_check;
      if (order_check == 1) {
        $('#order_value').show();
      }
      else {
         $('#order_value').hide();

      }

    }.bind(this));

  }

handleClose(){
        $('#PricingRulesModal1').modal('hide');    
        var clear = $("#PricingRulesModal");

        var clear = $("#value");
        clear.val('');
    }

handleparentTerm(id){
  var term_id = id;
        $.get('/delivery/method/getpricingData/'+term_id+'/', function (data) {
          if(data.success==true){
          this.setState({
            resultterm: data,
          });
        }
        }.bind(this));
  }


  handleSubmit(redirect){

    
    let name                 = $('#name').val();
    let fixed_price_value    = $('#fixed_price_value').val();
    let order_value          = $('#order_value').val();
    let margin               = $('#margin').val();
    let description          = $('#description').val();
    var hiddenid             = $('input[name=hiddenid]').serializeArray();

    var provider = $('#provider:checked').map(function(){
        return $(this).val();
    }).get();



     $('#order_check').on('change', function () {
      this.value = this.checked ? 1 : 0;
       }).change();


    let order_check                 = $('#order_check').val();
    var pro = provider.toString();
    var id =  this.props.params.Id;
    if (provider == 'fixed_price') {

      var Data = {'id':id,'name':name,'provider':pro,'margin':margin,'description':description, 'fixed_price_value':fixed_price_value, 'order_value':order_value,'order_check':order_check,'hiddenid':hiddenid}
    }
    else if(provider == 'based_on_rules'){

      var Data = {'id':id,'name':name,'provider':pro,'margin':margin,'description':description, 'hiddenid':hiddenid}
    }
                $.ajax({
                     type: "POST",
                     cache: false,
                     url: base_url + 'delivery/method/update/',
                  data: {
                     ajax: true,
                     fields: JSON.stringify(Data),
                     
                  },
                  beforeSend: function () {
                  },
                  success: function (data) {
                     if(data.success === true){
              if(redirect == true){
             browserHistory.push(base_url+"delivery/method/list/");
             }
          }
                  }.bind(this)
          });
    }

 handleFixed(event){

    var based = $("#based_edit");
    var based1 = $("#based1_edit");
    var fixed = $("#fixed_edit");
    var clear = $("#value");
         if(event.target.checked){
       
            based.hide();
            based1.hide();
            fixed.show();
            clear.val('');
            this.setState({fixed_price: true})
            this.setState({based_on_rules: false})
         }
    }

  handleBasedrule(event){
    var based = $("#based_edit");
    var based1 = $("#based1_edit");
    var fixed = $("#fixed_edit");
    var clear = $("#value");
         if(event.target.checked){
         
            based.show();
            based1.show();
            fixed.hide();
            clear.val('');
            this.setState({based_on_rules: true})
            this.setState({fixed_price: false})
         }
    }

handleChecked(event){
  var order_value = $("#order_value");
           if(event.target.checked){
            order_value.show();
            this.setState({order_check: true})
         }
         else{
            order_value.hide();
            this.setState({order_check: false})
         }
}

handleDeleteTr(id){

        $.ajax({
            type: "POST",
            cache: false,
            url: base_url + 'delivery/method/deletepricingrules/',
            data: {
              ajax: true,
              ids : JSON.stringify(id),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                $('#qpd-trash-'+id).remove();
              }
         
            }.bind(this)
        });

  }

 handleUsersubmit(){

      var Data = $('#PricingRulesModal').serializeArray();
                
                $.ajax({
                     type: "POST",
                     cache: false,
                     url: base_url + 'delivery/method/savepricingrules/',
                  data: {
                     ajax: true,
                     fields: JSON.stringify(Data),
                     
                  },
                  beforeSend: function () {
                  },
                  success: function (data) {
                     if(data.success === true){
                           this.setState({
                        id  : data.id,
                  
                    })
                var id = data.id;
                var condition_varible;
                if (data.condition_varible == "weight") {
                    condition_varible = "Weight";
                } else if (data.condition_varible == "volume") {
                    condition_varible = "Volume";
                } else if (data.condition_varible == "wv") {
                   condition_varible = "Weight * Volume";
                } else if (data.condition_varible == "price") {
                   condition_varible = "Price";
                } else if (data.condition_varible == "quantity") {
                   condition_varible = "Quantity";
                } 
              

                var condition_price;

                if (data.condition_price == "" && data.condition_price == 0) {
                    condition_price = 0.00;
                }else{
                    condition_price = data.condition_price;
                }

                var sale_price_1;

                if (data.sale_price_1 == "" && data.sale_price_1 == 0) {
                    sale_price_1 = 0.00;
                }else{
                    sale_price_1 = data.sale_price_1;
                }


                var sale_price_2;

                if (data.sale_price_2 == "" && data.sale_price_2 == 0) {
                    sale_price_2 = 0.00;
                }else{
                    sale_price_2 = data.sale_price_2;
                }

                var condition_oprators     = data.condition_oprators;
                
                var sale_price_varible;
                if (data.sale_price_varible == "weight") {
                    sale_price_varible = "Weight";
                } else if (data.sale_price_varible == "volume") {
                    sale_price_varible = "Volume";
                } else if (data.sale_price_varible == "wv") {
                   sale_price_varible = "Weight * Volume";
                } else if (data.sale_price_varible == "price") {
                   sale_price_varible = "Price";
                } else if (data.sale_price_varible == "quantity") {
                   sale_price_varible = "Quantity";
                } 
               
                var url = base_url + 'delivery/method/deletepricingrules/';
                var sale_price = sale_price_1;
                var value = 'if '+ condition_varible +'  '+ condition_oprators +' '+ condition_price +' then fixed price '+ sale_price_1 +' and '+ sale_price_2 +' times '+ sale_price_varible +' Extra';
                var tdt= '<i class="fa fa-arrows-alt" id="deletetr_'+id+'" aria-hidden="true"></i>';
                var remove = '<span className="qpd-trash" onClick="loaddeleteload(\'' + id + '\',\'' + url + '\')"><i class="fa fa-trash"  aria-hidden="true"></i></span>';
                    
                    var $tr = $('<tr/>');
                    $tr.prepend('<input type="hidden" id="hiddenid" name="hiddenid" value= '+ id +'  />');
                    $tr.prepend($('<td/>').html(tdt));
                    $tr.append($('<td/>').html(value));
                    $tr.append($('<td/>').html(sale_price));
                    $tr.append($('<td/>').html(remove));
                    
                    $('table.list-order tr:last').after($tr);

                    this.handleClose()
                  }
              }.bind(this)
        });
  }
  handleDelivery()
  {
      this.setState({term_Modal: 'open'}, ()=>{this.refs.pricing_rules_modal.openModalWithData()})      
  }

  handleChange(event) {
    
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
            [name]: value,
        });

    }

  render() {
    let resultterm          = this.state.resultterm
    let delivery       = this.state.delivery
    let order_check   = this.state.order_check
    let provider = this.state.provider


    return (
      <div>  
       {
       <PricingRulesModal  ref = "pricing_rules_modal"  handleUsersubmit = {this.handleUsersubmit.bind(this)}/>
     }
      <Header />
      <div id="crm-app" className="clearfix module__product module__product-create">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                        <div className="row top-actions">
                            <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                                <li><Link to={'/delivery/method/list/'} className="breadcumscolor" title={translate('delivery_method')}>{translate('delivery_method')} </Link></li>
                                <li>{delivery?delivery.name:''}</li>
                              </ul>
                                <button className="btn btn-primary" onClick = {this.handleSubmit.bind(this,true)}>{translate('save_all')}</button>
                                <Link to={'/delivery/method/list/'}  className="btn btn-primary btn-discard btn-transparent" >{translate('discard')}</Link>
                                 
                            </div>
                            <div className="col-xs-12 col-sm-12 pull-right text-right">
                                <ul className="list-inline inline-block top-actions-pagination">
                                    <li><a href="#"><i className="fa fa-chevron-left"></i></a></li>
                                    <li><a href="#"><i className="fa fa-chevron-right"></i></a></li>
                                </ul>
                            </div>
                        </div>

                 <div className="row crm-stuff">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                          <form id="payment_edit_form">
                            <div className="panel panel-default panel-tabular">
                                <div className="panel-heading no-padding ">
                                  <div className="row">

                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-left">
                                          <ul className="pull-left panel-tabular__top-actions">
                                              <li>
                                                <h2 className="col-sm-12 quotation-number">{translate('edit_delivery_method')}  </h2>
                                              </li>
                                          </ul>
                                      </div>
                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                          <ul className="pull-right panel-tabular__top-actions">
                                              <li>
                                                  <a href="#" title={translate('label_active')}><i className="fa fa-archive" aria-hidden="true"></i>
                                                  <p className="inline-block">{translate('label_active')}</p></a>
                                              </li>
                                          </ul>
                                      </div>
                                  </div>
                                </div>
                                <div className="panel-body edit-form">
                                    <div className="row row__flex">                            
                                        <div className="col-xs-12 col-sm-12">
                                            <table className="detail_table">
                                              <tbody>
                                              <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('name')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                 <input type="text"  name ="name" value={this.state.name} onChange={this.handleChange} className="form-control"  id="name" data-id="5"  required/>
                                      
                                                </div>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('provider')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                
                                                <input id="provider" name="provider" value="fixed_price" checked={this.state.fixed_price} onClick={this.handleFixed.bind(this)}  type="radio" />
                                                  <label>&nbsp;&nbsp;&nbsp;&nbsp;{translate('fixed_price')}</label>
                                                  <br/>
                                                <input id="provider" name="provider" value="based_on_rules" checked={this.state.based_on_rules} onClick={this.handleBasedrule.bind(this)}  type="radio" />
                                                  <label>&nbsp;&nbsp;&nbsp;&nbsp;{translate('based_on_rules')}</label>
                                              
                                                </div>
                                              </td>
                                          </tr>
                                           <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('margin')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                    <input type="text"  name ="margin" value={this.state.margin} onChange={this.handleChange} id="margin" className="form-control"/>
                                                    <span className="emailalis">%</span>
                                                </div>
                                              </td>
                                          </tr>
                                           <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('description')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                
                                          <textarea className="form-control" rows="6" name="description" value={this.state.description}  onChange={this.handleChange} id="description" placeholder="Description displayed on the eCommerce and on online quotations." >
                                                        </textarea>
                                                </div>
                                              </td>
                                          </tr>
                                          
                                              </tbody>
                                            </table>

                                            <br/>
                            
                            <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                            <li role="presentation" data-id="999" className="active"><a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="false">{translate('pricing')} </a></li>
                            <li role="presentation" data-id="420"><a href="#field-tab-2" aria-controls="field-tab-2" role="tab" data-toggle="tab">{translate('destination')} </a></li>
                          </ul>
                          <div className="tab-content">
                          <div id="field-tab-1" role="tabpanel" className="tab-pane active" >

                                <div id="fixed_edit" >
                                    <div className="col-xs-2 col-lg-2">
                                      <label>Fixed Price</label>
                                    </div>
                                    <div className="form-group col-xs-3 col-sm-3 col-md-3 col-lg-3">
                                        <input type="text"  name ="fixed_price_value" value = {this.state.fixed_price_value} id="fixed_price_value"/>
                                    </div>
                                    &nbsp;&nbsp;&nbsp;                               
                                    <label>Free if Order total is more than &nbsp;&nbsp;&nbsp;</label>
                                   
                                   <span>
                                  <input type="checkbox"  name="order_check" id="order_check" value="1"  onClick={this.handleChecked.bind(this)} checked={this.state.order_check}/>
                                       &nbsp;&nbsp;&nbsp;
                                <input type="text" className="form-group" name ="order_value" value = {this.state.order_value}  placeholder="0.00" id="order_value"/>
                              </span>   
                                </div>
                        
                   
                     <table className="quotation-product-detail table list-table list-order"  id="based_edit">
                                <thead>
                                  <tr>
                                    <th>&nbsp;</th>
                                    <th>{translate('name')}</th>
                                    <th>{translate('sale_price')}</th>
                                    <th>&nbsp;</th>
                                  </tr>
                                </thead>
                        <tbody>
                            {resultterm?
                              resultterm.rule.map((rule,i)=>{
                              return(
                             <tr className = "product_row list-order" id={"qpd-trash-" + rule.id}>
                             <td><input type="hidden" id="hiddenid" name="hiddenid" value={rule.id}  /><DragHandle /></td>
                             <td> if {rule.condition_varible}  {rule.condition_oprators}  {rule.condition_price}  then fixed price  {rule.sale_price_1}  and  {rule.sale_price_2}  times {rule.sale_price_varible}  Extra</td>
                             <td>{rule.sale_price_1}</td>
                              <td>
                             <span className="qpd-trash" onClick={this.handleDeleteTr.bind(this,rule.id)}>
                             <i className="fa fa-trash"  aria-hidden="true"></i>
                             </span>
                            </td>
                            </tr>
                              )
                                  }):''
                              }
                        </tbody>
                    </table>
                
                  <div className="add-new-product" id="based1_edit"> 
                      <a href="javascript:void(0)" className="btn btn-new" onClick= {this.handleDelivery.bind(this)}>{translate('add_an_item')}</a>
                  </div>
                      </div>
                      <div id="field-tab-2" role="tabpanel" className="tab-pane">
                                <p> Filling this form allows you to filter delivery carriers according to the delivery address of your customer.</p>
                              
                            <div className="row">
                                    <div className="col-lg-3 col-md-3">
                                        <label className="text-muted control-label">Countries</label>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="form-group">
                                           <input type="text"  name ="country" className="form-control"   data-id="5" />
                                        </div>
                                    </div>
                            </div>
                            <div className="row">
                                    <div className="col-lg-3 col-md-3">
                                        <label className="text-muted control-label">States</label>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="form-group">
                                           <input type="text"  name ="state" className="form-control"   data-id="5" />
                                        </div>
                                    </div>
                            </div>
                            <div className="row">
                                    <div className="col-lg-3 col-md-3">
                                        <label className="text-muted control-label">ZIP From</label>
                                    </div>
                                    <div className="col-lg-3 col-md-3">
                                        <div className="form-group">
                                           <input type="text"  name ="zipform" className="form-control"   data-id="5" />
                                        </div>
                                    </div>
                                     <div className="col-lg-3 col-md-3">
                                        <label className="text-muted control-label">ZIP To</label>
                                    </div>
                                    <div className="col-lg-3 col-md-3">
                                        <div className="form-group">
                                           <input type="text"  name ="zipto" className="form-control"   data-id="5" />
                                        </div>
                                    </div>
                            </div>
                      </div>
                        
                  </div>
                            
                            </div>
                             </div>
                        </div>
                            </div>  {/*end .panel*/}
                          </form>
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
module.exports = DeliveryMethodEdit;
