import React from 'react';
import ReactTooltip from 'react-tooltip'
import {translate} from 'crm_react/common/language';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import ProductDropdown from 'crm_react/page/product/product-dropdown';
import TaxDropDown from 'crm_react/page/product/tax-drop-down';
import UnitMeasureDropDown from 'crm_react/page/product/unit-measure-drop-down';

import ProductHeader from 'crm_react/component/product-header';
import ProductTabs from 'crm_react/component/product-tabs';
import ProductExtraOptionLink from 'crm_react/component/product-extra-option-link';
import {getCookie, is_int, is_float, cursor_pointer} from 'crm_react/common/helper';
import {get_percentage} from 'crm_react/common/product-helper';
import { ToastContainer, toast } from 'react-toastify';


class Product_tr extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            index:null,
            items_type:null,
            item_type: this.props.item_type,
            tr_id: this.props.tr_id,
            unit_price: null,
            discount: null,
            items             : this.props.items!=undefined && this.props.items.length > 0 ? this.props.items : [],
            optional_items    : this.props.optional_items!=undefined ? this.props.optional_items : [],
            item_json         : {
                                'id':'',
                                'name': 'test2',
                                'pro_qty': 1,
                                'unit_price': 0.00,
                                'discount': 0,
                                'discription': '',
                                'selected_product': null,
                                'selected_product_id': null,
                                'selected_tax_name': null,
                                'selected_tax_id': null,
                                'selected_tax_value':null,
                                'selected_tax_computation':null,
                                'selected_uom':null,
                                'selected_uom_id':null,
                                'tax_amt': 0,
                                'subtotal': 0.00,
                                'type':'order'
                                },
            optional_json     : {
                                    'id':'',
                                    'name': 'test2',
                                    'pro_qty': 1,
                                    'unit_price': 0.00,
                                    'discount': 0,
                                    'discription': '',
                                    'selected_product': null,
                                    'selected_product_id': null,
                                    'selected_tax_name': null,
                                    'selected_tax_id': null,
                                    'selected_tax_value':null,
                                    'selected_tax_computation':null,
                                    'selected_uom':null,
                                    'selected_uom_id':null,
                                    'tax_amt': 0,
                                    'subtotal': 0.00,
                                    'type':'optional'

                                },
            untaxed_amt       : this.props.untaxed_amt!=undefined ? this.props.untaxed_amt  : 0 ,
            total_tax_amt     : this.props.total_tax_amt !=undefined ? this.props.total_tax_amt : 0 ,
            opuntaxed_amt     : this.props.opuntaxed_amt !=undefined ? this.props.opuntaxed_amt : 0 ,
            optotal_tax_amt   : this.props.optotal_tax_amt !=undefined ? this.props.optotal_tax_amt : 0 ,

        };
        //this.defaultItem()
        console.log("didupdate")
    }

    componentDidUpdate(oldProps, prevState) {
        const newProps = this.props
        if(oldProps.items !== newProps.items) {
            console.log("hello",oldProps.items, newProps.items, this.props.items, prevState.items)
            this.setState({ items: this.props.items})
        }
        if(oldProps.untaxed_amt !==newProps.untaxed_amt){
            this.setState({ untaxed_amt:this.props.untaxed_amt })
        }
        if(oldProps.total_tax_amt !==newProps.total_tax_amt){
            this.setState({ total_tax_amt:this.props.total_tax_amt })
        }
    }





    handleProductAdd(items_type) {
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        } else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        let item_len = items.length
        var ele_id = (items).length + 1;
        //items.push(this.props.items.concat(this.state.items))
        //items.concat(this.props.items)
        items.push({
            'id': ele_id,
            'name': 'test2',
            'pro_qty': 1,
            'unit_price': 0.00,
            'discount': 0,
            'discription': '',
            'selected_product': null,
            'selected_product_id': null,
            'selected_tax_name': null,
            'selected_tax_id': null,
            'selected_tax_value':null,
            'selected_tax_computation':null,
            'selected_uom':null,
            'selected_uom_id':null,
            'tax_amt': 0,
            'subtotal': 0.00,
            'type':items_type
        });
        this.setState({items_array: items});
    }

    handleRemoveTr(index) {
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



    handle_change_quantity(index, items_type, event) {
        let value = event.target.value
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        } else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        if(value !=''){
            if(is_int(value) || is_float(value)){
               items[index].pro_qty =value;
               items[index].subtotal = items[index].pro_qty * items[index].unit_price;

               /*if (items[index].selected_tax_computation === 'Percentage') {
                    items[index].tax_amt = ( ( items[index].subtotal * items[index].selected_tax_value) / 100 )
               } else if (items[index].selected_tax_computation === 'Fixed') {
                    items[index].tax_amt = items[index].selected_tax_value
               }*/

               this.setState({items_array: items})
               this.update_total_items_cal(items_type)
            }else{
               items[index].pro_qty =value;
               items[index].subtotal = items[index].pro_qty * items[index].unit_price;
               this.setState({items_array: items})
               this.update_total_items_cal(items_type)
               toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
            }
        }else{
               items[index].pro_qty =value;
               items[index].subtotal = items[index].pro_qty * items[index].unit_price;
               this.setState({items_array: items})
               this.update_total_items_cal(items_type)
        }
    }

    handle_change_unit_price(index, items_type, event) {
        let value = event.target.value
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        } else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        if (value != '' && (is_int(value) || is_float(value))) {
            value = value.replace(/,/g, '.')
            items[index].unit_price = value;
            items[index].subtotal = items[index].unit_price * items[index].pro_qty;
            this.setState({items_array: items})
            this.update_total_items_cal(items_type)
        } else {
            items[index].unit_price = value;
            items[index].subtotal = items[index].unit_price * items[index].pro_qty;
            this.setState({items_array: items})
            this.update_total_items_cal(items_type)
            toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
        }
    }

    handle_change_discount(index, items_type, event) {
        let value = event.target.value
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        } else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        let discount_amt = 0.00;
        if (value != '' && (is_int(value) || is_float(value))) {
            value = value.replace(/,/g, '.')
            items[index].discount = value;
            discount_amt = (value * items[index].subtotal) / 100;
            items[index].subtotal = items[index].subtotal - discount_amt;
            this.setState({items_array: items})
            this.update_total_items_cal(items_type)
        } else {
            items[index].discount = value;
            discount_amt = (value * items[index].subtotal) / 100;
            items[index].subtotal = items[index].subtotal - discount_amt;
            this.setState({items_array: items})
            this.update_total_items_cal(items_type)
            toast.error("Onyl integer or float value required !!", {position: toast.POSITION.TOP_RIGHT, toastId: "on_change_product_name"});
        }
    }


    handleChangeDescription(index, items_type, event) {
        var value = event.target.value;
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        } else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        items[index].discription = value;
        this.setState({items_array: items})
        this.props.updateProduct(items_type, index, discription, value);
    }
    //suyash
    set_retrun_data( index, items_type, data, dropdown){
       if(dropdown == 'product'){
            this.handle_selected_product(index, items_type, data.id, data.name)
       }
       if(dropdown == 'tax_on_sale'){
            this.handle_selected_taxes(index, items_type, data.id, data.name, data.value, data.computation)
       }
       if(dropdown == 'unit_of_measure'){
            this.handle_selected_uom(index, items_type, data.id, data.name)
       }
    }

    handle_selected_product(index, items_type, id, name) {
        if(id && index!=undefined){
            if (items_type == 'order') {
                var items = this.state.items;
                var items_array = 'items'
            } else if (items_type == 'optional') {
                var items = this.state.optional_items;
                var items_array = 'optional_items'
            }
            items[index].selected_product = name;
            items[index].selected_product_id = id;
            this.setState({items_array: items})
            $.ajax({
                type: "POST",
                cache: false,
                url: '/sales-order/get-product-data/',
                data: {
                    csrfmiddlewaretoken: getCookie('csrftoken'),
                    ajax: true,
                    id: id
                },
                beforeSend: function () {
                    this.setState({processing: true})
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        this.setState({processing: false})
                          items[index].discription = data.discription;
                          items[index].unit_price = data.sale_price;
                          items[index].pro_qty = 1;
                          items[index].discount = 0;
                          items[index].subtotal = items[index].pro_qty * items[index].unit_price;
                          items[index].selected_uom = data.uom_name;
                          items[index].selected_uom_id = data.uom_id;
                          items[index].selected_tax_id = data.tax_id;
                          items[index].selected_tax_name = data.tax_name;
                          items[index].selected_tax_value = data.tax_value;
                          items[index].selected_tax_computation = data.tax_computation;
                        if (items_type == 'order') {
                            var current_item = items[index];
                            var tax_amt = 0;
                            items[index].tax_amt = tax_amt;
                            this.setState({items_array: items})
                        }
                        else if (items_type == 'optional') {
                            var current_item = items[index];
                            var tax_amt = 0;
                            items[index].tax_amt = tax_amt;
                            this.setState({items_array: items})
                        }
                    }
                    this.handle_selected_taxes(index, items_type, data.tax_id, data.tax_name, data.tax_value, data.tax_computation)
                    //this.handle_selected_uom(data.uom_id, data.uom_name)
                    this.update_total_items_cal(items_type)
                }.bind(this)
            });
        }
    }

    handle_selected_taxes(index, items_type, id, name, tax_value, tax_computation) {
        let items_array;
        if (items_type == 'order') {
            items_array = this.state.items;
        } else if (items_type == 'optional') {
            items_array = this.state.optional_items;
        }
        if (items_type != undefined && index != undefined && id != undefined && name != undefined && tax_value != undefined && tax_computation != undefined) {
            items_array[index].selected_tax_name = name
            items_array[index].selected_tax_id = id
            items_array[index].selected_tax_value = tax_value
            items_array[index].selected_tax_name_computation = tax_computation
            if (tax_computation === 'Percentage') {
                items_array[index].tax_amt = ( ( items_array[index].subtotal * tax_value) / 100 )
            } else if (tax_computation === 'Fixed') {
                items_array[index].tax_amt = tax_value
            }
        } else {
            items_array[index].selected_tax_name = ''
            items_array[index].selected_tax_id = ''
            items_array[index].selected_tax_value = 0.00
            items_array[index].tax_amt = 0.00
        }
        this.setState({items_array: items_array})
        this.update_total_items_cal(items_type)
        this.cal_multiple_tax(items_type)
    }


    handle_selected_uom(index, items_type, id, name) {
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        }else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        if(index !=undefined){
            items[index].selected_uom = name;
            items[index].selected_uom_id = id;
            this.setState({items_array: items})
            this.update_total_items_cal(items_type)
        }
    }


    update_total_items_cal(items_type) {
        if (items_type == 'order') {
            var items_array = this.state.items;
        }else if (items_type == 'optional') {
            var items_array = this.state.optional_items;
        }
        let total_calucation_data = {'untaxed_amt': 0.00, 'total_tax_amt': 0.00}
        if (items_array != undefined && items_array.length > 0) {
            let i = 0;
            for (i = 0; i < items_array.length; i++) {
                if (items_array[i].subtotal != '' && items_array[i].subtotal != undefined) {
                    total_calucation_data['untaxed_amt'] = total_calucation_data['untaxed_amt'] + items_array[i].subtotal
                }
                if (items_array[i].selected_tax_value != '' && items_array[i].subtotal != undefined) {
                    let tax_amt = get_percentage(items_array[i].subtotal, items_array[i].selected_tax_value);
                    if (items_array[i].selected_tax_name_computation === 'Percentage') {
                        total_calucation_data['total_tax_amt'] = total_calucation_data['total_tax_amt'] + tax_amt ;
                    } else if (items_array[i].selected_tax_name_computation === 'Fixed') {
                        tax_amt = (items_array[i].subtotal + items_array[i].selected_tax_name_computation);
                        total_calucation_data['total_tax_amt'] = total_calucation_data['total_tax_amt'] + tax_amt ;
                    }
                    items_array[i].tax_amt =  tax_amt
                }
            }
            if (items_type === 'order') {
                this.setState({
                    untaxed_amt: total_calucation_data['untaxed_amt'],
                    total_tax_amt: total_calucation_data['total_tax_amt'],
                    items:items_array,
                })
            } else if (items_type === 'optional') {
                this.setState({
                    opuntaxed_amt: total_calucation_data['untaxed_amt'],
                    optotal_tax_amt: total_calucation_data['total_tax_amt'],
                    optional_items:items_array
                })
            }
            let return_data = {'items':this.state.items,
                                'tax_amt':this.state.total_tax_amt,
                                'untaxed_amt': this.state.untaxed_amt,
                                'optional_items':this.state.optional_items,
                                'optax_amt':this.state.optotal_tax_amt,
                                'opuntaxed_amt': this.state.opuntaxed_amt,
                              }
            this.props.update_row_items(return_data )
        }
    }

    cal_multiple_tax(items_type) {
        let items_array;
        let multiple_tax = [];
        if (items_type == 'order') {
            items_array = this.state.items;
        } else if (items_type == 'optional') {
            items_array = this.state.optional_items;
        }
        if (items_array.length > 0) {
            let taxes = {};
            let i = 0;
            let tax_amt = 0.00;
            for (i = 0; i < items_array.length; i++) {
                if (items_array[i].selected_tax_name in taxes) {
                    taxes[items_array[i].selected_tax_name] = items_array[i].tax_amt + taxes[items_array[i].selected_tax_name]
                } else {
                    taxes[items_array[i].selected_tax_name] = get_percentage(items_array[i].subtotal, items_array[i].selected_tax_value)
                }
            }

            for (var key in taxes) {
                multiple_tax.push({'tax_name': key, 'tax_amount': taxes[key]})
            }

            if (items_type == 'order') {
                this.setState({multiple_tax: multiple_tax})
            } else if (items_type == 'optional') {
                this.setState({op_multiple_tax: multiple_tax})
            }

        }
    }
    render_total_calculations(calculation_for){
          let opp_quo = this.state.opp_quo
          let total_amount = this.state.untaxed_amt+this.state.total_tax_amt
          let optotal_amount = this.state.opuntaxed_amt+this.state.optotal_tax_amt
          return(
              <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3 pull-right quotation-total">
                <table>
                   <tbody>
                    <tr>
                        <td>{translate('untaxed_total_amount')} :</td>
                        <td>
                            { calculation_for === 'order'?
                                <span>{this.state.untaxed_amt ?this.state.untaxed_amt.toFixed(2):0.00}</span>
                                : calculation_for === 'optional'?
                                    <span>{this.state.opuntaxed_amt ?this.state.opuntaxed_amt.toFixed(2):0.00}</span>
                                : null
                            }
                            <span className="push-left-2">{this.props.currency}</span>
                        </td>
                    </tr>
                    <tr>
                          <td>{translate('taxes')}:
                            <span  data-tip data-for='tax_info'   className="glyphicon glyphicon-info-sign text-primary push-left-1"></span>
                            <ReactTooltip place="bottom"  id='tax_info' type="info" effect="float">
                              <span>If multiple tax exist, the detail will be display on final document</span>
                            </ReactTooltip>
                        </td>
                        <td>
                            { calculation_for === 'order' ?
                                    <span>{this.state.total_tax_amt ? this.state.total_tax_amt.toFixed(2) : 0.00}</span>
                                : calculation_for === 'optional' ?
                                    <span>{this.state.optotal_tax_amt ? this.state.optotal_tax_amt.toFixed(2) : 0.00}</span>
                                : null
                            }

                            <span className="push-left-2">{this.props.currency}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>{translate('total')}: <small className="pull-right quo-total-update"></small></td>
                        <td>
                            { calculation_for === 'order' ?
                                <span className="lead">{total_amount?(total_amount.toFixed(2)):0.00}</span>
                            : calculation_for === 'optional' ?
                                <span className="lead">{total_amount?(optotal_amount.toFixed(2)):0.00}</span>
                            :   null
                            }
                            <span className="lead push-left-2">{this.props.currency}</span>
                        </td>
                    </tr>
                  </tbody>
                </table>
              </div>
          );
    }

  render_tr(item, items_type, index){
        return (
                <tr key={'index_'+index} className="product_row">
                    <td>&nbsp;</td>
                    <td data-th="Product">
                        <ProductDropdown
                            field_name="product"
                            field_label="Product"
                            show_lable={true}
                            set_return_data ={this.set_retrun_data.bind(this)}
                            get_data_url="/product/get-product/"
                            post_data_url="/contact/company_create/"
                            selected_name={item.selected_product}
                            selected_id={item.selected_product_id}
                            item_selected={false}
                            create_option={true}
                            create_edit_option={false}
                            items_type={items_type}
                            index={index}
                        />
                    </td>
                    <td data-th="Description">
                        <input type="text" placeholder="Description..." id="discription"
                               onChange={this.handleChangeDescription.bind(this,index, items_type)} name="pro_discription"
                               value={item.discription}/>
                    </td>
                    <td data-th="Order Qty">
                            <input type="text" id="pro_qty" placeholder="Quantity..." name="pro_qty"
                                   value={item.pro_qty}
                                   onChange={this.handle_change_quantity.bind(this,index, items_type)}
                            />
                    </td>
                    <td data-th="Unit Of Measure">
                        <UnitMeasureDropDown
                            field_name="unit"
                            field_label="Unit"
                            show_lable={true}
                            set_return_data ={this.set_retrun_data.bind(this)}
                            get_data_url="/product/get-product-unit/"
                            selected_name={item.selected_uom}
                            selected_id={item.selected_uom_id}
                            item_selected={false}
                            create_option={true}
                            create_edit_option={false}
                            items_type={items_type}
                            index={index}
                        />
                    </td>
                    <td data-th="Unit Price">
                        <input type="text" id="unit_price" placeholder="Unit Price..." name="pro_up"
                               onChange={this.handle_change_unit_price.bind(this, index, items_type)}
                               value={item.unit_price ? item.unit_price:'' }

                        />
                    </td>
                        <td>
                            <TaxDropDown
                                field_name="tax"
                                field_label="Tax"
                                show_lable={true}
                                set_return_data ={this.set_retrun_data.bind(this)}
                                get_data_url="/product/get-taxes/"
                                selected_name={item.selected_tax_name}
                                selected_id={item.selected_tax_value}
                                item_selected={true}
                                create_option={true}
                                create_edit_option={false}
                                items_type={items_type}
                                index={index}
                            />
                            </td>
                    <td data-th="Discount (%)">
                        <input type="text" id="discount" placeholder="Discount.." name="pro_discount"
                               onChange={this.handle_change_discount.bind(this, index, items_type)}
                               value={item.discount} >
                        </input>

                    </td>
                    <td data-th="Subtotal">
                        <div className="form-group">
                            <input type="text" name="pro_subtotal" value={item.subtotal} />
                        </div>
                        <span className="glyphicon glyphicon-trash"></span>
                    </td>
                </tr>
        );
  }

  render() {

        let items = this.state.items;
        console.log("this.props.items", items);
        return (
            <div key={this.props.items}>
                <ProductTabs module={this.props.module}/>
                    <div className="tab-content">
                        <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                              <table className="quotation-product-detail table list-table">
                                <ProductHeader module={'quotation'} item_type={'order'}/>
                                  <tbody className ="options_numbers" >
                                      {items.length > 0 ?
                                        items.map((list, i)=>{
                                            return this.render_tr(list, 'order', i)
                                        })
                                        : null
                                      }
                                  </tbody>
                              </table>
                                <div className="add-new-product">
                                    <a href="javascript:void(0)" className="btn btn-new" onClick={this.handleProductAdd.bind(this,'order')}>{translate('add_new_product')}  </a>
                                </div>
                              <div className="row">
                                <div className="col-xs-12 col-sm-6 col-md-5 col-lg-6 note">
                                    <textarea rows="4" cols="10" name="qt_note" placeholder={translate('setup_default_terms_and_conditions_in_your_company_settings.')}></textarea>
                                </div>
                                  {this.render_total_calculations('order')}
                              </div>
                        </div>
                        <div id="field-tab-2" role="tabpanel" className="tab-pane">
                            <table className="quotation-product-detail suggested-products table list-table">
                                <ProductHeader module={'quotation'} item_type={'optional'}/>
                                <tbody>
                                  {this.state.optional_items.length > 0 ?
                                    this.state.optional_items.map((list, i)=>{
                                        return this.render_tr(list, 'optional', i)
                                    })
                                    : null
                                  }
                                </tbody>
                            </table>
                            <div className="add-new-product">
                                <a href="javascript:void(0)" className="btn btn-new" onClick={this.handleProductAdd.bind(this,'optional')} >{translate('add_new_product')}</a>
                            </div>
                             <div className="row">
                                  {this.render_total_calculations('optional') }
                             </div>
                        </div>
                        {this.props.extra_option_link !=null ?
                          <div id="field-tab-3" role="tabpanel" className="tab-pane">
                            <ProductExtraOptionLink url={this.props.extra_option_link} />
                          </div>
                          :null
                        }
                    </div>
            </div>
        );
  }
}
module.exports = Product_tr;