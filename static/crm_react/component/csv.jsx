import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { Modal,ModalManager,Effect} from 'react-dynamic-modal';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';
import CommonMsgModal from 'crm_react/page/contact/common-msg-modal';
import { browserHistory } from 'react-router';
import {translate} from 'crm_react/common/language';

class Csv extends Component{
    constructor(props) {
        super(props);
      this.state = {
            save_button_disable: true,
            total_db_fields:this.props.total_db_fields,
            csv_cols: this.props.csv_cols,
            fields : this.props.fields,
            file_name: this.props.file_name,
            header: this.props.header,
            mapping_response:false,
            response_msg : '',
      }
    }

    handleClose() {
        ModalManager.close(<Csv modal_id = "csv_mapping" onRequestClose={() => true} />);
    }

    handleSaveContact(){
        var select_ids =[]
        $("form select").each(function(){
            var input = $(this); // This is the jquery object of the input, do what you will
            select_ids.push(input.val())
        });
        console.log(select_ids)
        var csrftoken = this.getCookie('csrftoken');
        if (select_ids.length > 0){
            $.ajax({
                 type: "POST",
                 dataType: "json",
                 url: BASE_FULL_URL + '/' + this.props.modal_name + '/import_mapping/',
                data: {
                    fields : JSON.stringify(select_ids),
                    file_name : this.state.file_name,
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({mapping_response :true})
                }.bind(this),
                success: function (data) {
                   if(data.success === true){
                        this.setState({mapping_response :false,response_msg:''})
                        this.handleClose()
                        this.props.getReturndata()
                        
                   }else{
                        this.setState({mapping_response :false, response_msg: data.msg})
                   }
                }.bind(this)
            });
        }else{
            alert('Use mappings')
        }
    }

    remove_field(index){
        alert(index)
        const fields = this.state.fields;
          this.setState({
            fields: [...fields.slice(0,index), ...fields.slice(index+1)]
          });
    }

    getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    render_tr(){
        let css_style ={
            height:'130px'
        }
        var indents = [];
        let field_count = this.state.total_db_fields
        let fields = this.state.fields
        console.log(fields)
        for (var i = 0; i < this.state.csv_cols.length; i++) {
            indents.push(
            <tr key={i}>
                <td>
                    <div className="form-group" style={css_style}>
                    <select className="form-control">
                    <option value='0'>Not Import</option>
                    { fields.length > 0 ? fields.map((f, i) =>{
                        return <option value={f.id} key={i}>{f.name}</option>
                       }):null
                    }
                     </select>
                    </div>
                </td>
            </tr>);
        }
        return (
                <table className="detail_table">
                {indents}
                </table>
             )
    }

    render_csv_header(){
        let css_style ={
            height:'130px'
        }
        return(
            <table className="detail_table">
            { this.state.header.length >0 ? this.state.header.map((header, i) =>{
                    return <tr key={i}>
                        <td>
                            <div className="form-group" style={css_style}>
                                 <input type="text" className="form-control" value={header} />
                            </div>
                        </td>
                    </tr>
                }):null
            }
            </table>
        );
    }

    breakLine(text) {
        var br = React.createElement('br');
        var regex = /(<br \/>)/g;
        return text.split("\n").map(function(line, index) {
            return line.match("\n") ? <br key={"key_" + index} /> : line;
        });
    }
    render_csv_cols(){
        let css_style ={
            resize: 'vertical'
        }
        return(
            <table className="detail_table">
            { this.state.csv_cols.length >0 ? this.state.csv_cols.map((contact, i) =>{
                    let result = contact.replace("::","\n");
                    return <tr key={i}>
                        <td>
                            <div className="form-group" style={css_style}>
                                <textarea type="textarea" className="form-control" rows="5" >{contact}</textarea>
                            </div>
                        </td>
                    </tr>
                }):null
            }
            </table>
        );
    }


   render(){
      return (
         <Modal
            onRequestClose={() => true}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg">
            <div className="modal-content">

                <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handleClose.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                    <h4 className="modal-title">{this.props.title}</h4>
                    <div className="modal-footer">
                    {   this.state.response_msg !=''?
                         <div className="alert alert-danger pull-left">
                                  {this.state.response_msg}
                         </div>
                        :null
                     }
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('close')}</button>
                    <button className="btn btn-primary" disabled={!this.state.save_button_disable} type="button" onClick={this.handleSaveContact.bind(this)}>
                        { this.state.mapping_response ?<span className="fa fa-refresh fa-spin"></span>:null }
                        {translate('save')}</button>
                    </div>
                </div>
                <div className="modal-body">
                    <form id="mapping_model">
                        <div className="row row__flex">

                            <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4 border-right">
                                <table className="detail_table">
                                    <tr><td><h4 className="form-group">{translate('label_db_field')}</h4></td></tr>
                                    { this.render_tr()}
                                </table>
                            </div>
                            <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4 border-right">
                                <table className="detail_table">
                                    <tr><td><h4 className="form-group">{translate('label_csv_header_field')} </h4></td></tr>
                                    { this.render_csv_header()}
                                </table>
                            </div>
                            <div className="col-xs-4 col-sm-4 col-md-4 col-lg-4">
                                <tr><td><h4 className="form-group">{translate('label_csv_column')} </h4></td></tr>
                                {this.render_csv_cols()}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('close')} </button>
                    <button className="btn btn-primary" disabled={!this.state.save_button_disable} type="button" onClick={this.handleSaveContact.bind(this)}>
                    { this.state.mapping_response ?<span className="fa fa-refresh fa-spin"></span>:null }
                     {translate('save')} </button>
                 </div>

            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = Csv;