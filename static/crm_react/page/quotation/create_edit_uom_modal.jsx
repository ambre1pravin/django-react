import React from 'react';
import Dropdown from 'crm_react/component/Dropdown';
import Input from 'crm_react/page/product/input';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';


class  CreateEditUomModal extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            title            : this.props.title,
            result           : null,
            json_data        : null,
            selected_value   : '' ,
            selected_id      : '',
            uom_type         : '',
            ratioInfo        : '',
            name             : '',
            ratio            : '',
            id               : 0,
        }

        this.serverRequest = $.get('/product/getUomCategory/', function (data) {
                 this.setState({
                    id              : 0,
                    result                : data,
                    json_data            : data.json_uom_category,
                 })

            }.bind(this));
    }

componentDidMount(){
    var id           = this.props.uom_id;
    var input_value  = this.props.input_value;
    var items_type    = this.props.items_type;
    var tr_id         = this.props.tr_id;
    var field         = this.props.field;
    var model_id      = this.props.modal_id;

    var uid           = this.props.uid;
    var uvalue        = this.props.uvalue;

    this.openUomModalWithData(id , input_value, model_id, field)
    this.setCreatedUOMCate(uid, uvalue)
  }
    openUomModalWithData(id , input_value, model_id, field, tr_id=''){

        this.setState({
                        id             : 0,
                        name           : '',
                        uom_type       : '',
                        ratio          : '',
                        selected_id    : '',
                        selected_value : '',
                        field          : field,
                        tr_id          : tr_id
                    })

        this.serverRequest = $.get('/product/getUomCategory/', function (data) {
            this.setState({
                result                : data,
                json_uom_category : data.json_uom_category!=undefined?data.json_uom_category:[]
            });

        }.bind(this));

        if(id!=0 && id>0){

            $.ajax({
            type: "POST",
            cache: false,
            url: '/product/getUomCById/'+id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){
                    this.setState({
                        title          : 'Edit : Unit of Measure',
                        id             : id,
                        name           : data.name,
                        uom_type       : data.uom_type,
                        ratio          : data.ratio,
                        selected_id    : data.category_id!=''?data.category_id:'',
                        selected_value : data.category_name!=''?data.category_name:''
                    })


                    $(model_id).modal('show');
                }
            }.bind(this)
        });

        }
        else if(id==0){
            this.setState({
                        name : input_value,
                        title: 'Create : Unit of Measure'
                    })
            $(model_id).modal('show');
        }

    }

handleSubmit(){

    var Data = $('#pro_uom_form').serializeArray();

    $.ajax({
            type: "POST",
            cache: false,
            url: '/product/uomsave/',
            data: {
              ajax: true,
              fields:JSON.stringify(Data),
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

                    this.props.handleClose()
                    this.props.quotationadddata();
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

  setSelecteduom(id,name){
    this.setState({
                selected_id    : id,
                selected_value : name
    })
  }

  setCreatedUOMCate(id, name){

    this.setState({
                selected_id    : id,
                selected_value : name
    })

  }

  handleClose(){

    $('#product_uom_Model').modal('hide');
    this.props.handleClose()
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
                                handleAddEdit        = {this.props.openUomCateModalWithData}
                                setSelected          = {this.setCreatedUOMCate.bind(this)}/>
    }

  }

    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close" aria-label="Close"  onClick={this.handleClose.bind(this)}  ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li className="border-line">{this.state.title}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left">

                <button type="button" id="" className="btn btn-primary" onClick={this.handleSubmit.bind(this)} >{translate('save')}
                </button>

                <button type="button" id="" className="btn btn-default" onClick={this.handleClose.bind(this)} >{translate('close')}
                </button>
            </div>
        );
    }

    _renderBody(){
       let result = this.state.result
        return (
                 <form id="pro_uom_form" className="edit-form" action="" method="POST">
                    <div className="panel-body">
                        <div className="row  col-xs-12 col-sm-12 col-md-12 col-lg-12 ">
                            <table className="detail_table">
                                <tbody>
                                    <tr>
                                        <td><label className="text-muted control-label">{translate('unit_of_measure')} </label></td>
                                        <td>
                                            <div className="form-group edit-name">
                                                <Input
                                                    value        = {this.state.name}
                                                    name         = {'name'}
                                                    class        = {'form-control capsname'}
                                                    placeholder  = {translate('unit_mesure_name')} />
                                            </div>
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
                    <input type="hidden" name="uom_id" value={this.state.id}   />
                </form>
              )
    }

     render() {

        return (

              <Modal
                  style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
              <div className="modal-dialog  modal-lg in" >
                <div className="modal-content">
                  { this._renderHeader() }
                  <div className="modal-body" style={ModalbodyStyle}>
                  { this._renderBody() }
                  </div>
                  { this._renderfooter() }
                </div>
              </div>
        </Modal>

        );
    }

}
module.exports = CreateEditUomModal;