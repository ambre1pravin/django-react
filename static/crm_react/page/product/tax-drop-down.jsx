import React from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie, is_string_blank, cursor_pointer} from 'crm_react/common/helper';
import {NotificationManager} from 'react-notifications';
import {translate} from 'crm_react/common/language';
import ModalTax from 'crm_react/page/product/modal-tax';


class  TaxDropDown extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            input_value: this.props.selected_name  ? this.props.selected_name :null,
            item_list:[],
            drop_down_class:'dropdown autocomplete',
            loading:true,
            selected_id:this.props.selected_id !=undefined ?this.props.selected_id :null,
            data_found:true,
            show_lable: this.props.show_lable !=undefined ? this.props.show_lable : true,
            error_class:'',
        }
    }

    handle_click_div() {
        $.ajax({
            type: "POST",
            cache: false,
            url: this.props.get_data_url,
            data: {
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
        } else {
            this.setState({loading: false, item_list: [], drop_down_class: 'dropdown autocomplete '});
        }
        this.setState({input_value: e.target.value,});

    }

    handle_click_item(id, name, value, computation){
         this.setState({selected_id:id, input_value:name});
         let data={'id':id,'name':name, 'value':value, 'computation': computation}
         if(this.props.index!=undefined &&  this.props.items_type!=undefined){
            this.props.set_return_data(this.props.index, this.props.items_type, data,'tax_on_sale');
         }else{
            this.props.set_return_data( data,'tax_on_sale');
         }
    }


    handle_on_key_press(e){
        if (e.key === 'Enter') {
            this.handle_create(this.state.input_value)
        }
    }


    set_tax_data(data){
        let tax_data={'id':data.tax_id, 'name':data.tax_name, 'value':data.tax_value, 'computation': data.tax_type}
        this.setState({selected_id: data.tax_id, input_value:data.tax_name});
        if(this.props.index!=undefined &&  this.props.items_type!=undefined){
            this.props.set_return_data(this.props.index, this.props.items_type, tax_data,'tax_on_sale');
        }else{
            this.props.set_return_data( tax_data ,'tax_on_sale');
        }
    }

    handle_create() {
        ModalManager.open(
            <ModalTax
                title="Tax"
                onRequestClose={() => true}
                modal_id="modal-tax"
                input_value={this.state.input_value}
                set_tax_data ={this.set_tax_data.bind(this)}
            />
        );
    }

    render() {

        return (

            <div id="company" className="form-group" >
                <div className={this.state.drop_down_class }>
                {this.state.input_value === null ?
                    <input
                        type="text" placeholder={this.props.field_label + '...'}
                        autoComplete="off"
                        value={this.props.selected_name}
                        onChange={this.handle_on_change.bind(this)}
                        onKeyPress={this.handle_on_key_press.bind(this)}
                        onClick={this.handle_click_div.bind(this)}
                        id="main_contact"
                        name="customer_name"
                        data-toggle="dropdown"
                        className={ this.state.error_class}
                        style={cursor_pointer}
                    />
                :
                    <input
                        type="text" placeholder={this.props.field_label + '...'}
                        autoComplete="off"
                        value={this.state.input_value}
                        onChange={this.handle_on_change.bind(this)}
                        onKeyPress={this.handle_on_key_press.bind(this)}
                        onClick={this.handle_click_div.bind(this)}
                        id="main_contact"
                        name="customer_name"
                        data-toggle="dropdown"
                        className={ this.state.error_class}
                        style={cursor_pointer}
                    />
                }

                    <input type="hidden" name = "customer_id"  value={this.state.selected_id}/>
                    <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <i className="fa fa-angle-down black" onClick={this.handle_click_div.bind(this)}></i>
                    </span>
                    <div id="company_drop_box" className="dd-options">
                        <ul className="options-list">
                        {   this.state.item_list ?
                                this.state.item_list.map((item, i) =>{
                                 if(i <= 10)
                                    return <li key={this.props.field_name+'_'+i} data-id={item.id} onClick={this.handle_click_item.bind(this,item.id,item.name,item.value,item.computation)}>{item.name}</li>
                                })
                            : null
                        }
                        {
                            this.props.create_option && this.state.item_list.length == 0 ?
                                <li data-action="create" className="text-primary"  onClick={this.handle_create.bind(this, this.state.input_value)}>
                                    <em>{translate('create')} <strong>{this.state.input_value}</strong></em>
                                </li>
                            :null
                        }
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
module.exports = TaxDropDown;