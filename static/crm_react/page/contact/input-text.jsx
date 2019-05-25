import React from 'react';
import { translate} from 'crm_react/common/language';
import { js_uc_first } from 'crm_react/common/helper';

class  InputText extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value ? this.props.value : '',
            name : this.props.name ? this.props.name : '',
            label: this.props.label ? this.props.label:'',
        }
    }

    handle_input(event){
        this.setState({
            value : event.target.value
        })
    }

    render() {
        return (
            this.state.name ?
                <tr>
                    <td>
                        <label className="control-label">{translate('label_'+this.state.name)}</label>
                    </td>
                    <td>
                    <div  className="form-group" >
                       <input type="text"  value ={this.state.value} name={this.state.name} className="form-control" onChange={this.handle_input.bind(this)} placeholder={js_uc_first(this.state.name) +'...'}/>
                     </div>
                    </td>
                </tr>
            :null
        );
     }
}
module.exports = InputText;

