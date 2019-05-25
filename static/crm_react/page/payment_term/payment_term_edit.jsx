import React from 'react';
import {Link, browserHistory } from 'react-router'
import 'react-date-picker/index.css'
import {SortableContainer,SortableElement,SortableHandle,arrayMove} from 'react-sortable-hoc';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';
import TermAddModal from 'crm_react/page/payment_term/term_add_modal';
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
        <tbody className ="" >
            {items.map((record, index) =>
                <SortableItem_tr  key                   = {`item-${index}`} 
                                  index                 = {index} 
                                  handleDeleteTr        = {handleDeleteTr}
                                  record                = {record} />
            )}
        </tbody>
    );
});

class  PaymentTermEdit extends React.Component {
	constructor() {
        super();
        this.state = {
                    result         : null ,
                    items          : [],
                    processing     : false,
                    name              : '',
                    notes             : '',
        };
        this.getPaymentTermById = this.getPaymentTermById.bind(this);
        this.onSortEnd          = this.onSortEnd.bind(this);
        this.handleparentTerm   = this.handleparentTerm.bind(this)
  }

  componentDidMount(){
    var payment_id = this.props.params.Id;
    this.setState({edit_id:payment_id});
    this.getPaymentTermById(payment_id);
    this.handleparentTerm(payment_id);

  }

    getPaymentTermById(id) {


        this.serverRequest = $.get('/payment/term/editdata/' + id + '/', function (data) {
            if (data.success == true) {
                this.setState({
                    result: data,
                    payment: data.payment !== undefined ? data.payment : null,
                    name: data.payment.name !== undefined ? data.payment.name : null,
                    notes: data.payment.notes !== undefined ? data.payment.notes : null,
                });
            }
        }.bind(this));
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
        console.log("Edit payment", data, items)
        this.format_items_text(data);
    }



    handleSubmit() {
        let items = this.state.items;
        let ajax_post = false;
        for (var i = 0; i < items.length; i++) {
            if (items[i].due_type == 'balance') {
                ajax_post = true;
            }
        }
        var payment_term_data = {
            'payment_term_id': this.props.params.Id,
            'name': this.state.name,
            'notes': this.state.notes,
            'payment_items': this.state.items
        };


        if (ajax_post) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/payment/term/update/',
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
        }else {
            NotificationManager.error('A Payment Terms should have its last line of type Balance!', 'Error', 5000);
        }
    }

    handleparentTerm(id) {
        var term_id = id;
        $.get('/payment/term/getTermData/' + term_id + '/', function (data) {
            this.setState({resultterm: data,});
            if (data.term !== undefined && data.term.length > 0) {
                var temp_arr = []
                data.term.forEach(function (term, i) {
                    temp_arr.push({
                        'id': term.id,
                        'due_type': term.due_type,
                        'value': term.value,
                        'number_days': term.number_days,
                        'days': term.number_days
                    });
                });
                this.setState({items: temp_arr})
            }
        }.bind(this));
    }

    handleDeleteTr(id) {
      if (!String(id).match("item_")) {
          var post_data ={'payment_term_id':this.props.params.Id, 'term_id':id};
          $.ajax({
              type: "POST",
              cache: false,
              url: '/payment/term/deleteterm/',
              data: {
                  ajax: true,
                  post_data: JSON.stringify(post_data),
                  csrfmiddlewaretoken: getCookie('csrftoken')
              },
              beforeSend: function () {
                  this.setState({processing: true})
              }.bind(this),
              success: function (data) {
                  if (data.success == true) {
                      this.setState({processing: false, items:data.term});
                  }
              }.bind(this)
          });
      }else{
          let items = this.state.items;
          let temp_items = [];
          if(items.length > 0){
              for(var i=0; i < items.length; i++){
                  if(items[i].id!=id){
                      temp_items.push(items[i]);
                  }
              }
              this.setState({items: temp_items});
          }
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


    handle_name(event) {
        if (event.target.value != '') {
            this.setState({name: event.target.value})
        }
    }

    handle_notes(event) {
        if (event.target.value != '') {
            this.setState({notes: event.target.value})
        }
    }


    onSortEnd({oldIndex, newIndex}) {
        this.setState({
            items: arrayMove(this.state.items, oldIndex, newIndex)
        });
        var Data = this.state.items;
        $.ajax({
            type: "POST",
            cache: false,
            url: '/payment/term/OrderUpdate/',
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success === true) {
                }
            }.bind(this)
        });
    }

   render() { 

     let resultterm     = this.state.resultterm;
     let items          = this.state.items;

    return (
    <div>  
    <NotificationContainer/>
      <Header />
      <div id="crm-app" className="clearfix module__product module__product-create">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                        <div className="row top-actions">
                              <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                              <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li><Link to={'/payment/term/list/'}  className="breadcumscolor" title={translate('payment_term')}>{translate('payment_term')} </Link></li>
                                  <li>{this.state.name}</li>
                              </ul>
                              <button className="btn btn-primary" onClick = {this.handleSubmit.bind(this)}>{translate('save_all')}</button>
                              <Link to={'/payment/term/list/'}  className="btn btn-primary btn-discard btn-transparent" >{translate('discard')}</Link>
                          </div>
                            <div className="col-xs-12 col-sm-12 pull-right text-right">
                                <ul className="list-inline inline-block top-actions-pagination">
                                    <li><a href="#"><i className="fa fa-chevron-left"></i></a></li>
                                    <li><a href="#"><i className="fa fa-chevron-right"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        {/*end top-actions*/}
                       <div className="row crm-stuff">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                          <form id="payment_edit_form">
                            <div className="panel panel-default panel-tabular">
                                <div className="panel-heading no-padding ">
                                  <div className="row">
                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-left">
                                          <ul className="pull-left panel-tabular__top-actions">
                                              <li>
                                                <h2 className="col-sm-12 quotation-number">{translate('edit_payment_term')}  </h2>
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
                                                         <input type="text"  name ="name" value={this.state.name} onChange={this.handle_name.bind(this)} className="form-control" required/></div>
                                                    </td>
                                                </tr>
                                                <tr>                                           
                                                    <td>
                                                        <label className="text-muted control-label">{translate('description_on_the_invoice')} </label>
                                                    </td>
                                                    <td>
                                                    <div className="form-group">
                                                    <textarea rows="4" cols="10" name="notes" onChange={this.handle_notes.bind(this)}  value={this.state.notes}  className="form-control" placeholder={translate('description_on_the_invoice.')}></textarea>
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
                                          useDragHandle           = {true} />
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
module.exports = PaymentTermEdit;
