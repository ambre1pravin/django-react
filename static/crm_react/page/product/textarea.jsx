import React from 'react';

class  TextArea extends React.Component {
  
    constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
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

    return (
        <textarea 
           id          = {this.props.id} 
           rows        = {this.props.row}  
           cols        = {this.props.col}
           name        = {this.props.name} 
           value       = {this.state.value} 
           className   = {this.props.className}
           onChange    = {this.handleChange.bind(this)} 
           placeholder = {this.props.placeholder}>
        </textarea>
    )
  }
}
module.exports = TextArea;