import React from 'react';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {translate} from 'crm_react/common/language';
import {modal_style,getCookie} from 'crm_react/common/helper';


class ColumnEditModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            columnName: this.props.col_data.columnName,
            sales_team: '',
            pipelineStaus: this.props.col_data.pipelineStaus ? true : false,
            probabilityStaus: this.props.col_data.probabilityStaus ? true : false,
            probability: this.props.col_data.probability,
            change_prob_checked: false
        }
    }

    change_col_name(event) {
        this.setState({columnName: event.target.value})
    }

    handle_close() {
        ModalManager.close(<ColumnEditModal modal_id="edit-col" onRequestClose={() => true}/>);
    }

    hide_show() {
        this.setState({probabilityStaus: !this.state.probabilityStaus})
    }

    change_pipe_line_status() {
        this.setState({pipelineStaus: !this.state.pipelineStaus})
    }

    change_probability(event) {
        this.setState({probability: event.target.value})
    }



    save_data() {
        let col_data_list = [];
        col_data_list.push({name: 'name', value: this.state.columnName});
        col_data_list.push({name: 'team', value: null});
        col_data_list.push({name: 'probability_status', value: this.state.probabilityStaus});
        col_data_list.push({name: 'pipeline_staus', value: this.state.pipelineStaus});
        col_data_list.push({name: 'probability', value: this.state.probability});
        col_data_list.push({name: 'column_id', value: this.props.col_data.id});
        if (this.props.col_data.id > 0 && this.state.columnName != '') {
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updatecolumn/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(col_data_list),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true || data.success === 'true') {
                        var col_dic = {
                            "columnName": this.state.columnName,
                            "pipelineStaus": this.state.pipelineStaus,
                            "probabilityStaus": this.state.probabilityStaus,
                            "probability": this.state.probability,
                        }
                        this.props.update_col_data_fn(col_dic);
                        this.handle_close();
                    }
                }.bind(this)
            });
        }
    }

    render_body() {
        console.log("col data", this.props.col_data)
        return (
            <div className="panel-body edit-form">
                <form className="contact-main-form">
                    <div className="tab-content">
                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                            <table className="detail_table">
                                <tr>
                                    <td>
                                        <label className={this.state.columnName?"control-label":"text-muted control-label"}>Name*</label>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <input value={this.state.columnName} className="form-control"
                                                   placeholder="Name..." type="text"
                                                   onChange={this.change_col_name.bind(this)}/>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{'width':'30%'}}>
                                        <label className={this.state.pipelineStaus?"control-label":"text-muted control-label"}>Display in pipeline</label>
                                    </td>
                                    <td>
                                        <div style={{'margin-top':'-8px'}}>
                                            {this.state.pipelineStaus ?
                                                <input type="checkbox" checked
                                                       onChange={this.change_pipe_line_status.bind(this)}/>
                                                : <input type="checkbox"
                                                         onChange={this.change_pipe_line_status.bind(this)}/>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                            <table className="detail_table">
                                <tr>
                                    <td style={{'width':'30%'}}>
                                        <label className={this.state.probabilityStaus?"control-label":"text-muted control-label"}>Change Probability</label>
                                    </td>
                                    <td>
                                        <div style={{'margin-top':'-8px'}}>
                                            {this.state.probabilityStaus ?
                                                <input type="checkbox" onClick={this.hide_show.bind(this)} checked/>
                                                : <input type="checkbox" onClick={this.hide_show.bind(this)}/>
                                            }
                                        </div>
                                    </td>
                                </tr>
                                {this.state.probabilityStaus ?
                                    <tr>
                                        <td>
                                            <label className={this.state.probabilityStaus?"control-label":"text-muted control-label"}>Probability (%)</label>
                                        </td>
                                        <td>
                                            <div className="form-group">
                                                <input value={this.state.probability} className="form-control"
                                                       placeholder="Probability (%)..." type="text"
                                                       onChange={this.change_probability.bind(this)}/>
                                            </div>
                                        </td>
                                    </tr>
                                    : null
                                }
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

module.exports = ColumnEditModal;
