import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import {SortableHandle} from 'react-sortable-hoc';
import {translate} from 'crm_react/common/language';
import Dropdown from 'crm_react/component/Dropdown'; 
import EmailTemplate from 'crm_react/page/quotation/email_template';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { getCookie} from 'crm_react/common/helper';

const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);

class  Reminder_tr extends React.Component {
	constructor(props) {
        super(props);

        this.state = {
                        item_type :  this.props.item_type, 
                        emailtemplate_dropdown  : true,
                        email_template_json     : [],
                        selected_template  : this.props.record.email_template,
                        selected_template_id : this.props.record.email_template_id,

                    }
    this.getEmailTemplatemain = this.getEmailTemplatemain.bind(this) 

        }

    handleReminderRemoveTr(id){
       this.props.handleReminderDeleteTr(id) 

    }
componentWillReceiveProps(){
   this.setState({
    selected_template  : this.props.record.email_template,
    selected_template_id : this.props.record.email_template_id,
    });
}
  componentDidMount(){
       this.setState({
    selected_template  : this.props.record.email_template,
    selected_template_id : this.props.record.email_template_id,
    });
    this.getEmailTemplatemain()
  }

  handleChange(event) {
        var value     = event.target.value;
        var index     = this.props.tr_id;
        var attribute = event.target.id;
        this.props.updateReminder(index, attribute, value);
    }


  handleTypeChange(event){
        var name = event.target.id;
        var value = event.target.value;
        this.setState({
            [name]: value,
        });
  }

    getEmailTemplatemain()
  {
    var module_type = 'QUOTATION';

    $.ajax({
            type: "POST",
            cache: false,
            async : false,
            url:  '/quotation/getEmailTemplate/'+module_type,
            data: {
            },
            beforeSend: function () {
             csrfmiddlewaretoken: getCookie('csrftoken')
            },
            success: function (data) {
               
                if(data.success == true){
                this.setState({
                    selected_template:data.name,
                    selected_template_id:data.id,
                    emailtemplate_dropdown:true,
                    email_template_json: data.email_template_json,
                });

                }
            }.bind(this)
        }); 
  }

  handleselectedEmailTemplate(id,name)
  {
          var tamount     = this.props.total_amount;
          var qname       = this.props.qname;
          var customer    = this.props.customer;
          var module_type = this.props.module_type;
          var due_date     = this.props.due_date;

         $.ajax({
              type: "POST",
              cache: false,
              async : false,
              url: '/quotation/getEmailTemplateData/'+id,
              data: {
               csrfmiddlewaretoken: getCookie('csrftoken')
              },
              beforeSend: function () {
                csrfmiddlewaretoken: getCookie('csrftoken')
              },
              success: function (data) {

              if(data.success == true){


              this.setState({
                      emailtemplate_dropdown  :true,
                      selected_template       : name,
                      selected_template_id    : id,
                  });
                  }
              }.bind(this)
          });

  }

handleClose(){
         ModalManager.close(<EmailSendModal modal_id = "email_modal" onRequestClose={() => true} />);
    }
  handleCloseTemplate(){
   ModalManager.close(<EmailTemplate modal_id = "email_template_modal" onRequestClose={() => true} />)
  }

  handleEmailTemplateAddedit(id,input_value){
            ModalManager.open(<EmailTemplate
                title     = "Next CRM"
                ids                         = {id}
                quot_id                     = {this.props.id}
                input_value                 = {input_value} 
                customer                    = {this.props.customer} 
                name                        = {this.state.name}
                total_amount                = {this.props.total_amount} 
                getEmailTemplatemain        = {this.getEmailTemplatemain.bind(this)}  
                handleselectedEmailTemplate = {this.handleselectedEmailTemplate.bind(this)}
                handleCloseTemplate         = {this.handleCloseTemplate.bind(this)} 
                onRequestClose              = {() => true}
                modal_id                    = "email_template_modal"
                module_type                 =  "QUOTATION"/>);
    }

  
  quotationadddata(){
      this.props.quotationadddata()
    }

  render() {

        return (

                <tr key={this.props.index} className = "reminder_rows email_alls" id={"qpd-trash-" + this.props.record.id}>
                    <td><DragHandle /></td>
                    <td data-th="Order Date" >
                      <input type="number" id="numbers" name="numbers" onChange={this.handleChange.bind(this)} value={this.props.record.numbers} />
                    </td> 
                    
                    <td data-th="Order Date">
                      <select name="daytype" className="o_form_input o_form_field form-control email_all_width" id ="daytype" onChange={this.handleChange.bind(this)} value={this.props.record.event_type} >
                                                              <option value="day">Days</option>
                                                              <option value="weeks">Weeks</option>
                                                              <option value="month">Month</option>
                                                              <option value="year">Year</option>
                     </select>
                    </td>
                    <td data-th="Product">
                         <Dropdown 
                                                    name                          = 'Use Template'
                                                    inputname                     = 'email_template'
                                                    nameinput                     = 'email_template_name'
                                                    module_type                   = {this.props.module_type}
                                                    json_data                     = {this.state.email_template_json}
                                                    input_value                   = {this.state.selected_template} 
                                                    input_id                      = {this.state.selected_template_id}
                                                    setSelected                   = {this.handleselectedEmailTemplate.bind(this)}
                                                    getEmailTemplatemain          = {this.getEmailTemplatemain.bind(this)}
                                                    create_edit                   = {true}
                                                    product_dropdown              = {true}
                                                    handleAddEdit                 = {this.handleEmailTemplateAddedit.bind(this)}
                                                    handleClose                   = {this.handleClose.bind(this)}/>
                    </td>

                      <td><span className="qpd-trash " onClick={this.handleReminderRemoveTr.bind(this,this.props.record)}><i className="fa fa-trash"  aria-hidden="true"></i></span></td>
                    
                </tr>

        );
  }
}
module.exports = Reminder_tr;