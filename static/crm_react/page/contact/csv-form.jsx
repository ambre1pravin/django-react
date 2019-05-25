import React,{Component} from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';
import Csv from 'crm_react/page/contact/Csv';
import { translate} from 'crm_react/common/language';


class CsvForm extends Component{
    constructor(props) {
        super(props);
      this.state = {
            file_upload_status: false,
            response_msg:'',
      }
    }

    handleClose() {
        ModalManager.close(<CsvForm modal_id = "csv_form" onRequestClose={() => true} />);

    }

   uploadFile() {
        $("#csv_file_upload_from").submit();
         this.setState({file_upload_status :true})
         $("#csv_file_uploader").unbind().load(function() {  // This block of code will execute when the response is sent from the server.
           var result =  JSON.parse($("#csv_file_uploader").contents().text());
            if((result.success === 'true' || result.success === true) && result.fields.length > 0){
                this.handleClose()
                this.setState({file_upload_status :false})
                ModalManager.open( <Csv
                                    title = {translate('label_contact_map')}
                                    handleImportProcessing = {this.props.handleImportProcessing}
                                    total_db_fields = {result.total_fields}
                                    csv_cols = {result.csv_cols}
                                    rows={result.rows}
                                    header = {result.header}
                                    fields = {result.fields}
                                    modal_id = "csv_mapping"
                                    form_id =  "mapping_model"
                                    file_name = {result.file}
                                    showModal = { true }
                                    onRequestClose={() => true}
                                />
                );
            }else{
                this.setState({file_upload_status:false,response_msg:result.msg})
            }
        }.bind(this));
   }


   render(){
      return (
         <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg">
            <div className="modal-content">

                <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handleClose.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                    <h4 className="modal-title">{this.props.title}</h4>
                    { this.state.file_upload_status ?
                        <div className="row row__flex">
                        <span className="alert-success text-center fade in alert-dismissable col-xs-8 col-sm-2 col-md-2 col-lg-12">
                            <span>{translate('label_csv_inst')} <span className="fa fa-refresh fa-spin"></span></span>
                        </span>
                        </div>
                        :null
                    }
                    {
                     this.state.response_msg !=''?
                         <div className="row row__flex">
                         <span className="alert-danger text-center fade in alert-dismissable col-xs-8 col-sm-2 col-md-2 col-lg-12">
                             <em>{this.state.response_msg}</em>
                         </span>
                         </div>
                        :null
                    }

                </div>
                <div className="modal-body contacts-import" style={ModalbodyStyle}>
                    <form id="mapping_model">
                        <div className="row row__flex">
                            <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                                <form id="csv_file_upload_from" target="csv_file_uploader" action={'/contact/import/'} method="post" encType='multipart/form-data'>
                                    <input type="file" name="ufile" id="message_attatchment_file" className="o_form_input_file"  />
                                    {/*<DjangoCSRFToken/>*/}
                                </form>
                                <iframe name="csv_file_uploader" id="csv_file_uploader" className="hidden"></iframe>
                            </div>
                        </div>

                    </form>

                      <ul className="list-group">
                          <li className="list-group-item">
                              <p><b>I already got my CSV file ready to import.</b></p>
                              <p>Choose your contacts file to import.</p>
                              <p>Our mapping system will help you on next step to map every columns very simply.</p>
                              <p>Note : Your file must be a CSV comma separated.</p>
                              <p>File should not be exeed to 2MB.</p>
                          </li>
                          <li className="list-group-item">
                              <p><b>I don't have a file, i need to create one.</b></p>
                              <p>You can download our sample and replace data in it. You can download sample CSV file there <a href={'/static/front/Sample-CSV.csv'} className="text-primary" target="_blank">Sample-CSV.csv</a></p>
                              <p><b>Your contacts are safe.</b></p>
                              <p>We don't sell or rent your contacts. You can check more details on our privacy policy page.</p>
                          </li>
                      </ul>

                </div>

                <div className="modal-footer">
                    {
                        this.state.mapping_response ?
                        <img src ={ '/static/front/images/loading.gif'} width="50" height="50"/>
                        :null
                    }
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('button_close')}</button>
                    <button className="btn btn-primary" type="button" onClick={this.uploadFile.bind(this)}>
                     { this.state.file_upload_status ?   <span className="fa fa-refresh fa-spin"></span> :null } <span>{translate('label_upload')}</span></button>
                 </div>

            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = CsvForm;