import React from 'react';
import { Link } from 'react-router'
import {BASE_FULL_URL} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';

class  Left extends React.Component {
  handlePage(page,view_type, event){
    $('.sidebar_page').removeClass('active');
    $(event.target).closest('.sidebar_page').addClass('active');
    this.props.setPageView(page, view_type);
  }

  render() {
    return (

        <nav id="main-nav" className="clearfix pull-left">
                <button data-target="main-nav__list" type="button" className="navbar-toggle"  >
                    <span className="sr-only">{translate('menu')}</span>
                    <span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar" ></span>
                </button>
                <ul id="main-nav__list" className="nav navbar-nav">
                    <li>
                        <Link className="clearfix" href="javascript:void(0)" onClick = {(event)=>this.handlePage('Opportunity' ,this.props.view_type, event) } title={translate('opportunity')} data-toggle="tooltip" data-placement="right">
                            <i className="icon-opportunity"></i><span>{translate('opportunity')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="clearfix"  href="javascript:void(0)" onClick = {(event)=>this.handlePage('next_activity','list' , event) } title={translate('next_activity')} data-toggle="tooltip" data-placement="right">
                            <i className="icon-next-activity"></i><span>{translate('next_activity')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="clearfix" to={'/salesteams/list/'} title={translate('sales_team_settings')} data-toggle="tooltip" data-placement="right">
                                <i className="icon-sales-team-settings"></i><span>{translate('sales_team_settings')}</span>
                          </Link>
                    </li>
                </ul>
        </nav>
    );
  }
}
module.exports = Left;

