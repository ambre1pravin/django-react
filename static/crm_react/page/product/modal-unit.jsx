import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import UnitCategoryDropDown from 'crm_react/page/product/unit-category-drop-down';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import { ToastContainer, toast } from 'react-toastify';

class  ModalUnit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uom_name: this.props.input_value !=undefined ? this.props.input_value : null,
            //uom_category_id:null,
            processing : false,
        };

    }

    on_change_uom_name(e){
        this.setState({uom_name: e.target.value})
    }

    handle_close() {
        ModalManager.close(<ModalUnit modal_id="unit-of-measure" onRequestClose={() => true}/>);
    }

    set_return_data(data){
        console.log("unit of measure data is",data)
        //this.setState({uom_category_id:data.id})
    }

    render_body(){
        return(
            <div className="panel-body edit-form">
                <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                    <table className="detail_table">
                        <tbody>
                            <tr>
                                <td><label className="control-label">{translate('unit_of_measure')} </label></td>
                                <td>
                                    <div className="form-group">
                                        <input
                                            autoComplete ="off"
                                            value        = {this.state.uom_name}
                                            name         = {'name'}
                                            className    = {'form-control'}
                                            onChange     = {this.on_change_uom_name.bind(this)}
                                            placeholder  = {translate('unit_mesure_name')} />
                                    </div>
                                </td>
                            </tr>
                            {/*<tr>
                                <td><label className="control-label">{translate('category')}</label></td>
                                <td>
                                    <UnitCategoryDropDown
                                        field_name="category"
                                        field_label="Category of unit"
                                        show_lable={true}
                                        set_return_data ={this.set_return_data.bind(this)}
                                        get_data_url="/product/get-uom-category/"
                                        post_data_url="/product/save-uom-cat/"
                                        selected_name=""
                                        selected_id={null}
                                        item_selected={false}
                                        create_option={true}
                                        create_edit_option={false}
                                    />
                                </td>
                            </tr>*/}

                        </tbody>
                    </table>
                </div>
            </div>
        );


    }

    handle_submit(){
        //let uom_category_id= this.state.uom_category_id;
        let uom_name = this.state.uom_name;
        if(uom_name!=null){
            var post_data = {'uom_id':0, 'uom_name':uom_name};
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/uomsave/',
                data: {
                    post_data :JSON.stringify(post_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({processing:true,})
                }.bind(this),
                success: function (data) {
                    if (data.success) {
                           this.props.set_uom_data({'id':data.result.id,'name':data.result.uom_name})
                           this.setState({processing:false,})
                           this.handle_close();
                    }
                }.bind(this)
            });
        }else{
            toast.error(" Name required", {position: toast.POSITION.TOP_RIGHT, toastId: "ModalUnit"});
        }
    }

    render() {
        const {field, onRequestClose, title, modal_id, form_id} = this.props;
        return (
            <Modal
                style={modal_style}
                onRequestClose={onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close" type="button" onClick={this.handle_close.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body" style={ModalbodyStyle}>
                        { this.render_body() }
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default pull-left" type="button"
                                    onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                            <button className="btn btn-primary pull-left" type="button" onClick={this.handle_submit.bind(this)}>{'Save'}</button>
                        </div>
                    </div>
                </div>

                <LoadingOverlay processing={this.state.processing}/>
            </Modal>
        );
    }

}
module.exports = ModalUnit;