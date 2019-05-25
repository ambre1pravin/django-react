import React from 'react';
import {NotificationManager} from 'react-notifications';
import {  Link, browserHistory} from 'react-router'
import { translate} from 'crm_react/common/language';
import { validate_email, js_uc_first} from 'crm_react/common/helper';
import Dropzone from  'react-dropzone'
const request = require('superagent');
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6


class  UserProfile extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            user_id:'',
            name:'',
            email:'',
            password:'',
            phone:'',
            mobile:'',
            first_name:'',
            last_name:'',
            language:'French',
            language_value:'French',
            profile_image:'/static/front/images/profile.png',
            signature:'',
            google_client_id:'',
            google_client_secret:'',
            time_zones:[],
            user_time_zone:'',
            modules:{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline','strike', 'blockquote'],
                      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                      ['link', 'image'],
                      ['clean']
                    ],
                  },
           formats:[
                    'header',
                    'bold', 'italic', 'underline', 'strike', 'blockquote',
                    'list', 'bullet', 'indent',
                    'link', 'image'
                  ]
        }

        this.handleChange = this.handleChange.bind(this)
        this.serverRequest = $.get('/user/get-profile/', function (data) {
            if(data.success){
                this.setState({user_id: data.user.user_id,
                                name:data.user.username,
                                email:data.user.email,
                                phone:data.user.phone,
                                mobile:data.user.mobile,
                                first_name:data.user.first_name,
                                last_name:data.user.last_name,
                                language:data.user.language,
                                signature:data.user.signature,
                                profile_image:data.user.profile_image,
                                google_client_id:data.user.google_client_id,
                                google_client_secret:data.user.google_client_secret,
                                time_zones:data.time_zones,
                                user_time_zone:data.user.user_time_zone
                            })
            }
        }.bind(this));
        this.handle_save = this.handle_save.bind(this)
    }

    handleChange(value) {
        this.setState({ signature: value })
    }

    onchange_time_zone(event){
	    let user_time_zone =  event.target.value;
        this.setState({user_time_zone:user_time_zone})
    }

    handle_input(field, event){
        if(field =='name'){
            this.setState({name : event.target.value})
        }else if(field =='email'){
            this.setState({email : event.target.value})
        }else if(field =='password'){
            this.setState({password : event.target.value})
        }else if(field =='phone'){
            this.setState({phone : event.target.value})
        }else if(field =='mobile'){
            this.setState({mobile : event.target.value})
        }else if(field =='first_name'){
            this.setState({first_name : event.target.value})
        }else if(field =='last_name'){
            this.setState({last_name : event.target.value})
        }else if(field =='google_client_id'){
            this.setState({google_client_id : event.target.value})
        }else if(field =='google_client_secret'){
            this.setState({google_client_secret : event.target.value})
        }
    }

    handle_input_onchange(value){
         this.setState({language : value})
    }

    // profile image upload
    onDrop(accepted, rejected) {
    var csrftoken = getCookie('csrftoken');
    const req = request.post('/user/image-upload/');
      if (accepted.length > 0 ){
          accepted.forEach(file => {
              req.attach('image', file);
          });
          req.set('csrfmiddlewaretoken', csrftoken)
          req.end((err, res) => {
              var obj = JSON.parse(res.text);
              if(obj.success && obj.url!=''){
                this.setState({ profile_image:obj.url})
              }
          });
      }
    }

    handle_save(){
        let roles =[]
        var check_email = validate_email(this.state.email)
        if(check_email){
            this.setState({email_wrong_class: '' })
        }else{
            this.setState({email_wrong_class:'field-error error-focus'})
        }
        if(this.state.email!='' && this.state.name !='' && this.state.user_id > 0) {
            if(check_email) {
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: '/user/save/',
                    data: {
                        user_id: this.state.user_id,
                        name: this.state.name,
                        email:this.state.email,
                        password: this.state.password,
                        language: this.state.language,
                        phone: this.state.phone,
                        mobile: this.state.mobile,
                        first_name: this.state.first_name,
                        last_name: this.state.last_name,
                        profile_image:this.state.profile_image,
                        signature:this.state.signature,
                        google_client_id:this.state.google_client_id,
                        google_client_secret:this.state.google_client_secret,
                        user_time_zone:this.state.user_time_zone,
                        roles: JSON.stringify(roles)
                    },
                    beforeSend: function () {
                        this.props.process_state_change(true)
                    }.bind(this),
                    success: function (data) {
                        if (data.success === true) {
                            if (data.user > 0) {
                                this.props.process_state_change(false)
                                 NotificationManager.success(data.msg, translate('label_success'), 10000);
                                if(data.redirect_url){
                                   setInterval( () => {
                                        window.location.href =  data.redirect_url;
                                   },7000)
                                }else {
                                    browserHistory.push('/user/list/');
                                }
                            } else {
                                NotificationManager.error(data.msg, translate('label_success'), 5000);
                            }
                        } else {
                            this.props.process_state_change(false)
                            NotificationManager.error(data.msg, translate('label_error'), 5000);
                        }
                    }.bind(this)
                });
            }else{
                this.setState({email_wrong_class:'field-error error-focus'})
                NotificationManager.error('Wrong email.', translate('label_error'), 5000);
            }
        }else{
            this.setState({field_error_class:'field-error error-focus'})
            NotificationManager.error('username and email can not be blank.', translate('label_error'), 5000);
        }
    }

    render() {
        var marginTop ={marginTop:'25px'}
        var marginLeft ={marginLeft:'10px'}
        let time_zones = this.state.time_zones;
        return (
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <div className="row top-actions">
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                        <button id ='save_all' onClick={this.handle_save.bind(this)} className="btn btn-primary">{translate('button_save')}</button>
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6"></div>
                </div>
                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular">
                            <div className="panel-body edit-form">
                                <div className="row row__flex">
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 border-right">
                                        <table className="detail_table">
                                            <tbody>
                                                <tr>
                                                    <td><label className="text-muted control-label">Name</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.name} placeholder="Name"  type="text" onChange={this.handle_input.bind(this,'name')} readOnly="true"/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Email</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.email} placeholder="Email"  type="text" onChange={this.handle_input.bind(this,'email')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Password</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.password} placeholder="Password"  type="password" onChange={this.handle_input.bind(this,'password')} />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Phone</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.phone} placeholder="Phone"  type="text" onChange={this.handle_input.bind(this,'phone')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Mobile</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.mobile} placeholder="Mobile"  type="text" onChange={this.handle_input.bind(this,'mobile')} />
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">First Name</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.first_name} placeholder="First Name"  type="text" onChange={this.handle_input.bind(this,'first_name')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Last Name</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input value={this.state.last_name} placeholder="Last Name"  type="text" onChange={this.handle_input.bind(this,'last_name')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">{translate('label_language')}</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <div className="dropdown">
                                                                <input value={js_uc_first(this.state.language)} placeholder={translate('label_language')} className="form-control" data-toggle="dropdown" name="Language" aria-expanded="false" type="text" />
                                                                <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown">
                                                                    <i className="fa fa-angle-down black"></i>
                                                                </span>
                                                                <div className="dd-options">
                                                                    <ul className="options-list">
                                                                        <li onClick={this.handle_input_onchange.bind(this,'french')}>{translate('label_french')}</li>
                                                                        <li onClick={this.handle_input_onchange.bind(this,'english')}>{translate('label_english')}</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Signature</label></td>
                                                    <td>
                                                        <ReactQuill value={this.state.signature}
                                                            onChange={this.handleChange} theme="snow"
                                                            modules={this.state.modules}
                                                            formats={this.state.formats}
                                                        />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Google Api Client_id</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input style={{width:'100%'}}  value={this.state.google_client_id} placeholder="Client Id"  type="text" onChange={this.handle_input.bind(this,'google_client_id')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Google Api Client_Secrect</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <input style={{width:'100%'}} value={this.state.google_client_secret} placeholder="Client Secret"  type="text" onChange={this.handle_input.bind(this,'google_client_secret')}/>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><label className="text-muted control-label">Time Zone</label></td>
                                                    <td>
                                                        <div className="form-group">
                                                            <select className="form-control fa fa-angle-down black" onChange={this.onchange_time_zone.bind(this)} value={this.state.user_time_zone}>
                                                                {
                                                                    time_zones.map((name, j) => {
                                                                       return <option value={name} key={j}>{name}</option>
                                                                    })
                                                                }
                                                            </select>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="col-xs-12 col-sm-12 col-md-4 col-lg-4">
                                        <table className="detail_table">
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div className="edit-dp">
                                                            <Dropzone
                                                                accept="image/jpeg, image/png"
                                                                style={{width:'100px',height:'100px'}}
                                                                onDrop={this.onDrop.bind(this)}
                                                            >
                                                            <img  src={ this.state.profile_image } width="98" height="98" />
                                                            <i className="fa fa-pencil edit"></i>
                                                           </Dropzone>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
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
module.exports = UserProfile;
