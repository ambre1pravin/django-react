import React from 'react';
import state, {BASE_FULL_URL} from 'crm_react/common/state';

import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';

class  CreateEditUomCateModal extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            title      : 'Create: Category', 
            inputValue :'test' ,
            id         : 0
        }
    }
    
  componentDidMount(){    
    var id           = this.props.id;
    var input_value  = this.props.input_value;
    
    this.openUomCateModalWithData(id , input_value)
  }

    openUomCateModalWithData(id , input_value){

        this.setState({
            id             : 0,
            name           : '',
        })
       
        if(id!=0 && id>0){

            $.ajax({
            type: "POST",
            cache: false,
            url:'/product/uomCateByid/'+id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                    this.setState ({
                        inputValue : data.name!==undefined ?data.name : '' ,
                        id         : id,
                        title      : 'Edit: Category', 
                    });
                }
            }.bind(this)
        });

        }
        else if(id==0){
            this.setState({
                        inputValue : input_value,
                        title      : 'Create: Category', 
                    })

        }
        
    }

    handlesubmit(){
        var Data = $('#uom_cate_form').serializeArray();
        
        $.ajax({
            type: "POST",
            cache: false,
            url: '/product/saveUOMCate/',
            data: {
              ajax: true,
              fields:JSON.stringify(Data),
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success == true){
                this.setState({
                        id             : 0,
                        name           : '',
                    })
                    
                    this.props.handleClose()
                    this.props.setCreatedUOMCate(data.id, data.name)

                }
            }.bind(this)
        });
    }

    handleChange(e){
        let input_value = e.target.value;
        this.setState({
            inputValue :input_value
        })
    }


    handleClose(){

        $('#product_uom_cate_Model').modal('hide');    
        this.props.handleClose()
    }


    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close" onClick={this.handleClose.bind(this)} aria-label="Close"   ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li className="border-line">{this.state.title}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left">
                <button type="button" id="" className="btn btn-primary" onClick={this.handlesubmit.bind(this)} >{translate('save')}
                </button>

                <button type="button" id="" onClick={this.handleClose.bind(this)} className="btn btn-default" >{translate('close')}
                </button>     
            </div>
        );
    }

    _renderBody(){
       
        return (
                 <form id="uom_cate_form" className="edit-form" action="" method="POST">
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                            <table className="detail_table">
                                <tbody>
                                    <tr>
                                        <td><label className="text-muted control-label">{translate('name')}</label></td>
                                        <td>
                                            <div className="form-group edit-name"  data-type="text">
                                                <input type="text" onChange={this.handleChange.bind(this)} name ="name" className="form-control" value={this.state.inputValue}  />
                                            </div>

                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        
                        </div>
                    </div>
                    <input type="hidden" name = "uom_cat_id" value={this.state.id}  />
                </form>
              )
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
module.exports = CreateEditUomCateModal;