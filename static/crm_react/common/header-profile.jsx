import React from 'react';
import { Link } from 'react-router'
import state, {IMAGE_PATH, LOGED_IN_USER, PROFILE_IMAGE} from 'crm_react/common/state';


class HeaderProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result:[],
        }
    }

    render() {
        return (
            <div className="top-profile dropdown">
                <a id="head__profile" href="#" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                    <span>{LOGED_IN_USER}</span>
                    <i className="fa fa-chevron-down"></i>
                    <img src={PROFILE_IMAGE} alt={LOGED_IN_USER} className="top-dp" />
                </a>
                <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="profile">
                    <li><Link to="/user/profile/" title="Profile">Profile</Link></li>
                    <li><a href="#" title="Account Settings">Account Settings</a></li>
                    <li role="separator" className="divider"></li>
                    <li><a href={'/logout'} title="Sign Out">Sign Out</a></li>
                </ul>
            </div>
        );
    }
}
module.exports = HeaderProfile;