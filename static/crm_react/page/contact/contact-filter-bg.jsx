import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import { Link  } from 'react-router'

class ContactFilterBg extends React.Component {
  render() {
    var divStyle = {
        marginLeft:'10px'
    };
    return (

     <div className ="filterbg">
        <div className="right-part">
            <div className="col-md-12 col-sm-12 col-lg-12 col-xs-12">
              <div className="row">
                    <div className="col-xs-3 col-lg-3">
                        <Link to={'/contact/add/'} className="plusbutton">
                            <i className="fa fa-plus"></i>
                        </Link>
                         <Link to={'/contact/add/'} style={divStyle}>
                            Add Contact
                        </Link>
                    </div>
                    <div className="col-xs-6 col-md-6 col-sm-6 col-lg-6 pull-right">

                        <div className="row">
                            <div className="col-xs-6 col-lg-7 col-md-7 col-sm-6 pad-top-10">
                                <ul className="list-inline inline gray">
                                  <li className="dropdown">
                                    <a id="filters" aria-expanded="true" aria-haspopup="true" role="button" data-toggle="dropdown" className="dropdown-toggle" href="#">
                                        <i className="filter-icon-sprite"></i> Filters <i className="fa fa-angle-down"></i>
                                    </a>
                                    <ul aria-labelledby="filters" className="dropdown-menu">
                                      <li><a href="#">Filter by name</a></li>
                                    </ul>
                                  </li>
                                  <li className="dropdown">
                                    <a id="favorites" aria-expanded="true" aria-haspopup="true" role="button" data-toggle="dropdown" className="dropdown-toggle" href="#">
                                        <i className="fa fa-star-o"></i> Favorites <i className="fa fa-angle-down"></i>
                                    </a>
                                    <ul aria-labelledby="favorites" className="dropdown-menu">
                                      <li><a href="#"> <i className="fa fa-angle-down"></i> Save Current Search</a></li>
                                      <li className="search">
                                        <input type="text" placeholder="search" />
                                      </li>
                                      <li><a href="#">
                                        <div className="checkbox">
                                          <input type="checkbox" id="checkbox1" />
                                          <label > Use by default </label>
                                        </div>
                                        </a></li>
                                      <li>
                                        <a href="#">
                                        <div className="checkbox">
                                          <input type="checkbox" id="checkbox2" />
                                          <label >Share with all users</label>
                                        </div>
                                        </a>
                                      </li>
                                      <li className="save">
                                        <button className="btn btn-primary">SAVE</button>
                                      </li>
                                    </ul>
                                  </li>
                                </ul>
                            </div>
                            <div className="col-xs-6 col-lg-5 col-md-5 col-sm-6">
                                <div className="row">
                                  <ul className="list-inline inline pagi">
                                    <li><a href="#"><i className="fa fa-angle-left"></i></a></li>
                                    <li><a href="#"><i className="fa fa-angle-right"></i></a></li>
                                  </ul>
                                  <ul role="tablist" className="nav nav-tabs nav-pills inline">
                                    <li className="active" role="presentation">
                                        <a data-toggle="tab" role="tab" aria-controls="home" href="#home">
                                            <i className="thumb-icon-sprite"></i></a>
                                    </li>
                                    <li role="presentation">
                                        <a data-toggle="tab" role="tab" aria-controls="profile" href="#profile">
                                            <i className="list-icon-sprite"></i>
                                        </a>
                                    </li>
                                  </ul>
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
module.exports = ContactFilterBg;

