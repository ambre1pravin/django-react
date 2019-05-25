import React from 'react';
import { NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import 'react-date-picker/index.css'
import EditEventModal from 'crm_react/page/calender/edit-event-modal';
import { translate} from 'crm_react/common/language';
import { getCookie,modal_style } from 'crm_react/common/helper';


class EventModal extends React.Component{
    constructor(props) {
        super(props);
      this.state = {
            meeting:'',
            start_time: this.props.start_time,
            end_time: this.props.end_time,
            all_day: this.props.all_day,
            meeting_desc:'',
            attendies:[],
            save_btn_class:'disabled',
            meeting_input_class:'',

      }
    }

    handleClose(index) {
        ModalManager.close(<EventModal modal_id = "create_meeting_modal" onRequestClose={() => true} />);
    }

    ajax_common(meeting_data){

            var meeting_data = {
                'event': meeting_data.event,
                'start_time': moment(meeting_data.start).format('YYYY-MM-DD HH:mm:ss'),
                'end_time': moment(meeting_data.end).format('YYYY-MM-DD HH:mm:ss'),
                'all_day': meeting_data.all_day,
                'priority_level': 1,
                'meeting_type': 1,
                'selected_tags': [],
                'attendies': []
            }
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/calender/event_save/',
                data: {
                    event: JSON.stringify(meeting_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        if (data.meeting > 0) {
                            NotificationManager.success(data.msg, 'success', 5000);
                            ModalManager.close(<EventModal modal_id="create_meeting_modal"
                                                           onRequestClose={() => true}/>);
                            $('#calendar').fullCalendar('refetchEvents');
                        } else {
                            NotificationManager.error(data.msg, 'Error', 5000);
                        }
                    } else {
                        //To do trap errors
                    }
                }.bind(this)
            });

    }

    handleSave(){
        let meeting = this.state.meeting
        if(meeting !='') {
            var data_dic = {
                'event': meeting,
                'start': this.state.start_time,
                'end': this.state.end_time,
                'all_day': this.state.all_day
            }
            this.ajax_common(data_dic)
        }else{
            this.setState({meeting_input_class:'has-error',})
        }

    }

    change_meeting_text(event) {
        console.log(event.target.value)
        if (event.target.value != ''){
            this.setState({meeting: event.target.value, meeting_input_class: '', save_btn_class: ''})
        }else {
             this.setState({meeting:'',meeting_input_class: 'has-error', save_btn_class: 'disabled'})
        }
    }

    change_meeting_desc(event){
        this.setState({meeting_desc : event.target.value})
    }

    handle_edit(){
        ModalManager.open(
                <EditEventModal
                    title = "Contact Field Mapping"
                    modal_id = "edit_event_modal"
                    form_id =  "mapping_model"
                    meeting= {this.state.meeting}
                    start_time= {this.props.start_time}
                    end_time= { this.props.end_time}
                    all_day= {this.props.all_day}
                    selected_attendees = {[]}
                    onRequestClose={() => true}
                />
        )
        ModalManager.close(<EventModal modal_id = "create_meeting_modal" onRequestClose={() => true} />);
    }

    render(){
      return (
         <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div  className="modal-header">
                            <button  className="close" type="button" onClick={this.handleClose.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                        <h4 className="modal-title">{translate('button_create')} {translate('label_meetings')}</h4>
                    </div>
                    <div className="modal-body">
                        <form id="single-meeting-form">
                            <div className={this.state.meeting_input_class}>
                            <input className="form-control" name="new-event-name" value={this.state.meeting} onChange={this.change_meeting_text.bind(this)} placeholder="Meeting Name"  type="text" />
                            </div>
                         </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-default"  onClick={this.handleClose.bind(this)}>{translate('button_close')}</button>
                        <button type="button" className="btn btn-primary edit" onClick={this.handle_edit.bind(this)}>{translate('button_edit')}</button>
                        <button type="button" className={' btn btn-default btn-primary save-meeting ' + this.state.save_btn_class} onClick={this.handleSave.bind(this)}>{translate('button_save')}</button>
                    </div>
                </div>
            </div>
         </Modal>
      );
   }
}

module.exports = EventModal;