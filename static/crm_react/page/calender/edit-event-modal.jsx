import React,{Component} from 'react';
import state, { IMAGE_PATH, language} from 'crm_react/common/state';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { DateField, DatePicker  } from 'react-date-picker'
import CreateCustomerModal from 'crm_react/component/create-customer-modal';
import MultiSelect from 'crm_react/page/contact/multiselect';
import { getCookie,modal_style } from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';
import {NotificationManager} from 'react-notifications';


class EditEventModal extends Component{
    constructor(props) {
        super(props);
      this.state = {
            event_id:(this.props.event_id!=undefined) ? this.props.event_id:'',
            meeting:this.props.meeting,
            start_time: moment(this.props.start_time).format('YYYY-MM-DD HH:mm:ss'),
            end_time: this.props.end_time,
            all_day: this.props.all_day,
            all_day_start:moment(this.props.start_time).format('YYYY-MM-DD'),
            all_day_end:moment(this.props.end_time).format('YYYY-MM-DD'),
            fields:[],
            tags:[],
            selected_attendees:(this.props.selected_attendees!=undefined && this.props.selected_attendees.length > 0 ) ? this.props.selected_attendees:[],
            selected_tags:(this.props.selected_tags!=undefined && this.props.selected_tags.length > 0 ) ? this.props.selected_tags:[],
            attendees: [],
            priority_level_text:'Normal',
            priority_level_value:'1',
            meeitng_type_text:'Virtual',
            meeitng_type_value:'1',
            delete_contact:(this.props.delete_contact!=undefined ) ? this.props.delete_contact:false,
          location :(this.props.location!=undefined ) ? this.props.location:null,

      }
      //get fields
      this.serverRequest = $.get('/contact/index/', function (data) {
          this.setState({fields:data.fields, main_contact_profile_image:data.profile_image});
      }.bind(this));

      // get tags
      this.serverRequest = $.get('/contact/tags/', function (tagdata) {
          this.setState({tags:tagdata});
      }.bind(this));

      // get attendies
      this.serverRequest = $.get('/calender/get_attendies/', function (attendees) {
          this.setState({attendees:attendees.attendies_list});
      }.bind(this));
    }

    handle_close(index) {
        ModalManager.close(<EditEventModal modal_id = "edit_event_modal" onRequestClose={() => true} />);
    }

    handle_delete(){
        if(this.props.event_id > 0) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/calender/delete_event/',
                data: {
                    event: this.props.event_id,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    //this.setState({save_button_disable:'btn btn-primary disabled'})
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        NotificationManager.success(data.msg, 'success', 5000);
                        ModalManager.close(<EditEventModal modal_id="edit_event_modal"
                                                           onRequestClose={() => true}/>);
                        $('#calendar').fullCalendar('refetchEvents');

                    } else {
                        //To do trap errors
                    }
                }.bind(this)
            });
        }
    }

    change_meeting_text(event){
        this.setState({meeting : event.target.value})
    }

    handle_priority_level(priority_text, priority_value){
        this.setState({priority_level_text:priority_text,priority_level_value:priority_value})
    }

    handle_meeitng_type(text, value){
        this.setState({meeitng_type_text:text, meeitng_type_value:value})
    }

    handle_save_meeting(){
        var csrftoken = getCookie('csrftoken');
        if ( $('#meeting-form').valid() ) {
            var selected_tags =  this.process_multiselect('ul#main_form_tagbox');
            var attendies =  this.process_multiselect('ul#attendies');
            var meeting_data ={
                'event_id':this.state.event_id,
                'event':this.state.meeting,
                'start_time':moment(this.state.start_time).format('YYYY-MM-DD HH:mm:ss'),
                'end_time':moment(this.state.end_time).format('YYYY-MM-DD HH:mm:ss'),
                'all_day':this.state.all_day,
                'priority_level':this.state.priority_level_value,
                'meeting_type':this.state.meeitng_type_value,
                'selected_tags':selected_tags,
                'attendies':attendies
            }
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/calender/event_save/',
                data: {
                    event:JSON.stringify(meeting_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    //this.setState({save_button_disable:'btn btn-primary disabled'})
                }.bind(this),
                success: function (data) {
                   if(data.success === true){
                       if(data.meeting > 0){
                            NotificationManager.success(data.msg, 'success',5000);
                            ModalManager.close(<EditEventModal modal_id = "edit_event_modal" onRequestClose={() => true} />);
                           $('#calendar').fullCalendar('refetchEvents');
                       }else{
                           // NotificationManager.error(data.msg, 'Error',5000);
                       }
                   }else{
                    //To do trap errors
                   }
                }.bind(this)
            });
        }
    }

    process_multiselect(selector) {
        var tags_list = [];
        var tags_html = $(selector).children('li')
        if(tags_html.length > 0){
            tags_html.each(function() {
                var tag = {'id': $(this).attr('data-id') , 'name':$(this).attr('data-tag-name'),'color':$(this).attr('data-color')}
                tags_list.push(tag);
            });
        }
        return tags_list;
    }

    handle_all_day(){
        let start = this.state.start_time
        this.setState({all_day: !this.state.all_day })
        alert(this.state.all_day)
    }

    onChange_start_date(date){
        this.setState({start_time: moment(date).format('YYYY-MM-DD HH:mm:ss')})
    }

    onChange_end_date(date){
        this.setState({end_time: moment(date).format('YYYY-MM-DD HH:mm:ss')})
    }

    openCreateCustomerModal(company_name){
        if (this.state.fields.length >0){
            ModalManager.open(<CreateCustomerModal
                    title = "Create Customer"
                    contact_name={this.state.input_value}
                    modal_id = "create-customer-modal"
                    form_id =  "create-customer-form"
                    fields = {this.state.fields}
                    profile_image= {this.state.main_contact_profile_image}
                    onRequestClose={() => true}
                   />
            );
        }
    }

   render_table_left(){

          var data = {'data_id':0,
                'name':'Attendies',
                'type':'multiselect',
                'input_value': '',
                'default_value':'',
                'display_position':'',
                'display_type':'',
                'ajax_url':'/calender/create_attendies/',
                'calender_module':true,
                'tag_html_obj_id':'attendies',
                'input_value':this.state.selected_attendees
            }
        var initialLocaleCode = 'en';
        if(language ==='French')
            initialLocaleCode = 'fr';
        return(
             <table className="detail_table">
                <tbody>

                    <tr>
                        <td> <label className="text-muted control-label">Starting At</label> </td>
                        <td>
                            <div className="form-group">
                            { !this.state.all_day ?
                                        <DateField
                                            defaultValue ={ this.props.start_time }
                                            dateFormat="YYYY-MM-DD HH:mm:ss"
                                            updateOnDateClick={true}
                                            collapseOnDateClick={false}
                                            showClock={true}
                                            id="start"
                                        >
                                          <DatePicker
                                            navigation={true}
                                            locale={initialLocaleCode}
                                            forceValidDate={true}
                                            highlightWeekends={true}
                                            highlightToday={true}
                                            weekNumbers={true}
                                            weekStartDay={0}
                                            footer={false}
                                            onChange={this.onChange_start_date.bind(this)}
                                          />
                                        </DateField>
                            :<input name="all_day_start" className="form-control" value={this.state.all_day_start} readOnly="" type="text" />
                            }

                            </div>
                        </td>
                    </tr>


                    <tr>
                        <td> <label className="text-muted control-label">Ending At</label> </td>
                        <td>
                            <div className="form-group ">
                            { !this.state.all_day ?
                                    <DateField
                                            defaultValue ={this.state.end_time}
                                            dateFormat="YYYY-MM-DD HH:mm:ss"
                                            updateOnDateClick={true}
                                            collapseOnDateClick={false}
                                            showClock={true}
                                        >
                                          <DatePicker
                                            navigation={true}
                                            locale={initialLocaleCode}
                                            forceValidDate={true}
                                            highlightWeekends={true}
                                            highlightToday={true}
                                            weekNumbers={true}
                                            weekStartDay={0}
                                            footer={false}
                                            onChange={this.onChange_end_date.bind(this)}
                                          />
                                        </DateField>
                               :<input name="all_day_end" className="form-control" value={this.state.all_day_end} readOnly="" type="text" />
                            }
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td> <label className="text-muted control-label">All Day</label> </td>
                        <td>
                            <div className="form-group">
                                <ul className="list-inline">
                                    <li>
                                        <div className="checkbox">
                                            <input id="event-all-day"  type="checkbox"  checked={this.state.all_day}  onChange={this.handle_all_day.bind(this)} />
                                            <label>All Day</label>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    {   this.state.attendees.length > 0 ?
                            <MultiSelect
                               component_data ={data}
                               tags ={this.state.attendees}
                            />
                        :null
                    }
                </tbody>
            </table>
        );
   }

   render_table_right(){
       var data = {'data_id':0,
                'name':'Tags',
                'type':'multiselect',
                'input_value': '',
                'default_value':'',
                'display_position':'',
                'display_type':'',
                'input_value':this.state.selected_tags
            }
        return(
            <table className="detail_table">
                <tbody>
                    <tr>
                        <td> <label className="text-muted control-label">Location</label> </td>
                        <td>
                            <div className="form-group">
                                <input name="event-location" className="form-control" value={this.state.location} type="text" />
                            </div>
                        </td>
                    </tr>
                    {   this.state.tags.length > 0 ?

                            <MultiSelect
                                   component_data ={data}
                                   tags ={this.state.tags}
                            />
                        :null
                    }
                    <tr>
                        <td> <label className="text-muted control-label">Priority Level</label> </td>
                        <td>
                            <div className="form-group">
                                <div className="dropdown autoComplete">
                                    <input name="event-priority" placeholder="Priority Level" data-toggle="dropdown" className="form-control" value={this.state.priority_level_text} aria-expanded="false" autoComplete="off" type="text" />
                                        <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                            <i className="fa fa-angle-down"></i>
                                        </span>
                                    <div className="dropdown-menu dd-options">
                                        <ul className="options-list">
                                            <li data-id="1" onClick={this.handle_priority_level.bind(this,'Normal',1)}>Normal</li>
                                            <li data-id="2" onClick={this.handle_priority_level.bind(this,'Medium',2)}>Medium</li>
                                            <li data-id="3" onClick={this.handle_priority_level.bind(this,'High',3)}>High</li>
                                        </ul>
                                    </div>
                                </div>
                          </div>
                        </td>
                    </tr>
                    <tr>
                        <td> <label className="text-muted control-label">Meeting Type</label> </td>
                        <td>
                            <div className="form-group">
                                <div className="dropdown autoComplete">
                                    <input name="event-type" placeholder="Meeting Type" data-toggle="dropdown" className="form-control" value={this.state.meeitng_type_text} aria-expanded="false" autoComplete="off" type="text" />
                                    <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                        <i className="fa fa-angle-down"></i>
                                    </span>
                                    <div className="dropdown-menu dd-options">
                                        <ul className="options-list">
                                            <li data-id="1" onClick={this.handle_meeitng_type.bind(this,'Virtual',1)}>Virtual</li>
                                            <li data-id="2" onClick={this.handle_meeitng_type.bind(this,'Physical',2)}>Physical</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        );
   }


   render(){
      return (
         <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg">
            <div className="modal-content">
                <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handle_close.bind(this)}>
                            <span aria-hidden="true" >×</span>
                        </button>
                    <h4 className="modal-title">{translate('label_meetings')} {translate('label_details')}</h4>
                </div>
                <div className="modal-body">
                    <form id="meeting-form">
                        <div className="row row__flex edit-form">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <p className="text-muted">{translate('label_agenda')}</p>
                                <h2 className="meeting-agenda form-group">
                                <input required name="meeting-agenda" className="form-control" onChange={this.change_meeting_text.bind(this)} value={this.state.meeting} type="text" placeholder="Meeting Name"/></h2>
                            </div>
                        </div>
                        <div className="row row__flex edit-form">
                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                            {this.render_table_left()}
                            </div>
                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                            {this.render_table_right()}
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-default" data-dismiss="modal" onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                    { this.state.delete_contact ?
                    <button type="button" className="btn btn-default btn-primary" data-dismiss="modal" onClick={this.handle_delete.bind(this)}>{translate('button_delete')}</button>
                    :null
                    }
                    <button type="button" className="btn btn-default btn-primary save-meeting" onClick={this.handle_save_meeting.bind(this)}>{translate('button_save')}</button>
                </div>
            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = EditEventModal;