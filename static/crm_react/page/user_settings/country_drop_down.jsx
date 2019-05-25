import React from 'react';
import { getCookie} from 'crm_react/common/helper';
import { translate} from 'crm_react/common/language';


class  CountyDropdown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            input_value: (this.props.input_value!=undefined && this.props.input_value!='') ? this.props.input_value : '',
            countries:[],
            company_drop_down_class:'dropdown autocomplete',
            data_found:true,
        }
    }


   handle_key_press(e){
       var lower_string = e.target.value;
       var csrftoken = getCookie('csrftoken');
       if(lower_string.length >=2 ){
            $.ajax({
                type: "POST",
                cache: false,
                url: '/general/fetch_country/',
                data: {
                    keyword :lower_string,
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                  this.setState({input_value:e.target.value});
                }.bind(this),
                success: function (data) {
                    if (data.success){
                       this.setState({countries:data.countries_list, company_drop_down_class:'dropdown autocomplete open'});
                    }else{
                       this.setState({data_found:false, countries:[], company_drop_down_class:'dropdown autocomplete open'});
                    }
                }.bind(this)
            });
       }else{
           this.setState({countries:[], company_drop_down_class:'dropdown autocomplete ', input_value:e.target.value});
       }
       this.setState({input_value:e.target.value});

    }


    handle_click_country(country_id, name, ){
       if(country_id > 0) {
           this.setState({input_value:name});
           this.props.selected_country(this.props.country_for, country_id, name)
       }else{
           //this.setState({input_value: ''});
       }
    }

    render() {
        console.log("test")
        console.log(this.state.input_value)
        return (
                <tr>
                    <td><label className="text-muted control-label">Country</label></td>
                    <td>
                    {
                        <div className="form-group">
                            <div className={this.state.company_drop_down_class}>
                                <input placeholder="Country" type="text" value= {this.state.input_value}   onChange={this.handle_key_press.bind(this)}  name="Country"  className="form-control"  />
                                <span data-toggle="dropdown" role="button">
                                    <i className="fa fa-angle-down black"></i>
                                </span>
                                <div className="dd-options">
                                    <ul className="options-list">
                                    {
                                        this.state.countries ?
                                            this.state.countries.map((country, i) =>{
                                               return <li key={i} data-id={country.id} onClick={this.handle_click_country.bind(this,country.id, country.name)}>{country.name}</li>
                                            })
                                        : null
                                    }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    }
                    </td>
                </tr>
        );
     }
}
module.exports = CountyDropdown;

