import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import {SortableHandle} from 'react-sortable-hoc';
import Dropdown from 'crm_react/component/Dropdown';
import {translate} from 'crm_react/common/language';


const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);

class  Product_tr extends React.Component {

	constructor(props) {
        super(props);

        this.state = {
                        item_type :  this.props.item_type,
                        tr_id : this.props.tr_id,
                        pro_qty : null,
                        unit_price : null,
                        discount : null,
                        processing : false,
                    }
        }

    handleRemoveTr(){
       this.props.handleDeleteTr(this.props.record, this.state.item_type)

    }

    handleDiscoutUpdate(event){
        var index     = this.props.tr_id;
        var value     = event.target.value;
        var tax_id    = this.props.record.selected_taxes_id

          console.log(value)
          console.log(tax_id)
          if(tax_id!=0 && tax_id>0){
            $.ajax({
            type: "POST",
            cache: false,
            url: '/product/getTaxesById/'+tax_id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                  this.props.updateDiscount(this.state.item_type, index, value,data.value,data.computation);
                }
            }.bind(this)
        });
        }
    }

    handleQtyUpdate(event){
        var index     = this.props.tr_id;
        var value     = event.target.value;
        var tax_id    = this.props.record.selected_taxes_id
        if(tax_id != 0 && tax_id > 0){
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/getTaxesById/'+tax_id,
                data: {
                  ajax: true,
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if(data.success===true){
                      //this.props.updateQty(this.state.item_type, index, value, data.value, data.computation);
                    }
                }.bind(this)
            });
        }
    }

    handleUnitPriceUpdate(event){
        var index     = this.props.tr_id;
        var value     = event.target.value;
        var tax_id    = this.props.record.selected_taxes_id

          console.log(value)
          console.log(tax_id)
          if(tax_id!=0 && tax_id>0){
            $.ajax({
            type: "POST",
            cache: false,
            url: '/product/getTaxesById/'+tax_id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                  this.props.updateUnitPrice(this.state.item_type, index, value,data.value,data.computation);
                }
            }.bind(this)
        });
        }
    }

    handle_change_quantity(event) {
        let value = event.target.value
        let index = this.props.tr_id;
        let attribute = event.target.id;
        this.props.record.pro_qty = value
        if (value != '') {
            value = value.replace(/,/g, '.')
        } else {
            this.setState({pro_qty: null})
        }
        this.props.updateProduct(this.state.item_type, index, attribute, value);
        this.props.updateQty(this.state.item_type, index, attribute, value)
    }

    handle_change_unit_price(event) {
        let value = event.target.value
        let index = this.props.tr_id;
        let attribute = event.target.id;
        this.props.record.unit_price = value
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
        this.props.record.discount = value
        if (value != '') {
            value = value.replace(/,/g, '.')
        } else {
            this.setState({discount: null})
        }
        this.props.updateProduct(this.state.item_type, index, attribute, value);
        this.props.updateQty(this.state.item_type, index, attribute, value)
    }

    handleChange(event) {
        var value     = event.target.value;
        var index     = this.props.tr_id;
        var attribute = event.target.id;
        this.props.updateProduct(this.state.item_type, index, attribute, value);
    }

//function : open model for search more product
    handleSearchMoreProduct(){
        var tr_id  = this.props.tr_id
        var field = 'product';
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }

//function : open model for search more unit of measure
    handleSearchMoreUom(){
        var tr_id  = this.props.tr_id
        var field = 'uom';
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }

    handleSearchMoreTaxes(){
        var tr_id  = this.props.tr_id
        var field = 'taxes';
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }
//function : open model for create and edit  unit of measure
    handleProductAddedit(pro_id,input_value){
        var tr_id  = this.props.tr_id
        this.props.openProductModal(this.state.item_type, tr_id, pro_id,input_value);
    }


//function : open modal for create(id=0) or edit(id>0)
    handleUomAddedit(uom_id,input_value){
        var tr_id  = this.props.tr_id
        this.props.openUOMModal(this.state.item_type, tr_id, uom_id,input_value)
    }

//function : open modal for create(id=0) or edit(id>0)
    handleTaxesAddedit(taxes_id, input_value){
        var tr_id  = this.props.tr_id
        this.props.openTaxesModal(this.state.item_type,tr_id, taxes_id, input_value)
    }

    handleselectedProduct(id, name){
        var tr_id  = this.props.tr_id
        this.props.handleselectedProduct(this.state.item_type ,tr_id, id, name)
    }

    handleselectedUOM(id, name){
         var tr_id  = this.props.tr_id
        this.props.handleselectedUOM(this.state.item_type ,tr_id, id, name)
    }

    handleselectedTaxes(id, name){

        var tr_id       = this.props.tr_id

          if(id!=0 && id>0){
            $.ajax({
            type: "POST",
            cache: false,
            url: '/product/getTaxesById/'+id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                 this.props.handleselectedTaxes(this.state.item_type,tr_id, id,name,data.value,data.computation)
                }
            }.bind(this)
        });
        }
    }

    quotationadddata(){
      this.props.quotationadddata()
    }

  render() {
        var margin_top ={marginTop:'8px'}
        return (
                <tr key={this.props.index} className = "product_row">
                    <td><DragHandle /></td>
                    <td data-th="Product">
                        <Dropdown       json_data             = {this.props.record.json_product}
                                        input_value           = {this.props.record.selected_product}
                                        input_id              = {this.props.record.selected_product_id}
                                        setSelected           = {this.handleselectedProduct.bind(this)}
                                        tr_id                 = {this.props.tr_id}
                                        create_edit           = {true}
                                        search_more           = {true}
                                        product_dropdown      = {true}
                                        inputname             = "pro_id"
                                        handleViewCateList    = {this.handleSearchMoreProduct.bind(this)}
                                        handleAddEdit         = {this.handleProductAddedit.bind(this)} />
                    </td>
                    <td data-th="Description">
                        <input type="text" id = "discription" onChange={this.handleChange.bind(this)}   name="pro_discription" value={this.props.record.discription} /></td>
                    <td data-th="Order Qty">
                        {this.state.pro_qty ?
                            <input type="text" id="pro_qty" placeholder="Quantity..." name="pro_qty"
                                   onBlur={this.handleQtyUpdate.bind(this)}
                                   onChange={this.handle_change_quantity.bind(this)} value={this.state.pro_qty}/>
                            : <input type="text" id="pro_qty" placeholder="Quantity..." name="pro_qty"
                                     onBlur={this.handleQtyUpdate.bind(this)}
                                     onChange={this.handle_change_quantity.bind(this)} value={this.props.record.pro_qty}/>
                        }
                    </td>

                    <td data-th="Unit Of Measure">
                        <Dropdown
                            json_data         = {this.props.record.json_uom}
                            input_value       = {this.props.record.selected_uom}
                            input_id          = {this.props.record.selected_uom_id}
                            setSelected       = {this.handleselectedUOM.bind(this)}
                            tr_id             = {this.props.tr_id}
                            inputname         = "pro_uom"
                            create_edit       = {true}
                            search_more       = {true}
                            product_dropdown  = {true}
                            handleViewCateList= {this.handleSearchMoreUom.bind(this)}
                            handleAddEdit     = {this.handleUomAddedit.bind(this)}
                            placeholder         = 'Select Unit..'
                            quotationadddata  = {this.quotationadddata.bind(this)}
                        />
                    </td>

                    <td data-th="Unit Price">
                        {this.state.unit_price ?
                            <input type="text" id="unit_price" placeholder="Unit Price..." name="pro_up"
                                   onChange={this.handle_change_unit_price.bind(this)}
                                   value={this.state.unit_price} onBlur={this.handleUnitPriceUpdate.bind(this)}/>

                            : <input type="text" id="unit_price" placeholder="Unit Price..." name="pro_up"
                                     onChange={this.handle_change_unit_price.bind(this)}
                                     value={this.props.record.unit_price}
                                     onBlur={this.handleUnitPriceUpdate.bind(this)}/>
                        }
                    </td>

                    {this.props.module=='quotation' && this.props.item_type=='order' ?
                    <td>
                        <Dropdown     json_data           = {this.props.record.json_taxes}
                                      input_value         = {this.props.record.selected_taxes}
                                      input_id            = {this.props.record.selected_taxes_id}
                                      setSelected         = {this.handleselectedTaxes.bind(this)}
                                      tr_id               = {this.props.tr_id}
                                      inputname           = "pro_tax"
                                      create_edit         = {true}
                                      search_more         = {true}
                                      product_dropdown    = {true}
                                      handleViewCateList  = {this.handleSearchMoreTaxes.bind(this)}
                                      handleAddEdit       = {this.handleTaxesAddedit.bind(this)}
                                      quotationadddata    = {this.quotationadddata.bind(this)} />
                    </td>
                     :null}
                    <td data-th="Subtotal">
                        <input type="text" name="pro_subtotal" value={this.props.record.subtotal} />
                         <span onClick={this.handleRemoveTr.bind(this)} className="glyphicon glyphicon-trash"  style={margin_top} ></span>
                    </td>
                    {this.props.module=='quotation' && this.props.item_type=='order' ?
                        <input type="hidden" name ="record_tax" value = {this.props.record.tax_amt}  />
                       :null
                    }
                    {this.props.module=='quotation' && this.props.item_type=='optional' ?
                        <input type="hidden" name ="record_tax" value = {this.props.record.optax_amt}  />
                       :null
                    }

                </tr>

        );
  }
}
module.exports = Product_tr;