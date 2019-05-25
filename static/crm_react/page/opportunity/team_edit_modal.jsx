import React from 'react';
import {translate} from 'crm_react/common/language';
import state, {BASE_FULL_URL} from 'crm_react/common/state';
import UserAddEditModal from 'crm_react/page/opportunity/user_add_edit_modal';   
import UserListModal from 'crm_react/page/opportunity/user_list_modal';   
import Dropdown from 'crm_react/component/Dropdown';  


class TeamEditModal extends React.Component {

    constructor() {
        super();
        this.state = {
            result_team    : null,
            isOpen         : false,
            select_value   : '',
            select_id      : '',
            RoleOfUser     : '',
            id             : 0,
            name           : '',
            use_leads      : false ,
            use_quotations : false,
            use_invoices   : false,
            email          : '', 
            json_users     : null

            }

    this.openModalWithData  = this.openModalWithData.bind(this)
     this.handleChange      = this.handleChange.bind(this)
    }

    openModalWithData(id, name){


        $('#Modal_teamEdit').modal('show');

            if(id!=0 && id>0){

            $.ajax({
            type: "POST",
            cache: false,
            url:  '/opportunity/getTeamData/'+id,
            data: {
              ajax: true,
            },
            beforeSend: function () {
            },
            success: function (data) {
                    this.setState({
                        id              : data.id,
                        name            : data.teamName,
                        use_leads       : data.UseLeads==1?true :false,
                        use_quotations  : data.UseQuotations==1?true :false,
                        use_invoices    : data.UseInvoices==1?true :false,
                        email           : data.email,
                        json_users      : data.json_users,
                        RoleOfUser      : data.op_user_permission,
                        select_value    : data.TeamLeaderName?data.TeamLeaderName:'',
                        select_id       : data.TeamLeader?data.TeamLeader:'',
                        teammember         : data.teammember,
                        title           : "Edit : Sales Team",

                    })
                    $('#Modal_teamEdit').modal('show');
            }.bind(this)
        });

        }
        else if(id==0){
             this.serverRequest = $.get('/opportunity/addteam/', function (data) {
                 this.setState({
                    RoleOfUser      : data.op_user_permission,
                    id              : 0,
                    name            : name,
                    use_leads       : false,
                    use_quotations  : false,
                    use_invoices    : false,
                    email           : '' ,
                    json_users      : data.json_users,
                    RoleOfUser      : data.op_user_permission,
                    title           : "Create : Sales Team",
                 })

                 $('#Modal_teamEdit').modal('show');
            }.bind(this));
    
            
        }

    }


    handleTeamSubmit(){

         var Data = $('#myteamform').serializeArray();
                $.ajax({
                     type: "POST",
                     cache: false,
                     url:  '/opportunity/saveteam/',
                  data: {
                     ajax: true,
                     fields: JSON.stringify(Data),
                     
                  },
                  beforeSend: function () {
                  },
                  success: function (data) {
                     if(data.success === true){
                        this.handleClose()  
                        this.props.updateTeamData(data.name,data.id);
                     }
                  }.bind(this)
        });
                            

    }


    updateTeamLeaderInputState(created_team_name, created_team_id){
       this.setState({
            select_value:created_team_name ,
              select_id:created_team_id 
             
          });
       
      }

  

    handleChange(event) {
    
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
            [name]: value,
        });

    }


    handleClose(){
        $('#Modal_teamEdit').modal('hide');    
        this.props.handleClose();
    }


/*Start: user add edit modal */
    handleUserAddEdit(id, input_value){
      this.setState({user_modal_is_open:true}, ()=>{this.refs.user_child.openModalWithData(id, input_value)});
    }

    handleCloseUserModal(){
     this.setState({user_modal_is_open:false}); 
    }

    handleCloseUserListModal(){
     this.setState({user_list_modal_is_open:false}); 
    }
/*End: user add edit modal*/


setSelectedTeamLeader(id, input_value){
    this.setState({
            select_value: input_value,
            select_id: id,
    })
}



    _renderHeader(title){
        return(
                <div className="modal-header text-left">
                    <button type="button" className="close"  aria-label="Close" onClick={this.handleClose.bind(this)} ><span aria-hidden="true">&times;</span></button>
                    <ul className="list-inline inline">
                        <li>{translate('edit_team')}</li>
                    </ul>
                </div>
        );
    }

    _renderfooter(){

        return(
            <div className="modal-footer modal-text-left">

                <button type="button" id="submitteam" className="btn btn-primary"  onClick={this.handleTeamSubmit.bind(this)}>{translate('button_save')}
                </button>


                <button type="button" className="btn btn-default"   onClick={this.handleClose.bind(this)} >{translate('button_close')}
                </button>     
            </div>
        );
    }

    _renderBody(){
        let result_team = this.state.result_team
        let teammember           = this.state.teammember

        let divStyle = {
          display:'none',
          color:"red"
        }

        let icon_style = {
            cursor: 'pointer'
        }
       
        return (
          
             
            <div className="modal-body">
               
                <form id="myteamform" action="" method="POST" className="edit-form">
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-lg-12 col-md-12">

                                <div className="row  form-group">
                                    <div className="col-lg-3 col-md-3">
                                        <label className="text-muted control-label labelifno">{translate('label_name')}*</label>
                                      
                                    </div>
                                    <div className="col-lg-9 col-md-9">
                                        <div className="form-group">
                                            <input type="text" name="name" value={this.state.name} onChange={this.handleChange} className="form-control" data-id="1" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-8 col-md-8">
                                        <input type="checkbox" name="use_leads" value="1" checked={this.state.use_leads} onChange={this.handleChange}  />{translate('opportunities')}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-3 col-md-3">
                                        <input type="checkbox" name="use_quotations" value="1" checked={this.state.use_quotations} onChange={this.handleChange} />{translate('label_quotation')}
                                    </div>
                                    <div className="col-lg-3 col-md-3">
                                        <input type="checkbox" name="use_invoices" value="1"  checked={this.state.use_invoices}  onChange={this.handleChange} />{translate('label_invoice')}
                                    </div>
                                </div>

                                <div className="">
                                   
                                    <div >
                                        <table className="  col-lg-10 col-md-12 ">
                                            <tbody>
                                       {this.state.json_users?
                                       <tr>
                                        <td><label className="text-muted control-label">Sales Person</label></td>
                                            <td>
                                                <Dropdown
                                                    name='Sales Person'
                                                    input_value= {this.state.select_value?this.state.select_value:''}
                                                    input_id = {this.state.select_id?this.state.select_id:''}
                                                    inputtext = 'teamname'
                                                    inputname = 'sales-person'
                                                    modal_id = '#userModal'
                                                    setSelected = {this.setSelectedTeamLeader.bind(this)}
                                                    handleAddEdit = { this.handleUserAddEdit.bind(this)} 
                                                    json_data ={this.state.json_users} 
                                                    ref = 'dropdown'/>
                                            </td>
                                        </tr>
                                      :''}
                                            </tbody>
                                        </table>
                                        
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-3 col-md-3 ">
                                        <label className="text-muted control-label labelifno">{translate('email_alias')}</label>
                                    </div>
                                    <div className="col-lg-6 col-md-6 form-group">
                                        <input type="text"  name="email" value={this.state.email} onChange={this.handleChange} /><span id="alias_email_symbol" style={{float:'right'}}>@</span>
                                    </div>
                                </div> 

                                <input type="hidden" name="team_id" value={this.state.id} onChange={this.handleChange} />
                                
                                <div className="row">

                                    <div className="col-lg-3 col-md-3 ">
                                        <label className="text-muted control-label labelifno">{translate('team_members')}</label>
                                    </div>
                                </div>
                                <hr/>

                                <div className="row">
                                    <div className="memberAdd">
                                        <a id="addmember" data-toggle="modal" data-target="#userListModal" href="" onClick={()=>this.refs.user_list_child.getUserList(teammember)}  type="button" data-id=""  className="btn btn-primary">Add</a></div>
                                    <div className="members">
                                        <ul className="memberblock">

                                     {teammember ?
                                      teammember.map((columns, i) =>{
                                       return( 
                                          <li className="col-lg-1 team" value={columns.id?columns.id :'N/A'} data-id={columns.id?columns.id :'N/A'}>
                                          <input type="hidden" name="teammember[]" value={columns.id?columns.id :'N/A'} />
                                          <div className="name">{columns.name?columns.name :'N/A'}</div> 
                                          <div  className="delete" id="delmem">x</div></li>
                                          )
                                      })
                                      : ''
                                    }
                                        </ul>
                                    </div>
                                </div>         
                            </div>       
                        </div>
                    </div>   
                </form>
           
            </div>
       
        );
    }
    render() {
       

        return (
            <div>
                <div className="modal fade" id="Modal_teamEdit" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"  data-keyboard="false" data-backdrop="static">
                  <div className="modal-dialog modal-lg ">
                    <div className="modal-content">
                      { this._renderHeader('Edit Column') }
                      { this._renderBody() }
                      { this._renderfooter() }

                    </div>
                  </div>
                </div>
                {this.state.user_modal_is_open==true?
                  <UserAddEditModal   ref = 'user_child' 
                                    user_permission = {this.state.RoleOfUser && this.state.RoleOfUser == 'ROLE_VIEW_OWN' ? 'own' : 'all' }  
                                    updateUserInputState = {this.updateTeamLeaderInputState.bind(this)}
                                    handleClose  = {this.handleCloseUserModal.bind(this)} />
                :''}

                <UserListModal   ref = "user_list_child" 
                                handleClose  = {this.handleCloseUserListModal.bind(this)} />

            </div>

        );
    }
}
module.exports = TeamEditModal;
