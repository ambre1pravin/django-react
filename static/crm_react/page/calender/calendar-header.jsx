import React from 'react';
import state, {LOGED_IN_USER} from 'crm_react/common/state';
import { Link} from 'react-router'
import { translate} from 'crm_react/common/language';
import { getCookie} from 'crm_react/common/helper';
import HeaderNotification from 'crm_react/common/header-notification';



class  contactHeader extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            value:'',
            names:[],
            emails:[],
            tags:[],
        }

    }

    handle_input(event){
       this.setState({value:event.target.value })

    }


    handle_by_name(){
        this.state.names.push(this.state.value)
        this.setState({value:''})
        console.log("by name")
        console.log(this.state.value)
        this.ajax_common_search()
    }

    handle_by_email(){
        this.state.emails.push(this.state.value)
        this.setState({value:''})
        console.log("by name")
        console.log(this.state.value)
        this.ajax_common_search()
    }

    handle_by_tags(){
        this.state.tags.push(this.state.value)
        this.setState({value:''})
        console.log("by name")
        console.log(this.state.value)
        this.ajax_common_search()
    }


    remove_names(){
        this.setState({names:[]})
    }

    render_names(){
        let names = this.state.names
        return (
            <div data-type="search" data-key="Name">
            {
                names.map((name, j) =>{
                    return <span  data-separator="or" key= {j}>{name}</span>
                })
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_names.bind(this)}></i>
            </div>
        );
    }

    remove_emails(){
        this.setState({emails:[]})
    }

    render_emails(){
        let emails = this.state.emails
        return (
            <div data-type="search" data-key="Email">
            {
               emails.length > 0 ?
                emails.map((name, j) =>{
                    return <span  data-separator="or"  key= {j}>{name}</span>
                })
               :null
            }
             <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_emails.bind(this)}></i>
            </div>
        );
    }

    remove_tags(){
        this.setState({tags:[]})
    }
    render_tags(){
        let tags = this.state.tags
        return (
            <div data-type="search" data-key="Tags">
            {
               tags.length > 0 ?
                tags.map((name, j) =>{
                    return <span  data-separator="or"  key= {j}>{name}</span>
                })
               :null
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_tags.bind(this)}></i>
            </div>
        );
    }

    ajax_common_search(){
        $.ajax({
             type: "POST",
             dataType: "json",
             url: '/contact/list_ajax/',
            data: {
                emails: this.state.emails,
                tags: this.state.tags,
                names : JSON.stringify(this.state.names),
                contact : JSON.stringify(''),
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            }.bind(this),
            success: function (data) {
               this.setState({result:data});
            }.bind(this)
        });
    }
    render() {
        return (
    <header className={this.props.header_css}>
        <div id="mega-icon" className="pull-left">
        <Link to={'/dashboard/'}>

            <i className="fa fa-th" aria-hidden="true"></i>
        </Link>
        </div>
        <h1 className="pull-left">
        <Link to="/dashboard/" title="Saalz">
            <img src={'/static/front/images/saalz-small.jpg'} alt="Saalz" height="40" />
        </Link>
        </h1>

        { this.props.processing ?
                <span><span className="fa fa-2x fa-spinner fa-spin"></span></span>
                :null
        }

        <div className="pull-right">
            {<HeaderNotification/>}
            <div className="top-profile dropdown">
                <a id="head__profile" href="#" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <span>{LOGED_IN_USER}</span>
                    <i className="fa fa-chevron-down"></i>
                    <img src={'/static/front/images/avtar1.png'} alt={this.props.login_user} className="top-dp" />
                </a>
                <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="profile">
                    <li><Link to="/user/profile/" title="Profile">Profile</Link></li>
                    <li><a href="#" title="Account Settings">Account Settings</a></li>
                    <li role="separator" className="divider"></li>
                    <li>
                        <a href={'/logout'} title="Sign Out">Sign Out</a>
                    </li>
                </ul>
            </div>
        </div>
    </header>

        );
     }
}
module.exports = contactHeader;

