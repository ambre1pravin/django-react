import React from 'react';
import state, {BASE_FULL_URL} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import LostReasonModal from 'crm_react/page/opportunity/lost_reason_modal';      
import Dropdown from 'crm_react/component/Dropdown';
 

class LostAddModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            result: null,
            isOpen: false,
            select_value: '',
            select_id: '',
            result_lost:''
        }
    }

    handleChange(event) {
      this.setState({
        value: event.target.value
      });
    }

    handellostadd(id,val){
        this.setState({
        select_value: val,
        select_id: id
      });
    }

    handellostaddSubmit(){
        $('#Modal_LostAdd').modal('hide');  
       this.props.onUpdate(this.state.select_id,this.state.select_value);
    }

    handleLostreasonsubmit(input_value){

       var Data = [];
       Data.push({name: 'lost_edit_id', value:''});
       Data.push({name: 'lostname', value:input_value});
    
        $.ajax({
            type: "POST",
            cache: false,
            url:  '/opportunity/addlostreason/',
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success === true){
                   this.setState({
                                select_value: data.name,
                                select_id: data.id
                   });

                }
            }.bind(this)
        });

    }


    /*Start: Lost add edit modal add edit modal */
      
      handleLostAddEdit(id, input_value){
        this.setState({lr_addedit_modal_is_open:true}, ()=>{this.refs.lr_edit_child.openModalWithData(id, input_value)});
      }

      handleCloseLReditModal(){
       this.setState({lr_addedit_modal_is_open:false}); 
      }

    /*End: Lost add edit modal add edit modal */

    changenewlost(newid, newvalues){
        this.setState({
            select_value: newvalues,
            select_id: newid
        });
    }

    resetModel(){
         this.setState({
            result:null,
          })
    }
    
    _renderHeader(title){
        return(

                <div className="modal-header text-left">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <h4  className="modal-title">{title}</h4>
                        
                    </ul>
                </div>
        );
    }

    _renderfooter(){

        return(
            <div className="modal-footer modal-text-left">
              <button className="btn btn-primary" type="button" onClick={this.handellostaddSubmit.bind(this)} >{translate('button_save')} </button>
              <button data-dismiss="modal" className="btn btn-default" type="button" id="contact_model_tag_close_button">{translate('button_close')}</button>
            </div> 
        );
    }

    _renderBody(){
        let result = this.state.result

        let divStyle = {
          display:'none',
          color:"red"
        }

        let icon_style = {
            cursor: 'pointer'
        }
       
        return (
            <div className="modal-body">
                <div className="panel-body">
                  <div className="row edit-form">
                    <table className="detail_table">
                        <tbody>
                        {this.props.jsonlostdata?
                         <tr>
                            <td><label className="text-muted control-label">Lost</label></td>
                                <td>
                                  <Dropdown
                                      name='Reason for Lost the Opportunity'
                                      input_value= {this.state.select_value}
                                      input_id = {this.state.select_id}
                                      inputtext = 'lost_add'
                                      inputname = 'lost_reson_id'
                                      modal_id = '#Modal_LostReason'
                                      changeparent = {this.handellostadd.bind(this)}
                                      handleAddEdit={this.handleLostAddEdit.bind(this)}  
                                      handelCreate = {this.handleLostreasonsubmit.bind(this)}
                                      json_data ={this.props.jsonlostdata ? this.props.jsonlostdata : ''} 
                                      ref = 'dropdown'/>
                                  </td>
                            </tr>
                          :''}
                        </tbody>
                    </table>    
                  </div>
                </div>  
            </div>
        );
    }

    render() {

        return (
            <div> 
                
                <div className="modal fade" id="Modal_LostAdd" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                  <div className="modal-dialog  ">
                    <div className="modal-content">

                      { this._renderHeader('Create Lost Reason') }
                      { this._renderBody() }
                      { this._renderfooter() }

                    </div>
                   </div>
                </div>
                {this.state.lr_addedit_modal_is_open==true?
                  <LostReasonModal ref="lr_edit_child" 
                                    onaddupdate={this.changenewlost.bind(this)}
                                    handleClose = {this.handleCloseLReditModal.bind(this)} />
                  :''
                }
                
            </div>    
        );
    }

}
module.exports = LostAddModal;
