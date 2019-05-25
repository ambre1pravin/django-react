import React from 'react';
import state, { ROLES, ID} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import {getCookie} from 'crm_react/common/helper';
import LoadingOverlay  from 'crm_react/common/loading-overlay';

class OppListView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            processing:false,
            result_list: [],
            team_list:null,
            list_view_table_header:[
                translate('created_date'),translate('opportunity'),translate('stage'),
                translate('label_expecting_closing'),translate('expected_revenue'),translate('probability'),
                translate('sales_team'),translate('sales_person')
            ],
        }
        this.get_list_data()
    }

    get_list_data(team_id){
        let sales_team_id =this.state.sales_team_id
        if (team_id !=undefined){
            sales_team_id = team_id
        }
        var csrftoken = getCookie('csrftoken');
        console.log("post team", this.state.sales_team_id)
        $.ajax({
            type: "POST",
            cache: false,
            url: '/opportunity/listviewdata/',
            data: {
                ajax: true,
                filter_list: JSON.stringify(this.props.won_lost_filter),
                names: JSON.stringify(this.props.names),
                customer: JSON.stringify(this.props.customer),
                total_amount: JSON.stringify(this.props.total_amount),
                pagging: JSON.stringify([{"name":"limit","value":50},{"name":"offset","value":0}]),
                sales_team_id: this.props.sales_team_id,
                page_name:'',
                csrfmiddlewaretoken: csrftoken
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {
                //if (data.status === true) {
                    this.setState({processing:false,
                        result_list: data,
                    });
                //}
            }.bind(this)

        });
    }

    render_by_group_by(){
        let result_list = this.state.result_list.opportunity;
        console.log("result_list", result_list)
        return(
             <tbody  className="table">
             { result_list !=undefined ?
                 result_list.map((opp, i) => {
                     return (
                          <tr key={'_opp_'+i} className="list_tr"  >
                            <td>&nbsp;</td>
                              {
                                 ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_OPPORTUNITY") || ROLES.includes("ROLE_MANAGE_ALL_OPPORTUNITY") ||  opp.userId  == ID ?
                                  <td>
                                      <div className="checkbox" id={opp.userId + ID}>
                                          <input data-id ={opp.id} id={'opp_ckb_'+i} className="oppo_checkbox"  type="checkbox"  />
                                          <label htmlFor={'opp_ckb_'+i} ></label>
                                      </div>
                                  </td>
                                :null
                              }
                              <td>{opp.CreatedAt} </td>
                              <td><a href="javascript:void(0)">{opp.name}</a></td>
                              <td>{opp.columnName}</td>
                              <td>{opp.expectedClosing}</td>
                              <td>{opp.estimatedRevenue + ' ' +opp.currency  }</td>
                              <td>{opp.probability}&nbsp;</td>
                              <td>{opp.currentsalesteam}</td>
                              <td>{opp.currentsalesperson}</td>
                          </tr>
                     )
                 })
                 : null
             }
             </tbody>
        )
    }

    render() {
        return(
              <table className="table list-table  list-table-groupby">
                 <thead>
                  <tr>
                      <th>&nbsp;</th>
                      <th>
                          <div className="checkbox">
                              <input id="view-list__cb-all" type="checkbox"  value={null}/>
                              <label htmlFor="view-list__cb-all"></label>
                          </div>
                      </th>
                      {
                          this.state.list_view_table_header.map((team, i) => {
                              return (<th key={'_th_'+i}>{team}</th>)
                          })
                      }
                  </tr>
                  </thead>
                  {this.render_by_group_by()}
              </table>
        );
    }
}

module.exports = OppListView;
