import React from 'react';
import {  Link } from 'react-router'
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import Header from 'crm_react/component/Header';
import Dropdown from 'crm_react/component/Dropdown';
import {translate} from 'crm_react/common/language';

class  SalesteamView extends React.Component {
  constructor() 
  {
    super();
    this.state = {
                result            : null,
                isOpen: false,
                select_value: '',
                select_id: '',
                RoleOfUser    : '',
                id : 0,
                name : '',
                use_leads : false ,
                use_quotations : false,
                use_invoices   : false,
                email          : '', 
                json_users     : null
            
    }

   this.getSalesteamById = this.getSalesteamById.bind(this);
   this.openModalWithData  = this.openModalWithData.bind(this);
   this.handleChange      = this.handleChange.bind(this)
}

 componentDidMount(){
    var edit_id = this.props.params.Id;

    this.getSalesteamById(edit_id);

  }

 getSalesteamById(id){
    this.serverRequest = $.get('/salesteams/editdata/'+id, function (data) {
      if(data.success==true){
        this.setState({
            result : data,
            name        : data.user.name!==undefined ? data.user.name: '',
            email        : data.user.email!==undefined ? data.user.email: '',
        })
      }   
    }.bind(this));
  }
  
   openModalWithData(id, name){
        $('#Modal_teamEdit').modal('show');
            if(id!=0 && id>0){
            $.ajax({
            type: "POST",
            cache: false,
            url: '/opportunity/getTeamData/'+id,
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
                     url: base_url + 'opportunity/saveteam/',
                  data: {
                     ajax: true,
                     fields: JSON.stringify(Data),
                     
                  },
                  beforeSend: function () {
                  },
                  success: function (data) {
                     if(data.success === true){
                        this.handleClose();
                        this.props.updateTeamData(data.name,data.id);
                     }
                  }.bind(this)
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

/*Start: user add edit modal */
    handleUserAddEdit(id, input_value){
      this.setState({user_modal_is_open:true}, ()=>{this.refs.user_child.openModalWithData(id, input_value)});
    }


/*End: user add edit modal*/


    setSelectedTeamLeader(id, input_value){
    this.setState({
            select_value: input_value,
            select_id: id,
    })
}

   render() {
    let result  = this.state.result

    return (
    <div>

    <Header />
        <div id="crm-app" className="clearfix module__quotation module__quotation-create">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                      <div className="row top-actions">
                          <div className="col-xs-12 col-sm-12">
                              <ul className="breadcrumbs-top">
                              <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li><Link to={'/salesteams/list/'} className="breadcumscolor" title={translate('salesteam')}>{translate('salesteam')}</Link></li>
                                  <li>{this.state.name}</li>
                              </ul>
                              <button className="btn btn-primary" onClick = {this.handleTeamSubmit.bind(this)}>{translate('save')}</button>
                              <Link to={'/salesteams/list/'}  className="btn btn-primary btn-discard btn-transparent" >{translate('button_discard')}</Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 pull-right text-right">
                              <ul className="list-inline inline-block top-actions-pagination">
                                  <li><a href="#"><i className="fa fa-chevron-left"></i></a></li>
                                  <li><a href="#"><i className="fa fa-chevron-right"></i></a></li>
                              </ul>
                          </div>
                      </div>
                      {/*end top-actions*/}
                        <div className="row crm-stuff">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                           <form id="myteamform" action="" method="POST" className="edit-form">
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-lg-12 col-md-12">

                                <div className="row  form-group">
                                    <div className="col-lg-3 col-md-3">
                                        <label className="text-muted control-label labelifno">{translate('name')}*</label>
                                      
                                    </div>
                                    <div className="col-lg-6 col-md-6">
                                        <div className="form-group">
                                            <input type="text" name="name" value={this.state.name} onChange={this.handleChange} className="form-control" data-id="1" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-lg-3 col-md-3">
                                        <input type="checkbox" name="use_leads" value="1" checked={this.state.use_leads} onChange={this.handleChange}  />{translate('opportunities')}
                                    </div>
                                    <div className="col-lg-3 col-md-3">
                                        <input type="checkbox" name="use_quotations" value="1" checked={this.state.use_quotations} onChange={this.handleChange} />{translate('label_quotation')}
                                    </div>
                                    <div className="col-lg-3 col-md-3">
                                        <input type="checkbox" name="use_invoices" value="1"  checked={this.state.use_invoices}  onChange={this.handleChange} />{translate('label_invoice')}
                                    </div>
                                </div>
                                <div className="row">
                                </div>
                                <div className="">
                                   
                                    <div >
                                        <table className="col-lg-9 col-md-9">
                                            <tbody>
                                             {this.state.json_users?
                                            <tr>
                                              <td><label className="text-muted control-label">Sales Manager</label></td>
                                              <td>
                                                  <Dropdown
                                                    name            = 'Sales Manager'
                                                    input_value     = {this.state.select_value?this.state.select_value:''}
                                                    input_id        = {this.state.select_id?this.state.select_id:''}
                                                    inputtext       = 'teamname'
                                                    inputname       = 'sales-person'
                                                    modal_id        = '#userModal'
                                                    setSelected     = {this.setSelectedTeamLeader.bind(this)}
                                                    handleAddEdit   = { this.handleUserAddEdit.bind(this)} 
                                                    json_data       = {this.state.json_users} 
                                                    ref = 'dropdown'/>
                                              </td>
                                            </tr>
                                              :''}
                                            </tbody>
                                        </table>
                                        
                                    </div>
                                </div>
                                 <div className="row">
                                </div>
                                <div className="row">
                                    <div className="col-lg-3 col-md-3 ">
                                        <label className="text-muted control-label labelifno">{translate('email_alias')}</label>
                                    </div>

                                     <div className="col-lg-6 col-md-6">
                                        <div className="form-group">
                                           <input type="text" className="form-control"  name="email" value={this.state.email} onChange={this.handleChange} />
                                           <span id="alias_email_symbol" className="emailalis">@</span>
                                        </div>
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
                                    <div className="memberAdd"><a  id="addmember" data-toggle="modal" data-target="#userListModal" href="" onClick={()=>this.refs.user_list_child.getUserList()}  type="button" data-id=""  className="btn btn-primary">{translate('add')}</a></div>
                                    <div className="members">
                                        <ul className="memberblock">
                                           
                                        </ul>
                                        
                                    </div>
                                </div>         
                            </div>       
                        </div>
                       </div>   
                     </form>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
     </div>
    );

  } 
}
module.exports = SalesteamView;
