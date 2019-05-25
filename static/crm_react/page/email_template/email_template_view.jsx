import React from 'react';
import state, {BASE_FULL_URL , DIRECTORY_PATH} from 'crm_react/common/state';
import Header from 'crm_react/component/Header';
import {translate} from 'crm_react/common/language';

class  EmailTemplateView extends React.Component {
	constructor() 
  {
    super();
    this.state = {
                template      : null,
                items         : [],
                optional_item : [],
    }
    this.getTemplateById = this.getTemplateById.bind(this)
  }

  componentDidMount(){
    var tmpl_id = this.props.params.Id;
    this.getTemplateById(tmpl_id);
  }

  getTemplateById(id){
    this.serverRequest = $.get('/email/template/viewdata/'+id, function (data) {
      if(data.success==true){
        this.setState({
            template      : data.template!==undefined ? data.template : null,
            tmpl_id       : id, 
            image_path    : data.image_path!==undefined ? data.image_path : null ,
        })
      }      

    }.bind(this));
  }
   
  render() {
    let template      = this.state.template
    let items         = this.state.items
    let optional_item = this.state.optional_item

    return (
    <div>
    
      <Header />
          <div id="crm-app" className="clearfix module__quotation module__quotation-view">
          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                <div className="row top-actions">
                    <div className="col-xs-12 col-sm-12">
                          <ul className="breadcrumbs-top">
                          <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                              <li><Link to={'/email/template/list/'} className="breadcumscolor" title={translate('email_template')}>{translate('email_template')}</Link></li>
                              <li>{template && template.name!==undefined ?template.name  : '' }</li>
                          </ul>


                         <Link to={'/email/template/edit/'+this.props.params.Id}  className="btn btn-new btn-edit"  title={translate('edit_email_template')} > {translate('edit_email_template')}</Link>

                    </div>
                  
                </div>


                <div className="row crm-stuff">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div className="panel panel-default panel-tabular">
                          <div className="panel-heading no-padding panel-heading-blank">
                          </div>
                          <div className="panel-body edit-form">
                              <form>
                              <div className="row">
                                  <h2 className="col-sm-12 quotation-number">{template?template.name:''}</h2>
                              </div>
                              <div className="row row__flex">                            
                                  <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                              <table className="detail_table">
                                <tbody>
                                  <tr>
                                   <td>
                                       <label className="text-muted control-label">{translate('subject')}</label>
                                   </td>
                                    <td>
                                      <div className="form-group">
                                         {template && template.subject!='' && template.subject!='None' ?(template.subject) : '\u00A0' }
                                      </div>
                                    </td>
                                  </tr>
                                  <tr>
                                   <td>
                                       <label className="text-muted control-label">{translate('description')}</label>
                                   </td>
                                    <td>
                                      <div className="form-group">
                                         {template && template.description!='' && template.description!='None' ?(template.description) : '\u00A0' }
                                      </div>
                                    </td>
                                  </tr>

                                <div>

                                      {this.state.image_path?
                                        this.state.image_path.map((template, i) =>{
                                          return <li data-action-id= {template}>{template} </li>
                                          })
                                        : null}
                                  </div>   
                            </tbody>
                              </table>
                                  </div>
                              </div> 
                              </form>
                          </div>
                        
                        </div> {/*<!-- end .panel -->*/}

              
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
module.exports = EmailTemplateView;
