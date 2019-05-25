import React from 'react';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie, is_string_blank} from 'crm_react/common/helper';
import {NotificationManager} from 'react-notifications';
import {translate} from 'crm_react/common/language';



const display_none = {display:'none'};

class  Multiselect extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            input_value: "",
            item_list:[],
            drop_down_class:'dropdown autocomplete',
            loading:true,
            data_found:true,
            show_lable: this.props.show_lable !=undefined ? this.props.show_lable : true,
            tag_colors :['color-1','color-2','color-3','color-4','color-5','color-6','color-7','color-8','color-9','color-10','color-11','color-12'],
            selected_tags:this.props.selected_tags,
            sel_hid_tags:[],
        }
    }

    handle_click_div() {
        $.ajax({
            type: "POST",
            cache: false,
            url: this.props.get_data_url,
            data: {
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({loading: true});
            }.bind(this),
            success: function (data) {
                if (data.success) {
                    this.setState({
                        loading: false,
                        item_list: data.result,
                        drop_down_class: 'dropdown autocomplete open'
                    });
                } else {
                    this.setState({
                        data_found: false,
                        loading: false,
                        item_list: [],
                        drop_down_class: 'dropdown autocomplete open'
                    });
                }
            }.bind(this)
        });
    }

    handle_on_change(e) {
        var lower_string = e.target.value;
        if (is_string_blank(lower_string) && lower_string.length >= 2) {
            $.ajax({
                type: "POST",
                cache: false,
                url:this.props.get_data_url,
                data: {
                    keyword: lower_string,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                    this.setState({loading: true});
                }.bind(this),
                success: function (data) {
                    if (data.success) {
                        this.setState({
                            loading: false,
                            item_list: data.result,
                            drop_down_class: 'dropdown autocomplete open'
                        });
                    } else {
                        this.setState({
                            data_found: false,
                            loading: false,
                            item_list: [],
                            drop_down_class: 'dropdown autocomplete open'
                        });
                    }
                }.bind(this)
            });
        } else {
            this.setState({loading: false, item_list: [],  drop_down_class: 'dropdown autocomplete '});
        }
        this.setState({input_value: e.target.value,});

    }

    handle_click_item(index){
        let tags = this.state.item_list;
        let selected_tags = this.state.selected_tags;
        let sel_hid_tags = this.state.sel_hid_tags;
        console.log(selected_tags.length);
        for(var i=0; i<tags.length; i++){
            if(tags[i].id == index){
                selected_tags.push(tags[i]);
                sel_hid_tags.push(tags[i].id)
            }
        }
        this.setState({selected_tags:selected_tags, sel_hid_tags:sel_hid_tags});
        this.set_props_data()
    }

    set_props_data(){
        this.props.retrun_selectd_tags(this.state.selected_tags);
    }

    click_selected_tag(index){
        let selected_tags = this.state.selected_tags;
        if(selected_tags.length > 0) {
            for (var i = 0; i < selected_tags.length; i++) {
                if (selected_tags[i]['new_tag'] !=undefined) {
                console.log("selected_tags[i]['new_tag']", selected_tags[i]['new_tag'])
                    selected_tags[i]['class'] = 'show';
                } else {
                    selected_tags[i]['class'] = 'hide';
                }
            }
            this.setState({selected_tags: selected_tags});
        }
    }

    click_row(){
        let selected_tags = this.state.selected_tags;
        if(selected_tags.length > 0) {
            for (var i = 0; i < selected_tags.length; i++) {
                selected_tags[i]['class'] = 'hide';
            }
            this.setState({selected_tags: selected_tags});
        }
    }


    handle_on_key_press(e){
        if (e.key === 'Enter') {
            this.handle_create(this.state.input_value)
        }
    }


    handle_create(name){
        if(is_string_blank(name)  && name.length >=2){
            var csrftoken = getCookie('csrftoken');
            var post_data = {'name':name };
            $.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                url: this.props.post_data_url,
                data: {
                    ajax: true,
                    post_data :JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                   this.setState({drop_down_class:'dropdown autocomplete',})
                }.bind(this),
                success: function (data) {
                   if(data.success === true || data.success === 'true'){
                       NotificationManager.success(data.message, 'Success message',5000);
                       let selected_tags = this.state.selected_tags;
                       selected_tags.push(data.tag)

                       this.setState({selected_tags:selected_tags,drop_down_class:'dropdown autocomplete', input_value:""})
                   }else{
                       NotificationManager.error("Error", 'Error',5000);
                   }
                }.bind(this)
            });
        }else{

             NotificationManager.error("Enter Name", 'Error',5000);
        }
    }

    remove_tags(index){
       let selected_tags =  this.state.selected_tags;
           selected_tags.splice(index, 1);
       this.setState({selected_tags: selected_tags});
    }

    select_color(tag_index, color_index){
            //color_index = color_index+1
            //alert(color_index)
            let selected_tags = this.state.selected_tags;
            selected_tags[tag_index].color = color_index;
            var post_data = {'tag_id':selected_tags[tag_index].id, 'color': selected_tags[tag_index].color};
            this.setState({selected_tags: selected_tags});
            $.ajax({
                type: "POST",
                cache: false,
                dataType: "json",
                url: '/update/tag/',
                data: {
                    ajax: true,
                    post_data :JSON.stringify(post_data),
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                   //this.setState({drop_down_class:'dropdown autocomplete',})
                }.bind(this),
                success: function (data) {
                   if(data.success === true || data.success === 'true'){

                   }else{
                       //NotificationManager.error("Error", 'Error',5000);
                   }
                }.bind(this)
            });

    }

    render_selected_items(){
        let selected_tags = this.state.selected_tags;
        return(
            selected_tags.length > 0 ?
                <ul className="list-inline tagbox">
                    {
                        selected_tags.map((selectedTag, i) => {
                            return (<li  key={'_st_' + i} className={selectedTag.color} onClick={this.click_selected_tag.bind(this, i)}>
                                    <i className={'fa fa-circle-o ' + selectedTag.color} key={'_i1_' + i}></i>
                                    <span>{selectedTag.name}</span>
                                    <span key={'_i2_' + i} className="remove-icon-sprite" onClick={this.remove_tags.bind(this, i)}></span>
                                    { selectedTag.new_tag!=undefined ?
                                        <div className={"tags__colors " + selectedTag.class}>
                                            <ul>
                                                {
                                                    this.state.tag_colors.map((color, c) => {
                                                        return (<li className={selectedTag.color == color ? color + ' selected ' : color } key={'_tc_'+c} onClick={this.select_color.bind(this, i, color)}></li>)
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    :null
                                    }
                                </li>
                            )
                        })
                    }
                </ul>
            :null
        );
    }

    render() {

        console.log("selected_tags", this.state.selected_tags);
        return (
            <tr >
                {this.state.show_lable ?
                    <td onClick={this.click_row.bind(this)}><label className="control-label">{this.props.field_label}</label></td>
                    : null
                }
                <td>
                    {
                        <div id="company" className="form-group">
                            <div className={this.state.drop_down_class }>
                                {this.render_selected_items()}
                                <input
                                    type="text" placeholder={this.props.field_label + '...'}
                                    autoComplete="off"
                                    value={this.state.input_value}
                                    onChange={this.handle_on_change.bind(this)}
                                    onKeyPress={this.handle_on_key_press.bind(this)}
                                    id="main_contact"
                                    name="customer_name"
                                    data-toggle="dropdown"
                                    onClick={this.handle_click_div.bind(this)}
                                    className={'form-control '}
                                />
                                <input type="hidden" id="hidden_tags" value={this.state.sel_hid_tags.join(',')}/>


                                <span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                                    <i className="fa fa-angle-down black"></i>
                                </span>
                                <div id="company_drop_box" className="dd-options">
                                    <ul className="options-list">
                                    {   this.state.item_list ?
                                            this.state.item_list.map((item, t) =>{
                                             if(t <= 10)
                                                return <li key={'cust_'+t} data-id={item.id} className={'tag-'+item.color} onClick={this.handle_click_item.bind(this,item.id)}>{item.name}</li>
                                            })
                                        : null
                                    }
                                    {
                                        this.props.create_option ?
                                            <li data-action="create" className="text-primary"  onClick={this.handle_create.bind(this, this.state.input_value)}>
                                                <em>{translate('create')} {this.state.input_value}</em>
                                            </li>
                                        :null
                                    }

                                    </ul>
                                </div>
                            </div>
                        </div>
                    }
                </td>
            </tr>
        );
    }
}
module.exports = Multiselect;

