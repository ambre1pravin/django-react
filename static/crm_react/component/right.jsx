import React from 'react';

import ContactList from 'crm_react/page/contact/contact-list';

import { Router, Route, Link, browserHistory } from 'react-router'



class  Right extends React.Component {



  render() {
    return (
        <div className="col-md-12 col-sm-12 col-lg-12 col-xs-12 side-collapse-container" id="main-content">
             <ContactList/>
        </div>
    );
  }
}
module.exports = Right;

