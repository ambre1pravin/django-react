import React from 'react';
import {SortableHandle} from 'react-sortable-hoc';
import {translate} from 'crm_react/common/language';
//import Dropdown from 'crm_react/component/Dropdown';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import ProductDropdown from 'crm_react/page/product/product-dropdown';
import TaxDropDown from 'crm_react/page/product/tax-drop-down';
import UnitMeasureDropDown from 'crm_react/page/product/unit-measure-drop-down';
import {getCookie, is_int, is_float, cursor_pointer} from 'crm_react/common/helper';
import { ToastContainer, toast } from 'react-toastify';

const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);

class Product_tr extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item_type: this.props.item_type,
            tr_id: this.props.tr_id,
            pro_qty: this.props.record.pro_qty? this.props.record.pro_qty:null,
            unit_price: null,
            discount: null,
        };
    }

    handleRemoveTr(index) {
        this.props.handleDeleteTr(this.props.record, this.state.item_type, index);
    }

    handleDiscoutUpdate(event) {
        var index = this.props.tr_id;
        var value = event.target.value;
        var tax_id = this.props.record.selected_tax_id;
        if (tax_id != 0 && tax_id > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/getTaxesById/' + tax_id,
                data: {
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                    ajax: true,
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.updateDiscount(this.state.item_type, index, value, data.value, data.computation);
                    }
                }.bind(this)
            });
        }
    }

    handleQtyUpdate(event) {
        var index = this.props.tr_id;
        var value = event.target.value;
        var tax_id = this.props.record.selected_tax_id;
        if (tax_id != 0 && tax_id > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/getTaxesById/' + tax_id,
                data: {
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                    ajax: true,
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        //this.props.updateQty(this.state.item_type, index, value, data.value, data.computation);
                    }
                }.bind(this)
            });
        }
    }

    handleUnitPriceUpdate(event) {
        var index = this.props.tr_id;
        var value = event.target.value;
        var tax_id = this.props.record.selected_tax_id;

        if (tax_id != 0 && tax_id > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/getTaxesById/' + tax_id,
                data: {
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                    ajax: true,
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.updateUnitPrice(this.state.item_type, index, value, data.value, data.computation);
                    }
                }.bind(this)
            });
        }
    }

    handle_change_quantity(event) {
        let value = event.target.value
        console.log("handle_change_quantity", value)
        let index = this.props.tr_id;
        let attribute = event.target.id;
        if(value !=''){
            if(is_int(value) || is_float(value)){
                this.setState({pro_qty: value})
                this.props.updateQty(this.state.item_type, index, value, attribute )
            }else{
               toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
               this.setState({pro_qty: null})
            }
        }else{
            this.setState({pro_qty: null})
        }

    }

    handle_change_unit_price(event) {
        let value = event.target.value

        let index = this.props.tr_id;
        let attribute = event.target.id;
        this.props.record.unit_price = value;
        if (value != '') {
            value = value.replace(/,/g, '.')
        } else {
            this.setState({unit_price: null})
        }
        this.props.updateProduct(this.state.item_type, index, attribute, value);
        this.props.updateQty(this.state.item_type, index, attribute, value)
    }

    handle_change_discount(event) {
        let value = event.target.value
        let index = this.props.tr_id;
        let attribute = event.target.id;
        this.props.record.discount = value;
        if (value != '') {
            value = value.replace(/,/g, '.')
        } else {
            this.setState({discount: null})
        }
        this.props.updateProduct(this.state.item_type, index, attribute, value);
        this.props.updateQty(this.state.item_type, index, attribute, value)
    }

    handleChangeDescription(event) {
        var value = event.target.value;
        var index = this.props.tr_id;
        var attribute = event.target.id;
        this.props.updateProduct(this.state.item_type, index, attribute, value);
    }

//function : open model for search more product
    handleSearchMoreProduct() {
        var tr_id = this.props.tr_id;
        var field = 'product';
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }

//function : open model for search more unit of measure
    handleSearchMoreUom() {
        var field = 'uom';
        var tr_id = this.props.tr_id;
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }

    handleSearchMoreTaxes() {
        var field = 'taxes';
        var tr_id = this.props.tr_id;
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }

//function : open model for create and edit  unit of measure
    handleProductAddedit(pro_id, input_value) {
        var tr_id = this.props.tr_id;
        this.props.openProductModal(this.state.item_type, tr_id, pro_id, input_value);
    }


//function : open modal for create(id=0) or edit(id>0)
    handleUomAddedit(uom_id, input_value) {
        var tr_id = this.props.tr_id;
        this.props.openUOMModal(this.state.item_type, tr_id, uom_id, input_value)
    }

//function : open modal for create(id=0) or edit(id>0)
    handleTaxesAddedit(taxes_id, input_value) {
        var tr_id = this.props.tr_id;
        this.props.openTaxesModal(this.state.item_type, tr_id, taxes_id, input_value)
    }

    handleselectedProduct(id, name) {
        var tr_id = this.props.tr_id;
        console.log("test")
        this.props.handleselectedProduct(this.state.item_type, tr_id, id, name)
    }

    handleselectedUOM(id, name) {
        var tr_id = this.props.tr_id;
        this.props.handleselectedUOM(this.state.item_type, tr_id, id, name)
    }

    handleselectedTaxes(id, name) {
        var tr_id = this.props.tr_id;
        if (id != 0 && id != null && id > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/getTaxesById/' + id,
                data: {
                    ajax: true,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.handleselectedTaxes(this.state.item_type, tr_id, id, name, data.value, data.computation)
                    }
                }.bind(this)
            });
        } else {
            this.props.handleselectedTaxes(this.state.item_type, tr_id)
        }
    }


    quotationadddata() {
        this.props.quotationadddata()
    }

    //suyash
    set_retrun_data(data, dropdown){
       if(dropdown == 'product'){
            this.handleselectedProduct(data.id, data.name)
       }
       if(dropdown == 'tax_on_sale'){
            this.handleselectedTaxes(data.id, data.name)
       }
       if(dropdown == 'unit_of_measure'){
            this.handleselectedUOM(data.id, data.name)
       }
    }


    render() {
        //console.log("this.state.pro_qty", this.state.pro_qty, this.props.record.pro_qty)
        return (
            <tr key={this.props.index} className="product_row">

                <td><DragHandle /></td>
                <td data-th="Product">
                    <ProductDropdown
                        field_name="product"
                        field_label="Product"
                        show_lable={true}
                        set_return_data ={this.set_retrun_data.bind(this)}
                        get_data_url="/product/get-product/"
                        post_data_url="/contact/company_create/"
                        selected_name={this.props.record.selected_product}
                        selected_id={this.props.record.selected_product_id}
                        item_selected={false}
                        create_option={true}
                        create_edit_option={false}
                    />
                </td>
                <td data-th="Description">
                    <input type="text" placeholder="Description..." id="discription"
                           onChange={this.handleChangeDescription.bind(this)} name="pro_discription"
                           value={this.props.record.discription}/>
                </td>
                <td data-th="Order Qty">
                        <input type="text" id="pro_qty" placeholder="Quantity..." name="pro_qty"
                               onBlur={this.handleQtyUpdate.bind(this)}
                               onChange={this.handle_change_quantity.bind(this)} value={this.state.pro_qty}/>
                </td>


                <td data-th="Unit Of Measure">
                    <UnitMeasureDropDown
                        field_name="unit"
                        field_label="Unit"
                        show_lable={true}
                        set_return_data ={this.set_retrun_data.bind(this)}
                        get_data_url="/product/get-product-unit/"
                        selected_name={this.props.record.selected_uom}
                        selected_id={this.props.record.selected_uom_id}
                        item_selected={false}
                        create_option={true}
                        create_edit_option={false}
                    />
                </td>
                <td data-th="Unit Price">
                    {this.state.unit_price ?
                        <input type="text" id="unit_price" placeholder="Unit Price..." name="pro_up"
                               onChange={this.handle_change_unit_price.bind(this)}
                               value={this.state.unit_price ?this.state.unit_price:'' } onBlur={this.handleUnitPriceUpdate.bind(this)}/>

                        : <input type="text" id="unit_price" placeholder="Unit Price..." name="pro_up"
                                 onChange={this.handle_change_unit_price.bind(this)}
                                 value={this.props.record.unit_price?this.props.record.unit_price:''}
                                 onBlur={this.handleUnitPriceUpdate.bind(this)}/>
                    }
                </td>
                    <td>
                        <TaxDropDown
                            field_name="tax"
                            field_label="Tax"
                            show_lable={true}
                            set_return_data ={this.set_retrun_data.bind(this)}
                            get_data_url="/product/get-taxes/"
                            selected_name={this.props.record.selected_tax_name}
                            selected_id={this.props.record.selected_tax_id}
                            item_selected={true}
                            create_option={true}
                            create_edit_option={false}
                        />
                        </td>
                <td data-th="Discount (%)">
                    {this.state.discount ?
                        <input type="text" id="discount" placeholder="Discount.." name="pro_discount"
                               onChange={this.handle_change_discount.bind(this)}
                               value={this.state.discount} onBlur={this.handleDiscoutUpdate.bind(this)}>
                        </input>
                        :
                        <input type="text" id="discount" placeholder="Discount.." name="pro_discount"
                               onChange={this.handle_change_discount.bind(this)}
                               value={this.props.record.discount} onBlur={this.handleDiscoutUpdate.bind(this)}>
                        </input>
                    }
                </td>
                <td data-th="Subtotal">
                    <input type="text" name="pro_subtotal" value={this.props.record.subtotal}/>
                    <span onClick={this.handleRemoveTr.bind(this, this.props.tr_id)}
                          className="glyphicon glyphicon-trash" style={{'marginTop': '8px'}}></span>
                </td>
                {this.props.module == 'quotation' && this.props.item_type == 'order' ?
                    <input type="hidden" name="record_tax" value={this.props.record.tax_amt}/>
                    : null
                }
                {this.props.module == 'quotation' && this.props.item_type == 'optional' ?
                    <input type="hidden" name="record_tax" value={this.props.record.optax_amt}/>
                    : null
                }
            <ToastContainer />
            </tr>
        );
    }
}
module.exports = Product_tr;