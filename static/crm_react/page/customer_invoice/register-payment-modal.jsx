import React from 'react';
import {translate} from 'crm_react/common/language';
import {DateField, DatePicker} from 'react-date-picker'
import 'react-date-picker/index.css'
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie, cursor_pointer} from 'crm_react/common/helper';
import {NotificationContainer, NotificationManager} from 'react-notifications';


class RegisterPaymentModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null,
            keep_open: true,
            fully_paid: false,
            reason: null,
            payment_amount:null,
            payment_difference:null,
            entered_payment:null,
            computation:'bank',
            payment_date: moment(new Date()).format('YYYY-MM-DD') ,

        };
        this.handle_change = this.handle_change.bind(this);
        this.get_total_invoice_data();
    }


    get_total_invoice_data() {
        if(this.props.invoice_id){
            $.ajax({
                type: "POST",
                cache: false,
                url: '/customer/invoice/get_invoice_data/',
                data: {
                    invoice_id: JSON.stringify(this.props.invoice_id),
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success == true) {
                    console.log("k", data.result.total_amount)
                        this.setState({payment_amount: data.result.total_amount, memo: data.result.name});
                    }
                }.bind(this)
            });
        }
    }


    handle_change(event) {
        const name = event.target.id;
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.setState({[name]: value,});
    }


    handle_change_number(event) {
        var value = event.target.value;
        var valid_price = /^(\d+\.?\d{0,9}|\.\d{1,9})$/.test(value);
        var payment_amount = parseFloat(this.state.payment_amount);
        console.log("nn", value)
        if (valid_price === true) {
            let diff = (payment_amount - value).toFixed(2) ;
            this.setState({payment_difference: diff, entered_payment:value});
        }else {
           this.setState({payment_difference: null, entered_payment:null});
           NotificationManager.error('Enter valid payment', 'Error message', 5000)
        }
    }

    on_change_date(payment_date){
        this.setState({ payment_date: moment(payment_date).format('YYYY-MM-DD')  })
    }

    handle_registration_payment() {
        let ajax_post= true
        /*if(this.state.fully_paid && !this.state.keep_open){
            ajax_post= true
        }
        if(this.state.keep_open && !this.state.fully_paid && this.state.entered_payment!=null){
            ajax_post= true
        }else{
            ajax_post= false
            //NotificationManager.error('Enter valid payment', 'Error message', 5000)
        }*/
        if(ajax_post){
            var post_data ={
                            'invoice_id': this.props.invoice_id,
                            'payment_amount':this.state.entered_payment,
                            'total_amount':this.state.payment_amount,
                            'payment_journal':this.state.computation,
                            'memo':this.state.memo,
                            'payment_difference':this.state.payment_difference,
                            'payment_date':this.state.payment_date,
                            'keep_open':this.state.keep_open,
                            'fully_paid':this.state.fully_paid,
                            'reason':this.state.reason
                           };
            $.ajax({
                type: "POST",
                cache: false,
                url: '/customer/invoice/RegistrationPayment/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success == true) {
                        this.props.set_quotation_status_fn(data.status)
                        this.handle_close()
                    }
                }.bind(this)
            });
        }
    }

    handle_close() {
        ModalManager.close(<RegisterPaymentModal modal_id="register_payment_modal" onRequestClose={() => true}/>);
    }

    handle_open(event) {
        this.setState({keep_open: !this.state.keep_open, fully_paid: !this.state.fully_paid});
    }

    handle_paid(event) {
        this.setState({keep_open: !this.state.keep_open, fully_paid: !this.state.fully_paid});
    }

    on_change_payment_journal(event){
        this.setState({computation: event.target.value});
    }

    render_body() {
        return (
            <form id="payment_form" className="edit-form" action="" method="POST">
                <div className="panel-body">
                    <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                        <table className="detail_table">
                            <tbody>
                            <tr>
                                <td><label className="control-label">{translate('payment_amount')}</label>
                                </td>
                                <td>
                                    <div className="form-group edit-name">
                                        <input
                                               type="text"
                                               name='payment_amount' className="form-control"
                                               onChange={this.handle_change_number.bind(this)}
                                               placeholder="only decimal value"
                                        />
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td><label className="control-label">{translate('payment_journal')}</label>
                                </td>
                                <td>
                                    <div className="form-group">
                                        <select name="payment_journal" className="form-control" style={{'padding':'0'}}
                                                value={this.state.computation} onChange={this.on_change_payment_journal.bind(this)}>
                                            <option value="bank">{'Bank (Euro)'}</option>
                                            <option value="cash">{'Cash (Euro)'}</option>
                                        </select>
                                    </div>

                                </td>
                            </tr>
                            <tr>
                                <td><label className="control-label">{translate('payment_date')}</label></td>
                                <td>
                                    <div className="form-group payment_date">
                                        <DateField dateFormat="YYYY-MM-DD"
                                                   updateOnDateClick={true}
                                                   collapseOnDateClick={true}
                                                   defaultValue={this.state.payment_date}
                                                   showClock={false}>
                                            <DatePicker
                                                onChange={this.on_change_date.bind(this)}
                                                navigation={true}
                                                locale="en"
                                                highlightWeekends={true}
                                                highlightToday={true}
                                                weekNumbers={true}
                                                weekStartDay={0}
                                                footer={false}/>
                                        </DateField>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="control-label">{translate('memo')}</label></td>
                                <td>
                                    <div className="form-group">
                                        <input value={this.state.memo}  type="text" name='memo'
                                               className="form-control" placeholder={translate('memo')}
                                               onChange={this.handleChange}/>
                                    </div>
                                </td>
                            </tr>
                                <tr>
                                    <td>
                                            <label className="control-label">{translate('payment_difference')}</label>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="form-group">
                                                <p>{this.state.payment_difference}</p>
                                            </div>
                                            <br/>
                                            <input name="payment_difference"
                                                   value="keep_open"
                                                   checked={this.state.keep_open}
                                                   onClick={this.handle_open.bind(this)}
                                                   type="radio"/>
                                            <label
                                                style={cursor_pointer}
                                                className="push-left-5"
                                                onClick={this.handle_open.bind(this)}>Keep open</label>
                                            <br/>
                                            <input name="payment_difference"
                                                   value="fully_paid"
                                                   checked={this.state.fully_paid}
                                                   onClick={this.handle_paid.bind(this)}
                                                   type="radio"/>

                                            <label style={cursor_pointer}
                                                   className="push-left-5"
                                                   onClick={this.handle_paid.bind(this)} >
                                                Mark invoice as fully paid
                                            </label>
                                            <br/>
                                        </div>
                                    </td>
                                </tr>
                            {this.state.fully_paid == true ?
                                <tr>
                                    <td><label className="control-label">Reason</label></td>
                                    <td>
                                        <div className="form-group">
                                            <input value={this.state.reason}
                                                   id="reason" type="text"
                                                   name='reason'
                                                   className="form-control" placeholder="Reason"
                                                   onChange={this.handle_change}/>
                                        </div>
                                    </td>
                                </tr>
                                : null
                            }
                            </tbody>
                        </table>

                    </div>
                </div>
                <NotificationContainer/>
            </form>
        )
    }

    render() {
        let result = this.state.result;
        return (
            <Modal
                style={modal_style}
                onRequestClose={() => true}
                effect={Effect.Fall}>
                <div className="modal-dialog  modal-lg in">
                    <div className="modal-content">
                        <div className="modal-header text-left">
                            <button type="button" className="close" onClick={this.handle_close.bind(this)}
                                    aria-label="Close"><span
                                aria-hidden="true">&times;</span></button>
                            <ul className="list-inline inline">
                                <li className="border-line">{this.props.title}</li>
                            </ul>
                        </div>
                        <div className="modal-body" style={ModalbodyStyle}>
                            { this.render_body() }
                        </div>
                        <div className="modal-footer modal-text-left">
                            <button type="button" className="btn btn-primary"
                                    onClick={this.handle_registration_payment.bind(this)}>{translate('validate')}</button>
                            <button type="button" className="btn btn-default"
                                    onClick={this.handle_close.bind(this)}>{translate('close')}</button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }

}
module.exports = RegisterPaymentModal;