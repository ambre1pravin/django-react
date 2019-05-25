import React from 'react';
import {Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';
import PricingRulesModal from 'crm_react/page/delivery_method/pricing_rules_modal';
import CountryAddModal from 'crm_react/page/delivery_method/country_add_edit_modal';
import Dropdown from 'crm_react/component/Dropdown';

class  DeliveryMethodAdd extends React.Component {

  constructor() 
  {
    super();
    this.state = {
                result            : null,
                fixed_price       : true,
                based_on_rules    : false,
                order_check       : false,
                country_list      : null,
                country_data      : null,
                select_cn_value   :'',
                select_cn_id      :'', 
                json_users     : null

    }

this.serverRequest = $.get('/opportunity/adddata/', function (data) {
      this.setState({
        result:data,
        lead_source       : data.json_lead!==undefined ? data.json_lead : '',

      });
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

    if (provider == 'fixed_price') {

      var Data = {'name':name,'provider':pro,'margin':margin,'description':description, 'fixed_price_value':fixed_price_value, 'order_value':order_value,'order_check':order_check,'hiddenid':hiddenid}
    }
    else if(provider == 'based_on_rules'){

      var Data = {'name':name,'provider':pro,'margin':margin,'description':description, 'hiddenid':hiddenid}
    }
                $.ajax({
                     type: "POST",
                     cache: false,
                     url: base_url + 'delivery/method/save/',
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
    var based = $("#based");
    var based1 = $("#based1");
    var fixed = $("#fixed");
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
    var based = $("#based");
    var based1 = $("#based1");
    var fixed = $("#fixed");
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

  handleDelivery()
  {
      this.setState({term_Modal: 'open'}, ()=>{this.refs.pricing_rules_modal.openModalWithData()})      
  }

  handleClose(){
        $('#PricingRulesModal1').modal('hide');    
        var clear = $("#PricingRulesModal");

        var clear = $("#value");
        clear.val('');
    }

  handleDeleteTr(id){

        $.ajax({
            type: "POST",
            cache: false,
            url: '/delivery/method/deletepricingrules/',
            data: {
              ajax: true,
              id : JSON.stringify(id),
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

  setSelectedCountry(id, input_value){
    this.setState({
            select_value: input_value,
            select_id: id,
    })
}
  
updateCountryInputState(country_name, country_id){

       this.setState({

                    select_cn_value : country_name,
                    select_cn_id    : country_id 
                  
                  });
  }

handleUsersubmit(){

      var Data = $('#PricingRulesModal').serializeArray();
                $.ajax({
                     type: "POST",
                     cache: false,
                     url: '/delivery/method/savepricingrules/',
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
               
                var url =  '/delivery/method/deletepricingrules/';
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



 handleparentTerm(id){
  var term_id = id;
        $.get('/delivery/method/getTermData/'+term_id+'/', function (data) {
          this.setState({
            resultterm: data,
          });
        }.bind(this));
  }

   handleCountryAddEdit(id, input_value){
      this.setState({country_modal_is_open:true}, ()=>{this.refs.country_child.openModalWithData(id, input_value)});
    }


  handleCloseCountryModal(){
     this.setState({country_modal_is_open:false}); 
    }

  render() { 
    let resultterm = this.state.resultterm;
    let result         = this.state.result;
      return (
    <div>  
      {this.state.country_modal_is_open==true?
      <CountryAddModal ref='country_child'
                          updateCountryInputState = {this.updateCountryInputState.bind(this)} 
                          handleClose             = {this.handleCloseCountryModal.bind(this)} />
                        
      :''}

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
                                  <li><Link to={'/delivery/method/list/'} className="breadcumscolor" title={translate('delivery_method')}>{translate('delivery_method')}</Link></li>
                                  <li>{translate('label_new')}</li>
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
                        {/*end top-actions*/}
                       <div className="row crm-stuff">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                          <form id="delivery_form">
                            <div className="panel panel-default panel-tabular">
                                <div className="panel-heading no-padding ">
                                  <div className="row">

                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-left">
                                          <ul className="pull-left panel-tabular__top-actions">
                                              <li>
                                                <h2 className="col-sm-12 quotation-number">{translate('new_delivery_method')} </h2>
                                              </li>
                                          </ul>
                                      </div>
                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                          <ul className="pull-right panel-tabular__top-actions">
                                              <li>
                                                  <a href="#" title="Active"><i className="fa fa-archive" aria-hidden="true"></i>
                                                  <p className="inline-block">{translate('label_active')}</p></a>
                                              </li>
                                          </ul>
                                      </div>
                                  </div>
                                </div>
                                <div className="panel-body edit-form">
                                    <div className="row row__flex">                            
                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                            <table className="detail_table">
                                              <tbody>
                                                <tr>
                                                    <td>
                                                        <label className="text-muted control-label">{translate('label_name')}</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group">
                                                        <input type="text"  name ="name" className="form-control" id="name"  data-id="5" />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <label className="text-muted control-label">{translate('provider')}</label>
                                                    </td>
                                                    <td>
                                                    <input id="provider" name="provider" value="fixed_price" checked={this.state.fixed_price} onClick={this.handleFixed.bind(this)}  type="radio" />
                                                    <label>&nbsp;&nbsp;&nbsp;&nbsp;{translate('fixed_price')}</label>
                                                    <br/>
                                                    <input id="provider" name="provider" value="based_on_rules" checked={this.state.based_on_rules} onClick={this.handleBasedrule.bind(this)}  type="radio" />
                                                    <label>&nbsp;&nbsp;&nbsp;&nbsp;{translate('based_on_rules')}</label>
                                                    </td>
                                                </tr>
                                                  <tr>
                                                    <td>
                                                        <label className="text-muted control-label">{translate('margin')}</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group col-md-6 col-lg-6">
                                                        <input type="text"  name ="margin" id="margin" className="form-control"/>
                                                        <span className="emailalis">%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                  <tr>
                                                    <td>
                                                        <label className="text-muted control-label">{translate('description')}</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group">
                                                        <textarea className="form-control" rows="6" name="description" id="description" placeholder="Description displayed on the eCommerce and on online quotations." >
                                                        </textarea>

                                                        </div>
                                                    </td>
                                                </tr>
                                              </tbody>
                                            </table>
                          <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                            <li role="presentation" data-id="999" className="active"><a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="false">{translate('pricing')} </a></li>
                            <li role="presentation" data-id="420"><a href="#field-tab-2" aria-controls="field-tab-2" role="tab" data-toggle="tab">{translate('destination')} </a></li>
                          </ul>
                          <div className="tab-content">
                              <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                  <div id="fixed">
                                    <div className="col-xs-2 col-lg-2">
                                      <label>Fixed Price</label>
                                    </div>
                                    <div className="form-group col-xs-3 col-sm-3 col-md-3 col-lg-3">
                                      <input type="text"  name ="fixed_price_value"  placeholder="0.00" id="fixed_price_value"/>
                                    </div>
                                        &nbsp;&nbsp;&nbsp;
                                    <label>Free if Order total is more than &nbsp;&nbsp;&nbsp;</label>
                                        <input type="checkbox"  name="order_check" id="order_check" value="1" onClick={this.handleChecked.bind(this)} checked={this.state.order_check}/>
                                        &nbsp;&nbsp;&nbsp;
                                      <input type="text" className="form-group" name ="order_value"  placeholder="0.00" id="order_value"/>
                                  </div>
          
                    <table className="quotation-product-detail table list-table list-order" id="based">
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
                              resultterm.term.map((term , i)=>{
                               return(
                             <tr key={this.props.index} className = "product_row list-order" id={"qpd-trash-" + term.id}>
                             <td><DragHandle /></td>
                             <td><DragHandle /></td>
                             <td><DragHandle /></td>
                             <td>
                             <span className="qpd-trash" onClick={this.handleDeleteTr.bind(this,term.id)}>
                             <i className="fa fa-trash"  aria-hidden="true"></i>
                             </span>
                            </td>
                            </tr>
                               )
                                  }):''
                              }
                        </tbody>
                    </table>
                  <div className="add-new-product" id="based1"> 
                      <a href="javascript:void(0)" className="btn btn-new" onClick= {this.handleDelivery.bind(this)}>{translate('add_an_item')}</a>
                    </div>
                      </div>
                        <div id="field-tab-2" role="tabpanel" className="tab-pane">
                                <p> Filling this form allows you to filter delivery carriers according to the delivery address of your customer.</p>
                              
                            <div className="row">
                               <div className="col-lg-6 col-md-6">
                               <Dropdown
                                                name='Country'
                                                input_value= {this.state.select_cn_value?this.state.select_cn_value:''}
                                                input_id = {this.state.select_cn_id?this.state.select_cn_id:''}
                                                inputtext = 'country'
                                                inputname = 'country'
                                                json_data = {result ? result.json_lead : ''}
                                                modal_id = '#countrymodal'
                                                ref = 'dropdown'
                                                create_edit        = {true} />
                              </div>
                            </div>
                            <div className="row">
                                    <div className="col-lg-2 col-md-2">
                                        <label className="text-muted control-label botom">States</label>
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="form-group">
                                           <input type="text"  name ="state" className="form-control"   data-id="5" />
                                        </div>
                                    </div>
                                </div>
                            <div className="row">
                                    <div className="col-lg-2 col-md-2">
                                        <label className="text-muted control-label botom">ZIP From</label>
                                    </div>
                                    <div className="col-lg-3 col-md-3">
                                        <div className="form-group">
                                           <input type="text"  name ="zipform" className="form-control"   data-id="5" />
                                        </div>
                                    </div>
                                     <div className="col-lg-1 col-md-1">
                                        <label className="text-muted control-label botom">ZIP To</label>
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
                            </div>
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
module.exports = DeliveryMethodAdd;
