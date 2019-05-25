import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import ProductCategoryParentDropDown from 'crm_react/page/product/product-category-parent-drop-down';
import { ToastContainer, toast } from 'react-toastify';


class  ModalProductCategory extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            category_name:this.props.input_value !=undefined ? this.props.input_value : null,
            parent_category_id:null,
            processing:false
        };
    }


    on_change_name(e){
        this.setState({category_name:e.target.value});
    }

    handle_close() {
        ModalManager.close(<ModalProductCategory modal_id="modal-product-category" onRequestClose={() => true}/>);
    }

    set_retrun_data(data){
        this.setState({parent_category_id:data.id});
    }

    render_body(){
        return(
            <div className="panel-body edit-form">
                <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                    <table className="detail_table">
                        <tbody>
                            <tr>
                                <td><label className="control-label">{'Product Category Name'}</label></td>
                                <td>
                                    <div className="form-group">
                                        <input
                                            autoComplete ="off"
                                            value        = {this.state.category_name}
                                            name         = {'name'}
                                            className    = {'form-control'}
                                            placeholder  = {'Product Category Name'}
                                            onChange = {this.on_change_name.bind(this)}
                                            />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td><label className="control-label">{'Category Type'}</label></td>
                                <td>
                                    <ProductCategoryParentDropDown
                                        field_name="product-parent-category"
                                        field_label="Product Parent Category"
                                        show_lable={true}
                                        set_retrun_data ={this.set_retrun_data.bind(this)}
                                        get_data_url="/product/get-product-category/"
                                        post_data_url="/contact/company_create/"
                                        selected_name=""
                                        selected_id={null}
                                        item_selected={false}
                                        create_option={false}
                                        create_edit_option={false}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    handle_submit(){
        let category_name = this.state.category_name;
        let parent_category_id = this.state.parent_category_id;
        if(category_name!=null){
            var post_data = {'category_id':0, 'category_name':category_name, 'parent_category_id':parent_category_id};
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/categorysave/',
                data: {
                    post_data :JSON.stringify(post_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({processing:true,})
                }.bind(this),
                success: function (data) {
                    if (data.success) {
                           this.props.set_product_category_data(data.result);
                           this.setState({processing:false,})
                           this.handle_close();
                    }
                }.bind(this)
            });
        }else{
            toast.error("Category Name required", {position: toast.POSITION.TOP_RIGHT, toastId: "ModalProductCategory"});
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
                 <ToastContainer />
            </Modal>
        );
    }

}
module.exports = ModalProductCategory;