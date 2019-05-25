import React from 'react';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';

class  ListCategoryModel extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            display_json_list:[],
        }
    }


    handleChange(e){
        let input_value = e.target.value;
        this.setState({
            category_name :input_value
        })
    }
    openModalwithListCategory(){

    this.serverRequest = $.get('/product/getCategory/', function (data) {
      this.setState({
                    display_json_list : data && data.json_cate_list!==undefined ? data.json_cate_list : []
                    });
    }.bind(this));

        $('#category_list_Model').modal('show');
    }

    setSelected(id, name){
        this.props.setSelectedCategory(id, name);
         $('#category_list_Model').modal('hide');
         this.props.handleClose();
    }

    handleClose(){

        ModalManager.close(<ListCategoryModel modal_id = "category_list_Model" onRequestClose={() => true} />);
        //$('#category_list_Model').modal('hide');
        this.props.handleClose()
    }

    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close" aria-label="Close"  onClick={this.handleClose.bind(this)} ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li className="border-line"></li>
                    </ul>
                </div>
        );
    }


    _renderfooter(){

        return(
            <div className="modal-footer modal-text-left">

                <button type="button" id="delete_close" className="btn btn-default" onClick={this.handleClose.bind(this)} >{translate('close')}
                </button>     
            </div>
        );
    }

    _renderBody(){
       
        return (
                <div className="modal-body">
                    <table className="table" id="list_table" width="100%">
                        <thead>
                            <tr>
                                <th width="100%">{translate('category_name')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.display_json_list ?
                                this.state.display_json_list.map((machine, i) =>{
                                return (<tr key = {i}>
                                          <td className="product-cate-tr" onClick ={this.setSelected.bind(this,machine.id,machine.name)}>{machine.name}</td>
                                      </tr>
                                        )
                                })
                            : null
                        }
                        </tbody>
                    </table>
                </div>
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
module.exports = ListCategoryModel;