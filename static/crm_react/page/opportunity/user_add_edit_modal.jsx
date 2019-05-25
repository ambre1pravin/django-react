import React from 'react';
import {translate} from 'crm_react/common/language';
import state, {BASE_FULL_URL} from 'crm_react/common/state';

import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';

class UserAddEditModal extends React.Component {

    constructor() {
        super();
        this.state = {
                id        : 0,
                name      : '',
                email     : '',
                phone     : '',
                mobile    : '',
                op_rights : '',
        }

        this.handleChange = this.handleChange.bind(this)

    }

  componentDidMount()
  {
      var id               = this.props.id;
      var input_value      = this.props.input_value;
     
      this.openModalWithData(id,input_value)

  }

    openModalWithData(id,input_value){

        if(id!=0 && id>0){

            $.ajax({
            type: "POST",
            cache: false,
            url: '/opportunity/getUserData/'+id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                    var user = data.user

                    this.setState({
                        id        : user.id,
                        name      : user.name,
                        email     : user.email,
                        phone     : user.phone,
                        mobile    : user.mobile,
                        op_rights : user.op_rights,
                        title     : "Edit : Sales Person",
                    })
                    $('#userModal').modal('show');
                }
            }.bind(this)
        });

        }
        else if(id==0){
            this.setState({
                        id        : 0,
                        name      : input_value,
                        email     : '',
                        phone     : '',
                        mobile    : '',
                        op_rights : '',
                        title     : "Edit : Sales Person",
                    })
            $('#userModal').modal('show');
        }


    }


    handleClose(){
        $('#userModal').modal('hide');    
        this.props.handleClose()
    }


    handleChange(event) {
        var name = event.target.name;
        var value = event.target.value;
        this.setState({
            [name]: value,
        });

  }


    handleUsersubmit(){
    

            var Data = $('#myuserform').serializeArray();

            $.ajax({
                 type: "POST",
                 cache: false,
                 url:  '/opportunity/saveUser',
              data: {
                 ajax: true,
                 fields: JSON.stringify(Data),
                 
              },
              beforeSend: function () {
              },
              success: function (data) {
                 if(data.success === true){
                    this.props.updateUserInputState(data.user.name,data.user.id);
                    this.handleClose()
                 }
              }.bind(this)
            });
    }        
      
    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close"  aria-label="Close"  onClick={this.handleClose.bind(this)} ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li>{translate('add_member')}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){

        return(
            <div className="modal-footer modal-text-left">

                <button type="button" id="submituser" className="btn btn-primary"  onClick={this.handleUsersubmit.bind(this)}>{translate('save')}
                </button>


                <button type="button" id="delete_close" className="btn btn-default"   onClick={this.handleClose.bind(this)} >{translate('button_close')}
                </button>     
            </div>
        );
    }

    _renderBody(){

       
        return (
            
              <form id="myuserform" className="edit-form" action="" method="POST">
                <div className="panel-body">
                  <div className="row">

                    <div className="col-lg-12 col-md-12">
            
                            <div className="row">
                                <div className="col-lg-3 col-md-3">
                                    <label className="text-muted control-label labelifno">{translate('label_name')}*</label>
                                </div>
                                <div className="col-lg-9 col-md-9">
                                    <div className="form-group">
                                        <input type="text" name="name" value={this.state.name} className="form-control" data-id="1" onChange={this.handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-3 col-md-3">
                                    <label className="text-muted control-label labelifno">{translate('email_address')}</label>
                                </div>
                                <div className="col-lg-9 col-md-9">
                                    <div className="form-group">
                                        <input type="email" required="required" name="email" value={this.state.email} className="form-control" data-id="1" onChange={this.handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-3 col-md-3">
                                    <label className="text-muted control-label labelifno">{translate('label_phone')}</label>
                                </div>
                                <div className="col-lg-9 col-md-9">
                                    <div className="form-group">
                                        <input type="text" name="phone" value={this.state.phone} className="form-control" data-id="1" onChange={this.handleChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-lg-3 col-md-3">
                                    <label className="text-muted control-label labelifno">{translate('label_mobile_no')}</label>
                                </div>
                                <div className="col-lg-9 col-md-9">
                                    <div className="form-group">
                                        <input type="text" name="mobile" value={this.state.mobile} onChange={this.handleChange} className="form-control" data-id="1" />
                                    </div>
                                </div>
                            </div>
                            <input type="hidden" name="id" value={this.state.id} />
                    </div>              
                  </div>
                </div>   
              </form>     
       
        );
    }
    render() {

        return (
              <Modal
                  style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
              <div className="modal-dialog  modal-lg in" >
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
module.exports = UserAddEditModal;
