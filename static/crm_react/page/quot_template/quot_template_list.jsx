import React from 'react';
import { Link, browserHistory } from 'react-router'
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';
import {getCookie, cursor_pointer} from 'crm_react/common/helper';

class QuotTemplateList extends React.Component {

  constructor() {
        super();

      this.state = {
                result  : null,
                total_record : 0,
                current_page : 1,
                limit        : '', 
                total_page   : 1,
                page_start   : 0,
                page_end     : 0,
                view_pagging : false,
                checkbox     : false,
                names        : [],
                value        : '',

      }
      this.serverRequest = $.get('/product/Paginglimit/', function (data) {
        this.setState({

                      limit   :  data.limit,
                      });

      }.bind(this));
      this.getQuottemplateData = this.getQuottemplateData.bind(this)
  }

  componentDidMount() {

    this.getQuottemplateData()
  }

  getQuottemplateData(){

      var page   = this.state.current_page;
      var limit  = this.state.limit;
      var offset = (page-1)*limit;

      var Data = [{'name':'limit', 'value':limit}, {'name':'offset', 'value':offset}];

       $.ajax({
            type: "POST",
            cache: false,
            url: '/quot/template/listdata/',
            data: {
              ajax: true,
              fields : JSON.stringify(Data),
              names  : JSON.stringify(this.state.names),
              csrfmiddlewaretoken : getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                
                  if(data.templates.length==0 && page>1){
                    this.setState({current_page: page-1}, ()=>{this.getQuottemplateData()})
                  }
                  else if(data.templates.length>0){
                    var total_page =  Math.floor(data.total_count/limit);
                      if(data.total_count%limit!=0){
                            total_page +=1;                     
                      }
                      var page_start = offset+1;
                      var page_end   = offset+ data.templates.length;
                      
                      this.setState({
                            result :data,
                            total_record : data.total_count,
                            total_page   : total_page, 
                            view_pagging : true,
                            page_start   : page_start,
                            page_end     : page_end ,
                            checkbox     : false,
                          },
                          ()=>{this.handleSetResetAll()})
                  }

                  else{

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


    handleView(view_id){
          if (view_id == 0) {
            browserHistory.push("/quot/template/add/");
          }else{
            browserHistory.push("/quot/template/view/"+view_id+"/");
          }
      }

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
        alert('you can not delete a Quotations Template!  ');
        return;
      }


      if(quot_ids.length>0){
        $.ajax({
            type: "POST",
            cache: false,
            url: '/quot/template/deletetemplate/',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                this.setState({current_page:current_page},()=>{this.getQuottemplateData()})
              }
         
            }.bind(this)
        });
      }

  }

  getNextPrevPage(action){

    var current_page = this.state.current_page;
    var limit        = this.state.limit;
    var total_page   = this.state.total_page;

    if(action=='prev'){
      current_page--;
      if(current_page<1){
        current_page = total_page;
      }
     this.setState({current_page:current_page}, ()=>{this.getQuottemplateData()})
    }
    else if(action=='next'){
      current_page++;
      if(current_page>total_page){
        current_page =1
      }
      this.setState({current_page:current_page}, ()=>{this.getQuottemplateData()})
    }

  }
  

  render() {
    let result     = this.state.result
    let page_start = this.state.page_start;
    let page_end   = this.state.page_end;

        
    return (
    <div>
      <Header />
          <div id="crm-app" className="clearfix module__quotation">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                      <div className="row top-actions d-lg-flex">
                          <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                                  <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li>{translate('quotations_template')}</li>
                              </ul>
                              <Link to={'/quot/template/add/'} className="btn btn-new">{translate('add_qoutation_template')}</Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 col-md-6 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                            <ul className="list-inline inline-block filters-favourite">
                                <li className="dropdown actions__list-view"> <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions"><i className="action-icon-sprite"></i> {translate('label_action')} <i className="fa fa-angle-down"></i></span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                        <li><a href="#" onClick = {this.handleDeleteSelected.bind(this)}>{translate('button_delete')}</a></li>
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
                                    <th>{translate('quotations_template')}</th>
                                    <th>&nbsp;</th>
                                    <th>&nbsp;</th>
                                    <th>Expiration Days</th>
                                    <th>&nbsp;</th>
                                    <th>&nbsp;</th>
                                    <th>Expiration Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                {result?
                                    result.templates.map((template , i)=>{
                                        return(
                                                <tr key= {template.id}  className = "list_tr"  >
                                                  <td>
                                                    {template.id !=0?
                                                      <div className="checkbox">
                                                      <input data-id={template.uuid} data-action = {template.can_remove}  id={"view-list__cb-"+i} className ="quotation_checkbox" type="checkbox" onClick = {(event)=>this.handleMarkUnmark(event)} />
                                                        <label htmlFor={"view-list__cb-"+i}></label>
                                                      </div>
                                                      :null
                                                    }
                                                  </td>  
                                                  <td className = "template-name"
                                                    style={cursor_pointer}
                                                    onClick={this.handleView.bind(this, template.uuid)}
                                                  >
                                                    <span className="text-primary">{template.template_name}</span>
                                                  </td>
                                                  <th>&nbsp;</th>
                                                  <th>&nbsp;</th>
                                                <td style={cursor_pointer} onClick={this.handleView.bind(this, template.uuid)}>{template.expire_delay}</td>
                                                <th>&nbsp;</th>
                                                <th>&nbsp;</th>
                                                <td style={cursor_pointer} onClick={this.handleView.bind(this, template.uuid)}>{template.expire_date}</td>

                                               </tr>
                                              )
                                        } 
                                      )
                                  :null
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

module.exports = QuotTemplateList;



