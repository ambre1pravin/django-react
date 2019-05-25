import React from 'react';
import state, {BASE_FULL_URL, DIRECTORY_PATH} from 'crm_react/common/state';
import { Router, Route, Link, browserHistory } from 'react-router'
import {translate} from 'crm_react/common/language';

class SearchModule extends React.Component {

  handleRemove(){
    alert('close this search tag');
  }


  handleKeyPress(e){

    var current_node = e.target;
    //current_node.parentNode.classList.add("open");
    var drop_down_node = current_node.closest("div.dropdown");
    //drop_down_node.classList.add("open");
 /*      

        if(this.state.json_list.length > 0 && e.target.value.trim() !=''){
        let filterTags = [];
            this.state.json_list.map(function( index ) {
                //console.log(index.name)
                 if(index.name.indexOf(e.target.value.trim()) !== -1 || index.name.toLowerCase().indexOf(e.target.value.trim()) !== -1){
                     filterTags.push({
                            id: index.id,
                            name: index.name
                        });
                 }
            });
             this.setState({display_json_list: filterTags});
        }else{
            this.setState({display_json_list: this.state.json_list});
        }
        this.setState({
            input_value:e.target.value
        });
        this.setState({
            select_value:e.target.value,
            select_id:'',
        });*/

    }


  render() {

    return (
              <div className="form-group dropdown  top-search">
                  <div className="pull-left filter-list">
                      <div data-type="search" data-key="name">
                          <span>Joris</span><span data-separator="or">Manish</span><span data-separator="and">Suyash</span><span data-separator="or">Nishant</span>
                          <i className="fa fa-times-circle" aria-hidden="true" onClick={this.handleRemove.bind(this)} ></i>
                      </div>
                  </div>
                  <form method="post" className="clearfix pull-left" data-toggle="dropdown" aria-haspopup="true">
                      <input type="text" className="form-control"  onChange={this.handleKeyPress.bind(this)} placeholder={translate('type_name_or_tag')} />
                      <input type="submit" value="Find" className="search-icon-sprite" />
                  </form>
                  <div className="dropdown-menu top-search__suggestions">
                      <ul>
                          <li data-type="search" data-key="name">{translate('label_search')} <em>{translate('name')}</em> for <strong className="search-keyword">a</strong></li>
                          <li data-type="search" data-key="tag">{translate('label_search')} <em>{translate('label_tag')}</em> for <strong className="search-keyword">a</strong></li>
                      </ul>
                  </div>
              </div>
    );
  }
}
module.exports = SearchModule;

