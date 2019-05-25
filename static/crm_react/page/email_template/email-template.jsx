import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import CustomEditor from 'crm_react/page/email_template/custom-editor';

class TemplateEmail extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                template_result: this.props.template_result,
                editor_txt: null,
            }
        }

        handle_close() {
            ModalManager.close(<TemplateEmail modal_id="email-template" onRequestClose={() => true}/>);
        }

        get_editor_txt(editor_txt) {
            let template_result = this.state.template_result;
            template_result.editor_txt = editor_txt
            this.setState({editor_txt: editor_txt, template_result:template_result});
        }

        handle_change_template_name(event){
            let template_result = this.state.template_result;
            template_result.template_name = event.target.value;
            this.setState({template_result:template_result});
        }

        handle_change_template_subject(event){
            let template_result = this.state.template_result;
            template_result.subject = event.target.value;
            this.setState({template_result:template_result});
        }

        save_template(){
            let template_result = this.state.template_result;
            $.ajax({
                type: "POST",
                cache: false,
                url: '/quotation/saveEmailtemplate/',
                data: {
                      ajax: true,
                      fields:JSON.stringify(template_result),
                      csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if(data.success == true){
                        this.props.set_email_template(template_result);
                        this.handle_close();
                    }
                }.bind(this)
            });
        }

        render_body() {
            console.log("test", this.state.template_result);
            return (
                <form id="qout_email_form" className="edit-form" action="" method="POST" encType='multipart/form-data'>
                <div className="panel-body">
                    <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                        <table className="detail_table">
                            <tbody>
                            <tr>
                                <td><label className="control-label">Name</label></td>
                                <td>
                                    <div className="form-group edit-name">
                                        <input value={this.state.template_result.template_name}  type="text"
                                               name='template_name' className="form-control capsname"
                                               onChange={this.handle_change_template_name.bind(this)}
                                               placeholder={translate('template_name')}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="control-label">{translate('subject')}</label></td>
                                <td>
                                    <div className="form-group">
                                        <input value={this.state.template_result.subject}  type="text" name='subject'
                                               onChange={this.handle_change_template_subject.bind(this)}
                                               className="form-control" placeholder={translate('subject')}
                                        />
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        {this.state.template_result.editor_txt ?
                            <CustomEditor
                                toolbar_id={'toolbar2'}
                                editor_txt={this.state.template_result.editor_txt}
                                get_editor_txt={this.get_editor_txt.bind(this)}
                                use_custom_button ={true}
                            />
                            : null
                        }
                    </div>
                </div>
                </form>
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
                                <div>
                                    <table className="detail_table">
                                        <tr>
                                            <td><h4>Use this Keyword</h4></td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <span>Customer Name:</span><span className="push-left-10">[customers]</span>
                                                <span className="push-left-10">Quotation Name / Invoice Number:</span><span
                                                className="push-left-10">[qname]</span>
                                                {this.props.module_type != 'quotation' ?
                                                    <span>
                                                    <span className="push-left-10">Due date:</span><span
                                                        className="push-left-10">[duedate]</span>
                                                </span>
                                                    : null
                                                }
                                                <span className="push-left-10">Total Amount:</span><span
                                                className="push-left-10">[tamount]</span>
                                                <span className="push-left-10">View Document Online:</span><span
                                                className="push-left-10">[url]</span>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-body" style={ModalbodyStyle}>
                                { this.render_body() }
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-default pull-left" type="button"
                                        onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                                <button className="btn btn-primary pull-left"
                                        type="button" onClick={this.save_template.bind(this)}>{translate('button_save')}</button>
                            </div>
                        </div>
                    </div>
                </Modal>
            );
        }
}
 module.exports = TemplateEmail;