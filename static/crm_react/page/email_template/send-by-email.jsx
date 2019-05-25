import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import SelectOption from 'crm_react/component/select-option';
import SelectCustom from 'crm_react/component/select-custom';
import ReactTooltip from 'react-tooltip'
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import 'react-quill/dist/quill.snow.css'; // ES6
import CustomEditor from 'crm_react/page/email_template/custom-editor';
import TemplateEmail from 'crm_react/page/email_template/email-template';
import Dropzone from  'react-dropzone'
const request = require('superagent');
import { ToastContainer, toast } from 'react-toastify';

class SendByEmail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            processing:false,
            attachements: [],
            internal_recipients: [],
            external_recipients: [],
            subject: null,
            template_name: null,
            template_id:null,
            templates:[],
            template_result:{},
            editor_txt:null,
            module:this.props.module

        };

        this.serverRequest = $.get('/quotation/default-template/'+this.props.module+'/', function (data) {
            let template_result = {'template_id':data.result.id, 'module':this.props.module, 'editor_txt':data.result.description, 'subject':data.result.subject,'template_name':data.result.name};
            this.setState({template_id:data.result.id,
                editor_txt:data.result.description,
                subject:data.result.subject,
                template_name:data.result.name,
                template_result:template_result,
                attachements:data.result.attachment.length > 0 ? data.result.attachment : []
            });
        }.bind(this));
    }


    set_external_recipients(recipients) {
        if (recipients.length > 0) {
            this.setState({external_recipients: recipients})
        }
    }

    set_internal_recipients(recipients) {
        if (recipients.length > 0) {
            this.setState({internal_recipients: recipients})
        }
    }

    set_contact() {
        let customer = [];
        return customer
    }

    handle_close() {
        ModalManager.close(<SendByEmail modal_id="send-email" onRequestClose={() => true}/>);
    }

    select_template(index){
        let templates =  this.state.templates;
        if(templates.length > 0){
            let template_result={'template_id':templates[index].id, 'module':this.props.module, 'subject':templates[index].subject, 'template_name':templates[index].name, 'editor_txt':templates[index].description};
            this.setState({template_result:template_result})
        }
    }


    handle_click_div() {
        $.ajax({
            type: "POST",
            cache: false,
            url: '/quotation/getEmailTemplate/'+this.props.module+'/',
            data: {
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({loading: true});
            }.bind(this),
            success: function (data) {
                if (data.success) {
                    this.setState({
                        templates: data.email_template_json,
                        drop_down_class: 'dropdown autocomplete open'
                    });
                } else {
                    this.setState({
                        templates: [],
                        drop_down_class: 'dropdown autocomplete open'
                    });
                }
            }.bind(this)
        });
    }

    handle_change_subject(event){
        let templates = this.state.template_result;
        templates.subject = event.target.value
        this.setState({template_result:templates})
    }

    handle_change_template_name(event){
        let templates = this.state.template_result;
        templates.template_name = event.target.value;
        this.setState({template_name :event.target.value,template_result:templates})
    }

    get_editor_txt(editor_txt){
        let templates = this.state.template_result;
        templates.editor_txt= editor_txt;
        this.setState({editor_txt: editor_txt,template_result:templates})
    }

    set_email_template(template_result){
        this.setState({template_result:template_result});
        toast.success("Template Saved", {position: toast.POSITION.TOP_RIGHT, toastId: "save_template"});
    }

    edit_template(template_id){
        ModalManager.open(
            <TemplateEmail
                    module={this.props.module}
                    template_result={this.state.template_result}
                    title = {'Send Email'}
                    modal_id = "email-template"
                    set_email_template={this.set_email_template.bind(this)}
                    onRequestClose={() => true}
            >
            </TemplateEmail>
        );
    }

    save_as_template(){
       let templates = this.state.template_result;
       console.log("save here", templates)
       let template={'subject':templates.subject, 'module':this.props.module,
       'template_name':templates.template_name, 'editor_txt':templates.editor_txt};

        $.ajax({
            type: "POST",
            cache: false,
            url: '/quotation/saveEmailtemplate/',
            data: {
                  ajax: true,
                  fields:JSON.stringify(template),
                  csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success == true){
                    toast.success(data.msg, {position: toast.POSITION.TOP_RIGHT, toastId: "save_as_template"});
                }else {
                    toast.error(data.msg, {position: toast.POSITION.TOP_RIGHT, toastId: "save_as_template"});
                }
            }.bind(this)
        });
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
                    let attachements = this.state.attachements;
                    attachements.push(obj.file_data);
                    this.setState({ attachements:attachements, processing: false});
                    toast.success('File Uploaded!', {position: toast.POSITION.TOP_RIGHT, toastId: "on_dop"});
                  }
              });
          }
    }

    remove_file(index){
        let attachements = this.state.attachements;
        if(attachements.length > 0){
            let remove_file = attachements[index];
            attachements.splice(index, 1);
            this.setState({ attachements:attachements});
        }
    }

    handle_submit(){
        if (this.props.module == 'CustomerInvoice'){
           var pdf_url =  '/htmin/'+this.props.print_url+'/';
        }else{
            var pdf_url =  '/htm/'+this.props.print_url+'/';
        }

        let internal_recipients =this.state.internal_recipients;
        let external_recipients = this.state.external_recipients;

        let Data = {    'attachements':this.state.attachements,
                        'pdf_url':this.props.print_url,
                        'encr_url':this.props.q_id,
                        'quotation_id':this.props.q_id,
                        'internal_recipients':internal_recipients,
                        'external_recipients':external_recipients,
                        'subject':this.state.template_result.subject,
                        'content':this.state.template_result.editor_txt,
                        'module_type':this.props.module,
                    };
        if(external_recipients.length > 0 || internal_recipients.length > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/quotation/sendQuoteEmail/',
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
                        this.handle_close()
                    }
                }.bind(this)
            });
        }else{
            toast.error("No recipients!!", {position: toast.POSITION.TOP_RIGHT, toastId: "send_email"});
        }
    }

    render_body() {
        console.log("attchment", this.state.attachements)
        return (
            <div>
                <form id="qout_email_form" className="edit-form" action="" method="POST" encType='multipart/form-data'>
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                            <table className="detail_table">
                                <tbody>
                                <tr>
                                    <td><label className="control-label">Select recipients</label></td>
                                    <td>
                                        <SelectOption set_recipients={this.set_internal_recipients.bind(this)}/>
                                    </td>
                                </tr>
                                <br/>
                                <tr>
                                    <td><label className="control-label">OR Enter Recipients Email</label></td>
                                    <td>
                                        <SelectCustom customer={this.set_contact()}
                                                      set_recipients={this.set_external_recipients.bind(this)}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td><label className="control-label">{translate('subject')}</label></td>
                                    <td>
                                        <div className="form-group">
                                            <input value={this.state.template_result.subject} type="text" name='subject'
                                                   className="form-control" placeholder={translate('subject')}
                                                   onChange={this.handle_change_subject.bind(this)}
                                                   />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><label className="control-label">{'Template Name'}</label></td>
                                    <td>
                                        <div className="form-group">
                                            <input value={this.state.template_result.template_name} type="text" name='template_name'
                                                   className="form-control" placeholder={'Template Name'} onChange={this.handle_change_template_name.bind(this)}/>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <label className="control-label">Select & Edit Template
                                            <span data-tip data-for='create_and_use_info'
                                                  className="glyphicon glyphicon-info-sign text-primary push-left-2"></span>
                                            <ReactTooltip place="top" id='create_and_use_info' type="info"
                                                          effect="float">
                                              <span>
                                                  We recommend you to name your Template correctly. To change name of a Template, you have to open it with the following icon :
                                                  <i className="fa fa-external-link push-left-2"></i>
                                              </span>
                                            </ReactTooltip>
                                        </label>
                                    </td>
                                    <td>
                                        <div className="form-group">
                                            <div className="dropdown autocomplete">
                                                <input type="text"
                                                       autoComplete="off"
                                                       value={this.state.template_result.template_name}
                                                       onChange={this.handle_change_template_name.bind(this)}
                                                       className="form-control"
                                                       data-toggle="dropdown"
                                                       onClick={this.handle_click_div.bind(this)}
                                                />
                                                {this.state.template_id > 0 ?
                                                <span className="detailed_popup">
                                                    <i className="fa fa-external-link" onClick={this.edit_template.bind(this, this.state.template_id)}></i>
                                                </span>
                                                :null
                                                }
                                                <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown" onClick={this.handle_click_div.bind(this)}>
                                                    <i id="main_form_tags_down_icon" className="fa fa-angle-down black"></i>
                                                </span>
                                                <div className="dd-options">
                                                    <ul className="options-list">
                                                    {   this.state.templates ?
                                                            this.state.templates.map((item, t) =>{
                                                             if(t <= 10)
                                                                return <li key={'_template_'+t}  onClick={this.select_template.bind(this,t)} >{item.name}</li>
                                                            })
                                                        : null
                                                    }
                                                        <li data-action="create-edit">
                                                            <em>Create and Edit</em>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <div>
                                             <span>
                                                 <h4>Use below keywords to customize the email.
                                                   <span data-tip data-for='keyword'
                                                         className="glyphicon glyphicon-info-sign text-primary push-left-2"></span>
                                                   <ReactTooltip place="top" id='keyword' type="info" effect="float">
                                                      <span>Click  below variable and use into editor.</span>
                                                   </ReactTooltip>
                                                </h4>
                                                 <p>
                                                     <span className="push-left-10">First Name:</span><span>[FirstName]</span>,
                                                     <span className="push-left-10">Last Name:</span><span>[LastName]</span>,
                                                     <span className="push-left-10">Company Name:</span><span>[CompanyName]</span>,
                                                     {this.state.module !== 'contact'?
                                                     <span><span className="push-left-10">Quotation Name/Invoice Number:</span><span>[qname]</span>,</span>
                                                     :null
                                                     }
                                                 </p>
                                                 {this.state.module !== 'contact'?
                                                 <p>
                                                     <span className="push-left-10">Total Amount:</span><span>[tamount]</span>,
                                                     <span className="push-left-10">View Document Online:</span><span>[url]</span>,
                                                     <span className="push-left-10">Due Date:</span><span>[duedate]</span>
                                                 </p>
                                                 :null
                                                 }
                                             </span>
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            {this.state.template_result.editor_txt ?
                                <CustomEditor
                                    toolbar_id={'toolbar1'}
                                    editor_txt={this.state.template_result.editor_txt || '' }
                                    get_editor_txt={this.get_editor_txt.bind(this)}
                                    module={this.state.module}
                                    use_custom_button ={true}
                                />
                                :null
                            }
                            <br/>
                            {this.state.attachements.length > 0 ?
                                <div className="attachements">
                                    <div className="row">
                                    {this.state.attachements.length > 0 ?
                                        this.state.attachements.map((file, i) =>{
                                            return(
                                                <div className="col-xs-4 col-sm-3 col-md-2 col-lg-2" key={'attact__'+i}>
                                                    <div className="thumbnail no-border">
                                                        <a href="javascript:" className="remove" title="remove this file" onClick={this.remove_file.bind(this,i)}>
                                                            <i className="remove-icon-sprite"></i>
                                                        </a>
                                                        <a title={file.file_name} target="_blank" href={file.file_path}>
                                                            <img src="/static/front/images/document-flat.png" className="img-responsive" />
                                                        </a>
                                                        <p className="caption text-center" style={{'marginTop':'10px'}}>{file.file_name}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    :null
                                    }
                                    </div>
                                </div>
                            :null
                            }
                            <div className="o_hidden_input_file ufile">
                                  <div id="loader-icon">
                                    <i className="fa fa-spinner fa-spin"  width="50" height="50"></i>
                                  </div>
                                <div className="add-new-product">
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
        const {field, onRequestClose, title, modal_id, form_id} = this.props;
        return (
            <Modal
                style={modal_style}
                onRequestClose={onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close" type="button" onClick={this.handle_close.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body" style={ModalbodyStyle}>
                        { this.render_body() }
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default pull-left" type="button"
                                    onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                            <button className="btn btn-primary pull-left" type="button" onClick={this.handle_submit.bind(this)}>{'Send'}</button>
                            <button type="button" name="save_as_template" className="btn btn-sm pull-right btn-default save_as_template" onClick={this.save_as_template.bind(this)}>
                                <i className="fa fa-fw o_button_icon fa-lg fa-save"></i>
                            <span><b>SAVE AS NEW TEMPLATE</b></span></button>
                        </div>
                    </div>
                </div>
                <LoadingOverlay processing={this.state.processing}/>
                <ToastContainer />
            </Modal>
        );
    }
}


module.exports = SendByEmail;