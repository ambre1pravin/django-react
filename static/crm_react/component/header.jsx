import React from 'react';
import { Link } from 'react-router'
import {translate} from 'crm_react/common/language';
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';
import TopLoadingIcon from 'crm_react/common/top-loading-icon'


class Header extends React.Component {
  render() {
    return (
         <header className="crm-header clearfix module__product">
            <div id="mega-icon" className="pull-left">
                <Link to={"/dashboard/"} title="Services"><i className="fa fa-th" aria-hidden="true"></i></Link></div>
            <h1 className="pull-left"><Link to="/dashboard/" title="Saalz">
                <img src={"/static/front/images/saalz-small.png"} alt="Saalz" height="30" /></Link></h1>
            <TopLoadingIcon processing={this.props.processing}/>
            <div className="pull-right">
              <div className="fa fa-search visible-xs-block"></div>
                {<HeaderNotification/>}
                {<HeaderProfile/>}
            </div>
        </header>
    );
  }
}
module.exports = Header;

