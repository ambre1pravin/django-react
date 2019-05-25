import React,{Component} from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import state, {MACHINE_DEFAULT_DATA, IMAGE_PATH} from 'crm_react/common/state';
import { translate} from 'crm_react/common/language';
import { modal_style } from 'crm_react/common/helper';

const form_group = {borderStyle:'none'};
class ViewSubContactModal extends Component{
    constructor(props) {
      super(props);
      this.state = {
            onRequestClose : this.props.onRequestClose,
      }
    }


    render_contact_name(){
        return (
            <tr>
                <td rowSpan="2">
                    <div className="edit-dp">
                    <img className="" data-index="main_form" id="uimage" src={this.props.data.profile_image} width="98" height="98" />
                    </div>
                </td>
                <td>
                    <div className="form-group name">{this.props.data.name}</div>
                </td>
            </tr>
        );
    }

    render_company_name(){
        return (
            <tr>
            <td>
                <div id="company" className="form-group" style={form_group}>
                    {this.props.data.selected_company_name}
                </div>
            </td>
            </tr>
        );
    }



    render_string_value(value){
        let display_value;
        if(value){
            display_value = value
        }else{
            display_value ='-'
        }
        return(<td><div className="form-group" style={form_group}>{display_value}</div></td>);
    }

    render_fields(tab_fields){
        let fields = tab_fields
            return (
                    fields.map((f, i) =>{
                       let tab_content;
                       tab_content = this.render_string_value(f.value);
                        {
                          return <tr key={i}>
                                <td>
                                    <label className={f.value ? "control-label":"text-muted control-label"}>{f.name}</label></td>
                                    {tab_content}
                                </tr>
                        }

                    })
            );
    }

    render_default_tab_data(tab_fields){
        let fields = tab_fields
        let left_side_fields = [] ;
        let right_side_fields = [] ;
        fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                    };
                    left_side_fields.push(fields_data)
                }else{
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'value':f.value,
                    };
                    right_side_fields.push(fields_data)
                }
            }
        });
        return (
            <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
            <table className="detail_table">
            <tbody>
                 { this.render_contact_name() }
                 { this.render_company_name() }
                 <tr>
                    <td><label className={this.props.data.phone ? "control-label" : "text-muted control-label"}>Phone</label></td>
                    <td><div className="form-group" style={form_group}>{this.props.data.phone}</div></td>
                 </tr>
                 <tr>
                    <td><label className={this.props.data.mobile ? "control-label" : "text-muted control-label"}>Mobile</label></td>
                    <td><div className="form-group" style={form_group}>{this.props.data.mobile}</div></td>
                 </tr>
                 <tr>
                    <td><label className={this.props.data.email ? "control-label" : "text-muted control-label"}>Email</label></td>
                    <td><div className="form-group" style={form_group}>{this.props.data.email}</div></td>
                 </tr>

                 <tr>
                    <td><label className={this.props.data.street || this.props.data.street2 || this.props.data.zip || this.props.data.city
                        ? "control-label" :"text-muted control-label"}>Address</label></td>
                    <td>
                        <div className="form-group" style={form_group}>
                            <p>{this.props.data.street}</p>
                            <p>{this.props.data.street2}</p>
                            <p>{this.props.data.zip}</p>
                            <p>{this.props.data.city}</p>
                        </div>

                    </td>
                 </tr>
                 <tr>
                    <td><label className={this.props.data.country ? "control-label" : "text-muted control-label"}>Country</label></td>
                    <td><div className="form-group" style={form_group}>{this.props.data.country}</div></td>
                 </tr>                 
                 { this.render_fields(left_side_fields) }
            </tbody>
            </table>
            </div>
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
            <table className="detail_table">
            <tbody>
             { this.render_fields(right_side_fields) }
             <tr>
                <td>
                    <label className={this.props.data.tags.length > 0 ? "control-label" :"text-muted control-label"}>Tags</label>
                </td>
                 <td>
                     <div>
                         <ul className="list-inline tagbox">
                             {  this.props.data.tags.length > 0 ?
                                 this.props.data.tags.map((tag, t) => {
                                     return (<li key={'_vt_'+t} className={tag.color}>
                                                <i className={'fa fa-circle-o ' +tag.color}></i>
                                                <span>{tag.name}</span>
                                            </li>
                                            )
                                    })
                                :null
                             }
                         </ul>
                     </div>
                 </td>
             </tr>
             </tbody>
             </table>
            </div>

            </div>
        );
    }


    render_body(){
        return (
            <div className="modal-body">
            <form className="edit-form" id="sub_contact_edit_form">
                <div className="tab-pane active">
                    { this.render_default_tab_data(this.props.data.fields) }
                </div>
            </form>
            </div>
        );
    }


    handle_close(index) {
        ModalManager.close(<ViewSubContactModal  modal_id = "view-sub-contact-modal"  onRequestClose={() => true} />);
    }



   render(){
      var bodyStyle = {overflow :'auto',maxHeight: '75vh'};
      return (
         <Modal
            style={modal_style}
            onRequestClose={this.state.onRequestClose}
            effect={Effect.Fall}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handle_close.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">{this.props.title}</h4>
                    </div>
                    <div className="modal-body" style={bodyStyle}>
                        { this.render_body() }
                    </div>
                    <div  className="modal-footer">
                        <button className="btn btn-default" type="button" onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                    </div>
                </div>
            </div>
         </Modal>
      );
   }
}

module.exports = ViewSubContactModal;