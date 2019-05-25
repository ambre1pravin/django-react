import React from 'react';

import QuotationList from 'crm_react/page/sales_order/Quotation_list';
import QuotationAdd from 'crm_react/page/sales_order/Quotation_add';
import QuotationView from 'crm_react/page/sales_order/Quotation_view';
import QuotationEdit from 'crm_react/page/sales_order/Quotation_edit';

class  Quotation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            names:[],
            emails:[],
            tags:[],
            filters:[],
        }
        this.handle_search_name_keyword = this.handle_search_name_keyword.bind(this)
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
            case 'quatation-list':
                component = <QuotationList />;
            break;
            case 'quatation-add':
                component = <QuotationAdd />;
            break;
            case 'quatation-view':
                component = <QuotationView quotation_id ={this.props.routeParams.id}/>;
            break;
            case 'quatation-edit':
                component = <QuotationEdit quotation_id ={this.props.routeParams.id}/>;
            break;
        }
        return (
        <div>
            {component}
        </div>

        );
     }
}
module.exports = Quotation;

