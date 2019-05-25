import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import Header from 'crm_react/component/Header';
import state, {BASE_FULL_URL, DIRECTORY_PATH} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import CsvForm from 'crm_react/component/csv-form';
import {getCookie, cursor_pointer } from 'crm_react/common/helper';

class  ProductList extends React.Component {

    constructor() {
        super();
        var storegets = localStorage.getItem('searchproducts');
        this.state = {
            result: null,
            total_record: 0,
            current_page: 1,
            limit: '',
            total_page: 1,
            page_start: 0,
            page_end: 0,
            view_pagging: false,
            checkbox: false,
            names: storegets !== null && storegets != '' ? [storegets] : [],
            value: '',
            search_div_suggestions_class: 'form-group dropdown top-search',
        };

        this.serverRequest = $.get('/product/Paginglimit/', function (data) {
            this.setState({limit: data.limit,});
        }.bind(this));

        this.getProductData(this.state.names);
        localStorage.setItem('searchproduct', this.state.names);
    }


    getProductData(names) {
        var page = this.state.current_page;
        var limit = this.state.limit;
        var offset = (page - 1) * limit;
        var Data = [{'name': 'limit', 'value': limit}, {'name': 'offset', 'value': offset}];
        $.ajax({
            type: "POST",
            cache: false,
            url: '/product/listdata/',
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
                names: JSON.stringify(names),
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.products.length == 0 && page > 1) {
                    this.setState({current_page: page - 1}, () => {
                        this.getProductData(this.state.names)
                    })
                }else if (data.products.length > 0) {
                    var total_page = Math.floor(data.total_count / limit);
                    if (data.total_count % limit != 0) {
                        total_page += 1;
                    }
                    var page_start = offset + 1;
                    var page_end = offset + data.products.length;
                    this.setState({
                            result: data,
                            total_record: data.total_count,
                            total_page: total_page,
                            view_pagging: true,
                            page_start: page_start,
                            page_end: page_end,
                            checkbox: false,
                        },
                        () => {
                            this.handleSetResetAll()
                        })
                }else {
                    this.setState({
                            result: null,
                            total_record: 0,
                            total_page: 1,
                            view_pagging: false,
                            page_start: 0,
                            page_end: 0,
                            checkbox: false,
                        },
                        () => {
                            this.handleSetResetAll()
                        })
                }
            }.bind(this)
        });
    }

    getNextPrevPage(action) {

        var current_page = this.state.current_page;
        var limit = this.state.limit;
        var total_page = this.state.total_page;
        if (action == 'prev') {
            current_page--;
            if (current_page < 1) {
                current_page = total_page;
            }
            this.setState({current_page: current_page}, () => {
                this.getProductData(this.state.names)
            })
        }else if (action == 'next') {
            current_page++;
            if (current_page > total_page) {
                current_page = 1
            }
            this.setState({current_page: current_page}, () => {
                this.getProductData(this.state.names)
            })
        }
    }

    handleMarkUnmarkAll(event) {
        this.setState({checkbox: !this.state.checkbox}, () => {
            this.handleSetResetAll()
        })
    }

    handleSetResetAll() {
        var checkbox_status = this.state.checkbox;
        var temp = $('tr.pruduct_list_tr ').find('.product_checkbox');
        if (checkbox_status === true) {
            temp.each(function () {
                $(this).prop('checked', true);
            })
        }else {
            temp.each(function () {
                $(this).prop('checked', false);
            })
        }
    }

    handleView(view_id) {
        browserHistory.push( "/product/view/" + view_id + "/");
    }

    handleMarkUnmark(event) {
        this.setState({checkbox: false})
    }

    handleFileIconClick() {
        ModalManager.open(<CsvForm
            title="Upload File"
            modal_id="csv_form"
            getReturndata={this.getProductData.bind(this)}
            modal_name="product"
            form_id="csv_form"
            showModal={ true }
            onRequestClose={() => true}/>
        );
    }

    handleExport() {

        var selected_product = $('tr.pruduct_list_tr').find('.product_checkbox:checked');
        var limit = this.state.limit;
        var current_page = this.state.current_page;
        var quot_ids = [];
        var can_remomve = true;
        selected_product.each(function () {
            var qout_state = $(this).attr('data-action');
            quot_ids.push($(this).attr('data-id'));
        });
        if (quot_ids == '' || quot_ids == null) {
            var selected_product = $('tr.pruduct_list_tr').find('.product_checkbox:not(:checked)');
            selected_product.each(function () {
                quot_ids.push($(this).attr('data-id'));
            })
        }
        $.ajax({
            type: "POST",
            cache: false,
            url: '/product/productexport/',
            data: {
                ajax: true,
                ids: JSON.stringify(quot_ids),
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success == true) {
                    window.open(BASE_FULL_URL + '/' + data.file);
                }

            }.bind(this)
        });
    }

    HandleDeleteSelected() {
        var selected_product = $('tr.pruduct_list_tr ').find('.product_checkbox:checked');
        var limit = this.state.limit;
        var current_page = this.state.current_page;
        var pro_ids = [];
        selected_product.each(function () {
            pro_ids.push($(this).attr('data-id'));
        });
        if (pro_ids.length == limit && current_page > 1) {
            current_page = current_page - 1
        }
        if (pro_ids.length > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/deleteproducts/',
                data: {
                    ajax: true,
                    data: JSON.stringify(pro_ids),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success == true) {
                        this.setState({current_page: current_page}, () => {
                            this.getProductData(this.state.names)
                        })
                    }
                }.bind(this)
            });
        }
    }


    /*Start : search handling*/

    handle_search_input(event) {
        if (event.target.value != '') {
            this.setState({
                value: event.target.value,
                search_div_suggestions_class: 'form-group dropdown top-search open'
            })
        } else {
            this.setState({value: ''})
        }
    }


    handleEnterPress(e) {
        if (e.key === 'Enter') {
            this.state.names.push(this.state.value);
            this.render_names();
            this.getProductData(this.state.names);
            localStorage.setItem('searchproduct', this.state.names);
            this.setState({value: ''})
        }
    }

    onKeyDown(e) {
        if (e.keyCode === 8) {
            this.setState({names: []});
            if (this.state.value == '') {
                this.getProductData('')
            }
        }
    }


    handle_by_name() {
        this.state.names.push(this.state.value);
        this.setState({value: ''});
        this.getProductData(this.state.names);
        localStorage.setItem('searchproduct', this.state.names);
    }


    render_names(){
        let names = this.state.names;
        return (
            <div data-type="search" data-key="Name">
            {
                names.map((name, j) =>{
                    return <span  data-separator="or" key= {j}>{name}</span>
                })
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_names.bind(this)}></i>
            </div>
        );
    }




    remove_names(){
       var name_arr = [];
        this.setState({names:name_arr});
        this.getProductData(name_arr);
        localStorage.clear()
        localStorage.removeItem(this.state.names);
        this.setState({names:name_arr});
    }

  /*Stop : search handling*/

  render_header(){
     return (<Header />);
  }

  
  render() {
    let result     = this.state.result;
    let page_start = this.state.page_start;
    let page_end   = this.state.page_end;

    return (
    <div>
      { this.render_header()}
      <NotificationContainer/>
          <div id="crm-app" className="clearfix module__product">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                      <div className="row top-actions d-lg-flex">
                          <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                                <li>
                                    <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link>
                                </li>
                                  <li>{translate('products')}</li>
                              </ul>
                              <Link to={'/product/add/'} className="btn btn-new">{translate('add_product')} </Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 col-md-6 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                            <ul className="list-inline inline-block filters-favourite">
                                <li className="dropdown actions__list-view"> <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions"><i className="action-icon-sprite"></i>{translate('label_action')} <i className="fa fa-angle-down"></i></span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                        <li><a href="javascript:void(0)" onClick = {this.HandleDeleteSelected.bind(this)}>{translate('button_delete')} </a></li>
                                         {/*<li><a href="javascript:void(0)" onClick = {this.handleExport.bind(this)}>Export</a></li>
                                          <li><a  onClick={this.handleFileIconClick.bind(this)}>Import</a></li>
                                          */}
                                    </ul>
                                </li>
                              
                            </ul>
                            <ul className="list-inline inline-block top-actions-pagination">
                               <li>{this.state.view_pagging==true?page_start+'-'+page_end+'/'+this.state.total_record:''}</li>
                                <li><a href="javascript:void(0)" onClick={this.getNextPrevPage.bind(this, 'prev')}><i className="fa fa-chevron-left"></i></a></li>
                                <li><a href="javascript:void(0)" onClick={this.getNextPrevPage.bind(this, 'next')} ><i className="fa fa-chevron-right"></i></a></li>
                            </ul>
                          </div>
                      </div>  {/*end top-actions */}

                      <div className="row crm-stuff">
                          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div id="view-list">
                              <table className="table list-table">
                                <thead>
                                  <tr>
                                    <th>
                                      <div className="checkbox">
                                        <input id="view-list__cb-all" type="checkbox" checked ={this.state.checkbox==true?'checked':''}  onClick = {(event)=>this.handleMarkUnmarkAll(event)} />
                                        <label htmlFor="view-list__cb-all"></label>
                                      </div>
                                    </th>
                                    <th>&nbsp;</th>
                                    <th>{translate('internal_reference')}</th>
                                    <th>{translate('name')}</th>
                                    <th>{translate('sale_price')}</th>
                                    <th>{translate('cost')}</th>
                                    <th>{translate('internal_category')}</th>
                                    <th>{translate('product_type')}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {result?
                                    result.products.map((product, i)=>{
                                       return(
                                            <tr key = {i}  className = "pruduct_list_tr" >
                                                <td>
                                                    <div className="checkbox">
                                                      <input data-id={product.id} id={"view-list__cb-"+i} className ="product_checkbox" type="checkbox" onClick = {(event)=>this.handleMarkUnmark(event)} />
                                                      <label htmlFor={"view-list__cb-"+i}></label>
                                                    </div>
                                                </td>
                                                <td></td>
                                                <td onClick={this.handleView.bind(this,product.uuid)} style={cursor_pointer}> {product.internal_reference} </td>
                                                <td onClick={this.handleView.bind(this,product.uuid)} style={cursor_pointer}> <span  className="text-primary">{product.name} </span></td>
                                                <td onClick={this.handleView.bind(this,product.uuid)} style={cursor_pointer}> {product.sale_price ? product.sale_price : '0.00'} {this.state.result ? this.state.result.currency : null }</td>
                                                <td onClick={this.handleView.bind(this,product.uuid)} style={cursor_pointer}> {product.cost ? product.cost : '0.00'} {this.state.result ? this.state.result.currency : null }</td>
                                                <td onClick={this.handleView.bind(this,product.uuid)} style={cursor_pointer}> {product.product_category} </td>
                                                <td style={cursor_pointer}>{product.product_type}</td>
                                            </tr>
                                            )
                                    })
                                    :<tr></tr>
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

module.exports = ProductList;



