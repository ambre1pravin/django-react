import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'

import state, {BASE_FULL_URL, DIRECTORY_PATH} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import Header from 'crm_react/component/Header';


class  PricelistList extends React.Component {

  constructor() {
        super();

      this.state = {
        result : null
      }
  }

  componentDidMount() {
    this.serverRequest = $.get('/pricelist/listdata/', function (data) {
        this.setState({
          result :data
          });
      }.bind(this));
  }


  render() {
    let result = this.state.result

        
    return (
    <div>
      <Header />
          <div id="crm-app" className="clearfix module__product">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                      <div className="row top-actions">
                          <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                               <Link to={'/sales/'} title={translate('label_sales')}>{translate('label_sales')}</Link>
                                  <li>{translate('products')}</li>
                              </ul>
                              <Link to={'/pricelist/add/'} className="btn btn-new">{translate('add_pricelist')} </Link>
                              <a href="#" title={translate('import_products')} className="btn btn-new btn-import">{translate('import')}</a>
                          </div>
                          <div className="col-xs-12 col-sm-12 pull-right text-right">
                            <ul className="list-inline inline-block filters-favourite">
                                <li className="dropdown actions__list-view"> <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions"><i className="action-icon-sprite"></i>{translate('label_action')} <i className="fa fa-angle-down"></i></span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                        <li><a href="#">{translate('export')}</a></li>
                                        <li><a href="#">{translate('archive')}</a></li>
                                        <li><a href="#">{translate('unarchive')}</a></li>
                                        <li><a href="#">{translate('button_delete')}</a></li>
                                    </ul>
                                </li>
                                <li className="dropdown"> <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="filters"><i className="fa fa-print" aria-hidden="true"></i> Print <i className="fa fa-angle-down"></i></span>
                                    <ul className="dropdown-menu" aria-labelledby="print">
                                        <li><a href="#">{translate('products_labels')}</a></li>
                                        <li><a href="#">{translate('cost_structure_analysis')} </a></li>
                                    </ul>
                                </li>
                            </ul>
                            <ul className="list-inline inline-block top-actions-pagination">
                                <li><a href="#"><i className="fa fa-chevron-left"></i></a></li>
                                <li><a href="#"><i className="fa fa-chevron-right"></i></a></li>
                            </ul>
                          </div>
                      </div>  {/*end top-actions */}

                      <div className="row crm-stuff">
                          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div id="view-list">
                              <table className="table list-table">
                                <thead>
                                  <tr>
                                    <th></th>
                                    <th>{translate('pricelist_name')} </th>
                                    <th>{translate('pricelist_type')} </th>
                                    <th>{translate('currency')}</th>
                                    <th>{translate('label_active')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {result?
                                    result.pricelist.map((pricelist, i)=>{
                                        return(
                                           <tr key = {i} >
                                              
                                              <td></td>
                                              <td>{pricelist.name!==undefined ? pricelist.name: ''} </td>
                                              <td>{pricelist.pricelist_type!==undefined ? pricelist.pricelist_type: ''}</td>
                                              <td>{pricelist.currency_name!==undefined ? pricelist.currency_name: ''}</td>
                                              <td>
                                              <div className="checkbox">
                                                <input id="is_active__cb" type="checkbox" defaultChecked={pricelist.active!==undefined && pricelist.active== true ? 'checked': ''} disabled="disabled" />
                                                <label htmlFor="is_active__cb"></label>
                                              </div>
                                              </td>                                               
                                          </tr>

                                          )
                                    })
                                    :''
                                  }
                                   
                                </tbody>
                              </table>
                            </div>  {/*end #view-list */}
                          </div>
                      </div> {/* end .crm-stuff */}
                    </div>
                </div>
            </div>
        </div>
     
    </div>

    );
  }
}

module.exports = PricelistList;



