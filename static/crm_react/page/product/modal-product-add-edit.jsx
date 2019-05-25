import React from 'react';
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {modal_style, ModalbodyStyle, getCookie, is_int, is_float} from 'crm_react/common/helper';
import UnitMeasureDropDown from 'crm_react/page/product/unit-measure-drop-down';
import TaxDropDown from 'crm_react/page/product/tax-drop-down';
import ProductCategoryDropDown from 'crm_react/page/product/product-category-drop-down';
import SalesPersonDropDown from 'crm_react/page/product/sales-person-drop-down';
import SalesChannelDropDown from 'crm_react/page/product/sales-channel-drop-down';
import { ToastContainer, toast } from 'react-toastify';
import Dropzone from  'react-dropzone'
const request = require('superagent');

class  ModalProductAddEdit extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product_name:this.props.input_value !=undefined ? this.props.input_value : null,
            can_be_sold:false,
            can_be_purchased:false,
            can_be_expend:false,
            event_subscription:false,
            product_type:'consumable',
            product_category:null,
            internal_ref:null,
            discription:null,
            sale_price:null,
            tax_on_sale:null,
            cost:null,
            unit_of_measure:null,
            weight:null,
            volume:null,
            sales_person:null,
            sales_channel:null,
            internal_note:null,
            internal_note_for_vendor:null,
            pro_img:'/static/front/images/image-upload.png',

        };

    }

    set_customer_id_name(data){
       this.setState({select_ctmr_id:data.id,select_ctmr_value:data.name});
   }


    handle_close() {
        ModalManager.close(<ModalProductAddEdit modal_id="modal-product-add-edit" onRequestClose={() => true}/>);
    }

    on_change_product_name(field_name, e){
        if(field_name == 'name'){
            this.setState({product_name:e.target.value});
        }
        if(field_name == 'sale_price'){
           if(is_int(e.target.value) || is_float(e.target.value)){
                this.setState({sale_price:e.target.value});
           }else{
                toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
                this.setState({sale_price:null});
           }
        }
        if(field_name == 'cost'){
            if(is_int(e.target.value) || is_float(e.target.value)){
                this.setState({cost:e.target.value});
            }else{
                toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
                this.setState({cost:null});
            }
        }

        if( field_name == 'weight'){
            if(is_int(e.target.value) || is_float(e.target.value)){
                this.setState({weight:e.target.value})
            }else{
                toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
                this.setState({weight:null});
            }
        }

        if(field_name == 'volume'){
            if(is_int(e.target.value) || is_float(e.target.value)){
                this.setState({volume:e.target.value})
            }else{
                toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
                this.setState({volume:null});
            }
        }
    }

    on_click_can_be_sold(){
        this.setState({can_be_sold:!this.state.can_be_sold});
    }

    on_click_purchased(){
        this.setState({can_be_purchased:!this.state.can_be_purchased});
    }

    on_click_can_be_expend(){
        this.setState({can_be_expend:!this.state.can_be_expend});
    }

    on_click_event_subscription(){
        this.setState({event_subscription:!this.state.event_subscription});
    }

    on_click_product_type(product_type){
        this.setState({product_type:product_type});
    }

    on_change_textarea(field_name, e){
        if( field_name == 'int_ref'){
            this.setState({internal_ref:e.target.value});
        }
        if(field_name == 'discription'){
            this.setState({discription:e.target.value});
        }
        if(field_name == 'internal_note'){
            this.setState({internal_note:e.target.value});
        }
        if(field_name == 'internal_note_for_vendor'){
            this.setState({internal_note_for_vendor:e.target.value});
        }
    }

    onDrop(accepted, rejected) {
        var csrftoken = getCookie('csrftoken');
        const req = request.post('/product/upload_img/');
        if (accepted.length > 0) {
            accepted.forEach(file => {
                req.attach('image', file);
            });
            req.set('csrfmiddlewaretoken', csrftoken)
            req.end((err, res) => {
                var obj = JSON.parse(res.text);
                if (obj.success && obj.url != '') {
                    this.setState({pro_img: obj.url})
                }
            });
        }
    }

    set_retrun_data(data, drop_down){
        if(drop_down === 'tax_on_sale'){
            this.setState({tax_on_sale:data.id});
        }
        if(drop_down === 'unit_of_measure'){
            this.setState({unit_of_measure:data.id});
        }
        if(drop_down === 'product_category'){
            this.setState({product_category:data.id});
        }
        if(drop_down === 'sales_person'){
            this.setState({sales_person:data.id});
        }
        if(drop_down === 'sales_channel'){
            this.setState({sales_channel:data.id});
        }
    }

    
    handle_submit(){
        var post_data = {'product_name':this.state.product_name,'can_be_sold':this.state.can_be_sold,
        'can_be_purchased':this.state.can_be_purchased, 'can_be_expend':this.state.can_be_expend, 'event_subscription':this.state.event_subscription,
        'product_type':this.state.product_type, 'product_category':this.state.product_category, 'internal_ref':this.state.internal_ref,'discription':this.state.discription,
        'sale_price':this.state.sale_price, 'tax_on_sale':this.state.tax_on_sale, 'cost':this.state.cost, 'unit_of_measure':this.state.unit_of_measure,
        'weight':this.state.weight, 'volume':this.state.volume, 'sales_person': this.state.sales_person, 'sales_channel':this.state.sales_channel,
        'internal_note':this.state.internal_note, 'internal_note_for_vendor':this.state.internal_note_for_vendor,'img_url':this.state.pro_img};
        if(this.state.product_name!=null){
           $.ajax({
                type: "POST",
                cache: false,
                url: '/product/save/',
                data: {
                    post_data :JSON.stringify(post_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({processing:true,})
                }.bind(this),
                success: function (data) {
                    if (data.success) {
                       this.props.set_product_data(data.result, 'product')
                       //this.setState({processing:false,})
                       this.handle_close();
                    }
                }.bind(this)
            });

        }else{
            toast.error(" Name required", {position: toast.POSITION.TOP_RIGHT, toastId: "ModalProductAddEdit"});
        }
    }

    render_body(){
        return(
                <div className="clearfix module__product module__product-create container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                            <div className="row crm-stuff">
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <div className="panel panel-default panel-tabular">

                                       <div className="panel-body edit-form">
                                          <form id="quot_product_form" >
                                              <input type="hidden" name="edit_id" value={''} />
                                              <div className="row">
                                                  <div className="col-xs-8 col-sm-10 col-md-8 col-lg-8">
                                                    <label htmlFor="product-name">{translate('product_name')}</label>
                                                    <h2 className="product-name">
                                                      <input
                                                        value={this.state.product_name}
                                                        name="product-name"
                                                        id="product_name"
                                                        placeholder ={translate('product_name')}
                                                        onChange={this.on_change_product_name.bind(this,'name')}
                                                      />
                                                    </h2>
                                                  </div>
                                                  <div className="col-xs-4 col-sm-2 col-md-4 col-lg-4 text-right">
                                                    <div className="product-image">
                                                        <Dropzone
                                                            accept="image/jpeg, image/png"
                                                            style={{width:'70px',height:'70px'}}
                                                            onDrop={this.onDrop.bind(this)}
                                                        >
                                                         <div className="clearfix product-image-actions">
                                                              <i className="fa fa-pencil pull-left"></i>
                                                          </div>
                                                          <img  src={this.state.pro_img} width="70" height="70" />
                                                       </Dropzone>
                                                   </div>
                                                  </div>
                                                 <ul className="product-options">
                                                    <li>
                                                    <div className="checkbox">
                                                          <input
                                                            name="sale_ok"
                                                            checked={this.state.can_be_sold }
                                                            type="checkbox"
                                                            onClick= {this.on_click_can_be_sold.bind(this)}
                                                          />
                                                          <label htmlFor="checkbox_sale_ok" onClick= {this.on_click_can_be_sold.bind(this)}>{translate('can_be_sold')}</label>
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="checkbox">
                                                          <input
                                                            name="purchase_ok"
                                                            type="checkbox"
                                                            checked={this.state.can_be_purchased }
                                                            onClick= {this.on_click_purchased.bind(this)}
                                                          />
                                                          <label htmlFor="checkbox_purchase_ok" onClick= {this.on_click_purchased.bind(this)}> {translate('can_be_purchased')}</label>
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="checkbox">
                                                          <input
                                                            name="expense_ok"
                                                            type="checkbox"
                                                            checked={this.state.can_be_expend }
                                                            onClick= {this.on_click_can_be_expend.bind(this)}
                                                          />
                                                          <label htmlFor="checkbox_expense_ok" onClick= {this.on_click_can_be_expend.bind(this)}>{translate('can_be_expensed')}</label>
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="checkbox">
                                                          <input
                                                            name="subcription_ok"
                                                             type="checkbox"
                                                             checked = {this.state.event_subscription}
                                                             onClick= {this.on_click_event_subscription.bind(this)}
                                                          />
                                                          <label htmlFor="checkbox_subcription_ok" onClick= {this.on_click_event_subscription.bind(this)}>{translate('event_subscription')}</label>
                                                      </div>
                                                    </li>
                                                </ul>
                                              </div>
                                              <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                                                  <li role="presentation" className="active"><a href="#quoedit-field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="true">{translate('general_information')}</a></li>
                                                  <li role="presentation"><a href="#quoedit-field-tab-2" aria-controls="field-tab-2" role="tab" data-toggle="tab">{translate('extra_info')}</a></li>
                                                  <li role="presentation">
                                                      <a href="#quoedit-field-tab-3" aria-controls="field-tab-3" role="tab" data-toggle="tab">{translate('notes')}</a>
                                                  </li>
                                              </ul>
                                              <div className="tab-content edit-form">
                                                  <div id="quoedit-field-tab-1" role="tabpanel" className="tab-pane active">
                                                      <div className="row row__flex">
                                                          <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                              <table className="detail_table">
                                                                <tbody>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('product_type')}</label></td>
                                                                      <td>
                                                                          <div className="form-group"  data-type="dropdown">
                                                                            <select name="product_type"  className="o_form_input o_form_field form-control" >
                                                                                <option value=""></option>
                                                                                <option
                                                                                    value="consumable"
                                                                                    selected ={this.state.product_type === 'consumable' ? 'Selected' : null}
                                                                                    onClick={this.on_click_product_type.bind(this, 'consumable')}>{translate('consumable')}
                                                                                </option>
                                                                                <option
                                                                                    value="service"
                                                                                    selected ={this.state.product_type === 'service' ? 'Selected' : null}
                                                                                    onClick={this.on_click_product_type.bind(this, 'service')}>{translate('service')}
                                                                                </option>
                                                                                <option
                                                                                    value="stockable"
                                                                                    selected ={this.state.product_type === 'stockable' ? 'Selected' : null}
                                                                                    onClick={this.on_click_product_type.bind(this, 'stockable')}>{translate('stockable_product')}
                                                                                </option>
                                                                            </select>
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td>
                                                                          <label className="control-label">{translate('internal_reference')}</label>
                                                                      </td>
                                                                      <td>
                                                                          <div className="form-group" data-type="text">
                                                                            <input
                                                                                type="text"
                                                                                id ="internal_reference"
                                                                                name ="internal_reference"
                                                                                className="form-control"
                                                                                value={this.state.internal_ref}
                                                                                onChange ={this.on_change_textarea.bind(this,'int_ref')}
                                                                            />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td>
                                                                          <label className="control-label">{translate('product_category')}</label>
                                                                      </td>
                                                                      <td>
                                                                        <ProductCategoryDropDown
                                                                            field_name="product-category"
                                                                            field_label="Product Category"
                                                                            show_lable={true}
                                                                            set_return_data ={this.set_retrun_data.bind(this)}
                                                                            get_data_url="/product/get-product-category/"
                                                                            post_data_url="/contact/company_create/"
                                                                            selected_name=""
                                                                            selected_id={null}
                                                                            item_selected={false}
                                                                            create_option={true}
                                                                            create_edit_option={false}
                                                                        />
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                    <td><label className="control-label">{translate('description')}</label></td>
                                                                    <td>
                                                                      <div className="form-group quotation" >
                                                                      <textarea rows="5" cols="20"
                                                                        name="discription" id = "pro_discription"
                                                                        className="form-control"
                                                                        onChange={this.on_change_textarea.bind(this,'discription')}
                                                                        placeholder={translate('write_notes')} >{this.state.discription}</textarea>
                                                                      </div>
                                                                    </td>
                                                                  </tr>
                                                                </tbody>
                                                              </table>
                                                          </div>
                                                          <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                                              <table className="detail_table">
                                                                <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <label className="control-label">{translate('sale_price')}</label>
                                                                      </td>
                                                                      <td>
                                                                          <div className="form-group" data-type="text">
                                                                          <input
                                                                            type="text"
                                                                            placeholder="only decimal value"
                                                                            name ="sale_price"
                                                                            className="form-control"
                                                                            onChange={this.on_change_product_name.bind(this,'sale_price')}
                                                                          />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('tax_on_sale')}</label></td>
                                                                      <td>
                                                                        <TaxDropDown
                                                                            field_name="tax"
                                                                            field_label="Tax"
                                                                            show_lable={true}
                                                                            set_return_data ={this.set_retrun_data.bind(this)}
                                                                            get_data_url="/product/get-taxes/"
                                                                            post_data_url="/contact/company_create/"
                                                                            selected_name=""
                                                                            selected_id={null}
                                                                            item_selected={false}
                                                                            create_option={true}
                                                                            create_edit_option={false}
                                                                        />
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('cost')}</label></td>
                                                                      <td>
                                                                          <div className="form-group" data-type="text">
                                                                          <input
                                                                            type="text"
                                                                            placeholder="only decimal value"
                                                                            name ="cost"
                                                                            className="form-control"
                                                                            value={this.state.cost}
                                                                            onChange={this.on_change_product_name.bind(this,'cost')}
                                                                          />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('unit_of_measure')}</label></td>
                                                                      <td>
                                                                        <UnitMeasureDropDown
                                                                            field_name="unit"
                                                                            field_label="Unit"
                                                                            show_lable={true}
                                                                            set_return_data ={this.set_retrun_data.bind(this)}
                                                                            get_data_url="/product/get-product-unit/"
                                                                            post_data_url="/contact/company_create/"
                                                                            selected_name=""
                                                                            selected_id={null}
                                                                            item_selected={false}
                                                                            create_option={true}
                                                                            create_edit_option={false}
                                                                        />
                                                                      </td>
                                                                  </tr>
                                                                </tbody>
                                                              </table>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div id="quoedit-field-tab-2" role="tabpanel" className="tab-pane ">
                                                      <div className="row row__flex">
                                                          <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                              <table className="detail_table">
                                                                <tbody>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('weight')}</label></td>
                                                                      <td>
                                                                          <div className="form-group" data-type="text">
                                                                          <input
                                                                                type="text"
                                                                                name="weight"
                                                                                placeholder="only decimal value"
                                                                                className="form-control"  value={this.state.weight}
                                                                                onChange={this.on_change_product_name.bind(this,'weight')}
                                                                          />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('volume')}</label></td>
                                                                      <td>
                                                                          <div className="form-group"  data-type="text">
                                                                            <input
                                                                                type="text"
                                                                                name="volume"
                                                                                placeholder="only decimal value"
                                                                                className="form-control"  value={this.state.volume}
                                                                                onChange={this.on_change_product_name.bind(this,'volume')}
                                                                            />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                </tbody>
                                                              </table>
                                                          </div>
                                                         <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                              <table className="detail_table">
                                                                <tbody>
                                                                  <tr>
                                                                      <td><label className="control-label">Sales Person</label></td>
                                                                      <td>
                                                                        <SalesPersonDropDown
                                                                            field_name="sales-persion"
                                                                            field_label="Sales Person"
                                                                            show_lable={true}
                                                                            set_return_data ={this.set_retrun_data.bind(this)}
                                                                            get_data_url="/product/get-sales-person/"
                                                                            selected_name=""
                                                                            selected_id={null}
                                                                            item_selected={false}
                                                                        />
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">Sales Channel</label></td>
                                                                      <td>
                                                                        <SalesChannelDropDown
                                                                            field_name="sales-persion"
                                                                            field_label="Sales Person"
                                                                            show_lable={true}
                                                                            set_return_data ={this.set_retrun_data.bind(this)}
                                                                            get_data_url="/salesteams/listdata/"
                                                                            selected_name=""
                                                                            selected_id={null}
                                                                            item_selected={false}
                                                                        />
                                                                      </td>
                                                                  </tr>
                                                                </tbody>
                                                              </table>
                                                          </div>
                                                      </div>
                                                  </div>
                                                  <div id="quoedit-field-tab-3" role="tabpanel" className="tab-pane">
                                                      <div className="row">
                                                          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                                              <div className="quotation">
                                                                  <label htmlFor="desc-quotations">{translate('internal_note')}</label>
                                                                  <textarea
                                                                    id="desc_quotations"
                                                                    rows="5" cols="20"
                                                                    name="product_notes"
                                                                    placeholder={translate('internal_note')}
                                                                    onChange={this.on_change_textarea.bind(this,'internal_note')}
                                                                  >{this.state.internal_note}</textarea>
                                                              </div>
                                                              <div className="quotation">
                                                                  <label htmlFor="desc-vendors">{translate('internal_note_for_vendor')}</label>
                                                                  <textarea id="desc-vendors" rows="5" cols="20" name="desc-vendors"
                                                                      placeholder={translate('internal_note_for_vendor')}
                                                                      onChange={this.on_change_textarea.bind(this,'internal_note_for_vendor')}>
                                                                      {this.state.internal_note_for_vendor}
                                                                  </textarea>
                                                             </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </form>
                                      </div>
                                    </div> {/*end .panel*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        )
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
                <ToastContainer />
            </Modal>
        );
    }

}
module.exports = ModalProductAddEdit;