import React from 'react'
import ReactDOM, { render } from 'react-dom'
import { Router, Route,  browserHistory } from 'react-router'

import injectTapEventPlugin from 'react-tap-event-plugin';
import {root} from 'baobab-react/higher-order';
import state,{BASE_FULL_URL,RELATIVE_URL} from 'crm_react/common/state';

import Dashboard from 'crm_react/page/dashboard/dashboard';
import ContactList from 'crm_react/page/contact/contact-list';
import ContactAdd from 'crm_react/page/contact/contact-add';
import ContactView from 'crm_react/page/contact/contact-view';
import ContactUpdate from 'crm_react/page/contact/contact-update';

import FullCalendar from 'crm_react/page/calender/full-calendar';
import SettingCommon from 'crm_react/common/setting';

//import Contact from 'crm_react/common/contact';
//import LayoutSetting from 'crm_react/page/contact/layout-setting';

injectTapEventPlugin();
//webpack-dev-server --progress --colors --history-api-fallback
//TODO: this is an example of todo
class App extends React.Component {
    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/dashboard/' component={Dashboard} />
                <Route name="contact-list" path='/contact/list/' component={ContactList} />
                <Route name="contact-add" path='/contact/add/' component={ContactAdd} />
                <Route name="contact-view" path='/contact/view/:id/' component={ContactView} />
                <Route name="contact-edit" path='/contact/edit/:id/' component={ContactUpdate} />
                <Route name="calender" path='/calender/list/' component={FullCalendar} />
                <Route name="user-list" path='/user/list/' component={SettingCommon} />
                <Route name="user-create" path='/user/create/' component={SettingCommon} />
                <Route name="user-view" path='/user/view/:id' component={SettingCommon} />
            </Router>
        );
    }
}
const RootedApp = root(state, App)
render(<RootedApp />, document.getElementById('app'));
