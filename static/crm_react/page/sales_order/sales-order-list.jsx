import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL, DIRECTORY_PATH,ROLES,ID,LOGED_IN_USER} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { getCookie, cursor_pointer  } from 'crm_react/common/helper';
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';

class  SalersOrderList extends React.Component {
    constructor(){
        super();
        var storegets = localStorage.getItem('searchsales');
        this.state = {
                    result : null ,
                    total_record : 0,
                    current_page : 1,
                    limit        : '',
                    total_page   : 1,
                    page_start   : 0,
                    page_end     : 0,
                    view_pagging : false,
                    checkbox     : false,
                    names        : [],
                    names        : storegets!== null && storegets!='' ? [storegets] : [],
                    value        : '',
                    parameter    : [],
                    search_div_suggestions_class:'form-group dropdown top-search',
                    currency:''

        }
        this.serverRequest = $.get('/product/Paginglimit/', function (data) {
            this.setState({ limit   :  data.limit,});
        }.bind(this));
        var csrftoken = getCookie('csrftoken');
        this.getQuotationData(this.state.names);
        localStorage.setItem('search',this.state.names);
    }

  componentDidMount(){
  }

  handleView(view_id){
     browserHistory.push("/sales/order/view/"+view_id +"/");
  }

  getQuotationData(names){
      var names1 = names!==undefined ? names: [];
      var page   = this.state.current_page;
      var parameter_arr = this.state.parameter;
      var limit  = this.state.limit;
      var offset = (page-1)*limit;
      var Data = [{'name':'limit', 'value':limit}, {'name':'offset', 'value':offset}];
      $.ajax({
            type: "POST",
            cache: false,
            url: '/salers/order/listdata/',
            data: {
                  ajax                : true,
                  names               : JSON.stringify(names1),
                  filter_list         : JSON.stringify(parameter_arr),
                  fields              : JSON.stringify(Data),
                  csrfmiddlewaretoken : getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.quatation_list.length==0 && page>1){
                    this.setState({current_page: page-1}, ()=>{this.getQuotationData(this.state.names)})
                }else if(data.quatation_list.length>0){
                    var total_page =  Math.floor(data.total_count/limit);
                    if(data.total_count%limit!=0){
                        total_page +=1;
                    }
                    var page_start = offset+1;
                    var page_end   = offset+ data.quatation_list.length;
                    this.setState({
                            result :data,
                            total_record : data.total_count,
                            total_page   : total_page, 
                            view_pagging : true,
                            page_start   : page_start,
                            page_end     : page_end ,
                            checkbox     : false,
                            currency     : data.currency
                    },
                    ()=>{this.handleSetResetAll()})
                }else{
                    this.setState({
                            result :null ,
                            total_record : 0,
                            total_page   : 1, 
                            view_pagging : false,
                            page_start   : 0,
                            page_end     : 0 ,
                            checkbox     : false,
                    },
                    ()=>{this.handleSetResetAll()})
                }
            }.bind(this)
        });
    }

  /*Start: pagination */
  getNextPrevPage(action){
    var current_page = this.state.current_page;
    var limit        = this.state.limit;
    var total_page   = this.state.total_page;
    if(action=='prev'){
      current_page--;
      if(current_page < 1){
          current_page = total_page;
      }
     this.setState({current_page:current_page}, ()=>{this.getQuotationData(this.state.names)})
    }else if(action=='next'){
      current_page++;
      if(current_page>total_page){
        current_page =1
      }
      this.setState({current_page:current_page}, ()=>{this.getQuotationData(this.state.names)})
    }
  }

  /*End: pagination*/


  /*Start: Checkbox mark unmark and delete*/
  handleMarkUnmarkAll(event){
    this.setState({checkbox:!this.state.checkbox}, ()=>{this.handleSetResetAll()})
  }

  handleMarkUnmark(event){

   this.setState({checkbox:false})
  }

  handleSetResetAll(){

    var checkbox_status = this.state.checkbox;
    var temp  = $('tr.list_tr ').find('.quotation_checkbox');

    if(checkbox_status===true){
     temp.each(function(){
        $(this).prop('checked', true);
      }) 
    }
    else{
      temp.each(function(){
        $(this).prop('checked', false);
      }) 
    }

  }

    handleExport(){
    var selected_product   = $('tr.list_tr').find('.quotation_checkbox:checked');
    var limit        = this.state.limit;
    var current_page = this.state.current_page;

    var quot_ids = [];
    var can_remomve = true;

      selected_product.each(function(){
        var qout_state = $(this).attr('data-action');

            quot_ids.push($(this).attr('data-id'));
          
      })

      if (quot_ids =='' || quot_ids == null) {
         var selected_product   = $('tr.list_tr').find('.quotation_checkbox:not(:checked)');
         selected_product.each(function(){
        var qout_state = $(this).attr('data-action');

            quot_ids.push($(this).attr('data-id'));
          
      })
      }
        $.ajax({
            type: "POST",
            cache: false,
            url: '/sales/order/salersexport/',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                window.open('/' +data.file);
              }
         
            }.bind(this)
        });
  }

  handleDeleteSelected(){

    var confrm = confirm("Do you really want to remove these record?");

    if(confrm===false){
      return;
    }

    var selected_product   = $('tr.list_tr ').find('.quotation_checkbox:checked');
    var limit        = this.state.limit;
    var current_page = this.state.current_page;

    var quot_ids = [];
    var can_remomve = true;

      selected_product.each(function(){
        var qout_state = $(this).attr('data-action');
          if(qout_state=='true'){
            quot_ids.push($(this).attr('data-id'));  
          }
          else{
            can_remomve = false
          }
          
      })

      if(quot_ids.length==limit && current_page>1){
          current_page = current_page-1 
      }

      if(can_remomve===false){

        NotificationManager.error('Sales Order', 'you can not delete a sent Quotation or a sales order!:',5000);
        return;
      }


      if(quot_ids.length>0){
        $.ajax({
            type: "POST",
            cache: false,
            url:  '/sales/order/deleteQoutation/',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                this.setState({current_page:current_page},()=>{this.getQuotationData(this.state.names)})
              }
         
            }.bind(this)
        });
      }

  }

  /*End: Checkbox mark unmark and delete*/

    /*Start : search handling*/

    handle_search_input(event){
        if(event.target.value !=''){
            this.setState({value:event.target.value,search_div_suggestions_class:'form-group dropdown top-search open' })
        }else{
            this.setState({value:''})
        }
    }

   handleEnterPress(e) {
        if (e.key === 'Enter') {
            this.state.names.push(this.state.value)
            this.render_names()
            this.getQuotationData(this.state.names)
            localStorage.setItem('searchsale',this.state.names);
            this.setState({value:''})
        }
  }
  
  onKeyDown(e) {

        if (e.keyCode === 8) {
            this.setState({names:[]})
            if(this.state.value == '') {
                this.getQuotationData('')
              }
        }
    }


   handle_by_name(){

        this.state.names.push(this.state.value)
        this.setState({value:''})
        this.getQuotationData(this.state.names)
        localStorage.setItem('searchsale',this.state.names);
    }


    render_names(){
        let names = this.state.names
        return (
            <div data-type="search" data-key="Salers Order Number">
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
        this.setState({names:name_arr})
        this.getQuotationData(name_arr)
        localStorage.clear()
        localStorage.removeItem(this.state.names)
        this.setState({names:name_arr})
    }

    handleFilter(filter_parameter){

      var parameter_list = this.state.parameter;
      if(filter_parameter!=''&&filter_parameter!=null){


          if(parameter_list.indexOf(filter_parameter) !==- 1){
                parameter_list.splice(parameter_list.indexOf(filter_parameter),1);
          }
          else{
              parameter_list.push(filter_parameter);
          }
          
          this.setState({parameter : parameter_list}, ()=>{this.getQuotationData()})
        }
    
  }

  /*Stop : search handling*/
  render_header(){
        return (
        <header className="crm-header clearfix module__product">
            <div id="mega-icon" className="pull-left">
              <Link to={"/dashboard/"} title="Services"><i className="fa fa-th" aria-hidden="true"></i></Link>
            </div>
            <h1 className="pull-left">
                <Link to={"/dashboard/"} title="Saalz"><img src={ '/static/front/images/saalz-small.png'} alt="Saalz" height="30" />
                </Link>
            </h1>
            <div className="pull-right">
                <div className={this.state.search_div_suggestions_class}>
                    <div className="pull-left filter-list">
                        {
                            this.state.names.length > 0 ?
                                this.render_names()
                            :null
                        }
                    </div>
                    <form method="post" className="clearfix pull-left" data-toggle="dropdown" aria-haspopup="true">
                        <input type="text" onKeyDown={this.onKeyDown.bind(this)} onKeyPress={this.handleEnterPress.bind(this)} className="form-control" value={this.state.value} onChange={this.handle_search_input.bind(this)} placeholder="Search with Sales order Number Ex.SO001"/>
                        <input type="submit" value="Find" className="search-icon-sprite" />
                    </form>
                    {
                       this.state.value !=''  ?
                        <div className="dropdown-menu top-search__suggestions">
                            <ul>
                                <li onClick={this.handle_by_name.bind(this)}>Search <em>By Sales Order Number</em> for <strong>{this.state.value}</strong></li>
                            </ul>
                        </div>
                    : null
                    }
                </div>
                {<HeaderNotification/>}
                {<HeaderProfile />}
            </div>
        </header>
     );
 }


  render() {
    let result     = this.state.result
    let page_start = this.state.page_start;
    let page_end   = this.state.page_end;
   
    return (
    <div>
      { this.render_header()}   
       <NotificationContainer/>
        <div id="crm-app" className="clearfix module__quotation">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                      <div className="row top-actions d-lg-flex">
                          <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                                   <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                   <li>{translate('label_salers')}</li>
                              </ul>
                                <Link to={'/sales/order/add/'} className="btn btn-new">
                                       {translate('add_salers')}
                                </Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 col-md-6 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                              <ul className="list-inline inline-block filters-favourite">
                                  <li className="dropdown actions__list-view"> 
                                    <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions">
                                        {translate('label_action')}<i className="fa fa-angle-down push-left-3"></i>
                                    </span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                       <li><a href="javascript:void(0)" onClick = {this.handleDeleteSelected.bind(this)}>{translate('delete')}</a></li>
                                        <li className="divider"></li>
                                       <li><a href="javascript:void(0)" onClick = {this.handleExport.bind(this)}>Export</a></li>
                                    </ul>
                                  </li>
                              </ul>
                              <ul className="list-inline inline-block top-actions-pagination">
                                <li>{this.state.view_pagging==true?page_start+'-'+page_end+'/'+this.state.total_record:''}</li>
                                <li><a href="javascript:void(0)" onClick={this.getNextPrevPage.bind(this, 'prev')}><i className="fa fa-chevron-left"></i></a></li>
                                <li><a href="javascript:void(0)" onClick={this.getNextPrevPage.bind(this, 'next')} ><i className="fa fa-chevron-right"></i></a></li>
                              </ul>
                          </div>
                      </div> 
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
                              <th className="fieldwith">{translate('salers_order_number')} </th>
                              <th className="fieldwith">{translate('order_date')}</th>
                              <th className="fieldwith">{translate('customer')}</th>
                              <th className="fieldwith">{translate('total')}</th>
                              <th className="subtotalright fieldwith">{translate('label_status')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {result && result.quatation_list!==undefined && result.quatation_list.length>0?
                              result.quatation_list.map((list, i)=>{
                                return(
                                      <tr key= {list.id}  className = "list_tr" >
                                        <td>
                                         {ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION") || ROLES.includes("ROLE_MANAGE_ALL_QUOTATION") ||  list.user_id == ID ?
                                          <div className="checkbox">
                                            <input data-id={list.id} data-action = {list.can_remove}  id={"view-list__cb-"+i} className ="quotation_checkbox" type="checkbox" onClick = {(event)=>this.handleMarkUnmark(event)} />
                                            <label htmlFor={"view-list__cb-"+i}></label>
                                          </div>
                                           : null
                                         }
                                        </td>
                                        <td className="fieldwith" onClick={this.handleView.bind(this,list.uuid)} >
                                          <a href="javascript:void(0)" title={"View Details of  "+list.qt_num}>{list.qt_num}</a>
                                        </td>
                                        <td className="fieldwith" onClick={this.handleView.bind(this,list.uuid)} style={cursor_pointer}>{list.order_date}</td>
                                        <td className="fieldwith" onClick={this.handleView.bind(this,list.uuid)} style={cursor_pointer}>{list.customer}</td>
                                        <td className="fieldwith" onClick={this.handleView.bind(this,list.uuid)} style={cursor_pointer}>
                                            <span>{list.total.toFixed(2)}</span>
                                            <span className="push-left-2">{this.state.currency }</span>
                                        </td>
                                        <td className="subtotalright fieldwith" onClick={this.handleView.bind(this,list.uuid)} style={cursor_pointer}>{list.status}</td>
                                      </tr>
                                    )
                              }):null

                             }
                            </tbody>
                            <tfoot>
                              <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td className="fieldwith">
                                    <span>{result && result.total_amount!==undefined ? result.total_amount : 0}</span>
                                    <span className="push-left-2">{this.state.currency}</span>
                                </td>
                                <td>&nbsp;</td>
                              </tr>
                            </tfoot>
                            </table>
                            </div> {/* end #view-list */}
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
module.exports = SalersOrderList;
