import React from 'react';
import {translate} from 'crm_react/common/language';
//import _ from 'lodash';

class  Dropdown extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            json_list                 : this.props.json_data && this.props.json_data != ''  ? this.props.json_data : [],
            select_value              : this.props.input_value ? this.props.input_value : '',
            select_id                 : this.props.input_id ? this.props.input_id : '',
            display_json_list         : this.props.json_data && this.props.json_data != ''  ? this.props.json_data : [],
            selectedTags              : this.props.input_value ? this.props.input_value : [],
            selectedReciptans         : this.props.input_value ? this.props.input_value : [],
            input_value:'',
            recipients : [],

        }

    }
    componentWillReceiveProps(nextProps){}

   /*componentWillReceiveProps(nextProps){
        this.setState({
            select_value:nextProps.input_value ? nextProps.input_value : '',
            selectedReciptans:nextProps.input_value ? nextProps.input_value : '',
            select_id:nextProps.input_id ? nextProps.input_id : '',
        });
        var json_list = nextProps.json_data;
        if(nextProps.input_id!==undefined && nextProps.input_id != '' && json_list !== undefined && (json_list.length > 0)){
            var index = -1;
            let id = nextProps.input_id;
            let name = nextProps.input_value;
            for(var i=0; i<json_list.length ;i++){
              if(json_list[i].id==id){
                index = i;
              }
            }
            json_list.splice(index, 1);
            json_list.unshift({id : nextProps.input_id, name : nextProps.input_value});
        }    
        this.setState({input_value:'',});
        this.setState({
            json_list: json_list,
            display_json_list: json_list
        });
   }*/


    handleKeyPressEmail(e){
        this.setState({input_value:e.target.value});
        this.props.set_recipients(this.state.selectedReciptans)
    }

    handleKeyPress(e){
        var current_node = e.target;
        var target_value = e.target.value;
        target_value = target_value.replace(/,/g, '.')
        current_node.parentNode.classList.add("open");
        if(this.state.json_list.length > 0 && target_value.trim() !=''){
        let filterTags = [];
        this.state.json_list.map(function( index ) {
             if(index.name.indexOf(target_value.trim()) !== -1 || index.name.toLowerCase().indexOf(target_value.trim()) !== -1){
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
        this.setState({input_value:target_value, select_value:target_value, select_id:'',});
        if(this.props.inputname === 'pro_tax' && target_value == ''){
            this.props.setSelected(null, null)
        }
    }
    
    handleClick(index,name){
        var selectedReciptans = this.state.selectedReciptans;
        var match = false;
        if(selectedReciptans.length != 0){
            var total = selectedReciptans.length;
            for (var i = 0; i < total; i++) {
                if (selectedReciptans[i].id == index) {
                  match =true;  
                }
            }
            if(!match){
                selectedReciptans.push({id: index,name: name});
                this.setState({selectedReciptans: selectedReciptans,input_value:''});
            }
        }else{
            selectedReciptans.push({id: index, name: name});
            this.setState({selectedReciptans: selectedReciptans, input_value:''});
        }        
    }

    handleSelected(index, name){
        if (this.props.tag == true){
            var selectedTags = this.state.selectedTags;
            var match = false;
            if(selectedTags.length != 0){
                var total = selectedTags.length;
                for (var i = 0; i < total; i++) {
                    if (selectedTags[i].id == index) {
                          match =true;
                    }
                }
                if(!match){
                    selectedTags.push({id: index,name: name});
                    this.setState({selectedTags: selectedTags, input_value:''});
                }
             }else{
                    selectedTags.push({id: index, name: name });
                    this.setState({selectedTags: selectedTags, input_value:''});
             }
        }else{
            this.setState({select_value:name, select_id:index,});
            this.props.setSelected(index, name);
            var field_name =  this.props.inputname;
            if(field_name=='quot_tmpl'){
                this.props.handleTemplateSelection(index,name)
            }
        }
    }

    handleBlur(e){
        let pattern = new RegExp("^[_A-Za-z0-9-]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
        let emailValid = pattern .test(e.target.value);
        var selectedReciptans = this.state.selectedReciptans;
        if(emailValid === true){
            var selected_email1=[]
            selectedReciptans.push({id: 0, name: this.state.input_value});
            this.setState({selectedReciptans: selectedReciptans, input_value:''});
        }else{
            this.setState({selected_email:''})
        }
        this.setState({value:''});
        this.props.set_recipients(this.state.selectedReciptans)
    }


    handleEnterPress(e){
        let pattern = new RegExp("^[_A-Za-z0-9-]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
        let input_value = e.target.value;
        this.setState({input_value : input_value});
        let emailValid = pattern.test(input_value);
        let recipients = this.state.recipients;
        if(pattern.test(input_value) === true){
            recipients.push({id: 'item_'+recipients.length, name: input_value});
            this.setState({selectedReciptans : recipients})
        }
    }

    handleselectedvalue(index,name){
        this.setState({ select_value:name, select_id:index,});
    }

    handleRemoveTag(index){
       let sel_tags =  this.state.selectedTags;
       sel_tags.forEach(function(result, i) {
           if(result.id === index) {
              sel_tags.splice(i, 1);
           }
        });
        this.setState({selectedTags: sel_tags});
    }

    handleRemoveEmailTag(index){
       let sel_tags =  this.state.selectedReciptans;
       sel_tags.forEach(function(result, i) {
            if(result.id === index) {
              sel_tags.splice(i, 1);
            }
        });
        this.setState({selectedReciptans: sel_tags});
    }

    handleAddEdit(id, input_value){
        var input_value = this.state.input_value;
        this.props.handleAddEdit(id,input_value);
    }

    handleViewCateList(){
        this.props.handleViewCateList()
    }

  render() {
    let list_length = this.state.display_json_list !=undefined ? this.state.display_json_list.length : 0;
    return(
          <div>
          {
            this.props.product_dropdown == true ?
            <div className="dropdown autocomplete">
            <input type="text"  name="product_name"  placeholder={this.props.placeholder} onChange={this.handleKeyPress.bind(this)}  value={this.state.select_value} data-toggle="dropdown" />
                {/*<input type="hidden"  name={this.props.inputname}  value={this.state.select_id} />*/}
                {this.state.select_value ?
                    <input type="hidden"  name={this.props.inputname}  value={this.props.input_id} />
                 :
                    <input type="hidden"  name={this.props.inputname}  value="" />
                }
            {
                this.state.select_id?
                <span className="detailed_popup">
                    <i className="fa fa-external-link"  onClick = {this.handleAddEdit.bind(this ,this.state.select_id,this.state.select_value)}></i>
                </span>
                :null
            }
            <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i className="fa fa-angle-down black"></i></span>
            <div className="dd-options dd-options dd-options">
                <ul className="options-list">
                    {
                    this.state.display_json_list !=undefined && this.state.display_json_list.length >0  ?
                        this.state.display_json_list.map((tax, i) =>{
                            if(i < 7)
                            return (<li data-ss={'pro_'+i} key={'pro_'+i}   onClick= {this.handleSelected.bind(this, tax.uuid, tax.name)} data-id={tax.uuid} >{tax.name }</li>)
                        })
                    : null
                    }
                    { /*list_length > 5 ?
                        <li data-action="create-edit" onClick = {this.handleViewCateList.bind(this)}><em>{translate('search_more')}</em></li>
                      :null*/
                    }
                    <li data-action="create-edit" onClick={this.handleAddEdit.bind(this, 0,this.state.input_value)} ><em>{translate('create_edit')} {this.state.input_value}</em></li>
                </ul>
            </div>
        </div>
        :null
       }
       { this.props.tag && this.props.tag == true ?
           <div className="form-group" data-name="tags" data-type="multiselect">
               {this.props.create && this.props.create ==  true ?
                <div className="dropdown autocomplete">
                    <ul id="main_form_tagbox" className="list-inline tagbox">
                    {
                        this.state.selectedTags ?
                            this.state.selectedTags.map((selectedTags, i) =>{
                            return <li data-id={selectedTags.id} key={i}>
                                    <i className="fa fa-circle-o 1"></i>
                                    <span>{selectedTags.name}</span>
                                    <i className="remove-icon-sprite-tag" onClick={this.handleRemoveTag.bind(this,selectedTags.id)}></i>
                                    </li>
                             })
                        :null
                    }
                   </ul>
                    <span data-toggle="dropdown" className="have-control">
                        <input onChange={this.handleKeyPress.bind(this)} type="text" className="form-control"  name="tags" value={this.state.input_value} placeholder="Tag" id="main_form_tags"  />
                    </span>
                    <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                        <i id="main_form_tags_down_icon" className="fa fa-angle-down"></i>
                    </span>
                    <div className="dropdown-menu dd-options">
                        <ul className="options-list-tag">
                            {
                            this.state.display_json_list ?
                                this.state.display_json_list.map((machine, i) =>{
                                        if(i <=7)
                                        return <li key={i} data-id={machine.id} onClick={this.handleSelected.bind(this,machine.id,machine.name)}>{machine.name +'12'}</li>
                                })
                            : null
                            }
                            <li data-action="create" onClick={this.props.handelCreate.bind(this,this.state.input_value)}><em>{translate('create')} {this.state.input_value}</em></li>
                            <li data-action="create-edit" data-toggle="modal" data-target="#tagmodal" onClick={this.handleAddEdit.bind(this,this.state.input_value)}><em>{translate('create_edit')}{this.state.input_value}</em></li>
                        </ul>
                    </div>
                </div>
            :
                    <div className="dropdown autocomplete">
                    <ul id="main_form_tagbox" className="list-inline tagbox">
                    {this.state.selectedReciptans ?
                                this.state.selectedReciptans.map((selectedReciptans, i) =>{
                                return <li key={i}>
                                        <i className="fa fa-circle-o 1"></i>
                                        <span>{selectedReciptans.name}</span>
                                        <i className="remove-icon-sprite-tag" onClick={this.handleRemoveEmailTag.bind(this, selectedReciptans.id)}></i>
                                        </li>
                                                })
                                :null}
                   </ul>
                            <span data-toggle="dropdown" className="have-control">
                               <input  type="text" onChange={this.handleEnterPress.bind(this)}  value={this.state.input_value} className="form-control" name="recipients" placeholder="Select a recipient or enter a manual email e.g : email@company.com" />
                            </span>
                                <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                    <i id="main_form_tags_down_icon" className="fa fa-angle-down"></i>
                                </span> 
                                    <div className="dropdown-menu dd-options">
                                        <ul className="options-list">
                                            {this.state.display_json_list ?
                                                this.state.display_json_list.map((machine, i) =>{
                                                        if(i <=7)
                                                        return <li key={i}  data-id={machine.id} onClick={this.handleClick.bind(this,machine.id,machine.name)}>{machine.name}</li>
                                                })
                                            : null
                                            }
                                        </ul>
                                    </div>
                </div>
            }
            </div> 
           :null
       }
            {!this.props.tag && !this.props.product_dropdown ? 
                <div className="form-group" data-name="tags" data-type="multiselect">
                <div className="dropdown autocomplete">
                <input type="text" placeholder = {this.props.placeholder} onChange={this.handleKeyPress.bind(this)} autoComplete="off" value={this.state.select_value} className="form-control" data-toggle="dropdown" aria-expanded="false" />
                <input type="hidden"  name={this.props.inputname} id={this.props.attr_id}  value={this.state.select_id} />{/*this field is used for selected option id */}

                    { this.state.select_id  && this.props.create_edit && this.props.create_edit ==  true?
                        <span className="detailed_popup">
                            <i className="fa fa-external-link"  onClick = {this.handleAddEdit.bind(this ,this.state.select_id, this.state.select_value)} ></i>
                        </span>
                    :null
                    }
                    <span aria-expanded="false"  aria-haspopup="true" role="button" data-toggle="dropdown">
                        <i id="main_form_tags_down_icon" className="fa fa-angle-down black"></i>
                    </span>

                    {this.props.inputname != 'payment_term_edit' ?
                    <div className="dd-options">
                        <ul className="options-list">

                            {this.state.display_json_list ?
                                this.state.display_json_list.map((item, i) =>{
                                  if(i <=7)
                                    return <li key={i+'____'}  data-id={item.id} onClick={this.handleSelected.bind(this,item.id,item.name)}>{item.name}</li>
                                })
                            : null}

                            {!this.props.role && this.props.create_edit && this.props.create_edit ==  true ?
                                <li data-action="create-edit" onClick={this.handleAddEdit.bind(this, 0,this.state.input_value)} ><em>{translate('create_edit')} {this.state.input_value} </em></li>
                            : null}
                        </ul>
                    </div>
                    :null}
            </div>
            </div> 
        :null}

        </div>
                   
        );
  }
}
module.exports = Dropdown;