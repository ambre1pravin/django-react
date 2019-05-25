import React from 'react';
import { Link, browserHistory } from 'react-router'

import state, {BASE_FULL_URL, DIRECTORY_PATH} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import Header from 'crm_react/component/Header';
import Left from 'crm_react/component/left';
import ColumnEditModal from 'crm_react/page/opportunity/col_edit_modal';


class  OpportunityList extends React.Component {

  constructor() {
        super();

      this.state = {
        result           : null,
        result_list      : null,
        showAddOPCard    : false,
        column_id        : null,
        team_list        : [],
        parameter        : [],
	      RoleOfUser       : '',
        sales_team_id    : '',
        group_by         : 'stage'
      }

    

        this.handleView            = this.handleView.bind(this);
        this.getFilteredDataList   = this.getFilteredDataList.bind(this);
        this.getFilteredKanBanData = this.getFilteredKanBanData.bind(this);

  }

 componentDidMount() {
    this.serverRequest = $.get('/opportunity/listdata/', function (data) {
          this.setState({
            result    :data.final_data,
            RoleOfUser:data.op_user_permission,
            team_list :data.json_teams!==undefined ? data.json_teams : null
          });

          $('#op_update_column').val(data.group_by);

        }.bind(this)).then(function(result) {
          if(this.state.RoleOfUser != 'ROLE_VIEW_OWN' && this.state.RoleOfUser != 'ROLE_VIEW_ALL'){    
            window.assign_draggable($('div.opp-column'));
            window.assign_col_sortable();
          }  
          window.assign_draggable($('div.op-card'));
          window.assign_droppable();
          $(".ratings").rating();

        }.bind(this));

    this.serverRequest = $.get('/opportunity/listviewdata/', function (data) {
      this.setState({
        result_list:data
      });

    }.bind(this))

  }

  handleFilter(filter_parameter){

      var parameter_list = this.state.parameter;
      var arr_group_by = ["sales_person", "sales_team" ,"stage", "lost_reason", "creation_month", "expected_closing"];

      if(filter_parameter!=''&&filter_parameter!=null){

        if(arr_group_by.indexOf(filter_parameter)!==-1){

          var common = $.grep(parameter_list, function(element) {
                  return $.inArray(element, arr_group_by ) !== -1;
              });

          if(common!=''){
              parameter_list.splice(parameter_list.indexOf(String(common)),1);
              if(common!=filter_parameter){
                  parameter_list.push(filter_parameter);
              }
            
          }else{
            parameter_list.push(filter_parameter);
          }

        }
        else{

          if(parameter_list.indexOf(filter_parameter) !==- 1){
                parameter_list.splice(parameter_list.indexOf(filter_parameter),1);
          }
          else{
              parameter_list.push(filter_parameter);
          }

          this.setState({
                        parameter : parameter_list
          })
        }
      }
      this.getFilteredDataList();
      this.getFilteredKanBanData();
  }



  getFilteredDataList(){

    var parameter_arr = this.state.parameter;
    var sale_team_id  = $('#selected_team_id').val();

    $.ajax({
      type: "POST",
      cache: false,
      url:  '/opportunity/listviewdata/',
      data: {
        won_lost_filter : parameter_arr,
        sales_team_id : sale_team_id
      },
      beforeSend: function () {
      },
      success: function (data) {
        if(data.success === true){
          this.setState({
            result_list:data
          });
        }
      }.bind(this)
    });


  }

  getFilteredKanBanData(){
         
    var parameter_arr = this.state.parameter;
    var sale_team_id  = $('#selected_team_id').val();

    $.ajax({
      type: "POST",
      cache: false,
      url:  '/opportunity/listdata/',
      data: {
        won_lost_filter : parameter_arr,
        sales_team_id : sale_team_id
      },
      beforeSend: function () {
      },
      success: function (data) {
           this.setState({
            result:null
          });
        
          this.setState({
            result     : data.final_data,
            RoleOfUser : data.op_user_permission,
            group_by   : data.group_by
          });
          $('#op_update_column').val(data.group_by);
        
      }.bind(this)
    }).then(function(result) {

        if(result.group_by!="creation_month" && result.group_by!="expected_closing"){
          if(this.state.RoleOfUser != 'ROLE_VIEW_OWN' && this.state.RoleOfUser != 'ROLE_VIEW_ALL'){    
            window.assign_draggable($('div.opp-column'));
            window.assign_col_sortable();
          }  
          window.assign_draggable($('div.op-card'));
          window.assign_droppable();

        }

          $(".ratings").rating();
          
          }.bind(this));


  }

  handleSalesTeamFilter(team_id,event){
    var current_id =  $('#selected_team_id').val();

    $('.ch-icon-sprite-st').css("display", "none");

   

    if(current_id==team_id){
       $('#selected_team_id').val('');
    }
    else{
       $(event.target).find('.ch-icon-sprite-st').css("display", "inline-block ");
      $('#selected_team_id').val(team_id);
    }
   
    this.getFilteredKanBanData();
    this.getFilteredDataList();
  }

  handleChange(event) {
    this.setState({
      inputValue: event.target.value
    });
  }


  handleView(view_id){
     browserHistory.push(base_url+"opportunity/view/"+view_id);
  }

  handleViewNew(){
    var view_id = $('#temp_card_view_link').attr('data-id');
    browserHistory.push(base_url+"opportunity/view/"+view_id);
  }


  
  render() {
    let result      = this.state.result
    let result_list = this.state.result_list
        
    return (
    <div>
    <Header />
      <Left />
        <div className="col-md-12 col-sm-12 col-lg-12 col-xs-12  side-collapse-container" id="main-content">
       <ColumnEditModal  ref="child" />
          

              <div className="filterbg">
                  <div className="right-part">
                        <div className="col-md-12 col-sm-12 col-lg-12 col-xs-12">
                            <div className="row">
                                  <div className="col-xs-3 col-lg-3"> 
                                    <Link to={'/opportunity/add/'} className="plusbutton">
                                      <i className="fa fa-plus">
                                      </i>
                                    </Link>
                                    
                                            
                                      &nbsp;
                                      <Link  to={'/opportunity/add/'} className=" op-card-link" > <strong>{translate('add_opportunity')} </strong></Link>
                                  </div>

                                     <a onClick={this.handleViewNew.bind(this)}  id="temp_card_view_link" ><span></span></a>  
                                  <div className="col-xs-6 col-md-6 col-sm-6 col-lg-7 pull-right">
                                      <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12 text-right pull-right ">
                                          <div className="row">
                                              <div className="col-xs-6 col-lg-8 col-md-7 col-sm-6 pad-top-10">
                                                  <ul className="list-inline inline gray">
                                                   
                                                       
                                                      <li className="dropdown"> <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="filters"><i className="filter-icon-sprite"></i> Sales Team <i className="fa fa-angle-down"></i></a>
                                                          <ul className="dropdown-menu" aria-labelledby="filters">
                                                         

                                                          {this.state.team_list!=null?
                                                            this.state.team_list.map((team , i)=>{
                                                                return(
                                                                    <li key={i} onClick = {(event)=>this.handleSalesTeamFilter(team.id, event)}><a>{team.name}<i className="ch-icon-sprite-st"></i></a></li>
                                                                  )
                                                              }):''
                                                            }
                                                         </ul>
                                                      </li>
                                                                                          

                                                      <li className="dropdown"> <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="filters"><i className="filter-icon-sprite"></i> Filters <i className="fa fa-angle-down"></i></a>
                                                          <ul className="dropdown-menu" aria-labelledby="filters">
                                                              <li onClick = {()=>this.handleFilter('won')}><a>Won{this.state.parameter.indexOf('won')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('lost')}><a href="#">Lost{this.state.parameter.indexOf('lost')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li role="separator" className="divider"></li>

                                                              {this.state.RoleOfUser != 'ROLE_VIEW_OWN'?
                                                                  <li onClick = {()=>this.handleFilter('my_opportunity')} ><a href="#">My Opportunities{this.state.parameter.indexOf('my_opportunity')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                                :''
                                                              }

                                                              {this.state.RoleOfUser != 'ROLE_VIEW_OWN'?
                                                                <li onClick = {()=>this.handleFilter('unassigned')}><a href="#">Unassigned{this.state.parameter.indexOf('unassigned')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                                :''
                                                              }

                                                              {this.state.RoleOfUser != 'ROLE_VIEW_OWN'?
                                                                <li role="separator" className="divider"></li>
                                                                :''
                                                              }



                                                              <li onClick = {()=>this.handleFilter('today_activities')} ><a href="#">{translate('today_activities')}{this.state.parameter.indexOf('today_activities')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('this_week_activities')} ><a href="#">{translate('this_week_activities')}{this.state.parameter.indexOf('this_week_activities')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('overdue_activities')} ><a href="#">{translate('overdue_activities')}{this.state.parameter.indexOf('overdue_activities')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>

                                                          </ul>
                                                      </li>
                                                      <li className="dropdown"> <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="filters"><i className="fa fa-bars"></i> Group By <i className="fa fa-angle-down"></i></a>
                                                          <ul className="dropdown-menu" aria-labelledby="filters">
                                                              <li onClick = {()=>this.handleFilter('sales_person')}><a>{translate('sales_person')}{this.state.parameter.indexOf('sales_person')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('sales_team')}><a>{translate('sales_team')}{this.state.parameter.indexOf('sales_team')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('stage')}><a>{translate('stage')}{this.state.parameter.indexOf('stage')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('lost_reason')}><a>{translate('lost_reason')}{this.state.parameter.indexOf('lost_reason')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('creation_month')}><a>{translate('creation_month')}{this.state.parameter.indexOf('creation_month')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              <li onClick = {()=>this.handleFilter('expected_closing')}><a>{translate('expected_closing')}{this.state.parameter.indexOf('expected_closing')!==-1?<i className="ch-icon-sprite"></i>:''}</a></li>
                                                              
                                                          </ul>
                                                      </li>
                                                      <li className="dropdown"> <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="favorites"><i className="fa fa-star-o"></i> Favorites <i className="fa fa-angle-down"></i></a>
                                                          <ul className="dropdown-menu" aria-labelledby="favorites">
                                                              <li>
                                                                  <a href="#"> <i className="fa fa-angle-down"></i> {translate('save_current_search')} </a>
                                                              </li>
                                                              <li className="search">
                                                                  <input type="text" placeholder="search" />
                                                              </li>
                                                              <li>
                                                                  <a href="#">
                                                                      <div className="checkbox">
                                                                          <input id="checkbox1" type="checkbox" />
                                                                          <label htmlFor="checkbox1"> {translate('use_by_default')}</label>
                                                                      </div>
                                                                  </a>
                                                              </li>
                                                              <li>
                                                                  <a href="#">
                                                                      <div className="checkbox">
                                                                          <input id="checkbox2" type="checkbox"/>
                                                                          <label htmlFor="checkbox2">{translate('share_with_all_users')}</label>
                                                                      </div>
                                                                  </a>
                                                              </li>
                                                              <li className="save">
                                                                  <button className="btn btn-primary">{translate('save')}</button>
                                                              </li>
                                                          </ul>
                                                      </li>
                                                  </ul>
                                              </div>
                                              <div className="col-xs-6 col-lg-4 col-md-5 col-sm-6">
                                                <div className="row">
                                                  <ul className="list-inline inline pagi">
                                                    <li><a href="#"><i className="fa fa-angle-left"></i></a></li>
                                                    <li><a href="#"><i className="fa fa-angle-right"></i></a></li>
                                                  </ul>
                                                  <ul className="nav nav-tabs nav-pills inline" role="tablist">
                                                    <li role="presentation" className="active"><a href="#home" aria-controls="home" role="tab" data-toggle="tab"><i className="thumb-icon-sprite"></i></a></li>
                                                    <li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="tab"><i className="list-icon-sprite"></i></a></li>
                                                  </ul>
                                                </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                            </div>
                        </div>
                  </div>
              </div>

              <div className="tab-content">
                    <div role="tabpanel" className="tab-pane active" id="home">
                        <div className="right-part">
                            <div className="all-opportunities">
                                 {result ?
                                 result.map((column, i) =>{  
                                
                                return(
                                        <div key= {i}  data-type={column.columntype=='default'?'default':''} data-id={column.id!==undefined&&column.id!=''?column.id:''} id={column.id!==undefined&&column.id!=''?'item-'+column.id:'item-'} className={ 'opp-column column_id_'+(column.id!==undefined&&column.id!=''?column.id:'')+' '+(column.foldPostion!==undefined && column.foldPostion=='0'?'opp-column--fold':'')}   >
                                            <div className={'oc-head clearfix ui-sortable-handle '+(column.WonLost=='1'?'oc-head-pista':'')}>
                                                <i aria-hidden="true" className="fa fa-arrows-h"></i>
                                                <div title="New" className="och-name pull-left"><span className="total-op-cards">{column.opportunity!==undefined?column.opportunity.length:0  } </span><span className="card-name">{column.columnName?column.columnName :'N/A'}</span></div>
                                                <input type="hidden" id={column.id!==undefined&&column.id!=''?'hidden_'+column.id:'hidden_'} value={column.json_data?column.json_data :''} />
                                                <div className="pull-right">
                                                    
                                                    <div className="dropdown">
                                                        <span aria-expanded="true" aria-haspopup="true" role="button" data-toggle="dropdown" className="och-options" id="col1"><i aria-hidden="true" className="fa fa-ellipsis-h"></i></span>
                                                        <div aria-labelledby="col1" className="dd-options ocl-options">
                                                            <span>{translate('select_option')}</span>
                                                            <ul className="column-options">
                                                                <li data-action="fold">{translate('fold')}</li>
                                                                {this.state.RoleOfUser != 'ROLE_VIEW_OWN' && this.state.group_by=='stage' ?  
                                                                  <li data-action="edit"><a data-toggle="modal" data-target="#Modal_colEdit"  onClick={() => this.refs.child.handleColumnEditClick(column.id)}  >{translate('edit')}</a></li>
                                                                   : ''}
                                                                {this.state.RoleOfUser != 'ROLE_VIEW_OWN' && this.state.group_by=='stage' ?    
                                                                  <li data-action="delete">{translate('delete')}</li>
                                                                : ''} 
                                                                <li data-action="archive">{translate('archive_records')}</li>
                                                                <li data-action="unarchive">{translate('unarchive_records')}</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <span className="new-opp-card"><i aria-hidden="true" className="fa fa-plus"  ></i></span>
                                                </div>
                                            </div>

                                              {column.opportunity!==undefined?
                                              column.opportunity.map((opportunity, j) =>{
                                                let op_id = opportunity.id!==undefined?opportunity.id:''

                                                let next_ectivity = ''
                                                if(opportunity.nextActivity!==undefined && opportunity.nextActivity!==null && opportunity.nextActivity!=''){
                                                  next_ectivity = ': '+opportunity.nextActivity
                                                }
                                                  
                                                let date = 'N/A';

                                                if(next_ectivity && opportunity.nextActivityDate!==undefined && opportunity.nextActivityDate!= null && opportunity.nextActivityDate.date !== null){
                                                     date = window.getFormattedDate(opportunity.nextActivityDate.date);
                                                  }

                                                  
                                                return(
                                                      <div key= {j} data-id={op_id} id={'item-'+op_id} className={'op-card card_'+op_id+' '+(opportunity.cardcolor!=null?opportunity.cardcolor:'card-pink')+' '+(opportunity.status!==undefined&& (opportunity.status=='0' || opportunity.status==null) ?' unarchive':' archive')}>

                          
                                                            <div className="op-card-head">
                                                              
                                                                {opportunity.currenttags!==undefined?

                                                                  opportunity.currenttags.map((currenttags, k) =>{

                                                                    return(
                                                                            <span key={k} className="tag"><i className={'fa fa-circle-o '+(getTagColor())}></i> {currenttags.name!==undefined?currenttags.name :''}&nbsp;&nbsp;</span>
                                                                          )

                                                                  }):<span className="tag">&nbsp; </span>

                                                                }

                                                                <div className="dropdown pull-right">
                                                                    <span aria-expanded="true" aria-haspopup="true" role="button" data-toggle="dropdown" className="ocrh-options" id="col1-card1"><i aria-hidden="true" className="fa fa-ellipsis-h"></i></span>
                                                                    <div aria-labelledby="col1-card1" className="dd-options ocr-options">
                                                                        <span>{translate('select_option')}</span>
                                                                            <ul className="card-options">
                                                                                <li data-action="edit">
                                                                                <Link to={BASE_FULL_URL+'/opportunity/edit/'+op_id}>
                                                                                  {translate('edit')} 
                                                                                </Link>

                                                                                </li>
                                                                                <li data-action="delete">{translate('delete')}</li>
                                                                                <li data-action="archive">{translate('archive')}</li> 
                                                                            </ul>
                                                                            <ul className="card-colors">
                                                                                <li className="white"></li>
                                                                                <li className="pink selected"></li>
                                                                                <li className="sky"></li>
                                                                                <li className="green"></li>
                                                                                <li className="orange"></li>
                                                                                <li className="gray"></li>
                                                                                <li className="blue"></li>
                                                                                <li className="violet"></li>
                                                                            </ul>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="op-card-detail" onClick={this.handleView.bind(this,op_id)} >
                                                                <div className="media-left">
                                                                    <img  className="media-object name-circle" src={DIRECTORY_PATH+'/images/'+(getCardImage())} />
                                                                </div>

                                                                <div className="media-body">
                                                                    <span className="title">{opportunity.name!==undefined?opportunity.name :'N/A'}
                                                                    </span>
                                                                    <span className="cost">{opportunity.estimatedRevenue!==null && opportunity.estimatedRevenue!='' ?  numeral(opportunity.estimatedRevenue).format('$0,0.00') :'N/A' }</span>
                                                                    <span className="date">{date+next_ectivity}</span>
                                                                    <div data-rating={opportunity.ratings!==undefined && opportunity.ratings!==null && opportunity.ratings!=='' ? opportunity.ratings : 0} className="ratings">
                                                                      
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                      </div>
                                                      )
                                              })
                                              :''
                                            }
                                             
                                        </div>
                                        )})
                                        :<div></div>
                                     }
                                 
                                    {this.state.group_by=='stage'?
                                       <div className="opp-column opp-column--fold add-new-oc">
                                            <div className="oc-head">
                                                <i className="fa fa-angle-right" aria-hidden="true"></i>
                                                <i className="fa fa-plus" aria-hidden="true"></i>
                                                <div className="och-name">{translate('add_new_column')}</div>
                                            </div>
                                            <div className="new-column-detail">
                                                <form id="addcolumn" action="" method="post">
                                                    <input name="column_name" type="text" placeholder={translate('add')}  />
                                                    <input type="submit" className="addcolumn" value={translate('add')} />
                                                    <input type="reset" value={translate('discard')} />
                                                </form>
                                            </div>
                                        </div>
                                        :'' 
                                        }    

                            </div>
                        </div>
                    </div>
                    <div role="tabpanel" className="tab-pane" id="profile">
                        <div className="list-block">
                            <table className="table" width="100%">
                                <thead>
                                    <tr>
                                        <th width="2%">
                                            <div className="checkbox">
                                                <input id="checkbox3" type="checkbox" />
                                                <label htmlFor="checkbox3"></label>
                                            </div>
                                        </th>
                                        <th width="8%">{translate('created_date')}</th>
                                        <th width="20%">{translate('opportunity')}</th>
                                        <th width="9%">{translate('next_activity')}</th>
                                        <th width="12%">{translate('next_activity_date')}</th>
                                        <th width="9%">{translate('stage')} </th>
                                        <th width="14%">{translate('expected_revenue')}  </th>
                                        <th width="10%">{translate('probability')} </th>
                                        <th width="8%">{translate('sales_team')}   </th>
                                        <th width="8%">{translate('sales_person')}  </th>
                                        
                                    </tr>
                                </thead>
                                <tbody>
                                {result_list?
                                    result_list.opportunity.map((opportunity, i)=>{

                                      return(
                                         
                                            <tr className = "op-raw" key = {i} >
                                                <td>
                                                    <div className="checkbox">
                                                        <input  type="checkbox" />
                                                        <label htmlFor="checkbox4"></label>
                                                    </div>
                                                </td>
                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.CreatedAt!==undefined && opportunity.CreatedAt!==null && opportunity.CreatedAt!=''?  window.getFormattedDateTime(opportunity.CreatedAt.date) :''} </td>
                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.name!==undefined && opportunity.name!==null && opportunity.name!=''? opportunity.name:''}</td>

                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.nextActivity!==undefined && opportunity.nextActivity!==null && opportunity.nextActivity!=''? opportunity.nextActivity:'N/A'} </td>

                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.nextActivityDate!==undefined && opportunity.nextActivityDate!==null && opportunity.nextActivityDate!=''?window.getFormattedDate(opportunity.nextActivityDate.date):'N/A'} </td>

                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.columnName!==undefined && opportunity.columnName!==null && opportunity.columnName!=''? opportunity.columnName:''}</td>

                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.estimatedRevenue!==undefined && opportunity.estimatedRevenue!==null && opportunity.estimatedRevenue!=''?  numeral(opportunity.estimatedRevenue).format('$0,0.00'):'N/A'}</td>

                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.probability!==undefined && opportunity.probability!==null && opportunity.probability!=''? opportunity.probability+'%':''}&nbsp; </td>

                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.currentsalesteam!==undefined && opportunity.currentsalesteam!==null && opportunity.currentsalesteam!=''? opportunity.currentsalesteam:''}</td>
                                                <td onClick={this.handleView.bind(this,opportunity.id)}>{opportunity.currentsalesperson!==undefined && opportunity.currentsalesperson!==null && opportunity.currentsalesperson!=''? opportunity.currentsalesperson:''}</td>
                                                
                                            </tr>
                                        )

                                    }):''

                                }
                                    
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
        <input type="hidden" id="op_update_column"  onChange={this.handleChange} value={this.state.inputValue} />
        <input type="hidden" id="selected_team_id" onChange={this.handleChange} value={this.state.inputValue} />
        </div>
    </div>

    );
  }
}

module.exports = OpportunityList;



