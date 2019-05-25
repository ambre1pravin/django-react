import React from 'react';
import {Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import {translate} from 'crm_react/common/language';
import {SortableHandle} from 'react-sortable-hoc';
import TermAddModal from 'crm_react/page/payment_term/term_add_modal';
import {getCookie } from 'crm_react/common/helper';

const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);

class  PaymentTermAdd extends React.Component {
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
        }
    }

    handle_name(event){
        alert(event.target.value)
    }

    handleSubmit(redirect){

        let name        = this.state.name;
        let notes        = this.state.notes;
        var Data = {'name':name,'notes':notes}
        $.ajax({
            type: "POST",
            cache: false,
            url:  '/payment/term/save/',
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success === true){
                    if(redirect == true){
                        browserHistory.push("/payment/term/list/");
                    }
                }
            }.bind(this)
        });
    }



handleDeleteTr(id){

        $.ajax({
            type: "POST",
            cache: false,
            url:  '/payment/term/deleteterm/',
            data: {
              ajax: true,
              id : JSON.stringify(id),
              csrfmiddlewaretoken: getCookie('csrftoken'),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){
                $('#qpd-trash-'+id).remove();
              }
         
            }.bind(this)
        });

    }

handleTerm()
{ alert("hello")
    this.setState({term_Modal: 'open'}, ()=>{this.refs.term_add_modal.openModalWithData()})      
}

 handleparentTerm(id){
  var term_id = id;
        $.get('/payment/term/getTermData/'+term_id+'/', function (data) {
          this.setState({
            resultterm: data,
          });
        }.bind(this));
  }

  handleClose(){
        $('#TermAddModal').modal('hide');    
        var clear = $("#daysinput");
        var clear1 = $("#value");
        var clear2 = $("#type");
        var clear3 = $("#days");
        $('.type').attr('checked',false);
        $('.days').attr('checked',false);
        $('#type').removeAttr('checked');
        $('#days').removeAttr('checked');
        clear.val('');
        clear1.val('');

    }




  save_action_fn(){
     this.handleSubmit();
  }

  render() { 
    let resultterm = this.state.resultterm;
    
    return (
    <div>  
    {
      <TermAddModal  ref = "term_add_modal"  handleUsersubmit = {this.handleUsersubmit.bind(this)}/>
   }

      <Header />
      <div id="crm-app" className="clearfix module__product module__product-create">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                        <AddPageTopAction
                            list_page_link ="/payment/term/list/"
                            list_page_label ={translate('payment_term')}
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
                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                          <ul className="pull-right panel-tabular__top-actions">
                                              <li>
                                                  <a href="#" title={translate('label_active')}><i className="fa fa-archive" aria-hidden="true"></i>
                                                  <p className="inline-block">{translate('label_active')}</p></a>
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
                                                     <div className="form-group"><input type="text" name="name"  className="form-control" onchange={this.handle_name(this)} required /></div>
                                                    </td>
                                                </tr>
                                                <tr>                                           
                                                    <td>
                                                        <label className="text-muted control-label">{translate('description_on_the_invoice')} </label>
                                                    </td>
                                                    <td>
                                                    <div className="form-group">
                                                    <textarea rows="4" cols="10" name="notes" id="notes" data-id="5"  className="form-control" placeholder={translate('description_on_the_invoice.')}></textarea>
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
                   <tbody>
                    {resultterm?
                    resultterm.term.map((term , i)=>{
                     return(
                    <tr key={this.props.index} className = "product_row list-order" id={"qpd-trash-" + term.id}>
                    <td><DragHandle /></td>
                    <td data-th="Order Date" onClick={this.handleTerm.bind(this)} >
                  {term.due_type  == 'balance' ? 'Balance' : null } 
                  {term.due_type  == 'percent' ? 'Percent' : null } 
                  {term.due_type  == 'fixed_amount' ? 'Fixed Amount' : null } 
                  </td> 
                <td data-th="Order Date" onClick={this.handleTerm.bind(this)} >
                {term.value == "" ? '0.000000':term.value}
                </td>

                <td data-th="Order Date" onClick={this.handleTerm.bind(this)} >
                  {term.number_days == "" ? '0':term.number_days}&nbsp;&nbsp;
                  {term.days  == 'invoice' ? 'Day(s) after the invoice date' : null } 
                  {term.days  == 'end_invoice' ? 'Day(s) after the end of the invoice month (Net EOM)' : null } 
                  {term.days  == 'following_month' ? 'Last day of following month' : null }
                  {term.days  == 'current_month' ? 'Last day of current month' : null }  
                  </td> 
                 <td><span className="qpd-trash" onClick={this.handleDeleteTr.bind(this,term.id)}><i className="fa fa-trash"  aria-hidden="true"></i></span></td>
                    </tr>
                         )
                            }):''
                        }
                    </tbody>
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
  </div>
    
    );
    
  }
}
module.exports = PaymentTermAdd;
