import React from 'react';

import Header from 'crm_react/component/Header';
import Left from 'crm_react/component/left';

//import ContactAdd from 'crm_react/page/contact/contact-add';


import { Router, Route, Link, browserHistory } from 'react-router'

class  Container extends React.Component {


  render() {
    return (
      <div>
            <Header />
            <Left />
      </div>

    );
  }
}
module.exports = Container;

