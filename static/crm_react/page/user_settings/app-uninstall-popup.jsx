import React,{Component} from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { translate} from 'crm_react/common/language';
import { modal_style } from 'crm_react/common/helper';


class AppUninstallPopup extends Component{
    constructor(props) {
      super(props);
      this.state = {}
    }

    handle_close() {
        ModalManager.close(<AppUninstallPopup modal_id = 'uninstall-app'  onRequestClose={() => true} />);
    }

    handle_uninstall(){
        let app = this.props.app
        if(confirm("Are you sure want to Uninstall!") && this.props.app){
            this.handle_close()
            this.props.ok_true()
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                 type: "POST",
                 cache: false,
                 dataType: "json",
                 url:  '/uninstall-application/',
                 data: {
                    app_name :app,
                    csrfmiddlewaretoken: csrftoken
                 },
                 beforeSend: function () {
                    this.setState({processing:true})
                 }.bind(this),
                 success: function (data) {
                   if(data.success === true){
                       this.props.uninstall_status(data.success)
                   }else{
                       // To do errors
                   }
                 }.bind(this)
            });
        }else{
            alert('cancel')
        }
    }

   render(){
      return (
         <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
             <div className="modal-dialog modal-lg" role="document">
                 <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handle_close.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">Uninstall App</h4>
                    </div>
                    <div className="modal-body">
                      <p className="text-warning">Warning, if you delete this module this will delete those modules.</p>
                      <p>
                         <h4 className="text-primary">This operation will DELETE definitvely ALL datas and will be impossible to recover.</h4>
                      </p>
                      <p className="text-primary">Your subscription will be updated.</p>
                    </div>
                    <div  className="modal-footer">
                        <button className="btn btn btn-primary " type="button" onClick={this.handle_close.bind(this)}>Cancel</button>
                        <button className="btn btn-default" type="button" onClick={this.handle_uninstall.bind(this)}>Ok</button>
                    </div>
                </div>
            </div>
         </Modal>
      );
   }
}

module.exports = AppUninstallPopup;