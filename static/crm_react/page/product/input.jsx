import React from 'react';

class  Input extends React.Component {
  
    constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      name : this.props.name
      
    }
  }

   componentWillReceiveProps(nextProps){
    this.setState({ 
         value: nextProps.value
    });

  }
  
  handleChange(event) {

    this.setState({value: event.target.value});
  }

  render() {



    let input =  this.props.required=="required"?<input 
        type        = "text"  
        onChange    = {this.handleChange.bind(this)} 
        name        = {this.state.name} 
        className   = {this.props.class} 
        value       = {this.state.value}
        id          = {this.props.id} 
        placeholder = {this.props.placeholder}  />
        :
        <input 
        type        = "text"  
        onChange    = {this.handleChange.bind(this)} 
        name        = {this.state.name} 
        className   = {this.props.class} 
        value       = {this.state.value}
        id          = {this.props.id}
        placeholder = {this.props.placeholder}  />;
 
    return (
        input
     
    )
  }
}


module.exports = Input;