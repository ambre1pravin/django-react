import React from 'react';
import { Link, browserHistory } from 'react-router'
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';
import { getCookie, cursor_pointer  } from 'crm_react/common/helper';
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import { ToastContainer, toast } from 'react-toastify';

class EmailTemplateList extends React.Component {

  constructor() {
        super();
      var storegets = localStorage.getItem('search1');
      this.state = {
                result  : null,
                total_record : 0,
                current_page : 1,
                limit        : '', 
                total_page   : 1,
                page_start   : 0,
                page_end     : 0,
                view_pagging : false,
                checked     : false,
                processing:false,
                delete_template_list:[],
                names        : [],
                names        : storegets!== null && storegets!='' ? [storegets] : [],
                value        : '',
                search_div_suggestions_class:'form-group dropdown top-search',

      }
      this.serverRequest = $.get('/product/Paginglimit/', function (data) {
        this.setState({
                      limit   :  data.limit,
        });

      }.bind(this));
      this.getQuottemplateData(this.state.names);
      localStorage.setItem('search',this.state.names);
  }



  getQuottemplateData(names){

      var names1 = names!==undefined ? names: [];

      var page   = this.state.current_page;
      var limit  = this.state.limit;
      var offset = (page-1)*limit;

      var Data = [{'name':'limit', 'value':limit}, {'name':'offset', 'value':offset}];

       $.ajax({
            type: "POST",
            cache: false,
            url: '/email/template/listdata/',
            data: {
              ajax: true,
              fields : JSON.stringify(Data),
              names  : JSON.stringify(names1),
              csrfmiddlewaretoken : getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                      this.setState({
                            result : data.templates ,
                            checked     : false,
                          })

            }.bind(this)
       });
  }


  handleView(view_id){
      if (view_id == 0) {
        browserHistory.push("/email/template/add/");
      }else{
        browserHistory.push("/email/template/edit/"+view_id+'/');
      }
  }





       // check_it
      check_all(){
            let checked = this.state.checked;
            let result_list = this.state.result;
            console.log(this.state.result)
            let temp_contact_list = [];
            if(result_list.length > 0){
                result_list.map((contact, i) =>{
                    var tem_dic = result_list[i];
                    if(checked){
                        tem_dic['checked'] = false
                    }else{
                        tem_dic['checked'] = true
                    }
                    temp_contact_list.push(tem_dic)
                });
                if(checked){
                    this.setState({checked : false})
                }else{
                    this.setState({checked : true})
                }
                this.setState({result : temp_contact_list})
            }
      }

     handle_check(index){
     console.log("res", this.state.result)
        let result_list = this.state.result;
        if(result_list.length > 0){
            if(result_list[index].checked)
                result_list[index].checked = false;
            else
                result_list[index].checked = true;
            this.setState({result : result_list})
        }
     }

    select_template(){
        let delete_template_list = this.state.delete_template_list;
        let result_list = this.state.result;
        if(result_list.length > 0){
            result_list.map((contact, i) =>{
                if(result_list[i].checked){
                    delete_template_list.push(result_list[i].id)
                }
            });
            this.setState({delete_template_list : delete_template_list})
        }
    }


  handle_delete_selected(){

    var confrm = confirm("Do you really want to remove these record?");
    if (confirm){
        this.select_template()
        let delete_template_list = this.state.delete_template_list;
        if(delete_template_list.length > 0){
            console.log("Deleted", delete_template_list)
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/email/template/deleteemailtemplate/',
                data: {
                    templates : JSON.stringify(delete_template_list),
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                },
                beforeSend: function () {
                    this.setState({processing:true})
                }.bind(this),
                success: function (data) {
                    if(data.success === true || data.success == 'true'){
                        var msg = data.msg;
                        toast.success(msg, {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
                        $.get('/email/template/listdata/', function (return_data) {
                                this.setState({
                                    result:  return_data.templates ,
                                    processing: false, checked_all: false,checked : false
                                });
                        }.bind(this));
                    }else{
                            //this.setState({processing: false,result:[],no_records:true,pagination_label:''})
                    }
                }.bind(this)
            });

        }
    }

    /*if(confrm===false){
      return;
    }

    var selected_product   = $('tr.list_tr ').find('.quotation_checkbox:checked');
    var limit        = this.state.limit;
    var current_page = this.state.current_page;

    var email_ids = [];
    var can_remomve = true;

      selected_product.each(function(){
        var qout_state = $(this).attr('data-action');
          if(qout_state=='true'){
            email_ids.push($(this).attr('data-id'));  
          }
          else{
            can_remomve = false
          }
          
      })

      if(email_ids.length==limit && current_page>1){
          current_page = current_page-1 
      }

      if(can_remomve===false)
      {
        alert('you can not delete a Quotations Template!  ');
        return;
      }

      if(email_ids.length>0){
        $.ajax({
            type: "POST",
            cache: false,
            url: '/email/template/deleteemailtemplate/',
            data: {
              ajax: true,
              ids : JSON.stringify(email_ids),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                this.setState({current_page:current_page},()=>{this.getQuottemplateData(this.state.names)})
              }
         
            }.bind(this)
        });
      }*/

  }


  
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
            this.getQuottemplateData(this.state.names)
            localStorage.setItem('search',this.state.names);
            this.setState({value:''})
        }
  }
  
  onKeyDown(e) {

        if (e.keyCode === 8) {
            this.setState({names:[]})
            if(this.state.value == '') {
                this.getQuottemplateData('')
              }
        }
    }


    handle_by_name(){

        this.state.names.push(this.state.value)
        this.setState({value:''})
        this.getQuottemplateData(this.state.names)
        localStorage.setItem('search',this.state.names);
    }

    render_names(){
      let names = this.state.names;
        return (
            <div data-type="search" data-key="Email Template name">
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
        this.getQuottemplateData(name_arr)
        localStorage.clear()
        localStorage.removeItem(this.state.names)
        this.setState({names:name_arr})
    }


 render_header()
  {

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
                        this.state.names.length > 0?
                            this.render_names()
                        :null
                    }
                </div>
                <form method="post" className="clearfix pull-left" data-toggle="dropdown" aria-haspopup="true">
                    <input type="text" onKeyDown={this.onKeyDown.bind(this)} onKeyPress={this.handleEnterPress.bind(this)} className="form-control" value={this.state.value} onChange={this.handle_search_input.bind(this)} placeholder="Search with Email Template Name"/>
                    <input type="submit" value="Find" className="search-icon-sprite" />
                </form>
                {
                   this.state.value !=''  ?
                    <div className="dropdown-menu top-search__suggestions">
                        <ul>
                            <li onClick={this.handle_by_name.bind(this)}>Search <em>By Email Template Name</em> for <strong>{this.state.value}</strong></li>
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
          <div id="crm-app" className="clearfix module__quotation">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                      <div className="row top-actions d-lg-flex">
                          <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                                  <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li>{translate('email_template')}</li>
                              </ul>
                                <Link to={'/email/template/add/'} className="btn btn-new">
                                       {'Add Email Template'}
                                </Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 col-md-6 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                            <ul className="list-inline inline-block filters-favourite">
                                <li className="dropdown actions__list-view"> <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions"><i className="action-icon-sprite"></i> {translate('label_action')} <i className="fa fa-angle-down"></i></span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                       
                                        <li><a href="#" onClick = {this.handle_delete_selected.bind(this)}>{translate('button_delete')}</a></li>
                                    </ul>
                                </li>
                            </ul>
                            <ul className="list-inline inline-block top-actions-pagination">
                                 <li>{this.state.view_pagging==true?page_start+'-'+page_end+'/'+this.state.total_record:''}</li>
                                <li><a href="javascript:void(0)"><i className="fa fa-chevron-left"></i></a></li>
                                <li><a href="javascript:void(0)"><i className="fa fa-chevron-right"></i></a></li>
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
                                                <input id="view-list__cb-all" type="checkbox" checked ={this.state.checkbox==true?'checked':''}  onChange={this.check_all.bind(this)} />
                                                <label htmlFor="view-list__cb-all"></label>
                                                </div>
                                                </th>
                                                <th>{translate('name')}</th>
                                                <th>{translate('subject')}</th>
                                                <th>{translate('type')}</th>
                                                <th>{'is_default'}</th>
                                          </tr>
                                    </thead>
                                <tbody>
                                {result?
                                    result.map((template , i)=>{
                                        return(
                                                <tr key= {template.id}  className = "list_tr"  >
                                                  <td>
                                                    {
                                                        template.id !=0 && !template.is_default ?
                                                          <div className="checkbox" key={'div_chk'+i}>
                                                              <input  checked={template.checked}  type="checkbox" onChange={this.handle_check.bind(this,i)} />
                                                              <label></label>
                                                          </div>
                                                          :null
                                                    }
                                                  </td>
                                                  <td className="emailtemplate-name" data-th="Email Template Name" onClick={this.handleView.bind(this,template.id)} >
                                                      <a href="javascript:void(0)" title={"View Details of  "+template.template_name}>{template.template_name}</a>
                                                  </td>

                                                  <td className="emailtemplate-name" onClick={this.handleView.bind(this, template.id)} style={cursor_pointer}>
                                                    {template.subject}
                                                  </td>
                                                  <td className="emailtemplate-name" onClick={this.handleView.bind(this, template.id)} style={cursor_pointer}>
                                                    {template.module_type }
                                                  </td>
                                                  <td className="emailtemplate-name" onClick={this.handleView.bind(this, template.id)} style={cursor_pointer}>{template.is_default?"True":"False"}</td>
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
            <ToastContainer />
            <LoadingOverlay processing={this.state.processing}/>
        </div>
    </div>
    );
  }
}

module.exports = EmailTemplateList;
