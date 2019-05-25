import React from 'react';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';
import {SortableHandle} from 'react-sortable-hoc';
import {translate} from 'crm_react/common/language';
const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>);

class  Term_tr extends React.Component {
	constructor(props) {
        super(props);
        this.state = {item_type :  this.props.item_type, }
    }

    handleRemoveTr(id){
       this.props.handleDeleteTr(id)
    }

    handleDiscoutUpdate(event){
        var index     = this.props.tr_id;
        var value     = event.target.value;
        this.props.updateDiscount(this.state.item_type, index, value);
    }

    handleQtyUpdate(event){
        var index     = this.props.tr_id;
        var value     = event.target.value;
        this.props.updateQty(this.state.item_type, index, value);
    }

    handleUnitPriceUpdate(event){
        var index     = this.props.tr_id;
        var value     = event.target.value;
        this.props.updateUnitPrice(this.state.item_type, index, value);
    }

    handleChange(event) {
        var value     = event.target.value;
        var index     = this.props.tr_id;
        var attribute = event.target.id;
        this.props.updateProduct(this.state.item_type, index, attribute, value);
    }

//function : open model for search more product 
    handleSearchMoreProduct(tr_id){

        var field = 'product';
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }

//function : open model for search more unit of measure
    handleSearchMoreUom(tr_id){

        var field = 'uom';
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }

    handleSearchMoreTaxes(tr_id){

        var field = 'taxes';
        this.props.openModal_more_search(this.state.item_type, tr_id, field);
    }
//function : open model for create and edit  unit of measure
    handleProductAddedit(tr_id, pro_id,input_value){

        this.props.openProductModal(this.state.item_type, tr_id, pro_id,input_value);
    }


//function : open modal for create(id=0) or edit(id>0)
    handleUomAddedit(tr_id, uom_id,input_value){
        this.props.openUOMModal(this.state.item_type, tr_id, uom_id,input_value)
    }

//function : open modal for create(id=0) or edit(id>0)
    handleTaxesAddedit(tr_id, taxes_id, input_value){

        this.props.openTaxesModal(this.state.item_type,tr_id, taxes_id, input_value)   
    }

    handleselectedProduct(index, id, name){
        this.props.handleselectedProduct(this.state.item_type ,index, id, name)
    }

    handleselectedUOM(index, id, name){
        this.props.handleselectedUOM(this.state.item_type ,index, id, name)
    }

    handleselectedTaxes(index, id, name){
        this.props.handleselectedTaxes(this.state.item_type,index, id, name)   
    }

    quotationadddata(){
      this.props.quotationadddata()
    }

    render() {
        return (
            <tr key={this.props.index} className = "payment_term_rows" id={"qpd-trash-" + this.props.record.id}>
                <input type="hidden" id="hiddenid" name="hiddenid" value= {this.props.record.id}  />
                <td><DragHandle /></td>
                <td data-th="Order Date">
                  {this.props.record.due_type  == 'balance' ? 'Balance' : null }
                  {this.props.record.due_type  == 'percent' ? 'Percent' : null }
                  {this.props.record.due_type  == 'fixed_amount' ? 'Fixed Amount' : null }
                </td>
                 <input type="hidden" id="hiddenduetype" name="hiddenduetype" value= {this.props.record.due_type}  />
                <td data-th="Order Date">
                  {this.props.record.value == "" ? '0.000000':this.props.record.value}
                </td>
                <td data-th="Order Date">
                   {this.props.record.number_days  == '' ? '0' : this.props.record.number_days }
                  {this.props.record.days  == 'invoice' ? '  Day(s) after the invoice date' : null }
                  {this.props.record.days  == 'end_invoice' ? '  Day(s) after the end of the invoice month (Net EOM)' : null }
                  {this.props.record.days  == 'following_month' ? '  Last day of following month' : null }
                  {this.props.record.days  == 'current_month' ? '  Last day of current month' : null }
                </td>
                  <td><span className="qpd-trash" onClick={this.handleRemoveTr.bind(this,this.props.record.id)}><i className="fa fa-trash"  aria-hidden="true"></i></span></td>
            </tr>
        );
    }
}
module.exports = Term_tr;