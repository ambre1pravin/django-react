import React from 'react';
import state, {IMAGE_PATH, LOGED_IN_USER, PROFILE_IMAGE} from 'crm_react/common/state';
import {  Link} from 'react-router'
import DjangoCSRFToken from 'django-react-csrftoken';
import {NotificationManager} from 'react-notifications';
import {Modal, ModalManager} from 'crm_react/component/custom_modal';
import SheduleActivityModal from 'crm_react/component/shedule-activity-modal';
import {translate} from 'crm_react/common/language';
import { getCookie, js_uc_first, delete_item_array , validate_email} from 'crm_react/common/helper';
import TopLoadingIcon from 'crm_react/common/top-loading-icon'
import SelectOption from 'crm_react/component/select-option';
import SelectCustom from 'crm_react/component/select-custom';
import SendByEmail from 'crm_react/page/email_template/send-by-email';



 class  Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            attachements:[],
            master_id: this.props.props_data.master_id,
            module_id: this.props.props_data.module_id,
            module_name :this.props.props_data.module_name,
            default_message_type : null,
            message_text :'',
            activities:[],
            today_messages:[],
            yesterday_messages:[],
            messages:[],
            activity_done:0,
            activity_not_done:0,
            activity_show:false,
            processing:false,
            filter:'all',
            composer_display:false,
            send_email_display:false,
            filter_option:'All',
            no_result:null,
            selected_attendies:[],
            css_open:'',
            search_key:'',
            sending_message:false,
            internal_recipients: [],
            external_recipients:[],
            file_progress_width:'60%',
            activity_processing: false,
            user_is_admin:false,
        };
         /*** Fetch messages ***/

        this.ajax_common_search( this.state.master_id, this.state.module_id, this.state.filter_option);
        this.set_messages = this.set_messages.bind(this);
    }



    ajax_common_search(master_id, module_id, filter){
        var csrftoken = getCookie('csrftoken');
        let filter_option ;
        if(filter){
            filter_option = filter
        }else{
            filter_option = this.state.filter_option
        }
        $.ajax({
           type: "POST",
           dataType: "json",
           url: '/general/get_message/',
           data: {
                master_id : this.state.master_id,
                module_id :this.state.module_id,
                module_name:this.state.module_name,
                filter: filter_option,
                csrfmiddlewaretoken: csrftoken

            },
            beforeSend: function () {
                this.setState({progress_icon_status:true})
            }.bind(this),
            success: function (data) {
               if(data.success == true || data.success == 'true') {
                   this.setState({
                       user_is_admin:data.is_admin,
                       activity_done:data.activity_done,
                       activity_not_done:data.activity_not_done,
                       activities: data.activities,
                       today_messages:data.today_messages,
                       yesterday_messages:data.yesterday_messages,
                       messages:data.messages
                   })
               }else{
                   this.setState({  messages: [] });
               }

            }.bind(this)
        });
    }

    custom_remove(item){
         var filters = this.state.filter_option;
         if(filters.length > 0){
              for (var i=0; i<filters.length; i++){
                if (filters[i]==item){
                  filters.splice(i,1); //this delete from the "i" index in the array to the "1" length
                  break;
                }
              }
          }
    }

    handle_filter(filter){
       if(filter!='' && filter!=null) {
           this.setState({filter_option: filter, activity_show:true});
           this.ajax_common_search(this.state.master_id, this.state.module_id, filter);
       }
    }

    handle_input(event){
        this.setState({message_text : event.target.value})
    }


    handle_new_message_click(message_type) {
        this.setState({default_message_type :message_type, send_email_display:true })
    }



    handle_file_icon_click(){
        $("#message_attatchment_file").trigger("click");

    }

    /**  Existing Attachements Cross button handle*/
    handleRemoveAttachements(index){
       let csrftoken = getCookie('csrftoken');
       let attachements =  this.state.attachements;
       let file_path = attachements[index].file_path;
       if (file_path !='') {
           $.ajax({
               type: "POST",
               cache: false,
               url: '/general/rm_file/',
               data: {
                   ajax: true,
                   file_path: file_path,
                   csrfmiddlewaretoken: csrftoken
               },
               beforeSend: function () {
               },
               success: function (data) {
                   if (data.success === true) {
                       attachements.splice(index, 1);
                       this.setState({attachements: attachements,});
                   }
               }.bind(this)
           });
       }
    }

    /**** suyash code **/
    handle_edit(index){
        $.ajax({
            type: "POST",
            cache: false,
            url:  '/general/getMessageData/'+ index,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                    ModalManager.open( <SheduleActivityModal
                        activity_id = {index}
                        modal_id = "shedule-activity-modal"
                        module_id ={this.state.module_id}
                        master_id ={this.state.master_id}
                        module_name ={this.state.module_name}
                        activity = {data.user.next_activity}
                        summery = {data.user.summary}
                        expected_closing_date = {data.user.next_activity_date}
                        next_reminder_date = {data.user.next_activity_reminder}
                        modal_action = 'edit'
                        onChildClick ={ this.set_messages.bind(null)}
                        onRequestClose={() => false}/>
                    );
                }
            }.bind(this)
        });


    }

    set_messages(data){
        this.ajax_common_search(this.state.master_id, this.state.module_id,'')
    }

    handle_on_change(){
         this.setState({processing:true, file_progress_width:'60%'});
         $("#message_file_upload_from").submit();
         $("#message_file_uploader").unbind().load(function() {  // This block of code will execute when the response is sent from the server.
           var result =  JSON.parse($("#message_file_uploader").contents().text());
           var files = this.state.attachements;
            if(result.success === 'true' || result.success === true){
                var attachements = {
                    'file_name':result.file_name,
                    'file_path':result.file_path
                };
                files.push(attachements);
                this.setState({ attachements : files,  processing:false, file_progress_width:'100%'})
            }
        }.bind(this));
    }

    message_remove(id){
        var confrm = confirm("Do you really want to remove these record?");
        var csrftoken = getCookie('csrftoken');
        if(confrm === false){ return; }
        $.ajax({
            type: "POST",
            cache: false,
            url:  '/general/MessageDelete/'+id,
            data: {
              ajax: true,
              csrfmiddlewaretoken: csrftoken
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                this.ajax_common_search( this.state.master_id, this.state.module_id, this.state.filter_option);
              }
            }.bind(this)
        });
    }

    handle_mark_done(message_id, message_status){
        if(message_id > 0) {
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/mark_read/',
                data: {
                    message_id:message_id,
                    message_status:message_status,
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                }.bind(this),
                success: function (data) {
                    this.ajax_common_search(this.state.master_id, this.state.module_id,'')
                }.bind(this)
            });
        }
    }

    handle_mark_all_action(action){
          if(this.state.module_id > 0 && this.state.master_id > 0) {
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/general/activity_change/',
                data: {
                    action: action,
                    module_id : this.state.module_id,
                    master_id: this.state.master_id,
                    module_name : this.state.module_name,
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({activity_processing:true})
                }.bind(this),
                success: function (data) {
                    this.setState({activity_processing:false});
                    if(data.success == true || data.success == 'true') {
                        this.ajax_common_search(this.state.master_id, this.state.module_id, '')
                    }
                }.bind(this)
            });
        }
    }

    handle_send_message(){
        if(this.state.master_id > 0 && this.state.message_type !== '' && this.state.message_text !=''){
            var csrftoken = getCookie('csrftoken');
            var messages = {};
                messages.message = this.state.message_text,
                messages.attachements = this.state.attachements,
                messages.message_type = this.state.default_message_type,
                messages.master_id = this.state.master_id;
                messages.module_id = this.state.module_id;
                messages.module_name = this.state.module_name;
                $.ajax({
                    type: "POST",
                    cache: false,
                    url:  "/general/message_create/",
                    data: {
                        email_data: JSON.stringify(messages),
                        csrfmiddlewaretoken: csrftoken
                    },

                    beforeSend: function () {
                       this.setState({sending_message:true})
                    }.bind(this),
                    success: function (data) {
                        if(data.success === true ){
                            var newArray = [];
                            this.setState({ message_text:'',
                                            send_email_display:false,
                                            sending_message:false,
                                            attachements:[],
                                            default_message_type:null
                                           });
                            this.ajax_common_search(this.state.master_id, this.state.module_id,'')

                        }
                    }.bind(this)
                });
        }else{
            var msg = 'Enter message';
            NotificationManager.error(msg, 'Error',5000);
        }
    }

    handle_shedule_activity_action(){
        this.setState({composer_display: false, default_message_type:null, send_email_display:false});
        ModalManager.open(
            <SheduleActivityModal
                activity_id = ''
                modal_id = "shedule-activity-modal"
                module_id ={this.state.module_id}
                master_id ={this.state.master_id}
                module_name={this.state.module_name}
                activity = ''
                summery = ''
                expected_closing_date = ''
                next_reminder_date = ''
                modal_action = 'add'
                onChildClick ={ this.set_messages.bind(null)}
                onRequestClose={() => false}/>
        );
    }



    handle_send_email(){
        let internal_recipients = this.state.internal_recipients;
        let external_recipients = this.state.external_recipients;
        let message_text = this.state.message_text;
         if((internal_recipients.length > 0 || external_recipients.length > 0) && (message_text!='')){
            var csrftoken = getCookie('csrftoken');
            $.ajax({
               type: "POST",
               dataType: "json",
                url: '/message/send_msg/',
                    data: {
                    master_id : this.state.master_id,
                    module_id : this.state.module_id,
                    module_name: this.state.module_name,
                    message_text :message_text,
                    internal_recipients: JSON.stringify(internal_recipients),
                    external_recipients: JSON.stringify(external_recipients),
                    csrfmiddlewaretoken: csrftoken
                  },
                beforeSend: function () {
                    this.setState({sending_message:true})
                }.bind(this),
                success: function (data) {
                   if(data.success == true || data.success == 'true') {
                       this.setState({default_message_type:null,
                           message_text:'',
                           sending_message:false,
                           send_email_display:false,
                           attachements:[],
                           internal_recipients:[],
                           external_recipients:[]
                       })
                   }else{
                       //this.setState({  no_result: 'No Result' });
                   }

                }.bind(this)
            });
        }
    }

    hide_show_activity(){
        this.setState({activity_show:!this.state.activity_show})
    }

    open_email_modal() {
        ModalManager.open(
            <SendByEmail
                q_id={this.state.master_id}
                preview_url={'/htm/' + this.state.url + '/sales_order/'}
                print_url={'/generate_pdf/' + this.state.url + '/sales_order/'}
                module={this.props.props_data.module_name}
                title={'Send Email'}
                modal_id="send-email"
                onRequestClose={() => true}
            >
            </SendByEmail>
        );
    }

    render_common_editor(){
        return(
            <div className="media mail-msg-container">
                <div className="media-left">
                    <img src={PROFILE_IMAGE} alt={LOGED_IN_USER} title={LOGED_IN_USER} className="img-circle" />
                </div>
                <div className="media-body media-middle">
                    <div className="edit-form  mail-msg-editor">
                        <div className="form-group">
                            <textarea className="form-control" value={this.state.message_text} placeholder="Write Message..." onChange={this.handle_input.bind(this)}></textarea>
                        </div>
                    </div>
                    { this.render_attatchments() }
                    <div className="button-block">
                        {this.state.default_message_type == 'send_email' ?
                        <button className="btn btn-primary" onClick={this.handle_send_email.bind(this)}>Send</button>
                            :null
                        }
                        {this.state.default_message_type == 'notes' ?
                        <button className="btn btn-primary" onClick={this.handle_send_message.bind(this)}>Send</button>
                            :null
                        }
                        {this.state.default_message_type == 'notes' ?
                        <span className="attachement-block">
                            <i className="attachement-icon-sprite" onClick={this.handle_file_icon_click.bind(this)}></i>
                        </span>
                            :null
                        }
                            <form id="message_file_upload_from" target="message_file_uploader" action={'/contact/msg_attatch/'} method="post" encType='multipart/form-data' style={{'display':'none'}}>
                                <input type="file" name="ufile" id="message_attatchment_file" className="o_form_input_file" onChange={this.handle_on_change.bind(this)}/>
                                <DjangoCSRFToken/>
                            </form>
                            <iframe name="message_file_uploader" id="message_file_uploader" style={{'display':'none'}}></iframe>
                    </div>
                </div>
            </div>

        );
    }

    render_attatchments(){
        let attachements = this.state.attachements;
        return(
                <div className="attachements">
                    <div className="row">
                        {attachements.length > 0 ?
                            attachements.map((attachment, a) => {
                                return (<div key={"_atm_"+a} className="col-xs-4 col-sm-3 col-md-2 col-lg-2">

                                        <div className="thumbnail no-border">
                                            <a href="javascript:" className="remove" title="remove this file" onClick={this.handleRemoveAttachements.bind(this,a)}>
                                                <i className="remove-icon-sprite"></i>
                                            </a>
                                            <Link to={attachment.file_path} title={attachment.file_name} target="_blank">
                                                <img src="/static/front/images/document-flat.png"
                                                     className="img-responsive"/>
                                            </Link>
                                            <p className="caption text-center"  style={{'marginTop':'10px'}}>{attachment.file_name}</p>
                                        </div>
                                    </div>
                                )
                            })
                            : null
                        }
                        {this.state.processing ?
                            <div className="col-xs-4 col-sm-3 col-md-2 col-lg-2">
                                <TopLoadingIcon processing={this.state.processing}/>
                            </div>
                            : null
                        }
                    </div>
                </div>
        );
    }


    render_activities(){
        let activities = this.state.activities;
        return(
            <ul className="timelines activities">
                {activities.length > 0 ?
                    activities.map((activity, i) => {
                        return (<li key={'_activity_'+i}>
                                <div className={ activity.mark_done ? "media done" : "media undone"}>
                                    <div className="media-left">
                                <span className="done-mark" onClick={this.handle_mark_done.bind(this, activity.id, activity.mark_done)}>
                                    <svg viewBox="0 0 32 32">
                                        <polygon points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 "></polygon>
                                    </svg>
                                </span>
                                    </div>
                                    <div className="media-body">
                                        <h4 className="media-heading">
                                            <span className={activity.over_due ? "text-danger":"text-warning"}>{activity.date}</span>
                                            <strong className="push-left-5">
                                                {activity.message_type === 'Meeting' ? activity.message_type + ' with ' : ''}

                                                {activity.message_type === 'Other' ? ' Next activity planned by ' : ''}
                                                {   activity.message_type === 'Call'  ||
                                                    activity.message_type === 'Email' ||
                                                    activity.message_type === 'Message'
                                                    ? activity.message_type : ''}
                                            </strong>
                                            <span className="push-left-5">{activity.created_by}</span>
                                        </h4>
                                        <p>{activity.message}</p>
                                        <p>
                                            <small>{'Created On: '+activity.created_at}</small>

                                        </p>
                                    </div>
                                </div>
                            </li>
                        )
                    })
                    : null
                }
            </ul>
        );
    }

    render_message(message_for, messages){
        return(
            messages.length > 0 ?
            <li>
                <div className="day"><span>{message_for}</span></div>
                {
                    messages.map((activity, i) => {
                        return (<div className="media internal-note" key={'_msg_'+i}>
                                <div className="media-left">
                                    <img src={activity.profile_image} alt={activity.created_by}
                                    title={activity.created_by} className="img-circle" width="30" height="30"/>
                                </div>
                                <div className="media-body" style={{'width':'100%'}}>
                                    {activity.message_type != 'Create_Action'?
                                        <h4 className="media-heading">
                                            {activity.message_type == 'Send_Email' ?
                                                <small>{'Send Email by'}</small>
                                                :<small>{activity.message_type+ ' by '}</small>
                                            }
                                            <span className="push-left-5">{activity.created_by}</span>
                                            {activity.message_type =='Send_Email' ? <small className="push-left-5">{' To '}</small> : null }
                                            {activity.message_type =='Send_Email' ? <small className="text-primary">{activity.email_to}</small> : null }
                                        </h4>
                                        :null
                                    }
                                    <div  dangerouslySetInnerHTML={{ __html: activity.message }} />
                                    <p>
                                        <small>{'Created On: '+activity.created_at}</small>
                                    </p>
                                    <p>
                                    {
                                        activity.files.length > 0 ?
                                            activity.files.map((file, f) => {
                                                return (
                                                    <span key={'_f_'+f}>
                                                        <Link to={file.file_path}  title={file.file_name} target="_blank">{file.file_name}
                                                            <i className="attachement-icon-sprite push-left-5" ></i>
                                                        </Link>
                                                    </span>
                                                )
                                            })
                                        :null
                                    }
                                    </p>

                                </div>
                            </div>
                        )
                    })
                }
            </li>
            :null
        );
    }

    render_message_filter(){
        return(
            <div className="mail-messages__filter clearfix">
                <div className="dropdown selection pull-right">
                    <a href="#" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <i className="fa fa-cogs" aria-hidden="true"></i>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="messages options">
                        <li className="dropdown-header">View Activities</li>
                        <li className={this.state.filter_option.indexOf('Incomplited')!==-1? 'activity-option selected':'activity-option'} onClick={this.handle_filter.bind(this, 'Incomplited')}>
                            <Link to="javascript:" title="View incomplited activities">Incomplited Activities</Link>
                        </li>
                        <li className={this.state.filter_option.indexOf('Complited')!==-1? 'activity-option selected':'activity-option'} onClick={this.handle_filter.bind(this, 'Complited')}>
                            <Link to="javascript:" title="View complited activities">Complited Activities</Link>
                        </li>
                        <li className={this.state.filter_option.indexOf('all-Activities')!==-1? 'activity-option selected':'activity-option'} onClick={this.handle_filter.bind(this, 'all-Activities')}>
                            <Link to="javascript:" title="View all activities">All Activities</Link>
                        </li>
                        { this.state.user_is_admin ? <li role="separator" className="divider"></li> : null }
                        {
                            this.state.user_is_admin?
                            <li className="activity-option">

                                <Link to="javascript:" title="Mark all activities complited" onClick={this.handle_mark_all_action.bind(this, 'all-complete')}>
                                    <TopLoadingIcon processing={this.state.activity_processing}/>
                                    Mark all activities complited
                                </Link>
                            </li>
                            :null
                        }
                        {
                            this.state.user_is_admin ?
                            <li className="activity-option">
                                <Link to="javascript:" title="Mark all activities incomplited"
                                      onClick={this.handle_mark_all_action.bind(this, 'all-incomplete')}>
                                    <TopLoadingIcon processing={this.state.activity_processing}/>
                                    Mark all activities incomplited
                                </Link>
                            </li>
                            : null
                        }
                        <li role="separator" className="divider"></li>
                        <li className="dropdown-header">View Notes &amp; Emails</li>
                        <li className={this.state.filter_option.indexOf('all-notes')!==-1? 'activity-option selected':'activity-option'} onClick={this.handle_filter.bind(this, 'all-notes')}>
                            <Link to="javascript:" title="View all notes">All Notes</Link>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    set_internal_recipients(recipients){
        if(recipients.length > 0){
            this.setState({internal_recipients:recipients})
        }
    }

    set_external_recipients(recipients){
        if(recipients.length > 0){
            this.setState({external_recipients:recipients})
        }
    }

    set_contact(){
        let customer = [];
        return customer
    }
    render() {
        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-4">
                <div className="panel panel-default mail-messages">
                    <ul className="mail-messages__options">
                        {/*<li data-type="new-email" className={this.state.default_message_type == 'send_email' ? "tourist-place-1 active":"tourist-place-1"} onClick={this.send_email_click.bind(this,'send_email')}>
                            <i className="fa fa-envelope-o fa-fw" aria-hidden="true"></i> New Email</li>*/}
                        <li data-type="new-email" className={this.state.default_message_type == 'send_email' ? "tourist-place-1 active":"tourist-place-1"}
                                onClick={this.open_email_modal.bind(this)}>
                            <i className="fa fa-envelope-o fa-fw" aria-hidden="true"></i> New Email</li>
                        <li data-type="new-internal-message" className={this.state.default_message_type == 'notes'? "tourist-place-1 active":"tourist-place-1"} onClick={this.handle_new_message_click.bind(this,'notes')}>
                            <i className="fa fa-sticky-note-o fa-fw" aria-hidden="true"></i> New Internal Message</li>
                        <li data-type="schedule-activity" className="tourist-place-2" onClick={this.handle_shedule_activity_action.bind(this)}>
                            <i className="fa fa-clock-o fa-fw" aria-hidden="true"></i> Schedule an Activity</li>
                    </ul>
                    {this.state.default_message_type == 'send_email' ?
                    <div className="new-msg-to edit-form">
                        <div className="form-group">
                            <SelectOption set_recipients={this.set_internal_recipients.bind(this)}/>
                            <SelectCustom customer={this.set_contact()} set_recipients={this.set_external_recipients.bind(this)}/>
                        </div>
                    </div>
                        :null
                    }
                    { this.state.send_email_display ? this.render_common_editor() :null }
                    { this.render_message_filter() }
                    <div className="scheduled-activities">
                        <span><i className={this.state.activity_show ? "fa fa-caret-down" : "fa fa-caret-right"} aria-hidden="true"></i> <span onClick={this.hide_show_activity.bind(this)}>Planned activities</span>
                            <span className="plan-noti">
                                {this.state.activity_not_done > 0 ?
                                    <span className="push-left-5 badge today">{this.state.activity_not_done}</span>
                                    :null
                                }
                                {this.state.activity_done > 0 ?
                                    <span className="push-left-5 badge not-today">{this.state.activity_done}</span>
                                    : null
                                }
                            </span>
                        </span>
                    </div>
                    {this.state.activity_show ? this.render_activities() : null }
                    <ul className="timelines notes-emails">
                        {this.render_message('Today', this.state.today_messages)}
                        {this.render_message('Yesterday', this.state.yesterday_messages)}
                        {this.render_message('Day before yesterday', this.state.messages)}
                    </ul>
                </div>
            </div>
        );
    }
}
module.exports = Message;