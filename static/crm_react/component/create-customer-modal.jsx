import React from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import CustomerAdd from 'crm_react/page/contact/contact-add';
import {translate} from 'crm_react/common/language';
import { modal_style, get_field_by_position , ModalbodyStyle } from 'crm_react/common/helper';

class CreateCustomerModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fields: [],
        }

    }

    handleClose() {
        ModalManager.close(<CreateCustomerModal modal_id = {this.props.modal_id}  onRequestClose={() => true} />);
    }

   render(){
      const { onRequestClose, title, modal_id, form_id } = this.props;
      let fields = this.state.fields
      return (
             <Modal
                style={modal_style}
                onRequestClose={onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog modal-lg sub-contact module__contact module__contact-create in">
                <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handleClose.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">{title}</h4>
                    </div>
                    <div className="modal-body" style={ModalbodyStyle}>
                    <CustomerAdd
                        display_header={false}
                        handleClose={this.handleClose.bind(this)}
                        handle_click_comapny={this.props.handle_click_comapny.bind(this)}
                        contact_name={this.props.contact_name}
                        is_customer={this.props.is_customer}
                        is_vendor={this.props.is_vendor}
                        is_lead={this.props.is_lead}
                    />
                    </div>
                    <div  className="modal-footer">

                    </div>
                </div>
                </div>
             </Modal>
      );
   }
}
module.exports = CreateCustomerModal;