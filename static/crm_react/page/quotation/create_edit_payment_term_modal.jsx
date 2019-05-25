import React from 'react';
import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import {translate} from 'crm_react/common/language';
import TermAddModal from 'crm_react/page/payment_term/term_add_modal';
import {SortableHandle} from 'react-sortable-hoc';
import Term_tr from 'crm_react/page/payment_term/Term_tr';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle} from 'crm_react/common/helper';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {  NotificationManager} from 'react-notifications';

// suyash need to remove this from url.py url: '/payment/term/saveTerm/',
const DragHandle = SortableHandle(() => <i className="fa fa-arrows-alt" aria-hidden="true"></i>); // This can be any component you want


const SortableItem_tr = SortableElement(
                        ({record, key, handleDeleteTr}) => <Term_tr
                                          record = {record}
                                          handleDeleteTr        = {handleDeleteTr}
                                          key    = {key}  /> );

const SortableList_tbody = SortableContainer(({items,handleDeleteTr}) => {
    console.log("items", items)
    return (
        <tbody className ="order" >
            {
                items.length > 0 ?  items.map((record, index) =>
                <SortableItem_tr  key                   = {`item-${index}`}
                                  index                 = {index}
                                  handleDeleteTr        = {handleDeleteTr}
                                  record                = {record} />
            ) : null
            }
        </tbody>
    );
});

class CreateEditPaymentTermModal extends React.Component {

    constructor() {
        super();
        this.state = {
                id                  : 0,
                name                : '',
                email               : '',
                phone               : '',
                mobile              : '',
                op_rights           : '',
                select_value        :'',
                selected_id         :'',
                delivered           : true,
                all                 : false,
                percentage          : false,
                fixed               : false,
                end_invoice         : false,
                following_month     : false,
                current_month       : false,
                tax_modal_is_open   : false,
                active              : true,
                useDragHandle       : true,
                items               : [],
                term_Modal          : 'close',
                processing          : false,
                payment_term_id     : 0,
        }

        this.handleChange = this.handleChange.bind(this)
        this.onSortEnd          = this.onSortEnd.bind(this)
    }

 componentDidMount(){
        var id            = this.props.id;
        var input_value   = this.props.input_value;

        this.openPaymentTermModel(id,input_value)

      }

openPaymentTermModel(id,input_value){

    if (id!=0 && id > 0) {
      $.ajax({
          type: "POST",
          cache: false,
          url: '/payment/term/getPaymentTermById/'+id,
          data: {
            ajax: true,
          },
          beforeSend: function () {
          },
          success: function (data) {
              if(data.success===true){
                  this.setState({
                      payment_term_id  : id,
                      name             : data.name,
                      notes            : data.notes,
                      active           : data.active,
                  })


              }
          }.bind(this)
      });
      var term_id = id;
      $.get('/payment/term/getTermData/'+term_id+'/', function (data) {
          if(data.success == 'true' || data.success == true) {
            this.setState({resultterm: data, processing:false});
          }
        if(data.term!==undefined && data.term.length>0){

          var temp_arr = []
          data.term.forEach(function(term, i) {
              temp_arr.push({'id':term.id,
                            'due_type':term.due_type ,
                            'value':term.value,
                            'number_days':term.number_days,
                            'days':term.days
                             });
            });

            this.setState({
              items:temp_arr
            })
        }

      }.bind(this));

    }else{

      $.ajax({
            type  : "POST",
            cache : false,
            url   : '/quotation/adddata/',
            data: {

              },
            beforeSend: function () {
              },
            success: function (data) {
              if(data.success == true){
                      this.setState({
                      result              : data,
                      taxes_list          : data.json_taxes,
                      payment_term_id     : 0,
                      name                : input_value,
                      notes               : "",
                      active              : "",

                  });
              }
            }.bind(this)

        });
    }
    }



  handleChange(event)
  {

        var name = event.target.name;
        var value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        this.setState({
            [name]: value,
        });

  }

  handleSubmit(){
    let items = this.state.items;
    let payment_term_id = 0 ;
    let ajax_post = false;
    if(this.props.id > 0 &&  this.props.id != undefined){
        payment_term_id =this.props.id
    }

    for (var i=0; i < items.length; i++){
        if(items[i].due_type == 'balance'){
            ajax_post = true
        }
    }
    if(ajax_post) {
        var payment_term_data = {
            'payment_term_id': payment_term_id,
            'name': this.state.name,
            'notes': this.state.notes,
            'active': this.state.active,
            'payment_items': this.state.items
        }
        $.ajax({
            type: "POST",
            cache: false,
            url: '/payment/term/save/',
            data: {
                ajax: true,
                fields: JSON.stringify(payment_term_data),
            },
            beforeSend: function () {
                this.setState({processing: true})
            }.bind(this),
            success: function (data) {
                if (data.success === true) {
                    this.setState({processing: false})
                    this.handleClose();
                    this.props.setPaymentname(data.id, data.name)
                }
            }.bind(this)
        });
    }else{
        NotificationManager.error('A Payment Terms should have its last line of type Balance!', 'Error',5000);
    }
  }

  remove_item_from_list(item_id){
    let items = this.state.items,
    new_items = [];
    if(items.length > 0){
        for(var i=0; i<items.length; i++){
            if(items[i].id!=item_id){
                new_items.push(items[i])
            }
        }
      this.setState({items: new_items})
    }
  }

  handleDeleteTr(id){
    if(id != undefined && id > 0) {
        $.ajax({
            type: "POST",
            cache: false,
            url: '/payment/term/deleteterm/',
            data: {
                ajax: true,
                id: JSON.stringify(id),
            },
            beforeSend: function () {
                this.setState({processing: true})
            }.bind(this),
            success: function (data) {
                if (data.success == true) {
                    this.setState({processing: false})
                    $('#qpd-trash-' + id).remove();
                }
            }.bind(this)
        });
    }else{
        this.remove_item_from_list(id)
    }
  }

  handleTerm()
  {
      this.setState({term_Modal: 'open'}, ()=>{this.refs.term_add_modal.openModalWithData()})
  }

  handleparentTerm(id){
          this.setState({processing:true})
          var term_id = id;
            $.get('/payment/term/getTermData/'+term_id+'/', function (data) {
              if(data.success == 'true' || data.success == true) {
                  this.setState({resultterm: data, processing:false});
              }
              if(data.term!==undefined && data.term.length>0){

                var temp_arr = []
                data.term.forEach(function(term, i) {
                    temp_arr.push({'id':term.id,
                                  'due_type':term.due_type ,
                                  'value':term.value,
                                  'number_days':term.number_days,
                                  'days':term.days
                                   });
                  });

                  this.setState({items:temp_arr})
              }

            }.bind(this));
    }

  handleClose(){

        this.props.handleClose();


    }



  handleTermClose()
  {
     ModalManager.close(<TermAddModal modal_id = "term_add_modal" onRequestClose={() => true} />);
    $('#TermAddModal').modal('hide');
     this.setState({
      term_Modal : 'close'
    })
  }

  handleTerm(){
     ModalManager.open(<TermAddModal title  = ""
                handleUsersubmit            = {this.handleUsersubmit.bind(this)}
                onRequestClose              = {() => true}
                modal_id                    = "term_add_modal"/>);

  }

  onSortEnd({oldIndex, newIndex}) {
    this.setState({items: arrayMove(this.state.items, oldIndex, newIndex)});
  }


  format_items_text(return_data){
      let items = this.state.items;
      let key;
      let item_dic ={}
      if(items.length > 0){
          key = items.length
      }else{
          key= 0;
      }
      if (return_data.length > 0 ){
          for(var i=0; i < return_data.length; i++){
              item_dic['due_type'] = return_data[i].due_type
              item_dic['value'] = return_data[i].due_type_option_value;
              item_dic['number_days'] = return_data[i].daysinput;
              item_dic['days'] = return_data[i].days_type;
              item_dic['id'] = 'item_'+key;
              items.push(item_dic)
          }
          this.setState({ items: items })
      }
  }

  handleUsersubmit(return_data){
      let items = this.state.items;
      this.format_items_text(return_data)
  }

  render_header(title){
    return(
        <div className="modal-header text-left">
            <button type="button" className="close"  aria-label="Close" onClick={this.handleClose.bind(this)}  ><span aria-hidden="true">&times;</span></button>
            <ul className="list-inline inline">
                <li className="border-line"><b>Create: Payment Terms</b></li>
            </ul>
        </div>
    );
  }


  render_footer(){
    return(
        <div className="modal-footer modal-text-left">
            <button type="button" id="submituser" className="btn btn-primary"  onClick = {this.handleSubmit.bind(this,true)} >{translate('save')}</button>
            <button type="button" id="delete_close" className="btn btn-default" onClick={this.handleClose.bind(this)}    >{translate('button_close')}</button>
        </div>
      );
  }


  render_body(){
      let resultterm = this.state.resultterm;
      let items          = this.state.items;
      const divStyle = {
            padding: "0px 20px 0px 0px;",
      };

      return (
          <div className="row crm-stuff">

        <form id="CreatePaymentModal1" className="edit-form" action="" method="POST">
              <div className="col-xs-11 col-md-11 col-sm-11 col-lg-11">

                    <table className="col-xs-11 col-md-11 col-sm-11 col-lg-11" id="invoicetable">
                      <tbody>
                          <tr>
                              <td><label className="text-muted control-label">Payment Terms</label></td>
                              <td>
                                  <div className="form-group">
                                     <input type="text"  name ="name"  value={this.state.name} onChange = {this.handleChange} style={divStyle} className="inputwidth capsname edit-name"  id="name" data-id="5"  required/>
                                   </div>
                              </td>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                              <td>
                                <label className="text-muted control-label">Active</label>
                              </td>
                              <td>
                                  <div  name="active">
                                      <input type="checkbox" name="active" id="active" value={this.state.active} defaultChecked={this.state.active} onChange = {this.handleChange}/>
                                  </div>
                              </td>
                          </tr>
                           <tr>
                              <td><label className="text-muted control-label">Description on the Invoice</label></td>
                              <td>
                                <div className="form-group">
                                  <textarea name="notes" id="notes" data-id="5"  value={this.state.notes} className="inputwidth" onChange = {this.handleChange} placeholder="Payment terms explanation for the customer..."></textarea>
                                </div>
                              </td>
                          </tr>
                      </tbody>
                     </table>
                  </div>

                  <div className="col-xs-11 col-md-11 col-sm-11 col-lg-11">
                     <table className="col-xs-11 col-md-11 col-sm-11 col-lg-11" id="invoicetable">
                           <tbody>
                              <tr>
                                <td>
                                   <div className="o_horizontal_separator">
                                      <h1><b>Terms</b></h1>
                                   </div>
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <p className="text-muted">
                                       The last lines computation type should be "Balance" to ensure that the whole amount will be allocated.
                                   </p>
                                </td>
                              </tr>
                          </tbody>
                     </table>
                      <div className="tab-content col-xs-11 col-md-11 col-sm-11 col-lg-11">
                            <div id="field-tab-1" role="tabpanel" className="tab-pane active">
                                <table className="quotation-product-detail table list-table list-order col-xs-11 col-md-11 col-sm-11 col-lg-11">
                                    <thead>
                                        <tr>
                                        <th>&nbsp;</th>
                                        <th>{translate('due_type')}</th>
                                        <th>{translate('value')}</th>
                                        <th>{translate('number_of_days')}</th>
                                        <th>Options</th>
                                        </tr>
                                    </thead>
                                     <SortableList_tbody
                                          items                   =  {this.state.items}
                                          onSortEnd               = {this.onSortEnd.bind(this)}
                                          handleDeleteTr           = {this.handleDeleteTr.bind(this)}
                                          helperClass             = "SortableHelper"
                                          useDragHandle           = {true} />
                                </table>
                                  <div className="add-new-product">
                                      <a href="javascript:void(0)" className="btn btn-new" onClick= {this.handleTerm.bind(this)} >{translate('add_an_item')}</a>
                                  </div>
                          </div>
                      </div>
                  </div>
                   <input type="hidden" name="payment_term_id" id="payment_term_id" value={this.state.payment_term_id} />
        </form>

      </div>
        );
    }

    render() {
        return (
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
                  <LoadingOverlay processing={this.state.processing}/>
              </div>
        </Modal>
        );
    }
}
module.exports = CreateEditPaymentTermModal;
