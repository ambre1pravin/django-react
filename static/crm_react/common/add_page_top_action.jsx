import React from 'react';
import {Link, browserHistory} from 'react-router'
import state, {
    IMAGE_PATH, ROLES
} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';

class AddPageTopAction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    save_click() {
        this.props.save_action()
    }

    next_click(){
         browserHistory.push( "/opportunity/view/57/");
    }

    render() {
        const marginLeft = {marginTop: '10px'}
        return (
            <div className="row top-actions">
                {this.props.page === 'add' ?
                    <div className="col-xs-12 col-sm-12">
                        <ul className="breadcrumbs-top">
                            <li>
                                <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>
                                    {translate('label_sales')}
                                </Link>
                            </li>
                            <li>
                                <Link to={this.props.list_page_link}>{this.props.list_page_label}</Link>
                            </li>
                            <li>{translate('label_new')}</li>
                        </ul>
                        <button id="save_all" className="btn btn-primary"
                                onClick={this.save_click.bind(this)}>{translate('button_save')}</button>
                        <Link to={this.props.list_page_link}>
                            <button className="btn btn-primary btn-discard btn-transparent" style={marginLeft}>
                                {translate('button_discard')}
                            </button>
                        </Link>
                    </div>
                    : null
                }
                {this.props.page === 'view' ?
                    <div className="col-xs-12 col-sm-12">
                        <ul className="breadcrumbs-top">
                            <li>
                                {this.props.module === 'contact' ?
                                    <Link to={'/contact/list/'} className="breadcumscolor"
                                          title={'Contact'}>{'Contact'}</Link>
                                    :<Link to={'/sales/'} className="breadcumscolor"
                                          title={translate('label_sales')}>{translate('label_sales')}</Link>
                                }
                            </li>
                            {this.props.list_page_link ?
                                <li><Link to={this.props.list_page_link}>{this.props.list_page_label}</Link></li>
                                :null
                            }
                            <li>{this.props.item_name}</li>
                        </ul>

                        {
                            this.props.module === 'contact' && ROLES.includes("ROLE_MANAGE_ALL_CONTACT") ?
                                <Link to={this.props.edit_page_link}
                                      className="btn btn-new btn-edit tourist-place-5">{this.props.edit_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'contact' && ROLES.includes("ROLE_MANAGE_ALL_CONTACT") ?
                                <Link to={this.props.add_page_link}
                                      className="btn btn-new">{this.props.add_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'opportunity' && this.props.edit_page_link ?
                                <Link to={this.props.edit_page_link}
                                      className="btn btn-new btn-edit">{this.props.edit_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'opportunity' && ROLES.includes("ROLE_MANAGE_ALL_CONTACT") ?
                                <Link to={this.props.add_page_link}
                                      className="btn btn-new">{this.props.add_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'quotation' && (ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION") || ROLES.includes("ROLE_MANAGE_ALL_QUOTATION")) ?
                                <Link to={this.props.edit_page_link}
                                      className="btn btn-new btn-edit">{this.props.edit_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'quotation' ?
                                <Link to={this.props.add_page_link}
                                      className="btn btn-new">{this.props.add_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'sales-order' && (ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION") || ROLES.includes("ROLE_MANAGE_ALL_QUOTATION")) ?
                                <Link to={this.props.edit_page_link}
                                      className="btn btn-new btn-edit">{this.props.edit_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'sales-order' ?
                                <Link to={this.props.add_page_link}
                                      className="btn btn-new">{this.props.add_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'payment-term' && (ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION") || ROLES.includes("ROLE_MANAGE_ALL_QUOTATION")) ?
                                <Link to={this.props.edit_page_link}
                                      className="btn btn-new btn-edit">{this.props.edit_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'payment-term' ?
                                <Link to={this.props.add_page_link}
                                      className="btn btn-new">{this.props.add_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'product' ?
                                <Link to={this.props.edit_page_link}
                                      className="btn btn-new btn-edit">{this.props.edit_page_label}</Link>
                                : null
                        }
                        {
                            this.props.module === 'product' ?
                                <Link to={this.props.add_page_link}
                                      className="btn btn-new">{this.props.add_page_label}</Link>
                                : null
                        }

                        {this.props.module == 'contact' || this.props.module == 'opportunity' ? <span className="divider-vertical"></span> :null }
                        {this.props.module == 'contact' ? <Link to="/quotation/add/" className="btn btn-new btn-quotation">Create Quotation</Link> :null }
                        {this.props.module == 'contact' ? <Link to="/customer/invoice/add/" className="btn btn-new btn-invoice">Create Invoice</Link> :null }
                        {this.props.module == 'opportunity' ? <Link to="/quotation/add/" className="btn btn-new btn-quotation">Create Quotation</Link> :null }


                    </div>
                    : null
                }
                {this.props.page === 'edit' ?
                    <div className="col-xs-12 col-sm-12">
                        <ul className="breadcrumbs-top">
                            <li>
                                <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>
                                    {translate('label_sales')}
                                </Link>
                            </li>
                            <li>
                                <Link to={this.props.list_page_link}>{this.props.list_page_label}</Link>
                            </li>
                            <li>{this.props.item_name}</li>
                        </ul>
                        <button className="btn btn-primary"
                                onClick={this.save_click.bind(this)}>{translate('button_save')}</button>
                        <Link to={this.props.list_page_link}>
                            <button className="btn btn-primary btn-discard btn-transparent"
                                    style={marginLeft}>{translate('button_discard')}</button>
                        </Link>
                    </div>
                    : null
                }
                <div className="col-xs-12 col-sm-12 pull-right text-right">
                    {this.props.page === 'edit' || this.props.page === 'view' ?
                        <ul className="list-inline inline-block top-actions-pagination">
                            {this.props.next_link ?
                                <li>
                                    <Link to="#" onClick={this.next_click.bind(this)}><i className="fa fa-chevron-left"></i></Link>
                                </li>
                                : null
                            }
                            {this.props.prev_link ?
                                <li>
                                    <Link to="#" onClick={this.next_click.bind(this)}><i className="fa fa-chevron-right"></i></Link>
                                </li>
                                : null
                            }
                        </ul>
                        : null
                    }
                </div>
            </div>
        );
    }
}
module.exports = AddPageTopAction;

