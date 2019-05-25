import React from 'react';
import { Link } from 'react-router'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';
import {SortableHandle} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);

class  DeliveryMethodView extends React.Component {
	constructor() 
  {
    super();
    this.state = {
                delivery      : null,
                order_check       : true, 
                order_check1      : false,

    }
    this.getDeliveryById = this.getDeliveryById.bind(this)
    this.handleparentTerm = this.handleparentTerm.bind(this)
  }

  componentDidMount(){
    var del_id = this.props.params.Id;
    this.getDeliveryById(del_id);
    this.handleparentTerm(del_id);
    
  }

  getDeliveryById(id){
    this.serverRequest = $.get('/delivery/method/viewdata/'+id, function (data) {
      if(data.success==true){
        this.setState({
            delivery             : data.delivery!==undefined ? data.delivery : null,
            del_id               : id,
            order_check          : data.delivery.order_check,
        })
      }      

    }.bind(this));
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

 render() {
    let delivery      = this.state.delivery
    let items         = this.state.items
    let optional_item = this.state.optional_item
    let payment      = this.state.payment;
    let resultterm   = this.state.resultterm;
    let order_check   = this.state.order_check

    return (
    <div>  
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
                                  <Link  to={'/delivery/method/add/'} className="btn btn-new" title={translate('create')}>{translate('create')} </Link>
                                  <Link to={'/delivery/method/edit/'+this.props.params.Id}  className="btn btn-new"  title={translate('edit_delivery_method')} >{translate('edit')} </Link>
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
                                                <h2 className="col-sm-12 quotation-number">{translate('delivery_method')}  </h2>
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
                                                  {delivery && delivery.name!='' && delivery.name!='None' ? (delivery.name) : '\u00A0' }
                                                </div>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('provider')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                  {delivery && delivery.provider =='based_on_rules' ? 'Based on Rules': 'Fixed Price'}
                                                </div>
                                              </td>
                                          </tr>
                                           <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('margin')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                  {delivery && delivery.margin!='' && delivery.margin!='None' ? (delivery.margin) : '\u00A0' }
                                                </div>
                                              </td>
                                          </tr>
                                           <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('description')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                  {delivery && delivery.description!='' && delivery.description!='None' ? (delivery.description) : '\u00A0' }
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
                          <div id="field-tab-1" role="tabpanel" className="tab-pane active">

                          {delivery && delivery.provider != 'based_on_rules' ?
                                <div id="fixed">
                                    <div className="col-xs-2 col-lg-2">
                                      <label>Fixed Price</label>
                                    </div>
                                    <div className="form-group col-xs-3 col-sm-3 col-md-3 col-lg-3">
                                     {delivery && delivery.fixed_price_value!='' && delivery.fixed_price_value!='None' ? (delivery.fixed_price_value) : '\u00A0' }
                           
                                    </div>
                                    &nbsp;&nbsp;&nbsp;
                                    
                                 
                                   
                                    <label>Free if Order total is more than &nbsp;&nbsp;&nbsp;</label>
                                    {delivery && delivery.order_check == 1 ?
                                   <span>
                                  <input type="checkbox"  name="order_check" id="order_check" value="1"  checked={this.state.order_check}/>
                                       &nbsp;&nbsp;&nbsp;
                                        {delivery && delivery.order_value!='' && delivery.order_value!='None' ? (delivery.order_value) : '\u00A0' }
                                </span>   
                                :null }

                              {delivery && delivery.order_value =='' && delivery.order_value =='None' ?
                              <span>
                              <input type="checkbox"  name="order_check" id="order_check" value="1"  checked={this.state.order_check1}/> 
                              </span>  
                              :null}
                                </div>
                            : " " }
                      {delivery && delivery.provider == 'based_on_rules' ?
                     <table className="quotation-product-detail table list-table">
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
                             <td><DragHandle /></td>

                             <td> if {rule.condition_varible}  {rule.condition_oprators}  {rule.condition_price}  then fixed price  {rule.sale_price_1}  and  {rule.sale_price_2}  times {rule.sale_price_varible}  Extra</td>
                             <td>{rule.sale_price_1}</td>
                            </tr>
                               )
                                  }):''
                              }
                        </tbody>
                    </table>
                  : " " }
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
module.exports = DeliveryMethodView;
