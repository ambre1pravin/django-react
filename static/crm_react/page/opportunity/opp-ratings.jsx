import React from 'react';
import {translate} from 'crm_react/common/language';
import {getCookie} from 'crm_react/common/helper';
import LoadingOverlay  from 'crm_react/common/loading-overlay';

class OppRatings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            processing:false
        }
    }

    update_rating(opp_id, rate){
        if (rate > 0 && opp_id > 0) {
            var post_data = {'opportunity_id': opp_id, 'card_rating': rate};
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updateopportunityrating/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken,
                },
                beforeSend: function () {
                    this.setState({processing: true})
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        this.setState({processing: false})
                        this.props.rate_return_status()
                    }
                }.bind(this)
            });
        }
    }

    render() {
        let rating_html;
        if(this.props.rate == 1){
            rating_html =<sapn>
                            <i className="fa fa-star selected" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 1):null }></i>
                            <i className="fa fa-star" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 2):null }></i>
                            <i className="fa fa-star" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 3):null }></i>
                        </sapn>
        }else if(this.props.rate == 2){
            rating_html = <sapn>
                            <i className="fa fa-star selected" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 1):null }></i>
                            <i className="fa fa-star selected" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 2):null }></i>
                            <i className="fa fa-star" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 3):null }></i>
                          </sapn>
        }else if(this.props.rate == 3){
            rating_html = <sapn>
                            <i className="fa fa-star selected" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 1):null }></i>
                            <i className="fa fa-star selected" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 2):null }></i>
                            <i className="fa fa-star selected" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 3):null }></i>
                        </sapn>
        }else{
            rating_html =<sapn>
                            <i className="fa fa-star" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 1):null }></i>
                            <i className="fa fa-star" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 2):null }></i>
                            <i className="fa fa-star" aria-hidden="true" onClick={this.props.editable ? this.update_rating.bind(this, this.props.opp_id, 3):null }></i>
                        </sapn>
        }
        return(
                <div className="ratings">
                    {rating_html}
                <LoadingOverlay processing={this.state.processing}/>
                </div>
        );
    }
}

module.exports = OppRatings;
