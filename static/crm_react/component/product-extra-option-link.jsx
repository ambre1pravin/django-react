import React from 'react';
import { Link } from 'react-router'
import {translate} from 'crm_react/common/language';
class  ProductExtraOptionLink extends React.Component {
  render() {
    return (
           <div id="field-tab-3" role="tabpanel" className="tab-pane">
               {  this.props.url ?
                   <div className="text-center" style={{margin:'10px'}}>
                       Online document link : <Link to={'/htm/' + this.props.url + '/quotation/'} target="_blank" title={translate('Preview')} >{'Click here'}</Link>
                   </div>
                   :null
               }
           </div>
    );
  }
}
module.exports = ProductExtraOptionLink;

