import React,{Component} from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { getCookie } from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';


class Csv extends Component{
    constructor(props) {
      super(props);
      this.state = {
            save_button_disable: true,
            total_db_fields:this.props.total_db_fields,
            rows : this.props.rows,
            file_name: this.props.file_name,
            mapping_response:false,
            response_msg : '',
            processing_msg:'',
      }
    }

    handleClose() {
        ModalManager.close(<Csv modal_id = "csv_mapping" onRequestClose={() => true} />);
    }

    handleImportProcessing(msg){
        this.props.handleImportProcessing(msg)
    }

    handleSaveContact(){
        var select_ids =[]
        $("form select").each(function(){
            var input = $(this); // This is the jquery object of the input, do what you will
            select_ids.push(input.val())
        });
        if (select_ids.length > 0){
            $.ajax({
                 type: "POST",
                 dataType: "json",
                 url:  '/contact/mapping/',
                data: {
                    fields : JSON.stringify(select_ids),
                    file_name : this.state.file_name,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    var msg = translate('label_import_running_msg')
                    this.setState({mapping_response :true ,processing_msg:msg})
                    this.handleImportProcessing(msg)
                }.bind(this),
                success: function (data) {
                   if(data.success === true){
                        this.setState({mapping_response :false,response_msg:'' ,processing_msg :''})
                        this.handleClose()
                        this.handleImportProcessing('')
                        window.location.reload(true)
                   }else{
                        this.setState({mapping_response :false, response_msg: data.msg})
                   }
                }.bind(this)
            });
        }else{
            alert('Use mappings')
        }
    }



    render_table_rows(){
        let rows = this.state.rows;
        return(
            rows.length > 0 ?
                rows.map((row, r) => {
                    return(<tr key={'_ro_'+r}>
                            <td>
                                <div className="form-group">
                                    <select className="form-control">
                                        <option value='0'>{translate('label_not_import')}</option>
                                        <option value='name'>{'Name'}</option>
                                        <option value='first_name'>{'First Name'}</option>
                                        <option value='last_name'>{'Last Name'}</option>
                                        <option value='email'>{'Email'}</option>
                                        <option value='phone'>{'Phone'}</option>
                                        <option value='mobile'>{'Mobile'}</option>
                                        <option value='street'>{'Street'}</option>
                                        <option value='street2'>{'Street2'}</option>
                                        <option value='zip'>{'Zip'}</option>
                                        <option value='city'>{'City'}</option>
                                        <option value='country'>{'Country'}</option>
                                        {   row.fields.length > 0 ? row.fields.map((field, f) => {
                                                return <option value={field.id} key={'_f_'+f}>{field.name}</option>
                                            }) : null
                                        }
                                    </select>
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <input className="form-control" value={row.header} type="text" />
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <textarea type="textarea" className="form-control" rows="5">{row.csv_values}</textarea>
                                </div>
                            </td>
                        </tr>
                    );
                })

            :null
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
                         <span className="alert alert-danger text-center col-lg-12">
                                  {this.state.response_msg}
                         </span>
                        :null
                     }
                     { this.state.mapping_response ?
                        <span className="alert alert-success text-center col-lg-12">
                            <span> {this.state.processing_msg} </span>
                            <span className="fa fa-refresh fa-spin"></span>
                        </span>
                     :null
                     }
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('button_close')}</button>
                    <button className="btn btn-primary" disabled={!this.state.save_button_disable} type="button" onClick={this.handleSaveContact.bind(this)}>
                        { this.state.mapping_response ?<span className="fa fa-refresh fa-spin"></span>:null }
                        <span>  {translate('button_save')}</span></button>
                    </div>
                </div>
                <div className="modal-body contacts-import" >
                    <form id="mapping_model">
                        <table>
                            <tbdoy>
                                <tr>
                                    <th><h4 className="form-group">DB Fields</h4></th>
                                    <th><h4 className="form-group">CSV Header Fields</h4></th>
                                    <th><h4 className="form-group">CSV Columns</h4></th>
                                </tr>
                                {this.render_table_rows()}
                            </tbdoy>
                        </table>
                    </form>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-default" type="button" onClick={this.handleClose.bind(this)}>{translate('button_close')}</button>
                    <button className="btn btn-primary" disabled={!this.state.save_button_disable} type="button" onClick={this.handleSaveContact.bind(this)}>
                     { this.state.mapping_response ? <span className="fa fa-refresh fa-spin"></span>:null }  <span>  {translate('button_save')}</span></button>
                 </div>

            </div>
            </div>
         </Modal>
      );
   }
}

module.exports = Csv;