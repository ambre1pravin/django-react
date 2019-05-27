import React from "react";
import { Router, Route, Link, browserHistory } from "react-router";
import state, { BASE_FULL_URL } from "crm_react/common/state";
import Header from "crm_react/component/Header";
import { translate } from "crm_react/common/language";
import LoadLineChart from "../../component/loadLineChart";
import LoadBarChart from "../../component/loadBarChart";

import DayPicker from "react-day-picker";
import "react-day-picker/lib/style.css";

class Sales extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nav_bar_css: "",
      selectedDay: null,
      showdatepicker: false
    };
    this.handleDayClick = this.handleDayClick.bind(this);
  }
  componentWillMount() {
    fetch("http://127.0.0.1:8000/line-chart/")
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  handleDayClick(day, { selected }) {
    this.setState({
      selectedDay: selected ? undefined : day
    });
  }
  showDatePicker() {
    this.setState({ showdatepicker: !this.state.showdatepicker });
  }

  handleSubmit(url) {
    browserHistory.push(BASE_FULL_URL + url);
  }

  mounse_enter() {
    this.setState({ nav_bar_css: "active" });
  }

  mounse_out() {
    this.setState({ nav_bar_css: null });
  }

  render() {
    var display = { display: "block" };
    const modifiersStyles = {
      // outside: {
      //   backgroundColor: 'white',
      // },
    };

    return (
      <div>
        <Header />
        <div
          id="crm-app"
          className="clearfix module__quotation module__quotation-dashboard have-sublinks"
        >
          {/* <nav id="main-nav" className="clearfix" >
                        <button data-target="main-nav__list" type="button" className="navbar-toggle">
                            <span className="sr-only">Menu</span>

                        </button>
                        <ul id="" className={"nav navbar-nav active"+ this.state.nav_bar_css}>
                            <li className="active">
                                <Link to={'/customer/list/'} title="Customers" className="clearfix">
                                    <i className="icon-customers"></i><span style={display}>Customers<i
                                    className="fa fa-plus" aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/product/list/'} title="Products" className="clearfix">
                                    <i className="icon-products"></i><span style={display}>Products <i
                                    onClick={this.handleSubmit.bind(this, "/product/add/")} className="fa fa-plus"
                                    aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/opportunity/list/'} className="clearfix" title="Opportunity">
                                    <i className="icon-opportunity"></i>
                                    <span style={display}>Opportunity<i
                                        onClick={this.handleSubmit.bind(this, "/opportunity/add/")}
                                        className="fa fa-plus" aria-hidden="true"></i></span>
                                </Link>
                                <i className="fa fa-ellipsis-h" aria-hidden="true" data-toggle="dropdown" role="button"
                                   aria-haspopup="true" aria-expanded="false"></i>
                                <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="profile">
                                    <li><Link to="/salesteams/list/" title={translate('sales_team')}>{translate('sales_team')}</Link></li>
                                </ul>
                            </li>
                            <li>
                                <Link to={'/quotation/list/'} className="clearfix" title="Quotation">
                                    <i className="icon-quotations"></i><span style={display}>Quotation<i
                                    onClick={this.handleSubmit.bind(this, "/quotation/add/")} className="fa fa-plus"
                                    aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/customer/invoice/list/'} className="clearfix" title="Invoice">
                                    <i className="icon-customer-invoice"></i><span style={display}>Invoice<i
                                    onClick={this.handleSubmit.bind(this, "/customer/invoice/add/")}
                                    className="fa fa-plus" aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/sales/order/list/'} className="clearfix" title="Salers Order">
                                    <i className="icon-sales"></i><span style={display}>Sales Order<i
                                    onClick={this.handleSubmit.bind(this, "/sales/order/add/")} className="fa fa-plus"
                                    aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/quot/template/list/'} className="clearfix" title="Quotation Template">
                                    <i className="icon-delivery"></i><span style={display}>Quotation Template<i
                                    onClick={this.handleSubmit.bind(this, "/quot/template/add/")} className="fa fa-plus"
                                    aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/email/template/list/'} className="clearfix" title="Email Template">
                                    <i className="icon-delivery"></i><span style={display}>Email Template<i
                                    onClick={this.handleSubmit.bind(this, "/email/template/add/")}
                                    className="fa fa-plus" aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/payment/list/'} className="clearfix" title="Payment">
                                    <i className="icon-payment"></i><span style={display}>Payment<i
                                    className="fa fa-plus" aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/payment/term/list/'} className="clearfix" title="Payment Terms">
                                    <i className="icon-terms"></i><span style={display}>Payment Terms<i
                                    onClick={this.handleSubmit.bind(this, "/payment/term/add/")} className="fa fa-plus"
                                    aria-hidden="true"></i></span>
                                </Link>
                            </li>
                            <li>
                                <Link to={'/unit/of/measure/list/'} className="clearfix" title="Unit Measure List">
                                    <i className="icon-ruler"></i><span style={display}>Unit Measure List<i
                                    onClick={this.handleSubmit.bind(this, "/unit/of/measure/add/")}
                                    className="fa fa-plus" aria-hidden="true"></i></span>
                                </Link>
                            </li>
                        </ul>
                    </nav> */}

          <div className="container-fluid">
            <div className="row">
              <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                <div className="row crm-stuff">
                  <div className="col-xs-12 col-sm-12 col-md-12 col-lg-7 col-xl-8">
                    <div className="panel panel-default amounts no-padding d-flex text-white">
                      <ul className="list-inline d-flex">
                        <li>
                          <strong>Objective</strong>
                          <span className="objective-container d-block">
                            <input
                              name="objective-chart"
                              type="text"
                              value="90"
                              placeholder="Objective"
                              disabled=""
                            />
                            €{" "}
                            <i
                              className="fa fa-pencil pull-right push-left-5 objective-edit"
                              aria-hidden="true"
                            />
                          </span>
                        </li>
                        <li>
                          <strong>Invoices</strong>
                          <table>
                            <tbody>
                              <tr>
                                <td>
                                  <small>
                                    <strong>Total:</strong>
                                  </small>
                                </td>
                                <td>
                                  {this.state.data != undefined &&
                                  this.state.data
                                    ? this.state.data.invoice_data.invoice_sum
                                    : 0}{" "}
                                  €
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <small>
                                    <strong>Average:</strong>
                                  </small>
                                </td>
                                <td>
                                  {this.state.data != undefined &&
                                  this.state.data
                                    ? this.state.data.invoice_data
                                        .invoice_average
                                    : 0}{" "}
                                  €
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          <strong>Quotations</strong>
                          <table>
                            <tbody>
                              <tr>
                                <td>
                                  <small>
                                    <strong>Open:</strong>
                                  </small>
                                </td>
                                <td>
                                  {this.state.data != undefined &&
                                  this.state.data
                                    ? this.state.data.quatations_data.open
                                    : 0}{" "}
                                  €
                                </td>
                              </tr>
                              <tr>
                                <td>
                                  <small>
                                    <strong>Confirmed:</strong>
                                  </small>
                                </td>
                                <td>
                                  {this.state.data != undefined &&
                                  this.state.data
                                    ? this.state.data.quatations_data.confirm
                                    : 0}{" "}
                                  €
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                        <li>
                          <strong>Opportunities</strong>
                          <table>
                            <tbody>
                              <tr>
                                <td>
                                  <small>
                                    <strong>Open:</strong>
                                  </small>
                                </td>
                                <td>
                                  {this.state.data != undefined &&
                                  this.state.data
                                    ? this.state.data.opportunity_data.is_open
                                    : 0}{" "}
                                  €
                                </td>
                                {/* <td>{this.state.data.is_open} €</td> */}
                              </tr>
                              <tr>
                                <td>
                                  <small>
                                    <strong>Won:</strong>
                                  </small>
                                </td>
                                <td>
                                  {this.state.data != undefined &&
                                  this.state.data
                                    ? this.state.data.opportunity_data.is_won
                                    : 0}{" "}
                                  €
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </li>
                        <li className="quotation-dashboard-datepicker text-center">
                          <i
                            onClick={e => this.showDatePicker()}
                            className="fa fa-calendar fa-2x d-block"
                            aria-hidden="true"
                          />
                          {/* <input
                            name="dashboard-datepicker"
                            type="text"
                            value="03/09/2019"
                            className="text-center"
                          /> */}

                          {this.state.showdatepicker && (
                            <DayPicker
                              selectedDays={this.state.selectedDay}
                              onDayClick={this.handleDayClick}
                              modifiersStyles={modifiersStyles}
                            />
                          )}
                        </li>
                      </ul>
                    </div>

                    <div className="panel panel-default">
                      <div className="panel panel-default quote-chart">
                        <h2>Chart Title</h2>
                        {/* {this.state.data.opportunity_data.opportunity_sum} */}
                        <LoadLineChart line_chart={this.state.data} />
                        <div id="chart-legends" className="chartjs-legend" />
                      </div>
                    </div>

                    <div className="panel panel-default mail-messages">
                      <h2>Your Upcoming Tasks</h2>
                      <div className="mail-messages__filter clearfix">
                        <div className="dropdown selection pull-right">
                          <a
                            href="#"
                            data-toggle="dropdown"
                            role="button"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <i className="fa fa-cogs" aria-hidden="true" />
                          </a>
                          <ul
                            className="dropdown-menu dropdown-menu-right"
                            aria-labelledby="messages options"
                          >
                            <li className="dropdown-header">View Activities</li>
                            <li className="activity-option">
                              <a
                                href="#"
                                title="View incomplited activities"
                                msg-option="incomplited-activities"
                              >
                                Incomplited Activities
                              </a>
                            </li>
                            <li className="activity-option">
                              <a
                                href="#"
                                title="View complited activities"
                                msg-option="complited-activities"
                              >
                                Complited Activities
                              </a>
                            </li>
                            <li className="activity-option selected">
                              <a
                                href="#"
                                title="View all activities"
                                msg-option="all-activities"
                              >
                                All Activities
                              </a>
                            </li>
                            <li role="separator" class="divider" />
                            <li className="activity-option">
                              <a
                                href="#"
                                title="Mark all activities complited"
                                msg-option="mark-all-activities-complited"
                              >
                                Mark all activities complited
                              </a>
                            </li>
                            <li className="activity-option">
                              <a
                                href="#"
                                title="Mark all activities incomplited"
                                msg-option="mark-all-activities-incomplited"
                              >
                                Mark all activities incomplited
                              </a>
                            </li>
                            <li role="separator" class="divider" />
                            <li className="dropdown-header">
                              View Notes &amp; Emails
                            </li>
                            <li>
                              <a
                                href="#"
                                title="View all notes"
                                msg-option="all-notes"
                              >
                                All Notes
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                title="View all emails"
                                msg-option="all-emails"
                              >
                                All Emails
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="scheduled-activities">
                        <span>
                          <i className="fa fa-caret-down" aria-hidden="true" />{" "}
                          Planned activities
                          <span className="plan-noti hide">
                            <span className="badge today">1</span>
                            <span className="badge not-today">4</span>
                          </span>
                        </span>
                      </div>
                      <ul className="timelines activities">
                        <li>
                          <div className="media undone">
                            <div className="media-left">
                              <span className="done-mark">
                                <svg viewBox="0 0 32 32">
                                  <polygon points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 " />
                                </svg>
                              </span>
                            </div>
                            <div className="media-body">
                              <h4 className="media-heading">
                                <strong>Call</strong> Administrator{" "}
                                <small>16 Minutes ago</small>
                              </h4>
                              <p>Sketch out new idea for promote Great App</p>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="media done">
                            <div className="media-left">
                              <span className="done-mark">
                                <svg viewBox="0 0 32 32">
                                  <polygon points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 " />
                                </svg>
                              </span>
                            </div>
                            <div className="media-body">
                              <h4 className="media-heading">
                                <strong>Email</strong> Administrator{" "}
                                <small>16 Minutes ago</small>
                              </h4>
                              <p>Sketch out new idea for promote Great App</p>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="media undone">
                            <div className="media-left">
                              <span className="done-mark">
                                <svg viewBox="0 0 32 32">
                                  <polygon points="27.672,4.786 10.901,21.557 4.328,14.984 1.5,17.812 10.901,27.214 30.5,7.615 " />
                                </svg>
                              </span>
                            </div>
                            <div className="media-body">
                              <h4 className="media-heading">
                                <strong>Email</strong> Administrator{" "}
                                <small>16 Minutes ago</small>
                              </h4>
                              <p>Sketch out new idea for promote Great App</p>
                            </div>
                          </div>
                        </li>
                      </ul>
                      <ul className="timelines notes-emails">
                        <li>
                          <div className="day">
                            <span>Today</span>
                          </div>
                          <div className="media internal-note">
                            <div className="media-left">
                              <img
                                src="/static/front/images/avatar/1.png"
                                alt="adag"
                                className="img-circle"
                              />
                            </div>
                            <div className="media-body">
                              <h4 className="media-heading">
                                <small>Note by</small> Administrator{" "}
                                <small>16 Minutes ago</small>
                              </h4>
                              <p>Sketch out new idea for promote Great App</p>
                            </div>
                          </div>
                          <div className="media email">
                            <div className="media-left">
                              <img
                                src="/static/front/images/avatar/1.png"
                                alt="adag"
                                className="img-circle"
                              />
                            </div>
                            <div className="media-body">
                              <h4 className="media-heading">
                                <small>Sent by</small> Administrator{" "}
                                <small>16 Minutes ago</small>{" "}
                                <i
                                  class="fa fa-envelope-o"
                                  aria-hidden="true"
                                />
                              </h4>
                              <p>Sketch out new idea for promote Great App</p>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="day">
                            <span>Yesterday</span>
                          </div>
                          <div className="media internal-note">
                            <div className="media-left">
                              <img
                                src="/static/front/images/avatar/1.png"
                                alt="adag"
                                className="img-circle"
                              />
                            </div>
                            <div className="media-body">
                              <h4 class="media-heading">
                                <small>Note by</small> Administrator{" "}
                                <small>16 Minutes ago</small>
                              </h4>
                              <p>
                                Pellentesque habitant morbi tristique senectus
                                et netus et malesuada fames ac turpis egestas.
                                Vestibulum tortor quam, feugiat vitae, ultricies
                                eget, tempor sit amet, ante. Donec eu libero sit
                                amet quam egestas semper. Aenean ultricies mi
                                vitae est. Mauris placerat eleifend leo.
                              </p>
                            </div>
                          </div>
                          <div className="media internal-note">
                            <div className="media-left">
                              <img
                                src="images/avatar/1.png"
                                alt="adag"
                                className="img-circle"
                              />
                            </div>
                            <div className="media-body">
                              <h4 className="media-heading">
                                <small>Note by</small> Administrator{" "}
                                <small>16 Minutes ago</small>
                              </h4>
                              <p>Sketch out new idea for promote Great App</p>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="col-xs-12 col-sm-12 col-md-12 col-lg-5 col-xl-4">
                    <div id="view-list">
                      <div className="panel panel-default panel-brand forecast">
                        <h2>Forecast-</h2>
                        <div className="forecast-datepicker">
                          <input
                            name="dashboard-datepicker"
                            type="text"
                            value="03/09/2019"
                            className="text-center"
                          />
                        </div>
                        <table className="table list-table">
                          <thead>
                            <tr>
                              <th>Invoice No.</th>
                              <th>Customer</th>
                              <th>Due Date</th>
                              <th className="text-right">Amount</th>
                              <th className="text-right">Total Incoming</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Customer">China Export</td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                12,00.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                12,00.00
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 12344">
                                  12344
                                </a>
                              </td>
                              <td data-th="Customer">Delta PC</td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                450.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                450.00
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Customer">China Export</td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                12,00.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                12,00.00
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 12344">
                                  12344
                                </a>
                              </td>
                              <td data-th="Customer">Delta PC</td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                450.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                450.00
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Customer">China Export</td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                12,00.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                12,00.00
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <td
                                colSpan="5"
                                data-th="Amount"
                                className="text-center"
                              >
                                <i className="fa fa-usd" /> 1650.00
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                        <LoadBarChart data={this.state.data} />

                        <div
                          id="chartjs-forecast-tooltip"
                          className="chartjs-tooltip left"
                        >
                          <table>
                            <thead>
                              <tr>
                                <th>February</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>
                                  <span className="chartjs-tooltip-key" />
                                  Past Amounts: € 5,400,000.00
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="panel panel-default panel-moss">
                        <h2>
                          Top Opportunities
                          <Link
                            to="/opportunity/add/"
                            title="Add New Opportunity"
                            className="pull-right"
                          >
                            <i className="fa fa-plus" aria-hidden="true" />
                          </Link>
                        </h2>
                        <table className="table list-table">
                          <thead>
                            <tr>
                              <th>Opportunity No.</th>
                              <th>Date</th>
                              <th>Customer</th>
                              <th class="text-right">Total</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td data-th="Opportunity No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Date">14/04/2016 03:50:00</td>
                              <td data-th="Customer">China Export</td>
                              <td data-th="Total" className="text-right">
                                12,00.00
                              </td>
                              <td data-th="Status">
                                <span className="label label-warning">
                                  Pending
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Opportunity No.">
                                <a href="#" title="View Details of 12344">
                                  12344
                                </a>
                              </td>
                              <td data-th="Date">14/04/2016 03:50:00</td>
                              <td data-th="Customer">Delta PC</td>
                              <td data-th="Total" className="text-right">
                                450.00
                              </td>
                              <td data-th="Status">
                                <span className="label label-success">
                                  Sent
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Opportunity No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Date">14/04/2016 03:50:00</td>
                              <td data-th="Customer">China Export</td>
                              <td data-th="Total" className="text-right">
                                12,00.00
                              </td>
                              <td data-th="Status">
                                <span className="label label-warning">
                                  Pending
                                </span>
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <td
                                colSpan="5"
                                data-th="Total"
                                className="text-center"
                              >
                                <i className="fa fa-usd" /> 1650.00
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="panel panel-default panel-mantle">
                        <h2>
                          Last Quotations
                          <Link
                            to="/quotation/add/"
                            title="Add New Quotation"
                            className="pull-right"
                          >
                            <i className="fa fa-plus" aria-hidden="true" />
                          </Link>
                        </h2>
                        <table className="table list-table">
                          <thead>
                            <tr>
                              <th>Quotation No.</th>
                              <th>Order Date</th>
                              <th>Customer</th>
                              <th className="text-right">Total</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td data-th="Quotation No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Order Date">14/04/2016 03:50:00</td>
                              <td data-th="Customer">China Export</td>
                              <td data-th="Total" className="text-right">
                                12,00.00
                              </td>
                              <td data-th="Status">
                                <span className="label label-warning">
                                  Pending
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Quotation No.">
                                <a href="#" title="View Details of 12344">
                                  12344
                                </a>
                              </td>
                              <td data-th="Order Date">14/04/2016 03:50:00</td>
                              <td data-th="Customer">Delta PC</td>
                              <td data-th="Total" className="text-right">
                                450.00
                              </td>
                              <td data-th="Status">
                                <span className="label label-success">
                                  Pending
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Quotation No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Order Date">14/04/2016 03:50:00</td>
                              <td data-th="Customer">China Export</td>
                              <td data-th="Total" className="text-right">
                                12,00.00
                              </td>
                              <td data-th="Status">
                                <span className="label label-info">
                                  Pending
                                </span>
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <td
                                colSpan="5"
                                data-th="Total"
                                className="text-center"
                              >
                                <i className="fa fa-usd" /> 1650.00
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      <div className="panel panel-default panel-aubergine">
                        <h2>
                          Last Invoices
                          <Link
                            to="/customer/invoice/add/"
                            title="Add New Invoice"
                            className="pull-right"
                          >
                            <i className="fa fa-plus" aria-hidden="true" />
                          </Link>
                        </h2>
                        <table className="table list-table">
                          <thead>
                            <tr>
                              <th>Invoice No.</th>
                              <th>Due Date</th>
                              <th className="text-right">Amount</th>
                              <th className="text-right">Total Incoming</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                12,00.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                12,00.00
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 12344">
                                  12344
                                </a>
                              </td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                450.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                450.00
                              </td>
                            </tr>
                            <tr>
                              <td data-th="Invoice No.">
                                <a href="#" title="View Details of 10003">
                                  10003
                                </a>
                              </td>
                              <td data-th="Due Date">14/04/2016 03:50:00</td>
                              <td data-th="Amount" class="text-right">
                                12,00.00
                              </td>
                              <td data-th="Total Incoming" class="text-right">
                                12,00.00
                              </td>
                            </tr>
                          </tbody>
                          <tfoot>
                            <tr>
                              <td
                                data-th="Total Incoming"
                                colSpan="5"
                                className="text-center"
                              >
                                <i className="fa fa-usd" /> 1650.00
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
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
module.exports = Sales;
