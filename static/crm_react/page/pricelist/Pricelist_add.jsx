import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import Dropdown from 'crm_react/component/Dropdown';
import {translate} from 'crm_react/common/language';

class  PricelistAdd extends React.Component {
  
	constructor() 
  {
    super();
    this.state = {
                result            : null
    }

    this.serverRequest = $.get('/pricelist/adddata/', function (data) {
          this.setState({
            result        : data,
          });

    }.bind(this));  
  }

  render() {
    let result = this.state.result   
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
                                  <li><Link to="#" title={translate('add_pricelist')}>{translate('product')}</Link></li>
                                  <li>{translate('label_new')}</li>
                              </ul>
                              <a href="javascript:void(0)"   className="btn btn-primary">{translate('save')}</a>
                               <Link to="" className="btn btn-primary btn-discard btn-transparent">{translate('button_discard')}</Link>
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
                          <form>
                            <div className="panel panel-default panel-tabular">
                                <div className="panel-heading no-padding ">
                                  <div className="row">
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
                                    <div className="row">
                                        <h2 className="col-sm-12 quotation-number"><input type="text" name="quotation-number" value={translate('new_priceList')} /></h2>
                                    </div>

                                    <div className="row row__flex">                            
                                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                            <table className="detail_table">
                                              <tbody>
                                                <tr>
                                                    <td>
                                                        <label className="text-muted control-label">{translate('currnecy')}</label>
                                                    </td>
                                                    <td>
                                                     <Dropdown  inputname     = 'currnecy'
                                                          json_data          = {''}
                                                          input_value        = {''}
                                                          input_id           = {''}
                                                          attr_id            = 'pricelist_currnecy'
                                                          model_id           = ""
                                                          handleAddEdit  = {''}
                                                          handleViewCateList = {''}
                                                          search_more    = {true}
                                                          create_edit        = {true}  />
                                                    </td>
                                                </tr>
                                              </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                                    <li role="presentation" data-id="999" className="active"><a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="false"></a></li>
                                </ul>

                                <div className="tab-content">
                                    <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                          <table className="quotation-product-detail table list-table">
                                              <thead>
                                                  <tr>
                                                      <th>&nbsp;</th>
                                                      <th>{translate('sequence')}</th>
                                                      <th>{translate('rule_name')} </th>
                                                      <th>{translate('product')}</th>
                                                      <th>{translate('product_template')}</th>
                                                      <th>{translate('product_category')}</th>
                                                      <th>{translate('min_quantity')}</th>
                                                      <th>{translate('based_on')} </th>
                                                      <th>&nbsp;</th>
                                                  </tr>
                                              </thead>       
                                          </table>
                                        <div className="add-new-product">
                                            <a href="#" className="btn btn-new" >{translate('add_new_item')}</a>
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
module.exports = PricelistAdd;
