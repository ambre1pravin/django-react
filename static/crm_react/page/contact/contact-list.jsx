import React from 'react';
import ReactTooltip from 'react-tooltip'
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Link } from 'react-router'
import state, { ROLES} from 'crm_react/common/state';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import CsvForm from 'crm_react/page/contact/csv-form';
import { getCookie} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';
import LoadingOverlay  from 'crm_react/common/loading-overlay';

class  ContactList extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            result: [],
            company_disable:'',
            individual_disable:'',
            css_vendor:'',
            css_customer:'',
            parameter: [],
            value:'',
            export_contact_info:'You can export contact from this page. If you want to export just some specific contacts, use search engine or checkbox and select desired contacts.',
            delete_contact_info:'You can delete contact from this page. If you want to delete just some specific contacts, use search engine or checkbox and select desired contacts.',
            names:this.props.search_states.names,
            emails:this.props.search_states.emails,
            tags:this.props.search_states.tags,
            filter_state:this.props.search_states.filters,
            page:1,
            previous_page:0,
            next_page:0,
            pagination_label:'',
            search_div_suggestions_class:'form-group dropdown top-search',
            export_disable:false,
            export_process:false,
            processing:false,
            processing_msg:'',
            checked: false,
            checked_all:false,
            delete_contact_list:[],
            grid_view_class:'tab-pane active in',
            list_view_class:'tab-pane',
            list_view_tab_class:'',
            grid_view_tab_class:'active',
            no_records:false,
            default_array: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46]
        };
        this.handleImportProcessing = this.handleImportProcessing.bind(this);
        this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, this.state.page)
    }


    handle_search_name_keyword(names, emails, tags, filters) {
        this.props.onSelectNames(names, emails, tags, filters);
    }

    handleImportProcessing(msg){
      if(msg !=''){
        this.setState({processing:true, processing_msg:msg})
      }else{
        this.setState({processing:false, processing_msg:''})
      }
    }

    handleFileIconClick(){
        ModalManager.open( <CsvForm
            title = {translate('label_upload_file')}
            modal_id = "csv_form"
            form_id =  "csv_form"
            showModal = { true }
            handleImportProcessing = {this.handleImportProcessing.bind(null)}
            onRequestClose={() => true}
           />
       );
    }

    export_disable(){
        if(this.state.names.length > 0 || this.state.names.emails > 0 || this.state.names.tags > 0 ||this.state.names.filter_state > 0){
           this.setState({export_disable:true});
        }else{
            this.setState({export_disable:false});
        }
    }

    export(){
        this.setState({list_view_class:'tab-pane active in',
                grid_view_class:'tab-pane',
                list_view_tab_class:'active',
                grid_view_tab_class:'',
        });

       this.select_contacts();
       let contact_list = this.state.delete_contact_list;
       var export_all = true;
       if(
            (contact_list.length > 0) ||
            (this.state.names.length > 0 || this.state.emails.length > 0 ||
                                            this.state.tags.length > 0 ||
                                            this.state.filter_state.length > 0)
         ){
            export_all = false
       }
       if(contact_list.length > 0) {
           $.ajax({
               type: "POST",
               dataType: "json",
               url: '/contact/export/',
               data: {
                   names: JSON.stringify(this.state.names),
                   emails: JSON.stringify(this.state.emails),
                   tags: JSON.stringify(this.state.tags),
                   contact: JSON.stringify(this.state.filter_state),
                   export_all: export_all,
                   selected_contact: JSON.stringify(contact_list),
                   csrfmiddlewaretoken: getCookie('csrftoken')
               },
               beforeSend: function () {
                   this.setState({
                       export_process: true,
                       processing: true,
                       processing_msg: translate('label_export_running')
                   });

               }.bind(this),
               success: function (data) {
                   if (data.success === true || data.success === 'true') {
                       window.open( '/' + data.file, '_blank');
                   } else {
                   }
                   this.setState({export_process: false, processing: false, processing_msg: ''});
               }.bind(this)
           });
           this.setState({delete_contact_list : []})
       }else{
            var msg='please select contacts ';
            NotificationManager.info(msg, '', 5000);
       }
    }

    custom_remove(item){
         var filters = this.state.filter_state;
         if(filters.length > 0){
              for (var i=0; i<filters.length; i++){
                if (filters[i]==item){
                  filters.splice(i,1);
                  break;
                }
              }
         }
    }

    handle_filter(filter_value){
      var filters = this.state.filter_state
      if(filter_value!='' && filter_value!=null){
        if(filters.indexOf(filter_value)!==-1){
            this.custom_remove(filter_value);
        }else{
            filters.push(filter_value);
        }
        this.setState({filter_state:filters});
        this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, this.state.previous_page)
      }
    }

    //pagination
    previous_page(){
        this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, this.state.previous_page)
    }

    next_page(){
        this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, this.state.next_page)
    }

    list_view_handle(){
        this.setState({list_view_class:'tab-pane active in',
                grid_view_class:'tab-pane',
                list_view_tab_class:'active',
                grid_view_tab_class:''
        })
    }

    grid_view_handle(){
        this.setState({list_view_class:'tab-pane',
                        grid_view_class:'tab-pane active in',
                        list_view_tab_class:'',
                        grid_view_tab_class:'active'
        })
    }

     render_result() {
   		let result = this.state.result;
   		return (
   		<div className="row contact-list">
   		    { result.length ? result.map((contact, i) =>{
   		        let profile_image = (contact.profile_image != undefined )? contact.profile_image : 'image_0.png';
   		        let contact_tags = (contact.tags !== undefined && contact.tags !== null && contact.tags.length > 0) ? contact.tags : [];
   		        return <div className="col-xs-12 col-ms-6 col-sm-4 col-md-4 col-lg-3 col-xl-2" key={i}>
                      <div className="panel panel-default">
                        <div className="panel-heading">
                          <ul className="list-inline inline-block tags">
                            {
                               contact_tags.length > 0 ?
                                    contact_tags.map((tags, j) =>{
                                    let faclass = 'fa fa-circle-o '+tags.color;
                                        return <li  key= {j}>
                                              <a href="#" data-toggle="tooltip" data-placement="top"  className={faclass} data-tip={tags.name}></a>
                                              <ReactTooltip type="warning"/>
                                        </li>
                                    })
                                :null
                            }
                          </ul>
                        </div>
                        <div className="panel-body">
                            <Link to={'/contact/view/'+ contact.uuid +'/'} >
                                  <div className="media">
                                    <div className="media-left">
                                      <img className="img-circle" src={ profile_image } alt={contact.name} />
                                    </div>
                                    <div className="media-body">
                                      <h4 className="media-heading">{contact.name}</h4>
                                      <div className="detail-contact text-muted">
                                        <p>{contact.job_position}</p>
                                        <p>{contact.city}</p>
                                        <p>{contact.phone}</p>
                                        <p>{contact.email}</p>
                                      </div>
                                    </div>
                                  </div>
                              </Link>
                        </div>
                        <div className="panel-footer clearfix">
                            <div className="pull-right text-right">
                                <ul className="list-inline inline">
                                  <li><button className={contact.total_opportunity > 0 ? "btn btn-primary" :"btn btn-default"}><i className="fa fa-star"></i> {contact.total_opportunity}</button></li>
                                  <li>
                                      {
                                          contact.total_meetings > 0 ?
                                          <Link to={'/calendar/list/'+contact.name} params={{ 'testvalue': contact.id}}>
                                               <button className={"btn btn-primary"}> <i className="fa fa-calendar"></i> {contact.total_meetings}</button>
                                          </Link>
                                          :<button className={"btn btn-default"}> <i className="fa fa-calendar"></i> {contact.total_meetings}</button>
                                      }
                                  </li>
                                  <li><button className={contact.total_sales > 0 ? "btn btn-primary" :"btn btn-default"}><i className="fa fa-usd"></i> {contact.total_sales}</button></li>
                                </ul>
                            </div>
                        </div>
                      </div>
                </div>
            }):null
            }
        </div>
   		);
     }

     // check_it
     check_all(){
        let checked = this.state.checked;
        let result_list = this.state.result;
        let temp_contact_list = [];
        if(result_list.length > 0){
            result_list.map((contact, i) =>{
                var tem_dic = result_list[i];
                if(checked){
                    tem_dic['checked'] = false
                }else{
                    tem_dic['checked'] = true
                }
                temp_contact_list.push(tem_dic)
            });
            if(checked){
                this.setState({checked : false})
            }else{
                this.setState({checked : true})
            }
            this.setState({result : temp_contact_list})
        }
     }

     handle_check(index){
        let result_list = this.state.result;
        if(result_list.length > 0){
            if(result_list[index].checked)
                result_list[index].checked = false;
            else
                result_list[index].checked = true;
            this.setState({result : result_list})
        }
     }

    select_contacts(){
        let delete_contact_list = this.state.delete_contact_list;
        let result_list = this.state.result;
        if(result_list.length > 0){
            result_list.map((contact, i) =>{
                if(result_list[i].checked){
                    delete_contact_list.push(result_list[i].id)
                }
            });
            this.setState({delete_contact_list : delete_contact_list})
        }
    }


     handle_delete(){
        this.setState({list_view_class:'tab-pane active in',
                grid_view_class:'tab-pane',
                list_view_tab_class:'active',
                grid_view_tab_class:'',
        });

        this.select_contacts();
        let contact_list = this.state.delete_contact_list;
        if(contact_list.length > 0){
            $.ajax({
                type: "POST",
                dataType: "json",
                url: '/contact/delete/',
                data: {
                    contacts : JSON.stringify(contact_list),
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                },
                beforeSend: function () {
                    this.setState({processing:true})
                }.bind(this),
                success: function (data) {
                    if(data.success === true || data.success == 'true'){
                        var msg = data.msg;
                        $.get('/contact/list_ajax/', function (return_data) {
                            if(return_data.success === true || data.success == 'true') {
                                this.setState({
                                    result: return_data.column_list,
                                    next_page: return_data.pagination.next_page,
                                    previous_page: return_data.pagination.previous_page,
                                    pagination_label: return_data.pagination.pagination_label,
                                    processing: false, checked_all: false,checked : false
                                });
                                NotificationManager.success(msg, 'Success', 5000);
                                //this.setState({processing: false, checked_all: false,checked : false})
                            }else{
                                this.setState({processing: false,result:[],no_records:true, pagination_label:''})
                            }
                        }.bind(this));
                    }else{
                            this.setState({processing: false,result:[],no_records:true,pagination_label:''})
                    }
                }.bind(this)
            });
            this.setState({delete_contact_list : []})
        }else{
            var msg='please select contacts '
            NotificationManager.info(msg, '', 5000);
        }
     }


    renderListView(){
        let result_list = this.state.result;
        return (
                <table className="table">
                    <thead>
                      <tr>
                        <th>
                          <div className="checkbox">
                            <input id="view-list__cb-all" checked = {this.state.checked} type="checkbox" onChange={this.check_all.bind(this)}/>
                            <label></label>
                          </div>
                        </th>
                        <th>Name</th>
                        <th>Company Name</th>
                        <th>Postal Address</th>
                        <th>Email</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                  <tbody>
                  {
                  result_list.length > 0 ?
                  result_list.map((contact, i) =>{
                  let profile_image = (contact.profile_image != undefined )? contact.profile_image : 'image_0.png'
                    return <tr key={i}>
                            <td>
                                <div className="checkbox">
                                    <input id="view-list__cb-1" value={contact.id} checked={contact.checked} type="checkbox" onChange={this.handle_check.bind(this,i)}/>
                                    <label></label>
                                </div>
                            </td>
                            <td data-th="Name">
                                <Link to={'/contact/view/'+ contact.uuid +'/'} className="view-list__dp-name" title={contact.name}>
                                    <img src={profile_image} alt={contact.name} className="dp-thumb img-circle" />
                                    <span className="name">{contact.name}</span>
                                </Link>
                            </td>
                            <td data-th="Company Name">{contact.company_name}</td>
                            <td data-th="Postal Address">{contact.city} <br/>{contact.state}</td>
                            <td data-th="Email">{contact.email}</td>
                            <td data-th="Phone">{contact.phone}</td>

                        </tr>
                    })
                  :null
                }
                </tbody>
                </table>
        );
    }

    render_blank(){
        var inline_style_media_heading ={
            'height':'10px',
            'backgroundColor':'#f2f2f2',
            'borderRadius':'4px',
            'width':'85%',
        }
        var style_p_1 ={
            'height':'10px',
            'width':'75%',
            'backgroundColor':'#f2f2f2',
            'borderRadius':'2px',
            'color':'#fff'
        }
        var style_p_2 ={
            'height':'10px',
            'width':'65%',
            'backgroundColor':'#f2f2f2',
            'borderRadius':'2px',
            'color':'#fff'
        }
        var style_p_3 ={
            'height':'10px',
            'width':'55%',
            'backgroundColor':'#f2f2f2',
            'borderRadius':'2px',
            'color':'#fff'
        }
        return(
            <div className="row contact-list">
                {
                    this.state.no_records ?
                     <div className="col-xs-12 col-ms-6 col-sm-4 col-md-4 col-lg-3 col-xl-2" >
                        no records
                    </div>
                    :this.state.default_array.map((item, i) => {
                    return <div className="col-xs-12 col-ms-6 col-sm-4 col-md-4 col-lg-3 col-xl-2" key={i}>
                        <div className="panel panel-default">
                        <div className="panel-heading"></div>
                        <div className="panel-body">
                          <div className="media">
                            <div className="media-left">
                              <img className="img-circle" src={ '/static/front/images/profile.png' }  />
                            </div>
                            <div className="media-body">
                              <h4 className="media-heading" style={inline_style_media_heading}></h4>
                              <div className="detail-contact text-muted">
                                <p><h4 className="media-heading" style={style_p_1}></h4></p>
                                <p><h4 className="media-heading" style={style_p_2}></h4></p>
                                <p><h4 className="media-heading" style={style_p_3}></h4></p>

                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="panel-footer clearfix">
                            <div className="pull-right text-right">
                            <ul className="list-inline inline">
                            <li><button className="btn btn-default"><i className="fa fa-star"></i> 0 </button></li>
                            <li><button className="btn btn-primary"> <i className="fa fa-calendar"></i> 0 </button></li>
                            <li><button className="btn btn-default"><i className="fa fa-usd"></i> 0 </button></li>
                            </ul>
                            </div>
                            </div>
                        </div>
                    </div>
                 })}
            </div>
        );
    }

//headers functions
    handle_search_input(event){
        if(event.target.value !=''){
            this.setState({value:event.target.value,search_div_suggestions_class:'form-group dropdown top-search open' })
        }else{
            this.setState({value:''})
        }
    }

    handle_by_name(){
        this.state.names.push(this.state.value);
        this.setState({value:''});
        this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, 0);
        this.handle_search_name_keyword(this.state.names, this.state.emails, this.state.tags, this.state.filter_state)
    }

    handle_by_email(){
        this.state.emails.push(this.state.value);
        this.setState({value:''});
        this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, 0);
        this.handle_search_name_keyword(this.state.names, this.state.emails, this.state.tags, this.state.filter_state)
    }

    handle_by_tags(){
        this.state.tags.push(this.state.value);
        this.setState({value:''});
        this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, 0);
        this.handle_search_name_keyword(this.state.names, this.state.emails, this.state.tags, this.state.filter_state)
    }

    handleEnterPress(e) {
        if (e.key === 'Enter') {
            this.state.names.push(this.state.value);
            this.render_names();
            this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, this.state.filter_state, 0);
            this.setState({value:''})
        }
    }

    onKeyDown(e) {
        if (e.keyCode === 8) {
            this.setState({names:[]});
            this.setState({emails:[]});
            this.setState({tags:[]});
            if(this.state.value == '') {
                this.ajax_common_search('', '', '', '', 0)
            }
        }
    }

    remove_names(){
        var name_arr = [];
        this.setState({names:name_arr});
        this.ajax_common_search(name_arr, this.state.emails, this.state.tags, this.state.filter_state, this.state.previous_page);
        this.handle_search_name_keyword(name_arr,this.state.emails,this.state.tags,this.state.filter_state );
    }

    remove_emails(){
        var emails_arr = [];
        this.setState({emails:emails_arr});
        this.ajax_common_search(this.state.names, emails_arr, this.state.tags, this.state.filter_state, this.state.previous_page);
        this.handle_search_name_keyword(this.state.names, emails_arr, this.state.tags,this.state.filter_state );
    }

    remove_tags(){
        var tags_arr = [];
        this.setState({tags:tags_arr});
        this.ajax_common_search(this.state.names, this.state.emails, tags_arr, this.state.filter_state, this.state.previous_page);
        this.handle_search_name_keyword(this.state.names, this.state.emails, tags_arr, this.state.filter_state );
    }

    render_names(){
        let names = this.state.names;
        return (
            <div data-type="search" data-key={translate('label_name')}>
            {
                names.map((name, j) =>{
                    return <span  data-separator="or" key= {j}>{name}</span>
                })
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_names.bind(this)}></i>
            </div>
        );
    }

    render_emails(){
        let emails = this.state.emails;
        return (
            <div data-type="search" data-key={translate('label_email')}>
            {
               emails.length > 0 ?
                emails.map((name, j) =>{
                    return <span  data-separator="or"  key= {j}>{name}</span>
                })
               :null
            }
             <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_emails.bind(this)}></i>
            </div>
        );
    }

    render_tags(){
        let tags = this.state.tags;
        return (
            <div data-type="search" data-key={translate('label_tag')}>
            {
               tags.length > 0 ?
                tags.map((name, j) =>{
                    return <span  data-separator="or"  key= {j}>{name}</span>
                })
               :null
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_tags.bind(this)}></i>
            </div>
        );
    }


    render_filters_company_or_individual(){
        let filters =  this.state.filter_state;
        let filter_one =[];

        for(var i=0; i < filters.length; ++i){
            if(filters[i]=='company' || filters[i]=='individual'){
                filter_one.push(filters[i])
            }
        }
        return (
            filter_one.length > 0 ?
                <div data-type="search" data-key="Filter">
                {
                    filter_one.map((name, j) =>{
                        if(name == 'company') {
                            return <span data-separator="or" key={j}>{name}</span>
                        }else if(name == 'individual') {
                            return <span data-separator="or" key={j}>{name}</span>
                        }else{
                            return null
                        }
                    })
                }
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_filter_one.bind(this)}></i>
                </div>
           :null
        );
    }

    remove_filter_one(){
         var filters = this.state.filter_state;
         if(filters.length > 0){
              for (var i=0; i<filters.length; i++){
                if(filters[i] =='company' || filters[i] =='individual'){
                  filters.splice(i,1);
                }
              }
             this.setState({filter_state: filters});
             this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, filters, this.state.previous_page)
         }
    }

    render_filters_vendor_or_customer(){
        let filters =  this.state.filter_state;
        let filter_two =[];
        for(var i=0; i < filters.length; ++i){
            if(filters[i]=='vendor' || filters[i]=='customer'){
                filter_two.push(filters[i])
            }
        }
        return (
            filter_two.length > 0 ?
                <div data-type="search" data-key="Filter">
                {
                    filter_two.map((name, j) =>{
                        if(name == 'vendor') {
                            return <span data-separator="or" key={j}>{name}</span>
                        }else if(name == 'customer') {
                            return <span data-separator="or" key={j}>{name}</span>
                        }else{
                            return null
                        }
                    })
                }
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_filter_two.bind(this)}></i>
                </div>
            :null
        );
    }

    remove_filter_two(){
         var filters = this.state.filter_state;
         if(filters.length > 0){
              for (var i=0; i<filters.length; i++){
                if(filters[i] =='vendor' || filters[i] =='customer'){
                  filters.splice(i,1);
                }
              }
             this.setState({filter_state: filters});
             this.ajax_common_search(this.state.names, this.state.emails, this.state.tags, filters, this.state.previous_page)
          }
    }

    ajax_common_search(names, emails, tags, filters, page){
        $.ajax({
            type: "POST",
            dataType: "json",
            url: '/contact/list_ajax/',
            data: {
                emails: JSON.stringify(emails),
                tags: JSON.stringify(tags),
                names : JSON.stringify(names),
                contact : JSON.stringify(filters),
                csrfmiddlewaretoken: getCookie('csrftoken'),
                page:page,
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {
               if(data.success == true || data.success == 'true') {
                   this.setState({
                       result: data.column_list,
                       next_page: data.pagination.next_page,
                       previous_page: data.pagination.previous_page,
                       pagination_label: data.pagination.pagination_label,
                       no_records:false,
                       processing:false
                   });
               }else{
                   this.setState({processing: false,result:[],no_records:true,pagination_label:''})
               }
            }.bind(this)
        });
    }

    render_header(){
        return (
            <header className="crm-header clearfix module__contact">
                <div id="mega-icon" className="pull-left">
                    <Link to={'/dashboard/'}>
                        <i className="fa fa-th" aria-hidden="true"></i>
                    </Link>
                </div>
                <h1 className="pull-left">
                    <img src={'/static/front/images/saalz-small.png'} alt="Saalz" height="30" />
                </h1>
                <div className="pull-right">
                    <div className={this.state.search_div_suggestions_class}>
                        <div className="pull-left filter-list">
                            {
                                this.state.names.length > 0 ?
                                    this.render_names()
                                :null
                            }
                            {   this.state.emails.length > 0 ?
                                    this.render_emails()
                                :null
                            }
                            {
                                this.state.tags.length > 0 ?
                                    this.render_tags()
                                :null
                            }
                            {
                                this.state.filter_state.length > 0 ?
                                    this.render_filters_company_or_individual()
                                : null
                            }
                            {
                                this.state.filter_state.length > 0 ?
                                    this.render_filters_vendor_or_customer()
                                : null
                            }
                        </div>
                        <form method="post" className="clearfix pull-left" data-toggle="dropdown" aria-haspopup="true">
                            <input type="text" onKeyDown={this.onKeyDown.bind(this)} onKeyPress={this.handleEnterPress.bind(this)} className="form-control" value={this.state.value} onChange={this.handle_search_input.bind(this)} placeholder={translate('label_search_placeholder')}/>
                            <input type="submit" value="Find" className="search-icon-sprite" />
                        </form>
                        {
                           this.state.value !=''  ?
                            <div className="dropdown-menu top-search__suggestions">
                                <ul>
                                    <li onClick={this.handle_by_name.bind(this)}>Search <em>{translate('label_by_name')}</em> for <strong>{this.state.value}</strong></li>
                                    <li onClick={this.handle_by_email.bind(this)}>Search <em>{translate('label_by_email')}</em> for <strong>{this.state.value}</strong></li>
                                    <li onClick={this.handle_by_tags.bind(this)}>Search <em>{translate('label_by_tag')}</em> for <strong>{this.state.value}</strong></li>
                                </ul>
                            </div>
                        : null
                        }
                    </div>
                    {<HeaderNotification/>}
                    {<HeaderProfile />}
                </div>
            </header>
        );
    }

    render() {
        let result_list = this.state.result;
        return (
            <div>
               { this.render_header()}
               <div id="crm-app" className="clearfix module__contact">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                               <div className="row top-actions d-lg-flex">
                                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                        <ul className="breadcrumbs-top">
                                            <li>
                                                { this.props.type == 'customer' ?
                                                    <span>
                                                        <Link to={'/sales/'} className="breadcumscolor">{'Sales'}</Link>
                                                        {' / Customer '}
                                                    </span>
                                                    :<Link to={'/contact/list/'}>{translate('label_contact')}</Link>
                                                }
                                            </li>
                                        </ul>
                                        {
                                            ROLES.includes("ROLE_MANAGE_ALL_CONTACT") ?
                                                <Link to={'/contact/add/'} className="btn btn-new new-sub-contact">{translate( 'add_contact')}</Link>
                                            :null
                                        }
                                    </div>
                                    <div className="col-xs-12 col-sm-12 col-md-6 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                                          <ul className="list-inline inline-block filters-favourite">
                                              <li className="dropdown selection">
                                                <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="filters">
                                                  <i className="filter-icon-sprite"></i>{translate( 'label_filter')}<i className="fa fa-angle-down push-left-3"></i>
                                                </span>
                                                  <ul className="dropdown-menu" aria-labelledby="filters" id="filters">
                                                    <li className={this.state.filter_state.indexOf('company')!==-1?'selected':''} data-index="company" onClick={this.handle_filter.bind(this,'company')}  >{ translate( 'label_filter_by_company') }</li>
                                                    <li className="divider"></li>
                                                    <li className={this.state.filter_state.indexOf('individual')!==-1?'selected':''} data-index="individual" onClick={this.handle_filter.bind(this,'individual')}>{ translate( 'label_filter_by_individual') }</li>
                                                    <li className="divider"></li>
                                                    <li className={this.state.filter_state.indexOf('vendor')!==-1?'selected':''} data-index="vendor" onClick={this.handle_filter.bind(this,'vendor')}>{ translate( 'label_filter_by_vendor') }</li>
                                                    <li className="divider"></li>
                                                    <li className={this.state.filter_state.indexOf('lead')!==-1?'selected':''} data-index="lead" onClick={this.handle_filter.bind(this,'lead')}>{ 'Filter by Lead' }</li>
                                                    <li className="divider"></li>
                                                    <li className={this.state.filter_state.indexOf('customer')!==-1?'selected':''} data-index="customer" onClick={this.handle_filter.bind(this,'customer')}>{ translate( 'label_filter_by_customer') }</li>
                                                  </ul>
                                              </li>
                                          {
                                            ROLES.includes("ROLE_MANAGE_ALL_CONTACT")?
                                              <li className="dropdown selection">
                                                    <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="favourites">
                                                         {translate( 'label_action')}<i className="fa fa-angle-down push-left-3" ></i>
                                                    </span>
                                                  <ul className="dropdown-menu" aria-labelledby="favourites">
                                                      <li onClick={this.handleFileIconClick.bind(this)}>{ translate( 'label_import_contacts') }</li>
                                                      <li className="divider"></li>
                                                      <li onClick={this.handle_delete.bind(this)}>
                                                        { translate( 'label_delete_contacts') }
                                                        <span  data-tip data-for='delete_contact_info'  className="glyphicon glyphicon-info-sign text-primary push-left-1"></span>
                                                        <ReactTooltip place="bottom"  id='delete_contact_info'type="info" effect="float">
                                                          <span>{this.state.delete_contact_info}</span>
                                                        </ReactTooltip>
                                                      </li>
                                                      <li className="divider"></li>
                                                      <li onClick={this.export.bind(this)}>{ translate( 'label_export_contacts') }
                                                       <span  data-tip data-for='export_contact_info'   className="glyphicon glyphicon-info-sign text-primary push-left-1"></span>
                                                       <ReactTooltip place="bottom"  id='export_contact_info' type="info" effect="float">
                                                          <span>{this.state.export_contact_info}</span>
                                                        </ReactTooltip>
                                                      </li>
                                                  </ul>
                                              </li>
                                            :null
                                          }
                                          </ul>
                                          <ul className="list-inline inline-block top-actions-pagination">
                                                <li>{this.state.pagination_label}</li>
                                                <li><a href="javascript:" onClick={this.previous_page.bind(this)}><i className="fa fa-chevron-left"></i></a></li>
                                                <li><a href="javascript:" onClick={this.next_page.bind(this)}><i className="fa fa-chevron-right"></i></a></li>
                                          </ul>
                                          <ul className="nav nav-tabs nav-pills inline-block" role="tablist">
                                              <li  className={this.state.grid_view_tab_class} onClick={this.grid_view_handle.bind(this)}>
                                                <a href="javascript:">
                                                    <i className="thumb-icon-sprite"></i>
                                                </a>
                                              </li>
                                              <li  className={this.state.list_view_tab_class} onClick={this.list_view_handle.bind(this)}>
                                                <a href="javascript:"><i className="list-icon-sprite"></i></a>
                                              </li>
                                          </ul>
                                    </div>
                               </div>
                                <div className="row crm-stuff">
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                       <div className="tab-content">
                                            <div  className={this.state.grid_view_class} id="view-grid">
                                               {
                                                result_list.length > 0 ?
                                                  this.render_result()
                                                : this.render_blank()
                                                }
                                            </div>
                                            <div className={this.state.list_view_class}  id="view-list">
                                                {this.renderListView()}
                                            </div>
                                       </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <NotificationContainer/>
                   <LoadingOverlay processing={this.state.processing}/>
               </div>
            </div>
        );
    }
}
module.exports = ContactList;
