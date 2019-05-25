import React from 'react';
import { Link, browserHistory } from 'react-router'

import Header from 'crm_react/component/Header';
import CreateEditUomCateModal from 'crm_react/page/product/create_edit_uom_cate_modal';
import Dropdown from 'crm_react/component/Dropdown';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { getCookie} from 'crm_react/common/helper';

class  UnitofMeasureAdd extends React.Component {

  constructor(props) 
  {
    super(props);
    this.state = {
            result      : null,
            selected_value :'' ,
            selected_id : '', 
            uom_type : '', 
            ratioInfo : '',
            name : '',
            ratio : '',
            id : 0,
            json_data     : null
    }

    this.serverRequest = $.get('/product/getUomCategory/', function (data) {
      this.setState({
                    result:data,
                    });
    }.bind(this))
  }

handleSubmit(redirect){
    var um_form = $('#pro_uom_form'); 
    var um_id         = um_form.find('input[name="name"]');        
    let name          =   $('#name').val();

        if(name==''){
         NotificationManager.error('Unit Name', 'The following fields are invalid:',5000);
          $(um_id).addClass("field-error");
          $(um_id).addClass("error-focus");
          $(um_id).focus();   
          return;
        }

    var Data = $('#pro_uom_form').serializeArray();

    $.ajax({
            type: "POST",
            cache: false,
            url: '/product/uomsave/',
            data: {
              ajax: true,
              fields:JSON.stringify(Data),
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success == true){
                this.setState({
                        id             : 0,
                        name           : '',
                        uom_type       : '',
                        ratio          : '',
                        selected_id    : '',
                        selected_value : ''
                    })
                     if(redirect == true){
                browserHistory.push(base_url+"unit/of/measure/list/");
              }

                    if(this.state.field=='uom')
                        this.props.setCreatedUOM(data.id, data.name);
                    else if(this.state.field=='puom')
                        this.props.setCreatedPUOM(data.id, data.name);
                    else if(this.state.field=='quot'){
                        this.props.setCreatedProductUOM(this.state.tr_id, data.id, data.name);
                    }
                }
            }.bind(this)
        });
}

 setCreatedUOMCate(id, value){
    this.setState({
                selected_id    : id,
                selected_value : value
    })
  }

  setSelecteduom(id, value){
    this.setState({
                selected_id    : id,
                selected_value : value
    })
  }

  handleTypeChange(event) {
    var uom_type = event.target.value;
    var ratio_info = '';

    if(uom_type=='bigger')
        ratio_info = ' e.g: 1 * (this unit) = ratio * (reference unit)';
    else if(uom_type=='smaller')
        ratio_info = ' e.g: 1 * (reference unit) = ratio * (this unit)';

    this.setState({
      uom_type: event.target.value, 
      ratioInfo : ratio_info
    });
  }


   openUomCateModalWithData(id, input_value){

      this.setState({uomcate_Modal:true}, ()=>{this.refs.uom_cate_modal.openUomCateModalWithData(id, input_value)});
    }

  openUomCateModalWithData(id , input_value){
    this.setState({uomcate_Modal:'open'}, ()=>{this.refs.uom_cate_modal.openUomCateModalWithData(id , input_value)})
  }


  handleChange(event) {
    this.setState({
      name: event.target.value
    });
  }

  handleCloseuomCateModal(){

    this.setState({
      uomcate_Modal : 'close'
    })
  }
      
   _getdropdown(dropdown_type){
    let result =  this.state.result;
    switch(dropdown_type){
        
        case 'uom_category':
          return <Dropdown      inputname            = 'uom_category'
                                json_data            = {result && result.json_uom_category!==undefined ? result.json_uom_category : '' }
                                input_value          = {this.state.selected_value}
                                input_id             = {this.state.selected_id}
                                attr_id              = 'uom_category' 
                                create_edit          = {true}
                                handleAddEdit        = {this.openUomCateModalWithData.bind(this)}
                                setSelected          = {this.setCreatedUOMCate.bind(this)}/>
    }

  }

  render() { 
     let result = this.state.result
    return (
  
    <div>  
      {this.state.uomcate_Modal=='open' ?
      <CreateEditUomCateModal  ref = "uom_cate_modal"  handleClose={this.handleCloseuomCateModal.bind(this)}  setCreatedUOMCate = {this.setCreatedUOMCate.bind(this)}  />
      :''
    }
    <NotificationContainer/>
      <Header />
      <div id="crm-app" className="clearfix module__product module__product-create">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                        <div className="row top-actions">
                              <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                              <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li><Link to={'/unit/of/measure/list/'} className="breadcumscolor" title={translate('unit_of_measure')}>{translate('unit_of_measure')}</Link></li>
                                  <li>{translate('new')}</li>
                              </ul>
                              <button className="btn btn-primary" onClick = {this.handleSubmit.bind(this,true)}>{translate('save_all')} </button>
                              <Link to={'/unit/of/measure/list/'}  className="btn btn-primary btn-discard btn-transparent" >{translate('discard')}</Link>
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
                          <form id="pro_uom_form">
                            <div className="panel panel-default panel-tabular">
                                <div className="panel-heading no-padding ">
                                  <div className="row">
                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-left">
                                          <ul className="pull-left panel-tabular__top-actions">
                                              <li>
                                                <h2 className="col-sm-12 quotation-number">{translate('new_unit_of_measure')}</h2>
                                              </li>
                                          </ul>
                                      </div>
                                      <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6 pull-right">
                                          <ul className="pull-right panel-tabular__top-actions">
                                              <li>
                                                  <a href="#" title={translate('label_active')}><i className="fa fa-archive" aria-hidden="true"></i>
                                                  <p className="inline-block">{translate('label_active')}</p></a>
                                              </li>
                                          </ul>
                                      </div>
                                  </div>
                                </div>
                                <div className="panel-body edit-form">
                                    <div className="row row__flex">                            
                                        <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                            <table className="detail_table">
                                              <tbody>
                                                <tr>
                                                    <td>
                                                        <label className="text-muted control-label">{translate('unit_of_measure')}</label>
                                                    </td>
                                                    <td>
                                                    <div className="form-group"><input type="text" id="name" name="name" className="form-control"  placeholder = {translate('unit_mesure_name')}  data-id="5" /></div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                  <td><label className="text-muted control-label">{translate('category')}</label></td>
                                                  <td>
                                                  {result?this._getdropdown('uom_category'):''}
                                                  </td>
                                                </tr>
                                             
                                              </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>


                            </div>  {/*end .panel*/}
                          </form>
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
module.exports = UnitofMeasureAdd;
