import React from 'react';
import {  Link, browserHistory } from 'react-router'
import { NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import  {
    IMAGE_PATH, ROLES
} from 'crm_react/common/state';

import ContactHeader from 'crm_react/page/contact/contact-header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import MultiSelect from 'crm_react/page/contact/multiselect';
import FormDateField from 'crm_react/page/contact/form-date-field';
import CreateSubContactModal from 'crm_react/page/contact/create-sub-contact-modal';
import Customer from 'crm_react/component/customer';
import EditSubContactModal from 'crm_react/page/contact/edit-sub-contact-modal';
import { get_contact_info , getCookie, processForm, get_input_value,add_sub_contact_button_text  } from 'crm_react/common/helper';
import InputText from 'crm_react/page/contact/input-text';
import { translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';


class  ContactUpdate extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            edit_result: null,
            email:'',
            phone:'',
            mobile:'',
            street:'',
            street2:'',
            city:'',
            zip:'',
            country:'',
            selected_tags:[],
            companies:[],
            tabs:[],
            subcontacts:[],
            default_fields:[],
            result: [],
            main_contact_id:0,
            contact_company_id:0,
            contact_company_name:'',
            profile_image:'',
            main_contact_name:'',
            main_contact_first_name:null,
            main_contact_last_name:null,
            is_vendor:false,
            is_customer:false,
            is_lead:false,
            is_company:false,
            is_individual:false,
            save_button_disable:'btn btn-primary',
            total_opportunity:0,
            total_meetings:0,
            total_sales:0,
            processing:false,
        };
        this.handleSubContactCreateSaveClick = this.handleSubContactCreateSaveClick.bind(this);
        this.handleEditSubContactEditSaveClick = this.handleEditSubContactEditSaveClick.bind(this);

        this.handleCreateEditComapny = this.handleCreateEditComapny.bind(this);
        this.serverRequest = $.get('/contact/update_ajax/'+this.props.contact_id+'/', function (data) {
              data.tabs.forEach(function(tab, j) {
                 if(tab.is_default){
                    this.setState({default_fields:tab.fields})
                 }
              }.bind(this));

            if(data.contact_type == 'I'){
                this.setState({is_individual:true,is_company:false})
            }else{
                this.setState({is_individual:false,is_company:true})
            }
            this.setState({
                    result:data.tabs,
                    main_contact_id:data.id,
                    email:data.email,
                    phone:data.phone,
                    mobile:data.mobile,
                    street:data.street,
                    street2:data.street2,
                    city:data.city,
                    zip:data.zip,
                    country:data.country,
                    profile_image:data.profile_image,
                    selected_tags:data.tags,
                    edit_result:true,
                    tabs :data.tabs,
                    main_contact_name:data.name,
                    main_contact_first_name:data.first_name,
                    main_contact_last_name:data.last_name,
                    is_vendor:data.is_vendor,
                    is_customer:data.is_customer,
                    is_lead:data.is_lead,
                    main_contact_email:data.email,
                    subcontacts:data.sub_contact,
                    contact_company_id:data.company_id,
                    contact_company_name:data.company_name,
                    total_opportunity:data.total_opportunity,
                    total_meetings:data.total_meetings,
                    total_sales:data.total_sales
                  });
        }.bind(this) );

        this.serverRequest = $.get('/contact/index/', function (data) {
            this.setState({result:data.fields});
        }.bind(this));
    }

    handleIsCompany(event){
         if(event.target.checked){
            this.setState({is_company: true});
            this.setState({is_individual: false})
         }else{
            this.setState({is_company: false});
            this.setState({is_individual: true,contact_company_name:''})
         }
    }

    handleIsIndvidual(event){
        if(event.target.checked){
            this.setState({is_company: false});
            this.setState({is_individual: true,contact_company_name:''})
        }else{
            this.setState({is_company: true});
            this.setState({is_individual: false})
        }
    }

    on_change_first_name(event){
        this.setState({main_contact_first_name:event.target.value});
    }

    on_change_last_name(event){
        this.setState({main_contact_last_name:event.target.value});
    }

    handle_is_vender(){
       this.setState({is_vendor: !this.state.is_vendor});
    }

    handle_is_customer(){
     this.setState({is_customer: !this.state.is_customer})
    }

    handle_is_lead(){
     this.setState({is_lead:!this.state.is_lead})
    }

    handle_contact_name(event){
        this.setState({
            main_contact_name : event.target.value
        })
    }

    return_selectd_tags(selected_tags){
       this.setState({selected_tags:selected_tags})
    }

    // profile image upload
    handleImageOnChange(){
         $("#message_file_upload_from").submit();
         $("#message_file_uploader").unbind().load(function() {  // This block of code will execute when the response is sent from the server.
           var result =  JSON.parse($("#message_file_uploader").contents().text());
            if(result.success === 'true' || result.success === true){
                this.setState({ profile_image : result.file})
            }
        }.bind(this));
    }

    handleSaveContact (){
        if ( $('#contact-main-form').valid()) {
            var constact = {};
            var main_form_data = processForm('#contact-main-form', '','');
                constact.main = main_form_data;
                constact.main.name = this.state.main_contact_name;
                constact.main.first_name = (this.state.is_individual) ? this.state.main_contact_first_name : null;
                constact.main.last_name = (this.state.is_individual) ? this.state.main_contact_last_name : null;
                constact.main.contact_id = this.state.main_contact_id;
                constact.main.contact_type = (this.state.is_individual)?'I':'C';
                constact.main.is_vendor = this.state.is_vendor;
                constact.main.is_customer = this.state.is_customer;
                constact.main.is_lead = this.state.is_lead;
                constact.main.parent_id =this.state.contact_company_id;
                constact.main.contact_company_id =this.state.contact_company_id;
                constact.main.profile_image = this.state.profile_image;
                constact.main.tags = this.state.selected_tags;
            var subcontacts = this.state.subcontacts;
            constact.subcontacts = subcontacts;
            if(this.state.save_button_disable !=='btn btn-primary disabled'){
                $.ajax({
                     type: "POST",
                     dataType: "json",
                     url:'/contact/update/',
                    data: {
                        contact :JSON.stringify(constact),
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                        this.setState({save_button_disable:'btn btn-primary disabled',processing:true})

                    }.bind(this),
                    success: function (data) {
                       if(data.success === true){
                           this.setState({processing:false});
                           browserHistory.push('/contact/view/'+this.props.contact_id+'/');
                       }else{
                            NotificationManager.error(data.message, 'Error',5000);
                       }

                    }.bind(this)
                });
            }else{
                NotificationManager.error('Please wait!!', 'Error',5000);
            }
        }else{
           NotificationManager.error('Please enter name.', 'Error', 5000, () => {
           });
        }
    }

    render_fields(tab_fields){
        let fields = tab_fields;
            return (
                fields.map((f, i) =>{
                     return this.render_fields_with_type(f.type,f.id,f.name,f.default_values,f.value, f.display_position ,f.is_required)
                })
            );
    }

    render_fields_with_type(field_type,field_id,field_name,default_value, in_value, display_position, is_required){
        let  input_value = in_value !== undefined ? in_value :'';
        var data = {'data_id':field_id,
                    'name':field_name,
                    'type':field_type,
                    'input_value': input_value,
                    'default_value':default_value,
                    'display_position':display_position,
                    'display_type':'',
                    'is_required':is_required
                };

        switch(field_type) {
            case "single-line":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "phone":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "mobile":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "drop-down":
                return <DropDown key={field_id}
                        component_data ={data}
                />;
            case "checkbox":
                return <Checkbox key={field_id}
                        component_data ={data}
                />;
            case "radio":
                return <Radio key={field_id}
                        component_data ={data}
                />;
            case "multi-line":
                return <MultiLine key={field_id}
                    component_data ={data}
                />;
            case "date":
                return <FormDateField key={field_id}
                        component_data ={data}
                />
        }
    }

    handleFileIconClick(){
        $("#message_attatchment_file").trigger("click");
    }

    render_contact_name(){
        return (
            <tr>
                <td rowSpan="2">
                    <div className="edit-dp">
                    <img className="" data-index="main_form" id="uimage" src={this.state.profile_image} width="98" height="98" />
                    <input autoComplete="off" id="hidden_profile_image" value="" type="hidden" />
                    <span className="fa fa-pencil edit" onClick={this.handleFileIconClick.bind(this)}></span>
                    </div>
                </td>
                {this.state.is_company ?
                    <td>
                        <div className="form-group edit-name">
                            <input onChange={this.handle_contact_name.bind(this)} value={this.state.main_contact_name}
                                   className="edit-name form-control" required="" name="name" id="name"
                                   placeholder="Name" type="text"/>
                        </div>
                    </td>
                    : null
                }
                { this.state.is_individual ?
                    <td className="fc-individual-name" style={{'width':'100%'}}>
                        <div className="form-group edit-name pull-left">
                            <input type="text" name="first-name" placeholder="First Name" value={this.state.main_contact_first_name}
                                   className="form-control tourist-place-1" onChange={this.on_change_first_name.bind(this)}/>
                        </div>
                        <div className="form-group edit-name pull-right">
                            <input type="text" name="last-name" placeholder="Last Name" value={this.state.main_contact_last_name}
                                   className="form-control" onChange={this.on_change_last_name.bind(this)}/>
                        </div>
                    </td>
                    : null
                }
            </tr>
        );
    }


    set_lead_return_data(data){
        this.setState({contact_company_id: data.id})
    }

    handleCreateEditComapny(data){
        let companies = this.state.companies;
        companies.push(data);
        this.setState({companies : companies})
    }

   renderCompanyName(){
        return (
                <tr>
                    <td>
                    {
                        <div id="company" className="form-group">
                            <div className="dropdown autocomplete">
                                <input type="text" placeholder={this.state.selected_company_name}  autoComplete="off" name="company" data-toggle="dropdown" className="form-control"  />
                                <input type="hidden" value={this.state.selected_company_id}/>
                                <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                    <i id="main_form_company_down_icon" className="fa fa-angle-down black"></i>
                                </span>
                                <div id="company_drop_box" className="dd-options">
                                    <ul className="options-list">
                                    {
                                        this.state.displayCompany ?
                                            this.state.displayCompany.map((company, i) =>{
                                                    if(i <=7)
                                                    return <li key={i} data-companyid="0" data-color="1" data-createuid="0" data-id={company.id} >{company.name}</li>
                                            })
                                        : null
                                    }
                                        <li data-action="create" ><em>Create {this.state.input_value}</em></li>
                                        <li data-action="create-edit" ><em>Create and Edit  {this.state.input_value}</em></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    }

                    </td>
                </tr>
        );
    }

    render_default_tab_data(tab_fields){
        let fields = tab_fields;
        let left_side_fields = [] ;
        let right_side_fields = [] ;
        fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                        'default_values':f.default_values,
                        'display_position':f.display_position,
                        'is_required' :f.is_required
                    };
                    left_side_fields.push(fields_data)
                }else{
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                        'default_values':f.default_values,
                        'display_position':f.display_position,
                        'is_required' :f.is_required
                    };
                    right_side_fields.push(fields_data)
                }
            }
        });

        return (
            <div className="row row__flex">
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                    <table className="detail_table">
                        <tbody>
                             { this.render_contact_name() }
                             { this.state.is_individual?
                                <Customer
                                    field_name="company"
                                    field_label="company"
                                    show_lable={false}
                                    customer_type ='company'
                                    set_return_data ={this.set_lead_return_data.bind(this)}
                                    get_data_url="/contact/company/"
                                    post_data_url="/contact/company_create/"
                                    selected_name={this.state.contact_company_name}
                                    selected_id={this.state.contact_company_id}
                                    item_selected={false}
                                    create_option={true}
                                    create_edit_option={false}
                                />

                                :<tr><td></td></tr>
                             }
                             { <InputText value={this.state.email} name='email' label='Email'/> }
                             { <InputText value={this.state.phone} name='phone' label='Phone'/> }
                             { <InputText value={this.state.mobile} name='mobile' label='Mobile'/> }
                             { <InputText value={this.state.street} name='street' label='Street'/> }
                             { <InputText value={this.state.street2} name='street2'label='Street2' /> }
                             { <InputText value={this.state.city} name='city' label='City'/> }
                             { <InputText value={this.state.zip} name='zip' label='Zip'/> }
                             { <InputText value={this.state.country} name='country' label='Country'/> }
                             { this.render_fields(left_side_fields) }
                         </tbody>
                    </table>
                </div>
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <table className="detail_table">
                        <tbody>
                            { this.render_fields(right_side_fields) }
                            <MultiSelect
                                field_name="tag"
                                field_label="Tags"
                                selected_tags={this.state.selected_tags}
                                show_lable={true}
                                get_data_url="/contact/tags/"
                                post_data_url="/contact/tag_create/"
                                create_option={true}
                                create_edit_option={false}
                                retrun_selectd_tags={this.return_selectd_tags.bind(this)}
                            />
                         </tbody>
                     </table>
                </div>
            </div>
        );
    }


    render_custom_tab_data(tab_fields){
        let fields = tab_fields;
        let left_side_fields = [] ;
        let right_side_fields = [] ;
        fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                        'default_values':f.default_values,
                        'display_position':f.display_position,
                        'is_required' :f.is_required
                    };
                    left_side_fields.push(fields_data)
                }else{
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                        'default_values':f.default_values,
                        'display_position':f.display_position,
                        'is_required' :f.is_required
                    };
                    right_side_fields.push(fields_data)
                }
            }
        });
        return (
            <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>

                     { this.render_fields(left_side_fields) }
                    </tbody>
                </table>
                </div>
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                <table className="detail_table">
                    <tbody>
                    { this.render_fields(right_side_fields) }
                    </tbody>
                </table>
            </div>

            </div>
        );
    }

    renderForm(){
        let tabs = this.state.tabs;
        return (
        tabs.length > 0 ?
            <form id="contact-main-form" autoComplete="off">
                <div className="tab-content">
                {
                    tabs.map((tab, i) =>{
                        let tab_id =  'field-tab-'+ i;
                        let tab_content;
                        let tab_class;
                        if(tab.is_default){
                             tab_content =  this.render_default_tab_data(tab.fields);
                             tab_class = 'tab-pane active'
                        }else{
                             tab_content =  this.render_custom_tab_data(tab.fields);
                             tab_class = 'tab-pane'
                        }
                        {
                          return <div className={tab_class} id={tab_id}  key ={i}>
                                 {tab_content}
                            </div>
                        }
                     })
                }
                </div>
            </form>
        :null
        );
    }

    renderTabs(){
        let tabs = this.state.tabs;
        return (
           tabs ?
                <ul role="tablist" className="nav nav-tabs nav-tabs-custom top-border">
                {
                    tabs.map((tab, i) =>{
                        let tab_id =  'field-tab-'+ i;
                        let href = '#'+tab_id;
                            {
                            return <li role="presentation" className="" key={i}>
                                    <a data-toggle="tab" role="tab" aria-controls={tab_id} href={href} aria-expanded="true">{tab.tab_name}</a>
                                </li>
                            }
                    })

                }
                </ul>
           :null
       );
    }
    /*** open Modal for create new subcontact **/
    openCreateSubContactModal(){
         if(this.state.tabs.length > 0 ){
            let remainder = this.state.subcontacts.length % 15;
            let default_profile_image = '/static/front/images/image_'+ remainder  + '.png';
            let sub_contact_profile_image_full_path = default_profile_image;
            this.setState({sub_contact_profile_image_full_path : sub_contact_profile_image_full_path});
            ModalManager.open(<CreateSubContactModal
                    field ={this.state.result}
                    title = {translate('label_contact') }
                    modal_id = "create-sub-contact-modal"
                    form_id =  "create-sub-contact-form"
                    profile_image ={default_profile_image}
                    onRequestClose={() => this.state.sub_contact_open_modal_state}

                    onChildClick ={ this.handleSubContactCreateSaveClick.bind(null)}/>
               );
         }

    }

    handleSubContactCreateSaveClick(index) {
        var form_object = $('#create-sub-contact-form');
        if (form_object.valid()) {
            var form_data = processForm('#create-sub-contact-form',
                                        this.state.sub_contact_profile_image_full_path ,
                                        this.state.main_conatact_profile_image
                            );
            let subcontacts = this.state.subcontacts;
            subcontacts.push(form_data);
            this.setState({subcontacts: subcontacts});
            this.setState({sub_contact_open_modal_state:true});
            form_object[0].reset();
            ModalManager.close(<CreateSubContactModal modal_id = "create-sub-contact-modal" onRequestClose={() => true} />);
        }else{
            NotificationManager.error('Please enter name.', 'Error',5000);
        }
    }

    /** Editsubcontact Save button handle*/
    handleEditSubContactEditSaveClick(index ,fields_data){
        let subcontacts =  this.state.subcontacts;
        subcontacts.forEach(function(result, i) {
            if(i === index) {
              subcontacts[i] = fields_data;
            }
        });
        this.setState({subcontacts: subcontacts});
        ModalManager.close(<EditSubContactModal onRequestClose={() => true}/>);
    }

    /* open modal for Edit sub contact*/
    openEditSubContactModal(index){
        let fields = this.state.result;

        let edit_contact_field_value = {};
        if(fields.length > 0){
            fields.map((field, i) =>{
                if(field.is_default){
                    edit_contact_field_value.contact_name = get_contact_info(index, this.state.subcontacts, 'name');
                    edit_contact_field_value.email = get_contact_info(index, this.state.subcontacts, 'email');
                    edit_contact_field_value.phone = get_contact_info(index, this.state.subcontacts, 'phone');
                    edit_contact_field_value.mobile = get_contact_info(index, this.state.subcontacts, 'mobile');
                    edit_contact_field_value.street = get_contact_info(index, this.state.subcontacts, 'street');
                    edit_contact_field_value.street2 = get_contact_info(index, this.state.subcontacts, 'street2');
                    edit_contact_field_value.zip = get_contact_info(index, this.state.subcontacts, 'zip');
                    edit_contact_field_value.city = get_contact_info(index, this.state.subcontacts, 'city');
                    edit_contact_field_value.country = get_contact_info(index, this.state.subcontacts, 'country');
                    edit_contact_field_value.contact_id =  get_contact_info(index, this.state.subcontacts, 'id');
                    edit_contact_field_value.profile_image = get_contact_info(index, this.state.subcontacts, 'image');
                    edit_contact_field_value.fields = [];
                    field.fields.map((f, i) =>{
                        var edit_contact_field = {
                            "id":     f.id,
                            "type":   f.type,
                            "name":   f.name,
                            "display_position": f.display_position,
                            "default_values":f.default_values,
                            "input_value": get_input_value(index, f.id, this.state.subcontacts)
                        };
                        edit_contact_field_value.fields.push(edit_contact_field)
                    });
                }
            } );

            if(edit_contact_field_value.fields.length > 0){
                ModalManager.open( <EditSubContactModal
                        fields ={edit_contact_field_value}
                        title = "SubContact--"
                        modal_id = "edit-sub-contact-modal"
                        index ={index}
                        onEditSubContact ={ this.handleEditSubContactEditSaveClick.bind(null)}
                        onRequestClose={() => true}/>
                );
            }
        }
    }
    render_subContacts(){
        let subcontacts_array = this.state.subcontacts;
        return (
            subcontacts_array.length > 0 ?
                <div id="sub-contacts" className="panel panel-default">
                    <div  className="row">
                        {
                            subcontacts_array.map((subcontacts, i) =>{
                            return <div className="col-xs-12 col-ms-6 col-sm-4 col-md-3 col-lg-3" key={i} >
                                    <div className="media" data-toggle="modal" data-target="#sub_contact_modal">
                                        <div className="media-left" onClick={this.openEditSubContactModal.bind(this,i)}>
                                            <img  src= {IMAGE_PATH + subcontacts.profile_image} className="img-circle"  />
                                        </div>
                                        <div className="media-body media-middle">
                                            <h4>{subcontacts.name}</h4>
                                            <div className="h4"></div>
                                        </div>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                </div>
            :null
        );
    }

    save_action_fn(){
        this.handleSaveContact()
    }

   render() {
        let processing = this.state.processing;
        return (
            <div>
               <ContactHeader header_css="crm-header clearfix module__contact module__contact-create"/>

               <div id="crm-app" className="clearfix module__contact module__contact-create">
                 <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <AddPageTopAction
                                list_page_link ="/contact/list/"
                                list_page_label ="Contact"
                                add_page_link={false}
                                add_page_label ={false}
                                edit_page_link={false}
                                edit_page_label ={translate('button_edit')+ '' + translate('label_contact')}
                                item_name = {this.state.main_contact_name}
                                page="edit"
                                module="contact"
                                save_action ={this.save_action_fn.bind(this)}
                            />
                            <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-heading no-padding">
                                            <div className="row">
                                                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                                                    <ul className="list-inline">
                                                        <li>
                                                            <div className="radio" onClick={this.handleIsCompany.bind(this)}>
                                                               <input id="ct-company"
                                                                    name="contact-type"
                                                                    type="radio"
                                                                    checked={this.state.is_company}
                                                                    value={this.state.is_company}
                                                               />
                                                                <label>{translate('label_company')}</label>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="radio" onClick={this.handleIsIndvidual.bind(this)}>
                                                                <input id="ct-individual"
                                                                    name="contact-type"
                                                                    type="radio"
                                                                    checked={this.state.is_individual}
                                                                    value={this.state.is_individual}
                                                                />
                                                            <label>{translate('label_individual')}</label>
                                                            </div>
                                                        </li>
                                                        <li>|</li>
                                                        <li>
                                                            <div className="checkbox"  onClick={this.handle_is_vender.bind(this)}>
                                                                <input type="checkbox"
                                                                    name="is_vendor"
                                                                    checked={this.state.is_vendor}
                                                                    value={this.state.is_vendor}
                                                                />
                                                                <label>{translate('label_is_vendor')}</label>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="checkbox" onClick={this.handle_is_lead.bind(this)}>
                                                                  <input type="checkbox"
                                                                     name="is_lead"
                                                                     checked={this.state.is_lead}
                                                                     value={this.state.is_lead}
                                                                 />
                                                                <label>{translate('label_is_lead')}</label>
                                                            </div>
                                                        </li>
                                                        <li>
                                                            <div className="checkbox" onClick={this.handle_is_customer.bind(this)}>
                                                                  <input type="checkbox"
                                                                     name="is_customer"
                                                                     checked={this.state.is_customer}
                                                                     value={this.state.is_customer}
                                                                 />
                                                                <label>{translate('label_is_customer')}</label>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="col-xs-12 col-sm-7 col-md-6 col-lg-6 pull-right">
                                                    <ul className="pull-right panel-tabular__top-actions">
                                                        <li>
                                                            <Link to="javascript:" title="Opportunities"><i
                                                                className="fa fa-star"></i>
                                                                <p className="push-left-5  inline-block">
                                                                    <span>{this.state.total_opportunity}</span>{'Opportunities'}
                                                                </p></Link>
                                                        </li>
                                                        <li>
                                                            <Link to="javascript:" title="Meetings"><i
                                                                className="cal-icon-sprite"></i>
                                                                <p className="push-left-5  inline-block">
                                                                    <span>{this.state.total_meetings}</span>{translate('label_meetings')}</p>
                                                            </Link>
                                                        </li>
                                                        <li>
                                                            <Link to="javascript:" title="Meetings"><i
                                                                className="note-icon-sprite"></i>
                                                                <p className="push-left-5  inline-block">
                                                                    <span>{this.state.total_sales}</span>{translate('label_task')}</p>
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="panel-body edit-form">
                                            <span className="hidden">
                                                <div className="o_hidden_input_file ">
                                                    <form id="message_file_upload_from" target="message_file_uploader" action={'/contact/upload/'} method="post" encType='multipart/form-data' className="o_form_binary_form">
                                                        <input type="file" name="ufile" id="message_attatchment_file" className="o_form_input_file" onChange={this.handleImageOnChange.bind(this)} />
                                                    </form>
                                                    <iframe name="message_file_uploader" id="message_file_uploader" className="hidden"></iframe>
                                                </div>
                                            </span>
                                            { this.renderForm()}
                                        </div>
                                            {this.renderTabs()}
                                    </div>
                                     <button className="btn btn-new new-sub-contact" onClick={this.openCreateSubContactModal.bind(this)}>{add_sub_contact_button_text(this.state.main_contact_name, this.state.is_company) }</button>
                                     {this.render_subContacts()}
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
                <NotificationContainer/>
                <LoadingOverlay processing={processing}/>
            </div>
        );
    }
}
module.exports = ContactUpdate;


