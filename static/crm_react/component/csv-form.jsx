import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';
import CommonMsgModal from 'crm_react/page/contact/common-msg-modal';
import DjangoCSRFToken from 'django-react-csrftoken'
import Csv from 'crm_react/component/Csv';
import {translate} from 'crm_react/common/language';

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
  getReturndata(){

    this.props.getReturndata('')
  }

   uploadFile() {
    
        $("#csv_file_upload_from").submit();
         this.setState({file_upload_status :true})
         $("#csv_file_uploader").unbind().load(function() {  // This block of code will execute when the response is sent from the server.
           var result =  JSON.parse($("#csv_file_uploader").contents().text());
            console.log(result)
            if(result.success === 'true' || result.success === true){

                console.log(result.total_fields)
                console.log(result.fields)
                console.log(result.header)
                console.log(result.csv_cols)
                this.handleClose()
                this.setState({file_upload_status :false})
                var modal_name = this.props.modal_name
                console.log(modal_name)
                ModalManager.open( <Csv
                                    title = "Contact Field Mapping"
                                    total_db_fields = {result.total_fields}
                                    getReturndata = {this.getReturndata.bind(this)}
                                    csv_cols = {result.csv_cols}
                                    header = {result.header}
                                    fields = {result.fields}
                                    modal_name ={modal_name}
                                    modal_id = "csv_mapping"
                                    form_id =  "mapping_model"
                                    file_name = {result.file}
                                    showModal = { true }
                                    onRequestClose={() => true}/>
                );
            }else{

                this.setState({file_upload_status:false,response_msg:result.msg})
            }
        }.bind(this));
   }


   render(){
    var modal_name = this.props.modal_name
    console.log(BASE_FULL_URL +'/'+ modal_name +'/imports/')
      return (
         <Modal
            onRequestClose={() => true}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg">
            <div className="modal-content">

                <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handleClose.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                    <h4 className="modal-title">{this.props.title}</h4>

                </div>
                <div className="modal-body">
                    <form id="mapping_model">
                        <div className="row row__flex">
                            <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                                <form id="csv_file_upload_from" target="csv_file_uploader" action={BASE_FULL_URL +'/'+ modal_name +'/imports/'} method="post" encType='multipart/form-data'>
                                    <input type="file" name="ufile" id="message_attatchment_file" className="o_form_input_file"  />
                                    <DjangoCSRFToken/>
                                </form>
                                <iframe name="csv_file_uploader" id="csv_file_uploader" className="hidden"></iframe>
                            </div>
                                                 {   this.state.response_msg !=''?
                         <p className="alert alert-danger pull-left">
                          {this.state.response_msg}
                         </p>
                        :null
                     }
                        </div>

                    </form>
                    <p> Write Csv upload instructions here</p>
                </div>

                <div className="modal-footer">
                    {
                        this.state.mapping_response ?
                        <img src ={BASE_FULL_URL + '/static/front/images/loading.gif'} width="50" height="50"/>
                        :null
                    }
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>close</button>
                    <button className="btn btn-primary" type="button" onClick={this.uploadFile.bind(this)}>
                    { this.state.file_upload_status ?<span className="fa fa-refresh fa-spin"></span>:null }upload</button>
                 </div>

            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = CsvForm;