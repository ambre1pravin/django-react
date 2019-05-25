import React from 'react';
import ReactTooltip from 'react-tooltip'
import { Link, browserHistory } from 'react-router'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import CustomEditor from 'crm_react/page/email_template/custom-editor';
import Dropzone from  'react-dropzone'
const request = require('superagent');
import {translate} from 'crm_react/common/language';
import { ToastContainer, toast } from 'react-toastify';


class  EmailTemplateAdd extends React.Component {

    constructor(props) {
        super(props);
          this.state = {
                template_result:{'template_name':null,'subject':null},
                editor_txt:'',
                module_name:null,
                attachements: [],
          }
    }


    get_editor_txt(editor_txt){
        let templates = this.state.template_result;
        templates.editor_txt= editor_txt;
        this.setState({editor_txt: editor_txt,template_result:templates})
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

    select_module(module_name){
        this.setState({module_name :module_name})
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
            console.log("remove_file", remove_file);
            $.ajax({
                type: "POST",
                cache: false,
                url: '/quotation/remove-email-file/',
                data: {
                      ajax: true,
                      fields:JSON.stringify(remove_file),
                      csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if(data.success == true){
                        attachements.splice(index, 1);
                        this.setState({ attachements:attachements});
                    }
                }.bind(this)
            });
        }
    }

    handleSubmit(){
       let templates = this.state.template_result;
       let template={'subject':templates.subject, 'module':this.state.module_name,
       'template_name':templates.template_name, 'editor_txt':templates.editor_txt, 'attachements':this.state.attachements};
       if((templates.subject!='' || templates.subject == null) &&  (templates.template_name!=null) && (this.state.module_name!=null)){
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
                        browserHistory.push("/email/template/list/");
                    }else {
                        toast.error(data.msg, {position: toast.POSITION.TOP_RIGHT, toastId: "save_as_template"});
                    }
                }.bind(this)
            });
       }else{
            let msg = 'Subject, Template Name, Module Name all are required!!'
            toast.error(msg, {position: toast.POSITION.TOP_RIGHT, toastId: "save_as_template"});
       }
    }

    save_action_fn(){
        this.handleSubmit();
    }

    render() {
        let result         = this.state.result
        let template       = this.state.template
        let name           = this.state.name
        return (
        <div>
          <Header />
            <div id="crm-app" className="clearfix module__quotation module__quotation-edit">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                    <AddPageTopAction
                        list_page_link ="/email/template/list/"
                        list_page_label ="Email Template"
                        add_page_link="/contact/add/"
                        add_page_label ="Add Email Template"
                        edit_page_link={false}
                        edit_page_label ={false}
                        item_name=""
                        page="add"
                        module="sales-order"
                        save_action ={this.save_action_fn.bind(this)}
                    />
                    <div className="row crm-stuff">
                      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <form id = "qout_email_temp_form" >
                          <div className="panel panel-default panel-tabular">
                            <div className="panel-body edit-form">
                                <div className="row row__flex">
                                  <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <table className="detail_table">
                                        <tbody>
                                        <tr>
                                            <td>
                                                <label className="control-label">
                                                    {translate('subject')}
                                                    <span className="text-primary">*</span>
                                                </label>
                                            </td>
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
                                            <td><label className="control-label">{'Template Name'}<span className="text-primary">*</span></label></td>
                                            <td>
                                                <div className="form-group">
                                                    <input value={this.state.template_result.template_name} type="text" name='template_name'
                                                           className="form-control" placeholder={'Template Name'} onChange={this.handle_change_template_name.bind(this)}/>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <label className="control-label">{'Select Module'}<span className="text-primary">*</span></label>
                                            </td>
                                            <td>
                                                <div className="form-group">
                                                    <div className="dropdown autocomplete">
                                                        <input type="text"
                                                               autoComplete="off"
                                                               value={this.state.module_name}
                                                               className="form-control"
                                                               data-toggle="dropdown"
                                                        />
                                                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                        <i id="main_form_tags_down_icon" className="fa fa-angle-down black"></i>
                                                    </span>
                                                    <div className="dd-options">
                                                            <ul className="options-list">
                                                                <li onClick={this.select_module.bind(this, 'contact')}>Contact</li>
                                                                <li onClick={this.select_module.bind(this, 'opportunity')}>Opportunity</li>
                                                                <li onClick={this.select_module.bind(this, 'quotation')}>Quotation</li>
                                                                <li onClick={this.select_module.bind(this, 'sales-order')}>Sales Order</li>
                                                                <li onClick={this.select_module.bind(this, 'invoice')}>Invoice</li>
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
                                                             <span>First Name:</span><span>[FirstName]</span>,
                                                             <span className="push-left-10">Last Name:</span><span>[LastName]</span>,
                                                             <span className="push-left-10">Company Name:</span><span>[CompanyName]</span>,
                                                             {this.state.module_name !== 'contact'?
                                                             <span><span className="push-left-10">Quotation Name/Invoice Number:</span><span>[qname]</span>,</span>
                                                             :null
                                                             }
                                                         </p>
                                                         {this.state.module_name !== 'contact'?
                                                         <p>
                                                             <span>Total Amount:</span><span>[tamount]</span>,
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
                                        <CustomEditor
                                            toolbar_id={'toolbar1'}
                                            editor_txt={this.state.template_result.editor_txt || ''}
                                            get_editor_txt={this.get_editor_txt.bind(this)}
                                            module={this.state.module_name}
                                            use_custom_button ={true}
                                        />

                                    <div className="add-new-product">
                                        <Dropzone style={{width:'40px',height:'40px'}} onDrop={this.onDrop.bind(this)} >
                                            <a className="btn btn-new" href="javascript:">Upload File</a>
                                        </Dropzone>
                                    </div>
                                    {this.state.attachements.length > 0 ?
                                        <div className="panel panel-default">
                                            <div className="row">
                                              {this.state.attachements.length > 0 ?
                                                    this.state.attachements.map((file, i) =>{
                                                        return (<div key={'attact_'+i} className="col-xs-12 col-ms-6 col-sm-4 col-md-3 col-lg-3">
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
                                                : null
                                              }
                                            </div>
                                        </div>
                                    : null
                                    }
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
            <ToastContainer />
        </div>
        );
    }
}
module.exports = EmailTemplateAdd;
