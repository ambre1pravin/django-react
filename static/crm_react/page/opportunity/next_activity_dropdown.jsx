import React from 'react';

class NextActivityDropDown extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value
    }

  }

   handleClicknextactivity(name)
  {
    if(name != ''){
      this.setState({value:name });
      $('.na-date-hide').show();
    }
    else{
      $('.na-date-hide').hide();
    }
  }

  render(){
    return(
          <div className="dropdown">
            <input type="text" onChange={this.handleChange1} id="next_activity" name="next_activity" className="form-control" value={this.state.value } data-toggle="dropdown" />
            <span data-toggle="dropdown" role="button" className="input-group-dropdown-icon" aria-haspopup="true" aria-expanded="false"><i className="fa fa-angle-down black"></i></span>
            <div className="dd-options" >
              <ul className="options-list" id="next_activity_ul">
                <li onClick={this.handleClicknextactivity.bind(this,'Call')}>Call</li>
                <li onClick={this.handleClicknextactivity.bind(this,'Email')}>Email</li>
                <li onClick={this.handleClicknextactivity.bind(this,'Message')}>Message</li>
              </ul>
            </div>
          </div>
      )
  }

}

module.exports = NextActivityDropDown;