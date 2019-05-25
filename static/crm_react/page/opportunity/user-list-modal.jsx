import React from 'react';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {translate} from 'crm_react/common/language';
import {modal_style} from 'crm_react/common/helper';
import ReactTooltip from 'react-tooltip'

class UserListModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: this.props.users,
            selected_users:[],
            checked:false,
        }
    }

    check_all() {
        let checked = this.state.checked;
        let result_list = this.state.users;
        let temp_contact_list = []
        if (result_list.length > 0) {
            result_list.map((contact, i) => {
                var tem_dic = result_list[i]
                if (contact.checked) {
                    tem_dic['is_assigned'] = false
                } else {
                    tem_dic['is_assigned'] = true
                }
                temp_contact_list.push(tem_dic)
            })
            if (checked) {
                this.setState({checked: false})
            } else {
                this.setState({checked: true})
            }
            this.setState({users: temp_contact_list})
        }
    }

    mark_default(index){
        let result_list = this.state.users;
        if (result_list.length > 0) {
            if (result_list[index].is_default)
                result_list[index].is_default = false;
            else
                result_list[index].is_default = true;
                result_list[index].is_assigned = true;
            this.setState({users: result_list})
        }
    }

    handle_check(index) {
        let result_list = this.state.users;
        if (result_list.length > 0) {
            if (result_list[index].is_assigned || result_list[index].is_default )
                result_list[index].is_assigned = false
            else
                result_list[index].is_assigned = true
            this.setState({users: result_list})
        }
    }

    handle_save(){
        /*let users = this.state.users.filter( function (user) {
            return user.is_assigned === true
            });*/
        let users = this.state.users;
        let assigned_users  =[];
        if(users.length > 0){
            for(var i=0; i < users.length; i++){
                if(users[i]['is_assigned'] || users[i]['is_default']){
                    assigned_users.push(users[i])
                }
            }
        }
        if(assigned_users.length > 0) {
            this.props.selected_team_members(assigned_users);
        }
        this.handle_close()
    }

    handle_close() {
        ModalManager.close(<UserListModal modal_id="user-list-modal" onRequestClose={() => true}/>);
    }

    render_body() {
        console.log("users", this.state.users)
        return (
            <div className="panel-body edit-form">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th style={{'width':'5%'}}>
                                <div className="checkbox">
                                    <input id="view-list__cb-all" value="on"  type="checkbox" onClick={this.check_all.bind(this)}/>
                                    <label></label>
                                </div>
                            </th>
                            <th style={{'width':'20%'}}>Name</th>
                            <th style={{'width':'15%'}}>Email</th>
                            <th style={{'width':'30%'}}>User's Default Channel</th>
                            <th style={{'width':'30%'}}>Mark As Default Channel
                                <i data-tip data-for={"_is_default_"}
                                className={"push-left-5 glyphicon glyphicon-info-sign text-primary"}></i>
                                <ReactTooltip place="bottom" id={"_is_default_"}
                                type="info" effect="float">
                                <span>If select it, channel will be the default for this user.</span>
                                </ReactTooltip>
                            </th>

                        </tr>
                    </thead>
                    <tbody>
                    {this.state.users && this.state.users.length > 0 ?
                        this.state.users.map((user, i) => {
                            return (
                                <tr key={'user_tr_' + i} className={user.is_assigned || user.is_default? 'bg-success':''}>
                                    <td onClick={!user.is_assigned || !user.is_default ? this.handle_check.bind(this,i):''}>
                                        <div className="checkbox" >
                                            <input value={user.id} checked={user.is_assigned || user.is_default ? true : false} type="checkbox"  />
                                            <label></label>

                                        </div>
                                    </td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.default_channel_name}</td>
                                    <td>
                                        <div>
                                            <input value="1" type="checkbox" checked={user.is_default != undefined ? user.is_default : ''} onChange={ this.mark_default.bind(this, i) }/>
                                            {user.is_default && this.props.page=='edit' ?
                                            <span >
                                            <i data-tip data-for={"user_is_default_"+user.id}
                                            className={"push-left-5 glyphicon glyphicon-info-sign text-primary"}></i>
                                            <ReactTooltip  place="bottom" id={"user_is_default_"+user.id}
                                            type="info" effect="float" data-multiline="true" data-place="top">
                                            <span>To remove a Team Member from his default sales channel.  "Default channel" will automatic set as default channel for this user.</span>
                                            </ReactTooltip>
                                            </span>
                                            :null
                                        }
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                        : null
                    }
                    </tbody>
                </table>
            </div>
        );
    }

    render() {
        var bodyStyle = {overflow: 'auto', maxHeight: '75vh'};
        return (
            <Modal
                style={modal_style}
                onRequestClose={this.state.onRequestClose}
                effect={Effect.Fall}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button className="close" type="button" onClick={this.handle_close.bind(this)}>
                                <span aria-hidden="true">×</span>
                            </button>
                            <h4 className="modal-title">{this.props.title}</h4>
                        </div>
                        <div className="modal-body" style={bodyStyle}>
                            { this.render_body() }
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-default" type="button"
                                    onClick={this.handle_close.bind(this)}>{translate('button_close')}</button>
                            <button className="btn btn-primary"
                                    type="button"
                                    onClick={this.handle_save.bind(this)}
                            >{translate('button_save')}</button>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
}

module.exports = UserListModal;
