import React from 'react';
import { NotificationManager} from 'react-notifications';
import { Link,browserHistory } from 'react-router'
import { Modal, ModalManager} from 'react-dynamic-modal';
import { translate} from 'crm_react/common/language';

class  PriceList extends React.Component {
	constructor() {
        super();
        this.state = {
            result:[],
        }

        this.serverRequest = $.get('/my-price/', function (data) {
            if(data.success == 'true' || data.success == true){
                this.setState({result:data.result})
            }
        }.bind(this));
    }

    render_plans(){
        let result = this.state.result
        return(
            result.length > 0 ?
            result.map((item, j) =>{
                 return <tr key={j}>
                        <td>{item.date}</td>
                        <td>{item.order_number}</td>
                        <td>{item.amount}</td>
                        <td>{item.status}</td>
                        <td><a href={item.invoice_pdf}>Download</a></td>
                </tr>
            })
            :null
        )
    }

  render() {
    return (
        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
           <div className="row top-actions">
                <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6"></div>
                <div className="col-xs-12 col-sm-12 pull-right text-right">
                    <ul className="list-inline inline-block filters-favourite">
                      <li className="dropdown">
                          <ul className="dropdown-menu" aria-labelledby="favourites">
                              <li className="divider"></li>
                          </ul>
                      </li>
                    </ul>
                </div>
            </div>
            <div className="row crm-stuff">
                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                   <div className="tab-content">
                        <div role="tabpanel"   id="view-list">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th style={{width:'20%'}}>Date</th>
                                        <th style={{width:'20%'}}>Invoice Number</th>
                                        <th style={{width:'20%'}}>Amount</th>
                                        <th style={{width:'20%'}}>Status</th>
                                        <th style={{width:'20%'}}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {this.render_plans()}
                                </tbody>
                            </table>
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
  }
}
module.exports = PriceList;
