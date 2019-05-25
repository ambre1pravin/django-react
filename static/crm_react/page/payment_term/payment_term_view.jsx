import React from 'react';
import {  browserHistory } from 'react-router'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {SortableHandle} from 'react-sortable-hoc';
import {translate} from 'crm_react/common/language';

const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);

class  PaymentTermView extends React.Component {
	constructor() {
        super();
        this.state = {
            payment: null,
            op_id_list: [],

        }
        this.getPaymentById = this.getPaymentById.bind(this)
        this.handleparentTerm = this.handleparentTerm.bind(this)
    }

    componentDidMount() {
        var payment_id = this.props.params.Id;
        this.getPaymentById(payment_id);
        this.handleparentTerm(payment_id);
    }

    handleNextPrev(Action, current_id) {
        var id_array = this.state.op_id_list;
        if (id_array.length == 0)
            return false
        var current_index = '0';
        var next_op_id = '';
        var arr_length = id_array.length;
        current_index = id_array.indexOf(current_id);
        if (Action == 'pre') {
            if (current_index == 0) {
                next_op_id = id_array[arr_length - 1];
            } else {
                next_op_id = id_array[current_index - 1];
            }
        }
        if (Action == 'next') {
            if (current_index == arr_length - 1) {
                next_op_id = id_array['0'];
            } else {
                next_op_id = id_array[current_index + 1];
            }
        }
        if (next_op_id !== undefined && next_op_id != '' && next_op_id != 0) {
            browserHistory.push("/payment/term/view/" + next_op_id);
            this.getPaymentById(next_op_id);
        }
    }

    getPaymentById(id) {
        this.serverRequest = $.get('/payment/term/viewdata/' + id, function (data) {
            if (data.success == true) {
                this.setState({
                    payment: data.payment !== undefined ? data.payment : null,
                    del_id: id,
                })
                if (data.op_id_list !== undefined && data.op_id_list.length > 0) {
                    var id_list = data.op_id_list;
                    var id_array = [];
                    for (var i in id_list) {
                        if (id_list.hasOwnProperty(i) && !isNaN(+i)) {
                            id_array[+i] = id_list[i].id;
                        }
                    }
                    this.setState({op_id_list: id_array});
                }
            }
        }.bind(this));
    }

    handleparentTerm(id) {
        var term_id = id;
        $.get('/payment/term/getTermData/' + term_id + '/', function (data) {
            this.setState({
                resultterm: data.term !== undefined ? data.term : null,
            });
        }.bind(this));
    }

  render() {
    let payment      = this.state.payment;
    let resultterm   = this.state.resultterm;
    
    return (
        <div>
            <Header />
            <div id="crm-app" className="clearfix module__product module__product-create">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">

                            {/*<div className="row top-actions">
                             <div className="col-xs-12 col-sm-12 pull-right text-right">
                             <ul className="list-inline inline-block top-actions-pagination">
                             <li><a onClick = {()=>this.handleNextPrev('pre', this.state.del_id)} href="javascript:void(0)" ><i className="fa fa-chevron-left"></i></a></li>
                             <li><a onClick = {()=>this.handleNextPrev('next', this.state.del_id)} href="javascript:void(0)" ><i className="fa fa-chevron-right"></i></a></li>
                             </ul>
                             </div>
                             </div>*/}
                            <AddPageTopAction
                                list_page_link={'payment/term/list/'}
                                list_page_label={translate('payment_term')}
                                add_page_link="/payment/term/add/"
                                add_page_label="Add Payment Term"
                                edit_page_link={'/payment/term/edit/' + this.props.params.Id}
                                edit_page_label={translate('button_edit') + ' ' + translate('payment_term')}
                                item_name={payment ? payment.name : null}
                                page="view"
                                module="payment-term"
                                save_action={false}
                            />

                            <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <form id="payment_edit_form">
                                        <div className="panel panel-default panel-tabular">
                                            <div className="panel-heading no-padding ">
                                                <div className="row">

                                                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-left">
                                                        <ul className="pull-left panel-tabular__top-actions">
                                                            <li>
                                                                <h2 className="col-sm-12 quotation-number">{translate('payment_term')}  </h2>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="panel-body edit-form">
                                                <div className="row row__flex">
                                                    <div className="col-xs-12 col-sm-12">
                                                        <table className="detail_table">
                                                            <tbody>
                                                            <tr>
                                                                <td>
                                                                    <label
                                                                        className="text-muted control-label">{translate('payment_term')}
                                                                        :</label>
                                                                </td>
                                                                <td>
                                                                    <div className="form-group">
                                                                        {payment && payment.name != '' && payment.name != 'None' ? (payment.name) : '\u00A0' }
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td>
                                                                    <label className="text-muted control-label">{translate('description_on_the_invoice')}:</label>
                                                                </td>
                                                                <td>
                                                                    <div className="form-group">
                                                                        {payment && payment.notes != '' && payment.notes != 'None' ? (payment.notes) : '\u00A0' }
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            </tbody>
                                                        </table>
                                                        <br/>
                                                        <div className="o_horizontal_separator">
                                                            <b>Terms</b>
                                                        </div>
                                                        <br/>
                                                        <p className="text-muted">
                                                            The last lines computation type should be "Balance" to
                                                            ensure that the whole amount will be allocated.
                                                        </p>
                                                        <div className="tab-content">
                                                            <div id="field-tab-1" role="tabpanel"
                                                                 className="tab-pane active">
                                                                <table
                                                                    className="quotation-product-detail table list-table list-order">
                                                                    <thead>
                                                                    <tr>
                                                                        <th>&nbsp;</th>
                                                                        <th>{translate('due_type')}</th>
                                                                        <th>{translate('value')}</th>
                                                                        <th>{translate('number_of_days')}</th>
                                                                        <th>&nbsp;</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {resultterm != null && resultterm !== undefined ?
                                                                        resultterm.map((term, i) => {
                                                                            return (
                                                                                <tr key={this.props.index}
                                                                                    className="product_row list-order">
                                                                                    <td><DragHandle /></td>
                                                                                    <td data-th="Order Date">
                                                                                        {term.due_type == 'balance' ? 'Balance' : null }
                                                                                        {term.due_type == 'percent' ? 'Percent' : null }
                                                                                        {term.due_type == 'fixed_amount' ? 'Fixed Amount' : null }
                                                                                    </td>
                                                                                    <td data-th="Order Date">
                                                                                        {term.value == "" ? '0.000000' : term.value}
                                                                                    </td>
                                                                                    <td data-th="Order Date">
                                                                                        {term.number_days == "" ? '0' : term.number_days}&nbsp;&nbsp;
                                                                                        {term.days == 'invoice' ? 'Day(s) after the invoice date' : null }
                                                                                        {term.days == 'end_invoice' ? 'Day(s) after the end of the invoice month (Net EOM)' : null }
                                                                                        {term.days == 'following_month' ? 'Last day of following month' : null }
                                                                                        {term.days == 'current_month' ? 'Last day of current month' : null }
                                                                                    </td>
                                                                                </tr>
                                                                            )
                                                                        })
                                                                        : null
                                                                    }
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }
}
module.exports = PaymentTermView;
