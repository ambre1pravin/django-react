import React from 'react';
import {Link, browserHistory} from 'react-router'
import state, {BASE_FULL_URL, DIRECTORY_PATH} from 'crm_react/common/state';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import Header from 'crm_react/component/Header';
import AddPageTopAction from 'crm_react/common/add_page_top_action';
import UserListModal from 'crm_react/page/opportunity/user-list-modal';
import {translate} from 'crm_react/common/language';
import {getCookie } from 'crm_react/common/helper';
import ReactTooltip from 'react-tooltip'


class SalesteamAdd extends React.Component {
    constructor() {
        super();
        this.state = {
            result: null,
            RoleOfUser: '',
            id: 0,
            son_users: null,
            name: '',
            name_class:null,
            sales_manager_id:null,
            sales_manager_name:'',
            team_member: [],

        };

        this.serverRequest = $.get('/salesteams/adddata/', function (data) {
            this.setState({
                id: 0,
                name: name,
                json_users: data.json_users,
                RoleOfUser: data.op_user_permission,
                title: "Create : Sales Team",
            })
        }.bind(this));
    }

    handle_submit(redirect) {
            var csrftoken = getCookie('csrftoken');
            let name = this.state.name;
            let sales_manager_id = this.state.sales_manager_id;
            let team_member = this.state.team_member.filter( function (member) {
                    return member.id
                });
            if (team_member.length > 0) {
                var post_data = {'name': name, 'sales_manager_id': sales_manager_id, 'team_member': team_member};
                if (name != '') {
                    $.ajax({
                        type: "POST",
                        cache: false,
                        url: '/salesteams/saveteam/',
                        data: {
                            ajax: true,
                            fields: JSON.stringify(post_data),
                            csrfmiddlewaretoken: csrftoken,

                        },
                        beforeSend: function () {
                        },
                        success: function (data) {
                            if (data.success === true) {
                                browserHistory.push("/salesteams/list/");
                            }
                        }.bind(this)
                    });
                } else {
                    this.setState({name_class: 'error'})
                }
            }else{
                alert("please select team member")
            }
    }

    //suyash functions
    on_change_name(event){
        let name = event.target.value;
        this.setState({name:name})
    }



    input_on_click(){
      this.setState({name_class:null})
    }

    team_member() {
        let users = this.state.json_users;
        if(this.state.name) {
            if (users.length > 0) {
                ModalManager.open(
                    <UserListModal
                        title="Team Members "
                        modal_id="user-list-modal"
                        page="add"
                        users={users}
                        selected_team_members={this.selected_team_members.bind(this)}
                        onRequestClose={() => true}
                    />
                );
            }
        }else{
            NotificationManager.error('Enter channel name first!!', 'Channel Name::', 5000);
        }
    }

    select_manager(index){
        let managers = this.state.json_users;
        if(managers.length > 0) {
            this.setState({sales_manager_id: managers[index].id, sales_manager_name: managers[index].name})
        }
    }

    selected_team_members(team_members) {
        console.log(team_members)
        this.setState({team_member: team_members})
    }



    handle_remove_member(index){
        let team_member = this.state.team_member;
        team_member.splice(index, 1);
        this.setState({team_member: team_member})
    }

    save_action_fn() {
        this.handle_submit()
    }

    render() {

        let result = this.state.result;
        var bodyStyle = {margin: '20px'};

        return (
            <div>


                <Header />
                <div id="crm-app" className="clearfix module__quotation module__quotation-create">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                                <AddPageTopAction
                                    list_page_link="/salesteams/list/"
                                    list_page_label={translate('sales_team')}
                                    add_page_link="/salesteams/add/"
                                    add_page_label={'Add '+translate('sales_team')}
                                    edit_page_link={false}
                                    edit_page_label={false}
                                    item_name=""
                                    page="add"
                                    module="sales_team"
                                    save_action={this.save_action_fn.bind(this)}
                                />
                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                    <div className="panel panel-default panel-tabular">
                                        <div className="panel-body edit-form">
                                            <div className="row row__flex">
                                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                                    <form id="sales_team_form" autoComplete="Off">
                                                    <table className="detail_table">
                                                        <tbody>
                                                        <tr>
                                                            <td><label className="control-label">Name</label>
                                                            </td>
                                                            <td>
                                                                <div className="form-group">
                                                                    <input value={this.state.name} className={'edit-name form-control '+this.state.name_class}
                                                                           name="name" placeholder="Name.."
                                                                           onChange={this.on_change_name.bind(this)}
                                                                           required ref="name" id="name"
                                                                           onClick ={this.input_on_click.bind(this)}
                                                                           type="text"/>
                                                                    {this.state.name_class ?
                                                                        <label id="name-error" className="error"
                                                                               for="name">This field is required.</label>
                                                                        :null
                                                                    }
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td><label className="control-label">Sales Manager</label></td>
                                                            <td>
                                                                <div className="form-group">
                                                                    <div className="dropdown">
                                                                        <input value={this.state.sales_manager_name} placeholder="Sales Manager.."
                                                                               className="form-control"
                                                                               data-toggle="dropdown" name="manager"
                                                                               aria-expanded="false" type="text"/>
                                                                        <span aria-expanded="false"
                                                                              aria-haspopup="false" role="button"
                                                                              data-toggle="dropdown">
                                                                            <i className="fa fa-angle-down black"></i>
                                                                        </span>
                                                                        <div className="dd-options">
                                                                            <ul className="options-list">
                                                                                {this.state.json_users && this.state.json_users.length > 0 ?
                                                                                    this.state.json_users.map((user, i) => {
                                                                                        return (
                                                                                            <li key={'user_li_' + i} onClick={this.select_manager.bind(this, i)}>{user.name}</li>)
                                                                                    })
                                                                                    : null
                                                                                }
                                                                            </ul>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div>
                                                                <a className="btn btn-primary btn-discard"
                                                                   href="javascript:"
                                                                   onClick={this.team_member.bind(this)}>Select Team Member</a>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="panel panel-default">
                                        <div className="row">
                                            {this.state.team_member && this.state.team_member.length > 0 ?
                                                this.state.team_member.map((user, i) => {
                                                    return (
                                                        <div key={'seleted_user_' + i} style={bodyStyle}
                                                             className="col-xs-12 col-ms-6 col-sm-4 col-md-3 col-lg-3">
                                                            <div className="media">
                                                                <div className="media-left">
                                                                    <img
                                                                        src={user.profile_image}
                                                                        className="img-circle" width={'30'} height={'30'}/>
                                                                </div>
                                                                <div className="media-body media-middle">
                                                                    <h4>
                                                                    {user.name}
                                                                    {user.is_default !=undefined && user.is_default ?
                                                                       <span>
                                                                        <i data-tip data-for={"_is_default_"+user.id}
                                                                        className={"push-left-5 glyphicon glyphicon-info-sign text-primary"}></i>
                                                                        <ReactTooltip place="bottom" id={"_is_default_"+user.id}
                                                                        type="info" effect="float">
                                                                        <span>{'Assigning ' + this.state.name+' as default channel to this user.'}</span>
                                                                        </ReactTooltip>
                                                                       </span>
                                                                        :null
                                                                    }
                                                                    </h4>
                                                                    <div className="h4">{user.email}</div>
                                                                    <div className="h4">{user.phone}</div>

                                                                </div>
                                                            </div>
                                                            <span className="remove-icon-sprite" onClick={this.handle_remove_member.bind(this,i)}></span>
                                                        </div>
                                                    )
                                                })
                                                : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <NotificationContainer/>
            </div>
        );
    }
}
module.exports = SalesteamAdd;
