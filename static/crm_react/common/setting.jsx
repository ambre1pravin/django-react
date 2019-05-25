import React from 'react';
import ReactTooltip from 'react-tooltip'
import {Link } from 'react-router'
import ContactHeader from 'crm_react/page/contact/contact-header';
import UserList from 'crm_react/page/user_settings/user-list';
import UserCreate from 'crm_react/page/user_settings/create-user';
import UserProfile from 'crm_react/page/user_settings/user-profile';
import PriceList from 'crm_react/page/user_settings/price-list';
import CompanySettings from 'crm_react/page/user_settings/general-company-settings';
import LoadingOverlay  from 'crm_react/common/loading-overlay';

import {NotificationContainer} from 'react-notifications';


class  Setting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value:'',
            nav_active_class:'',
            container_fluid_style:'',
            div_row_style:'',
            names:[],
            emails:[],
            tags:[],
            processing:false
        };
        this.process_state_change = this.process_state_change.bind(this)
    }

    handle_nav(nav_active_class){
        if(nav_active_class==''){
            this.setState({nav_active_class:'active'})
        }else{
            this.setState({nav_active_class:'',container_fluid_style:'',div_row_style:''})
        }
    }

    handle_nav_link(){
        this.setState({nav_active_class:''})
    }

    process_state_change(processing_state){
        if(processing_state){
            this.setState({processing:true})
        }else{
            this.setState({processing:false})
        }
    }

    render() {
        let component = null;
        let nav_active = this.state.nav_active_class;
        let processing = this.state.processing;

        switch(this.props.route.name){
            case 'user-list':
                component = <UserList process_state_change = {this.process_state_change.bind(null)}/>;
            break;
            case 'user-create':
                component = <UserCreate process_state_change = {this.process_state_change.bind(null)}/>;
            break;
            case 'user-view':
                component = <UserCreate user_id ={this.props.routeParams.id}  process_state_change = {this.process_state_change.bind(null)}/>;
            break;
            case 'company-settings':
                component = <CompanySettings process_state_change = {this.process_state_change.bind(null)}/>;
            break;
            case 'user-profile':
                component = <UserProfile process_state_change = {this.process_state_change.bind(null)}/>;
            break;
            case 'price-list':
                component = <PriceList process_state_change = {this.process_state_change.bind(null)}/>;
            break;
        }
        return (
        <div>
            <ContactHeader header_css="crm-header crm-header clearfix module__sales"  processing={processing}/>

            <div id="crm-app" className="clearfix module__sales have-sublinks">
                <nav id="main-nav" className="clearfix">
                        <button data-target="main-nav__list" type="button" className="navbar-toggle" onClick={this.handle_nav.bind(this,nav_active)}>
                            <span className="sr-only">Menu</span>
                            <span className="icon-bar"></span><span className="icon-bar"></span><span className="icon-bar"></span>
                        </button>
                        <ul id="main-nav__list" className={"nav navbar-nav "}>
                            <li className="active">
                                <Link to="/user/list/" title="Users" data-tip="Users"  onClick={this.handle_nav_link.bind(this)} className={"clearfix"}>
                                    <i className="icon-sales-team-settings"></i>
                                    <span>Users</span>
                                    <ReactTooltip place="right" type="dark" effect="float"/>
                                </Link>
                            </li>
                            <li>
                                <Link className={"clearfix"} to="/company/setting/" title="General Settings" data-tip="General Settings" onClick={this.handle_nav_link.bind(this)}>
                                    <i className="icon-settings"></i><span>General Settings</span>
                                </Link>
                                <ReactTooltip place="right" type="dark" effect="float"/>
                            </li>
                            <li>
                                <Link className={"clearfix"} to="/price-list/" title="Billing" data-tip="Billing" onClick={this.handle_nav_link.bind(this)}>
                                    <i className="icon-settings"></i><span>Billing</span>
                                </Link>
                                <ReactTooltip place="right" type="dark" effect="float"/>
                            </li>
                            <li>
                                <a className={"clearfix"} href="/layoutsetting/" title="Contact Layout Setting" data-tip="Contact Layout Setting" onClick={this.handle_nav_link.bind(this)}>
                                    <i className="icon-settings"></i><span>Contact Layout Setting</span>
                                </a>
                                <ReactTooltip place="right" type="dark" effect="float"/>
                            </li>

                        </ul>
                </nav>
                <div className="container-fluid" onClick={this.handle_nav_link.bind(this)}>
                <div className="row" >
                    {component}
                </div>

                </div>
            </div>
            <NotificationContainer/>
            <LoadingOverlay processing={processing}/>
        </div>

        );
     }
}
module.exports = Setting;

