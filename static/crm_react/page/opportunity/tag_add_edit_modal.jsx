import React from 'react';
import {translate} from 'crm_react/common/language';
import state, {BASE_FULL_URL} from 'crm_react/common/state'; 

class TagAddModal extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        result: null,
        isOpen: false,
        selectval:this.props.inputval ? this.props.inputval : ''
      }
    }
    componentWillReceiveProps(nextProps) {
      this.setState({
            selectval:nextProps.inputval ? nextProps.inputval : '',
      });
      
    }  

    handleChange(event) {
          this.setState({
            value: event.target.value
          });
        }

    resetModel(){
         this.setState({
            result:null
          })
    }

  handletagSubmit(){
      var tag_name = '';
      var Data = $('#tag_add_form').serializeArray();
      if(typeof Data[0] !== "undefined" && Data[0].value != '') {
       var tag_name = Data[0].value; 
     }else{ return; } 

     $.ajax({
        type: "POST",
        cache: false,
        url:  '/opportunity/addTags',
        data: {
          tag_name :tag_name
        },
        beforeSend: function () {
        },
        success: function (data) {
          if(data.success === true){
            
            $('#tagmodal').modal('hide');
            this.props.onsubmittag(data.tag_id,data.tag_name);
          }
        }.bind(this)
      });
    }  

    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li>{translate('add_tag')}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left">
                <button type="button" id="save_tag_button"  className="btn btn-primary"  onClick={this.handletagSubmit.bind(this)}>{translate('button_save')}
                </button>


                <button type="button" id="delete_close" className="btn btn-default" data-dismiss="modal" onClick = {this.resetModel.bind(this)}>{translate('button_close')}
                </button>
            </div>
        );
    }

    _renderBody(){
        
        let divStyle = {
          display:'none',
          color:"red"
        }

        let icon_style = {
            cursor: 'pointer'
        }

        let edit_btn = {
          display:'none'
        }

       
        return (
          
        <form name="tag_add_form" id="tag_add_form">     
          <div className="modal-body">
            <div className="row">
              <div className="col-lg-3 col-md-3">
                <label className="text-muted control-label labelifno">{translate('tag_name')}</label>
              </div>
              <div className="col-lg-9 col-md-9">
                <div className="form-group">
                  <input type="text" name="tag_name" onChange={this.handleChange}  value={this.state.selectval} id="model_tag_name" />
                </div>
              </div>
            </div>
          </div>
        </form>
        );
    }

    render() {
        return (
          <div>
            <div className="modal fade" id="tagmodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            
              <div className="modal-dialog modal-lg ">
                <div className="modal-content">
                  { this._renderHeader('Edit Column') }
                  { this._renderBody() }
                  { this._renderfooter() }

                </div>
              </div>
              
            </div>
          </div>
        );
    }
}
module.exports = TagAddModal;
