import React from 'react';
import {Link} from 'react-router'
import {translate} from 'crm_react/common/language';
import {ROLES} from 'crm_react/common/state';

class QuotationRibbonRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        return (
                <div className="row ribbon">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                     {ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION") || ROLES.includes("ROLE_MANAGE_ALL_QUOTATION") ?
                        <ul className="pull-left">
                            {this.props.qout_status!='cancel'?
                              <li><Link to="javascript:void(0)"  title={translate('send_by_email')}>{translate('send_by_email')}</Link></li>
                              :null
                            }
                            <li><Link to={this.props.preview_url} target="_blank" title={translate('print')}>{'Preview'}</Link></li>
                            <li><Link to={this.props.pdf_url} target="_blank" title={translate('print')}>{translate('print')}</Link></li>
                            {this.props.qout_status!='cancel'?
                              <li className= {this.props.qout_status=='sent' ? 'active' : null }>
                                <Link to="javascript:void(0)" title={translate('confirm_sale')} id={this.props.qout_status=='sale' ? 'saleshide' : null }>{translate('confirm_sale')}</Link>
                              </li>
                              :null
                            }

                            {this.props.qout_status =='sale' && this.props.items.length > 0 && this.props.text_invoice12 !='YES' ?
                              <li className= {this.props.qout_status=='sent' ? 'active' : null}>
                                <Link to= "javascript:void(0)" title={translate('create_invoice')}  >{translate('create_invoice')}</Link>
                              </li>
                              :null
                            }
                            {this.props.qout_status!='cancel'?
                              <li>
                                <Link to="javascript:void(0)"  title={translate('cancel')}>{translate('cancel')}</Link>
                              </li>
                              :null
                            }
                            {this.props.qout_status=='cancel'?
                              <li>
                                <Link to="javascript:void(0)" title={translate('set_to_quotation')}>{translate('set_to_quotation')}</Link>
                              </li>
                              :null
                            }
                        </ul>
                        :null
                     }
                        <ul className="pull-right">
                            <li><Link className= {this.props.qout_status=='draft'?'active':null}  to="javascript:void(0)" title={translate('label_quotation')}>{translate('label_quotation')}</Link>
                            </li>
                            <li><Link className= {this.props.qout_status=='sent'?'active':null} to="javascript:void(0)" title={translate('quotation_sent')}>{translate('quotation_sent')}</Link></li>
                            <li><Link  className= {this.props.qout_status=='sale'?'active':null}  to="javascript:void(0)" title={translate('sales_order')}>{translate('sales_order')}</Link></li>
                            <li><Link className= {this.props.qout_status=='cancel'?'active':null} to="javascript:void(0)" title={translate('cancelled')}>{translate('cancelled')}</Link>
                            </li>
                        </ul>
                    </div>
                </div>
        )
    }
}

module.exports = QuotationRibbonRow;
