import React from 'react';
import { Modal, ModalManager} from 'crm_react/component/custom_modal';
import { translate} from 'crm_react/common/language';
import ContactHeader from 'crm_react/page/contact/contact-header';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import AppUninstallPopup from 'crm_react/page/user_settings/app-uninstall-popup';


class  InstallApplications extends React.Component {

	constructor() {
        super();
        this.state = {
           login_user:'',
           modules:[],
           msg_info:'',
           msg_link:'',
           processing:false
        }
        this.uninstall_status = this.uninstall_status.bind(this)
        this.ok_true = this.ok_true.bind(this)
        this.serverRequest = $.get('/installed-application/', function (data) {
            if(data.success == 'true' || data.success == true) {
                this.setState({modules: data.result, msg_info: data.message, msg_link: data.link});
            }
        }.bind(this));
    }

    handle_install(app){
        var csrftoken = getCookie('csrftoken');
        $.ajax({
             type: "POST",
             cache: false,
             dataType: "json",
             url:  '/install-application/',
             data: {
                app_name :app,
                csrfmiddlewaretoken: csrftoken
             },
             beforeSend: function () {
                this.setState({processing:true})
             }.bind(this),
             success: function (data) {
               if(data.success === true){
                   $.get('/installed-application/', function (data) {
                        if(data.success == 'true' || data.success == true) {
                            this.setState({processing:false, modules: data.result, msg_info: data.message, msg_link: data.link});
                        }
                    }.bind(this));
               }else{
               }
             }.bind(this)
        });

    }

    uninstall_status(status){
        if(status){
           $.get('/installed-application/', function (data) {
                if(data.success == 'true' || data.success == true) {
                    this.setState({processing:false, modules: data.result, msg_info: data.message, msg_link: data.link});
                }
            }.bind(this));
        }
    }

    ok_true(status){
       this.setState({processing:true});
    }

    handle_uninstall(app){
        ModalManager.open(<AppUninstallPopup
                            modal_id = "uninstall-app"
                            app = {app}
                            uninstall_status ={ this.uninstall_status.bind(this)}
                            ok_true = {this.ok_true.bind(this)}
                            onRequestClose={() => true}/>);
    }

    render_modules(){
        let modules = this.state.modules
        return(
            <div className="row">
            {
                modules.length > 0 ?
                    modules.map((data, j) =>{
                        return <div className="col-xs-4 col-ms-3 col-sm-3 col-md-2 col-lg-2" key={'div_'+j}>
                                <Link to={data.link} className={data.anchor_class} key={'link_'+j}>
                                    <i className={data.css_class} key={'i_'+j}></i>
                                    <span key={'span_'+j}>{data.label}</span>
                                </Link>
                        </div>
                    })
                :null
            }
            </div>
        );
    }

    render_modules(){
        let modules = this.state.modules
        return (
            modules.length > 0 ?
                <div  className="row">
                    {
                        modules.map((module, i) =>{
                            return <div className="col-xs-3 col-ms-3 col-sm-3 col-md-3 col-lg-3 col-xl-3" key={'module_div_'+i}>
                                      <div className="panel panel-default">
                                        <div className="panel-body">
                                          <div className="media">
                                            <div className="media-left">
                                              <i className={module.iclass}></i>
                                            </div>
                                            <div className="media-body">
                                              <h4 className="media-heading">{module.label}</h4>
                                              <div className="text-muted">
                                                <p>{module.description}</p>
                                                 <p>Price:  {'Euro '+ module.price}</p>
                                              </div>
                                                { module.is_installed ?
                                                    <div>
                                                        { module.app != 'crm' ?
                                                            <button className="btn btn-default btn-sm" style={{
                                                                position: 'relative',
                                                                right: '0px',
                                                                bottom: '0px'
                                                            }} onClick={this.handle_uninstall.bind(this, module.app)}>
                                                                Uninstall
                                                            </button>
                                                            :null
                                                        }
                                                        <button className="btn btn-link" disabled="disabled" style={{position: 'relative', right:'0px', bottom:'0px'}}>Installed</button>
                                                   </div>
                                                  :<button className="btn btn-sm btn-primary" style={{position: 'relative', right:'0px', bottom:'0px'}} onClick={this.handle_install.bind(this,module.slug)}>Install</button>
                                                }
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                </div>
                        })
                    }
                </div>
            :null
        );
    }

  render() {
    return (
        <div>
            <ContactHeader header_css="crm-header clearfix module__apps"  processing={false}/>
            <div className="clearfix module__apps">
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                    <div className="row top-actions">
                      <div className="col-xs-12 col-sm-12">
                          <ul className="breadcrumbs-top">
                              <li>Apps</li>
                          </ul>
                      </div>
                      <div className="col-xs-12 col-sm-12 pull-right text-right"></div>
                    </div>
                    <div className="row crm-stuff">
                      <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                          <div className="tab-content">
                              <div role="tabpanel" className="tab-pane fade in active" id="view-grid">
                                 {this.render_modules()}
                              </div>
                          </div>
                      </div>
                    </div>
                </div>
            </div>
            <LoadingOverlay processing={this.state.processing}/>
        </div>
    );
  }
}
module.exports = InstallApplications;
