import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { form_group } from 'crm_react/common/helper';


class  ProductView extends React.Component {
    constructor() {
        super();
        this.state = {
            result: null,
            op_id_list: [],
            currency:null,
            total_engage_cost:0.00,
            select_sp_value:null,
            select_sp_id:null,
        }
        var store = localStorage.getItem('searchproduct');
        if (store !== null && store != '') {
            localStorage.setItem('searchproducts', store);
        }else {
            localStorage.setItem('searchproducts', []);
        }
        this.getProductById = this.getProductById.bind(this);
    }

    componentDidMount() {
        var store = localStorage.getItem('searchproduct');
        if (store !== null && store != '') {
            localStorage.setItem('searchproducts', store);
        }else {
            localStorage.setItem('searchproducts', []);
        }
        var pro_id = this.props.params.Id;
        this.getProductById(pro_id);
    }

    handleNextPrev(Action, current_id) {
        var id_array = this.state.op_id_list;
        if (id_array.length == 0)
            return false
        var current_index = '0';
        var next_op_id = '';
        var arr_length = id_array.length;
        current_index = id_array.indexOf(current_id);
        if (Action == 'pre') {
            if (current_index == 0) {
                next_op_id = id_array[arr_length - 1];
            }else {
                next_op_id = id_array[current_index - 1];
            }
        }
        if (Action == 'next') {
            if (current_index == arr_length - 1) {
                next_op_id = id_array['0'];
            }else {
                next_op_id = id_array[current_index + 1];
            }
        }
        if (next_op_id !== undefined && next_op_id != '' && next_op_id != 0) {
            browserHistory.push(base_url + "product/view/" + next_op_id);
            this.getProductById(next_op_id);
        }
    }


    getProductById(id) {
        this.serverRequest = $.get('/product/viewdata/' + id + "/", function (data) {
            if (data.success == true) {
                this.setState({
                    result: data,
                    pro_id: id,
                    currency: data.currency,
                    total_engage_cost:data.total_engage_cost,
                    select_sp_value: data.product.sales_person_name !== undefined ? data.product.sales_person_name : '',
                    select_sp_id: data.product.sales_person_id !== undefined && data.product.sales_person_id != '' ? data.product.sales_person_id : '',
                    select_st_value: data.product.sales_channel_name !== undefined && data.product.sales_channel_name != '' ? data.product.sales_channel_name : '',
                    select_st_id: data.product.sales_channel_id !== undefined && data.product.sales_channel_id != '' ? data.product.sales_channel_id : '',
                })
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
        }.bind(this));
    }

  render() {
    let result = this.state.result
    let product = result ? result.product :''  
    let pro_id  = this.state.pro_id
    return (
    <div>
      <Header />

        <div id="crm-app" className="clearfix module__product module__product">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                  {/*<div className="row top-actions">
                   <div className="col-xs-12 col-sm-12 pull-right text-right">
                         <ul className="list-inline inline-block top-actions-pagination">
                          <li><a onClick = {()=>this.handleNextPrev('pre', this.state.pro_id)} href="javascript:void(0)" ><i className="fa fa-chevron-left"></i></a></li>
                          <li><a onClick = {()=>this.handleNextPrev('next', this.state.pro_id)} href="javascript:void(0)" ><i className="fa fa-chevron-right"></i></a></li>
                        </ul>
                    </div>
                </div>*/}
                <AddPageTopAction
                    list_page_link ={"/product/list/"}
                    list_page_label ="Product"
                    add_page_link="/product/add/"
                    add_page_label ="Add Product"
                    edit_page_link={'/product/edit/'+pro_id + '/'}
                    edit_page_label ={ translate('edit_product')}
                    item_name = {result && product.name!==undefined?product.name:null}
                    page="view"
                    module="product"
                    save_action ={false}
                />
                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular">
                            <div className="panel-heading no-padding">
                              <div className="row">
                                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                    <ul className="pull-right panel-tabular__top-actions">
                                        <li>
                                            <a href="#" title="Active"><i className="fa fa-archive" aria-hidden="true"></i>
                                              <p className="inline-block">{translate('label_active')}</p>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#" title="Check Sales">
                                              <p className="inline-block"><span>{this.state.total_engage_cost+' '+ this.state.currency}</span>{translate('label_sales')}</p>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                              </div>
                            </div>
                            <div className="panel-body edit-form">
                                <form action="" method="post">
                                  <div className="row">
                                      <div className="col-xs-8 col-sm-10 col-md-8 col-lg-8">
                                      <h2 className="product-name">{result && product.name!==undefined?product.name:''}</h2>
                                      <ul className="product-options">
                                        {result && product.can_be_sold!==undefined && product.can_be_sold==1?
                                          <li>Can be Sold</li>
                                          :null
                                        }

                                        {result && product.can_be_purchased!==undefined && product.can_be_purchased==1?
                                          <li>Can be Purchased</li>
                                          :null
                                        }

                                        {result && product.can_be_expended!==undefined && product.can_be_expended==1?
                                          <li>Can be Expensed</li>
                                          :null
                                        }

                                        {result && product.event_subscription!==undefined && product.event_subscription==1?
                                          <li>Event Subscription</li>
                                          :null
                                        } 
                                      </ul>
                                      </div>
                                      <div className="col-xs-4 col-sm-2 col-md-4 col-lg-4 text-right">
                                          <div className="product-image">
                                              <img src={result && product.image_path!==undefined ? product.image_path : '/media/product_img/image-upload.png'} alt="no-image" /> 
                                         </div>
                                      </div>
                                  </div>
                                  <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                                      <li role="presentation" data-id="999" className="active"><a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="false">{translate('general_information')} </a></li>
                                      <li role="presentation" data-id="420"><a href="#field-tab-2" aria-controls="field-tab-2" role="tab" data-toggle="tab">{translate('extra_info')}</a></li>
                                      <li role="presentation" data-id="470"><a href="#field-tab-3" aria-controls="field-tab-3" role="tab" data-toggle="tab">{translate('notes')}</a></li>
                                  </ul>

                                  <div className="tab-content edit-form">
                                      <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                        <div className="row row__flex">
                                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                              <table className="detail_table">
                                                <tbody>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.product_type!==undefined ? "control-label" : "text-muted control-label"}>{translate('product_type')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                              {result && product.product_type!==undefined?product.product_type:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.internal_reference!==undefined && product.internal_reference ? "control-label" : "text-muted control-label"}>{translate('internal_reference')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                              {result && product.internal_reference!==undefined?product.internal_reference:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.product_category_name!==undefined && product.product_category_name ? "control-label" : "text-muted control-label"}>{translate('product_category')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                             {result && product.product_category_name!==undefined?product.product_category_name:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.description!==undefined && product.description ? "control-label" : "text-muted control-label"}> {translate('description')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                             {result && product.description!==undefined?product.description:null}
                                                          </div>
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
                                                          <label className={result && product.sale_price!==undefined && product.sale_price ? "control-label" : "text-muted control-label"}>{translate('sale_price')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                            {result && product.sale_price!==undefined?product.sale_price:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.tax_on_sale_name!==undefined && product.tax_on_sale_name ? "control-label" : "text-muted control-label"}> {translate('tax_on_sale')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                             {result && product.tax_on_sale_name!==undefined?product.tax_on_sale_name:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.cost!==undefined && product.cost ? "control-label" : "text-muted control-label"}>{translate('cost')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                              {result && product.cost!==undefined?product.cost:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.uofm_name!==undefined && product.uofm_name ? "control-label" : "text-muted control-label"}>{translate('unit_of_measure')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                              {result && product.uofm_name!==undefined?product.uofm_name:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </div>
                                        </div>
                                      </div>
                                      <div id="field-tab-2" role="tabpanel" className="tab-pane">
                                          <div className="row row__flex">
                                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                              <table className="detail_table">
                                                <tbody>
                                                   <tr>
                                                      <td>
                                                          <label className={result && product.weight!==undefined && product.weight? "control-label" : "text-muted control-label"}>{translate('weight')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                             {result && product.weight!==undefined?product.weight:null}
                                                          </div>
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td>
                                                          <label className={result && product.volume!==undefined && product.volume? "control-label" : "text-muted control-label"}>{translate('volume')}</label>
                                                      </td>
                                                      <td>
                                                          <div className="form-group" style={form_group}>
                                                              {result && product.volume!==undefined?product.volume:null}
                                                          </div>
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
                                                <label className="control-label">{translate('label_sales_person')}</label>
                                            </td>
                                            <td>
                                                <div className="form-group" style={form_group}>
                                                    <div className="selected-sales-person">
                                                         {this.state.select_sp_value}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className={result && product.sales_channel_name!==undefined && product.sales_channel_name!=''? "control-label" : "text-muted control-label"}>{translate('label_sales_team')}</label>
                                            </td>
                                            <td>
                                                <div className="form-group" style={form_group}>
                                                    {result && product.sales_channel_name!==undefined?product.sales_channel_name:null}
                                                </div>
                                            </td>
                                        </tr>
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                          
                                      </div> 
                                      <div id="field-tab-3" role="tabpanel" className="tab-pane">
                                          <div className="row">
                                          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                              <div className="quotation" width="300px">
                                                  <h4>{translate('internal_note')}</h4>
                                                  <p>
                                                   {result && product.notes!==undefined?product.notes:null}
                                                   </p>
                                              </div>
                                              <div className="quotation">
                                                  <h4>{translate('internal_note_for_vendor')}</h4>
                                                   <p>
                                                   {result && product.vendors_notes!==undefined?product.vendors_notes:null}
                                                   </p>
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
        </div>
  </div>
    );
  }
}
module.exports = ProductView;
