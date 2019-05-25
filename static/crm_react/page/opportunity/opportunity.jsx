import React from 'react';
import OpportunityList from 'crm_react/page/opportunity/opportunity-list';
import OpportunityView from 'crm_react/page/opportunity/opportunity-view';
import OpportunityAdd from 'crm_react/page/opportunity/opportunity-add';
import OpportunityEdit from 'crm_react/page/opportunity/opportunity-edit';

class  Opportunity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sales_channel_id:null,
            names:[],
            tags:[],
            amt_eq:null,
            amt_lt:null,
            amt_gt:null,
            won_lost_filter:[{'label':'Won','selected':false,'key':'won'},
                {'label':'Lost','selected':false,'key':'lost'}
            ],
            my_opp_filter:[{'label':'My Opportunities','selected':true,'key':'my_opp'}],
        };
        this.handle_search_name_keyword = this.handle_search_name_keyword.bind(this);
    }

    handle_search_name_keyword(sales_channel_id, names, won_lost_filter, tags, amt_eq, amt_lt, amt_gt, my_opp_filter) {
        this.setState({sales_channel_id: sales_channel_id, names:names, won_lost_filter:won_lost_filter, tags:tags, amt_eq:amt_eq, amt_lt:amt_lt, amt_gt:amt_gt, my_opp_filter:my_opp_filter});
    }

    render() {
        let component = null;
        let search_states ;
           search_states = {'sales_channel_id':this.state.sales_channel_id, 'names':this.state.names, 'won_lost_filter':this.state.won_lost_filter, 'tags':this.state.tags, 'amt_eq':this.state.amt_eq,
               'amt_lt':this.state.amt_lt, 'amt_gt': this.state.amt_gt, 'my_opp_filter':this.state.my_opp_filter};
        switch(this.props.route.name){
            case 'opportunity-list':
                component = <OpportunityList search_states={search_states} onSelectNames={this.handle_search_name_keyword} type="contact"/>;
            break;
            case 'opportunity-add':
                component = <OpportunityAdd />;
            break;
            case 'opportunity-view':
                component = <OpportunityView opportunity_id ={this.props.routeParams.id}/>;
            break;
            case 'opportunity-edit':
                component = <OpportunityEdit opportunity_id ={this.props.routeParams.id}/>;
            break;
        }
        return (
        <div>
            {component}
        </div>

        );
     }
}
module.exports = Opportunity;

