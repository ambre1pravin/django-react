import React,{Component} from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import FormDateField from 'crm_react/page/contact/form-date-field';
import InputText from 'crm_react/page/contact/input-text';
import { translate} from 'crm_react/common/language';
import { modal_style, get_field_by_position ,ModalbodyStyle} from 'crm_react/common/helper';


class CreateSubContactModal extends Component{
    constructor(props) {
      super(props);
      this.state = {
            contact_name: '',
            fields :null,
            onRequestClose : this.props.onRequestClose,
            title : this.props.title,
            profile_image:'images/profile.png',
          first_name:null,
          last_name:null,

      };
      let fields, right_fields ,contact_name;
      let title = this.props.title;
      this.props.field.filter((e, i) => { if (e.is_default == true) fields = e.fields } );

      this.state = {
            contact_name: contact_name,
            fields : fields,
            title: title,
            profile_image:this.props.profile_image,
      }
    }


    render_field(field_type, field_id, field_name, default_value, in_value, display_position, is_required){
        let  input_value = in_value !== undefined ? in_value :'';
        var data = {'data_id':field_id,
                    'name':field_name,
                    'type':field_type,
                    'input_value': input_value,
                    'default_value':default_value,
                    'display_position':display_position,
                    'display_type':'',
                    'is_required':is_required,
                };
        switch(field_type) {
            case "single-line":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "phone":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "mobile":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />;
            case "drop-down":
                return <DropDown key={field_id}
                        component_data ={data}
                />;
            case "checkbox":
                return <Checkbox key={field_id}
                        component_data ={data}
                />;
            case "radio":
                return <Radio key={field_id}
                        component_data ={data}
                />;
            case "multi-line":
                return <MultiLine key={field_id}
                    component_data ={data}
                />;
            case "date":
                return <FormDateField key={field_id}
                        component_data ={data}
                />;
        }
    }


    handle_change(name_type,e){
        if(name_type ==='first_name') {
            this.setState({first_name: e.target.value})
        }
        if(name_type ==='last_name'){
            this.setState({last_name: e.target.value})
        }
    }

    render_contact_name(contact_name){
        let name = this.state.contact_name ? this.state.contact_name : '';
        return (
            <td className="fc-individual-name">
                <div className="form-group edit-name pull-left">
                    <input type="text" name="first-name" placeholder="First Name" value={this.state.first_name}
                           className="form-control tourist-place-1" onChange={this.handle_change.bind(this,'first_name')}/>
                </div>
                <div className="form-group edit-name pull-right">
                    <input type="text" name="last-name" placeholder="Last Name" value={this.state.last_name}
                           className="form-control" onChange={this.handle_change.bind(this,'last_name')}/>
                </div>
            </td>
        );
    }

    render_profile_image(){
        return (
            <td rowSpan="2">
                <div className="edit-dp">
                   <img width="98" height="98" className="img-circle custom_profile_image" data-index="main_form" id="uimage" src={this.state.profile_image}/>
                    <span className="fa fa-pencil edit"></span>
                </div>
            </td>
        );
    }

    render_name_and_profile_image(){
        return (
            <tr>
                { this.render_profile_image() }
                { this.render_contact_name() }
            </tr>
        );
    }

    render_company_name(){
        return (
            <tr>
                <td></td>
            </tr>
        );
    }

    left_fields_render(){
        let left_side_fields = [] ;
        let fields = this.state.fields;
        left_side_fields = get_field_by_position(fields,'left');
        return(
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>
                        { this.render_name_and_profile_image() }
                        { this.render_company_name() }
                         { <InputText value="" name='phone' label='Phone' /> }
                         { <InputText value="" name='mobile' label='Mobile'/> }
                         { <InputText value="" name='email' label='Email' /> }
                         { <InputText value="" name='street' label='Street'/> }
                         { <InputText value="" name='street2'label='Street2' /> }
                         { <InputText value="" name='zip' label='Zip'/> }
                         { <InputText value="" name='city' label='City'/> }
                         { <InputText value="" name='country' label='Country'/> }

                        {   left_side_fields.length > 0 ?
                            left_side_fields.map((f, k) =>{
                                {
                                    return this.render_field(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position, f.is_required)
                                }
                            })
                            :null
                        }
                    </tbody>
                </table>
            </div>
        );
    }

    right_fields_render(){
        let right_side_fields = [] ;
        let fields = this.state.fields;
        right_side_fields = get_field_by_position(fields,'right');
        return(
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <table className="detail_table">
                        <tbody>
                            {
                                right_side_fields.length > 0 ?
                                    right_side_fields.map((f, k) =>{
                                        {
                                            return this.render_field(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position, f.is_required)
                                        }
                                    })
                                :null
                            }
                        </tbody>
                    </table>
                </div>
        );
    }

    render_body(){
        return (
            <form className="edit-form" id={this.props.form_id}>
                <div className="row row__flex edit-form">
                    { this.left_fields_render() }
                    { this.right_fields_render() }
                </div>
            </form>
        );
    }

    handle_lang_change(index) {
        ModalManager.close(<CreateSubContactModal modal_id = "create-sub-contact-modal"  onRequestClose={() => true} />);
    }

   render(){
      return (

         <Modal
            style={modal_style}
            onRequestClose={() => true}
            effect={Effect.Fall}>
             <div className="modal-dialog modal-lg" role="document">
                 <div className="modal-content">
                    <div  className="modal-header">
                        <button  className="close" type="button" onClick={this.handle_lang_change.bind(this)}>
                            <span aria-hidden="true">×</span>
                        </button>
                        <h4 className="modal-title">{this.state.title}</h4>
                    </div>
                    <div className="modal-body" style={ModalbodyStyle}>
                        { this.render_body() }
                    </div>
                    <div  className="modal-footer">
                        <button className="btn btn-default" type="button" onClick={this.handle_lang_change.bind(this)}>{translate('button_close')}</button>
                        <button className="btn btn-primary" type="button" onClick={this.props.onChildClick}>{translate('button_save')}</button>
                    </div>
                </div>
            </div>
         </Modal>
      );
   }
}

module.exports = CreateSubContactModal;