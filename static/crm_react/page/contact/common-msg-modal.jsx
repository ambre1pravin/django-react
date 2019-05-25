import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';


class CommonMsgModal extends Component{
    constructor(props) {
        super(props);
      this.state = {
            message: this.props.msg ? this.props.msg : '',
      }
    }
    handleClose(index) {
        ModalManager.close(<CommonMsgModal modal_id = "common-msg-modal" onRequestClose={() => true} />);
    }
   render(){
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
                    <h4 className="modal-title"></h4>
                </div>
                <div className="modal-body">
                    {this.state.message}
                </div>
                <div  className="modal-footer">
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>Close</button>
                </div>
            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = CommonMsgModal;