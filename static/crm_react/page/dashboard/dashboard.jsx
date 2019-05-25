import React from 'react';
import {  Link } from 'react-router'
import ContactHeader from 'crm_react/page/contact/contact-header';


import { modal_style } from 'crm_react/common/helper';

import state, {RELATIVE_URL,BASE_FULL_URL, ROLES, LOGED_IN_USER, activation_key, user_status,PROFILE_IMAGE} from 'crm_react/common/state';
import { translate} from 'crm_react/common/language';

class  Dashboard extends React.Component {

	constructor() {
        super();
        this.state = {
           login_user:'',
           modules:[],
           msg_info:'',
           msg_link:'',
           trial_over:null,
           expire_message:null
        }
        this.serverRequest = $.get('/user-modules/', function (data) {
            this.setState({modules:data.result,
                msg_info:data.message,
                msg_link:data.link,
                trial_over:data.trial_over,
                expire_message:data.expire_message
            });
        }.bind(this));
    }

  render_top_message(){
	    return(
	        this.state.msg_info !=''?
                <div className="col-xs-12 col-ms-12 col-sm-12 col-md-12 col-lg-12 menu-message">
                    <p>{this.state.msg_info}</p>
                    { this.state.msg_link!='' ?
                        <p><i className="fa fa-hand-o-right" aria-hidden="true"></i> <a href={this.state.msg_link} title="Subscribe Now">Subscribe NOW and become Premium</a></p>
                        : null
                    }
                </div>
            :null
        );
  }

  render_modules(){
    let modules = this.state.modules
    let modules_length = modules.length
    return(
        <div className="row"  data-length={modules_length}>

        {
            modules.length > 0 ?
                modules.map((data, j) =>{
                    return <div className="col-xs-4 col-ms-3 col-sm-3 col-md-2 col-lg-2" key={'div_'+ j}>
                                <Link to={data.link} className={data.anchor_class} key={'link_'+ j}>
                                    <i className={data.css_class} key={'div_i'+ j}></i>
                                    <span key={'span_'+ j}>{data.label}</span>
                                </Link>
                    </div>
                })
            :null
        }
        </div>
    );
   }


  render() {
    return (
        <div>
        <ContactHeader header_css="crm-header clearfix" login_user={LOGED_IN_USER} profile_image={PROFILE_IMAGE}/>
             <div id="mega-menu">
                <div className="menu-squares">
                    <div className="row" >
                    { this.render_top_message() }
                    </div>
                    { this.render_modules() }
                 </div>
            </div>
        </div>
    );
  }
}
module.exports = Dashboard;