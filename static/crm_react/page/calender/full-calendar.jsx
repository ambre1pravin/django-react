import React from 'react';
import { Link} from 'react-router'
import  {
    IMAGE_PATH, ROLES,
    LOGED_IN_USER,
    PROFILE_IMAGE,
    language
} from 'crm_react/common/state';
import { getCookie } from 'crm_react/common/helper';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import EventModal from 'crm_react/page/calender/event-modal';
import EditEventModal from 'crm_react/page/calender/edit-event-modal';
import { translate} from 'crm_react/common/language';
import SyncronizeGoogle from 'crm_react/page/calender/syncronize-google';
const request = require('superagent');


class FullCalendar extends React.Component  {
    constructor(props) {
      super(props);
        this.state = {
            login_user:'',
            events:[],
            defaultView:'week',
            favorite:[],
            selected_favorite:[],
            select_fav_ids :[],
            names:[],
            attendies:[],
            tags:[],
            filter_state:'',
            search_div_suggestions_class:'form-group dropdown top-search',
            value:'',
            syncronize_button: false,
        }
      this.ajax_calendar_common_search = this.ajax_calendar_common_search.bind(this)
      this.serverRequest = $.get('/calender/favorite/', function (data) {
          this.setState({favorite:data});
      }.bind(this));

        if(this.props.routeParams.url !=undefined){
            let attendies = this.state.attendies
            attendies.push(this.props.routeParams.url)
            this.setState({attendies:attendies})
        }
        console.log('MYurl ', this.props.testvalue)

    }




    ajax_calendar_common_search(names, attendies, tags){
        $.ajax({
            type: "POST",
            dataType: "json",
            url: '/calender/meetings/',
            data: {
                select_fav_ids:JSON.stringify(this.state.select_fav_ids),
                names:JSON.stringify(names),
                attendies:JSON.stringify(attendies),
                tags:JSON.stringify(tags),
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                //this.setState({save_button_disable:'btn btn-primary disabled'})
            }.bind(this),
            success: function (data) {
                //$('#calendar').fullCalendar('refetchEvents');
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('addEventSource', data.result);
                $('#calendar').fullCalendar('rerenderEvents' );
                this.setState({syncronize_button:data.syncronize_button})
            }
        });
    }

    handle_selected_favorite(index){
        let favorite = this.state.favorite
        let new_selected_favorite = this.state.selected_favorite
        let select_fav_ids = this.state.select_fav_ids
        if(!select_fav_ids.includes(favorite[index].id)){
            select_fav_ids.push(favorite[index].id)
            new_selected_favorite.push(favorite[index])
            this.setState({selected_favorite:new_selected_favorite,select_fav_ids:select_fav_ids})
            $('#calendar').fullCalendar('refetchEvents');
        }
    }

    handle_remove_favorite(index){
        let new_selected_favorite = this.state.selected_favorite
        let select_fav_ids = this.state.select_fav_ids
        new_selected_favorite.splice(index, 1)
        select_fav_ids.splice(index, 1)
        this.setState({selected_favorite:new_selected_favorite,select_fav_ids:select_fav_ids})
        $('#calendar').fullCalendar('refetchEvents');
    }


    componentDidMount(){
        console.log("didmount")
        this.updateEvents()
        this.load_date_picker()

    }


    updateEvents() {
        let select_fav_ids = this.state.select_fav_ids;
        let names =this.state.names;
        let attendies = this.state.attendies;
        let tags = this.state.tags;
        var initialLocaleCode = 'en',
        today ='Today';
        if(language ==='French') {
            initialLocaleCode = 'fr';
            today = "Aujourd'hui";
        }
            //alert(initialLocaleCode)
            $('#calendar').fullCalendar({
                    locale: initialLocaleCode,
                    header: {
                      center: '',
                      right: 'agendaDay,agendaWeek,month',
                      left: 'today, prev,next,title'
                    },
                    views: {
                        month: { // name of view
                            titleFormat: 'MMMM YYYY'
                        },
                        week: {
                          titleFormat: 'MMMM YYYY'      // options apply to basicWeek and agendaWeek views
                        },
                        day: {
                           titleFormat: 'MMMM YYYY'
                        }
                    },
                    buttonText: {
                        today: today,
                    },

                    events: function(start, end, timezone, callback){
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: '/calender/meetings/',
                            data: {
                                select_fav_ids:JSON.stringify(select_fav_ids),
                                names:JSON.stringify(names),
                                attendies:JSON.stringify(attendies),
                                tags:JSON.stringify(tags),
                                csrfmiddlewaretoken: getCookie('csrftoken')

                            },
                            beforeSend: function () {

                            }.bind(this),
                            success: function (data) {
                                callback(data.result);
                            }
                        });

                    },
                    eventRender: function(event, element, view) {
                      element.attr('data-event', event.id);
                      $('<div class="fc-users">').insertAfter(element.find('.fc-content .fc-time'));
                      $.each(event.attendees, function(i, u) {
                        element.find('.fc-content .fc-users').append('<img src="'+u.color+'" width="20" height="20" title="'+u.name+'" style="margin-right:2px;" />')
                      });
                    },

                    defaultView: 'agendaWeek',
                    slotDuration: '00:15:00',
                    slotLabelInterval: '01:00:00',

                    droppable: true,
                    editable: true,
                    dragRevertDuration: '5',
                    lazyFetching: false,
                    forceEventDuration:true,
                    allDaySlot : true, // this allows things to be dropped onto the calendar
                    selectable: true,
                    selectHelper: true,
                    timeFormat: 'hh:mm A',
                    agenda: 'H(:mm)',
                    timezone:false,
                    scrollTime:'08:00:00',
                    eventClick: function (event) {

                        var starttime = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
                        var endtime = moment(event.end).format('YYYY-MM-DD HH:mm:ss');
                        var allDay = !event.start.hasTime() && !event.end.hasTime();
                        ModalManager.open(
                            <EditEventModal
                                event_id= {event.id}
                                title = "Contact Field Mapping"
                                modal_id = "edit_event_modal"
                                form_id =  "mapping_model"
                                meeting= {event.title}
                                start_time= {starttime}
                                end_time= {endtime}
                                all_day= {allDay}
                                selected_attendees={event.attendees}
                                selected_tags ={event.tags}
                                location={event.location}
                                delete_contact ={true}
                                onRequestClose={() => true}
                            />
                        )
                    },
                    select: function (start, end, allDay) {

                        var starttime = moment(start).format('YYYY-MM-DD HH:mm:ss');
                        var endtime = moment(end).format('YYYY-MM-DD HH:mm:ss');
                        var allDay = !start.hasTime() && !end.hasTime();
                        if(allDay){
                            starttime = start
                            endtime = end
                        }
                        ModalManager.open(<EventModal
                                        title = "Contact Field Mapping"
                                        modal_id = "create_meeting_modal"
                                        form_id =  "mapping_model"
                                        start_time= {starttime}
                                        end_time= {endtime}
                                        showModal = { true }
                                        all_day = {allDay}
                                        onRequestClose={() => true}

                                    />
                                )

                    },
                    viewRender: function (view, element) {
                    },
                    eventDrop: function (event, delta) {
                        var starttime = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
                        var endtime = moment(event.end).format('YYYY-MM-DD HH:mm:ss');
                        var allDay = !event.start.hasTime() && !event.end.hasTime();
                        var meeting_data ={
                            'event' : event.title,
                            'event_id' : event.id,
                            'start_time' : starttime,
                            'end_time' : endtime,
                            'all_day' : allDay,
                            'all_day_start' : '',
                            'all_day_end' : '',
                            'priority_level' : 1,
                            'meeting_type' : 1,
                            'selected_tags' : [],
                            'attendies' : []
                        }
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url: '/calender/event_save/',
                            data: {
                                event:JSON.stringify(meeting_data),
                                csrfmiddlewaretoken: getCookie('csrftoken')
                            },
                            beforeSend: function () {
                                //this.setState({save_button_disable:'btn btn-primary disabled'})
                            }.bind(this),
                            success: function (data) {
                               if(data.success === true){
                                   if(data.meeting > 0){

                                        NotificationManager.success(data.msg, 'success',5000);
                                        ModalManager.close(<EventModal modal_id = "create_meeting_modal" onRequestClose={() => true} />);
                                        //$('#calendar').fullCalendar('refetchEvents');
                                   }else{
                                        NotificationManager.error(data.msg, 'Error',5000);
                                   }
                               }else{
                                //To do trap errors
                               }
                            }.bind(this)
                        });
                    },
                    eventResize: function (event) {
                        var starttime = moment(event.start).format('YYYY-MM-DD HH:mm:ss');
                        var endtime = moment(event.end).format('YYYY-MM-DD HH:mm:ss');
                        var allDay = !event.start.hasTime() && !event.end.hasTime();
                       // var meeting_data ={'event_id':event.id,'event':event.title,'start': starttime, 'end':endtime,'all_day':allDay}
                        var meeting_data ={
                            'event' : event.title,
                            'event_id' : event.id,
                            'start_time' : starttime,
                            'end_time' : endtime,
                            'all_day' : allDay,
                            'all_day_start' : '',
                            'all_day_end' : '',
                            'priority_level' : 1,
                            'meeting_type' : 1,
                            'selected_tags' : [],
                            'attendies' : []
                        }
                        $.ajax({
                            type: "POST",
                            dataType: "json",
                            url:'/calender/event_save/',
                            data: {
                                event:JSON.stringify(meeting_data),
                                csrfmiddlewaretoken: getCookie('csrftoken')
                            },
                            beforeSend: function () {
                            }.bind(this),
                            success: function (data) {
                               if(data.success === true){
                                   if(data.meeting > 0){
                                        NotificationManager.success(data.msg, 'success',5000);
                                        ModalManager.close(<EventModal modal_id = "create_meeting_modal" onRequestClose={() => true} />);
                                   }else{
                                        NotificationManager.error(data.msg, 'Error',5000);
                                   }
                               }else{
                               }
                            }.bind(this)
                        });
                    },
                    drop: function() {
                        // is the "remove after drop" checkbox checked?
                        if ($('#drop-remove').is(':checked')) {
                            $(this).remove();
                        }
            }
        })
    }

    load_date_picker(){
        $("#datepicker").datepicker({
            dateFormat: 'yy-mm-dd',
            numberOfMonths: 1,
            changeMonth: false,
            changeYear: false,
            onSelect: function (dateText, inst) {
                var d = $("#datepicker").datepicker("getDate");
                $('#calendar').fullCalendar('gotoDate', d);
                var view = $('#calendar').fullCalendar('getView');
                $('#calendar').fullCalendar('getView',view.type);
            }
        })
    }

    render_top_row(){
        return(
            <div className="row top-actions">
                <div className="col-xs-12 col-sm-12">
                    <ul className="breadcrumbs-top">
                        <li>
                            {
                                this.props.routeParams.url !=undefined?
                                <div>
                                    <Link to ={'/contact/list/'}  className=""> Contacts / </Link>
                                    <Link to ={"/contact/view/"+this.props.routeParams.url}>{this.props.routeParams.url}</Link>
                                </div>
                                :translate('label_calendar')
                            }
                        </li>
                     </ul>
                </div>
            </div>
        );
    }

    render_right_users(){
        return(
            <div className="panel panel-primary calendar-users">
                <div className="panel-body">
                   {
                    this.state.favorite.length > 0  ?
                        this.state.favorite.map((fav, i) =>{
                            if (fav.logged_in_user){
                                return <div className="checkbox" key={'checkbox_'+i}>
                                      <img src={fav.profile_image} width="20" height="20" key={'img'+i}/>
                                      <span style={{borderBottom:'1px solid '+ fav.color}} key={'span_'+i}> {fav.name} </span>
                                    <i className="fa fa-times pull-right remove-fav-cal" aria-hidden="true" key={'i'+i}></i>
                                </div>
                            }else{
                                return null
                            }
                        })
                    : null
                    }
                    {
                        this.state.selected_favorite.length > 0  ?
                         this.state.selected_favorite.map((fav, i) =>{
                            let color_class =null
                            color_class = 'border-bottom-color-'+(i%10)
                            return <div className="checkbox" key={'login_checkbox_'+i}>
                                      <img src={fav.profile_image} width="20" height="20" key={'login_img_'+i}/>
                                      <span style={{borderBottom:'1px solid '+ fav.color}} key={'login_span'+i}>  {fav.name} </span>
                                    <i key={'login_i'+ i} className="fa fa-times pull-right remove-fav-cal" aria-hidden="true" onClick={this.handle_remove_favorite.bind(this,i)}></i>
                                </div>
                         })
                         : null
                    }

                    <div className="dropdown autocomplete favorite-calendar">
                        <input name="favorite-calendar" placeholder={translate('label_add_fab_cal')} data-toggle="dropdown" className="form-control" value="" type="text" />
                        <div className="dropdown-menu dd-options">
                            <ul className="options-list">
                                {
                                    this.state.favorite.length > 0  ?
                                        this.state.favorite.map((fav, i) =>{
                                            if(!fav.logged_in_user){
                                                return <li key={'ul_li_'+i} data-id={fav.id} onClick={this.handle_selected_favorite.bind(this,i)}>{fav.name}</li>
                                            }else{ return null }
                                        })
                                    :null
                                }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render_names(){
        let names = this.state.names
        return (
            names.length > 0 ?
                <div>
                    <span style={{background:'red',color:'#fff'}}>{translate('label_name')}</span>
                    <span>{names.join(" or ")}</span>
                    <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_names.bind(this)}></i>
                </div>
            :null
        );
    }

    render_attendies(){
        let attendies = this.state.attendies
        return (
            attendies.length > 0 ?
                <div>
                    <span style={{background:'red',color:'#fff'}}>{translate('label_attendies')}</span>
                    <span>{attendies.join(" or ")}</span>
                    <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_attendies.bind(this)}></i>
                </div>
            :null
        );
    }

    render_tags(){
        let tags = this.state.tags;
        return (
            tags.length > 0 ?
                <div>
                    <span style={{background:'red',color:'#fff'}}>{translate('label_tag')}</span>
                    <span>{tags.join(" or ")}</span>
                    <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_tags.bind(this)}></i>
                </div>
            :null
        );
    }

    remove_names(){
        var name_arr = [];
        this.setState({names:name_arr})
        this.ajax_calendar_common_search(name_arr, this.state.attendies, this.state.tags)
    }

    remove_attendies(){
        var attendies = [];
        this.setState({attendies:attendies})
        this.ajax_calendar_common_search(this.state.names, attendies, this.state.tags)
    }

    remove_tags(){
        var tags_arr = [];
        this.setState({tags:tags_arr})
        this.ajax_calendar_common_search(this.state.names, this.state.attendies, tags_arr)
    }


    handle_search_input(event){
        console.log("event.target.value")
        console.log(event.target.value)
        let svlaue = event.target.value
        this.setState({value:svlaue, search_div_suggestions_class:'form-group dropdown top-search open' })
    }
    handleEnterPress(e) {
        console.log(e.keyCode)
        if (e.key === 'Enter') {
            this.state.names.push(this.state.value)
            this.setState({value:''})
        }
    }

    handle_by_name(){
        let names = this.state.names;
        names.push(this.state.value)
        this.setState({names:names, value:''})
        this.ajax_calendar_common_search(names, this.state.attendies, this.state.tags)
    }

    handle_by_attendies(){
        let attendies = this.state.attendies
        attendies.push(this.state.value)
        this.setState({attendies:attendies,value:''})
        this.ajax_calendar_common_search(this.state.names, attendies, this.state.tags)
    }

    handle_by_tags(){
        let tags = this.state.tags
        tags.push(this.state.value)
        this.setState({tags:tags, value:''})
        this.ajax_calendar_common_search(this.state.names, this.state.attendies, tags)
    }

    render_header(){
        let msg_style ={
            marginLeft:'30px',
            height:'auto'
        }
        let search_value = this.state.value;
        return (
        <header className="crm-header clearfix module__contact">
        <div id="mega-icon" className="pull-left">
            <Link to={'/dashboard/'}>
                <i className="fa fa-th" aria-hidden="true"></i>
            </Link>
        </div>
        <h1 className="pull-left">
            <img src={IMAGE_PATH + '/static/front/images/saalz-small.jpg'} alt="Saalz" height="40" />
        </h1>

        <div className="pull-right">

            <div className={this.state.search_div_suggestions_class}>
                <div className="pull-left filter-list">
                    {
                        this.state.names.length > 0 ?
                            this.render_names()
                        :null
                    }
                    {   this.state.attendies.length > 0 ?
                            this.render_attendies()
                        :null
                    }
                    {
                        this.state.tags.length > 0 ?
                            this.render_tags()
                        :null
                    }

                </div>
                <form method="post" className="clearfix pull-left">
                    <input type="text"  value={search_value} className="form-control"  onChange={this.handle_search_input.bind(this)} placeholder={translate('label_search_placeholder')}/>
                </form>
                {
                   search_value  ?
                    <div className="dropdown-menu top-search__suggestions">
                        <ul>
                            <li onClick={this.handle_by_name.bind(this)}>Search <em>{translate('label_by_name')}</em> for <strong>{search_value}</strong></li>
                            <li onClick={this.handle_by_attendies.bind(this)}>Search <em>{translate('label_attendies')}</em> for <strong>{this.state.value}</strong></li>
                            <li onClick={this.handle_by_tags.bind(this)}>Search <em>{translate('label_by_tag')}</em> for <strong>{this.state.value}</strong></li>

                        </ul>
                    </div>
                : null
                }
            </div>

            <div className="top-profile dropdown">
                <a id="head__profile" href="#" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <span>{LOGED_IN_USER}</span>
                    <i className="fa fa-chevron-down"></i>
                    <img src={IMAGE_PATH + PROFILE_IMAGE} alt={this.state.login_user} className="top-dp" />
                </a>
                <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="profile">
                    <li><Link to="/user/profile/" title="Profile">Profile</Link></li>
                    <li><a href="#" title="Account Settings">Account Settings</a></li>
                    <li role="separator" className="divider"></li>
                    <li>
                        <a href={'/logout'} title="Sign Out">Sign Out</a>
                    </li>
                </ul>
            </div>
        </div>

    </header>

     );
 }

    render() {
          return (
               <div>
                    { this.render_header()}
                    <div id="crm-app" className="clearfix module__meeting">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    {this.render_top_row()}
                                    <div className="row crm-stuff">
                                        <div className="col-xs-12 col-sm-12 col-md-9 col-lg-9">
                                            <div id="calendar" className="fc fc-unthemed fc-ltr"></div>
                                        </div>
                                    <div className="col-xs-12 col-sm-3 col-md-3 col-lg-3">
                                        <SyncronizeGoogle />
                                        <div className="panel panel-primary min-cal">
                                            <div id="datepicker" className="minidate"></div>

                                        </div>
                                        {
                                            ROLES.includes("ROLE_MANAGE_ALL_CALENDAR") ?
                                                this.render_right_users()
                                            :null
                                        }
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <NotificationContainer/>
               </div>
          );
    }
  }
 module.exports = FullCalendar;