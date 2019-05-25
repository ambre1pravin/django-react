import React from 'react';
import ReactTooltip from 'react-tooltip'
import { Link, browserHistory } from 'react-router'
import 'react-date-picker/index.css'
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import Product_tr from 'crm_react/page/quotation/Product_tr';
import {translate} from 'crm_react/common/language';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import { getCookie} from 'crm_react/common/helper';
import {get_percentage} from 'crm_react/common/product-helper';
import { ToastContainer, toast } from 'react-toastify';




class  QuotTemplateEdit extends React.Component {
    constructor(props){
        super(props);
        this.state = {
                edit_id               : 0 ,
                tempate_name          : null,
                expiration_delay  :30,
                result                 : null ,
                quotation              : null ,
                items                  : [],
                optional_items         : [],
                untaxed_amt            : 0.00 ,
                tax_amt                : 0,
                total_tax_amt          : 0.00,
                opuntaxed_amt          : 0.00 ,
                optotal_tax_amt        : 0.00,
                main_contact_id:'',
                main_contact_email:'',
                input_value :'',
                notes           :null,
                processing:false
        }
        this.getTemplateById()
    }

    on_change_name(event){
        this.setState({tempate_name:event.target.value})
    }

    on_change_expiration_delay(event){
        this.setState({expiration_delay:event.target.value})
    }

    getTemplateById(id){
        this.serverRequest = $.get('/quot/template/editdata/'+this.props.params.Id, function (data) {
          if(data.success==true){
             this.setState({
                result                 : data,
                template               : data.template !==undefined ? data.template : null,
                expiration_delay       : data.expiration_delay !==undefined ? data.expiration_delay : 30,
                tempate_name           : data.template !==undefined ? data.template.name : '' ,
                currency               : data.template !==undefined ? data.template.currency : '' ,
                expiration_date        : data.template !==undefined ? data.template.expiration_date : '' ,
                notes                  : data.template !==undefined ? data.template.terms_and_codition : '' ,
                untaxed_amt            : data.template!==undefined ? data.template.amount_untaxed : 0.00,
                total_tax_amt          : data.template!==undefined ? data.template.tax_amount :0.00,
                total_amt              : data.template!==undefined ? data.template.total_amount : 0.00,
                opuntaxed_amt          : data.template!==undefined ? data.template.opamount_untaxed : 0.00,
                optotal_tax_amt        : data.template!==undefined ? data.template.optax_amount :0.00,
                optotal_amt            : data.template!==undefined ? data.template.optotal_amount : 0.00,
              });

              if(data.template.products!==undefined && data.template.products.length>0){
                var temp_arr = []
                data.template.products.forEach(function(element, i) {
                            temp_arr.push({
                                'id': i + 1,
                                'record_id':element.record_id,
                                'name': element.product_name,
                                'pro_qty': element.product_qty,
                                'unit_price': element.unit_price,
                                'pro_uom': '',
                                'discount': element.discount,
                                'discription': element.product_description,
                                'selected_product': element.product_name,
                                'selected_product_id': element.uuid,
                                'selected_uom': element.product_uom_name != null ? element.product_uom_name : '',
                                'selected_uom_id': element.product_uom != null ? element.product_uom : '',
                                'json_taxes': data.json_taxes !== undefined ? data.json_taxes : [],
                                'selected_tax_id': element.product_tax_id,
                                'selected_tax_name': element.product_tax_name,
                                'selected_tax_value':element.product_tax_value,
                                'selected_tax_computation':element.product_tax_computation,
                                'tax_amt': element.tax_price,
                                'subtotal': element.price_subtotal,
                            });
                  });

                  this.setState({items:temp_arr})
              }

              if(data.template.optionals!==undefined && data.template.optionals.length>0){
                var temp_arr1 = []
                data.template.optionals.forEach(function(element, i) {
                    temp_arr1.push({'id':i+1,
                                  'record_id':element.record_id,
                                  'name':element.product_name ,
                                  'pro_qty':element.product_qty,
                                  'unit_price':element.unit_price,
                                  'pro_uom':'',
                                  'discount':element.discount ,
                                  'discription':element.product_description,
                                  'selected_product':element.product_name,
                                  'selected_product_id':element.Product ,
                                  'selected_uom':element.product_uom_name!=null?element.product_uom_name :'' ,
                                  'selected_uom_id':element.product_uom!=null?element.product_uom :''  ,
                                  'json_taxes':data.json_taxes!==undefined ? data.json_taxes : [] ,
                                  'selected_taxes_id': element.product_tax_id,
                                  'selected_taxes': element.product_tax_name,
                                  'optax_amt' : element.tax_price ,
                                  'subtotal':element.price_subtotal,
                                  'json_product' :data.json_products!==undefined ? data.json_products : [],
                                  'json_uom':data.json_uom!==undefined ? data.json_uom : []
                    });
                });
                  this.setState({optional_items:temp_arr});
              }
            }
        }.bind(this));
    }

    quotationadddata(){
        this.serverRequest = $.get('/quotation/adddata/', function (data) {
          this.setState({
              result        : data,
              products_list : data.json_products!==undefined ? data.json_products : [],
              taxes_list    : data.json_taxes!==undefined ? data.json_taxes : [],
              });
        }.bind(this));
    }

    handleChangeNote(event) {
        this.setState({notes: event.target.value,})
    }


    handleSubmit(){
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
            let Data = {'name':this.state.tempate_name,
                        'expiration_delay':this.state.expiration_delay,
                        'products':product_rows,
                        'optional_products':[],
                        'options_numbers':[],
                        'module_name':this.state.module_name,
                        'opportunity_id':this.state.opportunity_id,
                        'untaxed_amt':this.state.untaxed_amt,
                        'tax_amt':this.state.total_tax_amt,
                        'notes':this.state.notes,
                        'id':this.props.params.Id,
                        };
            if(this.state.tempate_name !=null && product_rows.length > 0) {
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/quot/template/updateTemplate/',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(Data),
                        csrfmiddlewaretoken: getCookie('csrftoken')
                    },
                    beforeSend: function () {
                        this.setState({processing : true})
                    }.bind(this),
                    success: function (data) {
                        if (data.success === true) {
                            this.setState({processing : false});
                            browserHistory.push("/quot/template/view/" + data.uuid + "/");
                        }
                    }.bind(this)
                });
            }else{
                 toast.error("Customer Name", {position: toast.POSITION.TOP_RIGHT, toastId: "handle_submit"});
            }
        }
    }

    update_row_items(data){
        console.log("rows data", data)
        if(data.items.length > 0){
            this.setState({items:data.items, tax_amt:data.tax_amt, untaxed_amt:data.untaxed_amt,
             optional_items:data.optional_items, optax_amt:data.optax_amt, opuntaxed_amt:data.opuntaxed_amt
            })
        }
    }

    save_action_fn(){
        this.handleSubmit()
    }


    render() {
        let result         = this.state.result
        let template       = this.state.template
        let items          = this.state.items
        let optional_items = this.state.optional_items

        return (
            <div>
              <Header />
                <div id="crm-app" className="clearfix module__quotation module__quotation-edit">
                  <div className="container-fluid">
                    <div className="row">
                      <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                            <AddPageTopAction
                                list_page_link ="/quot/template/list/"
                                list_page_label ="Quotation Template"
                                add_page_link={false}
                                add_page_label ={false}
                                edit_page_link={false}
                                edit_page_label ={'Edit Quotation Template'}
                                item_name = {template && template.name!==undefined ?template.name:null}
                                page="edit"
                                module="sales-order"
                                save_action ={this.save_action_fn.bind(this)}
                            />
                        <div className="row crm-stuff">
                          <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <form id = "template_edit_form" >
                              <div className="panel panel-default panel-tabular">
                                <div className="panel-heading no-padding panel-heading-blank">
                                </div>
                                <div className="panel-body edit-form">
                                    <div className="row row__flex">
                                      <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 ">
                                        <table className="detail_table">
                                          <tbody>
                                                <tr>
                                                    <td>
                                                        <label className="control-label">
                                                            Template Name<span className="text-primary">*</span>
                                                        </label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input type="text"
                                                                className="form-control"
                                                                name="name" placeholder="Name..."
                                                                value={this.state.tempate_name}
                                                                onChange={this.on_change_name.bind(this)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <label className="control-label">{'Expiration Delay'}</label>
                                                    </td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input
                                                                className="form-control"
                                                                value={this.state.expiration_delay}
                                                                type="text" placeholder="Expiration Delay..."
                                                                onChange={this.on_change_expiration_delay.bind(this)}
                                                            />
                                                            <span className="emailalis">Days</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                </div>
                                {this.state.items.length > 0  || this.state.optional_items.length > 0 ?
                                    <Product_tr
                                        update_row_items={this.update_row_items.bind(this)}
                                        currency = {this.state.currency}
                                        page="edit"
                                        module='quotation-template'
                                        extra_option_link={this.state.url}
                                        items = {this.state.items}
                                        optional_items = {this.state.optional_items}
                                        untaxed_amt={this.state.total_amount}
                                        total_tax_amt={this.state.total_tax_amt}
                                        opuntaxed_amt={this.state.opuntaxed_amt}
                                        optotal_tax_amt={this.state.optotal_tax_amt}
                                    />
                                    :null
                                }
                              </div>
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
module.exports = QuotTemplateEdit;
