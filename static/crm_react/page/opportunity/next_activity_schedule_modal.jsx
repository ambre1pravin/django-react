import React from 'react';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';
import { Router, Route, Link, browserHistory } from 'react-router'
import {DateField, DatePicker} from 'react-date-picker';

class  NextActivityScheduleModel extends React.Component {
	constructor(props) {
        super(props);

        this.state = {
          summary:'',
          next_activity : ''
        }

        this.handleChange = this.handleChange.bind(this)
    }

  handleSheduleActivity(){
      let isShedule = false;

      let activity = this.state.next_activity;
      let activity_date = $('#shedule_na_form').find('div.shedule_next_activity_date input').val();
      let summary = this.state.summary;

      this.props.handelUpdateSchedule(activity , activity_date, summary);

      $('#nextactivity_shedule_model').modal('hide');
  }

  handleChange(event){
    const target = event.target;
    const name = target.name;
    const value = target.value;

    this.setState({
      [name] : value,
    })

  }

handleClicknextactivity(name)
  {
    this.setState({next_activity: name})
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

                <button type="button" id="submit_log_shedule" className="btn btn-primary"  onClick={this.handleSheduleActivity.bind(this)}  >Schedule Activity
                </button>
                <button type="button" id="delete_close" className="btn btn-default" data-dismiss="modal">Cancel
                </button>     
            </div>
        );
    }

    _renderBody(){  
        return (
                <form id="shedule_na_form" className="edit-form" action="" method="POST">
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                            <table className="detail_table">
                                <tbody>
                                    <tr>
                                        <td><label className="text-muted control-label">Activity</label></td>
                                        <td>
                                            <div className="form-group" data-name="tags" data-type="multiselect">
                                                <div className="dropdown autocomplete">
                                                    <input type="text" id="shedule_next_activity" name="next_activity" className="form-control" value={this.state.next_activity} data-toggle="dropdown" />
                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                        <i id="main_form_tags_down_icon" className="fa fa-angle-down black"></i>
                                                    </span>
                                                    
                                                    <div className="dd-options">
                                                        <ul className="options-list">
                                                            <li onClick={this.handleClicknextactivity.bind(this,'Call')} >Call</li>
                                                            <li onClick={this.handleClicknextactivity.bind(this,'Email')} >Email</li>
                                                            <li onClick={this.handleClicknextactivity.bind(this,'Message')} >Message</li>
                                                        </ul>
                                                    </div>

                                                </div>
                                            </div>

                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="text-muted control-label">Next Activity Date</label></td>
                                        <td>
                                            <div className="form-group shedule_next_activity_date">

                                                    <DateField  dateFormat="MM/DD/YYYY"
                                                                updateOnDateClick={true}
                                                                collapseOnDateClick={true}
                                                                defaultValue={''}
                                                                showClock={false}>

                                                            <DatePicker
                                                              navigation={true}
                                                              locale="en"
                                                              highlightWeekends={true}
                                                              highlightToday={true}
                                                              weekNumbers={true}
                                                              weekStartDay={0}
                                                              footer={false}/>
                                                    </DateField>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="text-muted control-label">Summary</label></td>
                                        <td>
                                            <div className="form-group">
                                                <input  value={this.state.summary} onChange = {this.handleChange}   name="summary"  className ="form-control" id = "shedule_summary" />
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </form>
              )
    }

     render() {

        return (
            <div className="modal fade" id="nextactivity_shedule_model" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
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

module.exports = NextActivityScheduleModel;