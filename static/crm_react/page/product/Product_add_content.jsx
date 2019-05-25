import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Dropdown from 'crm_react/component/Dropdown'; 
import CreateCategoryModel from 'crm_react/page/product/create_category_model';
import ListCategoryModel from 'crm_react/page/product/list_category_model';
import CreateEditUomModal from 'crm_react/page/product/create_edit_uom_modal';
import CreateEditUomCateModal from 'crm_react/page/product/create_edit_uom_cate_modal';
import {translate} from 'crm_react/common/language';

class ProductAddContent extends React.Component{
constructor() 
  {
    super();
    this.state = {
                result            : null,
                selected_cat_id   :'' ,
                selected_cat_name : '', 
                selected_uom_id   : '',
                selected_uom_name : ''

    }
    
    this.serverRequest = $.get('/product/adddata/', function (data) {
      this.setState({
                    result:data,
                    json_product_cate : data && data.json_product_cate!==undefined ? data.json_product_cate : ''
                    });
    }.bind(this));
   
   
  }

  handleaddSubmit(){
    var product_form = $('#product_form').serializeArray();

    if ($('#product_form').valid()) {
      $.ajax({
        type: "POST",
        cache: false,
        url: '/product/save/',
        data: {
          ajax: true,
          fields:JSON.stringify(product_form),
        },
        beforeSend: function () {
        },
        success: function (data) {
          if(data.success === true){
             browserHistory.push(BASE_FULL_URL+"/product/list/");
          }
        }
      });
    }
    else{
    }
  }

//opne pop up with all category
  handleViewCateList(){
    this.refs.category_list_modal.openModalwithListCategory()
  }

  handleChange(event) {
    this.setState({
      value: event.target.value
    });
  }

  _getdropdown(dropdown_type){
    let result =  this.state.result;
    switch(dropdown_type){
        case 'product_category':
          return <Dropdown  inputname          = 'product_category'
                            json_data          = {this.state.json_product_cate }
                            input_value        = {this.state.selected_cat_name}
                            input_id           = {this.state.selected_cat_id}
                            attr_id            = 'product_category'
                            model_id           = "#product_cate_Model"
                            handleAddEdit  = {this.openModalWithData.bind(this)}
                            handleViewCateList = {this.handleViewCateList.bind(this)}
                            create_edit        = {true} />
        
        case 'unit_of_measure':
          return <Dropdown   inputname            = 'unit_of_measure'
                                json_data            = {result && result.json_uom!==undefined ? result.json_uom : '' }
                                input_value          = {this.state.selected_uom_name}
                                input_id             = {this.state.selected_uom_id}
                                attr_id              = 'product_category' 
                                model_id             = '#product_uom_Model'
                                create_edit        = {true}
                                handleAddEdit = {this.openUomModalWithData.bind(this)}/>

        case 'purchase_unit_of_measure':
          return <Dropdown   inputname            = 'purchase_unit_of_measure'
                                json_data            = {result && result.json_uom!==undefined ? result.json_uom : '' }
                                input_value          = {this.state.selected_puom_name}
                                input_id             = {this.state.selected_puom_id}
                                attr_id              = 'product_category'
                                model_id             = '#product_uom_Model'
                                create_edit        = {true}
                                handleAddEdit = {this.openPUomModalWithData.bind(this)} />

    }

  }

  //open model with input name or if id!=0 then open with data

  openModalWithData(id , input_value, model_id){

    this.refs.category_modal.openModalWithData(id , input_value, model_id)
  }

  setCreatedCategory(id, name){
    this.setState({
                selected_cat_id :id ,
                selected_cat_name : name
                })
  }
  setSelectedCategory(id, name){
    this.setState({
                selected_cat_id :id ,
                selected_cat_name : name
                })
  }

  //open unit of mesure modal with input name if id!=0 then open  with id of data
  openUomModalWithData(id , input_value, model_id){

   this.refs.uom_modal.openUomModalWithData(id , input_value, model_id, "uom")
  }

  openPUomModalWithData(id, input_value, model_id){
    this.refs.uom_modal.openUomModalWithData(id , input_value, model_id, "puom")
  }

  
  setCreatedUOM(id, name){
    this.setState({
                selected_uom_id :id ,
                selected_uom_name : name
                })
  }

  setCreatedPUOM(id, name){
    this.setState({
                selected_puom_id :id ,
                selected_puom_name : name
                })
  }

  //open unit of mesure category modal with input name if id!=0 then open  with id of data
  openUomCateModalWithData(id , input_value){

   this.refs.uom_cate_modal.openUomCateModalWithData(id , input_value)
  }


  setCreatedUOMCate(id, value){

    this.refs.uom_modal.setCreatedUOMCate(id , value)
    
  }

  render() {
    let result = this.state.result
   
    return (
    <div>
     <CreateCategoryModel json_data = {this.state.json_product_cate  } setCreatedCategory = {this.setCreatedCategory.bind(this)} title = "Create: Category"  ref = "category_modal" />
      {result?
        <ListCategoryModel json_data = {this.state.json_product_cate  } setSelectedCategory = {this.setSelectedCategory.bind(this)} title = "Search: Category"  ref = "category_list_modal" />
        :''
      }

      <CreateEditUomModal title = "Create: Unit of Measure " openUomCateModalWithData={this.openUomCateModalWithData.bind(this)} setCreatedUOM={this.setCreatedUOM.bind(this)} setCreatedPUOM={this.setCreatedPUOM.bind(this)}   ref = "uom_modal"  />
      <CreateEditUomCateModal  ref = "uom_cate_modal"  setCreatedUOMCate = {this.setCreatedUOMCate.bind(this)}  />
      <div id="crm-app" className="clearfix module__product module__product-create">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                        <div className="row top-actions">
                            <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                                  <li>
                                      <Link to={'/product/list/'} className="breadcumscolor" title={translate('add_product')}>{translate('product')}</Link>
                                  </li>
                                  <li>{translate('new')}</li>
                              </ul>
                              <a href="javascript:void(0)"  onClick={this.handleaddSubmit.bind(this)} className="btn btn-primary">{translate('save')}</a>
                               <Link to={'/product/list/'} className="btn btn-primary btn-discard btn-transparent">{translate('button_discard')}</Link>
                            </div>
                            <div className="col-xs-12 col-sm-12 pull-right text-right">
                                <ul className="list-inline inline-block top-actions-pagination">
                                    <li><a href="#"><i className="fa fa-chevron-left"></i></a></li>
                                    <li><a href="#"><i className="fa fa-chevron-right"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        {/*end top-actions*/}
                        <div className="row crm-stuff">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div className="panel panel-default panel-tabular">
                                    <div className="panel-heading no-padding">
                                        <div className="row">
                                            <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                                <ul className="pull-right panel-tabular__top-actions">
                                                    <li>
                                                        <a href="#" title="Active"><i className="fa fa-archive" aria-hidden="true"></i>
                                                        <p className="inline-block">{translate('label_active')}</p></a>
                                                    </li>
                                                    <li>
                                                        <a href="#" title="Check Sales"><i className="fa fa-usd" aria-hidden="true"></i>
                                                        <p className="inline-block"><span>0</span> {translate('label_sales')}</p></a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel-body edit-form">
                                        <form id="product_form" >
                                            <div className="row">
                                                <div className="col-xs-8 col-sm-10 col-md-8 col-lg-8">
                                                  <label htmlFor="product-name">{translate('product_name')}</label>
                                                  <h2 className="product-name">
                                                   
                                                    <input type="text" id="product-name" onChange={this.handleChange}  value={this.state.inputValue}  name="product-name" placeholder={translate('product_name')}  />
                                                  </h2>
                                                </div>
                                                <div className="col-xs-4 col-sm-2 col-md-4 col-lg-4 text-right">
                                                  <div className="product-image">
                                                      <div className="clearfix product-image-actions">
                                                          <i className="fa fa-pencil pull-left"></i>
                                                          <i className="fa fa-trash pull-right"></i>
                                                      </div>
                                                      <input type="file" name="product-image" />
                                                      <img src="images/image-upload.png" alt="no-image" /> 
                                                 </div>
                                                </div>
                                               <ul className="product-options">
                                                  <li>
                                                      <div className="checkbox">
                                                          <input id="product-options-1" name="sale_ok" value="1" type="checkbox"  />
                                                          <label htmlFor="product-options-1">{translate('can_be_sold')}</label>
                                                      </div>
                                                  </li>
                                                  <li>
                                                      <div className="checkbox">
                                                          <input id="product-options-2" name="purchase_ok" value="1" type="checkbox"  />
                                                          <label htmlFor="product-options-2">{translate('can_be_purchased')}</label>
                                                      </div>
                                                  </li>
                                                  <li>
                                                      <div className="checkbox">
                                                          <input id="product-options-3" name="expense_ok" value="1" type="checkbox" />
                                                          <label htmlFor="product-options-3">{translate('can_be_expensed')}</label>
                                                      </div>
                                                  </li>
                                                  <li>
                                                      <div className="checkbox">
                                                          <input id="product-options-4" name="subcription_ok" value="1s" type="checkbox" />
                                                          <label htmlFor="product-options-4">{translate('event_subscription')}</label>
                                                      </div>
                                                  </li>
                                              </ul>
                                            </div>
                                            <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                                                <li role="presentation" data-id="999" className="active"><a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab" aria-expanded="true">{translate('general_information')}</a></li>
                                                <li role="presentation" data-id="420"><a href="#field-tab-2" aria-controls="field-tab-2" role="tab" data-toggle="tab">{translate('extra_info')} </a></li>
                                                <li role="presentation" data-id="470"><a href="#field-tab-3" aria-controls="field-tab-3" role="tab" data-toggle="tab">{translate('notes')}</a></li>
                                            </ul>

                                            <div className="tab-content edit-form">
                                                <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                                    <div className="row row__flex">
                                                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                            <table className="detail_table">
                                                              <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('product_type')}</label>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group" data-id="205" data-type="dropdown">
                                                                          <select name="product_type" className="o_form_input o_form_field form-control" value ="" onChange={this.handleChange}>
                                                                              <option value=""  ></option>
                                                                              <option value="consumable"  >{translate('consumable')}</option>
                                                                              <option value="service" >{translate('service')}</option>
                                                                              <option value="stockable" >{translate('stockable_product')}</option>
                                                                          </select>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('internal_reference')}</label>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group" data-id="206" data-type="text">
                                                                            <input type="text" onChange={this.handleChange} name ="internal_reference" className="form-control" value={this.state.inputValue}  data-id="6" />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('product_category')}</label>
                                                                    </td>
                                                                    <td>
                                                                      {result?this._getdropdown('product_category'):''}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                  <td><label className="text-muted control-label">{translate('description')}</label></td>
                                                                  <td><div className="form-group quotation" ><textarea rows="5" cols="20" name="discription"   className="form-control" placeholder="Write Notes..."></textarea> </div></td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                                            <table className="detail_table">
                                                              <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('sale_price')}</label>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group" data-id="210" data-type="text">
                                                                           <input type="text" onChange={this.handleChange} name ="sale_price" className="form-control"value={this.state.inputValue}  />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('cost')}</label>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group" data-id="210" data-type="text">
                                                                            <input type="text" onChange={this.handleChange} name ="cost" className="form-control"value={this.state.inputValue}  />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('unit_of_measure')}</label>
                                                                    </td>
                                                                    <td>
                                                                      {result?this._getdropdown('unit_of_measure'):''}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('purchase_unit_of_measure')}</label>
                                                                    </td>
                                                                    <td>
                                                                      {result?this._getdropdown('purchase_unit_of_measure'):''}
                                                                    </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div id="field-tab-2" role="tabpanel" className="tab-pane">
                                                    <div className="row row__flex">
                                                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                                                            <table className="detail_table">
                                                              <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('tax_on_sale')}</label>
                                                                    </td>
                                                                    <td>
                                                                       <div className="form-group"><input type="text"  name ="tax_on_sale" className="form-control" value="15% tax"   /></div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">{translate('wholesale_tax')}</label>
                                                                    </td>
                                                                    <td>
                                                                       <div className="form-group"><input type="text" name ="wholesale_tax" className="form-control" value="15% tax"   />
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
                                                                        <label className="text-muted control-label">{translate('weight')}</label>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group" data-id="210" data-type="text">
                                                                            <input type="text" name="weight" placeholder={translate('weight')} className="form-control" onChange={this.handleChange}  value={this.state.inputValue} />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td>
                                                                        <label className="text-muted control-label">translate('volume')}</label>
                                                                    </td>
                                                                    <td>
                                                                        <div className="form-group" data-id="210" data-type="text">
                                                                          <input type="text" name="volume" placeholder={translate('the_volume_in_m3')} className="form-control" onChange={this.handleChange}  value={this.state.inputValue} />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                              </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    
                                                </div> 
                                                <div id="field-tab-3" role="tabpanel" className="tab-pane">
                                                    <div className="row">
                                                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                                            <div className="quotation">
                                                                <label htmlFor="desc-quotations">{translate('description_for_quotations')}</label>
                                                                <textarea id="desc-quotations" rows="5" cols="20" name="product_notes" placeholder={translate('description_for_quotations')}></textarea>
                                                            </div>
                                                            <div className="quotation">
                                                                <label htmlFor="desc-vendors">{translate('description_for_vendors')}</label>
                                                                <textarea id="desc-vendors" rows="5" cols="20" name="desc-vendors" placeholder={translate('description_for_vendors')}></textarea>
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
        </div>
    </div>
    
    );
    
  }

}

module.exports = ProductAddContent;
