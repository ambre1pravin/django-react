import React from 'react';
import {translate} from 'crm_react/common/language';
import state, {BASE_FULL_URL} from 'crm_react/common/state';

class PricingRulesModal extends React.Component {

    constructor() {
        super();
        this.state = {
                id        : 0,
                name      : '',
                condition_varible: '',
                condition_oprators: '',
                condition_price: '',
                sale_price_1: '',
                sale_price_2: '',
                variable_factor:'',
                fixed_amount: false,
                invoice:true,
                end_invoice: false,
                following_month: false,
                current_month: false,
        }

        this.handleChange = this.handleChange.bind(this)

    }


    openModalWithData(){

            $('#PricingRulesModal1').modal('show');
    }

  handleChange(event) {
        var name = event.target.name;
        var value = event.target.value;
        this.setState({
            [name]: value,
        });
  }

  handleClose(){
        $('#PricingRulesModal1').modal('hide');    
        var clear = $("#PricingRulesModal");

        var clear = $("#value");
        clear.val('');
    }

 
    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close"  aria-label="Close"  onClick={this.handleClose.bind(this)} ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li>{translate('create_terms')}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){
        return(
            <div className="modal-footer modal-text-left">

                <button type="button" id="submituser" className="btn btn-primary"  onClick = {()=>this.props.handleUsersubmit()} >{translate('save')}
                </button>
                <button type="button" id="delete_close" className="btn btn-default"   onClick={this.handleClose.bind(this)} >{translate('button_close')}
                </button>     
            </div>
        );
    }

    _renderBody(){
  return (
    <form id="PricingRulesModal" className="edit-form" action="" method="POST">
                <div className="panel-body">
                  <div className="row">

                    <div className="col-lg-12 col-md-12">
            
                            <div className="row">
                                <div className="col-lg-3 col-md-3">
                                    <label className="text-muted control-label labelifno">Condition</label>
                                </div>
                                <div className="col-lg-3 col-md-3">
                                  <div className="form-group">
                                    <select name="condition_varible" className="form-control" value ={this.state.condition_varible} onChange={this.handleChange} >
                                        <option value="false"></option>
                                        <option value="weight">Weight</option>
                                        <option value="volume">Volume</option>
                                        <option value="wv">Weight * Volume</option>
                                        <option value="price">Price</option>
                                        <option value="quantity">Quantity</option>
                                    </select>
                                 </div>
                             </div>
                            <div className="col-lg-3 col-md-3">
                                <div className="form-group">
                                    <select name="condition_oprators" className="form-control" value ={this.state.condition_oprators} onChange={this.handleChange}>
                                        <option value="false"></option>
                                        <option value="==">=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value="<">&lt;</option>
                                        <option value=">=">&gt;=</option>
                                        <option value=">">&gt;</option>
                                    </select>
                                </div>
                            </div>
                                <div className="col-lg-3 col-md-3">
                                    <div className="form-group">
                                        <input type="text" name="condition_price" value={this.state.condition_price} onChange={this.handleChange}  placeholder="0.00" className="form-control" data-id="1"  required />
                                    </div>
                                </div>
                            </div>

                    <div className="row">
                        <div className="col-lg-3 col-md-3">
                            <label className="text-muted control-label labelifno">{translate('sale_price')}</label>
                        </div>
                        <div className="col-lg-3 col-md-3">
                            <div className="form-group" >
                                <input type="text" name="sale_price_1" placeholder="0.00" value={this.state.sale_price_1} onChange={this.handleChange}  className="form-control" data-id="1"  required />        
                            </div>
                            <span id="spansales">+</span>
                        </div>
                        <div className="col-lg-3 col-md-3">
                            <div className="form-group">           
                                <input type="text" name="sale_price_2" placeholder="0.00" value={this.state.sale_price_2} onChange={this.handleChange} className="form-control"  data-id="1"  required />
                            </div>
                            <span id="spansales"><sup>*</sup></span>
                        </div>
                        <div className="col-lg-3 col-md-3">
                            <div className="form-group">
                                <select name="sale_price_varible" className="form-control" value ={this.state.sale_price_varible} onChange={this.handleChange} >
                                    <option value="false"></option>
                                    <option value="weight">Weight</option>
                                    <option value="volume">Volume</option>
                                    <option value="wv">Weight * Volume</option>
                                    <option value="price">Price</option>
                                    <option value="quantity">Quantity</option>
                                </select>
                            </div>
                        </div>
                    </div>
                            </div>              
                        </div>
                    </div>   
                </form>      
        );
    }
    render() {

        return (


            <div className="modal fade" id="PricingRulesModal1" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-keyboard="false" data-backdrop="static">
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  { this._renderHeader() }
                  { this._renderBody() }
                  { this._renderfooter() }

                </div>
              </div>
            </div>
        );
    }
}
module.exports = PricingRulesModal;
