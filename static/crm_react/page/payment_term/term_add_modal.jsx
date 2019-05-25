import React from 'react';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';

class TermAddModal extends React.Component {
    constructor() {
        super();
        this.state = {
                term_type_option :'balance',
                term_type_display_tr: false,
                term_type_list :[],
                term_type_value:'',
                days_type:'invoice',
                daysinput:0,
                due_date_display_tr:true,
        }
   }

  handle_term_type_radio(value){
      if(value != 'balance'){
          this.setState({term_type_display_tr : true, term_type_option:value})
      }else{
          this.setState({term_type_display_tr : false, term_type_option:value})
      }
  }

  handle_due_date_radio(due_date_type){
      if(due_date_type=='invoice'){
           this.setState({days_type : due_date_type, due_date_display_tr:true})
      }else if(due_date_type=='end_invoice'){
           this.setState({days_type : due_date_type, due_date_display_tr:true})
      }else if(due_date_type=='following_month'){
           this.setState({days_type : due_date_type, due_date_display_tr:false})
      }else if(due_date_type=='current_month'){
           this.setState({days_type : due_date_type, due_date_display_tr:false})
      }
  }

  save_payment_term() {
      let pay_term = this.state.term_type_list;
      let dic ={"due_type":this.state.term_type_option,
          'due_type_option_value' : this.state.term_type_value,
          'days_type' : this.state.days_type,
          'daysinput' : this.state.daysinput
      };
      pay_term.push(dic);
      this.props.handleUsersubmit(pay_term);
      this.handleClose()
  }


  handle_change_number(event){
      let value = event.target.value;
      let valid_price = /^(\d+\.?\d{0,9}|\.\d{1,9})$/.test(value);
      if(valid_price === true){
         this.setState({term_type_value: value});
      }else{
         this.setState({term_type_value:''});
      }
  }

  handle_change_days_number(event){
      let value = event.target.value;
      let valid_price = /^(\d+\.?\d{0,9}|\.\d{1,9})$/.test(value);
      if(valid_price === true){
         this.setState({daysinput: value});
      }else{
         this.setState({ daysinput:''});
      }
  }


  handleClose(){
    ModalManager.close(<TermAddModal modal_id = "term_add_modal" onRequestClose={() => true} />);
  }


  render_header(title){
    return(
        <div className="modal-header text-left">
            <button type="button" className="close"  aria-label="Close"  onClick={this.handleClose.bind(this)} ><span aria-hidden="true">&times;</span></button>
            <ul className="list-inline inline">
                <li className="border-line"><b>{translate('create_terms')}</b></li>
            </ul>
        </div>
    );
  }

  render_footer(){
    return(
        <div className="modal-footer modal-text-left ">
            <button type="button" className="btn btn-primary"  onClick = {this.save_payment_term.bind(this)} >{translate('save')}</button>
            <button type="button" className="btn btn-default"   onClick={this.handleClose.bind(this)} >{translate('button_close')}
            </button>
        </div>
    );
  }

  render_body(){
    var margin_top = {marginTop: '10px',}
  return (
    <div className="row crm-stuff">
       <form  className="edit-form" action="" method="POST">
       <div className="col-xs-11 col-md-11 col-sm-11 col-lg-11">
          <table className="col-xs-5 col-sm-5 col-md-5 col-lg-5">
              <tbody>
                  <tr className="bg-primary text-center">
                     <td colSpan="2" width="100%">
                       <b>{translate('term_type')}</b>
                      </td>
                  </tr>
                  <tr>
                     <td colSpan="2" width="100%">{null}</td>
                  </tr>
                    <tr>
                      <td width="10%">
                        <div><b>{translate('type')}</b></div>
                      </td>
                      <td width="90%">
                            <div className="push-left-15">
                             <br/>
                            <input  name="due_type" value="balance" checked={this.state.term_type_option === 'balance'}  onClick={this.handle_term_type_radio.bind(this,'balance')}  type="radio" />
                            <label className="normal_label push-left-5">{translate('balance')}</label>
                            <br/>
                            <input  name="due_type" value="percent" checked={this.state.term_type_option === 'percent'}  onClick={this.handle_term_type_radio.bind(this, 'percent')}  type="radio" />
                            <label className="normal_label push-left-5">{translate('percent')}</label>
                            <br/>
                            <input  name="due_type" value="fixed_amount" checked={this.state.term_type_option === 'fixed_amount'}  onClick={this.handle_term_type_radio.bind(this,'fixed_amount')}  type="radio" />
                            <label className="normal_label push-left-5">{translate('fixed_amount')}</label>
                            </div>
                      </td>
                   </tr>
                  <tr>
                     <td colSpan="2" width="100%">&nbsp;</td>
                  </tr>
                  <tr>
                     <td colSpan="2" width="100%">&nbsp;</td>
                  </tr>
                 { this.state.term_type_display_tr ?
                     <tr>
                         <td width="10%">
                             <label><b>{translate('value')}</b></label>
                         </td>
                         <td width="90%">
                             <div className="form-group edit-name push-left-15" style={margin_top}>
                                 <input type="text" name="value" placeholder="0.000000"
                                        onChange={this.handle_change_number.bind(this)}
                                        value={this.state.term_type_value} className="form-control"/>
                                 {  this.state.term_type_option === 'percent' ?
                                    <span className="emailalis normal_label">%</span>
                                    :null
                                 }
                             </div>
                         </td>
                     </tr>
                     : null
                 }
              </tbody>
          </table>  
          <table className="col-xs-6 col-sm-6 col-md-6 col-lg-6 push-left-5">
              <tbody>
                  <tr className="bg-primary text-center">
                    <td colSpan="2" width="100%"><b>{translate('due_date_computation')}</b></td>
                  </tr>
                  <tr><td colSpan="2" width="100%">{null}</td></tr>
                  <tr>
                      <td colSpan="2">
                          <b><label>{translate('number_of_days')}</label></b>
                      </td>
                  </tr>
                  <tr>
                     <td>
                          <br/>
                          <input  name="days" value="invoice" onClick={this.handle_due_date_radio.bind(this,'invoice')} checked={this.state.days_type === 'invoice'}  type="radio" />
                         <label className="normal_label push-left-5">{translate('days_after_invoice_date')}</label>
                          <br/>
                          <input  name="days" value="end_invoice" onClick={this.handle_due_date_radio.bind(this, 'end_invoice')} checked={this.state.days_type === 'end_invoice'}  type="radio" />
                          <label className="normal_label push-left-5" >{translate('days_after_the_end_invoice_month_net_eom')}</label>
                          <br/>
                          <input  name="days" value="following_month" onClick={this.handle_due_date_radio.bind(this,'following_month')} checked={this.state.days_type === 'following_month'} type="radio" />
                          <label className="normal_label push-left-5">{translate('last_day_following_month')}</label>
                          <br/>
                          <input name="days" value="current_month" onClick={this.handle_due_date_radio.bind(this,'current_month')} checked={this.state.days_type === 'current_month'}  type="radio"/>
                          <label className="normal_label push-left-5">{translate('last_day_current_month')}</label>
                      </td>
                  </tr>
                  {this.state.due_date_display_tr ?
                  <tr>
                      <td colSpan="2">
                          <div className="form-group edit-name">
                              <input type="text"  name ="number_days"  value={this.state.daysinput} onChange= {this.handle_change_days_number.bind(this)}  placeholder="0"  className="form-control" />
                              <span className="emailalis">days</span>
                          </div>
                      </td>
                  </tr>
                  :null
                  }
                </tbody>
          </table>
       </div>
       </form>
    </div>
        );
    }

  render() {
    return (
        <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
              <div className="modal-dialog  modal-lg in" >
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
module.exports = TermAddModal;
