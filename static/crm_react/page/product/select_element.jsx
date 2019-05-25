import React from 'react';

class  SelectElement extends React.Component {
  
    constructor(props) {
    super(props);
    this.state = {
            select_value : this.props.defualt_value,
            options : this.props.options ? this.props.options : [] 
    }
  }

 handleTypeChange(event) {
    var select_value = event.target.value;
    this.setState({
      select_value: event.target.value
    });
  }
 
  render() {
    let options = this.state.options
 
    return (
        <select name={this.props.name} className="o_form_input o_form_field form-control"  onChange={this.handleTypeChange.bind(this)}  value={this.state.select_value} >
            {options.map((machine, i)=>{
                return(
                        <option key = {i} value={machine.value} >{machine.option}</option>     
                    )

            }) } 
          </select>
     
    )
  }
}

module.exports = SelectElement;