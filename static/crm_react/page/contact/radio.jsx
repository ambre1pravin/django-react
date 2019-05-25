import React from 'react';


class  Radio extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key : this.props.component_data.data_id,
            name : this.props.component_data.name ? this.props.component_data.name : '',
            field_id : this.props.component_data.data_id,
            field_type : this.props.component_data.type,
            display_position: this.props.component_data.display_position,
            default_value: this.props.component_data.default_value.length > 0 ? this.props.component_data.default_value : [],
            display_type: this.props.component_data.display_type  ? this.props.component_data.display_type: '',
            input_value: this.props.component_data.input_value.length > 0 ? this.props.component_data.input_value:[],
        }

    }

    toggleChange(index, checked) {
            let checkboxes = this.state.default_value
            let new_chks = []
            let chk={};
            for( var i = 0 ; i < checkboxes.length; i++){
                if(i == index){
                     chk ={'value':checkboxes[i].value,'checked': !checked}
                }else{
                       chk ={'value':checkboxes[i].value,'checked': false}
                    }
                new_chks.push(chk);
            }
          this.setState({default_value:new_chks,input_value:new_chks})
    }


    render_redio(){
        let default_value = this.state.default_value
        let input_value = this.state.input_value
        return (
            <ul className="list-inline">
                {
                    default_value.length > 0 && input_value.length > 0 ?
                       input_value.map((value, i) =>{
                            let checkbox_id ='checkbox_' + this.state.field_id
                            return <li key={i} data-type="in">
                                        <div className="radio">
                                            <input key={i} className="form-control" type="radio" value={value.value}
                                                   checked={value.checked}
                                                   onChange={this.toggleChange.bind(this, i, value.checked)}
                                                   data-id={this.state.field_id} name={checkbox_id}/>
                                            <label> {value.value}</label>
                                        </div>
                            </li>
                       })
                    :
                    default_value.map((value, i) =>{
                        let checkbox_id ='checkbox_' + this.state.field_id
                        return <li key={i} data-type="df">
                                <div className="radio">
                                        <input key={i} className="form-control" type="radio" value={value.value}
                                               checked={value.checked}
                                               onChange={this.toggleChange.bind(this, i, value.checked)}
                                               data-id={this.state.field_id} name={checkbox_id}/>
                                        <label> {value.value}</label>
                                </div>
                        </li>
                    })
                }
            </ul>
        );
    }

    render() {
         return (
            <tr  key={this.state.field_id}>
                <td>
                    <label className="control-label">{this.state.name}</label>
                </td>
                <td>
                {
                    <div  className="form-group" data-name={this.state.name} data-id={this.state.field_id}  data-type={this.state.field_type} data-position={this.state.display_position}>
                        { this.render_redio() }
                    </div>
                }
                </td>
            </tr>
         );
    }
}
module.exports = Radio;

