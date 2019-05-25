import React,{Component} from 'react';
import {NotificationManager } from 'react-notifications';
import { Modal, ModalManager,Effect} from 'react-dynamic-modal';
import state, {MACHINE_DEFAULT_DATA} from 'crm_react/common/state';
import { getCookie, modal_style} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';

class CreateTagModal extends Component{
    constructor(props) {
        super(props);
      this.state = {
            save_button_disable: true,
            input_value: this.props.tag_name !='' ? this.props.tag_name : '',
      }
    }

    handleClose(index) {
        ModalManager.close(<CreateTagModal modal_id = "tag-modal" onRequestClose={() => true} />);
    }
    handleInputChange(event){
        this.setState({input_value: event.target.value,save_button_disable:true})
    }

    AddTag(data){
        this.props.onAddTag(data);
    }

    /*** Save tag into db**/
    handleSave(){
       let input_value =this.state.input_value
       var csrftoken = getCookie('csrftoken');
        if(input_value !==''){
            var temp_data =[];
            $.ajax({
                 type: "POST",
                 cache: false,
                 url: '/contact/create_tag/',
                data: {
                    tag_name :input_value,
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({save_button_disable:true})
                }.bind(this),
                success: function (data) {
                   if(data.success === true){
                        temp_data.push(data.tag);
                        this.props.onAddTag(temp_data);
                        ModalManager.close(<CreateTagModal modal_id = "tag-modal" onRequestClose={() => true} />);
                   }
                }.bind(this)
            });
        }
        else{
            NotificationManager.error(translate('label_enter_tag_name'), translate('label_error'), 5000);
        }
    }
   render(){

      return (
         <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-sm">
            <div className="modal-content">

                <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handleClose.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                    <h4 className="modal-title">{translate('label_create_tag')}</h4>
                </div>
                <div className="modal-body">
                    <form>
                        <input type="text" data-type="tags" value={this.state.input_value} name="dd-option" onChange={this.handleInputChange.bind(this)}/>
                    </form>
                </div>
                <div  className="modal-footer">
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('button_close')}</button>
                    <button className="btn btn-primary" disabled={!this.state.save_button_disable} type="button" onClick={this.handleSave.bind(this)}>{translate('button_save')}</button>
                </div>
            </div>

            </div>

         </Modal>
      );
   }
}

module.exports = CreateTagModal;