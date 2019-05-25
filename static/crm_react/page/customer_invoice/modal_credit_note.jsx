import React from 'react';
import state, {MACHINE_DEFAULT_DATA,RELATIVE_URL,BASE_FULL_URL,IMAGE_PATH} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import 'react-date-picker/index.css'

class  ModalCreditNote extends React.Component {
	constructor() 
  {
    super();
    this.state = {
                result                    : null,
    }
    
    this.handleChange   = this.handleChange.bind(this);
         
  }

  openCreditNoteModalWithData(){
    $('#Model_credit_note').modal('show');
  }


  handleChange(event) {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState({
      [name]: value,
    });

  }

  handleCreditNote(){

        var Data = $('#payment_form').serializeArray();
        let payment_date  = $('#payment_form').find('div.payment_date input.react-date-field__input').val();
        Data.push({'name' : 'payment_date', 'value' :payment_date});
        
        $.ajax({
                type: "POST",
                cache: false,
                url: BASE_FULL_URL + '/customer/invoice/RegistrationPayment/',
                data: {
                  ajax: true,
                  fields:JSON.stringify(Data),
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if(data.success == true){
                        this.setState({
                            
                        })
                        this.props.getQuotationById(this.state.cinvoice_id)
                        $('#Model_credit_note').modal('hide');
                    }
                }.bind(this)
            });
    }

  handleClose(){

    $('#Model_credit_note').modal('hide');    

  }

    _renderHeader(){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close"  onClick= {this.handleClose.bind(this)} aria-label="Close"   ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li className="border-line">{this.props.title}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left">
                <button type="button"   className="btn btn-primary" onClick = {this.handleCreditNote.bind(this)} >{translate('add_credit_note')}</button>
                <button type="button"   className="btn btn-default" onClick= {this.handleClose.bind(this)} >{translate('close')}</button> 
            </div>
        );
    }

    _renderBody(){
        return (
                <form id="payment_form" className="edit-form" action="" method="POST">
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                            <table className="detail_table">
                                <tbody>
                                <tr>
                                    <td>
                                        <div>
                                            <br/>
                                            <b>&nbsp;&nbsp;&nbsp;{translate('type')}</b>
                                        </div>
                                    </td>
                                      <br/>
                                      <br/>
                                    <td id="divtd">
                                      <input id="type" name="due_type" value="balance" checked={this.state.balance} onClick={this.handleClose.bind(this)}  type="radio" />
                                       <label>'Create a draft credit note'</label>
                                       <br/>
                                      <input id="type" name="due_type" value="percent" checked={this.state.percent} onClick={this.handleClose.bind(this)}  type="radio" />
                                       <label>&nbsp;&nbsp;&nbsp;&nbsp;'Cancel: create credit note and reconcile'</label>
                                       <br/>
                                        <input id="type" name="due_type" value="fixed_amount" checked={this.state.fixed_amount} onClick={this.handleClose.bind(this)}  type="radio" />
                                       <label>&nbsp;&nbsp;&nbsp;&nbsp;'Modify: create credit note, reconcile and create a new draft invoice'</label>
                                    </td>
                                </tr>  
                                  
                                </tbody>
                            </table>
                        
                        </div>
                    </div>
                
                </form>
              )
    }

     render() {
        let result = this.state.result
        return (
            <div>
            <div className="modal modal_product fade" id="Model_credit_note" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"  data-keyboard="false" data-backdrop="static" >
              <div className="modal-dialog modal-lg ">
                <div className="modal-content">
                  { this._renderHeader() }
                  { this._renderBody() }
                  { this._renderfooter() }

                </div>
              </div>
            </div>
            </div>
        );
    }

}
module.exports = ModalCreditNote;