import React from 'react';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';

class  EmailTemplate extends React.Component {

	constructor(props) {   
        super(props);
        this.state = {
            id        : 0,
            title : this.props.title,
            customer : [],
            recipients_dropdown: false,
            recipients_json : [],
            subject : '',
            template_name :'',
            email_content : '',
            editor : '',
            uomcate_Modal          : 'close',

        };
        this.handleModelChange = this.handleModelChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
    }

    componentDidMount(){
        var id = this.props.ids;
        var input_value = this.props.input_value;
        var customer = this.props.customer;
        var qname = this.props.qname;
        var tamount = this.props.tamount;
        this.openEmailModalWithData1(id,input_value,customer,qname,tamount)
    }

    openEmailModalWithData1(id,input_value,customer,qname,tamount){
          var clear = $(".intro").html('');
          $('.summernote').summernote({height: 200 });
            if (id>0 && id!="") {
                $.ajax({
                    type: "POST",
                    cache: false,
                    async : false,
                    url: '/quotation/getEmailTemplateData/'+id,
                    data: {
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                    },
                    success: function (data) {

                    if(data.success == true){
                        this.setState({
                        emailtemplate_dropdown  :true,
                        subject                 : data.subject,
                        editor                  : $('.summernote').code(data.description),
                        template_name           : data.name,
                        id                      : data.id,
                        customer                : customer,
                        qname                   : qname,
                        tamount                 : tamount,
                        image_path              : data.image_path,
                    });
                    }
                }.bind(this)
            });
     }
     else if(id == 0){
        this.setState({
                        emailtemplate_dropdown  :true,
                        id                      : 0,
                        template_name           : input_value,
                        subject                 : '',
                        editor                  : $('.summernote').code(''),
                        customer                :customer,
                        qname                   :qname,
                        tamount                 :tamount,
                        image_path              : '',
                    })
        }
    }

    
  handleSubmit(){
        $('.summernote').summernote({height: 200});
        var form = $('#qout_email_temp_form');
        let name = $('#template_name').val();
        let id = $('#id').val();
        var module_type = this.props.module_type;
        var quotationID = this.props.id;
        var subject = $(form).find('#subject').val();
        var txtEditor =  $(form).find('.summernote').code();
        var attachements =   $(form).find('.attached_file1');
        var upload_arr = []
        attachements.each(function(index, element){
            upload_arr.push(element.getAttribute('data-action-id'));
        });
        if(name!=''){
            var post_data = {'attachements':upload_arr, 'name':name, 'module_type' :module_type,'subject':subject, 'content':txtEditor,'id':id}
            $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/quotation/saveEmailtemplate/',
                    data: {
                          ajax: true,
                          fields:JSON.stringify(post_data),
                          csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                    },
                    success: function (data) {
                        if(data.success == true){
                            this.setState({
                                emailtemplate_dropdown  :true,
                                subject                 : data.subject,
                                editor                  : $('.summernote').code(data.description),
                                selected_template       : data.name,
                                selected_template_id    : data.id,
                            });
                               this.handleClose();
                               this.props.getEmailTemplatemain();
                               this.props.handleselectedEmailTemplate(data.id,data.name)
                        }
                    }.bind(this)
            });
        }else{
        alert("Please enter template name")
        }
  }

  handleChange(event) {

        var name = event.target.id;
        var value = event.target.value;
        this.setState({
            [name]: value,
        });
  }

  handleRemoveTr(){

        $('#oe_attachment').hide();  
  }

  handleShow(){
        
  }

  handleClose(){
     ModalManager.close(<EmailTemplate modal_id = "email_template_modal" onRequestClose={() => true} />)
  }

  handleCloseTemplate(){
        this.props.handleCloseTemplate();
  }

  onEditorStateChange(editorState) {
    this.setState({ editorState : editorState,});
  };

  handleModelChange(model) {
    this.setState({
       model: model
    });
  }

  handleCommonAddEdit(value){}

  _renderHeader(title){
        return(
            <div className="modal-header text-left">
                <button type="button" className="close" onClick={this.handleCloseTemplate.bind(this)} aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                <ul className="list-inline inline"><li className="border-line">Email Template</li></ul>
                 <div>
                    <table className="detail_table">
                        <tr><td><h4>Use this Keyword</h4></td></tr>
                        <tr><td>
                            <span>Customer Name:</span><span className ="push-left-10">[customers]</span>
                            <span className ="push-left-10">Quotation Name / Invoice Number:</span><span className ="push-left-10">[qname]</span>
                            {this.props.module_type != 'quotation' ?
                                <span>
                                    <span className ="push-left-10">Due date:</span><span className ="push-left-10">[duedate]</span>
                                </span>
                            :null
                            }
                            <span className ="push-left-10">Total Amount:</span><span className ="push-left-10">[tamount]</span>
                            <span className ="push-left-10">View Document Online:</span><span className ="push-left-10">[url]</span>
                        </td></tr>
                    </table>
                </div>
            </div>
        );
  }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left footer-margin">
                <button type="button" id="" className="btn btn-primary" onClick={this.handleSubmit.bind(this)} >{translate('button_save')}
                </button>
                <button type="button" id="" className="btn btn-default"  onClick={this.handleCloseTemplate.bind(this)} >{translate('cancel')}
                </button>     
            </div>
        );
    }
    
    _renderBody(){

        let quotation      = this.state.quotation;
        return (
                <form id="qout_email_temp_form" className="edit-form" action="" method="POST" encType='multipart/form-data'>
                <input type="hidden" value ={this.state.id} name="id" id= "id" />
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                            <table className="detail_table">
                                <tbody>
                                    <tr>
                                        <td><label className="control-label">Name</label></td>
                                        <td>
                                            <div className="form-group edit-name">
                                                <input value ={this.state.template_name} id="template_name" type="text" name='template_name' className="form-control capsname" placeholder={translate('template_name')}  onChange={this.handleChange} />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="control-label">{translate('subject')}</label></td>
                                        <td>
                                            <div className="form-group">
                                                <input value = {this.state.subject} id="subject" type="text" name='subject' className="form-control" placeholder={translate('subject')}  onChange={this.handleChange} />
                                            </div>
                                        </td>
                                    </tr>
                                    <br/><br/>
                                </tbody>
                            </table>
                            <textarea className="summernote"   value={this.state.editor}></textarea>
                            <br/><br/>
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        { this.props.module_type != 'CustomerInvoice' ?
                            <p><b>Note : Your Quotation document will be added by default, you can add other document if needed</b></p>
                         :
                          <p> <b>Note : Your Invoice on document will be added by default, you can add other document if needed</b></p>
                        }
                        </div>
                        <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                            <div className="o_hidden_input_file ufile1 ">
                            <div id="loader-icon-send"><i className="fa fa-spinner fa-spin"  width="50" height="50"></i></div>
                            <div id="loader-icon1"><i className="fa fa-spinner fa-spin"  width="50" height="50"></i></div>
                            <div id="ufileimage1" className="btn btn-new">
                            <br/>
                                <input type="file" name="ufile1[]" id="message_attatchment_file2" className="o_form_input_file"  multiple="multiple"/>
                            </div>
                               
                            <div>
                              {
                                this.state.image_path ?
                                    this.state.image_path.map((machine, i) =>{

                                        return <li className="attached_file1"   data-action-id= {machine}>{machine} <button className="btn btn-default delete_pdf1"><i className="fa fa-trash-o"></i></button></li>
                                })
                                : null
                                }

                               <ul className="intro1"> 

                              </ul>

                             </div>
                            </div>
                        </div>

                    </div>
                </div>
                </form>
              )
    }

    render() {
        return (
        <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
              <div className="modal-dialog modal-lg in" >
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
module.exports = EmailTemplate;