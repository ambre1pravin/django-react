import React from 'react';
import {translate} from 'crm_react/common/language';
import state, {BASE_FULL_URL} from 'crm_react/common/state';    


class LostReasonModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            result: this.props.resultdata ? this.props.resultdata : ''
        }
    }

    componentWillReceiveProps(nextProps) {
      this.setState({
            result:nextProps.resultdata ? nextProps.resultdata : '',
      });
      
    }
    handlelostreasonEditSubmit(){
        var Data = $('#lost_reason_edit_form').serializeArray();
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
                    this.resetModel();
                    $('#Modal_LostReasonEdit').modal('hide');  
                    this.props.onaddupdate(data.id,data.name);
                    
                }
            }.bind(this)
        });

    }

    handleChange(event) {
          this.setState({
            value: event.target.value
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
              <button className="btn btn-primary" type="button" id="save_lost_button" onClick={this.handlelostreasonEditSubmit.bind(this)} >{translate('button_save')} </button>
              <button data-dismiss="modal" className="btn btn-default" type="button" id="contact_model_tag_close_button" onClick = {this.resetModel.bind(this)}>{translate('button_close')}</button>
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
          
           <form id="lost_reason_edit_form">  
            <div className="modal-body">
               
               <div className="row edit-form">
                    <div className="col-lg-3 col-md-3">
                        <label className="text-muted control-label labelifno">Lost reason</label>
                    </div>

                    <div className="col-lg-9 col-md-9">
                        <div className="form-group">
                        <input type="text" name="lostname"  value={result ? result.lostname : '' } id="model_lost_name"  onChange={this.handleChange} className="form-control" />
                        <input type="hidden" value={result && result.id ? result.id : '' } name="lost_edit_id" />
                        </div>
                    </div>
                </div>
               
            </div>
         </form>   
       
        );
    }
    render() {
        return (
            <div className="modal fade" id="Modal_LostReasonEdit" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-lg ">
                <div className="modal-content">

                  { this._renderHeader('Create Lost Reason') }
                  { this._renderBody() }
                  { this._renderfooter() }

                </div>
               </div>
            </div>
              
        );
    }
}
module.exports = LostReasonModal;
