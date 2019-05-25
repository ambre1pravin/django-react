import React,{Component} from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';


class MsgReportModal extends Component{
    constructor(props) {
      super(props);
      this.state = {
            file_upload_status: false,
            response_msg:'',
      }
    }

    handleClose() {
        ModalManager.close(<MsgReportModal modal_id = {this.props.modal_id} onRequestClose={() => true} />);

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
                </div>
                <div className="modal-body" style={ModalbodyStyle}>
                    <p> {this.props.msg}</p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('button_close')}</button>
                 </div>

            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = MsgReportModal;