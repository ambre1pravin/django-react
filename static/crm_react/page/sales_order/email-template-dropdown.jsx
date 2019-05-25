import React from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie, is_string_blank} from 'crm_react/common/helper';
import {NotificationManager} from 'react-notifications';
import {translate} from 'crm_react/common/language';


class EmailTemplateDropdown extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            input_value: this.props.selected_name !=undefined ? this.props.selected_name :"",
            item_list:[],
            drop_down_class:'dropdown autocomplete',
            loading:true,
            selected_id:this.props.selected_id !=undefined ?this.props.selected_id :"",
            data_found:true,
            show_lable: this.props.show_lable !=undefined ? this.props.show_lable : true,
            error_class:'',
        }
        this.serverRequest = $.get('/quotation/default-template/'+this.props.module+'/', function (data) {
            let template_result = {'template_id':data.result.id,
                                    'module':this.props.module,
                                    'editor_txt':data.result.description,
                                    'subject':data.result.subject,
                                    'template_name':data.result.name
                                  };
            this.setState({template_id:data.result.id,
                editor_txt:data.result.description,
                subject:data.result.subject,
                template_name:data.result.name,
                template_result:template_result
            });
        }.bind(this));
    }

    handle_click_div() {
        $.ajax({
            type: "POST",
            cache: false,
            url: this.props.get_data_url,
            data: {
                contact_type: this.props.module,
                csrfmiddlewaretoken: getCookie('csrftoken')
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
        var lower_string = e.target.value;
        if (is_string_blank(lower_string) && lower_string.length >= 2) {
            $.ajax({
                type: "POST",
                cache: false,
                url: this.props.get_data_url,
                data: {
                    keyword: lower_string,
                    contact_type: this.props.module,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({loading: true, error_class:''});
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
            this.setState({loading: false, item_list: [], error_class:' error', drop_down_class: 'dropdown autocomplete '});
        }
        this.setState({input_value: e.target.value,});

    }

    handle_click_item(id, name){
         this.setState({selected_id:id, input_value:name});
         //this.props.set_return_data({'id':id,'name':name})
    }


    handle_on_key_press(e){
        if (e.key === 'Enter') {
            this.handle_create(this.state.input_value)
        }
    }

    handle_create(name){
        if(is_string_blank(name)  && name.length >=2){
            var csrftoken = getCookie('csrftoken');
            var post_data = {'name':name };
            $.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                url: this.props.post_data_url,
                data: {
                    ajax: true,
                    contact_type: this.props.module,
                    post_data :JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                   this.setState({drop_down_class:'dropdown autocomplete',})
                }.bind(this),
                success: function (data) {
                   if(data.success === true || data.success === 'true'){
                       this.setState({drop_down_class:'dropdown autocomplete'});
                       this.handle_click_item(data.result.id, data.result.name);
                       this.props.set_return_data(data.result);
                       NotificationManager.success(data.message, 'Success message',5000);
                   }else{
                       NotificationManager.error("Error", 'Error',5000);
                   }
                }.bind(this)
            });
        }else{
             this.setState({error_class:'error'});
             NotificationManager.error("Enter Name", 'Error',5000);
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
                            <div className={this.state.drop_down_class }>
                                <input
                                    type="text" placeholder={this.props.field_label + '...'}
                                    autoComplete="off"
                                    value={this.state.input_value}
                                    onChange={this.handle_on_change.bind(this)}
                                    onKeyPress={this.handle_on_key_press.bind(this)}
                                    id="main_contact"
                                    name="customer_name"
                                    data-toggle="dropdown"
                                    className={'form-control '+ this.state.error_class}
                                />

                                <div id="company_drop_box" className="dd-options">
                                    <ul className="options-list">
                                    {   this.state.item_list ?
                                            this.state.item_list.map((item, i) =>{
                                             if(i <= 10)
                                                return <li key={'cust_'+i} data-id={item.id} onClick={this.handle_click_item.bind(this,item.id,item.name)}>{item.name}</li>
                                            })
                                        : null
                                    }
                                    {
                                        this.props.create_option ?
                                            <li data-action="create" className="text-primary"  onClick={this.handle_create.bind(this, this.state.input_value)}>
                                                <em>{translate('create')} {this.state.input_value}</em>
                                            </li>
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
module.exports = EmailTemplateDropdown;
