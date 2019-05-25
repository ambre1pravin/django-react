import React from 'react';
import ReactTooltip from 'react-tooltip'
import {Link, browserHistory } from 'react-router'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { DateField, DatePicker } from 'react-date-picker'
import 'react-date-picker/index.css'
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import Reminder_tr from 'crm_react/page/quotation/Reminder_tr';
import Customer from 'crm_react/component/customer';
import QuotationTemplateDropDown from 'crm_react/page/product/quotation-template-drop-down';
import PaymentTermDropDown from 'crm_react/page/product/payment-term-drop-down';
import ProductHeader from 'crm_react/component/product-header';
import ProductTabs from 'crm_react/component/product-tabs';
import Product_tr from 'crm_react/page/quotation/Product_tr';
import {translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {getCookie} from 'crm_react/common/helper';
import {get_percentage} from 'crm_react/common/product-helper';
import { ToastContainer, toast } from 'react-toastify';




const SortableNumber_tr = SortableElement(
                        ({record, key,updateReminder,handleReminderDeleteTr}) => <Reminder_tr
                                          record = {record}
                                          updateReminder                 = {updateReminder}
                                          handleReminderDeleteTr        = {handleReminderDeleteTr}
                                          key    = {key}  /> );

const SortableNumberList_tbody = SortableContainer(({options_numbers,updateReminder,handleReminderDeleteTr}) => {
    return (
        <tbody className ="options_numbers" >
            {options_numbers.map((record, index) =>
                <SortableNumber_tr  key                   = {`item-${index}`}
                                  index                 = {index}
                                  updateReminder        = {updateReminder}
                                  handleReminderDeleteTr  = {handleReminderDeleteTr}
                                  record                = {record} />
            )}
        </tbody>
    );
});

const SortableItem_tr = SortableElement(
                                        ({   record,
                                             key,
                                             tr_id,
                                             handleDeleteTr,
                                             updateProduct,
                                             handleselectedProduct,
                                             handleselectedUOM,
                                             handleselectedTaxes,
                                             updateDiscount,
                                             updateQty,
                                             updateUnitPrice,
                                             module,
                                             item_type
                                        })=> <Product_tr
                                                    record = {record}
                                                    tr_id                 = {tr_id}
                                                    key                   = {key}
                                                    updateProduct         = {updateProduct}
                                                    handleDeleteTr        = {handleDeleteTr}
                                                    handleselectedProduct = {handleselectedProduct}
                                                    handleselectedUOM     = {handleselectedUOM}
                                                    handleselectedTaxes   = {handleselectedTaxes}
                                                    updateDiscount        = {updateDiscount}
                                                    updateQty             = {updateQty}
                                                    updateUnitPrice       = {updateUnitPrice}
                                                    module                = {module}
                                                    item_type             = {item_type}>
                                        </Product_tr>
                        );

const SortableList_tbody = SortableContainer(({items, updateProduct, handleDeleteTr, handleselectedProduct, handleselectedUOM, handleselectedTaxes,  updateDiscount, updateQty, updateUnitPrice, module, item_type}) => {
        return (
        <tbody  className = {item_type} >
            {items.map((record, index) =>
                <SortableItem_tr  key                   = {`item-${index}`}
                                  tr_id                 = {index}
                                  index                 = {index}
                                  handleDeleteTr        = {handleDeleteTr}
                                  handleselectedProduct = {handleselectedProduct}
                                  updateProduct         = {updateProduct}
                                  record                = {record}
                                  handleselectedUOM     = {handleselectedUOM}
                                  handleselectedTaxes   = {handleselectedTaxes}
                                  updateDiscount        = {updateDiscount}
                                  updateQty             = {updateQty}
                                  updateUnitPrice       = {updateUnitPrice}
                                  module                = {module}
                                  item_type             = {item_type} />
            )}
        </tbody>
    );
});


class  QuotationAdd extends React.Component {
    constructor(){
    super();
    this.state = {
                result            : null,
                items             : [],
                optional_items    : [],
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

                                     },
                products_list     : [],
                uom_list          : [],
                taxes_list        : [],
                options_numbers   : ['id':1 ],
                untaxed_amt       : 0 ,
                total_tax_amt     : 0 ,
                opuntaxed_amt     : 0 ,
                optotal_tax_amt   : 0 ,
                select_customer_id    : 0,
                select_customer_name : '',
                selected_tmpl_name: '',
                selected_tmpl_id  : '',
                order_date        :'',
                expiration_date   : '',
                pmt_list          :[],
                selected_payment_id:0,
                selected_payment_name:'',
                email_reminder    : false,
                processing        : false,
                multiple_tax      :[],
                op_multiple_tax   :[],
                module_name :'sales-order',
                product_rows:[],
                notes:''
    }
    this.storData                     = this.storData.bind(this);
    this.handleChangeOrderDate        = this.handleChangeOrderDate.bind(this);
    this.handleChangeExpireDate       = this.handleChangeExpireDate.bind(this);
    this.handleChangeEmailReminder    = this.handleChangeEmailReminder.bind(this);
  }

   getInitialState(){
        return {loaded:false}
   }

   set_customer_id_name(data){
       this.setState({select_customer_id:data.id,select_customer_name:data.name})
   }

   set_payment_term_data(data){
        this.setState({selected_payment_id:data.id, selected_payment_name:data.name})
   }

   set_quotation_template(data){
        this.setState({selected_tmpl_id:data.id, selected_tmpl_name:data.name})
   }

  storData(){
      var store1 = localStorage.getItem('search');
      var storetotal1 = localStorage.getItem('searchtotal');
      var storecustomer1 = localStorage.getItem('searchcustomer');
      var parameter1 = localStorage.getItem('parameter');
      var parameter = parameter1 ? JSON.parse(parameter1) : []
      var store = store1 ? JSON.parse(store1) : []
      var storetotal = storetotal1 ? JSON.parse(storetotal1) : []
      var storecustomer = storecustomer1 ? JSON.parse(storecustomer1) : []
      var keydata = localStorage.getItem('keydata');
      var keydata1 = keydata ? JSON.parse(keydata) : []

      if (keydata1!== null && keydata1!='' && keydata1!==undefined ){
          localStorage.setItem('keydata1',JSON.stringify(keydata1));
         }
      else{
           localStorage.setItem('keydata1',[]);
        }

      if (parameter!== null && parameter!='' && parameter!==undefined ){
          localStorage.setItem('parameter1',JSON.stringify(parameter));
         }
      else{
           localStorage.setItem('parameter1',[]);
        }

      if (store!== null && store!='' && store!==undefined ){
          localStorage.setItem('search1',JSON.stringify(store));
         }
      else{
           localStorage.setItem('search1',[]);
        }

        if (storetotal!== null && storetotal!='' && storetotal!==undefined ){
          localStorage.setItem('searchtotal1',JSON.stringify(storetotal));
         }
      else{
           localStorage.setItem('searchtotal1',[]);
        }

        if (storecustomer!== null && storecustomer!='' && storecustomer!==undefined ){
          localStorage.setItem('searchcustomer1',JSON.stringify(storecustomer));
         }
      else{
           localStorage.setItem('searchcustomer1',[]);
        }
  }


  componentDidMount(){
    this.storData();
    this.quotationadddata();
  }

quotationadddata(){
    var opportunity_store_id      = localStorage.getItem('opportunity_store_id');
    var opportunity_store_name    = localStorage.getItem('opportunity_store_name');
    var opp_quo                   = localStorage.getItem('opp_quo');

      this.serverRequest = $.get('/quotation/adddata/', function (data) {
        this.setState({
            result              : data,
            currency            : data.currency,
            opp_quo             : opp_quo,
            },

            ()=>{this.defaultItem()}
            );
       }.bind(this)).then(function(result){

      }.bind(this));
      this.defaultItem()
  }


  defaultItem(){

    let items_arr = []
    let optional_items_arr = []
    let options_numbers_arr = []

    let products_list = this.state.products_list;
    let uom_list      = this.state.uom_list;
    let taxes_list    = this.state.taxes_list;
    let item_json     = this.state.item_json;
    let optional_json = this.state.optional_json;

    item_json.json_product = products_list
    item_json.json_uom     = uom_list
    item_json.json_taxes   = taxes_list

    optional_json.json_product = products_list
    optional_json.json_uom = uom_list

    items_arr.push(item_json);
    optional_items_arr.push(optional_json);


    let options_number = this.state.options_numbers;
      this.setState({
        items:items_arr,
        optional_items : optional_items_arr,
        options_numbers : options_numbers_arr,

      });
  }


  onSortEnd({oldIndex, newIndex}){
    this.setState({
        items: arrayMove(this.state.items, oldIndex, newIndex)
    });
  }

  onSortEndOptional({oldIndex, newIndex}){
    this.setState({optional_items: arrayMove(this.state.optional_items, oldIndex, newIndex) });
  }

  setPaymentname(id,name){
        this.setState({selected_payment_name : name, selected_payment_id  :id, })
  }


  handleSubmit(quot_status=''){
        let items = this.state.items;
        let product_rows = [];
        if(items.length > 0){
            for(var i=0; i < items.length; i++){
                product_rows.push(
                    {'product_id':items[i].selected_product_id,
                    'uom':items[i].selected_uom_id,
                    'tax':items[i].selected_tax_id,
                    'description':items[i].discription,
                    'order_qty':items[i].pro_qty,
                    'unit_price':items[i].unit_price,
                    'tax_amt':items[i].tax_amt,
                    'discount':items[i].discount,
                    'subtotal':items[i].subtotal,
                    }
                );
            }
            let Data = {'customer_id':this.state.select_customer_id,
                        'customer_name':this.state.select_customer_name,
                        'quot_tmpl':this.state.selected_tmpl_id,
                        'order_date':this.state.order_date,
                        'expexted_closing':this.state.expiration_date,
                        'payment_term':this.state.selected_payment_id,
                        'products':product_rows,
                        'optional_products':[],
                        'options_numbers':[],
                        'module_name':this.state.module_name,
                        'opportunity_id':this.state.opportunity_id,
                        'untaxed_amt':this.state.untaxed_amt,
                        'tax_amt':this.state.total_tax_amt,
                        'notes':this.state.notes
                        };
            if(this.state.select_customer_id > 0 && product_rows.length > 0) {
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/quotation/saveQuatation/',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(Data),
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                        //this.setState({processing : true})
                    }.bind(this),
                    success: function (data) {
                        if (data.success === true) {
                            this.setState({processing : false});
                            browserHistory.push("/sales/order/view/" + data.uuid + "/");
                        }
                    }.bind(this)
                });
            }else{
                 toast.error("Customer Name", {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
            }
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
        var ele_id = (items).length + 1;
        items.push({
            'id': ele_id,
            'selected_uom':null,
            'selected_uom_id':null,
            'unit_price': 0.00,
            'discount': 0,
            'discription': '',
            'selected_product': null,
            'selected_product_id':null,
            'selected_tax_name': null,
            'selected_tax_id': null,
            'selected_tax_value':null,
            'selected_tax_computation':null,
            'tax_amt': 0,
            'subtotal': 0.00,
        });
        this.setState({items_array: items});
    }

    handleEmailReminder() {
        var options_numbers = this.state.options_numbers;
        var ele_id = (options_numbers).length + 1;
        options_numbers.push({'id': ele_id});
        this.setState({options_numbers: options_numbers});
    }

    handleReminderDeleteTr(id) {
        var items = this.state.options_numbers;
        var item_length = this.state.options_numbers.length;
        var index = -1;
        for (var i = 0; i < item_length; i++) {
            if (items[i].id == id.id) {
                index = i;
            }
        }
        for (var i = 0; i < item_length; i++) {
            if (items[i].id == id.id) {
                index = i;
            }
        }
        items.splice(index, 1);
        this.setState({items_array: items,})
    }

    handleDeleteTr(item, items_type, index) {
        let items_array;
        if (items_type == 'order') {
            items_array = this.state.items;
        } else if (items_type == 'optional') {
            items_array = this.state.optional_items;
        }
        if (items_array != undefined && items_array.length > 0) {
            items_array.splice(index, 1);
            this.setState({items_array: items_array})
        }
        this.update_total_items_cal(items_type)
    }


    updateReminder(index, attribute, value) {
        var items = this.state.options_numbers;
        items[index][attribute] = value;
        this.setState({options_numbers: items})
    }

    updateProduct(items_type, index, attribute, value) {
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        } else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        items[index][attribute] = value;
        this.setState({items_array: items})
    }


    handleselectedProduct(items_type, index, id, name) {

      if(id) {
          if (items_type == 'order') {
              var items = this.state.items;
              var items_array = 'items'
          } else if (items_type == 'optional') {
              var items = this.state.optional_items;
              var items_array = 'optional_items'
          }
          items[index].selected_product = name;
          items[index].selected_product_id = id;
          this.setState({items_array: items});
          $.ajax({
              type: "POST",
              cache: false,
              url: '/sales-order/get-product-data/',
              data: {
                  ajax: true,
                  id: id,
                  csrfmiddlewaretoken: getCookie('csrftoken')
              },
              beforeSend: function () {
                  this.setState({processing: true})
              }.bind(this),
              success: function (data) {
                  if (data.success === true) {
                      this.setState({processing: false});
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
                          tax_amt = this.handleTaxCalculation(data.tax_value, data.tax_computation, current_item);
                          items[index].tax_amt = tax_amt;
                          this.setState({items_array: items})
                      }else if (items_type == 'optional') {
                          var current_item = items[index];
                          var tax_amt = 0;
                          tax_amt = this.handleTaxCalculation(data.tax_value, data.tax_computation, current_item);
                          items[index].tax_amt = tax_amt;
                          this.setState({items_array: items})
                      }
                  }
                      this.handleselectedTaxes(items_type, index, data.tax_id, data.tax_name, data.tax_value, data.tax_computation)
                      this.handleselectedUOM(items_type, index, data.uom_id, data.uom_name)
                      this.update_total_items_cal(items_type)
              }.bind(this)
          });
      }

    }

    handleTaxCalculation(value, computation, item_data) {
        var tax_amt = 0;
        var tax_meta = ''
        if (value != '') {
            if (computation == 'Fixed') {
                tax_amt = item_data.pro_qty * value
            }else if (computation == 'Percentage') {
                tax_amt = (item_data.subtotal * value) / 100;
            }
        }
        return tax_amt;
    }

    handleselectedUOM(items_type, index, id, name) {
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
            this.update_total_items_cal(items_type);
        }
    }


    updateTaxesJson(id, taxes_obj) {
        var json_list = this.state.taxes_list;
        var index = -1;
        for (var i = 0; i < json_list.length; i++) {
            if (json_list[i].id == id) {
                index = i;
            }
        }

        json_list.splice(index, 1);
        json_list.unshift({
            'id': taxes_obj.id,
            'name': taxes_obj.name,
            'value': taxes_obj.value,
            'computation': taxes_obj.computation
        });
        this.setState({taxes_list: json_list});
    }


    updateDiscount(items_type, index, value, tax_value, tax_computation) {

        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        }else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }
        var discount_amt = 0;
        var valid_discount = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
        var discount = 0
        if (valid_discount === true) {
            value = value.replace(/\,/g, '');
            discount = parseFloat(value);
        }

        if (discount > 100) {
            discount = 100;
        }

        items[index].discount = discount;

        if (items_type == 'order') {
            var subtotal_net = items[index].unit_price * items[index].pro_qty;
            if (discount > 0 && subtotal_net > 0) {
                discount_amt = (discount * subtotal_net) / 100;
            }
            items[index].subtotal = subtotal_net - discount_amt;
            var tax_id = items[index].selected_tax_id;
            var json_taxes_data = items[index].json_taxes;
            var current_item = items[index];
            var tax_amt = 0;
            tax_amt = this.handleTaxCalculation(tax_value, tax_computation, current_item);
            items[index].tax_amt = tax_amt;

            var untaxed_amt = 0;
            var total_tax_amt = 0;
            var i = 0;
            for (i = 0; i < items.length; i++) {
                untaxed_amt = untaxed_amt + items[i].subtotal;
                total_tax_amt = total_tax_amt + items[i].tax_amt;
            }
            this.setState({
                items_array: items,
                untaxed_amt: untaxed_amt,
                total_tax_amt: total_tax_amt,
            })
        } else if (items_type == 'optional') {
            var subtotal_net = items[index].unit_price * items[index].pro_qty;
            if (discount > 0 && subtotal_net > 0) {
                discount_amt = (discount * subtotal_net) / 100;
            }
            items[index].subtotal = subtotal_net - discount_amt;
            var tax_id = items[index].selected_tax_id;
            var json_taxes_data = items[index].json_taxes;
            var current_item = items[index];
            var optax_amt = 0;
            optax_amt = this.handleTaxCalculation(tax_value, tax_computation, current_item);
            items[index].optax_amt = optax_amt;
            var opuntaxed_amt = 0;
            var optotal_tax_amt = 0;
            var i = 0;

            for (i = 0; i < items.length; i++) {
                opuntaxed_amt = opuntaxed_amt + items[i].subtotal;
                optotal_tax_amt = optotal_tax_amt + items[i].optax_amt;
            }
            this.setState({
                items_array: items,
                opuntaxed_amt: opuntaxed_amt,
                optotal_tax_amt: optotal_tax_amt,
            })
        }
    }

    handleselectedTaxes(items_type, index, id, name, taxes_value, taxes_computation, update = false, data = {}) {

        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
            items[index].selected_tax_name = name;
            items[index].selected_tax_id = id;
            items[index].selected_tax_value = taxes_value;
            var current_item = items[index];
            var tax_amt = 0;
            tax_amt = this.handleTaxCalculation(taxes_value, taxes_computation, current_item);
            items[index].tax_amt = tax_amt;
            var untaxed_amt = 0;
            var total_tax_amt = 0;
            for (var i = 0; i < items.length; i++) {
                untaxed_amt = untaxed_amt + items[i].subtotal;
                total_tax_amt = total_tax_amt + items[i].tax_amt;
            }
            this.setState({
                items_array: items,
                untaxed_amt: untaxed_amt,
                total_tax_amt: total_tax_amt,
            })
            this.update_total_items_cal(items_type);
        }
    }

    update_total_items_cal(items_type) {
        let items_array = this.state.items_array;
        let total_calucation_data = {'untaxed_amt': 0.00, 'total_tax_amt': 0.00}
        if (items_array != undefined && items_array.length > 0) {
            let i = 0;
            for (i = 0; i < items_array.length; i++) {
                if (items_array[i].subtotal != '' && items_array[i].subtotal != undefined) {
                    total_calucation_data['untaxed_amt'] = total_calucation_data['untaxed_amt'] + items_array[i].subtotal
                }
                if (items_array[i].selected_tax_value != '' && items_array[i].subtotal != undefined) {
                    let tax_amt = get_percentage(items_array[i].subtotal, items_array[i].selected_tax_value);
                    if (items_array[i].selected_tax_computation === 'Percentage') {
                        total_calucation_data['total_tax_amt'] = total_calucation_data['total_tax_amt'] + tax_amt ;
                    } else if (items_array[i].selected_tax_computation === 'Fixed') {
                        tax_amt = (items_array[i].subtotal + items_array[i].selected_tax_value);
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
        }
    }

    updateQty(items_type, index, value, tax_value) {
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items';
        }else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items';
        }
        var quantity;
        if (value > 0) {
            quantity = value;
        } else {
            quantity = 1
        }
        console.log("updateQty", items, quantity, items_type)
        items[index].pro_qty = quantity
        if (items_type == 'order') {
            var subtotal = quantity * items[index].unit_price;
            var discount = items[index].discount;
            var discount_amt = 0;
            if (discount > 0) {
                discount_amt = (discount * subtotal) / 100;
            }
            items[index].subtotal = subtotal - discount_amt;
            var current_item = items[index];
            var tax_amt = 0;
            tax_amt = this.handleTaxCalculation(items[index].selected_tax_value, items[index].selected_tax_computation, current_item);
            items[index].tax_amt = tax_amt
            var untaxed_amt = 0;
            var total_tax_amt = 0;
            var i = 0;
            for (i = 0; i < items.length; i++) {
                untaxed_amt = untaxed_amt + items[i].subtotal;
                total_tax_amt = total_tax_amt + items[i].tax_amt;
            }
            this.setState({
                items_array: items,
                untaxed_amt: untaxed_amt,
                total_tax_amt: total_tax_amt,
            })
        }
    }


    updateUnitPrice(items_type, index, value, tax_value, tax_computation) {
        if (items_type == 'order') {
            var items = this.state.items;
            var items_array = 'items'
        }else if (items_type == 'optional') {
            var items = this.state.optional_items;
            var items_array = 'optional_items'
        }

        var valid_price = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
        var unit_price = 0
        if (valid_price === true) {
            value = value.replace(/\,/g, '');
            unit_price = parseFloat(value);
        }
        items[index].unit_price = unit_price;
        if (items_type == 'order') {
            var discount = items[index].discount
            var qty = items[index].pro_qty
            var discount_amt = 0;
            var subtotal = qty * unit_price;
            if (discount > 0) {
                discount_amt = (discount * subtotal) / 100;
            }
            items[index].subtotal = subtotal - discount_amt
            var current_item = items[index];
            var tax_amt = 0;
            tax_amt = this.handleTaxCalculation(tax_value, tax_computation, current_item);
            items[index].tax_amt = tax_amt
            var untaxed_amt = 0;
            var untaxed_amt = 0;
            var total_tax_amt = 0;
            for (var i = 0; i < items.length; i++) {
                untaxed_amt = untaxed_amt + items[i].subtotal;
                total_tax_amt = total_tax_amt + items[i].tax_amt;
            }
            this.setState({
                items_array: items,
                untaxed_amt: untaxed_amt,
                total_tax_amt: total_tax_amt,
            })
        }
    }

    handleChangeOrderDate(date) {
        this.setState({order_date: date});
    }

    handleChangeExpireDate(date) {
        this.setState({expiration_date: date});
    }

    handleChangeNote(event) {
        this.setState({notes: event.target.value,})
    }

    handleChangeEmailReminder(event) {
        var email_all = $(".email_all");
        var email_alls = $(".email_alls");
        var name = event.target.name;
        var value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.setState({
            email_reminder: value,
        });
        if (event.target.checked) {
            email_all.show();
            this.setState({email_reminder: true})
        }
        if (event.target.checked == false) {
            email_all.hide();
            email_alls.hide();
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
                if (items_array[i].selected_taxes in taxes) {
                    taxes[items_array[i].selected_taxes] = items_array[i].tax_amt + taxes[items_array[i].selected_taxes]
                } else {
                    taxes[items_array[i].selected_taxes] = get_percentage(items_array[i].subtotal, items_array[i].selected_tax_name)
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
      let result = this.state.result;
      let total_amount = this.state.untaxed_amt + this.state.total_tax_amt;
      let optotal_amount = this.state.opuntaxed_amt + this.state.optotal_tax_amt;
      return(
          <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3 pull-right quotation-total">
            <table>
               <tbody>
                <tr>
                    <td>{translate('untaxed_total_amount')} :</td>
                    <td>
                        { calculation_for === 'order'?
                            <span>{result ?this.state.untaxed_amt.toFixed(2):0.00}</span>
                            : calculation_for === 'optional'?
                                <span>{result ?this.state.opuntaxed_amt.toFixed(2):0.00}</span>
                            : null
                        }
                        <span className="push-left-2">{this.state.currency}</span>
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
                            <span id="12">{result ? this.state.total_tax_amt.toFixed(2) : 0.00}</span>
                            : calculation_for === 'optional' ?
                                <span>{result ? this.state.optotal_tax_amt.toFixed(2) : 0.00}</span>
                            : null
                        }
                        <span className="push-left-2">{this.state.currency}</span>
                    </td>
                </tr>
                <tr>
                    <td>{translate('total')}: <small className="pull-right quo-total-update"></small></td>
                    <td>
                        { calculation_for === 'order' ?
                            <span className="lead">{result?(total_amount.toFixed(2)):0.00}</span>
                        : calculation_for === 'optional' ?
                            <span className="lead">{result?(optotal_amount.toFixed(2)):0.00}</span>
                        :   null
                        }
                        <span className="lead push-left-2">{this.state.currency}</span>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
      );
  }

  save_action_fn(){
     this.handleSubmit();
  }

  render() {
    let result              = this.state.result;
    let items             = this.state.items;
    let optional_items    = this.state.optional_items;
    return (
        <div>
          <Header />
            <div id="crm-app" className="clearfix module__quotation module__quotation-create">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                            <AddPageTopAction
                                list_page_link ="/sales/order/list/"
                                list_page_label ="Sales Order"
                                add_page_link="/contact/add/"
                                add_page_label ="Add Sales Order"
                                edit_page_link={false}
                                edit_page_label ={false}
                                item_name=""
                                page="add"
                                module="sales-order"
                                save_action ={this.save_action_fn.bind(this)}
                            />
                           <div className="row ribbon">
                              <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                  <ul className="pull-right">
                                      <li className="active"><a href="javascript:void(0)" title={translate('label_quotation')}>{translate('label_quotation')}</a></li>
                                    </ul>
                              </div>
                          </div>
                          <div className="row crm-stuff">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                              <form id="quotation_form">
                                <div className="panel panel-default panel-tabular">
                                    <div className="panel-heading no-padding panel-heading-blank">
                                    </div>
                                    <div className="panel-body edit-form">
                                        <div className="row">
                                            <h2 className="col-sm-12 quotation-number">
                                                New Sales Order
                                            </h2>
                                        </div>
                                        <div className="row row__flex">
                                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                <table className="detail_table">
                                                  <tbody>
                                                    <Customer
                                                        field_name="customer"
                                                        field_label="Customer"
                                                        show_lable={true}
                                                        customer_type ='customer'
                                                        set_return_data ={this.set_customer_id_name.bind(this)}
                                                        get_data_url="/contact/company/"
                                                        post_data_url="/contact/company_create/"
                                                        selected_name=""
                                                        selected_id={null}
                                                        item_selected={false}
                                                        create_option={true}
                                                        create_edit_option={false}
                                                    />

                                                    <tr>
                                                        <td>
                                                            <label className="control-label">{translate('quotation_template')}</label>
                                                        </td>
                                                        <td>
                                                            <QuotationTemplateDropDown
                                                                field_name="quotation-template"
                                                                field_label="Quotation Template"
                                                                show_lable={true}
                                                                set_return_data ={this.set_quotation_template.bind(this)}
                                                                get_data_url="/quot/get-quot-template/"
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
                                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                                <table className="detail_table">
                                                  <tbody>
                                                    <tr>
                                                        <td>
                                                            <label className="control-label">{translate('order_date')}</label>
                                                        </td>
                                                        <td>
                                                          <div className="form-group qt_order_date">
                                                            <DateField  dateFormat="MM/DD/YYYY"
                                                                      updateOnDateClick={true}
                                                                      collapseOnDateClick={true}
                                                                      defaultValue={''}
                                                                      minDate = {new Date()}
                                                                      onChange  = {this.handleChangeOrderDate}
                                                                      showClock={false} >
                                                                   <DatePicker
                                                                        navigation={true}
                                                                        locale="en"
                                                                        highlightWeekends={true}
                                                                        highlightToday={true}
                                                                        weekNumbers={true}
                                                                        weekStartDay={0}
                                                                        footer={false}/>
                                                            </DateField >
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="control-label">{translate('expiration_date')}</label>
                                                        </td>

                                                        <td>
                                                        <div id ="expiration_date"className="form-group qt_expexted_closing">
                                                         <DateField  dateFormat="MM/DD/YYYY"
                                                                updateOnDateClick    = {true}
                                                                collapseOnDateClick  = {true}
                                                                value                = {this.state.expiration_date}
                                                                selected             = {this.state.expiration_date}
                                                                onChange             = {this.handleChangeExpireDate}
                                                                minDate              = {new Date()}
                                                                id                   = {"expiration_date"}
                                                                showClock            = {false}>
                                                            <DatePicker
                                                              navigation         = {true}
                                                              locale             = "en"
                                                              highlightWeekends  = {true}
                                                              highlightToday     = {true}
                                                              weekNumbers        = {true}
                                                              weekStartDay       = {0}
                                                              footer             = {false}/>
                                                          </DateField>
                                                        </div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td>
                                                            <label className="control-label">{translate('payment_term')} </label>
                                                        </td>
                                                        <td>
                                                            <PaymentTermDropDown
                                                                field_name="payment-term"
                                                                field_label="Payment Term"
                                                                show_lable={true}
                                                                set_return_data ={this.set_payment_term_data.bind(this)}
                                                                get_data_url="/payment/get-payment-term/"
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
                                    </div>
                                    <ProductTabs module="sales-order"/>
                                    <div className="tab-content">
                                        <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                              <table className="quotation-product-detail table list-table">
                                                  <ProductHeader module={'quotation'} item_type={'order'}/>
                                                  {items?

                                                    <SortableList_tbody items                    = {this.state.items}
                                                                        updateProduct            = {this.updateProduct.bind(this)}
                                                                        onSortEnd                = {this.onSortEnd.bind(this)}
                                                                        helperClass              = "SortableHelper"
                                                                        handleDeleteTr           = {this.handleDeleteTr.bind(this)}
                                                                        handleselectedProduct    = {this.handleselectedProduct.bind(this)}
                                                                        useDragHandle            = {true}
                                                                        handleselectedUOM        = {this.handleselectedUOM.bind(this)}
                                                                        handleselectedTaxes      = {this.handleselectedTaxes.bind(this)}
                                                                        updateDiscount           = {this.updateDiscount.bind(this)}
                                                                        updateQty                = {this.updateQty.bind(this)}
                                                                        updateUnitPrice          = {this.updateUnitPrice.bind(this)}
                                                                        module                   = {'quotation'}
                                                                        item_type                = {'order'}  />
                                                        :null

                                                  }

                                              </table>
                                            <div className="add-new-product">
                                                <a href="javascript:void(0)" className="btn btn-new" onClick= {this.handleProductAdd.bind(this, "order")} >{translate('add_new_product')}  </a>
                                            </div>
                                          <div className="row">
                                            <div className="col-xs-12 col-sm-6 col-md-5 col-lg-6 note">
                                                <textarea rows="4" cols="10" name="qt_note" value= {this.state.notes} onChange = {(event)=>this.handleChangeNote(event)} placeholder={translate('setup_default_terms_and_conditions_in_your_company_settings.')}></textarea>
                                            </div>
                                              {this.render_total_calculations('order') }
                                          </div>
                                        </div>
                                        <div id="field-tab-2" role="tabpanel" className="tab-pane">
                                            <table className="quotation-product-detail suggested-products table list-table">
                                                <ProductHeader module={'quotation'} item_type={'optional'}/>
                                                {optional_items ?
                                                    <SortableList_tbody items={this.state.optional_items}
                                                                        updateProduct            = {this.updateProduct.bind(this)}
                                                                        onSortEnd                = {this.onSortEndOptional.bind(this)}
                                                                        helperClass              = "SortableHelper"
                                                                        handleDeleteTr           = {this.handleDeleteTr.bind(this)}
                                                                        handleselectedProduct    = {this.handleselectedProduct.bind(this)}
                                                                        useDragHandle            = {true}
                                                                        handleselectedUOM        = {this.handleselectedUOM.bind(this)}
                                                                        handleselectedTaxes      = {this.handleselectedTaxes.bind(this)}
                                                                        updateDiscount           = {this.updateDiscount.bind(this)}
                                                                        updateQty                = {this.updateQty.bind(this)}
                                                                        updateUnitPrice          = {this.updateUnitPrice.bind(this)}
                                                                        module                   = {'quotation'}
                                                                        item_type                = {'optional'} />
                                                        :null

                                                  }
                                            </table>
                                            <div className="add-new-product">
                                                <a href="javascript:void(0)" className="btn btn-new" onClick= {this.handleProductAdd.bind(this, "optional")} >{translate('add_new_product')}</a>
                                            </div>
                                             <div className="row">
                                                  {this.render_total_calculations('optional') }
                                             </div>
                                        </div>
                                      <div id="field-tab-3" role="tabpanel" className="tab-pane"></div>
                                    </div>
                                </div>  {/*end .panel*/}
                              </form>
                            </div>
                          </div>
                        </div>
                    </div>
                </div>
            </div>
             <LoadingOverlay processing={this.state.processing}/>
         </div>
    );
  }
}
module.exports = QuotationAdd;
