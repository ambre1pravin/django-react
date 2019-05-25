import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';

class  ModalUnitCategory extends React.Component {

    constructor(props) {
        super(props);
        this.state = {

        };

    }




    handle_close() {
        ModalManager.close(<ModalUnitCategory modal_id="unit-category" onRequestClose={() => true}/>);
    }

    set_retrun_data(){

    }

    render_body(){
        return(
            <div className="panel-body edit-form">
                <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                    <table className="detail_table">
                        <tbody>
                            <tr>
                                <td><label className="control-label">{'Category Name'} </label></td>
                                <td>
                                    <div className="form-group">
                                        <input
                                            autoComplete ="off"
                                            value        = {this.state.name}
                                            name         = {'name'}
                                            className    = {'form-control'}
                                            placeholder  = {'Category Name'} />
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
                            <button className="btn btn-primary pull-left" type="button" onClick={this.handle_submit.bind(this)}>{'Send'}</button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }

}
module.exports = ModalUnitCategory;