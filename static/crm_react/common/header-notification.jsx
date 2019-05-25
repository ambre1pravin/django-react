import React from 'react';
import { Link } from 'react-router'
import state, {IMAGE_PATH, ROLES, LOGED_IN_USER} from 'crm_react/common/state';
import { getCookie, js_uc_first} from 'crm_react/common/helper';


class HeaderNotification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result:[],
        };
       //setInterval( () => {
            this.serverRequest = $.get('/notification/', function (data) {
              this.setState({result: data.result });
            }.bind(this));
       //},5000)

    };

    mark_done(id){
        let activity = this.state.result
        let temp_activity = []
        if(activity.length > 0){
            for(var i=0; i < activity.length; i++){
                if(activity[i].id != id){
                    temp_activity.push(activity[i])
                }
            }
            this.setState({result: temp_activity });
        }
    }

    handle_mark_read(message_id, message_status){
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
                    //this.setState({result: data});
                    this.mark_done(message_id)
                }.bind(this)
            });
        }
    }

    handle_mark_all_read(){
        let activity = this.state.result
        let ids = []
        if(activity.length >0){
            for(var i=0; i<activity.length; i++){
                ids.push(activity[i].id)
            }
            if(ids.length > 0){
                 var csrftoken = getCookie('csrftoken');
                 $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: '/delete-activity/',
                    data: {
                        delete_activity_list : JSON.stringify(ids),
                        csrfmiddlewaretoken: csrftoken,
                        action:'all_read'
                    },
                    beforeSend: function () {
                        this.setState({progress_icon_status:true})
                    }.bind(this),
                    success: function (data) {
                        if(data.success === true || data.success == 'true'){
                            NotificationManager.success(data.msg, 'Success',5000);
                            this.setState({result: [] });
                        }
                        else{
                            alert('Something went wrong!!')
                        }
                    }.bind(this)
                });
            }
        }
    }


    render() {
        let _style ={display:'None'}
        let activities = this.state.result
        return (

            <div className="notifications dropdown">
                {
                    activities.length > 0 ?
                        <a id="head__noti" href="#" data-toggle="dropdown" role="button" aria-haspopup="true"
                           aria-expanded="true">
                            <i className="bell-icon-sprite"></i>
                            <span className="badge">{ activities.length }</span>
                        </a>
                    : null
                }
                {
                 activities.length > 0 ?
                <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="notifications">
                    <li className="clearfix">
                        <Link to="/next-activity/" className="pull-left">View All</Link>
                        <a href="javascript:" title="Mark all as notifications read" className="pull-right mark-all-read" onClick={this.handle_mark_all_read.bind(this)}>Mark all as read</a>
                    </li>
                    {
                        activities.length > 0 ?
                            activities.map((data, j) => {
                                return <li className="clearfix" key={"_li_clfix_"+ j}>
                                    <a href="javascript:" title="" className="pull-left">
                                        <i className={data.icon_class}></i><span>
                                        <strong>{js_uc_first(data.activity_type) +' - ' + data.created_by}</strong>{' - '+ data.summary}
                                        - <em>Due date: {data.activity_date}</em></span>
                                    </a>
                                    <div className="dropdown pull-right">
                                        <a href="javascript:" role="button" aria-haspopup="true" aria-expanded="false">
                                            <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                                        </a>
                                        <ul className="dropdown-menu noti-options" aria-labelledby="sub notifications">
                                            <li><a href="javascript:" data-action="opt-1"
                                                   onClick={this.handle_mark_read.bind(this, data.id, 'mark_read')}>Mark
                                                as Read</a></li>
                                            <li><a href="javascript:" data-action="opt-2"
                                                   onClick={this.handle_mark_read.bind(this, data.id, 'mark_done')}>Mark
                                                as Done</a></li>
                                        </ul>
                                    </div>
                                </li>
                            })
                         : null
                    }
                </ul>
                :null
               }
            </div>


        );
    }
}
module.exports = HeaderNotification;