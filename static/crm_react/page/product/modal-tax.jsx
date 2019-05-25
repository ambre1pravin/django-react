import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie, is_int, is_float} from 'crm_react/common/helper';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import { ToastContainer, toast } from 'react-toastify';


class  ModalTax extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tax_name: this.props.input_value !=undefined ? this.props.input_value : null ,
            tax_value:null,
            tax_type:'percentage',
            tax_scope:'sale',
            processing : false,
        };

    }


    on_change_tax_name(e){
        this.setState({tax_name: e.target.value})
    }

    on_change_tax_value(e){
        this.setState({tax_value: e.target.value})
    }

    on_click_tax_type(tax_type){
        this.setState({tax_type:tax_type})
    }

    on_click_tax_scope(tax_scope){
        this.setState({tax_scope:tax_scope})
    }

    handle_close() {
        ModalManager.close(<ModalTax modal_id="modal-tax" onRequestClose={() => true}/>);
    }

    render_body(){
        return(
            <div className="panel-body edit-form">
                <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                    <table className="detail_table">
                        <tbody>
                            <tr>
                                <td><label className="control-label">{'Name'}</label></td>
                                <td>
                                    <div className="form-group">
                                        <input
                                            autoComplete ="off"
                                            value        = {this.state.tax_name}
                                            name         = {'name'}
                                            className    = {'form-control'}
                                            placeholder  = {'Tax name'}
                                            onChange     = {this.on_change_tax_name.bind(this)}/>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="control-label">{'Value'}</label></td>
                                <td>
                                    <div className="form-group">
                                        <input
                                            autoComplete ="off"
                                            value        = {this.state.tax_value}
                                            name         = {'tax_value'}
                                            className    = {'form-control'}
                                            placeholder  = {'Tax Value'}
                                            onChange     = {this.on_change_tax_value.bind(this)}
                                            />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="control-label">{'Computation Type'}</label></td>
                                <td>
                                    <div className="form-group" data-type="dropdown">
                                        <select name="computation" id="computation" className="form-control">
                                            <option value="percentage" onClick={this.on_click_tax_type.bind(this, 'percentage')}>Percentage</option>
                                            <option value="fixed" onClick={this.on_click_tax_type.bind(this, 'fixed')}>Fixed</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="control-label">{'Scope'}</label></td>
                                <td>
                                    <div className="form-group" data-type="dropdown">
                                        <select name="scope" id="computation" className="form-control">
                                            <option value="sale"
                                                selected={this.state.tax_scope==='sale' ? true : false}
                                                onClick={this.on_click_tax_scope.bind(this,'sale')}>Tax on Sale
                                            </option>
                                            <option value="wholesale"
                                                selected={this.state.tax_scope==='wholesale' ? true : false}
                                                onClick={this.on_click_tax_scope.bind(this,'wholesale')}>Whole sale value
                                            </option>
                                        </select>
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        );


    }

    handle_submit(){
        let tax_name = this.state.tax_name;
        let tax_value = this.state.tax_value;
        let tax_type = this.state.tax_type;
        let tax_scope = this.state.tax_scope;
        var post_data = {'tax_id':0, 'tax_name':tax_name, 'tax_value':tax_value,'tax_type':tax_type,'tax_scope':tax_scope,};
        if(is_int(tax_value) || is_float(tax_value)){
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/saveTaxes/',
                data: {
                    post_data :JSON.stringify(post_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({processing:true,})
                }.bind(this),
                success: function (data) {
                    if (data.success) {
                           this.props.set_tax_data(data.result)
                           this.setState({processing:false,})
                           this.handle_close();
                    }
                }.bind(this)
            });
        }else{
            toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "modal_tax"});
        }
       // alert("tax save here")

    }

    render() {
        const {field, onRequestClose, title, modal_id, form_id} = this.props;
        return (
            <Modal
                style={modal_style}
                onRequestClose={onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close" type="button" onClick={this.handle_close.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body" style={ModalbodyStyle}>
                        { this.render_body() }
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default pull-left" type="button"
                                    onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                            <button className="btn btn-primary pull-left" type="button" onClick={this.handle_submit.bind(this)}>{'Save'}</button>
                        </div>
                    </div>
                </div>
                <ToastContainer />
                <LoadingOverlay processing={this.state.processing}/>
            </Modal>
        );
    }

}
module.exports = ModalTax;