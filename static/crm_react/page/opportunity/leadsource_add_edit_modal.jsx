import React from 'react';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {translate} from 'crm_react/common/language';
import {modal_style} from 'crm_react/common/helper';


class LeadsourceAddModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lead_id:this.props.lead_id,
            lead_name:this.props.lead_name,
            save_url: '/opportunity/addLeadsource/'
        }
    }

    handle_close() {
        ModalManager.close(<LeadsourceAddModal modal_id="lead_source" onRequestClose={() => true}/>);
    }

    on_chang_lead_name(event){
        if(event.target.value) {
            this.setState({lead_name:event.target.value})
        }else{
            this.setState({lead_name:''})
        }
    }

    save_data() {
        if (this.state.lead_id > 0 && this.state.lead_name) {
            var post_data;
            post_data= {'id' : this.state.lead_id, 'lead_source':this.state.lead_name};
            $.ajax({
                type: "POST",
                cache: false,
                url: this.state.save_url,
                data: {
                    ajax: true,
                    field: JSON.stringify(post_data),
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.set_lead_return_data(data.result, 'saved')
                        this.handle_close()
                    }
                }.bind(this)
            });
        }
    }

    render_body() {
        return (
            <div className="panel-body edit-form">
                <form className="contact-main-form">
                    <div className="tab-content">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <table className="detail_table">
                                <tr>
                                    <td>
                                        <label className="text-muted control-label">Name*</label>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <input value={this.state.lead_name} onChange={this.on_chang_lead_name.bind(this)} className="form-control" placeholder="Name..." type="text"/>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    render() {
        var bodyStyle = {overflow: 'auto', maxHeight: '75vh'}
        return (
            <Modal
                style={modal_style}
                onRequestClose={this.state.onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close" type="button" onClick={this.handle_close.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body" style={bodyStyle}>
                            { this.render_body() }
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default" type="button"
                                    onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                            <button className="btn btn-primary"
                                    type="button"
                                    onClick={this.save_data.bind(this)}>{translate('button_save')}</button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

module.exports = LeadsourceAddModal;

