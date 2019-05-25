import React from 'react';
import { Link, browserHistory } from 'react-router'
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';
import AddPageTopAction from 'crm_react/common/add_page_top_action';

class  QuotTemplateView extends React.Component {
  
	constructor(props) {
    super(props);
    this.state = {
                template      : null,
                items         : [],
                optional_item : [],
                op_id_list : [],
    }
    this.getTemplateById = this.getTemplateById.bind(this)
  }

  componentDidMount(){
    var tmpl_id = this.props.params.Id;
    this.getTemplateById(tmpl_id);
  }

  getTemplateById(id){
    this.serverRequest = $.get('/quot/template/viewdata/'+id, function (data) {
      if(data.success==true){
        this.setState({
            result                 : data,
            template      : data.template!==undefined ? data.template : null,
            items         : data.template.products!==undefined ? data.template.products : [],
            optional_item : data.template.optionals!==undefined ? data.template.optionals : [], 
            tmpl_id       : id,
            currency      : data.template.currency,

        })
                if(data.op_id_list!==undefined && data.op_id_list.length>0 ){

              var id_list = data.op_id_list;
              var id_array      = [];
              for(var i in id_list) {
                if(id_list.hasOwnProperty(i) && !isNaN(+i)) {
                    id_array[+i] = id_list[i].id;
                }
            }

            this.setState({
              op_id_list : id_array
            });


            }
      }      

    }.bind(this));
  }


  render() {
    let template      = this.state.template
    let items         = this.state.items
    let optional_item = this.state.optional_item
    let result         = this.state.result
    return (
    <div>
    
      <Header />
          <div id="crm-app" className="clearfix module__quotation module__quotation-view">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">

                <AddPageTopAction
                    list_page_link ="/quot/template/list/"
                    list_page_label ="Quotation Template"
                    add_page_link="/quot/template/add/"
                    add_page_label ="Add Quotation Template"
                    edit_page_link={'/quot/template/edit/'+this.props.params.Id + '/'}
                    edit_page_label ={ 'Edit Quotation Template'}
                    item_name = {template && template.name!==undefined ?template.name:null}
                    page="view"
                    module="sales-order"
                    save_action ={false}
                />

                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular">
                          <div className="panel-heading no-padding panel-heading-blank">
                          </div>
                          <div className="panel-body edit-form">
                            <form>
                                <div className="row row__flex">
                                    <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 ">
                                        <table className="detail_table">
                                            <tbody>
                                                <tr>
                                                  <td>
                                                      <label className={template && template.name?"control-label":"text-muted control-label"}>{'Customer'}</label>
                                                  </td>
                                                  <td>
                                                        <div className="">{template?template.name:''}</div>
                                                  </td>
                                                </tr>
                                                <tr>
                                                  <td>
                                                      <label className={template && template.expiration_date?"control-label":"text-muted control-label"}>{'Expiration Delay'}</label>
                                                  </td>
                                                  <td>
                                                        <div className="">{template && template.expiration_delay!==undefined ?template.expiration_delay: null } Days</div>
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
                                            <th>{translate('product')}</th>
                                            <th>{translate('description')}</th>
                                            <th>{translate('order_qty')}</th>
                                            <th>{translate('unit_of_measure')}</th>
                                            <th>{translate('unit_price')}</th>
                                            <th>{translate('taxes')}</th>
                                            <th>{translate('discount')} (%)</th>
                                            <th>{translate('subtotal')}</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {template && items.length>0 ?
                                            items.map((pro, i)=>{
                                                return(
                                                      <tr key = {i} >
                                                          <td>&nbsp;</td>
                                                          <td data-th="Product">{pro.product_name}</td>
                                                          <td data-th="Description">{pro.product_description}</td>
                                                          <td data-th="Order Qty">{pro.product_qty!=''?pro.product_qty:'1'}</td>
                                                          <td data-th="Unit Of Measure">{pro.product_uom_name}</td>
                                                          <td data-th="Unit Price">{pro.unit_price!=''?pro.unit_price : '0.00'}</td>
                                                          <td>{pro.product_tax_name!=''?pro.product_tax_name : ''}</td>
                                                          <td data-th="Discount (%)">{pro.discount!=''?pro.discount : '0.00'}</td>
                                                          <td data-th="Subtotal">{pro.price_subtotal!='' ?pro.price_subtotal:''}</td>
                                                      </tr>
                                                  )
                                            })    
                                          :null
                                        }

                                      </tbody>
                                  </table>
                                  <div className="row">
                                  
                                      <div className="col-xs-12 col-sm-6 col-md-5 col-lg-6 note">
                                          <p className="terms-cond">
                                          {template && template.terms_and_codition!=null ?template.terms_and_codition.split("\n").map(function(item, i) {
                                              return (
                                                  <span key ={i}>
                                                    {item}
                                                    <br/>
                                                  </span>
                                                  )
                                              })
                                          :null
                                          }
                                          </p>
                                      </div>
                                      
                                      <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3 pull-right quotation-total">
                                          <table>
                                              <tr>
                                                  <td>{translate('untaxed_total_amount')} :</td>
                                                  <td>{template && template.amount_untaxed!=null ?template.amount_untaxed.toFixed(2):'0.00'} {this.state.currency}</td>
                                              </tr>
                                              { template && template.multiple_tax.length > 0  ?
                                                  template.multiple_tax.map((product, i)=>{
                                                      return <tr key={'tax_'+i}>
                                                                <td>{'Tax ('+product.tax_name+') :'}</td>
                                                                <td>{product.tax_amount!=null && product.tax_amount != 0 ?product.tax_amount.toFixed(2):'0.00'} {this.state.currency} </td>
                                                            </tr>
                                                })
                                              :null
                                              }
                                              <tr>
                                                  <td>{'Total Tax'} :</td>
                                                  <td>{template && template.tax_amount!=null ?template.tax_amount.toFixed(2):'0.00'} {this.state.currency}</td>
                                              </tr>
                                              <tr>
                                                  <td>{'Total'} :</td>
                                                  <td><span className="lead">
                                                  {template && template.total_amount!=null ?template.total_amount.toFixed(2):'0.00'} {this.state.currency}</span></td>
                                              </tr>
                                          </table>
                                      </div>
                                  </div>
                              </div>
                          </div>
                        </div> {/*<!-- end .panel -->*/}
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
module.exports = QuotTemplateView;
