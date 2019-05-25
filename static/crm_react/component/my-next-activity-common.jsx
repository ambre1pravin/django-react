import React from 'react';
import { Link, transitionTo,router,browserHistory } from 'react-router'
import { NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal, ModalManager} from 'react-dynamic-modal';
import ContactHeader from 'crm_react/page/contact/contact-header';
import { get_contact_info, getCookie, processForm, get_input_value, js_uc_first } from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';

class  NextActitvityCommon extends React.Component {
	constructor() {
        super();
        this.state = {
            result:[],
            filter_state:[],
            page:1,
            previous_page:0,
            next_page:0,
            pagination_label:'',
            delete_activity_list:[]
        }
        this.ajax_common_search( this.state.filter_state, this.state.page)
    }

    ajax_common_search(filters, page){
        var csrftoken = getCookie('csrftoken');
        $.ajax({
           type: "POST",
           dataType: "json",
            url: '/fetch_activity/',
                data: {
                filters : JSON.stringify(filters),
                    csrfmiddlewaretoken: csrftoken,
                    page:page,
                },
            beforeSend: function () {
                this.setState({progress_icon_status:true})
            }.bind(this),
            success: function (data) {
               if(data.success == true || data.success == 'true') {
                   this.setState({
                       result: data.result,
                       next_page: data.pagination.next_page,
                       previous_page: data.pagination.previous_page,
                       pagination_label: data.pagination.pagination_label,
                       progress_icon_status: false,
                   });
               }else{
                   this.setState({progress_icon_status: false,result:[],no_records:true,pagination_label:''})
               }

            }.bind(this)
        });
    }
    //pagination
    previous_page(){
        this.ajax_common_search(this.state.filter_state, this.state.previous_page)
    }

    next_page(){
        this.ajax_common_search(this.state.filter_state, this.state.next_page)
    }

    custom_remove(item){
         var filters = this.state.filter_state
         if(filters.length > 0){
              for (var i=0; i<filters.length; i++){
                if (filters[i]==item){
                  filters.splice(i,1); //this delete from the "i" index in the array to the "1" length
                  break;
                }
              }
          }
    }

    handle_filter(filter_value){
      var filters = this.state.filter_state
      if(filter_value!='' && filter_value!=null){
        if(filters.indexOf(filter_value)!==-1){
            this.custom_remove(filter_value)
        }else{
            filters.push(filter_value)
        }
        this.setState({filter_state:filters})
        this.ajax_common_search(this.state.filter_state, this.state.previous_page)
      }
    }



    handle_check(index){
       let result_list = this.state.result;
       if(result_list.length > 0){
            if(result_list[index].checked)
                result_list[index].checked = false
            else
                result_list[index].checked = true
            this.setState({result : result_list})
       }
    }

    handle_delete(action_type){
        let activity = this.state.result;
        let delete_activity_list = this.state.delete_activity_list
        let csrftoken = getCookie('csrftoken');
        if(activity.length > 0){
            activity.map((user, i) =>{
                if(activity[i].checked){
                    delete_activity_list.push(activity[i].id)
                }
            })
            this.setState({delete_activity_list : delete_activity_list})
        }
        if(this.state.delete_activity_list.length > 0){
            $.ajax({
                type: "POST",
                dataType: "json",
                url:'/delete-activity/',
                data: {
                    delete_activity_list : JSON.stringify(this.state.delete_activity_list),
                    csrfmiddlewaretoken: csrftoken,
                    action:action_type
                },
                beforeSend: function () {
                    this.setState({progress_icon_status:true})
                }.bind(this),
                success: function (data) {
                    if(data.success === true || data.success == 'true'){
                        NotificationManager.success(data.msg, 'Success',5000);
                        this.setState({delete_activity_list : [] })
                        this.ajax_common_search( this.state.filter_state, this.state.page)
                    }
                    else{
                        alert('Something went wrong!!')
                    }
                }.bind(this)
            });
        }
    }

    set_messages(data){ }


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
                    this.ajax_common_search( this.state.filter_state, this.state.page)
                }.bind(this)
            });
        }
    }


    render_activity_new(){
        let new_result = this.state.result
        var divStyle = {borderBottom: "1px solid #ddd"};
        return(
                <div className="row">
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 center-block float-none">
                <div className="panel panel-default mail-messages">
                 <ul className="timelines">
                    {
                        new_result.length > 0 ?
                            new_result.map((data, i) => {
                             return <div key ={i} style={divStyle}>
                                 <li>
                                    <div className={data.mark_done_div_class}>
                                        <div className="media-left">
                                        <span className="done-mark" onClick={this.handle_mark_read.bind(this, data.id, data.mark_done)}>
                                            <svg viewBox="0 0 32 32"><polygon
                                                points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 "></polygon></svg>
                                        </span>
                                        </div>
                                        <div className="media-body">

                                                <h4 className="media-heading">
                                                    <Link to={data.link}>
                                                      { data.activity_type == 'Other' ?
                                                        <span className="text-primary" >{js_uc_first(data.activity_type) + ' task'}</span>
                                                        :<span className="text-primary" >{js_uc_first(data.activity_type)}</span>
                                                      }
                                                    </Link>
                                                    &nbsp;&nbsp;{ translate('planned_by')}&nbsp;{ data.created_by}&nbsp;&nbsp;
                                                    <small>{data.activity_date}</small>
                                                </h4>
                                                <p>{data.summary}</p>
                                        </div>
                                    </div>
                                  </li>
                                </div>
                            })
                            :null
                    }
                   </ul>
                </div>
                </div>
                </div>
        );
    }

    render() {
        var marginLeft ={marginLeft:'10px'}
        let result = this.state.result
        return (
            <div>
               <ContactHeader header_css="crm-header clearfix module__contact module__contact-create" login_user={this.state.login_user}/>
                <div id="crm-app" className="clearfix module__contact module__contact-create">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div className="row top-actions">
                                    <div className="col-xs-12 col-sm-12">
                                        <ul className="breadcrumbs-top"><li>Next Activity</li></ul>
                                    </div>
                                    <div className="col-xs-12 col-sm-12 pull-right text-right">
                                        <ul className="list-inline inline-block filters-favourite">
                                            <li className="dropdown selection">
                                                <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="filters"><i class="filter-icon-sprite"></i>
                                                    <i className="filter-icon-sprite"></i> Filter
                                                </span>
                                                <ul className="dropdown-menu" aria-labelledby="filters">
                                                    <li onClick={this.handle_filter.bind(this,'today_activity')}>Today Activities</li>
                                                    <li role="separator" className="divider"></li>
                                                    <li onClick={this.handle_filter.bind(this,'next_week_activity')}>This Week Activities</li>
                                                    <li role="separator" className="divider"></li>
                                                    <li onClick={this.handle_filter.bind(this,'overdue_activity')}>Overdue Activities</li>
                                                    <li role="separator" className="divider"></li>
                                                    <li onClick={this.handle_filter.bind(this,'not_done')}>Incompleted</li>
                                                    <li role="separator" className="divider"></li>
                                                    <li onClick={this.handle_filter.bind(this,'done')}>Completed</li>
                                                </ul>
                                            </li>
                                        </ul>
                                        <ul className="list-inline inline-block top-actions-pagination">
                                            <li>{this.state.pagination_label}</li>
                                            <li onClick={this.previous_page.bind(this)}><a href="javascript:"><i className="fa fa-chevron-left"></i></a></li>
                                            <li onClick={this.next_page.bind(this)}><a href="javascript:"><i className="fa fa-chevron-right"></i></a></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
               </div>
                <NotificationContainer/>
                { this.render_activity_new() }
            </div>
        );
    }
}
module.exports = NextActitvityCommon;
