import React from 'react';
import state, {IMAGE_PATH} from 'crm_react/common/state';
import {NotificationManager} from 'react-notifications';
import DjangoCSRFToken from 'django-react-csrftoken';
import SheduleActivityModal from 'crm_react/component/shedule-activity-modal';
import { Modal, ModalManager} from 'react-dynamic-modal';
import {translate} from 'crm_react/common/language';
import { getCookie,js_uc_first, delete_item_array ,validate_email} from 'crm_react/common/helper';


 class  Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            attachements:[],
            master_id: this.props.props_data.master_id,
            model_id: this.props.props_data.model_id,
            default_message_type : null,
            message_text :'',
            messages:[],
            filter:'all',
            composer_display:false,
            send_email_display:false,
            filter_option:'All',
            no_result:null,
            selected_attendies:[],
            all_attendies:[],
            css_open:'',
            search_key:'',
            sending_message:false,


        };
         /*** Fetch messages ***/
        this.ajax_common_search( this.state.master_id, this.state.model_id, this.state.filter_option);
        this.set_messages = this.set_messages.bind(this);
    }

    get_attendies(e){
        let lower_string = e.target.value.toLowerCase();
        this.setState({search_key:e.target.value});
        var csrftoken = getCookie('csrftoken');
        if(lower_string.length >=1){
            $.ajax({
                type: "POST",
                cache: false,
                url:'/message/search_contact/',
                data: {
                    keyword :lower_string,
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                }.bind(this),
                success: function (data) {
                    if (data.success){
                       this.setState({all_attendies:data.result,css_open:'open'});
                    }
                }.bind(this)
            });
        }else{
           // this.setState({tags:[],display_tags:[],css_change:'dropdown autocomplete'});
        }
    }



    ajax_common_search(master_id, model_id, filter){
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
                model_id :this.state.model_id,
                filter: filter_option,
                csrfmiddlewaretoken: csrftoken

                },
            beforeSend: function () {
                this.setState({progress_icon_status:true})
            }.bind(this),
            success: function (data) {
               if(data.success == true || data.success == 'true') {
                   this.setState({  messages: data.result });
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
           this.setState({filter_option: filter});
           this.ajax_common_search(this.state.master_id, this.state.model_id, filter);
           console.log(this.state.filter_option)
       }
    }

    handle_input(event){
        this.setState({message_text : event.target.value})
    }


    handle_new_message_click(message_type) {
        this.setState({default_message_type :message_type, composer_display:true })
    }

    send_email_click(message_type) {
        this.setState({default_message_type :message_type, send_email_display:true })
    }

    handle_file_icon_click(){
        $("#message_attatchment_file").trigger("click");
    }

    /**  Existing Attachements Cross button handle*/
    handleRemoveAttachements(index){
       let attachements =  this.state.attachements;
         attachements.forEach(function(result, i) {
            if(i === index) {
              attachements.splice(i, 1);
            }
        });
        this.setState({attachements: attachements});
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
                        model_id ={this.state.model_id}
                        master_id ={this.state.master_id}
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
        this.ajax_common_search(this.state.master_id, this.state.model_id,'')
    }

    handle_on_change(){
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
                this.setState({ attachements : files})
            }
        }.bind(this));
    }

    message_remove(id){
        var confrm = confirm("Do you really want to remove these record?");
        if(confrm === false){ return; }
        $.ajax({
            type: "POST",
            cache: false,
            url:  '/general/MessageDelete/'+id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                this.set_messages(data.result)
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
                    this.ajax_common_search(this.state.master_id, this.state.model_id,'')
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
                messages.model_id = this.state.model_id;
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
                            this.setState({default_message_type:null,
                                            message_text:'',
                                            composer_display:false,
                                            sending_message:false
                                           });
                            this.ajax_common_search(this.state.master_id, this.state.model_id,'')

                        }
                    }.bind(this)
                });
        }else{
            var msg = 'Enter message';
            NotificationManager.error(msg, 'Error',5000);
        }
    }

    handle_shedule_activity_action(){
        this.setState({composer_display: false});
        ModalManager.open( <SheduleActivityModal
                                activity_id = ''
                                modal_id = "shedule-activity-modal"
                                model_id ={this.state.model_id}
                                master_id ={this.state.master_id}
                                activity = ''
                                summery = ''
                                expected_closing_date = ''
                                next_reminder_date = ''
                                modal_action = 'add'
                                onChildClick ={ this.set_messages.bind(null)}
                                onRequestClose={() => false}/>
                        );
    }

    render_activity_new(){
        let temp_messages = this.state.messages;
        var divStyle = {borderBottom: "1px solid #ddd"};
        return(
                <div className="row">
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 center-block float-none">
                <div className="panel panel-default mail-messages">
                    <ul className="list-inline inline-block filters-favourite pull-right">
                        <li className="dropdown selection ">
                            <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" id="filters">
                                <i className="fa fa-cogs"></i>
                            </span>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="filters">
                                <li className={this.state.filter_option.indexOf('All')!==-1?'selected':''} onClick={this.handle_filter.bind(this, 'All')}>All</li>
                                <li role="separator" className="divider"></li>
                                <li className={this.state.filter_option.indexOf('Incomplited')!==-1?'selected':''} onClick={this.handle_filter.bind(this, 'Incomplited')}>Incomplited Task</li>
                                <li role="separator" className="divider"></li>
                                <li className={this.state.filter_option.indexOf('Complited')!==-1?'selected':''} onClick={this.handle_filter.bind(this, 'Complited')}>Complited Task</li>
                                <li role="separator" className="divider"></li>
                                <li className={this.state.filter_option.indexOf('Notes')!==-1?'selected':''}  onClick={this.handle_filter.bind(this, 'Notes')}>Notes</li>
                            </ul>
                        </li>
                    </ul>
                 <ul className="timelines">
                 {
                    this.state.messages.length > 0 ?
                     this.state.messages.map((message, i) =>{
                     return  <div key ={i} >
                                <li>
                                    {
                                        message.message.length > 0 ?
                                        message.message.map( (m, j) => {
                                            return <div className={m.mark_done_div_class} style={divStyle}>
                                                <div className="media-left">
                                                    { m.message_type !='notes'?
                                                        <span className="done-mark"
                                                              onClick={this.handle_mark_done.bind(this, m.id, m.mark_done)}>
                                                        <svg viewBox="0 0 32 32"><polygon
                                                            points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 "></polygon></svg>
                                                    </span>
                                                        :null
                                                    }
                                                </div>
                                                <div className="media-body">
                                                    <h4 className="media-heading">
                                                        { m.message_type == 'Other' ?
                                                            <span className="text-primary"> {js_uc_first(m.message_type) + ' task'} </span>
                                                            :<span className="text-primary"> {js_uc_first(m.message_type)} </span>
                                                        }
                                                        { m.message_type == 'notes' ?
                                                            <span> {translate('wrote_by')} {m.created_by}  </span>
                                                            :<span> {translate('planned_by')} {m.created_by}  </span>
                                                        }
                                                        <small> {m.date} </small>
                                                    </h4>
                                                     <div className="attachements">
                                                         <div className="row">
                                                           {( m.files != undefined && m.files.length > 0 ) ?
                                                                m.files.map( (file, k) =>{
                                                                return <div className="col-lg-2 col-md-2 col-sm-3 col-xs-4" key={k}>
                                                                        <div className="thumbnail no-border">
                                                                            <a href={file.file_path}>
                                                                            <img src={IMAGE_PATH +'/static/front/images/document-flat.png'} className="img-responsive" />
                                                                            </a>
                                                                            <div className="caption text-center">{file.file_name}</div>
                                                                        </div>
                                                                        </div>
                                                                })
                                                               :null
                                                           }
                                                         </div>
                                                     </div>
                                                    <p>{m.message}</p>
                                                </div>
                                            </div>
                                        })
                                        :null
                                    }
                                </li>
                            </div>
                    })
                    : this.state.no_result
                 }
                 </ul>
                </div></div></div>
        );
    }

    handleClickAttendies(id, email){
        let attendies = this.state.selected_attendies;
            attendies.push({'id':id,'email':email});
            attendies = _.uniqBy(attendies, 'id');
        this.setState({selected_attendies:attendies, css_open:'', search_key:''})
    }

    handleEnterPress(e, name) {
        if (e.key === 'Enter') {
            let attendies = this.state.selected_attendies;
            if(validate_email(this.state.search_key)) {
                attendies.push({'id': 0, 'email': this.state.search_key});
                this.setState({selected_attendies: attendies, search_key: ''})
            }
        }
    }

    remove_selected_attendie(sid){
       let attendies =  this.state.selected_attendies;
       this.setState({selected_attendies: delete_item_array(attendies, sid)});
    }
    
    handle_send_email(){
     let selected_attendies = this.state.selected_attendies;
     let message_text = this.state.message_text;
         if((selected_attendies.length > 0) && (message_text!='')){
            var csrftoken = getCookie('csrftoken');
            $.ajax({
               type: "POST",
               dataType: "json",
                url: '/message/send_msg/',
                    data: {
                    message_text :message_text,
                    selected_attendies: JSON.stringify(selected_attendies),
                    csrfmiddlewaretoken: csrftoken
                  },
                beforeSend: function () {
                    this.setState({sending_message:true})
                }.bind(this),
                success: function (data) {
                   if(data.success == true || data.success == 'true') {
                       this.setState({sending_message:false, send_email_display:false})
                   }else{
                       //this.setState({  no_result: 'No Result' });
                   }

                }.bind(this)
            });
         }

    }

    render_messages(){
        const cssStyle= {width:'60%'};
        const iframe_display ={display:'none'};
        let selec_attendies = this.state.selected_attendies;
        let all_attendies = this.state.all_attendies;
        console.log("Test");
        console.log(all_attendies);
        let userMessage ;
        if(this.state.default_message_type  === 'email' && this.state.composer_display){
            userMessage = (
            <div className="new-msg-to edit-form">
                    <textarea className="form-control" placeholder={translate('label_write_something')} value={this.state.message_text} onChange={this.handle_input.bind(this)}></textarea>
                    <div className="button-block">
                        <button className="btn btn-primary" onClick={this.handle_send_message.bind(this)}>{translate('button_send')}</button>
                        <span className="attachement-block">
                            <i className="attachement-icon-sprite" onClick={this.handle_file_icon_click.bind(this)}></i>
                        </span>
                    </div>
             </div>
            )
        }else if(this.state.default_message_type  === 'notes' && this.state.composer_display){
            userMessage = (
            <div className="new-msg-to edit-form">
               <span className="o_chatter_composer_info">
                    Log an internal note which will not be sent to followers, but which can be readby users accessing this document.
                </span>
                <textarea className="form-control" placeholder={translate('label_write_something')}  value={this.state.message_text} onChange={this.handle_input.bind(this)}></textarea>
                <div className="button-block">
                    <button className="btn btn-primary" onClick={this.handle_send_message.bind(this)}>{translate('button_send')}</button>
                    <span className="attachement-block">
                        <i className="attachement-icon-sprite" onClick={this.handle_file_icon_click.bind(this)}></i>
                    </span>
                    &nbsp;&nbsp;
                    { this.state.sending_message ?
                         <i className="fa fa-circle-o-notch fa-spin"></i>
                        :null
                    }
                </div>
            </div>
            )
        }else if(this.state.default_message_type  === 'send_email' && this.state.send_email_display){
            userMessage = (
            <div className="new-msg-to edit-form">
                <div className="form-group with-value">
                    <div className={'dropdown autocomplete '+this.state.css_open}>
                        <ul id="main_form_tagbox" className="list-inline tagbox">
                            {
                                selec_attendies.length > 0?
                                  selec_attendies.map((attendie, i) =>{
                                    return <li key={'attendie_'+i}>
                                        <i className="fa fa-circle-o color-1"></i>
                                        <span>{attendie.email}</span>
                                        <i className="remove-icon-sprite" onClick={this.remove_selected_attendie.bind(this, attendie.id)}></i>
                                    </li>
                                  })
                                :null
                            }
                        </ul>
                        <span className="have-control">
                            <input placeholder="Recipient.." onClick={this.handleEnterPress.bind(this)} onKeyPress={this.handleEnterPress.bind(this)} onChange={this.get_attendies.bind(this)} className="form-control" type="text" value={this.state.search_key}/>
                        </span>
                        <span><i className="fa fa-angle-down"></i></span>
                        <div className="dropdown-menu dd-options">
                            <ul className="options-list">
                                {
                                  all_attendies.length > 0 ?
                                     all_attendies.map((attendie, i) =>{
                                        return <li onClick={this.handleClickAttendies.bind(this, attendie.id, attendie.email)}>{attendie.email}</li>
                                     })
                                  :null
                                }
                            </ul>
                        </div>
                    </div>
                </div>
                <textarea className="form-control" placeholder={translate('label_write_something')}  value={this.state.message_text} onChange={this.handle_input.bind(this)}></textarea>
                <div className="button-block">
                    <button className="btn btn-primary" onClick={this.handle_send_email.bind(this)}>{translate('button_send')}</button>
                    &nbsp;&nbsp;
                    { this.state.sending_message ?
                         <i className="fa fa-circle-o-notch fa-spin"></i>
                        :null
                    }
                </div>
            </div>
            )
        }
        return (
            <div>
                 <div className="attachements">
                    <div className="row">
                        { this.state.attachements.length > 0 ?
                            this.state.attachements.map((new_files, i) =>{
                                return <div className="col-xs-4 col-sm-3 col-md-2 col-lg-2" key={i}>
                                    <div className="thumbnail no-border">
                                        <a className="remove" onClick={this.handleRemoveAttachements.bind(this,i)} >
                                            <i className="remove-icon-sprite"></i>
                                        </a>
                                        <div className="progress">
                                            <div className="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style={cssStyle}>
                                                <span className="sr-only">60% Complete</span>
                                            </div>
                                        </div>
                                        <a href={new_files.file_path}>
                                            <img src={'/static/front/images/document-flat.png'} className="img-responsive" />
                                        </a>
                                        <div className="caption text-center">{new_files.file_name}</div>
                                    </div>
                                </div>
                            })
                        :null
                        }
                    </div>
                 </div>
                 <div id='composer'>
                    { userMessage }
                    <span className="hide">
                        <div className="o_hidden_input_file ">
                            <form id="message_file_upload_from" target="message_file_uploader" action={'/contact/msg_attatch/'} method="post" encType='multipart/form-data' className="o_form_binary_form">
                                <input type="file" name="ufile" id="message_attatchment_file" className="o_form_input_file" onChange={this.handle_on_change.bind(this)}/>
                                <DjangoCSRFToken/>
                            </form>
                            <iframe name="message_file_uploader" id="message_file_uploader" style={iframe_display}></iframe>
                        </div>
                    </span>
                 </div>

            </div>
        );
    }



    render() {

        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-4">
                <div className="panel panel-default mail-messages">
                <ul className="mail-messages__options">
                    <li data-type="new-email" className="tourist-place-1 active" onClick={this.send_email_click.bind(this,'send_email')}>
                        <i className="fa fa-envelope-o fa-fw" aria-hidden="true"></i> New Email</li>
                    <li data-type="new-internal-message" className="" onClick={this.handle_new_message_click.bind(this,'notes')}>
                        <i className="fa fa-sticky-note-o fa-fw" aria-hidden="true"></i> New Internal Message</li>
                    <li data-type="schedule-activity" className="tourist-place-2" onClick={this.handle_shedule_activity_action.bind(this)}>
                        <i className="fa fa-clock-o fa-fw" aria-hidden="true"></i> Schedule an Activity</li>
                </ul>
                    { this.render_messages()}
                    { this.render_activity_new() }
                </div>
            </div>
        );
    }
}
module.exports = Message;