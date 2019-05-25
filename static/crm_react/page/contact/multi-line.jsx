import React from 'react';


class  Multiline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.component_data.input_value ? this.props.component_data.input_value : '',
            key : this.props.component_data.data_id,
            name : this.props.component_data.name ? this.props.component_data.name : '',
            field_id : this.props.component_data.data_id,
            field_type : this.props.component_data.type,
            display_position: this.props.component_data.display_position,
            display_type: this.props.component_data.display_type  ? this.props.component_data.display_type: '',
        }

    }
    handleInput(event){
        this.setState({
            value : event.target.value
        })
        console.log(this.state.value)
    }

  render() {
  var resize_style= {
    resize: 'vertical'
  }
        return (
                <tr key={this.state.key}>
                    <td>
                        <label className="control-label">
                            {this.state.name}
                        </label>
                    </td>
                    <td>
                    {
                        (this.state.display_type ==='view') ?
                        <div className="form-group">
                            {this.state.value}
                        </div>
                        :<div className="form-group" data-name={this.state.name} data-id={this.state.field_id}  data-type={this.state.field_type} data-position={this.state.display_position}>
                                <textarea
                                    style={resize_style} placeholder={this.state.name + '...'}
                                    className="form-control" type="textarea" rows="3" name="multi-line"
                                    value={this.state.value} onChange={this.handleInput.bind(this)}
                                />

                        </div>
                    }

                    </td>
                </tr>
        );
  }
}
module.exports = Multiline;

