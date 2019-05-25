import React from 'react';

import {translate} from 'crm_react/common/language';
import state, {BASE_FULL_URL} from 'crm_react/common/state';    


class UserListModal extends React.Component {

    constructor() {
        super();
        this.state = {
            result: null
        }
    }

    getUserList(){

         this.serverRequest = $.get('/opportunity/addteamuser', function (data) {
              this.setState({
                result:data,
              });
            }.bind(this));

    }


  handleClose(){
      $('#userListModal').modal('hide');    
      this.props.handleClose()
  }
        
   

    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                     <li className="border-line"><b>{translate('add_team_member')}</b></li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){

        return(
            <div className="modal-footer modal-text-left">
                <button id="selecteduser" type="button" data-id=""  className="btn btn-primary">{translate('select')}</button>
                <button type="button" id="delete_close" data-dismiss="modal" className="btn btn-default btn-sm">{translate('button_close')}</button> 
            </div>
        );
    }

    _renderBody(){
        let result = this.state.result
        let divStyle = {
          display:'none',
          color:"red"
        }

        let icon_style = {
            cursor: 'pointer'
        }
       
        return (
                <div className="modal-body">

                    <table className="table" id="list_table" width="100%">
                        <thead>
                        <tr>
                            <th width="2%">
                                <div className="checkbox">
                                <input id="checkbox" type="checkbox" />
                                <label htmlFor="checkbox"></label>
                                </div>
                            </th>
                            <th width="20%">{translate('label_name')}</th>
                            <th width="20%">{translate('label_email')}</th>
                            <th width="16%">{translate('label_language')}</th>
                            <th width="16%">{translate('label_phone')}</th>
                        </tr>
                        </thead>

                        <tbody>
                          
                        {result?
                            result.json_users.map((user,i)=>{
                                return(
                                      <tr key={i} >
                                          <td>
                                              <div className="checkbox" >
                                                  <input id={user.id !== undefined && user.id!='' ? 'checkbox'+user.id:'checkbox'} value="" data-value={user.name !== undefined && user.name!='' ? user.name:''} data-id={user.id !== undefined && user.id!='' ? user.id :''} type="checkbox" />
                                                  <label htmlFor={user.id !== undefined && user.id!='' ? 'checkbox'+user.id:'checkbox'}></label>
                                              </div>
                                          </td>
                                          <td>{user.name!==undefined&&user.name!=''?user.name:''}</td>
                                          <td>{user.email!==undefined&&user.email!=''?user.email:''}</td>
                                          <td>{user.language!==undefined&&user.language!=''?user.language:''}</td>
                                          <td>{user.phone!==undefined&&user.phone!=''?user.phone:''}</td>
                                      </tr>
                                      )
                            })
                            :''
                        }
                             
                        </tbody>
                    </table>
           
                </div>
       
        );
    }
    render() {
       

        return (
            
            <div className="modal fade" id="userListModal" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-lg ">
                <div className="modal-content">
                  { this._renderHeader() }
                  { this._renderBody() }
                  { this._renderfooter() }

                </div>
               </div>
            </div>
              
        );
    }
}
module.exports = UserListModal;
