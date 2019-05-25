import React,{Component} from 'react';
import ReactTooltip from 'react-tooltip'
import {language} from 'crm_react/common/state';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { DateField, DatePicker  } from 'react-date-picker';
import {  getCookie, modal_style, ModalbodyStyle} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';
import CustomEditor from 'crm_react/page/email_template/custom-editor';

class SheduleActivityModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity_id:this.props.activity_id,
            onRequestClose : this.props.onRequestClose,
            activity:this.props.activity,
            summery:this.props.summery,
            expected_closing_date:this.props.expected_closing_date,
            next_reminder_date:this.props.next_reminder_date,
            module_id:this.props.module_id,
            module_name:this.props.module_name,
            master_id:this.props.master_id,
            modal_action:this.props.modal_action,
            selected_hour:null,
            selected_mintue:null,
            hours :['00.00','00.15','00.30','00.45',
                    '01.00','01.15','01.30','01.45',
                    '02.00','02.15','02.30','02.45',
                    '03.00','03.15','03.30','03.45',
                    '04.00','04.15','04.30','04.45',
                    '05.00','05.15','05.30','05.45',
                    '06.00','06.15','06.30','06.45',
                    '07.00','07.15','07.30','07.45',
                    '08.00','08.15','08.30','08.45',
                    '09.00','09.15','09.30','09.45',
                    '10.00','10.15','10.30','10.45',
                    '11.00','11.15','11.30','11.45',
                    '12.00','12.15','12.30','12.45',
                    '13.00','13.15','13.30','13.45',
                    '14.00','14.15','14.30','14.45',
                    '15.00','15.15','15.30','15.45',
                    '16.00','16.15','16.30','16.45',
                    '17.00','17.15','17.30','17.45',
                    '18.00','18.15','18.30','18.45',
                    '19.00','19.15','19.30','19.45',
                    '20.00','20.15','20.30','20.45',
                    '21.00','21.15','21.30','21.45',
                    '22.00','22.15','22.30','22.45',
                    '23.00','23.15','23.30','23.45'
            ],
            mintues :['00.00','00.15','00.30','00.45',
                    '01.00','01.15','01.30','01.45',
                    '02.00','02.15','02.30','02.45',
                    '03.00','03.15','03.30','03.45',
                    '04.00','04.15','04.30','04.45',
                    '05.00','05.15','05.30','05.45',
                    '06.00','06.15','06.30','06.45',
                    '07.00','07.15','07.30','07.45',
                    '08.00',
            ],
            emai_reminder:['']
        };
        this.handle_change = this.handle_change.bind(this);
    }

    handle_close() {
        ModalManager.close(<SheduleActivityModal  modal_id ="shedule-activity-modal"  onRequestClose={() => true} />);
    }

    select_activity(activity){
        this.setState({activity:activity})
    }



    handle_change(date) {
        this.setState({
            expected_closing_date: date
        });
    }

    handle_next_remindar(date){
        this.setState({
            next_reminder_date: date
        });
    }

    handle_selected_hour( value){
        this.setState({selected_hour:value})
    }

    handle_selected_mintue(value){
        this.setState({selected_mintue:value})
    }

    get_editor_txt(editor_txt){
        this.setState({summery: editor_txt})
    }

    handle_schedule(){
        var csrftoken = getCookie('csrftoken');
        var post_data = {'id' : this.state.activity_id, 'next_activity': this.state.activity, 'summary' : this.state.summery,
                        'next_activity_date' : this.state.expected_closing_date,'next_activity_reminder' : this.state.next_reminder_date,
                        'action' : 'log_activity', 'module_id':this.state.module_id,
                        'master_id' : this.state.master_id, 'module_name':this.state.module_name
                        };
        if(this.state.activity!='') {
            console.log("post_data", post_data)
            $.ajax({
                type: "POST",
                cache: false,
                url: '/general/logactivity/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        ModalManager.close(<SheduleActivityModal modal_id={this.props.modal_id}
                                                                 onRequestClose={() => true}/>);
                        if (onChildClick != undefined){
                            this.props.onChildClick(data.result)
                        }
                    }
                }.bind(this)
            });
        }else{
             NotificationManager.error('Select Activity', translate('label_error'), 5000);
        }
    }



    render_body(){
        var initialLocaleCode = 'en';
        if(language ==='French')
            initialLocaleCode = 'fr';
        return(
            <form id="log_actvity_frm" className="edit-form" action="" method="POST">
                <div className="panel-body">
                    <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <table className="detail_table">
                                <tbody>
                                <tr>
                                    <td><label className="control-label">Activity</label></td>
                                    <td>
                                         <div className="form-group" style={{'border-bottom':'0px'}}>
                                            {/* this.state.modal_action !== 'view' ?
                                                <div className="dropdown autocomplete">
                                                    <input id="log_next_activity" name="next_activity" className="form-control" data-toggle="dropdown" value={this.state.activity} aria-expanded="false" type="text" />
                                                    <span aria-expanded="true" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                        <i id="main_form_tags_down_icon" className="fa fa-angle-down black"></i>
                                                    </span>
                                                    <div className="dd-options">
                                                        <ul className="options-list" required="">
                                                            <li onClick={this.select_activity.bind(this,'Call')}>{translate('call')}</li>
                                                            <li onClick={this.select_activity.bind(this,'Email')}>{translate('email')}</li>
                                                            <li onClick={this.select_activity.bind(this,'Message')}>{translate('message')}</li>
                                                            <li onClick={this.select_activity.bind(this,'Meeting')}>{'Meeting'}</li>
                                                            <li onClick={this.select_activity.bind(this,'Other')}>{'Other'}</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                :<p>{this.state.activity}</p>
                                            */}
                                            <div className="btn-group" role="group">
                                            <span className="btn btn-default"  aria-label="Phone" title="Phone"><i className="fa fa-phone"></i></span>
                                            <span className="btn btn-default"  aria-label="Email" title="Email" ><i className="fa fa-at"></i> </span>
                                            <span className="btn btn-default"  aria-label="Message" title="Message"><i className="fa fa-envelope"></i></span>
                                            <span className="btn btn-default"  aria-label="Meeting" title="Meeting"><i className="fa fa-users"></i></span>
                                            <span className="btn btn-default"  aria-label="Other" title="Other"><i className="fa "></i>Other</span>
                                            </div>
                                         </div>

                                    </td>
                                </tr>
                                { this.state.modal_action !== 'view' ?
                                    <tr>
                                        <td><label className="control-label">Summary</label></td>
                                            <td>
                                                <div className="form-group">
                                                    {/*<input name="summary" className="form-control" required=""
                                                           value={this.state.summery}
                                                           onChange={this.handle_summery.bind(this)}/>*/}
                                                    <CustomEditor
                                                        toolbar_id={'toolbar1'}
                                                        editor_txt={this.state.summery || '' }
                                                        get_editor_txt={this.get_editor_txt.bind(this)}
                                                        module={'opportunity'}
                                                        use_custom_button ={false}
                                                    />
                                                </div>
                                            </td>
                                    </tr>
                                    :null
                                }
                                { this.state.modal_action == 'view' ?
                                    <tr>
                                        <td><label className="text-muted control-label">Summary</label></td>
                                        <td><div className="form-group"><p>{this.state.summery}</p></div></td>
                                    </tr>
                                    :null
                                }
                                    <tr>
                                        <td><label className="control-label">Expected Closing</label></td>
                                        <td>
                                            <table>
                                                <tr>
                                                    <td>
                                                    <div className="form-group  log_expected_closing">
                                                        { this.state.modal_action !== 'view' ?
                                                            <DateField
                                                                defaultValue={this.state.expected_closing_date}
                                                                dateFormat="MM/DD/YYYY"
                                                                updateOnDateClick={true}
                                                                collapseOnDateClick={false}
                                                                showClock={false}
                                                                id="start"
                                                            >
                                                                <DatePicker
                                                                    navigation={true}
                                                                    locale={initialLocaleCode}
                                                                    forceValidDate={true}
                                                                    highlightWeekends={true}
                                                                    highlightToday={true}
                                                                    weekNumbers={false}
                                                                    weekStartDay={0}
                                                                    footer={false}
                                                                    selected={this.state.expected_closing_date}
                                                                    onChange={this.handle_change}
                                                                />
                                                            </DateField>
                                                            : <p>{this.state.expected_closing_date}</p>
                                                        }
                                                    </div>
                                                    </td>
                                                    <td style={{'padding-left':'33px'}}>
                                                        <div className="form-group">
                                                            <div className="dropdown">
                                                                <input type="text" value={this.state.selected_hour} placeholder="Hour" className="form-control" data-toggle="dropdown" name="hours" aria-expanded="true" />
                                                                <span aria-expanded="false" aria-haspopup="false" role="button" data-toggle="dropdown">
                                                                    <i className="fa fa-angle-down black"></i>
                                                                </span>
                                                                <div className="dd-options">
                                                                    <ul className="options-list" style={{'overflow':'auto', 'height':'85px'}}>
                                                                    {
                                                                        this.state.hours.map((hour, i) => {
                                                                            return (<li key={'_ho_'+i} onClick={this.handle_selected_hour.bind(this, hour)}>{hour}</li>);
                                                                        })
                                                                    }
                                                                    </ul>
                                                                </div>
                                                                </div>
                                                            </div>
                                                    </td>
                                                    <td style={{'padding-left':'33px'}}>
                                                        <div className="form-group">
                                                            <div className="dropdown">
                                                                <input type="text" value={this.state.selected_mintue} placeholder="Minutes" className="form-control" data-toggle="dropdown" name="mintues" aria-expanded="true" />
                                                                <span aria-expanded="false" aria-haspopup="false" role="button" data-toggle="dropdown">
                                                                    <i className="fa fa-angle-down black"></i>
                                                                </span>

                                                                <div className="dd-options">
                                                                    <ul className="options-list" style={{'overflow':'auto', 'height':'85px'}}>
                                                                    {
                                                                        this.state.mintues.map((mintue, i) => {
                                                                            return (<li key={'_mi_'+i} onClick={this.handle_selected_mintue.bind(this, mintue)}>{mintue}</li>);
                                                                        })
                                                                    }
                                                                   </ul>
                                                                </div>
                                                                </div>
                                                            </div>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label className="control-label">Email Reminder</label>
                                            &nbsp;&nbsp;<span  data-tip data-for='reminder_info'   className="glyphicon glyphicon-info-sign text-primary"></span>
                                           <ReactTooltip place="bottom"  id='reminder_info' type="info" effect="float">
                                              <span>if you will select this then email will go.</span>
                                            </ReactTooltip>
                                        </td>
                                        <td>
                                            <div className="form-group log_next_activity_reminder">
                                                { this.state.modal_action !== 'view' ?
                                                    <DateField
                                                        defaultValue ={this.state.next_reminder_date}
                                                        dateFormat="MM/DD/YYYY"
                                                        updateOnDateClick={true}
                                                        collapseOnDateClick={true}
                                                        showClock={false}
                                                        id="start"
                                                    >
                                                      {/*<DatePicker
                                                        navigation={true}
                                                        locale={initialLocaleCode}
                                                        forceValidDate={true}
                                                        highlightWeekends={true}
                                                        highlightToday={true}
                                                        weekNumbers={false}
                                                        weekStartDay={0}
                                                        footer={false}
                                                        selected={this.state.next_reminder_date}
                                                        onChange={this.handle_next_remindar.bind(this)}
                                                      />*/}
                                                    </DateField>
                                                   :<p>{this.state.next_reminder_date}</p>
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

   render(){
      return (
         <Modal
            style={modal_style}
            onRequestClose={this.state.onRequestClose}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg sub-contact module__contact module__contact-create in">
                <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handle_close.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">Schedule Activity</h4>
                    </div>
                    <div className="modal-body" style={ModalbodyStyle}>
                        {this.render_body()}
                    </div>
                    <div className="clear"></div>
                    <div className="clear"></div>
                    <div className="clear"></div>
                    <div className="clear"></div>
                    <div className="clear"></div>
                    <div className="clear"></div>
                    <div className="clear"></div>
                    <div  className="modal-footer">
                        { this.state.modal_action !== 'view' ?
                            <button type="button" className="btn btn-primary" onClick={this.handle_schedule.bind(this)}>{translate('schedule')}</button>
                            :null
                        }
                        <button type="button" className="btn btn-default" onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                   </div>
                </div>
            </div>
             <NotificationContainer/>
         </Modal>
      );
   }
}
module.exports = SheduleActivityModal;