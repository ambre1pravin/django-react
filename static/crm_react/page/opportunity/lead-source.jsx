import React from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import CreateCustomerModal from 'crm_react/component/create-customer-modal';
import {NotificationManager} from 'react-notifications';
import {translate} from 'crm_react/common/language';


class  LeadSource extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            input_value: this.props.selected_customer_name !=undefined ? this.props.selected_customer_name :"",
            item_list:[],
            drop_down_class:'dropdown autocomplete',
            loading:true,
            selected_id:this.props.select_ctmr_id !=undefined ?this.props.select_ctmr_id :"",
            data_found:true,
            show_lable: this.props.show_lable !=undefined ? this.props.show_lable : true,
            test_var :false
        }
    }

    handle_click_div() {
        console.log("click here")
        var csrftoken = getCookie('csrftoken');
        $.ajax({
            type: "POST",
            cache: false,
            url: this.props.get_data_url,
            data: {
                contact_type: 'customer',
                csrfmiddlewaretoken: csrftoken
            },
            beforeSend: function () {
                this.setState({loading: true});
            }.bind(this),
            success: function (data) {
                if (data.success) {
                    this.setState({
                        loading: false,
                        item_list: data.result,
                        drop_down_class: 'dropdown autocomplete open'
                    });
                } else {
                    this.setState({
                        data_found: false,
                        loading: false,
                        item_list: [],
                        drop_down_class: 'dropdown autocomplete open'
                    });
                }
            }.bind(this)
        });
    }

    handle_on_change(e) {
        console.log("onchange here")

        var lower_string = e.target.value;
        var csrftoken = getCookie('csrftoken');
        if (lower_string.length >= 2) {
            $.ajax({
                type: "POST",
                cache: false,
                url: this.props.get_data_url,
                data: {
                    keyword: lower_string,
                    contact_type: 'customer',
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({loading: true});
                }.bind(this),
                success: function (data) {
                    if (data.success) {
                        this.setState({
                            loading: false,
                            item_list: data.result,
                            drop_down_class: 'dropdown autocomplete open'
                        });
                    } else {
                        this.setState({
                            data_found: false,
                            loading: false,
                            item_list: [],
                            drop_down_class: 'dropdown autocomplete open'
                        });
                    }
                }.bind(this)
            });
        } else {
            this.setState({loading: false, item_list: [], drop_down_class: 'dropdown autocomplete '});
        }
        this.setState({input_value: e.target.value,});

    }

    handle_click_item(id, name){
         this.setState({selected_id:id, input_value:name});
         this.props.set_return_data({'customer_id':id,'customer_name':name})
    }


    handle_on_key_press(e){
        if (e.key === 'Enter') {
            this.handle_create(this.state.input_value)
        }
    }


    handle_create(name){
        if(name !== '' && name.length >= 2){
            var csrftoken = getCookie('csrftoken');
            var post_data ;
            post_data={'name':name};
            $.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                url: this.props.post_data_url,
                data: {
                    ajax: true,
                    post_data: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken,
                },
                beforeSend: function () {
                   this.setState({drop_down_class:'dropdown autocomplete',})
                }.bind(this),
                success: function (data) {
                   if(data.success === true || data.success === 'true'){
                       this.handle_click_item(data.result.id, data.result.name);
                       this.props.set_return_data(data.result);
                       NotificationManager.success(data.message, 'Success message',5000);
                   }else{
                       NotificationManager.error("Error", 'Error',5000);
                   }
                }.bind(this)
            });
        }else{
             NotificationManager.error("Enter Name", 'Error',5000);
        }
    }

    open_create_edit_modal(company_name){
        if(company_name!='') {
            ModalManager.open(<CreateCustomerModal
                    title="Create Customer"
                    modal_id="create-customer-modal"
                    form_id="create-company-form"
                    handle_click_item ={ this.handle_click_item.bind(this)}
                    contact_name={company_name}
                    onRequestClose={() => true}
                    is_customer = {this.props.is_customer}
                    is_vendor={this.props.is_vendor}
                    is_lead={this.props.is_lead}
                />
            );
        }
    }

    render() {
        return (
            <tr>
                {this.state.show_lable ?
                    <td><label className="control-label">{this.props.field_label}</label></td>
                    : null
                }
                <td>
                    {
                        <div id="company" className="form-group" onClick={this.handle_click_div.bind(this)}>
                            <div className={this.state.drop_down_class}>
                                <input
                                    type="text" placeholder={this.props.field_label + '...'}
                                    autoComplete="off"
                                    value={this.state.input_value}
                                    onChange={this.handle_on_change.bind(this)}
                                    onKeyPress={this.handle_on_key_press.bind(this)}
                                    id="main_contact"
                                    name="customer_name"
                                    data-toggle="dropdown"
                                    className="form-control"
                                />

                                <input type="hidden" name = "customer_id"  value={this.state.selected_id}/>
                                <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                    <i className="fa fa-angle-down black"></i>
                                </span>
                                <div id="company_drop_box" className="dd-options">
                                    <ul className="options-list">
                                    {   this.state.item_list ?
                                            this.state.item_list.map((item, i) =>{
                                             if(i <= 10)
                                                return <li key={'cust_'+i} data-id={item.id} onClick={this.handle_click_item.bind(this, item.id, item.name)}>{item.name}</li>
                                            })
                                        : null
                                    }
                                    <li data-action="create" className="text-primary"  onClick={this.handle_create.bind(this, this.state.input_value)}>
                                        <em>{translate('create')} {this.state.input_value}</em>
                                    </li>
                                    <li data-action="create-edit" className="text-primary"  onClick={this.open_create_edit_modal.bind(this, this.state.input_value)}>
                                        <em> {translate('create_edit')}  {this.state.input_value}</em>
                                    </li>
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
module.exports = LeadSource;


/* import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import LeadsourceAddModal from 'crm_react/page/opportunity/leadsource_add_edit_modal';
import {getCookie } from 'crm_react/common/helper';

class LeadSource extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input_value: this.props.selected_name ? this.props.selected_name :'',
            result_data: null,
            drop_down_class: 'dropdown autocomplete',
            item_selected: this.props.item_selected ? this.props.item_selected :false,
            selected_id: this.props.selected_id ? this.props.selected_id :null,
        }
        this.serverRequest = $.get(this.props.get_data_url, function (data) {
            this.setState({result_data: data.result,});
        }.bind(this));
    }

    on_change_lead_name(event) {
        var csrftoken = getCookie('csrftoken');
        if(event.target.value) {
            this.setState({input_value: event.target.value})
            $.ajax({
                type: "POST",
                cache: false,
                url: this.props.get_data_url,
                data: {
                    ajax: true,
                    keyword: event.target.value,
                    csrfmiddlewaretoken: csrftoken,
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true && data.result.length > 0) {
                        this.setState({result_data: data.result})
                    }
                }.bind(this)
            });
        }else{
            this.setState({input_value: '',result_data:null, item_selected: false,drop_down_class:'dropdown autocomplete'})
        }
    }

    on_click_input(){
        $.get(this.props.get_data_url, function (data) {
            this.setState({result_data: data.result,});
        }.bind(this));
    }

    on_click_select_lead(index){
        let result_data = this.state.result_data;
        this.props.set_return_data(result_data[index], 'select', this.props.field_name)
        this.setState({input_value: result_data[index].name, item_selected: true, selected_id:result_data[index].id})
    }

    create_lead_source() {
        let input_value = this.state.input_value;
        if (input_value != '') {
            var post_data ;
            post_data={'lead_source':input_value};
            $.ajax({
                type: "POST",
                cache: false,
                url: this.props.save_data_url,
                data: {
                    ajax: true,
                    field: JSON.stringify(post_data),
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.set_return_data(data, 'saved', this.props.field_name)
                        this.setState({item_selected: true})
                    }
                }.bind(this)
            });
        }
    }

    create_edit_lead_source() {

    }

    _set_return_data(data, action){
        this.setState({selected_id:data.id, input_value:data.name})
    }

    open_selected_result_data(){
        let selected_id = this.state.selected_id;
        if(selected_id > 0) {
            ModalManager.open(
                <LeadsourceAddModal
                    title="Edit Lead"
                    modal_id="lead_source"
                    lead_id={selected_id}
                    set_return_data={this._set_return_data.bind(this)}
                    lead_name={this.state.input_value}
                    onRequestClose={() => true}
                />
            );
        }
    }

    render() {
        return (
            <tr>
                <td><label className="text-muted control-label">{this.props.field_label}</label></td>
                <td>
                    <div className="form-group">
                        <div className={this.state.drop_down_class}>
                            {this.state.input_value ?
                                <input type="text"
                                       className="form-control" onChange={this.on_change_lead_name.bind(this)}
                                       value={this.state.input_value}
                                       data-toggle="dropdown"
                                       onClick={this.on_click_input.bind(this)}
                                />
                                : <input type="text"
                                         className="form-control" onChange={this.on_change_lead_name.bind(this)}
                                         value={this.props.selected_name}
                                         data-toggle="dropdown"
                                         onClick={this.on_click_input.bind(this)}
                                />
                            }

                            {this.state.item_selected ?
                                <span className="detailed_popup">
                                    <i className="fa fa-external-link" onClick={this.open_selected_result_data.bind(this)}></i>
                                </span>
                                : null
                            }
                            <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                <i className="fa fa-angle-down black"></i>
                            </span>
                            <div className="dd-options">
                                <ul className="options-list">
                                    {this.state.result_data ?
                                        this.state.result_data.map((lead, i) =>{
                                            return <li key={'lead_l_'+i} onClick={this.on_click_select_lead.bind(this, i)}>{lead.name}</li>
                                        })
                                      :null
                                    }

                                    {this.state.input_value != '' && this.props.create_option ?
                                        <li data-action="create" className="text-primary"
                                            onClick={this.create_lead_source.bind(this)}>
                                            <em>{translate('create')} {this.state.input_value}</em>
                                        </li>
                                        : null
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}
module.exports = LeadSource;
    */