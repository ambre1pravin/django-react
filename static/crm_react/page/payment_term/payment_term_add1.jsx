import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import 'react-date-picker/index.css'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import TermAddModal from 'crm_react/page/payment_term/term_add_modal';
import {SortableHandle} from 'react-sortable-hoc';
import Term_tr from 'crm_react/page/payment_term/Term_tr';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {getCookie } from 'crm_react/common/helper';

const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>); // This can be any component you want


const SortableItem_tr = SortableElement(
                        ({record, key,handleDeleteTr}) => <Term_tr 
                                          record = {record} 
                                          handleDeleteTr        = {handleDeleteTr}
                                           key    = {key}  /> );

const SortableList_tbody = SortableContainer(({items,handleDeleteTr}) => {
    return (
        <tbody className ="order" >
            {items.map((record, index) =>
                <SortableItem_tr  key                   = {`item-${index}`} 
                                  index                 = {index} 
                                  handleDeleteTr        = {handleDeleteTr}
                                  record                = {record} />
            )}
        </tbody>
    );
});


class  PaymentTermAdd1 extends React.Component {
    constructor(){
        super();
        this.state = {
            result            : null,
            items             : [],
            product_Modal     : 'close',
            due_type          : 'Balance',
            value             : '0.000000',
            days              : '0 Day after the invoice date',
            name              : '',
            notes             : '',
            processing        : false,
        }
    }

    handle_name(event){
        if(event.target.value != ''){
            this.setState({name : event.target.value})
        }
    }

    handle_notes(event){
        if(event.target.value != ''){
            this.setState({notes : event.target.value})
        }
    }

    handleSubmit(){
        let name = this.state.name;
        let notes = this.state.notes;
        let items = this.state.items;
        let payment_term_id = 0 ;
        let ajax_post = false;
        for (var i=0; i < items.length; i++){
            if(items[i].due_type == 'balance'){
                ajax_post = true
            }
        }
        if(name !=''){
            if( items.length > 0) {
                if (ajax_post) {
                    var payment_term_data = {
                        'payment_term_id': payment_term_id,
                        'name': this.state.name,
                        'notes': this.state.notes,
                        'payment_items': this.state.items
                    };
                    $.ajax({
                        type: "POST",
                        cache: false,
                        url: '/payment/term/save/',
                        data: {
                            ajax: true,
                            fields: JSON.stringify(payment_term_data),
                            csrfmiddlewaretoken: getCookie('csrftoken')
                        },
                        beforeSend: function () {
                            this.setState({processing: true})
                        }.bind(this),
                        success: function (data) {
                            if (data.success === true) {
                                this.setState({processing: false});
                                 browserHistory.push("/payment/term/list/");
                            }
                        }.bind(this)
                    });
                } else {
                    NotificationManager.error('A Payment Terms should have its last line of type Balance!', 'Error', 5000);
                }
            }else{
                NotificationManager.error('Please add items for this payment term', 'Error', 5000);
            }
        }else{
             NotificationManager.error('Payment Terms Name Required!', 'Error',5000);
        }

    }

    onSortEnd({oldIndex, newIndex}) {
        this.setState({items: arrayMove(this.state.items, oldIndex, newIndex)});
    }

    handleDeleteTr(id) {
        let items = this.state.items;
        if (items.length > 0) {
            let temp_items = [];
            for (var i = 0; i < items.length; i++) {
                if (id != items[i].id) {
                    temp_items.push(items[i]);
                }
            }
            this.setState({items: temp_items})
        }
    }

    handleTerm() {
        ModalManager.open(
            <TermAddModal
                title=""
                handleUsersubmit={this.handleUsersubmit.bind(this)}
                onRequestClose={() => true}
                modal_id="term_add_modal"
            />
        );
    }

    format_items_text(return_data) {
        let items = this.state.items;
        let key;
        let item_dic = {};
        if (items.length > 0) {
            key = items.length;
        } else {
            key = 0;
        }
        if (return_data.length > 0) {
            for (var i = 0; i < return_data.length; i++) {
                item_dic['due_type'] = return_data[i].due_type;
                item_dic['value'] = return_data[i].due_type_option_value;
                item_dic['number_days'] = return_data[i].daysinput;
                item_dic['days'] = return_data[i].days_type;
                item_dic['id'] = 'item_' + key;
                items.push(item_dic);
            }
            this.setState({items: items});
        }
    }

    handleUsersubmit(data) {
        let items = this.state.items;
        this.format_items_text(data);
    }

    save_action_fn() {
        this.handleSubmit();
    }

  render() {
    let resultterm = this.state.resultterm;
    let items          = this.state.items;
    return (
        <div>
        <NotificationContainer/>
        <Header />
         <div id="crm-app" className="clearfix module__product module__product-create">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                            <AddPageTopAction
                                list_page_link ="/payment/term/list/"
                                list_page_label ={translate('payment_term')}
                                add_page_link="/payment/term/add/"
                                add_page_label = {translate('payment_term')}
                                edit_page_link={false}
                                edit_page_label ={false}
                                item_name=""
                                page="add"
                                module="payment-term"
                                save_action ={this.save_action_fn.bind(this)}
                            />
                           <div className="row crm-stuff">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                              <form id="payment_form">
                                <div className="panel panel-default panel-tabular">
                                    <div className="panel-heading no-padding ">
                                      <div className="row">
                                          <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-left">
                                              <ul className="pull-left panel-tabular__top-actions">
                                                  <li>
                                                    <h2 className="col-sm-12 quotation-number">{translate('new_payment_term')}  </h2>
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
                                                            <label className="text-muted control-label">{translate('payment_term')} * </label>
                                                        </td>
                                                        <td>
                                                            <div className="form-group">
                                                                <input type="text" autoComplete="off" name="name"  className="form-control"  required onChange={this.handle_name.bind(this)}/>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="text-muted control-label">{translate('description_on_the_invoice')} </label>
                                                        </td>
                                                        <td>
                                                        <div className="form-group">
                                                        <textarea rows="4" cols="10" name="notes"  className="form-control" onChange={this.handle_notes.bind(this)} placeholder={translate('description_on_the_invoice.')} ></textarea>
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
                                            The last lines computation type should be "Balance" to ensure that the whole amount will be allocated.
                                          </p>
                                        <div className="tab-content">
                                            <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                                <table className="quotation-product-detail table list-table list-order">
                                                  <thead>
                                                      <tr>
                                                        <th>&nbsp;</th>
                                                        <th>{translate('due_type')}</th>
                                                        <th>{translate('value')}</th>
                                                        <th>{translate('number_of_days')}</th>
                                                        <th>&nbsp;</th>
                                                      </tr>
                                                  </thead>
                                                  <SortableList_tbody
                                                          items                   =  {this.state.items}
                                                          onSortEnd               = {this.onSortEnd.bind(this)}
                                                          handleDeleteTr           = {this.handleDeleteTr.bind(this)}
                                                          helperClass             = "SortableHelper"
                                                          useDragHandle           = {true}
                                                  />
                                                </table>
                                                           <div className="add-new-product">
                                                               <a href="javascript:void(0)" className="btn btn-new" onClick= {this.handleTerm.bind(this)} >{translate('add_an_item')}</a>
                                                          </div>
                                                            </div>
                                                          </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>  {/*end .panel*/}
                                              <input type="hidden" name="payment_term_id" id="payment_term_id" value={this.state.payment_term_id}   />
                                          </form>
                                    </div>
                          </div>
                        </div>
                    </div>
                </div>
            </div>
            <LoadingOverlay processing={this.state.processing}/>
         </div>
    );
    
  }
}
module.exports = PaymentTermAdd1;
