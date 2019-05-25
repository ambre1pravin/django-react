import React from 'react';
import {NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import CreateCompanyNewModal from 'crm_react/page/contact/create-company-new-modal';
import { getCookie} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';


class  CompanyDropDown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tags: this.props.component_data.tags,
            displayCompany:[],
            input_value:'',
            contact_id: (this.props.component_data.contact_id > 0 && this.props.component_data.contact_id !=undefined) ? this.props.component_data.contact_id : 0,
            selected_company_id: (this.props.component_data.company_id > 0) ? this.props.component_data.company_id  : 0,
            selected_company_name: (this.props.component_data.contact_company_name !='') ? this.props.component_data.contact_company_name : '',
            company_drop_down_class:'dropdown autocomplete',
            loading:false
        };
        this.company_create_edit = this.company_create_edit.bind(this)
    }

    ajax_common_search(keyword){
       $.ajax({
           type: "POST",
           dataType: "json",
           url: '/contact/company/',
           data: {
               keyword:keyword,
               csrfmiddlewaretoken: getCookie('csrftoken')
           },
           beforeSend: function () {
               //this.setState({save_button_disable:'btn btn-primary disabled'})
           }.bind(this),
           success: function (data) {
               if (data.success === true) {
                   this.setState({displayCompany:data.result})
               } else {
                   //To do trap errors
               }
           }.bind(this)
       });
    }

    handle_key_press(e){
       var lower_string = e.target.value;
       if(lower_string.length >=2 ){
            $.ajax({
                type: "POST",
                cache: false,
                url: '/contact/company/',
                data: {
                    keyword :lower_string,
                    contact_type: 'company',
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                   this.setState({loading:true});
                }.bind(this),
                success: function (data) {
                    if (data.success){
                       this.setState({loading:false,companies:data.result,displayCompany:data.result,company_drop_down_class:'dropdown autocomplete open'});
                    }else{
                       this.setState({loading:false,companies:[],displayCompany:[],company_drop_down_class:'dropdown autocomplete open'});
                    }
                }.bind(this)
            });
       }else{
           this.setState({loading:false, companies:[], displayCompany:[], company_drop_down_class:'dropdown autocomplete '});
       }


        this.setState({
            input_value:e.target.value,
            selected_company_name:e.target.value
        });

    }

    company_create_edit(data){
        this.setState({selected_company_id:data.contact_id, selected_company_name:data.contact_name});
        this.props.component_data.company_create(data);
        var temp = { 'id':data.contact_id, 'name':data.contact_name};
        let companies = this.state.companies;
        companies.push(temp);
        this.setState({companies : companies});
        this.handle_click_comapny(data.contact_id,data.contact_name);
    }

    handle_create_company(company_name){
        if(company_name !== ''){
            var default_fields = this.props.component_data.fields;
            var fields =[];
            default_fields.forEach(function(item, j) {
                if(item.id > 0){
                    var field = {"id": item.id, "value":''};
                    fields.push(field);
                }
            });
            var contact_data = {'name':company_name,'contact_type':'C','is_customer':false,'is_vendor':false,'is_lead':false,'fields':fields};
            $.ajax({
                 type: "POST",
                 cache: false,
                 dataType: "json",
                 url:  '/contact/company_create/',
                 data: {
                    post_data :JSON.stringify(contact_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    ///this.setState({save_button_disable:false})
                }.bind(this),
                success: function (data) {
                   if(data.success === true || data.success === 'true'){
                       var contact_data ={'contact_id':data.contact_id,'contact_name':data.contact_name};
                       this.company_create_edit(contact_data);

                       NotificationManager.success('Company Created!', 'Success message',5000);
                   }else{
                       NotificationManager.error("Error", 'Error',5000);
                   }
                }.bind(this)
            });
        }else{
             NotificationManager.error("Enter Name", 'Error',5000);
        }
    }
        /*** open Modal for create company **/
    open_create_company_modal(company_name){
        if(this.props.component_data.fields.length > 0 && this.props.component_data.tags.length > 0 ){
            ModalManager.open(<CreateCompanyNewModal
                    field = {this.props.component_data.fields}
                    tags = {this.props.component_data.tags}
                    company_create_edit = {this.company_create_edit.bind(null)}
                    company_name ={company_name}
                    title = "Create Company"
                    modal_id = "create-company-modal"
                    form_id =  "create-company-form"
                    onRequestClose={() => true}
                   />
               );
        }

    }

    handle_click_comapny(index,name){
         this.setState({selected_company_id:index,selected_company_name:name});
         this.props.component_data.handleCompanyChange(index)
    }

    render() {
        console.log("company", this.state.displayCompany);
        return (
                <tr>
                    <td>
                    {
                        <div id="company" className="form-group edit-name">
                            <div className={this.state.company_drop_down_class}>
                                { this.state.loading ?
                                    <i className="fa fa-circle-o-notch fa-spin"></i>
                                    : null
                                }
                                <input placeholder="Company" type="text" value= {this.state.selected_company_name}  onClickCapture={this.handle_key_press.bind(this)} onChange={this.handle_key_press.bind(this)}  name="company"  className="form-control"  />
                                <input type="hidden" value={this.state.selected_company_id}/>
                                <span data-toggle="dropdown" role="button">
                                    <i id="main_form_company_down_icon" className="fa fa-angle-down black"></i>
                                </span>
                                <div id="company_drop_box" className="dd-options">
                                    <ul className="options-list">
                                    {
                                        this.state.displayCompany ?
                                            this.state.displayCompany.map((company, i) =>{
                                               return <li key={i} data-id={company.id} onClick={this.handle_click_comapny.bind(this,company.id,company.name)}>{company.name}</li>
                                            })
                                        : null
                                    }
                                    { this.state.displayCompany/length > 0 && this.state.input_value.length >=2 ?
                                        <div>
                                        <li className="text-primary" onClick={this.handle_create_company.bind(this,this.state.input_value)}><em>{translate('label_create')} {this.state.input_value}</em></li>
                                        <li className="text-primary" onClick={this.open_create_company_modal.bind(this,this.state.input_value)}><em>{translate('label_create_edit')}  {this.state.input_value}</em></li>
                                        </div>
                                      :null
                                    }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    }

                    </td>
                </tr>
        );
     }
}
module.exports = CompanyDropDown;

