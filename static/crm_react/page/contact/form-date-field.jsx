import React from 'react';
import { DateField,DatePicker  } from 'react-date-picker'
import 'react-date-picker/index.css'

class  FormDateField extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate: this.props.component_data.input_value ? this.props.component_data.input_value : '',
            key : this.props.component_data.data_id,
            name : this.props.component_data.name ? this.props.component_data.name : '',
            field_id : this.props.component_data.data_id,
            field_type : this.props.component_data.type,
            display_position: this.props.component_data.display_position,
            display_type: this.props.component_data.display_type  ? this.props.component_data.display_type: '',
        }
    }

  render() {
        return (
        this.state.field_id && this.state.field_type ?
            <tr key={this.state.key}>
                <td>
                    <label className="control-label">{this.state.name}</label>
                </td>
                <td>
                    {
                      <div  className="form-group" data-id={this.state.field_id}  data-type={this.state.field_type} data-position={this.state.display_position} >
                            <DateField
                                defaultValue ={this.state.startDate}
                                dateFormat="YYYY-MM-DD"
                                updateOnDateClick={true}
                                collapseOnDateClick={false}
                                showClock={false}
                            >
                              <DatePicker
                                navigation={true}
                                locale="en"
                                forceValidDate={true}
                                highlightWeekends={true}
                                highlightToday={true}
                                weekNumbers={true}
                                weekStartDay={0}

                                footer={false}
                              />
                            </DateField>
                       </div>
                    }
                </td>
            </tr>
        :null
        );
  }
}
module.exports = FormDateField;

