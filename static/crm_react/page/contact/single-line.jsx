import React from 'react';
import PropTypes from 'prop-types';

class  SingleLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key : this.props.component_data.data_id,
            field_id : this.props.component_data.data_id,
            field_type : this.props.component_data.type,
            display_position: this.props.component_data.display_position,
            name : this.props.component_data.name ? this.props.component_data.name : '',
            value: this.props.component_data.input_value ? this.props.component_data.input_value : '',
        }
    }

    handleInput(event){
        this.setState({
            value : event.target.value
        })
    }

    render() {
        return (
            this.state.field_id  && this.state.field_type ?
                <tr key={this.state.key}>
                    <td>
                        <label className="control-label">{this.state.name}</label>
                    </td>
                    <td>
                        <div  className="form-group" data-name={this.state.name} data-id={this.state.field_id }  data-type={this.state.field_type} data-position={this.state.display_position}>
                            <input
                                type="text" value={this.state.value} name={this.state.name}
                                className="form-control" onChange={this.handleInput.bind(this)}
                                placeholder={this.state.name + '...'}
                            />
                        </div>
                    </td>
                </tr>
            :null
        );
     }
}
module.exports = SingleLine;

