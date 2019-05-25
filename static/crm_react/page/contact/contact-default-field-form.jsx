import React from 'react';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import MultiSelect from 'crm_react/page/contact/multiselect';
import FormDateField from 'crm_react/page/contact/form-date-field';
import Customer from 'crm_react/component/customer';
import InputText from 'crm_react/page/contact/input-text';
import { translate} from 'crm_react/common/language';


class  ContactDefaultFieldForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input_value:'',
            c_name:'',
            contact_name: (this.props.contact_name != undefined) ? this.props.contact_name : '' ,
            email:'',
            phone:'',
            mobile:'',
            street:'',
            street2:'',
            city:'',
            zip:'',
            country:'',
            first_name:null,
            last_name:null,
            is_individual : this.props.is_individual,
        }
    }



    render_field(field_type, field_id, field_name, default_value, in_value, display_position,is_required){
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
                />
        }
    }

    handle_name(event){
        this.setState({contact_name:event.target.value});
        this.props.set_contact_name(event.target.value)
    }

    on_change_first_name(event){
        this.setState({first_name:event.target.value});
        this.props.set_name('first_name',event.target.value)
    }

    on_change_last_name(event){
        this.setState({last_name:event.target.value});
        this.props.set_name('last_name',event.target.value)
    }

    handle_file_icon_click(){
        $("#message_attatchment_file").trigger("click");
    }

    render_name(){
        let name = this.state.contact_name != '' ? this.state.contact_name : '';
        var profile_image;
        if(this.props.profile_image == 'profile.png'){
            profile_image =  this.props.profile_image
        }else{
            profile_image =  this.props.profile_image
        }
        return (
            <tr>
                <td rowSpan="2">
                    <div className="edit-dp">
                        <img  className="" data-index="main_form" id="uimage" src={profile_image} width="98" height="98"/>
                            <input type="hidden" autoComplete="off"  id="hidden_profile_image" />
                            <span className="fa fa-pencil edit" onClick={this.handle_file_icon_click.bind(this)}></span>
                    </div>
                </td>
                { !this.props.is_individual ?
                <td>
                <div className="form-group edit-name">
                    <input type="text" value={name}  onChange ={this.handle_name.bind(this)} className="edit-name form-control" required ref="name"  name="name" id="name" placeholder={translate('label_name')} autoFocus="true"/>
                  </div>
                </td>
                    :null
                }
                { this.props.is_individual ?
                    <td className="fc-individual-name" style={{'width':'100%'}}>
                        <div className="form-group edit-name pull-left">
                            <input type="text" name="first-name" placeholder="First Name" value={this.state.first_name}
                                   className="form-control tourist-place-1" onChange={this.on_change_first_name.bind(this)}/>
                        </div>
                        <div className="form-group edit-name pull-right">
                            <input type="text" name="last-name" placeholder="Last Name" value={this.state.last_name}
                                   className="form-control" onChange={this.on_change_last_name.bind(this)}/>
                        </div>
                    </td>
                    : null
                }
            </tr>
        );
    }




    left_fields_render(){
        let left_side_fields = [] ;
        this.props.fields.map((f, k) =>{
            {
                if(f.display_position == 'left' ){
                    var fields_data ={'id':f.id ,
                        'type':f.type,
                        'name':f.name,
                        'default_values':f.default_values,
                        'input_value':'',
                        'display_position':f.display_position,
                        'is_required' :f.is_required
                    };
                    left_side_fields.push(fields_data)
               }
            }
        });
        var data = {
            'tags':this.props.tags,
            'fields': this.props.fields,
            'company_id': this.props.company_id,
            'contact_company_name':(this.props.contact_company_name !=undefined) ? this.props.contact_company_name :'',
            'handleCompanyChange':this.props.handleCompanyChange,
            'company_create':this.props.company_create
        };
        return(

            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>
                     { this.render_name() }
                       { this.props.is_individual ?
                            <Customer
                                field_name="company"
                                field_label="company"
                                show_lable={false}
                                customer_type ='company'
                                set_return_data ={this.props.set_lead_return_data.bind(this)}
                                get_data_url="/contact/company/"
                                post_data_url="/contact/company_create/"
                                selected_name=""
                                selected_id={null}
                                item_selected={false}
                                create_option={true}
                                create_edit_option={false}
                            />
                        :<tr><td></td></tr>
                       }

                         { <InputText value="" name='phone' label='Phone' /> }
                         { <InputText value="" name='mobile' label='Mobile'/> }
                         { <InputText value="" name='email' label='Email' /> }
                         { <InputText value="" name='street' label='Street'/> }
                         { <InputText value="" name='street2'label='Street2' /> }
                         { <InputText value="" name='zip' label='Zip'/> }
                         { <InputText value="" name='city' label='City'/> }
                         { <InputText value="" name='country' label='Country'/> }
                           {
                                left_side_fields.length > 0 ?
                                left_side_fields.map((f, k) =>{
                                  {
                                    return this.render_field(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position, f.is_required )
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
        this.props.fields.map((f, k) =>{
            {
                if(f.display_position == 'right'){
                    var fields_data ={'id':f.id ,
                    'type':f.type,
                    'name':f.name,
                    'default_values':f.default_values,
                    'input_value':'',
                    'display_position':f.display_position,
                    'is_required' :f.is_required
                    };
                    right_side_fields.push(fields_data)
                }
            }
        });

        return(
            right_side_fields.length > 0 ?
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <table className="detail_table">
                        <tbody>
                            {
                                right_side_fields.map((f, k) =>{
                                    {
                                     return this.render_field(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position,f.is_required)
                                    }
                                })
                            }
                            <MultiSelect
                                field_name="tag"
                                field_label="Tags"
                                selected_tags={[]}
                                show_lable={true}
                                get_data_url="/contact/tags/"
                                post_data_url="/contact/tag_create/"
                                create_option={true}
                                create_edit_option={false}
                                retrun_selectd_tags={this.props.return_selectd_tags.bind(this)}
                            />
                        </tbody>
                    </table>
                </div>
            :null

        );
    }

    render() {
        return (
            <div className="row row__flex">
                { this.left_fields_render() }
                {this.right_fields_render()}
             </div>
        );
     }
}
module.exports = ContactDefaultFieldForm;

