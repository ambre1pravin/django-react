import React from 'react';
import ReactTooltip from 'react-tooltip'
import {translate} from 'crm_react/common/language';
import Dropdown from 'crm_react/component/Dropdown';
import CreateEditTexesModal from 'crm_react/page/quotation/create_edit_taxes_modal';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import EmailTemplate from 'crm_react/page/quotation/email_template';

class CreateInvoiceModal extends React.Component {

    constructor() {
        super();
        this.state = {
                id              : 0,
                name            : '',
                email           : '',
                phone           : '',
                mobile          : '',
                op_rights       : '',
                select_value    : '',
                selected_id     : '',
                value           : '',
                delivered       : true,
                all             : false,
                manual          : true,
                automatically   : false,
                percentage      : false,
                fixed           : false,
                end_invoice     : false,
                following_month : false,
                current_month   : false,
                tax_modal_is_open:false,
                checkbox_email    : false,

        }

        this.handleChange = this.handleChange.bind(this)

    }

 componentDidMount(){    

        this.openModalWithData()

      }

  openModalWithData()
  { 
          $.ajax({
              type: "POST",
              cache: false,
            
              url: '/quotation/adddata/',
              data: {
                
              },
              beforeSend: function () {
              },
              success: function (data) {
                  if(data.success == true){
                      this.setState({
                      result              : data,
                      taxes_list          : data.json_taxes,
                      selected_stax_id    : data.tax_on_sale!==undefined && data.tax_on_sale!='' ? data.tax_on_sale :'',
                      selected_stax_name  : data.tax_on_sale_name!==undefined && data.tax_on_sale_name!='' ? data.tax_on_sale_name :'',
                  });
                  }
              }.bind(this)
          });

      var module_type = 'CustomerInvoice';

       $.ajax({
            type: "POST",
            cache: false,
          
            url: '/quotation/getEmailTemplate/'+ module_type+'/',
            data: {
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success == true){
    
                this.setState({
                    selected_template           : data.name,
                    selected_template_id        : data.id,
                    description                 : $('.summernote').code(data.description),
                    emailtemplate_dropdown      : true,
                    email_template_json         : data.email_template_json,
                    recipients_dropdown         : true,
                });
                }
            }.bind(this)
        });

    }

 

  setCreatedSTAX(id, value){
    this.setState({
            selected_stax_id :id ,
            selected_stax_name : value
            })
  }


  handleChange(event) {
    const name = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState({[name]: value,});

  }

  handleCloseEmailTemplate(){

    ModalManager.close(<EmailSendModal modal_id = "email_modal" onRequestClose={() => true} />);
  }

  openTaxesModal(id, input_value , model_id){

          var items_type =''
          var tr_id =''
          ModalManager.open(<CreateEditTexesModal title     = "" 
                handleClose                 = {this.handleCloseTaxModal.bind(this)} 
                setCreatedTAX               =  {this.handleselectedTaxes.bind(this)}
                quotationadddata            = {this.quotationadddata.bind(this)}
                onRequestClose              = {() => true}
                items_type                  = {items_type} 
                tr_id                       = {tr_id} 
                taxes_id                    = {id} 
                input_value                 = {input_value} 
                field                       = "quot"
                modal_id                    = "product_tax_Model"/>);

  }

quotationadddata(){
    this.serverRequest = $.get('/quotation/adddata/', function (data) {

      this.setState({
          result                : data,
          products_list         : data.json_products!==undefined ? data.json_products : [],
          uom_list              : data.json_uom!==undefined ? data.json_uom : [], 
          taxes_list            : data.json_taxes!==undefined ? data.json_taxes : [],
          selected_tmpl_id      : data.selected_tmpl_id!==undefined && data.selected_tmpl_id!='' ? data.selected_tmpl_id :'',
          selected_tmpl_name    : data.selected_tmpl_name!==undefined && data.selected_tmpl_name!='' ? data.selected_tmpl_name :'',
       
          });
    }.bind(this));
  }



   handleLeadAddEdit(id, input_value){
      this.setState({lead_modal_is_open:true}, ()=>{this.refs.lead_child1.openModalWithData(id, input_value)});
    }

  handleInvoiceLines(event)
  {
    var value = $(".valuelabel");
    var clear = $("#value");

    
         if(event.target.checked){
            value.hide();
            clear.val('');
            this.setState({delivered: true})
            this.setState({all: false})
            this.setState({percentage: false})
            this.setState({fixed: false})
            
         }
    }  

    handleManualInvoice(event)
  {
    var automatically = $(".invoicemanual");
    var checkbox_email_table = $(".checkbox_email_table");
         if(event.target.checked){
            automatically.show();
            checkbox_email_table.hide();
            this.setState({manual: true})
            this.setState({automatically: false})
            this.setState({delivered: true})
            
         }
    }  

    handleAutomaticallyInvoice(event)
    {
        var automatically        = $(".invoicemanual");
        var checkbox_email_table = $(".checkbox_email_table");
        var valuelabel           = $(".valuelabel");
        if(event.target.checked)
        {
          automatically.hide();
          valuelabel.hide();
          checkbox_email_table.show();
          this.setState({automatically: true})
          this.setState({manual: false})
          this.setState({delivered: false})
          this.setState({all: false})
          this.setState({percentage: false})
          this.setState({fixed: false})
        }
    }


  handleInvoicelinesDeductPayment(event){
    var value = $(".valuelabel");
    var clear = $("#value");
    if(event.target.checked){
        value.hide();
        clear.val('');
        this.setState({delivered: false})
        this.setState({all: true})
        this.setState({percentage: false})
        this.setState({fixed: false})
    }
  }

  handleDownPaymentPercentage(event){
     var value = $(".valuelabel");
     var clear = $("#value");
     var perc = $("#perc");
     if(event.target.checked){
        value.show();
        perc.show();
        clear.val('');
        this.setState({delivered: false})
        this.setState({all: false})
        this.setState({percentage: true})
        this.setState({fixed: false})
     }
  }


  handleDownPaymentFixedAmount(event){
    var value = $(".valuelabel");
    var clear = $("#daysinput");
    var perc = $("#perc");
         if(event.target.checked){
            value.show();
            perc.hide();
            clear.val('');
            this.setState({delivered: false})
            this.setState({all: false})
            this.setState({percentage: false})
            this.setState({fixed: true})
         }
    }


handleopen()
{  
  this.props.openEmailModal();
}

  handleCloseTemplate(){

   ModalManager.close(<EmailTemplate modal_id = "email_template_modal" onRequestClose={() => true} />)


  }

  handleEmailTemplateAddedit(id,input_value){

            ModalManager.open(<EmailTemplate title     = "Next CRM" 
                module_type                 = {this.props.module_type}
                ids                         = {id} 
                quot_id                     = {this.props.id}
                input_value                 = {input_value} 
                customer                    = {this.props.customer} 
                name                        = {this.state.name}
                total_amount                = {this.props.total_amount} 
                getEmailTemplatemain        = {this.getEmailTemplatemain.bind(this)} 
                handleopen                  = {this.handleopen.bind(this)}  
                handleselectedEmailTemplate = {this.handleselectedEmailTemplate.bind(this)}
                handleCloseTemplate         = {this.handleCloseTemplate.bind(this)} 
                onRequestClose              = {() => true}
                modal_id                    = "email_template_modal"
                module_type                 =  "CustomerInvoice"/>);
    }

  getEmailTemplatemain()
  {
    var module_type ='CustomerInvoice';

    $.ajax({
            type: "POST",
            cache: false,
            async : false,
            url:  '/quotation/getEmailTemplate/'+module_type,
            data: {
            },
            beforeSend: function () {
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
        var tamount = this.props.total_amount;
        var qname = this.props.qname;
        var customer = this.props.customer;
        
       $.ajax({
            type: "POST",
            cache: false,
            async : false,
            url: '/quotation/getEmailTemplateData/'+id,
            data: {
            },
            beforeSend: function () {
            },
            success: function (data) {

            if(data.success == true){
            var sub = data.subject;
            var subject = sub.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount);
            var desc =  data.description;
            var txtEditor = desc.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount);
           
            var image_path = data.image_path;
            this.setState({
                    emailtemplate_dropdown  :true,
                    subject                 : subject,
                    editor                  : $('.summernote').code(txtEditor),
                    selected_template       : name,
                    selected_template_id    : id,
                    image_path              : image_path,
                });
                }
            }.bind(this)
        });

}

  handleCloseTaxModal(){

    ModalManager.close(<CreateEditTexesModal modal_id = "product_tax_Model" onRequestClose={() => true} />);

    this.setState({
      tax_modal_is_open : false
    }) 
       
  }


  handleClose()
  {
      ModalManager.close(<CreateInvoiceModal modal_id = "invoice_modal" onRequestClose={() => true} />);

        $('#CreateInvoiceModal').modal('hide');    
        var clear = $("#CreateInvoiceModal");
        var clear = $("#value");
        clear.val('');
  }

  handleselectedTaxes(index, id, name)
  {
      this.setState({
            select_value:name,
            selected_id:id,
        })
  }
 
    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close"  aria-label="Close"  onClick={this.handleClose.bind(this)} ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li className="border-line"><b>{translate('invoice_order')}</b></li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
                <div className="modal-footer modal-text-left">

                    <button type="button" id="submituser" className="btn btn-primary"  onClick = {()=>this.props.handleInvoicesubmit()} >{translate('save')}
                    </button>
                    <button type="button" id="delete_close" className="btn btn-default"   onClick={this.handleClose.bind(this)} >{translate('button_close')}
                    </button>     
                </div>
              );
          }

    _renderBody(){

      let result = this.state.result;
        return (
          <div className="row crm-stuff">


        <form id="CreateInvoiceModal1" className="edit-form" action="" method="POST">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                  <div className="bg-primary">
                      <span className="push-left-5">This will follow the rules set in the payment.</span>
                  </div>
                <table className="col-xs-12 col-sm-12 col-md-12 col-lg-12" id="invoicetable">
                  <tbody>
                      <tr>
                          <td id="invoicemain">
                            <b>Invoice Type</b>
                          </td>
                          <td>
                            <input id="invoicetype" name="invoicetype" value="manual" onClick={this.handleManualInvoice.bind(this)} checked={this.state.manual}  type="radio" />
                            <label htmlFor="" >&nbsp;&nbsp;Manual Invoice</label>
                            <br/>
                            <input id="invoicetype" name="invoicetype" value="automatically" onClick={this.handleAutomaticallyInvoice.bind(this)} checked={this.state.automatically}  type="radio" />
                            <label htmlFor=""  >&nbsp;&nbsp;Automatically Invoice</label>
                            <br/>
                          </td>
                      </tr>
                      <tr className="checkbox_email_table">
                          <td></td>
                          <td>
                            <input id="checkbox_email" name="checkbox_email" value="1" checked={this.state.checkbox_email}  type="checkbox" onChange = {this.handleChange} />
                             <label htmlFor="checkbox_email ">
                                 <span className="push-left-5">Send by Mail</span>
                                <span  data-tip data-for={'email_send'}   className="glyphicon glyphicon-info-sign text-primary push-left-2"></span>
                                <ReactTooltip place="top" id={'email_send'}  type="info" effect="float">
                                    <span>Your customer must have a valid email otherwise the email will be not send !</span>
                                </ReactTooltip>
                             </label>
                          </td>
                      </tr>
                  </tbody>
                </table> 
                    <table className="col-xs-12 col-sm-12 col-md-12 col-lg-12" id="invoicetable">
                      <tbody>
                        {this.state.checkbox_email == 1?
                      <div>
                        <span className="text-primary">Invoices will be send by mail 5 days before the due date of each invoice.</span>
                         <br/>
                         <tr>
                          <td> <label className="text-muted control-label" id="emailtemplate">Create & Use Template :</label></td>
                           <td>  
                              {this.state.emailtemplate_dropdown==true?
                                <Dropdown 
                                                    name = 'Use Template'
                                                    inputname                     = 'invoice_email_template'
                                                    module_type                   = {this.props.module_type}
                                                    json_data                     = {this.state.email_template_json}
                                                    input_value                   = {this.state.selected_template} 
                                                    input_id                      = {this.state.selected_template_id}
                                                    setSelected                   = {this.handleselectedEmailTemplate.bind(this)}
                                                    getEmailTemplatemain          = {this.getEmailTemplatemain.bind(this)}
                                                    create_edit                   = {true}
                                                    handleAddEdit                 = {this.handleEmailTemplateAddedit.bind(this)}
                                                    handleClose                   = {this.handleCloseEmailTemplate.bind(this)}/>
                                    
                              :null}
                           </td>            
                          </tr> 
                      </div>
                       
                      :null}
                      </tbody>
                    </table>     
                   <br/>
                    <span className="text-primary">Invoices will be created in draft so that you can review them before validation.</span>
                   <br/>



                    <table className="col-xs-12 col-sm-12 col-md-12 col-lg-12" id="invoicetable">
                          <tbody>
                              <tr className="invoicemanual">
                                 <td id="invoicetd">
                                       <b>{translate('what_do_you_want_to_invoice')}</b>
                                 </td>
                                 <td>
                                      <input id="radioinvoice" name="radioinvoice" value="delivered" onClick={this.handleInvoiceLines.bind(this)} checked={this.state.delivered}  type="radio" />
                                      <label className="push-left-5">{translate('invoiceable_lines')}</label>
                                      <br/>

                                      <input id="radioinvoice" name="radioinvoice" value="percentage" onClick={this.handleDownPaymentPercentage.bind(this)} checked={this.state.percentage} type="radio" />
                                      <label className="push-left-5">{translate('down_payment_percentage')}</label>
                                      <br/>

                                      <input id="radioinvoice" name="radioinvoice" value="fixed" onClick={this.handleDownPaymentFixedAmount.bind(this)} checked={this.state.fixed}  type="radio"/>
                                      <label className="push-left-5">{translate('down_payment_fixed_amount')}</label>
                                     <br/>
                                      <input id="radioinvoice" name="radioinvoice" value="all" onClick={this.handleInvoicelinesDeductPayment.bind(this)} checked={this.state.all}  type="radio" />
                                      <label className="push-left-5">{'Balance'}</label>
                                 </td>
                              </tr>
                              <tr className="valuelabel">
                                    <td id="wordbreakpayment">
                                        <b>Down Payment Amount</b>
                                    </td>
                                    <td>
                                      <input type="text"  name ="value"  placeholder="0.00" value={this.state.value} id="invoicedownpayment"  className="form-group extratd edit-name" onChange = {this.handleChange} />
                                      <span id="perc" className="">%</span>
                                    </td>
                              </tr>
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
                  { this._renderHeader() }
                  <div className="modal-body" style={ModalbodyStyle}>
                    { this._renderBody() }
                  </div>
                  { this._renderfooter() }
                </div>
              </div>
        </Modal>
            
        );
    }
}
module.exports = CreateInvoiceModal;
