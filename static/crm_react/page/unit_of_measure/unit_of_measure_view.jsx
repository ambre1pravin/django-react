import React from 'react';
import { Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';

class  UnitofMeasureView extends React.Component {
	constructor() 
  {
    super();
    this.state = {
                unit      : null,
                op_id_list : [],

    }
    this.getUnitById = this.getUnitById.bind(this)
  }

  componentDidMount(){
    var del_id = this.props.params.Id;
    this.getUnitById(del_id);
  }

  handleNextPrev(Action, current_id){
    var id_array = this.state.op_id_list;
    
    if(id_array.length==0) 
              return false

    var current_index = '0';
    var next_op_id    = '';

    var arr_length = id_array.length;
    current_index = id_array.indexOf(current_id);

    if(Action == 'pre'){
      if(current_index==0){
        next_op_id = id_array[arr_length-1];
      }
      else{
        next_op_id = id_array[current_index-1];
      }

    }

    if(Action == 'next'){
      if(current_index == arr_length-1){
        next_op_id = id_array['0'];
      }
      else{
          next_op_id = id_array[current_index+1];
      }
    }
    if(next_op_id!==undefined && next_op_id!= '' && next_op_id!=0){

      browserHistory.push(base_url+"unit/of/measure/view/"+next_op_id);
      this.getUnitById(next_op_id);
    }
  }

  getUnitById(id){
    this.serverRequest = $.get('/unit/of/measure/viewdata/'+id, function (data) {
      if(data.success==true){
        this.setState({
            unit        : data.unit!==undefined ? data.unit : null,
            del_id       : id,
        })

          if(data.op_id_list!==undefined && data.op_id_list.length>0 ){

              var id_list = data.op_id_list;
              var id_array      = [];
              for(var i in id_list) {
                if(id_list.hasOwnProperty(i) && !isNaN(+i)) {
                    id_array[+i] = id_list[i].id;
                }
            }

            this.setState({
              op_id_list : id_array
            });


            }

      }      

    }.bind(this));
  }
   
  render() {

    let unit          = this.state.unit
    let items         = this.state.items
    let optional_item = this.state.optional_item

    return (
    <div>
    
      <Header />
        <div id="crm-app" className="clearfix module__quotation module__quotation-view">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                <div className="row top-actions">
                    <div className="col-xs-12 col-sm-12">

                        <ul className="breadcrumbs-top">
                        <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                            <li><Link to={'/unit/of/measure/list/'} className="breadcumscolor" title={translate('unit_of_measure')}>{translate('unit_of_measure')}</Link></li>
                            <li>{unit?unit.name:''}</li>
                        </ul>
          
                      <Link  to={'/unit/of/measure/add/'}  className="btn btn-new" title={translate('add_new_unit_of_measure')} > {translate('create')}</Link>
                      <Link to={'/unit/of/measure/edit/'+this.props.params.Id}  className="btn btn-new"  title={translate('edit_unit_of_measure')} > {translate('edit')}</Link>
                    </div>
                     <div className="col-xs-12 col-sm-12 pull-right text-right">
                               <ul className="list-inline inline-block top-actions-pagination">
                                <li><a onClick = {()=>this.handleNextPrev('pre', this.state.del_id)} href="javascript:void(0)" ><i className="fa fa-chevron-left"></i></a></li>
                                <li><a onClick = {()=>this.handleNextPrev('next', this.state.del_id)} href="javascript:void(0)" ><i className="fa fa-chevron-right"></i></a></li>
                              </ul>
                    </div>
                </div>

                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular template-panel">
                          <div className="panel-heading no-padding panel-heading-blank">
                          </div>
                          <div className="panel-body edit-form">
                              <div className="row">

                              </div>
                                <div className="row row__flex"> 
                                   <div className="template-expiration-date">
                                      <table className="detail_table">
                                        <tbody>
                                          <tr>
                                              <td>
                                                  <label className="text-muted control-label">{translate('unit_of_measure')} :</label>
                                              </td>
                                              <td>
                                                <div className="form-group">
                                                  {unit && unit.name!='' && unit.name!='None' ? (unit.name) : '\u00A0' }
                                                </div>
                                              </td>
                                           </tr>
                                            <tr>
                                              <td><label className="text-muted control-label">{translate('category')}</label></td>
                                              <td>
                                                <div className="form-group">
                                                  {unit && unit.category_name!='' && unit.category_name!='None' ? (unit.category_name) : '\u00A0' }
                                                </div>
                                              </td>
                                            </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                </div>
                          </div>



                        </div> {/*<!-- end .panel -->*/}
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
module.exports = UnitofMeasureView;
