import React, { Component } from "react";
import {Link, browserHistory} from 'react-router'
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';
import {translate} from 'crm_react/common/language';
import {getCookie } from 'crm_react/common/helper';
import ReactTooltip from 'react-tooltip'
import LoadingOverlay  from 'crm_react/common/loading-overlay';


class SalesteamList extends Component  {

    constructor() {
        super();
        this.state = {
            result: null,
            value: '',
            sales_channel_ids:[],
            search_div_suggestions_class: 'form-group dropdown top-search',
            processing :false,
        };

        this.get_list_data();
    }

    get_list_data(){
        var csrftoken = getCookie('csrftoken');
        $.ajax({
            type: "POST",
            cache: false,
            url: '/salesteams/listdata/',
            data: {
                csrfmiddlewaretoken: csrftoken
            },
            beforeSend: function () {
                this.setState({processing:true});
            }.bind(this),
            success: function (data) {
                if (data.success == true || data.success == 'true' ) {
                    this.setState({processing:false,result: data.result});
                }
            }.bind(this)

        });
    }

    handle_mark_unmark_all() {
        //let sales_channel_ids = this.state.sales_channel_ids;
        let result = this.state.result;
        if(result.length > 0){
            for(var i=0; i<result.length; i++){
                if (!result[i]['is_channel_default']) {
                    result[i]['item_selected'] = !result[i]['item_selected'];
                }
            }
            this.setState({result:result});
        }
    }


    handle_mark_unmark(index) {
        let result = this.state.result;
        if(result.length > 0){
            if (!result[index]['is_channel_default']){
                result[index]['item_selected'] = !result[index]['item_selected'];
            }
            this.setState({result:result});
        }
    }


    handleDeleteSelected() {
        var confrm = confirm("Do you really want to remove these record?");
        if (confrm === false) {
            return;
        }
        let sales_channel_ids = this.state.sales_channel_ids;
        let result = this.state.result;
        if(result.length > 0){
            for(var i=0; i<result.length; i++){
               if(result[i]['item_selected']){
                   if (!result[i]['is_channel_default']) {
                       sales_channel_ids.push(result[i]['id'])
                   }
               }
            }
        }

        if (sales_channel_ids.length > 0) {
            console.log("idsss", sales_channel_ids)
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                cache: false,
                url: '/salesteams/deletesales/',
                data: {
                    ajax: true,
                    ids: JSON.stringify(sales_channel_ids),
                    csrfmiddlewaretoken: csrftoken,
                },
                beforeSend: function () {
                    this.setState({processing:true});
                }.bind(this),
                success: function (data) {
                    if (data.success == true) {
                        this.setState({processing:false});
                        this.get_list_data();
                    }
                }.bind(this)
            });
        }
    }

    edit_page_redirect(id){
        if(id > 0) {
            browserHistory.push("/salesteams/edit/" + id + '/');
        }
    }

    render_header() {

        return (
            <header className="crm-header clearfix module__product">
                <div id="mega-icon" className="pull-left">
                    <Link to={"/dashboard/"} title="Services"><i className="fa fa-th" aria-hidden="true"></i></Link>
                </div>
                <h1 className="pull-left"><a href="#" title="Saalz">
                    <img src={ '/static/front/images/saalz-small.png'}
                         alt="Saalz" height="30"/></a></h1>
                <div className="pull-right">
                    {<HeaderNotification/>}
                    {<HeaderProfile />}
                </div>
            </header>
        );
    }


    render() {
        let result = this.state.result;
        console.log("result", result);

        return (
            <div>
               { this.render_header()}
                <div id="crm-app" className="clearfix module__product">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                <div className="row top-actions">
                                    <div className="col-xs-12 col-sm-12">
                                        <ul className="breadcrumbs-top">
                                            <li><Link to={'/sales/'} className="breadcumscolor"
                                                      title={translate('label_sales')}>{translate('label_sales')}</Link>
                                            </li>
                                            <li><Link to={'/opportunity/list/'} className="breadcumscolor"
                                                      title={translate('opportunity')}>{translate('opportunity')}</Link>
                                            </li>
                                            <li>{translate('sales_team')}</li>
                                        </ul>
                                        <Link to={'/salesteams/add/'}
                                              className="btn btn-new">{'Add '+ translate('sales_team')} </Link>
                                    </div>
                                    <div className="col-xs-12 col-sm-12 pull-right text-right">
                                        <ul className="list-inline inline-block filters-favourite">
                                            <li className="dropdown actions__list-view"><span
                                                className="dropdown-toggle" data-toggle="dropdown" role="button"
                                                aria-haspopup="true" aria-expanded="true" id="actions"><i
                                                className="action-icon-sprite"></i> {translate('label_action')} <i
                                                className="fa fa-angle-down"></i></span>
                                                <ul className="dropdown-menu" aria-labelledby="actions">
                                                    <li><a href="javascript:void(0)"
                                                           onClick={this.handleDeleteSelected.bind(this)}>{translate('button_delete')}</a>
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                        <ul className="list-inline inline-block top-actions-pagination"><li></li></ul>

                                    </div>
                                </div>
                                <div className="row crm-stuff">
                                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                        <div id="view-list">
                                            <table className="table list-table">
                                                <thead>
                                                <tr>
                                                    <th>
                                                        <div className="checkbox">
                                                            <input id="view-list__cb-all" type="checkbox"

                                                                   onClick={this.handle_mark_unmark_all.bind(this)}/>
                                                            <label htmlFor="view-list__cb-all"></label>
                                                        </div>
                                                    </th>
                                                    <th>&nbsp;</th>
                                                    <th>Name</th>
                                                    <th>Team Leader</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {result ?
                                                    result.map((product, i) => {
                                                        return (
                                                            <tr key={'_sales_channle_list_'+product.id} className="list_tr" >
                                                                <td>
                                                                    <div className="checkbox">
                                                                        <input data-id={product.id}
                                                                               className="quotation_checkbox"
                                                                               type="checkbox"
                                                                               checked={product.item_selected ?"checked":''}
                                                                               onClick={this.handle_mark_unmark.bind(this, i)}/>
                                                                        <label htmlFor={"view-list__cb-" + i}></label>
                                                                    </div>
                                                                </td>
                                                                <td>&nbsp;</td>
                                                                <td onClick={this.edit_page_redirect.bind(this, product.id)}>
                                                                    <Link to="#">{product.name}</Link>
                                                                    {product.is_channel_default !=undefined && product.is_channel_default ?
                                                                       <span>
                                                                        <i data-tip data-for={"_is_default_"+product.id}
                                                                        className={"push-left-5 glyphicon glyphicon-info-sign text-primary"}></i>
                                                                        <ReactTooltip place="bottom" id={"_is_default_"+product.id}
                                                                        type="info" effect="float">
                                                                        <span>This is default channel, can not be deleted.</span>
                                                                        </ReactTooltip>
                                                                       </span>
                                                                        :null
                                                                    }
                                                                </td>
                                                                <td>{product.team_leader}</td>
                                                            </tr>
                                                        )
                                                    })
                                                    : null
                                                }
                                                </tbody>
                                            </table>
                                        </div>
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
module.exports = SalesteamList;