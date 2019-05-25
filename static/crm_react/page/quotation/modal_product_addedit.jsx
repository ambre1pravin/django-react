import React from 'react';
import Dropdown from 'crm_react/component/Dropdown';
import CreateCategoryModel from 'crm_react/page/product/create_category_model';
import ListCategoryModel from 'crm_react/page/product/list_category_model';
import CreateEditUomModal from 'crm_react/page/product/create_edit_uom_modal';
import CreateEditUomCateModal from 'crm_react/page/product/create_edit_uom_cate_modal';
import CreateEditTexesModal from 'crm_react/page/product/create_edit_taxes_modal';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';
import UserAddEditModal from 'crm_react/page/opportunity/user_add_edit_modal';


class  ModalProductAddEdit extends React.Component {

    constructor() {
        super();
        this.state = {
            result: null,
            checkbox_sale_ok: false,
            checkbox_purchase_ok: false,
            checkbox_expense_ok: false,
            checkbox_subcription_ok: false,
            selected_cat_id: '',
            selected_cat_name: '',
            selected_uom_id: '',
            selected_uom_name: '',
            selected_puom_id: '',
            selected_puom_name: '',
            product_name: '',
            internal_reference: '',
            pro_discription: '',
            pro_sale_price: '',
            pro_cost: '',
            pro_volume: '',
            pro_weight: '',
            desc_quotations: '',
            vendors_notes: '',
            product_type: '',
            uom_modal_is_open: false,
            pro_cate_modal_is_open: false,
            search_more_modal_is_open: false,
            tax_modal_is_open: false,
            user_modal_is_open: false,
        };
        this.getProductById = this.getProductById.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeNumber = this.handleChangeNumber.bind(this);
    }


    getInitialState() {

        return {loaded: false}
    }

    componentWillMount() {
        const script = document.createElement("script");
        script.src = "/static/front/javascripts/common.js";
        script.onload = (function () {
            this.setState({loaded: true})
        }).bind(this);

        document.getElementsByTagName('head')[0].appendChild(script);
    }


    componentDidMount() {

        var items_type = this.props.items_type;
        var tr_id = this.props.tr_id;
        var pro_id = this.props.pro_id;
        var input_value = this.props.input_value;


        this.openProductModalWithData(items_type, tr_id, pro_id, input_value)

    }

    handleLoad() {
        $("myclass") //  $ is available here
    }

    openProductModalWithData(items_type, tr_id, pro_id, input_value) {
        this.setState({
            items_type: items_type,
            tr_id: tr_id,
            pro_id: pro_id,
            product_name: input_value,

        });
        if (pro_id == 0) {
            this.serverRequest = $.get('/product/adddata/', function (data) {
                this.setState({
                    result: data,
                    json_product_cate: data && data.json_product_cate !== undefined ? data.json_product_cate : '',
                    selected_stax_id: data.tax_on_sale !== undefined && data.tax_on_sale != '' ? data.tax_on_sale : '',
                    selected_stax_name: data.tax_on_sale_name !== undefined && data.tax_on_sale_name != '' ? data.tax_on_sale_name : '',
                });
            }.bind(this)).then(function () {
            });

            $('#Model_product_add').modal('show');
        }
        else if (pro_id ) {
            this.getProductById(pro_id);
            $('#Model_product_add').modal('show');
        }
    }

  getProductById(id){
    this.serverRequest = $.get('/product/editdata/'+id+'/', function (data) {
      if(data.success==true){

        this.setState({
            result              : data,
            sale_product_count  : data && data.sale_product_count!==undefined ? data.sale_product_count : '',
            json_product_cate   : data && data.json_product_cate!==undefined ? data.json_product_cate : '', 
            selected_cat_id     : data.product.product_category!==undefined && data.product.product_category!='' ? data.product.product_category :'' ,
            selected_cat_name   : data.product.product_category_name!==undefined && data.product.product_category_name!='' ? data.product.product_category_name :'' , 
            selected_uom_id     : data.product.uofm!==undefined && data.product.uofm!='' ? data.product.uofm :'',
            selected_uom_name   : data.product.uofm_name!==undefined && data.product.uofm_name!='' ? data.product.uofm_name :'',
            selected_puom_id    : data.product.purchase_uofm!==undefined && data.product.purchase_uofm!='' ? data.product.purchase_uofm :'',
            selected_puom_name  : data.product.purchase_uofm_name!==undefined && data.product.purchase_uofm_name!='' ? data.product.purchase_uofm_name :'',
            selected_stax_id    : data.product.tax_on_sale!==undefined && data.product.tax_on_sale!='' ? data.product.tax_on_sale :'',
            selected_stax_name  : data.product.tax_on_sale_name!==undefined && data.product.tax_on_sale_name!='' ? data.product.tax_on_sale_name :'',
            selected_wstax_id   : data.product.wholesale_tax!==undefined && data.product.wholesale_tax!='' ? data.product.wholesale_tax :'',
            selected_wstax_name : data.product.wholesale_name!==undefined && data.product.wholesale_name!='' ? data.product.wholesale_name :'',
            edit_id             : id,
            product_name        : data.product!==undefined && data.product.name!==undefined ? data.product.name: '',
            internal_reference  : data.product!==undefined && data.product.internal_reference!==undefined ? data.product.internal_reference: '', 
            product_type        : data.product!==undefined && data.product.product_type!==undefined ? data.product.product_type: '',
            pro_discription     : data.product!==undefined && data.product.description!==undefined ? data.product.description: '',
            pro_sale_price      : data.product!==undefined && data.product.sale_price!==undefined ? data.product.sale_price: '',
            pro_cost            : data.product!==undefined && data.product.cost!==undefined ? data.product.cost: '' , 
            pro_volume          : data.product!==undefined && data.product.volume!==undefined ? data.product.volume: '',
            pro_weight          : data.product!==undefined && data.product.weight!==undefined ? data.product.weight: '',
            desc_quotations     : data.product!==undefined && data.product.notes!==undefined ? data.product.notes: '' , 
            vendors_notes       : data.product!==undefined && data.product.vendors_notes!==undefined ? data.product.vendors_notes: '' , 
            checkbox_sale_ok    : data.product!==undefined && data.product.can_be_sold!==undefined && data.product.can_be_sold==1?true:false,
            checkbox_purchase_ok: data.product!==undefined && data.product.can_be_purchased!==undefined && data.product.can_be_purchased==1?true:false,
            checkbox_expense_ok : data.product!==undefined && data.product.can_be_expended!==undefined && data.product.can_be_expended==1?true:false ,     
            checkbox_subcription_ok : data.product!==undefined && data.product.event_subscription!==undefined && data.product.event_subscription==1?true:false,
            select_sp_value     : data.product.currentsalesperson!==undefined && data.product.currentsalesperson!='' ? data.product.currentsalesperson : '' ,
            select_sp_id        : data.product.salesperson!== undefined && data.product.salesperson!='' ? data.product.salesperson : '' ,
            select_st_value     : data.product.currentsalesTeam!== undefined && data.product.currentsalesTeam!='' ? data.product.currentsalesTeam : '',
            select_st_id        : data.product.salesTeam!== undefined && data.product.salesTeam!='' ? data.product.salesTeam : '', 
        })
      }    
    }.bind(this)).then(function(){
           });
  }


   handleparentInput(id){

   this.getQuotationById.bind(this)
      }

    handleaddSubmit() {

        var product_form = $('#quot_product_form').serializeArray();
        var img_url = $('#product_image').attr('src');
        product_form.push({'name': 'img_url', 'value': img_url});
        var items_type = this.state.items_type;
        var tr_id = this.state.tr_id;
        var edit_id = this.state.pro_id;
        if (edit_id == 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/save/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(product_form),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.handleselectedProduct(items_type, tr_id, data.uuid, data.name);
                        this.props.set_notification(data.success);
                        this.handleClose()
                    }
                }.bind(this)
            });
        } else if (edit_id) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/update/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(product_form),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.handleselectedProduct(items_type, tr_id, data.edit_id, data.name);
                        this.props.set_notification(data.success);
                        this.handleClose()
                    }
                }.bind(this)
            });
        }
    }

  handleViewCateList(){

        ModalManager.open(<ListCategoryModel
                json_data                   = {this.state.json_product_cate} 
                title                      = "Search: Category"
                setCreatedCategory          = {this.setCreatedCategory.bind(this)}
                handleClose                 = {this.handleCloseCatrgoryModal.bind(this)} 
                onRequestClose              = {() => true}
                modal_id                    = "category_list_modal"/>);

  }

  handleChange(event) {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    /*const value = event.target.value;*/
    this.setState({
      [name]: value,
    });

  }

  handleChangeNumber(event){
    var name  = event.target.id;
    var value = event.target.value;
    var valid_price = /^(\d+\.?\d{0,9}|\.\d{1,9})$/.test(value);
    if(valid_price === true){
      this.setState({
         [name]: value,
    });
    }
     else{
       this.setState({
         [name]: '',
    });
    }
  }
  handleUserAddEdit(id, input_value){ 
        ModalManager.open(<UserAddEditModal title     = "" 
                id                          = {id} 
                input_value                 = {input_value} 
                updateUserInputState        = {this.updateSalesPersonInputState.bind(this)} 
                handleClose                 = {this.handleCloseUserModal.bind(this)} 
                onRequestClose              = {() => true}
                modal_id                    = "user_child"/>);
  }

  setselectedSalePerson(selectId, selectValue){
    this.setState({
                  select_sp_value : selectValue,
                  select_sp_id    : selectId
    })
  }

  setselectedSaleTeam(selectId, selectValue){
    this.setState({
                  select_st_value : selectValue,
                  select_st_id    : selectId
    })
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
                            handleAddEdit      = {this.openModalWithData.bind(this)}
                            handleViewCateList = {this.handleViewCateList.bind(this)}
                            setSelected        = {this.setSelectedCategory.bind(this)}
                            create_edit        = {true} />;
        
        case 'unit_of_measure':
          return <Dropdown      inputname            = 'unit_of_measure'
                                json_data            = {result && result.json_uom!==undefined ? result.json_uom : '' }
                                input_value          = {this.state.selected_uom_name}
                                input_id             = {this.state.selected_uom_id}
                                attr_id              = 'product_category' 
                                model_id             = '#product_uom_Model'
                                create_edit          = {true}
                                placeholder          = 'Select Unit'
                                handleAddEdit        = {this.openUomModalWithData.bind(this)}
                                setSelected          = {this.setCreatedUOM.bind(this)}/>;

         
        case "sales-person":
          return <Dropdown
                    name='Sales Person'
                    input_value = {this.state.select_sp_value?this.state.select_sp_value:''}
                    input_id    = {this.state.select_sp_id?this.state.select_sp_id:''}
                    inputname   = 'sales-person'
                    modal_id    = '#userModal'
                    create_edit   = {true}
                    json_data = {result && result.json_users != undefined ? result.json_users : ''}
                    handleAddEdit   = { this.handleUserAddEdit.bind(this)} 
                    setSelected = {this.setselectedSalePerson.bind(this)}
                    role_view ={this.state.RoleOfUser == 'ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY' ? 'own' : ''}  />;

        case "sales_team":
          return <Dropdown
                    name='Sales Team'
                    input_value={this.state.select_st_value}
                    input_id={this.state.select_st_id}
                    inputname = 'sales_team'
                    json_data ={result ? result.json_teams : ''}
                    setSelected = {this.setselectedSaleTeam.bind(this)}/>;

        case 'tax_on_sale':
          return <Dropdown      inputname              = 'tax_on_sale'
                                json_data              = {result && result.json_taxes!==undefined ? result.json_taxes : '' }
                                input_value            = {this.state.selected_stax_name}
                                input_id               = {this.state.selected_stax_id}
                                attr_id                = 'json_taxes'
                                model_id               = '#product_tax_Model'
                                create_edit            = {true}
                                handleAddEdit          = {this.openSTaxesModalWithData.bind(this)}
                                placeholder            = 'Select tax'
                                setSelected            = {this.setCreatedSTAX.bind(this)} />;

        case 'wholesale_tax':
          return <Dropdown   inputname              = 'wholesale_tax'
                                json_data              = {result && result.json_taxes!==undefined ? result.json_taxes : '' }
                                input_value            = {this.state.selected_wstax_name}
                                input_id               = {this.state.selected_wstax_id}
                                attr_id                = 'wholesale_tax'
                                model_id               = '#product_tax_Model'
                                create_edit            = {true}
                                placeholder            = 'Select Whole Tax'
                                handleAddEdit          = {this.openWSTaxesModalWithData.bind(this)}
                                setSelected            = {this.setCreatedWSTAX.bind(this)} />

    }

  }

  //open model with input name or if id!=0 then open with data

  openModalWithData(id,input_value, model_id){

       ModalManager.open(<CreateCategoryModel title     = "" 
                json_data                   = {this.state.json_product_cate} 
                id                          = {id} 
                input_value                 = {input_value}  
                setCreatedCategory          = {this.setCreatedCategory.bind(this)}
                handleClose                 = {this.handleCloseCatrgoryModal.bind(this)} 
                onRequestClose              = {() => true}
                modal_id                    = "product_cate_Model"/>);
  }


    handleCloseCateListModal(){

    this.setState({
      list_cate_modal_is_open : false
    })    
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
  openUomModalWithData(id , input_value, model_id)
  {

    ModalManager.open(<CreateEditUomModal title     = "" 
                handleClose                 = {this.handleCloseUOMModal.bind(this)} 
                openUomCateModalWithData    = {this.openUomCateModalWithData.bind(this)} 
                setCreatedUOM               = {this.setCreatedUOM.bind(this)}  
                setCreatedPUOM              = {this.setCreatedPUOM.bind(this)}
                onRequestClose              = {() => true}
                id                          = {id} 
                input_value                 = {input_value} 
                field                       = "uom" 
                modal_id                    = "product_uom_Model"/>);

  }

  openPUomModalWithData(id, input_value, model_id){

   this.setState({uom_modal_is_open:true}, ()=>{ this.refs.uom_modal.openUomModalWithData(id , input_value, model_id, "puom")})
  
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
  openUomCateModalWithData(id , input_value)
  {

        ModalManager.open(<CreateEditUomCateModal title     = "" 
                handleClose                 = {this.handleCloseuomCateModal.bind(this)} 
                setCreatedUOMCate           = {this.setCreatedUOMCate.bind(this)}  
                onRequestClose              = {() => true}
                id                          = {id} 
                input_value                 = {input_value} 
                modal_id                    = "uom_cate_modal"/>);

  }


  setCreatedUOMCate(id, value){

      <CreateEditUomModal 
                uid                          = {id} 
                uvalue                       = {value} />
    
  }

  //open product taxes modal with input name if id!=0 then open  with id of data
  openSTaxesModalWithData(id , input_value, model_id){

      ModalManager.open(<CreateEditTexesModal title     = "" 
                handleClose                 = {this.handleCloseTaxModal.bind(this)} 
                setCreatedSTAX              = {this.setCreatedSTAX.bind(this)}
                setCreatedWSTAX             = {this.setCreatedWSTAX.bind(this)}
                onRequestClose              = {() => true}
                id                          = {id} 
                input_value                 = {input_value} 
                field                       = "stax"
                modal_id                    = "product_tax_Model"/>);

  }

  //open product  wholesale taxes modal with input name if id!=0 then open  with id of data
  openWSTaxesModalWithData(id , input_value, model_id){
    this.setState({tax_modal_is_open:true}, ()=>{this.refs.taxes_modal.openTaxesModalWithData(id , input_value, model_id, "wstax")})
  }

  setCreatedSTAX(id, value){
    if(id > 0 ) {
        this.setState({selected_stax_id: id, selected_stax_name: value})
    }
  }

  setCreatedWSTAX(id, value){
      this.setState({
            selected_wstax_id :id ,
            selected_wstax_name : value
      })
  }


  handleCloseuomCateModal(){
    ModalManager.close(<CreateEditUomCateModal modal_id = "uom_cate_modal" onRequestClose={() => true} />);
    this.setState({uomcate_modal_is_open : false})
  }

  handleCloseUOMModal(){
    ModalManager.close(<CreateEditUomModal modal_id = "product_uom_Model" onRequestClose={() => true} />);
    this.setState({uom_modal_is_open : false})
  }

  handleCloseCatrgoryModal(){
    ModalManager.close(<CreateCategoryModel modal_id = "product_cate_Model" onRequestClose={() => true} />);
  }

  handleCloseTaxModal(){

     ModalManager.close(<CreateEditTexesModal modal_id = "product_tax_Model" onRequestClose={() => true} />);

    this.setState({
      tax_modal_is_open : false
    })

  }


  handleClose(){
    ModalManager.close(<ModalProductAddEdit modal_id = "modal_product_addedit" onRequestClose={() => true} />);
    this.props.handleClose()
  }


  handleChangeNote(event){
    this.setState({vendors_notes : event.target.value,})
  }

  updateSalesPersonInputState(sales_person_name, sales_person_id){
       this.setState({
            select_sp_value : sales_person_name ,
            select_sp_id : sales_person_id
       });
  }

  handleCloseUserModal(){
      ModalManager.close(<UserAddEditModal modal_id = "user_child" onRequestClose={() => true} />);
      this.setState({user_modal_is_open:false});
  }

  render_header(title){
        return(
            <div className="modal-header text-left">
                <button type="button" className="close"  onClick= {this.handleClose.bind(this)} aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <ul className="list-inline inline">
                    <li className="border-line">Create : Products</li>
                </ul>
            </div>
        );
  }

  render_footer(){

        return(
            <div className="modal-footer modal-text-left">
                <button type="button"   className="btn btn-primary" onClick = {this.handleaddSubmit.bind(this)} >{translate('save')}</button>
                <button type="button"   className="btn btn-default" onClick= {this.handleClose.bind(this)} >{translate('close')}</button>
            </div>
        );
  }

  render_body(){
       let result = this.state.result;
        return (
            <div id="crm-app" className="clearfix module__product module__product-create">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
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
                                                            <p className="inline-block"><span>{this.state.sale_product_count!==undefined && this.state.sale_product_count!='' ? this.state.sale_product_count: '0' }</span>{translate('label_sales')}</p></a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                       <div className="panel-body edit-form">
                                          <form id="quot_product_form" >
                                              <input type="hidden" name="edit_id" value={this.state.pro_id} />
                                              <div className="row">
                                                  <div className="col-xs-8 col-sm-10 col-md-8 col-lg-8">
                                                    <label htmlFor="product-name">{translate('product_name')}</label>
                                                    <h2 className="product-name">
                                                      <input value = {this.state.product_name} onChange = {this.handleChange} name ="product-name" id = "product_name" placeholder ={translate('product_name')}   />
                                                    </h2>
                                                  </div>
                                                  <div className="col-xs-4 col-sm-2 col-md-4 col-lg-4 text-right">
                                                    <div className="product-image">
                                                        <div className="clearfix product-image-actions">
                                                            <i className="fa fa-pencil pull-left test"></i>
                                                            <i className="fa fa-trash pull-right"></i>
                                                        </div>
                                                        <input type="file" name="product-image" />
                                                        <img src={result && result.product!==undefined && result.product.image_path!==undefined ? result.product.image_path : '/static/front/images/image-upload.png'} id="product_image" alt="no-image" />
                                                   </div>
                                                  </div>
                                                 <ul className="product-options">
                                                    <li>
                                                    <div className="checkbox">
                                                          <input id="checkbox_sale_ok" name="sale_ok" value="1" checked={this.state.checkbox_sale_ok}  type="checkbox" onChange = {this.handleChange}   />
                                                          <label htmlFor="checkbox_sale_ok">{translate('can_be_sold')}</label>
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="checkbox">
                                                          <input id="checkbox_purchase_ok" name="purchase_ok" value="1" checked={this.state.checkbox_purchase_ok}  type="checkbox" onChange = {this.handleChange}   />
                                                          <label htmlFor="checkbox_purchase_ok">{translate('can_be_purchased')}</label>
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="checkbox">
                                                          <input id="checkbox_expense_ok" name="expense_ok" value="1" checked={this.state.checkbox_expense_ok}  type="checkbox" onChange = {this.handleChange}   />
                                                          <label htmlFor="checkbox_expense_ok">{translate('can_be_expensed')}</label>
                                                      </div>
                                                    </li>
                                                    <li>
                                                      <div className="checkbox">
                                                          <input id="checkbox_subcription_ok" name="subcription_ok" value="1" checked={this.state.checkbox_subcription_ok}  type="checkbox" onChange = {this.handleChange}   />
                                                          <label htmlFor="checkbox_subcription_ok">{translate('event_subscription')}</label>
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
                                                                          <div className="form-group" data-id="205" data-type="dropdown">
                                                                            <select name="product_type" id="product_type" className="o_form_input o_form_field form-control" value ={this.state.product_type} onChange={this.handleChange}>
                                                                                <option value=""></option>
                                                                                <option value="consumable">{translate('consumable')}</option>
                                                                                <option value="service">{translate('service')}</option>
                                                                                <option value="stockable">{translate('stockable_product')}</option>
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
                                                                            <input type="text" id ="internal_reference"  onChange={this.handleChange} name ="internal_reference" className="form-control" value={this.state.internal_reference}   />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td>
                                                                          <label className="control-label">{translate('product_category')}</label>
                                                                      </td>
                                                                      <td>
                                                                        {result?this._getdropdown('product_category'):''}
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                    <td><label className="control-label">{translate('description')}</label></td>
                                                                    <td>
                                                                      <div className="form-group quotation" >
                                                                      <textarea rows="5" cols="20" name="discription" id = "pro_discription"   className="form-control" onChange={this.handleChange} placeholder={translate('write_notes')} value = {this.state.pro_discription} ></textarea>
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
                                                                          <input type="text" onChange={this.handleChangeNumber} placeholder="only decimal value"  name ="sale_price" id = "pro_sale_price" className="form-control" value={this.state.pro_sale_price}  />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('tax_on_sale')}</label></td>
                                                                      <td>{ result ? this._getdropdown('tax_on_sale') : null }</td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('cost')}</label></td>
                                                                      <td>
                                                                          <div className="form-group" data-type="text">
                                                                          <input type="text" onChange={this.handleChangeNumber} placeholder="only decimal value" name ="cost" id = "pro_cost" className="form-control" value={this.state.pro_cost}  />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('unit_of_measure')}</label></td>
                                                                      <td>{ result ? this._getdropdown('unit_of_measure') : null }</td>
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
                                                                          <input type="text" name="weight" id = "pro_weight" placeholder="only decimal value" className="form-control" onChange={this.handleChangeNumber}  value={this.state.pro_weight} />
                                                                          </div>
                                                                      </td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">{translate('volume')}</label></td>
                                                                      <td>
                                                                          <div className="form-group" data-id="210" data-type="text">
                                                                            <input type="text" name="volume" id = "pro_volume"  placeholder="only decimal value" className="form-control" onChange={this.handleChangeNumber}  value={this.state.pro_volume} />
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
                                                                      <td>{ result ? this._getdropdown('sales-person') : null }</td>
                                                                  </tr>
                                                                  <tr>
                                                                      <td><label className="control-label">Sales Team</label></td>
                                                                      <td>{ result ? this._getdropdown('sales_team') : null }</td>
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
                                                                  <textarea id="desc_quotations" rows="5" cols="20" name="product_notes" onChange={this.handleChange} placeholder={translate('internal_note')} value = {this.state.desc_quotations} ></textarea>
                                                              </div>
                                                              <div className="quotation">
                                                                  <label htmlFor="desc-vendors">{translate('internal_note_for_vendor')}</label>
                                                                  <textarea id="desc-vendors" rows="5" cols="20" name="desc-vendors" onChange = {(event)=>this.handleChangeNote(event)} placeholder={translate('internal_note_for_vendor')} value = {this.state.vendors_notes}></textarea>
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
        )
  }

  render() {

        if(!this.state.loaded){
            return (<div>Loading...</div>);
        }
        window.load_img_action();
        let result = this.state.result;
        return (
          <div>
          <div>{this.componentWillMount}</div>
            <Modal
                style={modal_style}
                onRequestClose={() => true}
                effect={Effect.Fall}>
                <div className="modal-dialog  modal-lg in" >
                    <div className="modal-content">
                        { this.render_header() }
                        <div className="modal-body" style={ModalbodyStyle}>
                        { this.render_body() }
                        </div>
                        { this.render_footer() }
                    </div>
                </div>
            </Modal>
            {
                this.state.uom_modal_is_open === true ?
                    <CreateEditUomModal
                        title = ""
                        ref = "uom_modal"
                    />
                :null
            }

          </div>
        );
  }

}
module.exports = ModalProductAddEdit;