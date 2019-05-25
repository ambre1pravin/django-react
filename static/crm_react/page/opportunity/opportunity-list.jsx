import React, { Component } from "react";
import {Link, browserHistory} from 'react-router'
import ReactTooltip from 'react-tooltip'
import {translate} from 'crm_react/common/language';
import {Container, Draggable } from "react-smooth-dnd";
import {applyDrag, generateItems, getCookie, make_unique } from 'crm_react/common/helper';
import TopLoadingIcon from 'crm_react/common/top-loading-icon'
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import Customer from 'crm_react/component/customer';
import OppRatings from  'crm_react/page/opportunity/opp-ratings';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import ColumnEditModal from 'crm_react/page/opportunity/col_edit_modal';
import SheduleActivityModal from 'crm_react/component/shedule-activity-modal';



class OpportunityList extends Component {
    constructor(props) {
        super(props);
        this.onColumnDrop = this.onColumnDrop.bind(this);
        this.onCardDrop = this.onCardDrop.bind(this);
        this.getCardPayload = this.getCardPayload.bind(this);
        this.state = {
            processing :false,
            view_type:'kanban',
            scene: {},
            result_list: null,
            group_by_filter:[],
            name : [],
            customer : [],
            total_amount : [],
            team_list:[],
            sales_channel_id: this.props.search_states.sales_channel_id,
            selected_channel_name:translate('sales_team'),
            group_by:null,
            new_col_fold_css:'opp-column--fold',
            new_col_form_css:'hide',
            oc_head_show_hide:'show',
            new_col_name:'',
            opportunity_colors:[{'color':'white','selected':true},
                                {'color':'pink','selected':false},
                                {'color':'sky','selected':false},
                                {'color':'green','selected':false},
                                {'color':'orange','selected':false},
                                {'color':'gray','selected':false},
                                {'color':'blue','selected':false},
                                {'color':'violet','selected':false},
                            ],
            card_color:'white',
            customer_id:null,
            opportunity_name:'',
            rating:null,
            revenue:null,
            list_view_table_header:[
                translate('created_date'),translate('opportunity'),translate('stage'),
                translate('label_expecting_closing'),translate('expected_revenue'),translate('probability'),
                translate('sales_team'),translate('sales_person')
            ], //list view vars
            table_show: false,
            search_keyword:'',
            my_opp_filter:this.props.search_states.my_opp_filter,
            search_by_names:this.props.search_states.names,
            search_by_tags:this.props.search_states.tags,
            amt_eq:this.props.search_states.amt_eq,
            amt_lt:this.props.search_states.amt_lt,
            amt_gt:this.props.search_states.amt_gt,
            won_lost_filter : this.props.search_states.won_lost_filter,
            search_div_suggestions_class:'form-group dropdown top-search',
        };

        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags,
            this.state.amt_eq, this.state.amt_lt, this.state.amt_gt)
    }
    
    handle_search_name_keyword(sales_channel_id, names, won_lost_filter, tags, amt_eq, amt_lt, amt_gt, my_opp_filter) {
        this.props.onSelectNames(sales_channel_id, names, won_lost_filter, tags, amt_eq, amt_lt, amt_gt, my_opp_filter);
    }

    handle_change_view(view_type){
        this.setState({view_type:view_type});
        this.get_kanban_view_data(view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt)
    }

    get_kanban_view_data(view_type, team_id, str_group_by, by_names, by_tags, amount_eq, amount_lt, amount_gt){

        let sales_channel_id =this.state.sales_channel_id;
        let search_by_names = this.state.search_by_names;
        let search_by_tags = this.state.search_by_tags;
        let amt_eq = this.state.amt_eq;
        let amt_lt = this.state.amt_lt;
        let amt_gt = this.state.amt_gt;
        let group_by = this.state.group_by;
        if (team_id !=undefined || team_id ==null){
            sales_channel_id = team_id
        }
        if (str_group_by !=undefined || str_group_by ==null){
            group_by = str_group_by
        }
        if(by_names != undefined || by_names.length == 0){
            search_by_names = by_names
        }
        if(by_tags != undefined || by_tags.length == 0){
            search_by_tags = by_tags
        }
        if(amount_eq){
            amt_eq = amount_eq
        }else if(amount_eq == null){
            amt_eq = null
        }
        if(amount_lt){
            amt_lt = amount_lt
        }else if(amount_lt == null){
            amt_lt = null
        }
        if(amount_gt){
            amt_gt = amount_gt
        }else if(amount_gt == null){
            amt_gt = null
        }
        var csrftoken = getCookie('csrftoken');
        $.ajax({
            type: "POST",
            cache: false,
            url: '/opportunity/listdata/',
            data: {
                ajax: true,
                won_lost_filter:JSON.stringify(this.state.won_lost_filter),
                my_opp_filter:JSON.stringify(this.state.my_opp_filter),
                group_by:group_by,
                search_by_names: JSON.stringify(search_by_names),
                search_by_tags: JSON.stringify(search_by_tags),
                amt_eq: JSON.stringify(amt_eq),
                amt_lt: JSON.stringify(amt_lt),
                amt_gt: JSON.stringify(amt_gt),
                customer: JSON.stringify(this.state.customer),
                total_amount: JSON.stringify(this.state.total_amount),
                sales_channel_id:sales_channel_id,
                csrfmiddlewaretoken: csrftoken
            },
            beforeSend: function () {
                this.setState({processing:true});
            }.bind(this),
            success: function (data) {
                //if (data.status === true) {
                    this.setState({processing:false,
                        scene: data.scene,
                        sales_channel_id:data.sales_channel_id,
                        team_list: data.json_teams,
                        group_by_filter: data.group_by_list,
                        selected_channel_name:data.selected_channel_name,
                    });
                //}
            }.bind(this)

        });
    }

    getCardPayload(columnId, index){
        return this.state.scene.children.filter(p => p.id === columnId)[0].children[index];
    }

    onColumnDrop(dropResult){
        const scene = Object.assign({}, this.state.scene);
        scene.children = applyDrag(scene.children, dropResult);
        this.setState({scene,});
        this.column_drop_ajax();
    }

    column_drop_ajax(){
        let column = this.state.scene.children;
        let column_list = [];
        var csrftoken = getCookie('csrftoken');
        let drag_col = false;
        if(column!=undefined && (this.state.group_by ==null || this.state.group_by=='stage')){
            for(let i=0; i< column.length; i++){
                if(column[i]['id'] != undefined && column[i]['id'] > 0) {
                    let col_dic = {'column_id': column[i]['id'], 'order': i};
                    column_list.push(col_dic);
                    drag_col = true
                }else{
                    drag_col = false
                }
            }
            if(column_list.length > 1 && drag_col){
               $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/opportunity/updatecolumnorder/',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(column_list),
                        csrfmiddlewaretoken: csrftoken
                    },
                    beforeSend: function () {
                        this.setState({processing:true})
                    }.bind(this),
                    success: function (data) {
                        if (data.status === true) {
                            this.setState({processing:false});
                            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags,this.state.amt_eq, this.state.amt_lt, this.state.amt_gt)
                        }
                    }.bind(this)
                });
            }
        }else{
            alert("column drag allow only for view by stage")
        }
    }

    onCardDrop(columnId, dropResult){
        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            const scene = Object.assign({}, this.state.scene);
            const column = scene.children.filter(p => p.id === columnId)[0];
            const columnIndex = scene.children.indexOf(column);
            const newColumn = Object.assign({}, column);
            newColumn.children = applyDrag(newColumn.children, dropResult);
            scene.children.splice(columnIndex, 1, newColumn);
            this.setState({scene});
            this.card_drop_ajax(newColumn);
        }
    }

    card_drop_ajax(new_opp_order){
         let group_by = this.state.group_by;
        if(new_opp_order.children.length > 0  ){
            var opp_list = [];
            var column_id = new_opp_order.id;
            var csrftoken = getCookie('csrftoken');

            for(let i=0; i< new_opp_order.children.length; i++){
                opp_list.push(new_opp_order.children[i].id);
            }
            console.log("Card Droped!!", column_id);

            if((column_id > 0 || column_id !='') && opp_list.length > 0 ){
               $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/opportunity/updateopertunityorder/',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(opp_list),
                        column_id:column_id,
                        view_by: this.state.group_by ? this.state.group_by :'stage',
                        csrfmiddlewaretoken: csrftoken
                    },
                    beforeSend: function () {
                        this.setState({processing:true});
                    }.bind(this),
                    success: function (data) {
                        if (data.status === true) {
                            this.setState({processing:false});
                            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt)
                        }
                    }.bind(this)
                });
            }else{
                alert(column_id)
            }
        }
    }

    show_new_col_form() {
        this.setState({new_col_form_css: 'show', new_col_fold_css: '', oc_head_show_hide: 'hide'});
    }

    discard_new_col() {
        this.fold_new_col()
    }

    fold_new_col() {
        this.setState({new_col_form_css: 'hide', new_col_fold_css: 'opp-column--fold', oc_head_show_hide: 'show'});
    }

    change_column_name(event) {
        this.setState({new_col_name: event.target.value});
    }

    delete_col(col_index, column_id, column_type) {
        if (column_id > 0) {
            var col_data;
            var csrftoken = getCookie('csrftoken');
            if (column_type == 'default') {
                col_data = ({'column_id': column_id, 'status': 0});
            } else {
                col_data = ({'column_id': column_id, 'status': 'delete'});
            }
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updatecolumnstatus/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(col_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({processing:true});
                }.bind(this),
                success: function (data) {
                    if (data.success === true || data.success === 'true') {
                        this.setState({processing:false});
                        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt)
                    }
                }.bind(this)
            });
        }
    }

    on_click_column_fold(column_id, fold){
         if (column_id > 0) {
            var col_data;
            var csrftoken = getCookie('csrftoken');
            col_data = ({'column_id': column_id, 'fold': !fold});
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updatecolumnfold/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(col_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({processing:true});
                }.bind(this),
                success: function (data) {
                    if (data.success === true || data.success === 'true') {
                        this.setState({processing:false});
                        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt)
                    }
                }.bind(this)
            });
        }
    }

    col_opp_archive(col_index, column_id, action){
        if (column_id > 0) {
            var csrftoken = getCookie('csrftoken');
            var result = this.state.scene;
            var opp_ids = [];
            var card_id_list = '';
            var url ='';
            var col_data;
            if(action === 'archive'){
                if(result['children'][col_index]['children'].length > 0) {
                    for (var i = 0; i < result['children'][col_index]['children'].length; i++) {
                        opp_ids.push(result['children'][col_index]['children'][i]['id']);
                    }
                    card_id_list = opp_ids.join(",");
                    col_data =  ({'op_id_list':card_id_list, 'column_id':column_id, 'status':'archive' });
                }
            }else if(action === 'unarchive'){
                col_data = ({'column_id':column_id , 'status': 'unarchive'});
            }
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updatecolumnarchive/',
                data: {
                  ajax: true,
                  fields:JSON.stringify(col_data),
                  csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({processing:true});
                }.bind(this),
                success: function (data) {
                  if(data.success === true){
                      this.setState({processing:false});
                      this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
                  }else{
                     this.setState({processing:false});
                  }
                }.bind(this)
            });
        }
    }

    edit_col_modal(col_index, column_id){
        let result = this.state.scene.children;
        let col_data = result[col_index];
        ModalManager.open(
             <ColumnEditModal
                title = "Edit Column"
                modal_id = "edit-col"
                col_data = {col_data}
                update_col_data_fn = {this.update_col_data_fn.bind(this, col_index)}
                onRequestClose={() => true}
             />
        );
    }

    update_col_data_fn(col_index, updated_col_data){
       this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags)
    }

    save_column(){
        let new_col_name = this.state.new_col_name;
        let post_data = [];
        post_data.push({name: 'column_name', value: new_col_name});
        post_data.push({name: 'sales_channel_id', value: this.state.sales_channel_id});
        if (new_col_name != '') {
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/savecolumn/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken
                },
                beforeSend: function () {
                    this.setState({processing:true});
                }.bind(this),
                success: function (data) {
                    if (data.success === true || data.success === 'true') {
                        this.setState({processing:false});
                        this.fold_new_col();
                        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
                    }
                }.bind(this)
            });
        }
    }

    open_form(index) {
        let scene = this.state.scene;
        if (scene.children[index]['display'] === undefined) {
            scene.children[index]['display'] = 'show';
        }else {
            if (scene.children[index]['display'] === 'show') {
                scene.children[index]['display'] = 'hide';
            } else {
                scene.children[index]['display'] = 'show';
            }
        }
        this.setState({scene: scene});
    }

    discard_form(index) {
        let scene = this.state.scene;
        this.setState({scene: scene, processing: false, customer_id:null, opportunity_name:'', rating:null,revenue:null});
        scene.children[index]['display'] = 'hide';
    }

    on_click_sales_team_filter(index) {
        var team_list = this.state.team_list;
        var sales_channel_id=this.state.sales_channel_id;
        if(team_list.length > 0){
            if (team_list[index]['selected']){
                team_list[index]['selected'] = false;
                sales_channel_id =null;
            }else{
                team_list[index]['selected'] = true;
                sales_channel_id =team_list[index]['id'];
            }
            this.setState({team_list: team_list, sales_channel_id: sales_channel_id});
            this.get_kanban_view_data(this.state.view_type, sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
            this.handle_search_name_keyword(sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt, this.state.my_opp_filter);

        }
    }

    on_click_group_by_filter(index, is_selected){
        let group_by_filter = this.state.group_by_filter;
        var group_by = this.state.group_by;
        if(group_by_filter.length > 0){
            if (group_by_filter[index]['selected']){
                group_by_filter[index]['selected'] = false;
                group_by = null;
            }else{
                group_by_filter[index]['selected'] = true;
                group_by =group_by_filter[index]['key'];
            }
            this.setState({group_by_filter: group_by_filter, group_by: group_by });
            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        }
    }

    on_click_won_lost_filter(index){
        let filter_list = this.state.won_lost_filter;
        filter_list[index]['selected']= !filter_list[index]['selected'];
        this.setState({won_lost_filter:filter_list});
        if(filter_list.length > 0) {
            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        }
    }

    on_click_my_opp_filter(index){
        let my_opp_filter = this.state.my_opp_filter;
        my_opp_filter[index]['selected']= !my_opp_filter[index]['selected'];
        this.setState({my_opp_filter:my_opp_filter});
        if(my_opp_filter.length > 0) {
            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        }
    }

    select_opp_color(index){
        let opportunity_colors = this.state.opportunity_colors;
        let card_color = this.state.card_color;
        if(opportunity_colors.length > 0){
            for(var i=0; i< opportunity_colors.length; i++){
                if(i == index){
                    if(opportunity_colors[i]['selected']){
                        opportunity_colors[i]['selected'] = false;
                    }else{
                        opportunity_colors[i]['selected'] = true;
                        card_color = opportunity_colors[i]['color'];
                    }
                }else{
                    opportunity_colors[i]['selected'] = false;
                }
            }
           this.setState({opportunity_colors: opportunity_colors, card_color:card_color});
        }
    }

    set_customer_id_name(data){
        this.setState({customer_id:data.id});
    }

    onchange_name(event){
        this.setState({opportunity_name: event.target.value});
    }

    onchange_revenue(event){
        this.setState({revenue: event.target.value});
    }

    opp_frm_onclick_rating(rate){
       this.setState({rating: rate});
    }

    opp_update_color(opp_id, color){
        if (color!='' && opp_id > 0) {
            var post_data = ({'opportunity_id': opp_id, 'card_color': 'card-' + color});
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updateopportunitycolor/',
                data: {
                    ajax: true,
                    fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken,
                },
                beforeSend: function () {
                   this.setState({processing: true})
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        this.setState({processing: false});
                        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
                    }
                }.bind(this)
            });
        }
    }

    del_opp(opp_id){
         if (opp_id > 0) {
            var post_data = ({'opportunity_id': opp_id, 'card_action': 'delete'});
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updateopportunitystatus/',
                data: {
                    ajax: true,
                    post_fields: JSON.stringify(post_data),
                    csrfmiddlewaretoken: csrftoken,
                },
                beforeSend: function () {
                    this.setState({processing: true});
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        this.setState({processing: false});
                        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
                    }
                }.bind(this)
            });
        }
    }

    opp_archive(col_index, column_id, opp_index, opp_id, action){
        if (column_id > 0 && opp_id > 0) {
            var result = this.state.scene;
            var status ;
            var opp_data;
            if (action === 'archive') {
                status = 'archive';
                opp_data = ({'opportunity_id': opp_id, 'card_action': status});
            } else if (action === 'unarchive') {
                status = 'unarchive';
                opp_data = ({'opportunity_id': opp_id, 'card_action': status});
            }
            var csrftoken = getCookie('csrftoken');
            $.ajax({
                type: "POST",
                cache: false,
                url: '/opportunity/updateopportunitystatus/',
                data: {
                    ajax: true,
                    post_fields: JSON.stringify(opp_data),
                    csrfmiddlewaretoken: csrftoken,
                },
                beforeSend: function () {
                    this.setState({processing: true});
                }.bind(this),
                success: function (data) {
                    if (data.success === true) {
                        this.setState({processing: false });
                        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
                    }
                }.bind(this)
            });
        }
    }

    view_opp(opp_id){
        if(opp_id > 0) {
            browserHistory.push("/opportunity/view/" + opp_id + '/');
        }
    }

    handle_add_submit(index, column_id) {
        let name = this.state.opportunity_name;
        var col_id;
        var csrftoken = getCookie('csrftoken');
        if(name !=''  && column_id > 0 && this.state.sales_channel_id > 0){
            if (name != '') {
                var post_data = {
                    'name': name,
                    'customer_id': this.state.customer_id,
                    'sales_channel_id': this.state.sales_channel_id,
                    'ratings': this.state.rating,
                    'column_id': column_id,
                    'estimated_revenue': this.state.revenue,
                    'card_color':this.state.card_color,
                };
                $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/opportunity/save/',
                    data: {
                        ajax: true,
                        fields: JSON.stringify(post_data),
                        csrfmiddlewaretoken: csrftoken,
                    },
                    beforeSend: function () {
                        this.setState({processing: true});
                    }.bind(this),
                    success: function (data) {
                        if (data.success === true) {
                            this.setState({processing: false, customer_id:null,opportunity_name:'',rating:'', revenue:''});
                            this.discard_form(index);
                            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
                        }
                    }.bind(this)
                });
            } else {
                this.setState({processing: false});
                NotificationManager.error('Opportunity name', 'The following fields:', 5000);
            }
        }else{
            alert("column Id or Sales Channel id not selected")
        }
    }

    rate_return_status(){
        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
    }

    remove_sales_channel(){
         let team_list = this.state.team_list;
         let sales_channel_id = this.state.sales_channel_id;
         if(team_list.length > 0) {
             for (var i = 0; i < team_list.length; i++) {
                  team_list[i]['selected'] = false;
                  sales_channel_id = null;
             }
            this.setState({team_list:team_list, sales_channel_id:null});
            this.get_kanban_view_data(this.state.view_type,sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
         }
    }

    remove_view_by(){
        let group_by_filter = this.state.group_by_filter.filter(function (group_by) {return group_by.selected == true; });
        if(group_by_filter.length > 0 ){
             for (var i = 0; i < group_by_filter.length; i++) {
                  group_by_filter[i]['selected'] = false;
             }
            this.setState({group_by:group_by_filter});
            this.get_kanban_view_data(this.state.view_type,this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);

        }
    }

    remove_won_lost_filter(){
        let won_lost_filter = this.state.won_lost_filter;
        if(won_lost_filter.length > 0) {
             for (var i = 0; i < won_lost_filter.length; i++) {
                 won_lost_filter[i]['selected'] = false;
             }
            this.setState({won_lost_filter:won_lost_filter});
            this.get_kanban_view_data(this.state.view_type,this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags,this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        }
    }

    remove_my_opp_filter(){
        let my_opp_filter = this.state.my_opp_filter;
        if(my_opp_filter.length > 0) {
             for (var i = 0; i < my_opp_filter.length; i++) {
                 my_opp_filter[i]['selected'] = false;
             }
            this.setState({my_opp_filter:my_opp_filter});
            this.get_kanban_view_data(this.state.view_type,this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
            this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, tags_arr, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt, my_opp_filter);
        }
    }

    //header search functions
    handle_search_input(event){
        if(event.target.value !=''){
            this.setState({search_keyword:event.target.value,search_div_suggestions_class:'form-group dropdown top-search open' });
        }else{
            this.setState({search_keyword:''});
        }
    }

    handle_by_name(){
        this.state.search_by_names.push(this.state.search_keyword);
        this.setState({search_keyword:''});
        this.get_kanban_view_data(this.state.view_type,this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt, this.state.my_opp_filter);
    }

    handle_by_amount(type, keyword){
        if(type == 'eq'){
            this.setState({amt_eq: keyword,amt_lt:null, amt_gt:null, search_keyword:''});
            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, keyword, null, null);
            this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, this.state.search_by_tags, keyword, null, null, this.state.my_opp_filter);
        }else if(type == 'lt'){
            this.setState({amt_lt:keyword, amt_eq:null, amt_gt:null, search_keyword:''});
            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, null, keyword, null);
            this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, this.state.search_by_tags, null, keyword, null, this.state.my_opp_filter);
        }else if(type == 'gt'){
            this.setState({amt_gt:keyword, amt_eq:null, amt_lt:null, search_keyword:''});
            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, null, null, keyword);
            this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, this.state.search_by_tags, null, null, keyword, this.state.my_opp_filter );
        }

    }

    remove_names(){
        var name_arr = [];
        this.setState({search_by_names:name_arr});
        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, name_arr, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        this.handle_search_name_keyword(this.state.sales_channel_id, name_arr, this.state.won_lost_filter, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt, this.state.my_opp_filter);
    }

    handle_by_tags(){
        this.state.search_by_tags.push(this.state.search_keyword);
        this.setState({search_keyword:''});
        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, this.state.search_by_tags, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt, this.state.my_opp_filter);
    }

    remove_tags(){
        var tags_arr = [];
        this.setState({search_by_tags:tags_arr});
        this.get_kanban_view_data(this.state.view_type,this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, tags_arr, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt);
        this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, tags_arr, this.state.amt_eq, this.state.amt_lt, this.state.amt_gt, this.state.my_opp_filter);
    }

    remove_amount_eq(){
        this.setState({amt_eq: null, amt_lt: null, amt_gt: null});
        this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags ,null, null, null);
        this.handle_search_name_keyword(this.state.sales_channel_id, this.state.search_by_names, this.state.won_lost_filter, this.state.search_by_tags, null, null, null, this.state.my_opp_filter);
    }

    handleEnterPress(e) {
        if (e.key === 'Enter') {
            this.state.search_by_names.push(this.state.search_keyword);
            this.render_names();
            this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, this.state.search_by_names, this.state.search_by_tags ,null, null, null);
            this.setState({search_keyword:''})
        }
    }

    onKeyDown(e) {
        if (e.keyCode === 8) {
            this.setState({search_by_names:[], search_by_tags:[], amt_eq:null, amt_lt:null, amt_gt:null});
            if(this.state.search_keyword == '') {
                this.get_kanban_view_data(this.state.view_type, this.state.sales_channel_id, this.state.group_by, [], [] ,null, null, null);
            }
        }
    }

    handle_shedule_activity_action(master_id){
        this.setState({composer_display: false, default_message_type:null, send_email_display:false});
        ModalManager.open(
            <SheduleActivityModal
                activity_id = ''
                modal_id = "shedule-activity-modal"
                module_id ={this.state.module_id}
                master_id ={master_id}
                module_name={'opportunity'}
                activity = ''
                summery = ''
                expected_closing_date = ''
                next_reminder_date = ''
                modal_action = 'add'
                onRequestClose={() => false}/>
        );
    }



    render_names(){
        let names = this.state.search_by_names;
        return (
            <div data-type="search" data-key={translate('label_name')}>
                {
                    names.map((name, n) =>{
                        return <span  data-separator="or" key= {'_s_n_' + n}>{name}</span>
                    })
                }
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_names.bind(this)}></i>
            </div>
        );
    }

    render_tags(){
        let tags = this.state.search_by_tags;
        return (
            <div data-type="search" data-key={translate('label_tag')}>
                {
                   tags.length > 0 ?
                    tags.map((name, j) =>{
                        return <span  data-separator="or"  key= {j}>{name}</span>
                    })
                   :null
                }
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_tags.bind(this)}></i>
            </div>
        );
    }

    render_amount_eq(){
        let amt_eq = this.state.amt_eq;
        return (
           amt_eq ?
            <div data-type="search" data-key={'Amount = '}>
                <span>{amt_eq}</span>
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_amount_eq.bind(this)}></i>
            </div>
           :null
        );
    }
    render_amount_lt(){
        let amt_lt = this.state.amt_lt;
        return (
           amt_lt ?
            <div data-type="search" data-key={'Amount < '}>
                <span>{amt_lt}</span>
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_amount_eq.bind(this)}></i>
            </div>
           :null
        );
    }
    render_amount_gt(){
        let amt_gt = this.state.amt_gt;
        return (
           amt_gt ?
            <div data-type="search" data-key={'Amount > '}>
                <span>{amt_gt}</span>
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_amount_eq.bind(this)}></i>
            </div>
           :null
        );
    }
    render_sales_channel_filter(){
        let team_list = this.state.team_list.filter(function (team) {return team.selected == true; });
        return (
            team_list.length > 0 ?
                    <div data-type="search" data-key="Channel">
                    {
                        team_list.map((team, i) =>{
                            return (<span data-separator="or"  key={'_filter_'+i}>{ team.name }</span>);
                        })
                    }
                    <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_sales_channel.bind(this)}></i>
                </div>
            :null
        );
    }

    render_group_by_filter(){
        let group_by_filter = this.state.group_by_filter.filter(function (group_by) {return group_by.selected == true; });
        return (
            group_by_filter.length > 0 ?
                    <div data-type="search" data-key="View By">
                    {
                        group_by_filter.map((group_by, i) =>{
                                return (<span data-separator="or" key={'_group_by_filter_' + i}>{ group_by.label }</span>);
                        })
                    }
                    <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_view_by.bind(this)}></i>
                </div>
            :null
        );
    }

    render_won_lost_filter(){
        let won_lost_filter =  this.state.won_lost_filter.filter(function (won_lost_filter) {return won_lost_filter.selected == true; });
        return (
            won_lost_filter.length > 0 ?
                <div data-type="search" data-key="Filter" >
                    {
                        won_lost_filter.map((won_lost, i) =>{
                                return (<span data-separator="or" key={'_won_lost_filter_' + i}>{ won_lost.label }</span>);
                        })
                    }
                    <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_won_lost_filter.bind(this)}></i>
                </div>
            :null
        );
    }

    render_my_opp_filter(){
        let my_opp_filter = this.state.my_opp_filter.filter(function (my_opp) {return my_opp.selected == true; });
        return (
            my_opp_filter.length > 0 ?
                    <div data-type="search" data-key="Filter">
                    {
                        my_opp_filter.map((my_opp, i) =>{
                                return (<span data-separator="or" key={'_my_opp_filter_' + i}>{ my_opp.label }</span>);
                        })
                    }
                    <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_my_opp_filter.bind(this)}></i>
                </div>
            :null
        );
    }



    render_header(){
      return(
          <header className="crm-header clearfix module__opportunity">
              <div id="mega-icon" className="pull-left">
                  <Link to={"/dashboard/"} title="Services"><i className="fa fa-th" aria-hidden="true"></i></Link>
              </div>
              <h1 className="pull-left">
                  <a href="/dashboard/" title="Saalz">
                    <img src={'/static/front/images/saalz-small.png'} alt="Saalz" height="30"/>
                  </a>
              </h1>
              <TopLoadingIcon processing={this.state.processing}/>
              <div className="pull-right">
                  <div className={this.state.search_div_suggestions_class}>
                      <div className="pull-left filter-list">
                      {/*  this.render_sales_channel_filter() */}
                      { this.render_won_lost_filter() }
                      { this.render_my_opp_filter() }
                      { this.render_group_by_filter() }
                      { this.state.search_by_names.length > 0 ? this.render_names() :null }
                      { this.state.search_by_tags.length > 0 ? this.render_tags() :null }
                      { this.state.amt_eq ? this.render_amount_eq() :null }
                      { this.state.amt_lt ? this.render_amount_lt() :null }
                      { this.state.amt_gt ? this.render_amount_gt() :null }
                      </div>
                      <form method="post" className="clearfix pull-left" data-toggle="dropdown" aria-haspopup="true">
                          <input className="form-control" placeholder="type name or tag or amount" type="text"
                                 value={this.state.search_keyword}
                                 onKeyDown={this.onKeyDown.bind(this)}
                                 onKeyPress={this.handleEnterPress.bind(this)}
                                 onChange={this.handle_search_input.bind(this)}
                          />
                          <input value="Find" className="search-icon-sprite" type="submit"/>
                      </form>
                      <div className="dropdown-menu top-search__suggestions">
                          <ul>
                              <li data-type="search" data-key="name" onClick={this.handle_by_name.bind(this)}>Search <em>Name </em> for <strong
                                  className="search-keyword">{this.state.search_keyword}</strong></li>
                              <li data-type="search" data-key="tag" onClick={this.handle_by_tags.bind(this)}>Search <em>Tag</em> for <strong
                                  className="search-keyword">{this.state.search_keyword}</strong></li>
                              <li data-type="search" data-key="amt_eq" onClick={this.handle_by_amount.bind(this,'eq', this.state.search_keyword)}>Search <em>Amount Equal to </em> <strong
                                  className="search-keyword">{this.state.search_keyword}</strong></li>
                              <li data-type="search" data-key="amt_lt" onClick={this.handle_by_amount.bind(this, 'lt', this.state.search_keyword)}>Search <em>Amount less than </em> <strong
                                  className="search-keyword">{this.state.search_keyword}</strong></li>
                              <li data-type="search" data-key="amt_gt" onClick={this.handle_by_amount.bind(this,'gt', this.state.search_keyword)}>Search <em>Amount greater than </em> <strong
                                  className="search-keyword">{this.state.search_keyword}</strong></li>
                          </ul>
                      </div>
                  </div>
                  {<HeaderNotification/>}
                  {<HeaderProfile />}
              </div>
          </header>
      );
    }

    render_row_top_action(){
        return(
            <div className="row top-actions d-lg-flex">
                  <div className="col-xs-12 col-sm-12">
                      <ul className="breadcrumbs-top">
                          <li><Link to={'/sales/'} className="breadcumscolor"
                                    title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                          <li>{translate('opportunity') }</li>
                      </ul>
                      <Link to={'/opportunity/add/'} className="btn btn-new">
                          { translate('add') +' '+  translate('opportunity') }
                      </Link>
                  </div>
                <div className="col-xs-12 col-sm-12 col-md-12 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                    <ul className="list-inline inline-block filters-favourite">
                        <li className="dropdown actions__list-view hide">
                            <span id="actions" className="dropdown-toggle" data-toggle="dropdown" role="button">
                                <i className="action-icon-sprite"></i> Actions </span>
                            <ul className="dropdown-menu">
                                <li><a href="#">Delete</a></li>
                            </ul>
                        </li>
                        <li className="dropdown selection__single">
                              <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true">
                                  <i className="filter-icon-sprite"></i>{translate('sales_team')}  ( <span className="text-info">{this.state.selected_channel_name}</span> )
                              </span>
                              <ul className="dropdown-menu" aria-labelledby="filters">
                              {this.state.team_list ?
                                this.state.team_list.map((team, i)=>{
                                      return (
                                          <li key={'_li_' + i} onClick={this.on_click_sales_team_filter.bind(this, i, team.selected)}
                                              className={team.selected   && this.state.sales_channel_id==team.id ? 'selected' : ''}>{team.name}</li>
                                      )
                                  })
                                  :null
                                }
                             </ul>
                        </li>

                        <li className="dropdown selection">
                            <span id="filters" className="dropdown-toggle" data-toggle="dropdown" role="button">
                                <i className="filter-icon-sprite"></i> Filter</span>
                            <ul className="dropdown-menu">
                                <span>
                                    {
                                        this.state.won_lost_filter.map((item, i)=>{
                                           return (<li key={'htm_won_'+i} className ={item.selected ?'selected':''} onClick={this.on_click_won_lost_filter.bind(this, i)}>{item.label}</li>)
                                        })
                                    }
                                </span>
                                <li className="divider"></li>
                                <span>
                                    {
                                        this.state.my_opp_filter.map((item, i)=>{
                                           return (<li key={'htm_my_opp_'+i} className ={item.selected ?'selected':''} onClick={this.on_click_my_opp_filter.bind(this, i)}>{item.label}</li>)
                                        })
                                    }
                                </span>
                                <li className="divider"></li>
                                <li>Today Activities</li>
                                <li>This Week Activities</li>
                                <li>Overdue Activities</li>
                            </ul>
                        </li>
                        <li className="dropdown selection__single">
                            <span className="dropdown-toggle" data-toggle="dropdown" role="button">
                                <i className="fa fa-bars"></i> View By</span>
                            <ul className="dropdown-menu">
                                <span>
                                    {
                                        this.state.group_by_filter.map((item, i)=>{
                                           return (<li key={'htm_group_by_'+i} className ={item.selected ?'selected':''} onClick={this.on_click_group_by_filter.bind(this, i, item.selected)}>{item.label}</li>)
                                        })
                                    }
                                </span>
                            </ul>
                        </li>
                    </ul>
                    <ul className="nav nav-tabs nav-pills inline-block" >
                        <li  className={this.state.view_type =='kanban' ? 'active':''} onClick={this.handle_change_view.bind(this, 'kanban')}>
                            <a href="javascript:"><i className="thumb-icon-sprite"></i></a>
                        </li>
                        <li className={this.state.view_type =='list' ? 'active':''} onClick={this.handle_change_view.bind(this, 'list')}>
                            <a href="javascript:"><i className="list-icon-sprite"></i></a>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    render_color(color_for, opp_id){
        return(
            <ul className="card-colors">
            {
                this.state.opportunity_colors.map((color, i) => {
                    if (color_for === 'form' && opp_id === undefined) {
                        return (<li key={'-color_' + i }
                                    className={color.selected ? color.color + ' ' + 'selected' : color.color}
                                    onClick={this.select_opp_color.bind(this, i)}></li>)
                    }else if(color_for === 'list'){
                        return (<li key={'-color_list_' + i }
                                className={color.selected ? color.color + ' ' + 'selected' : color.color}
                               onClick={this.opp_update_color.bind(this, opp_id, color.color)}></li>)
                    }
                })
            }
            </ul>
        )
    }

    render_grid_view(){
        var container_style ={'display': 'flex', 'width':'100%'}
        let drag_cols = this.state.scene.children;
        return (

                <div className="all-opportunities bottom-margin ui-sortable">
                  <Container
                    orientation="horizontal"
                    onDrop={this.onColumnDrop}
                    dragHandleSelector={drag_cols !=undefined && drag_cols.length >=2 || (this.state.group_by==null || this.state.group_by=='stage')? ".column-drag-handle": null}
                    style={container_style}
                  >
                  {drag_cols !=undefined ?
                    drag_cols.map((column, i) => {
                    return (
                      <Draggable key={column.id} className={column.fold_position ? "opp-column opp-column--fold" : "opp-column" }>
                          <div className={column.is_won_col?" oc-head clearfix oc-head-pista":"oc-head clearfix"} >
                            <i className="fa fa-arrows-h" aria-hidden="false" onClick={this.on_click_column_fold.bind(this, column.id, column.fold_position)}></i>
                            <div className={column.id > 0 && (this.state.group_by==null || this.state.group_by=='stage') ? "och-name pull-left column-drag-handle": "och-name pull-left " } title={column.columnName}>
                              <span className="total-op-cards">({column.children.length})</span>
                              {column.id > 0 && (this.state.group_by==null || this.state.group_by=='stage') ?
                                  <span className="fa fa-arrows-alt"></span>
                                  :null
                              }
                              <span className="card-name push-left-3">{column.columnName}</span>
                            </div>
                            {this.state.group_by == null || this.state.group_by == 'stage' ?
                                <div className="pull-right">
                                    <span className="new-opp-card">
                                     <i className="fa fa-plus" aria-hidden="true" onClick={this.open_form.bind(this, i)}></i></span>

                                        <div className="dropdown">
                                        <span id="col2" className="och-options" data-toggle="dropdown" role="button"
                                              aria-haspopup="true" aria-expanded="true">
                                          <i className="fa fa-ellipsis-h" aria-hidden="true"></i></span>
                                            <div className="dd-options ocl-options" aria-labelledby="col2">
                                                <span>Select Option</span>
                                                <ul className="options-list column-options">
                                                    <li data-action="fold" onClick={this.on_click_column_fold.bind(this, column.id, column.fold_position)}>{translate('fold')}</li>
                                                    <li data-action="edit"
                                                        onClick={this.edit_col_modal.bind(this, i, column.id)}>{translate('edit')}</li>
                                                    <li data-action="delete"
                                                        onClick={this.delete_col.bind(this, i, column.id, column.columntype)}>{translate('delete')}</li>
                                                    <li onClick={this.col_opp_archive.bind(this, i, column.id, 'archive')}>{translate('archive_records')}</li>
                                                    <li onClick={this.col_opp_archive.bind(this, i, column.id, 'unarchive')}>{translate('unarchive_records')}</li>
                                                </ul>
                                            </div>
                                        </div>
                                </div>
                            : null
                            }
                          </div>
                          <div className={"create-opp-card edit-form  "+ column.display}>
                              <form action="" method="post">
                                <input
                                    placeholder="Opportunity Name"
                                    name="new-op-card-name"
                                    value={this.state.opportunity_name}
                                    required="" type="text"
                                    onChange={this.onchange_name.bind(this)}
                                />
                                <div className="form-group">
                                    <table style={{'width':'100%'}}>
                                      <tbody>
                                      {
                                          column.display != undefined && column.display == 'show' ?
                                            <Customer
                                                field_name="customer"
                                                field_label="Customer"
                                                show_lable={false}
                                                customer_type ='customer'
                                                set_return_data ={this.set_customer_id_name.bind(this)}
                                                get_data_url="/contact/company/"
                                                post_data_url="/contact/company_create/"
                                                selected_name=""
                                                selected_id={null}
                                                item_selected={false}
                                                create_option={true}
                                                create_edit_option={false}
                                            />
                                          :null
                                      }
                                      </tbody>
                                    </table>
                                </div>
                                <input
                                    placeholder={'0.00 ' + column.currency }
                                    pattern ="\d+(\.\d{2})?"
                                    name="new-op-card-amount"
                                    value={this.state.revenue}
                                    type="text"
                                    maxLength={'9'}
                                    onChange={this.onchange_revenue.bind(this)}

                                />





                                  <div className="ratings">
                                      <i className={this.state.rating == 1 || this.state.rating == 2 || this.state.rating == 3 ? 'fa fa-star selected' :'fa fa-star'} aria-hidden="true" onClick={this.opp_frm_onclick_rating.bind(this,1)}></i>
                                      <i className={this.state.rating == 2 || this.state.rating == 3 ? 'fa fa-star selected' :'fa fa-star'} aria-hidden="true" onClick={this.opp_frm_onclick_rating.bind(this,2)}></i>
                                      <i className={this.state.rating == 3 ? 'fa fa-star selected' :'fa fa-star'} aria-hidden="true" onClick={this.opp_frm_onclick_rating.bind(this,3)}></i>
                                  </div>

                                { this.render_color('form') }
                                <button className="btn btn-primary" type="button"  onClick={this.handle_add_submit.bind(this, i, column.id)}>Add</button>
                                <button className="btn btn-primary btn-discard btn-transparent push-left-10"  type="reset" onClick={this.discard_form.bind(this, i)}>Discard</button>
                              </form>
                          </div>
                          <div className="total-expected-revenue text-center">
                              {column.total_estimate_revenue + ' ' + column.currency}
                          </div>

                              <Container
                                groupName="col"
                                onDragStart={e => console.log("drag started", e)}
                                onDragEnd={e => console.log("onDragEnd", e)}
                                onDrop={e => this.onCardDrop(column.id, e)}
                                getChildPayload={index =>
                                  this.getCardPayload(column.id, index)
                                }
                                dragClass="card-ghost"
                                dropClass="card-ghost-drop"
                                onDragEnter={() => {
                                  console.log("drag enter:", column.id);
                                }}
                                onDragLeave={() => {
                                  console.log("drag leave:", column.id);
                                }}
                                onDropReady={p => console.log('Drop ready: ', p)}
                              >
                            {
                                column.children.map((card, j) => {
                                    return (
                                            <Draggable  key={card.id} className={'op-card '+ card.cardcolor} style={{'overflow':'initial'}}>
                                            <div className="op-card-head">
                                                {
                                                   card.currenttags!=undefined && card.currenttags.length > 0 ?
                                                      card.currenttags.map((tag, t) => {
                                                       return(<span key={"_tag_" +t} className="tag">
                                                           <i data-tip data-for={'_tag_info_' + tag.id}
                                                                 className={"push-left-5 fa fa-circle-o color-"+tag.color}></i>
                                                           <ReactTooltip place="bottom" id={'_tag_info_' + tag.id}
                                                                         type="warning" effect="float">
                                                              <span>{tag.name}</span>
                                                            </ReactTooltip>
                                                        </span>
                                                       )
                                                      })
                                                   :<span className="tag"><i></i>&nbsp;</span>
                                                }
                                               {card.editable ?
                                                <div className="dropdown pull-right">
                                                    <span id="col2-card1" className="ocrh-options" data-toggle="dropdown" role="button" aria-haspopup="false" aria-expanded="false">
                                                        <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                                                    </span>
                                                        <div className="dd-options ocr-options"
                                                             aria-labelledby="col2-card1">
                                                            <span>Select Option</span>
                                                            <ul className="options-list card-options">
                                                                <li><Link to={'/opportunity/edit/' + card.id + '/'}
                                                                          title="Edit">Edit</Link></li>
                                                                <li><a href="#" title="Delete"
                                                                       onClick={this.del_opp.bind(this, card.id)}>Delete</a>
                                                                </li>
                                                                { card.status == true ?
                                                                    <li onClick={this.opp_archive.bind(this, i, column.id, j, card.id, 'archive')}>
                                                                        <a href="javascript:">{translate('archive')}</a>
                                                                    </li>
                                                                    : null
                                                                }
                                                            </ul>
                                                            {this.render_color('list', card.id) }
                                                        </div>
                                                </div>
                                                :   <span key={"_no_access_key_" +card.id} className="pull-right">
                                                           <i data-tip data-for={"_no_access_" +card.id}
                                                                 className={"push-left-5 fa fa-ban fa-2"}></i>
                                                           <ReactTooltip place="bottom" id={"_no_access_" +card.id}
                                                                         type="info" effect="float">
                                                             <span>This Opportunitie not belong to you, regarding your access right, you are not able to Manage it.</span>
                                                            </ReactTooltip>
                                                    </span>

                                               }
                                            </div>
                                            <div className="op-card-detail">
                                                <div className="media-left" onClick={this.view_opp.bind(this, card.id)} style={{'cursor':'pointer'}}>
                                                    <div className="avtar-cir small" >
                                                        <img src={card.sales_person_profile_img} title={card.created_by} alt={card.created_by} className="media-object img-circle" width="30" height="30" />
                                                    </div>
                                                </div>
                                                <div className="media-body" style={{'cursor':'pointer'}}>
                                                    <span className="title" onClick={this.view_opp.bind(this, card.id)}>{card.name}</span>
                                                     <span className="cost" onClick={this.view_opp.bind(this, card.id)}>
                                                        <span className="number" >{card.estimatedRevenue +' '+ card.currency}</span>
                                                    </span>
                                                    <span className="date" onClick={this.view_opp.bind(this, card.id)}>
                                                        {card.activity.activity_date} <i className={'fa fa-lg '+card.activity.type_class}></i>
                                                    </span>


                                                    <div className="op-card-next-activity">
                                                        <span title="New Activity" onClick={this.handle_shedule_activity_action.bind(this,card.id)}>
                                                        <i className="bell-icon-sprite"></i>
                                                        <i className="fa fa-plus-circle" aria-hidden="true"></i>

                                                        </span>

                                                    </div>
                                                    {card.is_lost ?
                                                        <span className="label pull-right label-danger ">Lost</span>
                                                     :null
                                                    }
                                                    {card.is_won ?
                                                        <span className="label pull-right label-success ">Won</span>
                                                     :null
                                                     }


                                                    <OppRatings
                                                        opp_id={card.id}
                                                        rate={card.ratings}
                                                        rate_return_status ={this.rate_return_status.bind(this)}
                                                        editable={card.editable}
                                                    />
                                                </div>
                                            </div>
                                        </Draggable>
                                    );
                                })
                            }
                          </Container>
                      </Draggable>
                    );
                  })
                  :null
                  }
                  {
                      drag_cols !=undefined && drag_cols.length >= 1  && this.state.sales_channel_id ?
                          <div className={"opp-column add-new-oc " + this.state.new_col_fold_css}>
                              {this.state.oc_head_show_hide == 'show' ?
                                  <div className={"oc-head " + this.state.oc_head_show_hide}>
                                      <i className="fa fa-angle-right" aria-hidden="true"
                                         onClick={this.show_new_col_form.bind(this)}></i>
                                      <i className="fa fa-plus" aria-hidden="true"
                                         onClick={this.show_new_col_form.bind(this)}></i>
                                      <div className="och-name">Add New Column</div>
                                  </div>
                                  : null
                              }
                              {this.state.new_col_form_css == 'show' ?
                                  <div className={'new-column-detail ' + this.state.new_col_form_css}>
                                      <input name="column_name" type="text" value={this.state.new_col_name}
                                             placeholder="Add column" onChange={this.change_column_name.bind(this)}/>
                                      <input type="button" className="btn btn-primary addcolumn"
                                             value="add" onClick={this.save_column.bind(this)}/>
                                      <input type="button"
                                             className="btn btn-primary btn-discard btn-transparent push-left-5"
                                             value="Discard"
                                             onClick={this.discard_new_col.bind(this)}/>
                                  </div>
                                  : null
                              }
                          </div>
                      :null
                  }

                </Container>
                </div>

        );
    }

    /* list view Renders
    * functions start from here
    * */
    render_list_view_table_header(){
        return(
              <table className="table list-table  list-table-groupby">
                 <thead>
                  <tr>
                      <th style={{'width':'10%'}}>&nbsp;</th>
                      {
                          this.state.list_view_table_header.map((team, i) => {
                              return (<th key={'_th_'+i} style={{'width':'10%'}}>{team}</th>)
                          })
                      }
                      <th>Action</th>
                  </tr>
                  </thead>
                  { this.render_by_view_by_sales_person() }
                  { this.render_total_list_revenue() }

              </table>
        );
    }

    render_total_list_revenue(){
        let result = this.state.scene;
        return(
              result !=undefined ?
               <tfoot>
                    <tr>
                        <td className="text-center" colSpan="10">{result.total_revenue}</td>
                    </tr>
               </tfoot>
               :null
        );
    }

    on_click_show_hide_rows(index){
        let scene = this.state.scene;
        scene['children'][index]['display_row'] = !scene['children'][index]['display_row'];
        this.setState({scene:scene})
    }

    render_by_view_by_sales_person(){
        let column = this.state.scene;
        return(
             column.children != undefined ?
                column.children.map((col, i) => {
                    return(
                       <tbody className={ col.display_row ? "list-table-groupbody list-table-groupby open" :"list-table-groupbody list-table-groupby"} key={'_sp_tr_'+i}>
                        <tr onClick={this.on_click_show_hide_rows.bind(this, i)}>
                            <th style={{'width':'10%'}}>{col.columnName } <span className="text-primary">{' (' + col.children.length + ')'}</span></th>
                            <th style={{'width':'10%'}}>&nbsp;</th>
                            <th style={{'width':'10%'}}>&nbsp;</th>
                            <th style={{'width':'10%'}}>&nbsp;</th>
                            <th style={{'width':'10%'}}>&nbsp;</th>
                            <th style={{'width':'10%'}}>{col.total_estimate_revenue + ' ' + col.currency}</th>
                            <th style={{'width':'10%'}}>{col.probability}</th>
                            <th style={{'width':'10%'}}>&nbsp;</th>
                            <th style={{'width':'10%'}}>&nbsp;</th>
                            <th style={{'width':'10%'}}>
                                {
                                    col.children !=undefined && col.children.length > 0 ?
                                        <div className="dropdown">
                                            <span id="col2" className="och-options" data-toggle="dropdown" role="button"
                                                  aria-haspopup="true" aria-expanded="true">
                                              <i className="fa fa-ellipsis-h" aria-hidden="true"></i></span>
                                                <div className="dd-options ocl-options" aria-labelledby="col2">
                                                    <span>Select Option</span>
                                                    <ul className="options-list column-options">
                                                        <li data-action="edit"
                                                            onClick={this.edit_col_modal.bind(this, i, col.id)}>{translate('edit')}</li>
                                                        <li data-action="delete"
                                                            onClick={this.delete_col.bind(this, i, col.id, col.columntype)}>{translate('delete')}</li>
                                                        <li onClick={this.col_opp_archive.bind(this, i, col.id, 'archive')}>{translate('archive_records')}</li>
                                                        <li onClick={this.col_opp_archive.bind(this, i, col.id, 'unarchive')}>{translate('unarchive_records')}</li>
                                                    </ul>
                                                </div>
                                        </div>
                                    :null
                                }
                            </th>
                        </tr>
                        { column ?
                            col.children.map((opp, j) => {
                                return (
                                    <tr key={'_tr_opp_' + j} className="">
                                        <td style={{'width':'10%'}}>&nbsp;</td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}>{opp.CreatedAt} </td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}><a href="javascript:void(0)">{opp.name}</a></td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}>{col.columnName}</td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}>{opp.expectedClosing}</td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}>{opp.estimatedRevenue + ' ' + opp.currency  }</td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}>{opp.probability}&nbsp;</td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}>{opp.sales_team_name}</td>
                                        <td style={{'width':'10%'}} onClick={this.view_opp.bind(this, opp.id)}>{opp.sales_person_name}</td>
                                        <td style={{'width':'10%'}}>
                                            {opp.editable ?
                                                <div className="dropdown pull-left">
                                                    <span id="col2-card1" className="ocrh-options" data-toggle="dropdown" role="button" aria-haspopup="false" aria-expanded="false">
                                                        <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
                                                    </span>
                                                    <div className="dd-options ocr-options" aria-labelledby="col2-card1">
                                                        <span>Select Option</span>
                                                        <ul className="options-list card-options">
                                                            <li><Link to={'/opportunity/edit/'+opp.id+'/'} title="Edit">Edit</Link></li>
                                                            <li><a href="#" title="Delete" onClick={this.del_opp.bind(this, opp.id)}>Delete</a></li>
                                                              { opp.status == true ?
                                                                  <li onClick={this.opp_archive.bind(this, i, col.id, j, opp.id, 'archive')}>
                                                                      <a href="javascript:">{translate('archive')}</a>
                                                                  </li>
                                                                  :null
                                                              }
                                                        </ul>
                                                    </div>
                                                </div>
                                                :   <span key={"_l_no_access_key_" +opp.id}>
                                                           <i data-tip data-for={"_l_no_access_" +opp.id}
                                                                 className={"push-left-5 fa fa-ban fa-2"}></i>
                                                           <ReactTooltip place="bottom" id={"_l_no_access_" +opp.id}
                                                                         type="info" effect="float">
                                                             <span>This Opportunitie not belong to you, regarding your access right, you are not able to Manage it.</span>
                                                            </ReactTooltip>
                                                    </span>
                                            }
                                        </td>
                                    </tr>
                                )
                            })
                          :null
                        }
                        </tbody>
                    )
                })
              :null
        )
    }

  render() {
    return (
        <div>
        { this.render_header() }
        <div id="crm-app" className="clearfix module__opportunity module__opportunity-edit">
        <div className="container-fluid">
            <div className="row">
                <div className="col-xs-12 col-md-12 col-sm-12 col-lg-12">
                    { this.render_row_top_action() }
                    <div className="row crm-stuff">
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div className="tab-content">
                                {this.state.view_type == 'kanban' ?
                                    <div   id="view-grid">
                                        {this.render_grid_view()}
                                    </div>
                                  : null
                                }
                                {this.state.view_type == 'list' ?
                                    <div   id="view-list">
                                        {this.render_list_view_table_header() }
                                    </div>
                                 : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
        <NotificationContainer/>
        <LoadingOverlay processing={this.state.processing}/>
        </div>
    );
  }
}
module.exports = OpportunityList;
