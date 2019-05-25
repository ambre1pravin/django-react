import React from 'react';
import { NotificationManager} from 'react-notifications';
import { Link,browserHistory } from 'react-router'
import { Modal, ModalManager} from 'react-dynamic-modal';
import { translate} from 'crm_react/common/language';

class  UserList extends React.Component {
	constructor() {
        super();
        this.state = {
            login_user:'',
            users:[],
            action:true,
            delete_user_list:[],
        }
        this.serverRequest = $.get('/user/all_users/', function (data) {
            if(data.success == 'true' || data.success == true){
                this.setState({users:data.users})
            }
        }.bind(this));
    }
     // check_it
     check_all(){
        let checked = this.state.checked
        let result_list = this.state.users;
        let temp_contact_list = []
        if(result_list.length > 0){
            result_list.map((contact, i) =>{
                //alert(contact.is_staff)
                var tem_dic = result_list[i]
                if(contact.checked){
                    tem_dic['checked'] = false
                }else{
                    tem_dic['checked'] = true
                }
                if(!contact.is_staff){
                    tem_dic['checked'] = false
                }
                temp_contact_list.push(tem_dic)
            })
            if(checked){
                this.setState({checked : false})
            }else{
                this.setState({checked : true})
            }
            this.setState({users : temp_contact_list})
        }
     }

     handle_check(index){
        let result_list = this.state.users;
        console.log(result_list.length)
        if(result_list.length > 0){
            if(result_list[index].checked)
                result_list[index].checked = false
            else
                result_list[index].checked = true
            this.setState({users : result_list})
        }
     }

     handle_delete(){
        let users = this.state.users;
        let delete_user_list = this.state.delete_user_list
        //let csrftoken = this.getCookie('csrftoken');
        if(users.length > 0){
            users.map((user, i) =>{
                if(users[i].checked){
                    delete_user_list.push(users[i].id)
                }
            })
            this.setState({delete_user_list : delete_user_list})
        }
        if(this.state.delete_user_list.length > 0){
            $.ajax({
                type: "POST",
                dataType: "json",
                url:'/user/delete/',
                data: {
                    users : JSON.stringify(this.state.delete_user_list),
                },
                beforeSend: function () {
                    this.props.process_state_change(true)
                }.bind(this),
                success: function (data) {
                    if(data.success === true || data.success == 'true'){
                        NotificationManager.success(data.msg, 'Success',5000);
                        this.props.process_state_change(false)
                        this.setState({delete_user_list : [] })
                        $.get('/user/all_users/', function (return_data) {
                              this.setState({
                                users:return_data.users
                             });
                        }.bind(this));
                    }
                    else{
                            alert('Something went wrong!!')
                        }
                }.bind(this)
            });
        }
     }


     handle_change_status(key, user_id, user_status){
        let users = this.state.users
        if (user_id  >0 ) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url:'/user/change-status/',
                data: {
                    user_id: user_id,
                    user_status: user_status
                },
                beforeSend: function () {

                    this.props.process_state_change(true)
                }.bind(this),
                success: function (data) {
                    if (data.success === true || data.success == 'true') {
                        NotificationManager.success(data.msg, 'Success', 5000);
                        users[key]['status'] = data.user_status
                        users[key]['user_status_class'] =data.user_status_class
                        this.setState({users: users})
                        this.props.process_state_change(false)
                    }
                    else {
                        alert('Something went wrong!!')
                    }
                }.bind(this)
            });
        }
     }

    handle_row_click(user_id){
        browserHistory.push('/user/view/'+user_id+'/');
    }

    render_users(){
        let users = this.state.users
        return(
            users.length > 0 ?
            users.map((user, j) =>{
                 return <tr key={j} className={user.row_css} >
                    <td>
                    <div className="checkbox">
                    <input id="view-list__cb-1" value={user.id} checked={user.checked} type="checkbox" onChange={this.handle_check.bind(this,j)}/>
                    <label></label>
                    </div>
                    </td>
                     { user.editable ?
                         <td style={{color:user.color}} onClick={this.handle_row_click.bind(this,user.id)}>{user.email}</td>
                       : <td style={{color:user.color}}>{user.email}</td>

                     }
                     { user.editable ?
                          <td style={{color:user.color}} onClick={this.handle_row_click.bind(this,user.id)}>{user.phone}</td>
                       :  <td style={{color:user.color}}>{user.phone}</td>

                     }
                     { user.editable ?
                         <td style={{color:user.color}} onClick={this.handle_row_click.bind(this,user.id)}>{user.language}</td>
                       : <td style={{color:user.color}}>{user.language}</td>

                     }
                     { user.editable ?
                         <td style={{color:user.color}} onClick={this.handle_row_click.bind(this,user.id)}>{user.user_type}</td>
                       : <td style={{color:user.color}} >{user.user_type}</td>

                     }
                     { !user.super_admin ?
                         <td onClick={this.handle_change_status.bind(this, j, user.id, user.status)}>
                             <button type="button" className="btn btn-default btn-sm">
                                 <span className={'glyphicon '+user.user_status_class}></span>
                             </button>
                         </td>
                         : <td>
                             <button type="button" className="btn btn-default btn-sm">
                                 <span className={'glyphicon '+user.user_status_class}></span>
                             </button>
                          </td>
                     }
                </tr>
            })
            :null
        )
    }

  render() {
    return (
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
           <div className="row top-actions">
                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                    <ul className="breadcrumbs-top">
                        <li>
                            <Link to={'/contact/list/'}>{translate('label_user')}</Link>
                        </li>
                    </ul>
                    <Link to={'/user/create/'} className="btn btn-new new-sub-contact">{translate('button_create')}  {translate('label_user')}</Link>
                </div>
                <div className="col-xs-12 col-sm-12 pull-right text-right">
                        <ul className="list-inline inline-block filters-favourite">
                          <li className="dropdown">
                                <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="favourites">
                                     Actions <i className="fa fa-angle-down" ></i>
                                </span>
                              <ul className="dropdown-menu" aria-labelledby="favourites">
                                  <li><a  onClick={this.handle_delete.bind(this)}>{translate('button_delete')} </a></li>
                                  <li className="divider"></li>
                              </ul>
                          </li>
                        </ul>
                </div>
            </div>
            <div className="row crm-stuff">
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                   <div className="tab-content">
                        <div role="tabpanel">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>
                                        <div className="checkbox">
                                        <input id="view-list__cb-all" value="on" type="checkbox"  onChange={this.check_all.bind(this)}/>
                                        <label></label>
                                        </div>
                                        </th>
                                        <th>{translate('label_email')}</th>
                                        <th>{translate('label_phone')}</th>
                                        <th>{translate('label_language')}</th>
                                        <th>User Type</th>
                                        <th>{translate('label_status')}</th>

                                    </tr>
                                </thead>
                                <tbody>
                                {this.render_users()}
                                </tbody>
                            </table>
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
  }
}
module.exports = UserList;
