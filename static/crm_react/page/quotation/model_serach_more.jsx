import React from 'react';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';

class  ModelSearchMore extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            display_json_list:[],
        }
    }

    componentDidMount(){
            var items_type            = this.props.items_type;
            var tr_id                 = this.props.tr_id;
            var field                 = this.props.field;
            this.openModalwithList(items_type,tr_id, field)
      }

  openModalwithList(items_type,tr_id, field){
        this.setState({
            items_type : items_type,
            tr_id      : tr_id,
            field      : field
        })
    
        if(field=='product'){
                this.serverRequest = $.get('/product/getlistdata/', function (data) {
                      this.setState({
                                    display_json_list : data && data.products!==undefined ? data.products : []
                                    });
                    }.bind(this));
        }
        else if(field=='uom'){
                this.serverRequest = $.get('/quotation/getUomListdata/', function (data) {
                      this.setState({
                                    display_json_list : data && data.json_uom!==undefined ? data.json_uom : []
                                    });
                    }.bind(this));
        }
        else if(field=='taxes') {
                this.serverRequest = $.get('/quotation/getTaxesListdata/', function (data) {
                      this.setState({
                                    display_json_list : data && data.json_taxes!==undefined ? data.json_taxes : []
                                    });
                    }.bind(this));
        }
    }

    setSelected(id, name){
        var tr_id      = this.state.tr_id;
        var items_type = this.state.items_type;
        var field      = this.state.field;
        console.log("search", items_type, id, name, tr_id, field)
        this.props.setSelectedField(items_type, id, name, tr_id, field);
        ModalManager.close(<ModelSearchMore modal_id = "model_more_search" onRequestClose={() => true} />);
    }

    handleClose(){
         ModalManager.close(<ModelSearchMore modal_id = "model_more_search" onRequestClose={() => true} />);
    }

    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                 <button type="button" className="close"  onClick= {this.handleClose.bind(this)} aria-label="Close"   ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li className="border-line"></li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left">
                <button type="button"   className="btn btn-default" onClick= {this.handleClose.bind(this)} >{translate('close')}</button>    
            </div>
        );
    }

    _renderBody(){
        return (
                <div className="modal-body">
                    <table className="table"   width="100%">
                        <thead>
                            <tr>
                            {this.state.field =='product'?<th width="30%">{translate('internal_reference')}</th>:''}
                            {this.state.field =='product'?<th width="40%">{translate('name')}</th>:''}
                            {this.state.field =='product'?<th width="30%">{translate('sale_price')}</th>:''}
                            {this.state.field =='uom'?<th width="50%">{translate('name')}></th>:''}
                            {this.state.field =='uom'?<th width="50%">{translate('category')}</th>:''}
                            {this.state.field =='taxes'?<th width="40%">{translate('name')}</th>:''}
                            {this.state.field =='taxes'?<th width="30%">{translate('value')}</th>:''}
                            {this.state.field =='taxes'?<th width="30%">{translate('computation')}</th>:''}
                            </tr>
                        </thead>
                        <tbody>
                        {
                            this.state.display_json_list && this.state.field =='product' ?
                                this.state.display_json_list.map((machine, i) =>{
                                return (<tr className = "list_tr" onClick ={this.setSelected.bind(this,machine.uuid, machine.internal_reference+' '+machine.name)} key = {i}>
                                          <td>{machine.internal_reference!==undefined ?machine.internal_reference:''}</td>
                                          <td>{machine.name!==undefined ?machine.name:''}</td>
                                          <td>{machine.sale_price!==undefined ?machine.sale_price:'0.0'}</td>
                                        </tr>
                                       )
                                })
                            : null
                        }
                        {
                            this.state.display_json_list && this.state.field =='uom' ?
                                this.state.display_json_list.map((machine, i) =>{
                                return (<tr className = "list_tr" onClick ={this.setSelected.bind(this,machine.id,machine.name)} key = {i}>
                                          <td>{machine.name!==undefined ?machine.name:''}</td>
                                          <td>{machine.category_name!==undefined ?machine.category_name:''}</td>
                                      </tr>
                                        )
                                })
                            : null
                        }

                        {
                            this.state.display_json_list && this.state.field =='taxes' ?
                                this.state.display_json_list.map((machine, i) =>{
                                return (<tr className = "list_tr" onClick ={this.setSelected.bind(this,machine.id,machine.name)} key = {i}>
                                          <td>{machine.name!==undefined ?machine.name:''}</td>
                                          <td>{machine.value!==undefined ?machine.value:''}</td>
                                          <td>{machine.computation!==undefined ?machine.computation:''}</td>
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
module.exports = ModelSearchMore;