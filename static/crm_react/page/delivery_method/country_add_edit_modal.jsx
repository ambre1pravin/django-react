import React from 'react';
import {translate} from 'crm_react/common/language';
import state, {BASE_FULL_URL} from 'crm_react/common/state'; 


class CountryAddModal extends React.Component {

     constructor() {
        super();
        this.state = {
                id        : 0,
                lead_source      : '',
        }

        this.handleChange = this.handleChange.bind(this)

    }

    
openModalWithData(id,input_value){

     if(id!="" && input_value!=""){
            $.ajax({
            type: "POST",
            cache: false,
            url: '/opportunity/getLeadsourceData/'+input_value,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                if(data.success===true){

                    var lead = data.lead
                    this.setState({
                        id        :lead.id,
                        lead_source :lead.name,
                        title     : "Edit : Country",
                    })
                    $('#countrymodal').modal('show');
                }
            }.bind(this)
        });

        }
        else{
            this.setState({
                        id        : 0,
                        lead_source   : input_value,
                        title     : "Add : Country",
                    })
            $('#countrymodal').modal('show');
        }


    }

    handleChange(event) {

          var name = event.target.name;
          var value = event.target.value;
        this.setState({
            [name]: value,
        });

      }
 


    handleClose(){
        $('#countrymodal').modal('hide');    
        this.props.handleClose()
    }


     handlecountrySubmit(){

            var Data = $('#country_add_form').serializeArray();
            $.ajax({
                 type: "POST",
                 cache: false,
                 url: '/delivery/method/addCountry',
              data: {
                 ajax: true,
                 field: JSON.stringify(Data),
                 
              },
              beforeSend: function () {
              },
              success: function (data) {
                 if(data.success === true){
                    this.props.updateCountryInputState(data.country.name,data.country.id);
                    this.handleClose()
                 }
              }.bind(this)
            });
    }        
       

    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li>{this.state.title}</li>
                    </ul>
                </div>
        );
    }
    _renderfooter(){

        return(
            <div className="modal-footer modal-text-left">
                <button type="button" id="save_tag_button"  className="btn btn-primary"  onClick={this.handlecountrySubmit.bind(this)}>{translate('button_save')}
                </button>


                <button type="button" id="delete_close" className="btn btn-default" data-dismiss="modal" onClick = {this.handleClose.bind(this)}>{translate('button_close')}
                </button>
            </div>
        );
    }
    _renderBody(){
       
        return (
          
        <form name="country_add_form" id="country_add_form" action="" method="POST"> 
         <input type="hidden" name="id" value={this.state.id} />
          <div className="modal-body">
            <div className="row">
              <div className="col-lg-3 col-md-3">
                <label className="text-muted control-label labelifno">{translate('label_country_name')}</label>
              </div>
              <div className="col-lg-9 col-md-9">
                <div className="form-group">
                  <input type="text" name="country" onChange={this.handleChange}  value={this.state.country} id="model_country_name" />
                </div>
              </div>
            </div>
          </div>
        </form>
        );
    }
    render() {

        return (
          <div>
            <div className="modal fade" id="countrymodal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            
              <div className="modal-dialog modal-lg ">
                <div className="modal-content">
                  { this._renderHeader()}
                  { this._renderBody() }
                  { this._renderfooter() }

                </div>
              </div>
              
            </div>
          </div>
        );
    }
}
module.exports = CountryAddModal;
