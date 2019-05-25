import React from 'react';
import DropDown from 'crm_react/page/contact/dropdown';
import Checkbox from 'crm_react/page/contact/checkbox';
import Radio from 'crm_react/page/contact/radio';
import MultiLine from 'crm_react/page/contact/multi-line';
import SingleLine from 'crm_react/page/contact/single-line';
import FormDateField from 'crm_react/page/contact/form-date-field';


class  ContactOtherFieldForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value: '',
            companies:this.props.companies,
            displayCompany:this.props.companies,
            input_value:'',
            selected_company_id: (this.props.company_id > 0) ? this.props.company_id  : 0,
            selected_company_name: (this.props.contact_company_name !='') ? this.props.contact_company_name : '',
            company_input_value:'',
            c_name:'',
            contact_name: (this.props.contact_name != undefined) ? this.props.contact_name : '' ,
            is_individual : this.props.is_individual,
        }
    }

    renderField(field_type,field_id,field_name,default_value, in_value,display_position, is_required){
    let  input_value = in_value !== undefined ? in_value :''
        var data = {'data_id':field_id,
                    'name':field_name,
                    'type':field_type,
                    'input_value': input_value,
                    'default_value':default_value,
                    'display_position':display_position,
                    'display_type':'',
                    'is_required':is_required
                }


        switch(field_type) {
            case "single-line":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />
            case "phone":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />
            case "mobile":
                 return <SingleLine key={field_id}
                       component_data ={data}
                 />
            case "drop-down":
                return <DropDown key={field_id}
                        component_data ={data}
                />
            case "checkbox":
                return <Checkbox key={field_id}
                        component_data ={data}
                />
            case "radio":
                return <Radio key={field_id}
                        component_data ={data}
                />
            case "multi-line":
                return <MultiLine key={field_id}
                    component_data ={data}
                />
            case "date":
                return <FormDateField key={field_id}
                        component_data ={data}
                />
        }
    }


    leftFieldsRender(){
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
                        'is_required':f.is_required
                    }
                    left_side_fields.push(fields_data)
               }
            }
        })

        return(
        left_side_fields.length > 0 ?
            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">
                <table className="detail_table">
                    <tbody>
                        {
                            left_side_fields.map((f, k) =>{
                                {
                                return this.renderField(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position, f.is_required)
                                }
                            })
                        }
                    </tbody>
                </table>
            </div>
        :null
        );
    }

    rightFieldsRender(){

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
                        'is_required':f.is_required
                    }
                    right_side_fields.push(fields_data)
                }
            }
        })

        return(
            right_side_fields.length > 0 ?
                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <table className="detail_table">
                        <tbody>
                            {
                                right_side_fields.map((f, k) =>{
                                    {
                                     return this.renderField(f.type,f.id,f.name,f.default_values,f.input_value,f.display_position,f.is_required)
                                    }
                                })
                            }
                        </tbody>
                    </table>
                </div>
            :null

        );
    }


    render() {
        return (
            <div className="row">
                { this.leftFieldsRender() }
                {this.rightFieldsRender()}
            </div>
        );
     }
}
module.exports = ContactOtherFieldForm;

