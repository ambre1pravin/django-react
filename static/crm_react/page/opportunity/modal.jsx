import React from 'react';
import state, {BASE_FULL_URL} from 'crm_react/common/state';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';

class MyModal extends React.Component{
   render(){
      const { text,onRequestClose } = this.props;
      return (
         <Modal
            style={modal_style}
            onRequestClose={onRequestClose}
            effect={Effect.SlideFromBottom}>
            <h1>What you input : {text}</h1>
            <button onClick={ModalManager.close}>Close Modal</button>
         </Modal>
      );
   }
}


module.exports = MyModal;
