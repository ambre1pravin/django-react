import React from 'react';
import {translate} from 'crm_react/common/language';
import EmailTemplate from 'crm_react/page/quotation/email_template';
import DjangoCSRFToken from 'django-react-csrftoken';
import { NotificationManager} from 'react-notifications';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import Dropdown from 'crm_react/component/Dropdown';
import SelectOption from 'crm_react/component/select-option';
import SelectCustom from 'crm_react/component/select-custom';
import ReactTooltip from 'react-tooltip'
import LoadingOverlay  from 'crm_react/common/loading-overlay';

import Dropzone from  'react-dropzone'
const request = require('superagent');

class  EmailSendModal extends React.Component {
	constructor(props) {   
        super(props);

  
        this.state = {
            attachements            : [],
            title                   : this.props.title,
            customer                : [],
            recipients_dropdown     : false,
            recipients_json         : this.props.result_contact,
            customerdata            : this.props.customerdata,
            maindt                  : this.props.maindt,
            reminder                : this.props.reminder,
            subject                 : '',
            email_content           : '',
            emailtemplate_dropdown  : true,
            active                  : false,
            qout_email_Model        : 'open', 
            email_template_json     : [],
            select_value            : 'Sales Order - Send by Email',
            select_id               : 1,
            selected_template       : '',
            selected_template_id    : '',
            Emailtemplate_Modal     : 'close',
            desc                    : '',
            quot_id                 : this.props.id,
            onRequestClose          : this.props.onRequestClose,
            image_path              : [],
            processing              : false,
            template_name           : '',
            internal_recipients     : [],
            external_recipients     : [],

        };

        var customerdata = this.props.customerdata;
        var maindt       = this.props.maindt;
        this.handleModelChange = this.handleModelChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.emailViewdata = this.emailViewdata.bind(this);
        this.openEmailModalWithData = this.openEmailModalWithData.bind(this) 
 
    }

    componentDidMount(){
        var quot_id      = this.props.id;
        var customerdata = this.props.customerdata;
        var maindt       = this.props.maindt;
        this.openEmailModalWithData(customerdata,maindt);
        this.emailViewdata(quot_id);
    }

    onDrop(accepted, rejected) {

          const req = request.post('/quotation/upload_file/');
          if (accepted.length > 0 ){
              this.setState({processing : true});
              accepted.forEach(file => {
                  req.attach('image', file);
              });
              req.set('csrfmiddlewaretoken', getCookie('csrftoken'))
              req.end((err, res) => {
                  var obj = JSON.parse(res.text);
                  if(obj.success){
                    var attachements = this.state.attachements;
                    attachements.push(obj.file_data);
                    this.setState({ attachements:attachements, processing: false});
                    NotificationManager.success('File Uploaded!', 'Success message',5000);
                  }
              });
          }
    }

    getEmailTemplatemain(){
        $.ajax({
                type: "POST",
                cache: false,
                async : false,
                url: '/quotation/getEmailTemplate/'+ this.props.module_type+"/",
                data: {
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({processing : true})
                }.bind(this),
                success: function (data) {
                    if(data.success == true){
                        this.setState({
                            processing : false,
                            selected_template:data.name,
                            selected_template_id:data.id,
                            emailtemplate_dropdown:true,
                            email_template_json: data.email_template_json,
                        });
                    }
                }.bind(this)
        });
    }

    emailViewdata(id){
        this.setState({processing : true});
        if (this.props.module_type != 'CustomerInvoice'){
            this.serverRequest = $.get('/quotation/viewdata/'+ id +'/', function (data) {
            this.setState({
                    processing : false,
                    result                 : data,
                    qout_status            : data.quotation!==undefined && data.quotation.status!=null ? data.quotation.status : '' ,
                    quotation              : data.quotation!==undefined ? data.quotation : null,
                    quotationID            : data.quotation.id,
                    name                   : data.quotation.name,
                    userId                 : data.quotation.user_id,
                    items                  : data.quotation.products!==undefined && data.quotation.products.length>0 ? data.quotation.products : [],
                    optional_items         : data.quotation.optional_products!==undefined && data.quotation.optional_products.length>0 ? data.quotation.optional_products    : [],
                    quot_id                : id,
                    selected_customer_id   : data.quotation!==undefined && data.quotation.customer_id!=null ? data.quotation.customer_id : ''  ,
                    selected_customer_name : data.quotation!==undefined && data.quotation.customer_name!=null ? data.quotation.customer_name : '' ,
                });

            }.bind(this));
        }else{
             this.serverRequest = $.get('/customer/invoice/viewdata/'+id +'/', function (data) {
             if(data.success==true){

                this.setState({
                    processing : false,
                    result                 : data,
                    Invoicing              : data.Invoicing!==undefined ? data.Invoicing : null,
                    selected_customer_id   : data.Invoicing!==undefined && data.Invoicing.customer_id!=null ? data.Invoicing.customer_id : ''  ,
                    selected_customer_name : data.Invoicing!==undefined && data.Invoicing.customer_name!=null ? data.Invoicing.customer_name : '' ,
                    items                  : data.Invoicing.products!==undefined && data.Invoicing.products.length>0 ? data.Invoicing.products : [],
                    invoice_status         : data.Invoicing.invoice_status,
                    status_invoice         : data.Invoicing.status,
                    name                   : data.Invoicing.name,
                    invoice_date           : data.Invoicing.invoice_date,
                    due_date               : data.Invoicing.due_date,
                    sales_person           : data.Invoicing.sales_person,
                    quotation_id           : data.Invoicing.quotation_id,
                    quotation_name         : data.Invoicing.quotation_name,
                    total_amount           : data.Invoicing.total_amount,
                    subtotal_amount        : data.Invoicing.subtotal_amount,
                    amount_due             : data.Invoicing.amount_due,
                    paid_amount            : data.Invoicing.paid_amount,
                    tax_amount             : data.Invoicing.tax_amount,
                    invoice_id             : id,
                    payment_term_days      : data.Invoicing.payment_term_days,
                    Taxes                  : data.Invoicing.Taxes,
                    payment                : data.Invoicing.payment!==undefined && data.Invoicing.payment.length>0 ? data.Invoicing.payment : [],
                });
          }
        }.bind(this));
     }
    }


    openEmailModalWithData(customer, maindt){
        var clear = $(".intro").html('');
        $('.summernote').summernote({height: 200});
        var recipients_json  = [];
        var email_template_json  = []; 
        var current_customer = [customer];
        var customer= customer.name;
        var tamount = maindt.total_amount;
        var module_type = this.props.module_type;
        if (module_type == 'CustomerInvoice'){
            var qname =  maindt.qname;
            var due_date = maindt.due_date;
        }else{
            var qname =  maindt.qname;
            var due_date = maindt.due_date;
        }
        this.setState({customer: current_customer, recipients_dropdown : true,});
        $.ajax({
            type: "POST",
            cache: false,
            url:  '/quotation/getEmailTemplate/'+ module_type+'/',
            data: {
                module_type:this.props.module_type,
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({processing : true})
            }.bind(this),
            success: function (data) {
                if (data.email_template_length!=0 && data.email_template_length !=null) {
                    if(data.success == true){
                       if (module_type == 'quotation' || module_type == 'sales_order'){
                           var pdf_url= '/htm/'+this.props.url + '/quotation/';
                           var view_center =  '<div style="margin-top:30px;text-align:center;"><center style="color: rgb(0, 0, 0); font-family: Roboto; font-size: medium;"><a href=[pdf_url] style="color:#fff;text-decoration:none;border-radius:5px;background-color:#229ee6;border-top:10px solid #229ee6;border-bottom:10px solid #229ee6;border-right:15px solid #229ee6;border-left:15px solid #229ee6;display:inline-block" href="" target="_blank">View Document Online</a></center></div>';
                       }else if (module_type == 'CustomerInvoice'){
                           var pdf_url= '/htmin/'+this.props.url + '/';
                           var view_center = '<div style="margin-top:30px;text-align:center;"><center style="color: rgb(0, 0, 0); font-family: Roboto; font-size: medium;"><a href=[pdf_url] style="color:#fff;text-decoration:none;border-radius:5px;background-color:#229ee6;border-top:10px solid #229ee6;border-bottom:10px solid #229ee6;border-right:15px solid #229ee6;border-left:15px solid #229ee6;display:inline-block" href="" target="_blank">View Invoice Online</a></center></div>';
                       }
                       var subject = data.subject.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount).replace('[duedate]',due_date);
                       var des = data.description.replace('[url]', pdf_url);
                       var view_center1 = view_center.replace('[pdf_url]', pdf_url);
                       var txtEditor = des.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount).replace('[url]',pdf_url).replace('[duedate]',due_date);
                       this.setState({
                                selected_template           : data.name,
                                selected_template_id        : data.id,
                                subject                     : subject,
                                template_name               : subject,
                                description                 : $('.summernote').code(txtEditor),
                                emailtemplate_dropdown      : true,
                                email_template_json         : data.email_template_json,
                                customer                    : current_customer,
                                recipients_dropdown         : true,
                                image_path                  : data.image_path,
                                processing                  : false,
                       });
                    }
                }
                this.setState({processing : false})
            }.bind(this)
        });
    }


    handleSubmitTemplate() {
        var form = $('#qout_email_form');
        let txtEditor = $('.summernote').code();
        let subject = $('#subject').val();
        let module_type = this.props.module_type;
        var attachements =  $('.attached_file1');
        var upload_arr = []
        attachements.each(function(index, element){
            upload_arr.push(element.getAttribute('data-action-id'));
        });
        if(this.state.template_name !='') {
            var Data = {
                'attachements': upload_arr,
                'name': subject,
                'module_type': module_type,
                'template_name': this.state.template_name,
                'subject': subject,
                'content': txtEditor
            };
            $.ajax({
                type: "POST",
                cache: false,
                url: '/quotation/saveEmailtemplate/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(Data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({processing: true})
                }.bind(this),
                success: function (data) {
                    if (data.success == true) {
                        this.setState({
                            emailtemplate_dropdown: true,
                            subject: data.subject,
                            editor: $('.summernote').code(data.description),
                            selected_template: data.name,
                            template_name: data.name,
                            selected_template_id: data.id,
                            processing: false
                        });
                        NotificationManager.success('Email Template Successfully Create!', 'Success message', 5000);
                        this.getEmailTemplatemain();
                        this.handleselectedEmailTemplate(data.id, data.name);
                    }

                    console.log("template name is ", this.state.template_name, this.state.selected_template)
                }.bind(this)
            });
        }else{
            NotificationManager.error('Template Name is required.', 'Error message', 5000);
        }
    }

    reminder(){
        var Data = {'quotationID':this.props.quotationID ,'template_id':this.state.selected_template_id};
        $.ajax({
                type: "POST",
                cache: false,
                url: '/quotation/sendEmailDate/',
                data: {
                  ajax: true,
                  fields:JSON.stringify(Data),
                  csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if(data.success == true){

                    }
                }.bind(this)
        })
    }

    set_external_recipients(recipients){
        if(recipients.length > 0){
            this.setState({external_recipients:recipients})
        }
    }

    set_internal_recipients(recipients){
        if(recipients.length > 0){
            this.setState({internal_recipients:recipients})
        }
    }

handleSubmit(){
        var tamount = this.props.total_amount;
        var qname = this.props.qname;
        var customer = this.props.customer;
        $('.summernote').summernote({height: 200});
        var form = $('#qout_email_form');
        let attachment = $('#attachment').attr('href');
        var sub = $('#subject').val();
        var subject = sub.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount);
        var des =  $('.summernote').code();
        var txtEditor = des.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount);
        let internal_recipients = this.state.internal_recipients;
        let external_recipients = this.state.external_recipients;
        let attachements = this.state.attachements;
        var quotationID = this.props.quotationID;
        var module_type = this.props.module_type;
        var encr_url = this.props.url;
        var module_type = module_type
        if (module_type == 'CustomerInvoice'){
           var pdf_url =  '/htmin/'+this.props.url+'/';
           var url     =  '/quotation/sendQuoteEmail/'
        }else{
            var pdf_url =  '/htm/'+this.props.url+'/';
            var url     =  '/quotation/sendQuoteEmail/'
        }
        var Data = {    'attachements':attachements,
                        'qname':qname,
                        'customer':customer,
                        'pdf_url':pdf_url,
                        'encr_url':encr_url,
                        'quotationID':quotationID,
                        'internal_recipients':internal_recipients,
                        'external_recipients':external_recipients,
                        'subject':subject,
                        'content':txtEditor,
                        'module_type':module_type,
                        'attachment':attachment
                    }
        if(external_recipients.length > 0 || internal_recipients.length > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: url,
                data: {
                    ajax: true,
                    fields: JSON.stringify(Data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({processing: true})
                }.bind(this),
                success: function (data) {
                    if (data.success == true) {
                        this.setState({processing: false});
                        $('#qout_email_Model').modal('hide');
                        this.props.handleQuotSend();
                        this.props.handleClose();
                        this.props.handleNotification();
                        this.reminder();
                    }
                }.bind(this)
            });
        }else{
            alert("No recipients!!")
        }
    }



    handleChange(event) {
        var name = event.target.id;
        var value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.setState({
            [name]: value,
        });

    }

    change_template_name(event){
        this.setState({template_name :event.target.value})
    }

    handleRemoveTr(){

        $('#oe_attachment').hide();  
    }

    handleClose(){
         ModalManager.close(<EmailSendModal modal_id = "email_modal" onRequestClose={() => true} />);
    }

  handleCloseTemplate(){

    ModalManager.close(<EmailTemplate modal_id = "email_template_modal" onRequestClose={() => true} />)
    var customerdata = this.props.customerdata;
    var maindt       = this.props.maindt;
    this.openEmailModalWithData(customerdata,maindt)
  }

  onEditorStateChange(editorState) {
    this.setState({ editorState : editorState,});
  };

  handleModelChange(model) {
    this.setState({model: model});
  }


  handleselectedEmailTemplate(id,name){
           var tamount     = this.props.total_amount;
           var qname       = this.props.qname;
           var customer    = this.props.customer;
           var module_type = this.props.module_type;
           var due_date     = this.props.due_date;
           $.ajax({
                type: "POST",
                cache: false,
                async : false,
                url:  '/quotation/getEmailTemplateData/'+id,
                data: {
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if(data.success == true){
                        if (module_type == 'quotation'){
                            var pdf_url = '/htm/' + this.props.url + '/';
                            var view_center =  '<div style="margin-top:30px;text-align:center;">';
                                view_center += '<center style="color: rgb(0, 0, 0); font-family: Roboto; font-size: medium;">'
                                view_center += '<a href=[pdf_url]  target="_blank" style="color:#fff;text-decoration:none;border-radius:5px;background-color:#229ee6;border-top:10px solid #229ee6;border-bottom:10px solid #229ee6;border-right:15px solid #229ee6;border-left:15px solid #229ee6;display:inline-block">View quotation onlineww</a>';
                                view_center += '</center></div>';
                        }else if (module_type == 'CustomerInvoice') {
                                var pdf_url=  '/htmin/' + this.props.url + '/';
                                var view_center =  '<div style="margin-top:30px;text-align:center;"><center style="color: rgb(0, 0, 0); font-family: Roboto; font-size: medium;">'
                                view_center += '<a href=[pdf_url] style="color:#fff;text-decoration:none;border-radius:5px;background-color:#229ee6;border-top:10px solid #229ee6;border-bottom:10px solid #229ee6;border-right:15px solid #229ee6;border-left:15px solid #229ee6;display:inline-block" href="" target="_blank">View quotation onlinwwe</a>';
                                view_center += '</center></div>';
                        }
                        var subject = data.subject.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount).replace('[duedate]',due_date);
                        var des = data.description;
                        var view_center1 = view_center.replace('[pdf_url]', pdf_url);
                        var txtEditor = des.replace('[qname]', qname).replace('[customers]',customer).replace('[tamount]',tamount).replace('[url]',view_center1).replace('[duedate]',due_date);
                        var image_path = data.image_path;
                        let template_name = this.state.template_name;
                        this.setState({
                            emailtemplate_dropdown  :true,
                            subject                 : subject,
                            template_name           : template_name,
                            editor                  : $('.summernote').code(txtEditor),
                            selected_template       : name,
                            selected_template_id    : id,
                            image_path              : image_path,
                        });
                    }
                }.bind(this)
            });
  }

  handleopen(){
    this.props.openEmailModal();
  }


    handleEmailTemplateAddedit(id,input_value){
           if(this.props.url!='' && this.props.id) {
               ModalManager.open(
                   <EmailTemplate
                        title="Next CRM"
                        ids={id}
                        quot_id={this.props.id}
                        url={this.props.url}
                        input_value={input_value}
                        customer={this.props.customer}
                        name={this.state.name}
                        total_amount={this.props.total_amount}
                        getEmailTemplatemain={this.getEmailTemplatemain.bind(this)}
                        handleopen={this.handleopen.bind(this)}
                        handleselectedEmailTemplate={this.handleselectedEmailTemplate.bind(this)}
                        handleCloseTemplate={this.handleCloseTemplate.bind(this)}
                        onRequestClose={() => true}
                        modal_id="email_template_modal"
                        module_type={this.props.module_type}>
                   </EmailTemplate>
               );
           }
    }


    _renderHeader(title){
        return(
                <div className="modal-header text-left" id="headerhide">

                    <button type="button" className="close" onClick={this.handleClose.bind(this)} aria-label="Close"   ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li className="border-line">{this.state.title}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left" id="footerhide">
                <button type="button" id="" className="btn btn-primary pull-left" onClick={this.handleSubmit.bind(this)}>
                    {translate('button_send')}
                </button>
                <button type="button" id="" className="btn btn-default pull-left"  onClick={this.handleClose.bind(this)}>
                    {translate('cancel')}
                </button>
                <button type="button" name="save_as_template" className="btn btn-sm pull-right btn-default save_as_template" onClick={this.handleSubmitTemplate.bind(this)}>
                    <i className="fa fa-fw o_button_icon fa-lg fa-save"></i>
                <span><b>SAVE AS NEW TEMPLATE</b></span></button>
            </div>
        );
    }

    set_contact(){
        let customer = [];
        /*
        let result_contact = this.props.result_contact.contact;
        if(result_contact.length > 0){
           for(var i=0 ; i < result_contact.length; i++){
               customer.push({'value':result_contact[i].name, 'label':result_contact[i].name});
           }
        }
        */
        return customer
    }

    _renderBody(){
        console.log("cc", this.props.result_contact);
        let quotation      = this.state.quotation;
        let subject = this.state.subject;
        let image_path = this.state.image_path;
        return (
            <div>
                <form id="qout_email_form" className="edit-form" action="" method="POST" encType='multipart/form-data'>
                <DjangoCSRFToken/>
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                            <table className="detail_table">
                                <tbody>
                                <tr>
                                   <td><label className="control-label">Select recipients</label></td>
                                    <td>
                                        <SelectOption set_recipients={this.set_internal_recipients.bind(this)}/>
                                    </td>
                                 </tr><br/>
                                 <tr>
                                   <td><label className="control-label">OR Enter Recipients Email</label></td>
                                    <td>
                                        <SelectCustom customer={this.set_contact()} set_recipients={this.set_external_recipients.bind(this)}/>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td><label className="control-label">{translate('subject')}</label></td>
                                    <td>
                                        <div className="form-group">
                                         <input value = {this.state.subject}  id="subject" type="text" name='subject'
                                          className="form-control" placeholder={translate('subject')}  onChange={this.handleChange} />
                                        </div>
                                    </td>
                                 </tr>
                                 <tr>
                                    <td><label className="control-label">{'Template Name'}</label></td>
                                    <td>
                                        <div className="form-group">
                                         <input value = {this.state.template_name}  type="text" name='template_name'
                                         className="form-control" placeholder={'Template Name'} onChange={this.change_template_name.bind(this)}/>
                                        </div>
                                    </td>
                                 </tr>
                                 {this.state.emailtemplate_dropdown == true ?
                                   <tr>
                                       <td>
                                          <label className="control-label">Select & Edit Template
                                           <span  data-tip data-for='create_and_use_info'   className="glyphicon glyphicon-info-sign text-primary push-left-2"></span>
                                           <ReactTooltip place="top"  id='create_and_use_info' type="info" effect="float">
                                              <span>
                                                  We recommend you to name your Template correctly. To change name of a Template, you have to open it with the following icon :
                                                  <i className="fa fa-external-link push-left-2"></i>
                                              </span>
                                            </ReactTooltip>
                                           </label>
                                       </td>
                                       <td>
                                            <Dropdown
                                                name = 'Use Template'
                                                inputname                     = 'email_template'
                                                module_type                   = {this.props.module_type}
                                                json_data                     = {this.state.email_template_json}
                                                input_value                   = {this.state.selected_template}
                                                input_id                      = {this.state.selected_template_id}
                                                setSelected                   = {this.handleselectedEmailTemplate.bind(this)}
                                                getEmailTemplatemain          = {this.getEmailTemplatemain.bind(this)}
                                                create_edit                   = {true}
                                                handleAddEdit                 = {this.handleEmailTemplateAddedit.bind(this)}
                                                handleClose                   = {this.handleClose.bind(this)}
                                                set_recipients                = {this.set_internal_recipients.bind(this)}
                                            />
                                       </td>
                                      </tr>
                                   :null
                                 }
                                 <tr>
                                     <td colSpan="2">
                                         <div>
                                             <span>
                                                 <h4>Use below keywords to customize the email.
                                                   <span  data-tip data-for='keyword'   className="glyphicon glyphicon-info-sign text-primary push-left-2"></span>
                                                   <ReactTooltip place="top"  id='keyword' type="info" effect="float">
                                                      <span>Copy  below variable and paste into editor.</span>
                                                   </ReactTooltip>
                                                </h4>
                                                 <span className ="push-left-10">Customer Name:</span><span className ="push-left-10">[customers]</span>
                                                 <span className ="push-left-10">Quotation Name / Invoice Number:</span><span className ="push-left-10">[qname]</span>
                                                 <span className ="push-left-10">Total Amount:</span><span className ="push-left-10">[tamount]</span>
                                                 <span className ="push-left-10">View Document Online:</span><span className ="push-left-10">[url]</span>
                                             </span>
                                         </div>
                                     </td>
                                 </tr>
                                 {this.props.module_type =='CustomerInvoice'?
                                     <tr>
                                        <td><label className="control-label">Due Date</label></td>
                                        <td>
                                            <div className="form-group">
                                             {this.props.due_date}
                                            </div>
                                        </td>
                                     </tr>
                                 :null
                                }
                                </tbody>
                            </table> 
                            <br/>
                            <textarea className="summernote"  value={this.state.editor}>{this.state.editor}</textarea>
                            <br/>
                            <div className="panel panel-default">
                                <div className="row">
                                    <div>
                                          {this.state.attachements.length > 0 ?
                                                this.state.attachements.map((file, i) =>{
                                                    return <div key={'attact_'+i} className="col-xs-12 col-ms-6 col-sm-4 col-md-3 col-lg-3">
                                                            <div className="media">
                                                                <div className="media-left" style={{'paddingRight':'0px'}}>
                                                                    <img src={file.src} height={'100'} />
                                                                </div>
                                                                <div className="media-body media-middle">
                                                                    <a target="_blank" href={file.file_path}>
                                                                        <h4>{file.file_name}</h4>
                                                                    </a>
                                                                    <div className="h4"></div>
                                                                </div>
                                                            </div>
                                                            <a className="remove-icon-sprite subcontact_cross" onClick={this.handleRemoveTr.bind(this)}></a>
                                                        </div>
                                            })
                                            : null
                                          }
                                     </div>
                                </div>
                            </div>
                                <div className="o_hidden_input_file ufile">
                                  <div id="loader-icon">
                                    <i className="fa fa-spinner fa-spin"  width="50" height="50"></i>
                                  </div>
                                <div>
                                <Dropzone style={{width:'100px',height:'100px'}} onDrop={this.onDrop.bind(this)} >
                                     <a className="btn btn-new new-sub-contact" href="javascript:">Upload File</a>
                                </Dropzone>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    render() {
        const { onRequestClose, title, modal_id} = this.props;
        return (
           <Modal
               style={modal_style}
               onRequestClose={onRequestClose}
               effect={Effect.Fall}>
                 <div className="modal-dialog modal-lg sub-contact module__contact module__contact-create in" id="">
                    <div className="modal-content">
                        { this._renderHeader() }
                        <div className="modal-body" style={ModalbodyStyle}>
                            { this._renderBody() }
                        </div>
                      { this._renderfooter() }
                    </div>
                    <LoadingOverlay processing={this.state.processing}/>
                 </div>
           </Modal>
        );
    }
}


module.exports = EmailSendModal;