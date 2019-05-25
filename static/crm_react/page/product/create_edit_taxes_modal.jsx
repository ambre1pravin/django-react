import React from 'react';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';

class  CreateEditTexesModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: this.props.title,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeNumber = this.handleChangeNumber.bind(this);
    }

    componentDidMount() {
        var id = this.props.id;
        var input_value = this.props.input_value;
        var model_id = this.props.model_id;
        var field = this.props.field;
        this.openTaxesModalWithData(id, input_value, model_id, field);
    }

    openTaxesModalWithData(id, input_value, model_id, field, tr_id = '') {
        this.setState({
                id: id,
                name: '',
                tax_value: '',
                computation_type: 'Percentage',
                tax_scope: 'sale',
                field: field,
                tr_id: tr_id
        });

        if (id != 0 && id > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/getTaxesById/' + id,
                data: {
                    ajax: true,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.setState({
                            id: id,
                            name: data.name,
                            tax_value: data.value,
                            computation: data.computation,
                            tax_scope: data.scope,
                            field: field,
                            title: 'Edit : Tax'
                        })
                    }
                }.bind(this)
            });
        }else if (id == 0) {
            this.setState({
                id: 0,
                name: input_value,
                title: 'Create : Tax'
            })
        }
    }

    handleSubmit() {
        var Data = $('#pro_taxes_form').serializeArray();
        $.ajax({
            type: "POST",
            cache: false,
            url: '/product/saveTaxes/',
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
                csrfmiddlewaretoken: getCookie('csrftoken'),
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success == true) {

                    if (data.tax_type == 'sale')
                        this.props.setCreatedSTAX(data.id, data.name);
                    else if (this.state.field == 'wstax')
                        this.props.setCreatedWSTAX(data.id, data.name);
                    else if (this.state.field == 'quot')
                        this.props.setCreatedTAX(this.state.tr_id, data.id, data.name, true, data);
                    this.setState({id: 0,});
                    this.props.handleClose();
                }
            }.bind(this)
        });
    }


    handleTypeChange(event) {
        var computation_type = event.target.value;
        this.setState({ computation_type: event.target.value });
    }


    handleScopeChange(event) {
        var tax_scope = event.target.value;
        this.setState({tax_scope: event.target.value});
    }


    handleChange(event) {
        var name = event.target.id;
        var value = event.target.value;
        this.setState({[name]: value,});
    }

    handleChangeNumber(event) {
        var name = event.target.id;
        var value = event.target.value;
        var valid_price = /^(\d+\.?\d{0,9}|\.\d{1,9})$/.test(value);
        if (valid_price === true) {
            this.setState({ [name]: value, });
        }else {
            this.setState({ [name]: '', });
        }
    }


    handleClose() {
        $('#product_tax_Model').modal('hide');
        this.props.handleClose();
    }


    render_header(title) {
        return (
            <div className="modal-header text-left">
                <button type="button" className="close" onClick={this.handleClose.bind(this)} aria-label="Close"><span
                    aria-hidden="true">&times;</span></button>
                <ul className="list-inline inline">
                    <li className="border-line">{this.state.title}</li>
                </ul>
            </div>
        );
    }

    render_footer() {
        return (
            <div className="modal-footer modal-text-left">
                <button type="button" id="" className="btn btn-primary"
                        onClick={this.handleSubmit.bind(this)}>{translate('save')}
                </button>
                <button type="button" id="" className="btn btn-default"
                        onClick={this.handleClose.bind(this)}>{translate('close')}
                </button>
            </div>
        );
    }

    render_body() {
        return (
            <form id="pro_taxes_form" className="edit-form" action="" method="POST">
                <div className="panel-body">
                    <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                        <table className="detail_table">
                            <tbody>
                            <tr>
                                <td><label className="text-muted control-label">{translate('name')}</label></td>
                                <td>
                                    <div className="form-group">
                                        <input value={this.state.name} id="name" type="text" name='name'
                                               className="form-control capsname" placeholder={translate('tax_name')}
                                               onChange={this.handleChange}/>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="text-muted control-label">{translate('value')}</label></td>
                                <td>
                                    <div className="form-group">
                                        <input value={this.state.tax_value} id="tax_value" type="text" name='value'
                                               className="form-control" placeholder={translate('tax_value')}
                                               onChange={this.handleChangeNumber}/>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="text-muted control-label">{translate('computation_type')}</label>
                                </td>
                                <td>
                                    <div className="form-group" data-type="dropdown">

                                        <select name="computation" id="computation" className="form-control"
                                                value={this.state.computation} onChange={this.handleChange}>
                                            <option value="Percentage">{translate('percentage')}</option>
                                            <option value="Fixed">{translate('fixed')}</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="text-muted control-label">{translate('scope')}</label></td>
                                <td>
                                    <div className="form-group" data-type="dropdown">
                                        <select name="scope" id="tax_scope" className="form-control"
                                                value={this.state.tax_scope} onChange={this.handleChange}>
                                            <option value="sale">{translate('tax_on_sale')}</option>
                                            {this.state.field != 'quot' ?
                                                <option value="wholesale">{translate('wholesale_tax')} </option>
                                                : null
                                            }
                                        </select>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <input type="hidden" name="tax_id" value={this.state.id}/>
            </form>
        )
    }

    render() {
        return (
            <Modal
                style={modal_style}
                onRequestClose={() => true}
                effect={Effect.Fall}>
                <div className="modal-dialog  modal-lg in">
                    <div className="modal-content">
                        { this.render_header() }
                        <div className="modal-body" style={ModalbodyStyle}>
                            { this.render_body() }
                        </div>
                        { this.render_footer() }
                    </div>
                </div>
            </Modal>
        );
    }
}


module.exports = CreateEditTexesModal;