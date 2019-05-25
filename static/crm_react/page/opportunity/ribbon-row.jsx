import React from 'react';
import {Link} from 'react-router'
import {translate} from 'crm_react/common/language';
import {ROLES} from 'crm_react/common/state';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import LostReasonModal from 'crm_react/page/opportunity/lost_reason_modal';
import {getCookie} from 'crm_react/common/helper';
import {NotificationContainer, NotificationManager} from 'react-notifications';

class RibbonRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lost_reason_id: 0,
            is_won:this.props.is_won,
        }
    }

    save_mark_lost(action) {
            var csrftoken = getCookie('csrftoken');
            var post_data ;
            if (this.state.lost_reason_id > 0) {
                 post_data = ({'lost_id': this.state.lost_reason_id, 'opportunity_id': this.props.opp_id, 'action':action});
            }else {
                post_data = ({'lost_id': '', 'opportunity_id': this.props.opp_id, 'action':action});
            }

            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updateopportunitylostreason/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.props.handle_lost_reason_state(this.state.lost_reason_id);
                        if(action ==  'won'){
                            this.setState({is_won:true})
                            NotificationManager.success('Mark Won successfully!', 'Success message', 5000);
                        }else if(action =='lost'){
                            this.setState({is_won:false})
                            NotificationManager.success('Mark Lost successfully!', 'Success message', 5000);
                        }
                    }
                }.bind(this)
            });

    }

    selected_lost_reason(data) {
        if (data.id != undefined) {
            this.setState({lost_reason_id: data.id})
        }
    }

    mark_lost() {
        ModalManager.open(
            <LostReasonModal
                title="Create Lost Reason"
                modal_id="lost-reason-mod"
                fetch_data_url='/opportunity/get-lost-reason/'
                save_data_url='/opportunity/addlostreason/'
                set_selected_data={this.selected_lost_reason.bind(this)}
                show_create_option={true}
                show_create_edit_opton={false}
                handle_save_fn={this.save_mark_lost.bind(this)}
                onRequestClose={() => true}
            />
        );
    }

    select_column(column_id) {
        if (column_id > 0 && this.props.opp_id > 0) {
            var csrftoken = getCookie('csrftoken');
            var opp_list = [];
            opp_list.push(this.props.opp_id);
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updateopertunityorder/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(opp_list),
                    column_id:column_id,
                    view_by: 'stage',
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.status == true) {
                        this.props.handle_col_change()
                        NotificationManager.success('Column changed successfully!', 'Success message', 5000);
                    }
                }.bind(this)
            });
        }
    }

    render() {
        console.log("this.state.is_won", this.state.is_won);
        return (
            <div className="row ribbon">
                {this.props.page == 'edit' || this.props.page == 'view' ?
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        {this.props.op_status =='won' && this.props.editable ?
                            <ul className="pull-left won-lost">
                                    <li>
                                        <Link to="javascript:" title="Mark Lost" onClick={this.mark_lost.bind(this)}>Mark Lost</Link>
                                    </li>
                            </ul>
                            : null
                        }
                        {this.props.op_status =='lost'  && this.props.editable ?
                            <ul className="pull-left won-lost">
                                    <li>
                                        <Link to="javascript:"  title="Mark Won" onClick={this.save_mark_lost.bind(this, 'won')}>{translate('mark_won')}</Link>
                                    </li>
                            </ul>
                            : null
                        }

                        { this.props.op_status =='open'  && this.props.editable ?
                            <ul className="pull-left won-lost">
                                    <li>
                                        <Link to="javascript:" title="Mark Lost" onClick={this.mark_lost.bind(this)}>Mark Lost</Link>
                                    </li>
                                    <li>
                                        <Link to="javascript:"  title="Mark Won" onClick={this.save_mark_lost.bind(this, 'won')}>{translate('mark_won')}</Link>
                                    </li>
                            </ul>
                            : null
                        }
                        <ul className="pull-right">
                            {this.props.default_col.length > 0 ?
                                this.props.default_col.map((col, i) => {
                                    if (i < 3)
                                        return (
                                            <li key={'def_col_' + i }>
                                                <Link to="javascript:" title={col.columnName} className={this.props.result.opportunity.columnId == col.id ? 'active':null} onClick={ this.props.editable ? this.select_column.bind(this, col.id) : null }>{col.columnName}</Link>
                                            </li>
                                        )
                                })
                                : null
                            }
                            {this.props.default_col.length > 3 ?
                                <li className="dropdown selection__single">
                                    <Link to="#" title="More" className="dropdown-toggle"
                                          data-toggle="dropdown" role="button" aria-haspopup="true"
                                          aria-expanded="false">
                                        More <i className="fa fa-angle-down"></i>
                                    </Link>
                                    <ul className="dropdown-menu dropdown-menu-right"
                                        aria-labelledby="more opportunity options">
                                        {this.props.default_col.length > 0 ?
                                            this.props.default_col.map((col, i) => {
                                                if (i >= 3)
                                                    return (
                                                        <li key={'ndef_col_' + i } className={this.props.result.opportunity.columnId == col.id ? 'active':null}>
                                                            <Link to="javascript:"
                                                                  title={col.columnName} onClick={ this.props.editable ? this.select_column.bind(this, col.id) : null }>{col.columnName}
                                                            </Link>
                                                        </li>
                                                    );
                                            })
                                            : null
                                        }
                                    </ul>
                                </li>
                                : null
                            }
                        </ul>
                    </div>
                    : null
                }
            </div>
        )
    }
}

module.exports = RibbonRow;
