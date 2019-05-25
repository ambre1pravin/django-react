import React from 'react';
import { Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL, DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';

class UnitofMeasureList extends React.Component {

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
      this.getUnitData = this.getUnitData.bind(this)
  }

componentDidMount() {

     this.getUnitData()

}

handleView(view_id){
     browserHistory.push("/unit/of/measure/view/"+view_id);
  }

getUnitData(){

      var page   = this.state.current_page;
      var limit  = this.state.limit;
      var offset = (page-1)*limit;

      var Data = [{'name':'limit', 'value':limit}, {'name':'offset', 'value':offset}];

       $.ajax({
            type: "POST",
            cache: false,
            url: '/unit/of/measure/listdata/',
            data: {
              ajax: true,
              fields : JSON.stringify(Data),
              names  : JSON.stringify(this.state.names)
            },
            beforeSend: function () {
            },
            success: function (data) {
                
                  if(data.unit.length==0 && page>1){
                    this.setState({current_page: page-1}, ()=>{this.getUnitData()})
                  }
                  else if(data.unit.length>0){
                    var total_page =  Math.floor(data.total_count/limit);
                      if(data.total_count%limit!=0){
                            total_page +=1;                     
                      }
                      var page_start = offset+1;
                      var page_end   = offset+ data.unit.length;
                      
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
        alert('you can not delete a Delivery!  ');
        return;
      }


      if(quot_ids.length>0){
        $.ajax({
            type: "POST",
            cache: false,
            url: '/unit/of/measure/deleteunit/',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                this.setState({current_page:current_page},()=>{this.getUnitData()})
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
     this.setState({current_page:current_page}, ()=>{this.getUnitData()})
    }
    else if(action=='next'){
      current_page++;
      if(current_page>total_page){
        current_page =1
      }
      this.setState({current_page:current_page}, ()=>{this.getUnitData()})
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
                      <div className="row top-actions">
                          <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                                
                                  <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li>{translate('unit_of_measure')}</li>
                              </ul>
                              <Link to={'/unit/of/measure/add/'} className="btn btn-new">{translate('add_unit_of_measure')}</Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 pull-right text-right">
                            <ul className="list-inline inline-block filters-favourite">
                                <li className="dropdown actions__list-view"> <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions"><i className="action-icon-sprite"></i> {translate('label_action')} <i className="fa fa-angle-down"></i></span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                       <li><a href="javascript:void(0)" onClick = {this.handleDeleteSelected.bind(this)}>{translate('button_delete')}</a></li>
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
                                    <th >
                                      <div className="checkbox">
                                        <input id="view-list__cb-all" type="checkbox" checked ={this.state.checkbox==true?'checked':''}  onClick = {(event)=>this.handleMarkUnmarkAll(event)} />
                                        <label htmlFor="view-list__cb-all"></label>
                                      </div>
                                    </th>
                                    <th>{translate('unit_of_measure')}</th>
                                    
                                  </tr>
                                </thead>
                                <tbody>
                                {result?
                                    result.unit.map((unit , i)=>{
                                        return(
                                               <tr key= {unit.id}  className = "list_tr" >
                                                  <td>
                                                      <div className="checkbox">
                                                         <input data-id={unit.id} data-action = {unit.can_remove}  id={"view-list__cb-"+i} className ="quotation_checkbox" type="checkbox" onClick = {(event)=>this.handleMarkUnmark(event)} />
                                                      <label htmlFor={"view-list__cb-"+i}></label>

                                                      </div>
                                                  </td>  
                                                  <td className = "template-name" onClick={this.handleView.bind(this, unit.id)} >
                                                    {unit.name}
                                                  </td>  
                                                </tr>
                                              )
                                        } 
                                      )
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

module.exports = UnitofMeasureList;



