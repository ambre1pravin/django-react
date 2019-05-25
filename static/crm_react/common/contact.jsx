import React from 'react';
import ContactList from 'crm_react/page/contact/contact-list';
import ContactAdd from 'crm_react/page/contact/contact-add';
import ContactView from 'crm_react/page/contact/contact-view';
import ContactUpdate from 'crm_react/page/contact/contact-update';

class  Contact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            names:[],
            emails:[],
            tags:[],
            filters:[],
        }
        this.handle_search_name_keyword = this.handle_search_name_keyword.bind(this);
    }

    handle_search_name_keyword(names, emails, tags, filters) {
        this.setState({names:names, emails:emails, tags:tags, filters:filters});
    }

    render() {
        let component = null;
        let search_states ;
        if(this.props.route.name == 'customer-list'){
            search_states = {'names':this.state.names, 'emails':this.state.emails, 'tags':this.state.tags, 'filters':['customer']}
        }else{
           search_states = {'names':this.state.names, 'emails':this.state.emails, 'tags':this.state.tags, 'filters':this.state.filters}
        }
        switch(this.props.route.name){
            case 'contact-list':
                component = <ContactList search_states={search_states} onSelectNames={this.handle_search_name_keyword} type="contact"/>;
            break;
            case 'customer-list':
                component = <ContactList search_states={search_states} onSelectNames={this.handle_search_name_keyword} type="customer"/>;
            break;
            case 'contact-add':
                component = <ContactAdd />;
            break;
            case 'contact-view':
                component = <ContactView contact_id ={this.props.routeParams.id} use_self ={true}/>;
            break;
            case 'contact-edit':
                component = <ContactUpdate contact_id ={this.props.routeParams.id}/>;
            break;
        }
        return (
        <div>
            {component}
        </div>

        );
     }
}
module.exports = Contact;

