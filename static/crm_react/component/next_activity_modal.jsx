import React from 'react';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';
import { Router, Route, Link, browserHistory } from 'react-router';
import {DateField, DatePicker} from 'react-date-picker';
import Message from 'crm_react/component/message';
import {translate} from 'crm_react/common/language';

class  NextActivityModel extends React.Component {
  constructor(props) {
        super(props);
        this.state = {

             // master_id: this.props.props_data.master_id,
             messages:[],

        }

        this.handleChange = this.handleChange.bind(this)

    }




    handleChange(event){
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name] : value,
    })

  }

    openModalWithData(id){

        if(id!=0 && id>0){

            $.ajax({
            type: "POST",
            cache: false,
            url: BASE_FULL_URL + '/general/getMessageData/'+id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                    var user = data.user
                    this.setState({
                        id                      : user.id,
                        summary                 : user.summary,
                        next_activity           : user.next_activity,
                        next_activity_reminder  : user.next_activity_reminder,
                        next_activity_date      : user.next_activity_date,
                        title     : "Edit : Next Activity",
                    })
                    $('#nextactivity_model').modal('show');
                }
            }.bind(this)
        });

        }
        else if(id==0){
            this.setState({
                        id        : 0,
                        summary      : '',
                        next_activity     : '',
                        next_activity_reminder     : '',
                        next_activity_date    : '',
                        title     : "Add : Next Activity",
                    })
            $('#nextactivity_model').modal('show');
        }


    }



handelUpdateLogOnly(next_activity , summary, next_activity_reminder,next_activity_date){

    var q_id = this.props.op_id;
    var Data = new Array();
    Data.push({'name':'id' , 'value':''});
    Data.push({'name':'q_id' , 'value':q_id});
    Data.push({'name':'next_activity' , 'value':next_activity});
    Data.push({'name':'summary' , 'value':summary});
    Data.push({'name':'next_activity_date' , 'value':next_activity_date});
    Data.push({'name':'next_activity_reminder' , 'value':next_activity_reminder });
    Data.push({'name':'action' , 'value':'log_activity' });



    $.ajax({
      type: "POST",
      cache: false,
      url: BASE_FULL_URL + '/general/logactivity/',
      data: {
        ajax: true,
        fields:JSON.stringify(Data),
      },
      beforeSend: function () {
      },
      success: function (data) {
        if(data.success === true){
        this.setState({
                    next_activity     : '',
                    summary     : '',
                    next_activity_date  : '',
                    next_activity_reminder :'',
                  })
        this.props.handleparentInput()
        }
      }.bind(this)
    });
  }

handelUpdateDataLogOnly(next_activity , summary, next_activity_reminder,next_activity_date,id){

    var q_id = this.props.op_id;
    var Data = new Array();
    Data.push({'name':'q_id' , 'value':q_id});
    Data.push({'name':'id' , 'value':id});
    Data.push({'name':'next_activity' , 'value':next_activity});
    Data.push({'name':'summary' , 'value':summary});
    Data.push({'name':'next_activity_date' , 'value':next_activity_date});
    Data.push({'name':'next_activity_reminder' , 'value':next_activity_reminder });
    Data.push({'name':'action' , 'value':'log_activity' });



    $.ajax({
      type: "POST",
      cache: false,
      url: BASE_FULL_URL + '/general/logactivity/',
      data: {
        ajax: true,
        fields:JSON.stringify(Data),
      },
      beforeSend: function () {
      },
      success: function (data) {
        if(data.success === true){
      
             this.setState({
                    next_activity     : '',
                    summary     : '',
                    next_activity_date  : '',
                    next_activity_reminder :'',
                  })
         this.props.handleparentInput()
        }
      }.bind(this)
    });

  }
  
handelUpdateDataSchedule(activity , summary, next_activity_reminder,next_activity_date,id){
    var q_id = this.props.op_id;
   
    var Data = new Array();
    Data.push({'name':'id' , 'value':id});
    Data.push({'name':'q_id' , 'value':q_id});
    Data.push({'name':'next_activity' , 'value':activity});
    Data.push({'name':'next_activity_date' , 'value':next_activity_date});
    Data.push({'name':'next_activity_reminder' , 'value':next_activity_reminder});
    Data.push({'name':'summary' , 'value':summary});
    Data.push({'name':'action' , 'value':'log_activity' });



    $.ajax({
      type: "POST",
      cache: false,
      url: BASE_FULL_URL + '/general/scheduleactvity/',
      data: {
        ajax: true,
        fields:JSON.stringify(Data),
      },
      beforeSend: function () {
      },
      success: function (data) {
        if(data.success === true && activity!=''){
      
                 this.setState({
                    next_activity     : '',
                    summary     : '',
                    next_activity_date  : '',
                    next_activity_reminder :'',
                    })
          this.props.handleparentInput()
        }
      }.bind(this)
    });
       
  }
handelUpdateSchedule(activity , summary, next_activity_reminder,next_activity_date){
    var q_id = this.props.op_id;

    var Data = new Array();
    Data.push({'name':'id' , 'value':''});
    Data.push({'name':'q_id' , 'value':q_id});
    Data.push({'name':'next_activity' , 'value':activity});
    Data.push({'name':'next_activity_date' , 'value':next_activity_date});
    Data.push({'name':'next_activity_reminder' , 'value':next_activity_reminder});
    Data.push({'name':'summary' , 'value':summary});
    Data.push({'name':'action' , 'value':'log_activity' });



    $.ajax({
      type: "POST",
      cache: false,
      url: BASE_FULL_URL + '/general/scheduleactvity/',
      data: {
        ajax: true,
        fields:JSON.stringify(Data),
      },
      beforeSend: function () {
      },
      success: function (data) {
        if(data.success === true && activity!=''){

                 this.setState({
                    next_activity     : '',
                    summary     : '',
                    next_activity_date  : '',
                    next_activity_reminder :'',
                    })
         this.props.handleparentInput()
        }
      }.bind(this)
    });
       
  }

submitLogonly(){


      let id = this.state.id;
      let activity = this.state.next_activity;
      let summary = this.state.summary;
      let next_activity_date =  $('#log_actvity_frm').find('div.log_expected_closing input').val();
      let next_activity_reminder =  $('#log_actvity_frm').find('div.log_next_activity_reminder input').val();

    if(id !=0 && id>0){
      this.handelUpdateDataLogOnly(activity , summary, next_activity_reminder, next_activity_date,id);
    }
    else{
      this.handelUpdateLogOnly(activity , summary, next_activity_reminder, next_activity_date);
    }
      $('#nextactivity_model').modal('hide');
    }


submitLogandShedule(){
      let id = this.state.id;
      let activity = this.state.next_activity;
      let summary = this.state.summary;
      let next_activity_date = $('#log_actvity_frm').find('div.log_expected_closing input').val();
      let next_activity_reminder =  $('#log_actvity_frm').find('div.log_next_activity_reminder input').val();

    if(id !=0 && id>0)
    {
       this.handelUpdateDataSchedule(activity , summary,next_activity_reminder, next_activity_date,id);
      }
    else
    {
     this.handelUpdateSchedule(activity , summary,next_activity_reminder, next_activity_date,);
    }
      

      $('#nextactivity_model').modal('hide');

    }


  handelDateChange(event){
    this.setState({
      next_activity_date:event,
    }) 
  
  }

  handleClose(){
        $('#nextactivity_model').modal('hide');    
    }

handleClicknextactivity(name)
  {
    this.setState({next_activity:name});  
  }


    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"   ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li>{this.props.title}</li>
                    </ul>
                </div>
        );
    }


    _renderfooter(){

        return(
            <div className="modal-footer modal-text-left">
              <button type="button" id="submit_logonly" className="btn btn-primary" onClick={this.submitLogonly.bind(this)}  >{translate('schedule')}
                </button>
                <button type="button" id="submit_log_shedule" className="btn btn-primary" onClick={this.submitLogandShedule.bind(this)} >{translate('mark_as_done')}
                </button>
                

                <button type="button" id="delete_close" className="btn btn-default" onClick={this.handleClose.bind(this)} data-dismiss="modal">{translate('cancel')}
                </button>     
            </div>
        );
    }

    _renderBody(){
       
        return (
                <form id="log_actvity_frm" className="edit-form" action="" method="POST">
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                        <div className="col-xs-12 col-sm-12 col-md-5 col-lg-5 border-right">
                            <table className="detail_table">
                                <tbody>
                                    <tr>
                                        <td><label className="text-muted control-label">{translate('activity')}</label></td>
                                        <td>
                                            <div className="form-group" data-name="tags" data-type="multiselect">
                                                <div className="dropdown autocomplete">
                                                    <input type="text" id="log_next_activity" name="next_activity" className="form-control" value={this.state.next_activity} data-toggle="dropdown" />
                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                        <i id="main_form_tags_down_icon" className="fa fa-angle-down black"></i>
                                                    </span>
                                                    
                                                    <div className="dd-options">
                                                        <ul className="options-list" required>
                                                            <li onClick={this.handleClicknextactivity.bind(this,'Call')} >{translate('call')}</li>
                                                            <li onClick={this.handleClicknextactivity.bind(this,'Email')} >{translate('email')}</li>
                                                            <li onClick={this.handleClicknextactivity.bind(this,'Message')} >{translate('message')}</li>
                                                        </ul>
                                                    </div>

                                                </div>
                                            </div>

                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="text-muted control-label">{translate('summary')}</label></td>
                                        <td>
                                            <div className="form-group">
                                                <input  value = {this.state.summary}  onChange = {this.handleChange} name="summary" className ="form-control" id = "log_summary" required/>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-xs-12 col-sm-12 col-md-7 col-lg-7">
                            <table className="detail_table">
                                <tbody>
                                    <tr>
                                        <td><label className="text-muted control-label">{translate('label_expected_closing')}</label></td>
                                        <td>
                                            <div className="form-group  log_expected_closing">
                                            
                                                     <DateField 
                                                value={this.state.next_activity_date}
                                                onChange={(newDate) => this.setState({next_activity_date: newDate})}
                                                 updateOnDateClick={true}
                                                 collapseOnDateClick={true}
                                                 dateFormat="MM/DD/YYYY">

                                                            <DatePicker
                                                              navigation={true}
                                                              locale="en"
                                                              highlightWeekends={true}
                                                              highlightToday={true}
                                                              weekNumbers={true}
                                                              minDate = {new Date()}
                                                              weekStartDay={0}
                                                              footer={false}/>
                                                    </DateField>
                                            </div>
                                        </td>
                                    </tr>

                                <tr>
                                    <td><label className="text-muted control-label">{translate('label_next_activity_reminder')}</label></td>
                                    <td>
                                      <div className="form-group log_next_activity_reminder">
                                      
                                                <DateField
                                                value={this.state.next_activity_reminder}
                                                onChange={(newDate) => this.setState({next_activity_reminder: newDate})}
                                                 updateOnDateClick={true}
                                                 collapseOnDateClick={true}
                                                 dateFormat="MM/DD/YYYY">

                                                              <DatePicker
                                                                navigation={true}
                                                                locale="en"
                                                                highlightWeekends={true}
                                                                highlightToday={true}
                                                                minDate = {new Date()}
                                                                weekNumbers={true}
                                                                weekStartDay={0}
                                                                footer={false}/>
                                                      </DateField>
                                      </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                </form>
              )
    }

     render() {

        return (
            <div className="modal fade" id="nextactivity_model" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-lg ">
                <div className="modal-content">
                  { this._renderHeader() }
                  { this._renderBody() }
                  { this._renderfooter() }

                </div>
              </div>
            </div>
        );
    }

}



module.exports = NextActivityModel;