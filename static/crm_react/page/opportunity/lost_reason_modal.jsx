import React from 'react';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {translate} from 'crm_react/common/language';
import {modal_style, getCookie, is_string_blank} from 'crm_react/common/helper';


class LostReasonModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            id: 0,
            result:null,
            input_value:'',
            selected_id:0,
            error_class:'',
        }
        this.serverRequest = $.get(this.props.fetch_data_url, function (data) {
                this.setState({result: data.result})
        }.bind(this));
    }

    handle_on_key_press(e){
        if (e.key === 'Enter') {
            this.handle_create();
        }
    }

    handle_create() {
        var csrftoken = getCookie('csrftoken');
        if(is_string_blank(this.state.input_value)) {
            var post_data = {'selected_id': this.state.selected_id, 'name': this.state.input_value};
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/addlostreason/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({'error_class':''});
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        let result = this.state.result;
                        let temp_obj = {'id': data.id, 'name': data.name};
                        result.push(temp_obj);
                        this.setState({result: result});
                        this.props.set_selected_data(temp_obj);
                    }
                }.bind(this)
            });
        }else{
            this.setState({'error_class':' error'})
        }
    }

    handle_change(event) {
        this.setState({input_value: event.target.value});
    }

    handle_close() {
        ModalManager.close(<LostReasonModal modal_id="lost-reason-mod" onRequestClose={() => true}/>);
    }

    select_item(item_index){
        let result = this.state.result;
        this.setState({input_value:result[item_index].name});
        this.props.set_selected_data(result[item_index])
    }

    render_body() {
        return (
                <tr>
                    <td>
                        <label className="text-muted control-label">Lost Reason</label>
                    </td>
                    <td>
                        <div className="form-group" data-type="dropdown">
                            <div className="dropdown autocomplete">
                                <input name="country"
                                       placeholder=""
                                       value={this.state.input_value}
                                       data-toggle="dropdown"
                                       className={this.state.error_class +" form-control"}
                                       type="text"
                                       onChange={this.handle_change.bind(this)}
                                       onKeyPress={this.handle_on_key_press.bind(this)}
                                />
                                <span data-toggle="dropdown" role="button" aria-haspopup="false" aria-expanded="false">
                                    <i className="fa fa-angle-down"></i>
                                </span>
                                <div className="dropdown-menu dd-options">
                                    <ul className="options-list">
                                        {this.state.result && this.state.result.length > 0 ?
                                            this.state.result.map((lost ,i)=> {
                                                return (<li key={'lost_'+i} onClick={this.select_item.bind(this,i)}>{lost.name}</li>)
                                            })
                                            :null
                                        }
                                        { this.props.show_create_option ?
                                            <li data-action="create"
                                                onClick={this.handle_create.bind(this)}>
                                                <em>Create</em> {this.state.input_value}
                                            </li>
                                            : null
                                        }
                                        { this.props.show_create_edit_opton ?
                                            <li data-action="create-edit">
                                                <em>Create Edit {this.state.input_value}</em>
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

    handle_save(){
       this.props.handle_save_fn('lost');
       this.handle_close()
    }

    render() {

        return (
            <Modal
                style={modal_style}
                onRequestClose={this.state.onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close" type="button" onClick={this.handle_close.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body panel-body edit-form">
                            <div className="row">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <table className="detail_table"><tbody>
                            { this.render_body() }
                            </tbody>
                            </table>
                            </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default" type="button"
                                    onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                            <button className="btn btn-primary"
                                    type="button" onClick={this.handle_save.bind(this)}>{translate('button_save')}</button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}
module.exports = LostReasonModal;
