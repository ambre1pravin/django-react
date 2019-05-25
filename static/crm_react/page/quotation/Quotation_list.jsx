import React from 'react';
import {NotificationManager, NotificationContainer} from 'react-notifications';
import {  Link, browserHistory } from 'react-router'
import state, {BASE_FULL_URL, DIRECTORY_PATH,ROLES,ID,LOGED_IN_USER} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import {getCookie, cursor_pointer} from 'crm_react/common/helper';
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';
import LoadingOverlay  from 'crm_react/common/loading-overlay';

class  QuotationList extends React.Component {
	constructor(props){
	    super(props);
        var opportunity_store_id    = localStorage.getItem('opportunity_store_id');
        var opportunity_store_name    = localStorage.getItem('opportunity_store_name');
        if (opportunity_store_id !='' && opportunity_store_id !==undefined && opportunity_store_id !==null ){
          localStorage.setItem('opp_quo','opp_quo');
        }
        this.state =  {
                    result : null ,
                    total_record : 0,
                    current_page : 1,
                    total_page   : 1,
                    page_start   : 0,
                    page_end     : 0,
                    view_pagging : false,
                    checkbox     : false,
                    keydata      : [],
                    total_amount : [],
                    customer     : [],
                    names        : [],
                    value        : '',
                    limit        : '',
                    parameter    : [],
                    temp_arr     : [],
                    search_div_suggestions_class:'form-group dropdown top-search',
                    opportunity_id      : opportunity_store_id,
                    opportunity_name    : opportunity_store_name,
                    currency            : '',
                    filter_state        : [],
                    processing          : false

        }
        this.serverRequest = $.get('/product/Paginglimit/', function (data) {
            this.setState({result:data, limit : data.limit,});
        }.bind(this));
        this.getQuotationData();
  }

  handleView(view_id){
     browserHistory.push("/quotation/view/"+view_id+"/");
  }


  getQuotationData(){
    //this.setState({processing : true})
    var storegetss_param =localStorage.getItem('parameter1');
    var storegets_parameter = storegetss_param ? JSON.parse(storegetss_param) : []
    var storegetss_1 = localStorage.getItem('search1');
    var storegets = storegetss_1 ? JSON.parse(storegetss_1) : []
    var storegetsstotal_1 = localStorage.getItem('searchtotal1');
    var storegets_total = storegetsstotal_1 ? JSON.parse(storegetsstotal_1) : []
    var storegetsscustomer_1 = localStorage.getItem('searchcustomer1');
    var storegets_customer   = storegetsscustomer_1 ? JSON.parse(storegetsscustomer_1) : []
    var keydata_get = localStorage.getItem('keydata1');
    var keydata_get_parameter = keydata_get ? JSON.parse(keydata_get) : []
    var keydata1 = this.state.keydata;
    var keydat = this.state.keydata;
    var names_list = this.state.names;
    var total_list = this.state.total_amount;
    var customer_list = this.state.customer;
    var parameter_list = this.state.parameter;
    var name_1 = names_list;
    var keyword_1;
    
    if (keydata1.length >0) {
      for(var i = 0 ; i< keydata1.length; i++){
        if(keydata1[i]== 'name' || keydata1[i]== 'total_amount' || keydata1[i]== 'customer'){
            break;
        }else{
          var keydata1 = this.state.keydata;
          keydata1.push(keydata_get_parameter)
          localStorage.setItem('keydata',JSON.stringify(keydata1));
        }
      }
    }else{
      if (keydata_get_parameter.length >0) {
        keydata_get_parameter.forEach(function(element, i) {
            keydata1.push(element)
            var keydata_local= localStorage.setItem('keydata',JSON.stringify(keydata1));
        })
      }
    }

    if (storegets_parameter.length >0) {
        storegets_parameter.forEach(function(element, i) {
            name_1       = element
            if (parameter_list.length >0) {
             for(var i=0; i<parameter_list.length; i++){
               var name = parameter_list[i];
               if(name == name_1){
               }else{
                   parameter_list.push(name_1)
               }
              }
            }else{
                parameter_list.push(name_1)
            }
            var temp_arr = []
            temp_arr.push(parameter_list);
            localStorage.setItem('parameter',JSON.stringify(temp_arr));
        }.bind(this));
    }

        if (storegets.length >0) {
        storegets.forEach(function(element, i) {
                   name_1       = element.name
                   keyword_1    = element.key
                  if (names_list.length >0) {
                     for(var i=0; i<names_list.length; i++){
                       var name = names_list[i];
                       if(names_list[i] == name_1[i]){
                          break;
                       }
                       else{

                          name_1.forEach(function(element1, i) {
                             names_list.push(element1)
                            })

                     var temp_arr = []
                      temp_arr.push({'name':name_1,'key':keyword_1});
                      localStorage.setItem('search',JSON.stringify(temp_arr));  
                       }
                      }
                  }
                  else{
                  name_1.forEach(function(element1, i) {
                     names_list.push(element1)
                    })
                    var temp_arr = []
                      temp_arr.push({'name':name_1,'key':keyword_1});
                      localStorage.setItem('search',JSON.stringify(temp_arr));  
                  }
                    }.bind(this));
        };

        if (storegets_total.length >0) {
        storegets_total.forEach(function(element, i) {
                   name_1       = element.name
                   keyword_1    = element.key
                  if (total_list.length >0) {
                     for(var i=0; i<total_list.length; i++){
                       var name = total_list[i];
                       if(total_list[i] == name_1[i]){

                          break;
                       }
                       else{

                          name_1.forEach(function(element1, i) {
                             total_list.push(element1)
                            })
                        var temp_arr = []
                          temp_arr.push({'name':name_1,'key':keyword_1});
                          localStorage.setItem('searchtotal',JSON.stringify(temp_arr));  

                       }
                      }
                  }
                  else{
                  name_1.forEach(function(element1, i) {
                     total_list.push(element1)
                    })
                      var temp_arr = []
                    temp_arr.push({'name':name_1,'key':keyword_1});
                    localStorage.setItem('searchtotal',JSON.stringify(temp_arr));  
                  }
                    }.bind(this));
        };        

        if (storegets_customer.length >0) {
        storegets_customer.forEach(function(element, i) {
                   name_1       = element.name
                   keyword_1    = element.key
                  if (customer_list.length >0) {

                     for(var i=0; i<customer_list.length; i++){
                       var name = customer_list[i];
                       if(customer_list[i] == name_1[i]){

                        break;
                       }
                       else{

                          name_1.forEach(function(element1, i) {
                             customer_list.push(element1)
                            })
                        var temp_arr = []
                        temp_arr.push({'name':name_1,'key':keyword_1});
                        localStorage.setItem('searchcustomer',JSON.stringify(temp_arr));  
                       }
                      }
                  }
                  else{
                  name_1.forEach(function(element1, i) {
                     customer_list.push(element1)
                    })
                 var temp_arr = []
                temp_arr.push({'name':name_1,'key':keyword_1});
                localStorage.setItem('searchcustomer',JSON.stringify(temp_arr));  
                  }

                    }.bind(this));
        }

           

      var myvalue = this.state.names;
      var keyword = localStorage.getItem('keyword');
    
      var page   = this.state.current_page;
      var parameter_arr = this.state.parameter;
      var limit  = this.state.limit;
      var offset = (page-1)*limit;

      var id_ls = this.props.params.Id;
      if (id_ls !='' && id_ls !== null && id_ls !== undefined) {
        var id_list = id_ls
      }
      else{
        var id_list = ''
      }
      
      var Data = [{'name':'limit', 'value':limit}, {'name':'offset', 'value':offset}];
      //alert("test")
       $.ajax({
            type: "POST",
            cache: false,
            url:  '/quotation/listdata/',
            data: {
              ajax                : true,
              id                  : JSON.stringify(id_list),
              names               : JSON.stringify(this.state.names),
              total_amount        : JSON.stringify(this.state.total_amount),
              customer            : JSON.stringify(this.state.customer),
              filter_list         : JSON.stringify(this.state.filter_state),
              fields              : JSON.stringify(Data),
              csrfmiddlewaretoken : getCookie('csrftoken')
            },

            beforeSend: function () {
                    this.setState({ processing : true})
            }.bind(this),
            success: function (data) {
                 this.setState({currency:data.currency})

                  if(data.quatation_list.length==0 && page>1){
                    
                    this.setState({current_page: page-1}, ()=>{this.getQuotationData()})
                  }
                  else if(data.quatation_list.length>0){
                     
                    var total_page =  Math.floor(data.total_count/limit);

                      if(data.total_count%limit!=0){
                            total_page +=1;                     
                      }
                      var page_start = offset+1;
                      var page_end   = offset+ data.quatation_list.length;
                      
                      this.setState({
                            result :data,
                            total_record : data.total_count,
                            total_page   : total_page, 
                            view_pagging : true,
                            page_start   : page_start,
                            page_end     : page_end ,
                            checkbox     : false,
                          },
                          ()=>{this.handleSetResetAll()})
                  }

                  else{
                   
                        this.setState({
                            result       : null,
                            total_record : 0,
                            total_page   : 1, 
                            view_pagging : false,
                            page_start   : 0,
                            page_end     : 0 ,
                            checkbox     : false,
                          },
                          ()=>{this.handleSetResetAll()})
                  }
               this.setState({processing:false})
            }.bind(this)
        });


    }


  /*Start: pagination */

  getNextPrevPage(action){

    var current_page = this.state.current_page;
    var limit        = this.state.limit;
    var total_page   = this.state.total_page;

    if(action=='prev'){
      current_page--;
      if(current_page<1){
        current_page = total_page;
      }
     this.setState({current_page:current_page}, ()=>{this.getQuotationData()})
    }
    else if(action=='next'){
      current_page++;
      if(current_page>total_page){
        current_page =1
      }
      this.setState({current_page:current_page}, ()=>{this.getQuotationData()})
    }

  }

  handleMarkUnmarkAll(event){
    this.setState({checkbox:!this.state.checkbox}, ()=>{this.handleSetResetAll()})
  }

  handleMarkUnmark(event){

   this.setState({checkbox:false})
  }

  handleSetResetAll(){                         

    var checkbox_status = this.state.checkbox;
    var temp  = $('tr.list_tr ').find('.quotation_checkbox');

    if(checkbox_status===true){
     temp.each(function(){
        $(this).prop('checked', true);
      }) 
    }
    else{
      temp.each(function(){
        $(this).prop('checked', false);
      }) 
    }

  }


  handleExport(){

    var selected_product   = $('tr.list_tr ').find('.quotation_checkbox:checked');
    var limit        = this.state.limit;
    var current_page = this.state.current_page;

    var quot_ids = [];
    var can_remomve = true;

      selected_product.each(function(){
        var qout_state = $(this).attr('data-action');

            quot_ids.push($(this).attr('data-id'));
          
      })
      if (quot_ids =='' || quot_ids == null) {
         var selected_product   = $('tr.list_tr ').find('.quotation_checkbox:not(:checked)');
         selected_product.each(function(){
        var qout_state = $(this).attr('data-action');

            quot_ids.push($(this).attr('data-id'));
          
      })
      }

        $.ajax({
            type: "POST",
            cache: false,
            url: '/quotation/quotationexport/',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
              csrfmiddlewaretoken : getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({ processing : true})
            }.bind(this),
            success: function (data) {
              if(data.success == true){
                 this.setState({ processing : false})
                window.open('/' +data.file);
              }
         
            }.bind(this)
        });
  }
  
  handleDeleteSelected(){

    var confrm = confirm("Do you really want to remove these record?");

    if(confrm===false){
      return;
    }

    var selected_product   = $('tr.list_tr ').find('.quotation_checkbox:checked');
    var limit        = this.state.limit;
    var current_page = this.state.current_page;

    var quot_ids = [];
    var can_remomve = true;

      selected_product.each(function(){
        var qout_state = $(this).attr('data-action');
          if(qout_state=='true'){
            quot_ids.push($(this).attr('data-id'));  
          }
          else{
            can_remomve = false
          }
          
      })

      if(quot_ids.length==limit && current_page>1){
          current_page = current_page-1 
      }

      if(can_remomve===false){
        alert('you can not delete a sent Quotation or a sales order!  ');
        return;
      }


      if(quot_ids.length>0){
        $.ajax({
            type: "POST",
            cache: false,
            url: '/quotation/deleteQoutation/',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
              csrfmiddlewaretoken : getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({ processing : true})
            }.bind(this),
            success: function (data) {
              if(data.success == true){
                 this.setState({ processing : false})
                NotificationManager.success(data.msg, translate('label_success'), 5000);
                this.setState({current_page:current_page},()=>{this.getQuotationData()})
              }else{
                 NotificationManager.error(data.msg, translate('label_error'), 5000);
              }
         
            }.bind(this)
        });
      }

  }

  handle_search_input(event){
        if(event.target.value !=''){
            this.setState({value:event.target.value,search_div_suggestions_class:'form-group dropdown top-search open' })
            
        }else{
            this.setState({value:''})
        }

    }

handleEnterPress(e){
        if (e.key === 'Enter') {
      this.state.names.push(this.state.value)
      var re = this.state.keydata 
      var keydat = this.state.keydata
       var item_length = re.length
         if (item_length > 0) {

          for(var i=0; i<item_length ;i++){
              if(keydat[i] =="name"){
                 var remove_keydata = re.splice(i, 1); 
              }
             
          }  
        }
     

        this.state.keydata.push('name')
        localStorage.setItem('keydata',JSON.stringify(this.state.keydata));

            this.render_names()
            this.getQuotationData()
                    var temp_arr  = []
            temp_arr.push({'name':this.state.names,'key':'Quotation Number'});
            localStorage.setItem('search',JSON.stringify(temp_arr));
            this.setState({value:''})
        }
    }

  onKeyDown(e) {
        if (e.keyCode === 8) {
            this.setState({names:[]})
            this.setState({emails:[]})
            this.setState({tags:[]})
            this.setState({value:''})
            var csrftoken = getCookie('csrftoken');
            if(this.state.value == '') {
              this.removeData('alldelete')
              }
              this.getQuotationData()

              localStorage.clear();
        }
    }

    handle_by_name(){

        this.state.names.push(this.state.value)
        var keydat = this.state.keydata
        var item_length = keydat.length
        var re = this.state.keydata

       if (item_length > 0) {

        for(var i=0; i<item_length ;i++){
            if(keydat[i] =="name"){
               var remove_keydata = re.splice(i, 1); 

            }
           
        }  
      }

        this.state.keydata.push('name')
        localStorage.setItem('keydata',JSON.stringify(this.state.keydata));
        this.setState({value:''})
        this.getQuotationData()
        var temp_arr  = []
        temp_arr.push({'name':this.state.names,'key':'Quotation Number'});
        localStorage.setItem('search',JSON.stringify(temp_arr));
    }

    /*suyash code */

    handle_filter(filter_value){
      var filters = this.state.filter_state
      if(filter_value!='' && filter_value!=null){
        if(filters.indexOf(filter_value)!==-1){
            this.custom_remove(filter_value)
        }else{
            filters.push(filter_value)
        }
        this.setState({filter_state:filters})
        this.getQuotationData()
      }
    }

    custom_remove(item){

         var filters = this.state.filter_state
         if(filters.length > 0){
              for (var i=0; i<filters.length; i++){
                if (filters[i]==item){
                  filters.splice(i,1);
                  break;
                }
              }
          }
    }

    render_filters(){
        let filters =  this.state.filter_state
        let filter_one =[]
        let filter_type;
        for(var i=0; i < filters.length; ++i){
                filter_one.push(filters[i])
        }
        return (
            this.state.filter_state.length > 0 ?
                <div data-type="search" data-key="Filter">
                {
                    filters.map((name, j) =>{
                        if(name == 'draft') {
                            filter_type = name
                            return <span data-separator="or" key={j}>Quotation</span>
                        }else if(name == 'sent') {
                            filter_type = name
                            return <span data-separator="or" key={j}>Quotation Sent</span>
                        }else if(name == 'sale') {
                            filter_type = name
                            return <span data-separator="or" key={j}>Sales Order</span>
                        }else if(name == 'cancel') {
                            filter_type = name
                            return <span data-separator="or" key={j}>Cancel</span>
                        }else{
                            filter_type = null
                            return null
                        }
                    })
                }
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_filter.bind(this, filter_type)}></i>
                </div>
            :null
        );
    }

    remove_filter(filter_type){
         var filters = this.state.filter_state
         if(filters.length > 0){
              for (var i=0; i<filters.length; i++){
                if(filters[i] == filter_type|| filters[i] ==filter_type || filters[i] ==filter_type|| filters[i] ==filter_type){
                  filters.splice(i,1);
                }
              }
             this.setState({filter_state: filters})
             this.getQuotationData()
         }
    }
    /*suyash block end code */

    render_names(){

        let names = this.state.names
        return (
            this.state.names.length > 0 ?
                <div data-type="search" data-key="Quotation Number">
                {
                    names.map((name, j) =>{
                        return <span  data-separator="or" key= {j}>{name}</span>
                    })
                }
                <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_names.bind(this)}></i>
                </div>
           :null
        );
    }  

    handle_by_totalamount(){
        this.state.total_amount.push(this.state.value)
        var keydat = this.state.keydata
        var item_length = keydat.length

       var re = this.state.keydata

       if (item_length > 0) {

        for(var i=0; i<item_length ;i++){

            if(keydat[i] =="total_amount"){
               var remove_keydata = re.splice(i, 1); 

            }
           
        }  
      }
        this.state.keydata.push('total_amount')
        localStorage.setItem('keydata',JSON.stringify(this.state.keydata));


        this.setState({value:''})
        this.getQuotationData()
        var temp_arr  = []
        temp_arr.push({'name':this.state.total_amount,'key':'Quotation Total Amount'});
        localStorage.setItem('searchtotal',JSON.stringify(temp_arr));
    }

    render_totalamount(){

        let total_amount = this.state.total_amount
        return (
            <div data-type="search" data-key="Quotation Total Amount">
            {
                total_amount.map((name, j) =>{
                    return <span  data-separator="or" key= {j}>{name}</span>
                })
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_totalamount.bind(this)}></i>
            </div>
        );
    }    

  handle_by_customer(){
        this.state.customer.push(this.state.value)
          var keydat = this.state.keydata
      var item_length = keydat.length
      var re = this.state.keydata
       if (item_length > 0) {

        for(var i=0; i<item_length ;i++){
            if(keydat[i] =="customer"){
               var remove_keydata = re.splice(i, 1); 
            }
           
        }  
      }

        this.state.keydata.push('customer')
        localStorage.setItem('keydata',JSON.stringify(this.state.keydata));


        this.setState({value:''})
        this.getQuotationData()
        var temp_arr  = []
        temp_arr.push({'name':this.state.customer,'key':'Quotation Customer'});
        localStorage.setItem('searchcustomer',JSON.stringify(temp_arr));
    }

  
  render_customer(){

        let customer = this.state.customer
        return (
            <div data-type="search" data-key="Quotation Customer">
            {
                customer.map((name, j) =>{
                    return <span  data-separator="or" key= {j}>{name}</span>
                })
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_customers.bind(this)}></i>
            </div>
        );
    }

    removeData(remove){

      var page   = this.state.current_page;
      var parameter_arr = this.state.parameter;
      var limit  = this.state.limit;
      var offset = (page-1)*limit;

      var id_ls = this.props.params.Id;
      if (id_ls !='' && id_ls !== null && id_ls !== undefined) {
        var id_list = id_ls
      }
      else{
        var id_list = ''
      }
      
      var Data = [{'name':'limit', 'value':limit}, {'name':'offset', 'value':offset}];

     if (remove =='name') {

         var re = this.state.keydata
         if (re[0] == 'name' ) {

          var remove_keydata = re.splice(0, 1);
        }        
        else if (re[1] =='name' ) {

          var remove_keydata = re.splice(1, 1);
        }        
        else if (re[2] =='name' ) {

         var remove_keydata =  re.splice(2, 1);
        }

        localStorage.removeItem(remove_keydata);

        this.setState({names:[]})
        var name =[]
        var total_amount =this.state.total_amount
        var customer =this.state.customer
        localStorage.removeItem('search');
        localStorage.removeItem('search1');
      }
      else if(remove =='total_amount'){
         var re = this.state.keydata
         if (re[0] == 'total_amount' ) {

          var remove_keydata = re.splice(0, 1);
        }        
        else if (re[1] =='total_amount' ) {

          var remove_keydata = re.splice(1, 1);
        }        
        else if (re[2] =='total_amount' ) {

         var remove_keydata =  re.splice(2, 1);
        }
        localStorage.removeItem(remove_keydata);

        this.setState({total_amount:[]})
        var total_amount =[]
        var name =this.state.names
        var customer =this.state.customer
        localStorage.removeItem('searchtotal');
        localStorage.removeItem('searchtotal1');
      }
      else if (remove =='customer') {

        var re = this.state.keydata
         if (re[0] == 'customer' ) {

          var remove_keydata = re.splice(0, 1);
        }        
        else if (re[1] =='customer' ) {

          var remove_keydata = re.splice(1, 1);
        }        
        else if (re[2] =='customer' ) {

         var remove_keydata =  re.splice(2, 1);
        }

        localStorage.removeItem(remove_keydata);

        this.setState({customer:[]})
        var customer =[]
        var total_amount =this.state.total_amount
        var name =this.state.names
        localStorage.removeItem('searchcustomer');
        localStorage.removeItem('searchcustomer1');
        
      }else if (remove =='alldelete' ) {
        var total_amount =[]
        var name =[]
        var customer =[]
        localStorage.clear();
      };
       $.ajax({
            type: "POST",
            cache: false,
            url: '/quotation/listdata/',
            data: {
              ajax                : true,
              id                  : JSON.stringify(id_list),
              names               : JSON.stringify(name),
              total_amount        : JSON.stringify(total_amount),
              customer            : JSON.stringify(customer),
              filter_list         : JSON.stringify(this.state.filter_state),
              fields              : JSON.stringify(Data),
              csrfmiddlewaretoken : getCookie('csrftoken')
            },

            beforeSend: function () {
                this.setState({processing : true})
            }.bind(this),
            success: function (data) {

                  this.setState({currency:data.currency})

                  if(data.quatation_list.length==0 && page > 1){
                    
                    this.setState({current_page: page-1}, ()=>{this.getQuotationData()})
                  }
                  else if(data.quatation_list.length>0){
                     
                    var total_page =  Math.floor(data.total_count/limit);
                    if(data.total_count%limit!=0){
                            total_page +=1;
                    }
                      var page_start = offset+1;
                      var page_end   = offset+ data.quatation_list.length;
                      
                      this.setState({
                            result :data,
                            total_record : data.total_count,
                            total_page   : total_page, 
                            view_pagging : true,
                            page_start   : page_start,
                            page_end     : page_end ,
                            checkbox     : false,
                          },
                          ()=>{this.handleSetResetAll()})
                  }
                  else{
                        this.setState({
                            result       : null,
                            total_record : 0,
                            total_page   : 1, 
                            view_pagging : false,
                            page_start   : 0,
                            page_end     : 0 ,
                            checkbox     : false,
                          },
                          ()=>{this.handleSetResetAll()})
                  }
                this.setState({processing:false})
            }.bind(this)
        });
    }

    remove_names(){
        this.setState({names:[]})

        var re = this.state.keydata
         if (re[0] == 'name' ) {

          var remove_keydata = re.splice(0, 1);
        }        
        else if (re[1] =='name' ) {

          var remove_keydata = re.splice(1, 1);
        }        
        else if (re[2] =='name' ) {

         var remove_keydata =  re.splice(2, 1);
        }

        localStorage.setItem('keydata',JSON.stringify(this.state.keydata));

        localStorage.removeItem('search');
        localStorage.removeItem('search1');
        this.removeData('name')
    }    
    remove_totalamount(){
        this.setState({total_amount:[]})
        var csrftoken = getCookie('csrftoken');
          var re = this.state.keydata
        if (re[0] =='total_amount' ) {
         var remove_keydata = re.splice(0, 1);
        }else if (re[1] =='total_amount' ) {
         var remove_keydata =  re.splice(1, 1);
        }else if (re[2] =='total_amount' ) {
          var remove_keydata = re.splice(2, 1);
        }

        localStorage.setItem('keydata',JSON.stringify(this.state.keydata));
        localStorage.removeItem('searchtotal');
        localStorage.removeItem('searchtotal1');
        this.removeData('total_amount')
    }    
    remove_customers(){
        this.setState({customer:[]})
        var csrftoken = getCookie('csrftoken');
        var re = this.state.keydata
        if (re[0] =='customer' ) {

         var remove_keydata =  re.splice(0, 1);
        }        
        else if (re[1] =='customer' ) {

         var remove_keydata =  re.splice(1, 1);
        }        
        else if (re[2] =='customer' ) {

         var remove_keydata =  re.splice(2, 1);
        }
        localStorage.setItem('keydata',JSON.stringify(this.state.keydata));

        localStorage.removeItem('searchcustomer');
        localStorage.removeItem('searchcustomer1');
        this.removeData('customer')
    }


  render_header(){

    var keydata = this.state.keydata
    var key =''
        return (
        <header className="crm-header clearfix module__product">
        <div id="mega-icon" className="pull-left">
          <Link to={"/dashboard/"} title="Services"><i className="fa fa-th" aria-hidden="true"></i></Link>
        </div>
        <h1 className="pull-left"><Link to={"/dashboard/"} title="Saalz"><img src={'/static/front/images/saalz-small.png'} alt="Saalz" height="30" /></Link></h1>
        <div className="pull-right">

            <div className={this.state.search_div_suggestions_class}>
                 <div className="pull-left filter-list">
                            {
                               this.render_filters()
                            }
                  </div>
                     {keydata[0] =='name' && keydata[1] ==undefined && keydata[2] == undefined?
                         <div className="pull-left filter-list" id="clist">
                                    {this.render_names()}
                          </div>
                    :null
              }
             {keydata[0] =='name' && keydata[1] =='total_amount' && keydata[2] == undefined?
                      <div className="pull-left filter-list" id="clist">
                      {this.render_names()}
                      {this.render_totalamount()}
                      </div>
                        :null
                  }    
               {keydata[0] =='name' && keydata[1] =='total_amount' && keydata[2] == 'customer'?
                     <div className="pull-left filter-list" id="clist">
                    {this.render_names()}
                    {this.render_totalamount()} 
                    {this.render_customer()}
                    </div>
                        :null
                  }                 
                  {keydata[0] =='name' && keydata[1] =='customer' && keydata[2] == undefined?
                     <div className="pull-left filter-list" id="clist">
                    {this.render_names()}
                    {this.render_customer()}
                    </div>
                        :null
                  }                 
                  {keydata[0] =='name' && keydata[1] =='customer' && keydata[2] == 'total_amount'?
                     <div className="pull-left filter-list" id="clist">
                    {this.render_names()}
                    {this.render_customer()}
                    {this.render_totalamount()} 

                    </div>
                        :null
                  }                  
                  {keydata[0] =='total_amount' && keydata[1] ==undefined && keydata[2] == undefined?
                       <div className="pull-left filter-list" id="clist">
                      {this.render_totalamount()} 
                      </div>
                        :null
                  }                  
                  {keydata[0] =='total_amount' && keydata[1] =='name' && keydata[2] == undefined?
                       <div className="pull-left filter-list" id="clist">
                      {this.render_totalamount()} 
                      {this.render_names()}
                      </div>
                        :null
                  }                  
                  {keydata[0] =='total_amount' && keydata[1] =='name' && keydata[2] == 'customer'?
                         <div className="pull-left filter-list" id="clist">
                        {this.render_totalamount()} 
                        {this.render_names()}
                        {this.render_customer()}
                        </div>
                        :null
                  }                  
                  {keydata[0] =='total_amount' && keydata[1] =='customer' && keydata[2] == 'name'?
                         <div className="pull-left filter-list" id="clist">
                        {this.render_totalamount() }
                        {this.render_customer()}
                        {this.render_names()}
                        </div>
                        :null
                  }                  
                  {keydata[0] =='total_amount' && keydata[1] =='customer' && keydata[2] == undefined?
                         <div className="pull-left filter-list" id="clist">
                        {this.render_totalamount() }
                        {this.render_customer()}
                        </div>
                        :null
                  }                  
                  {keydata[0] =='customer' && keydata[1] ==undefined && keydata[2] == undefined?
                             <div className="pull-left filter-list" id="clist">
                            {this.render_customer()}
                            </div>
                        :null
                  }                  
                  {keydata[0] =='customer' && keydata[1] =='name' && keydata[2] == undefined?
                           <div className="pull-left filter-list" id="clist">
                          {this.render_customer()}
                          {this.render_names()}
                          </div>
                        :null
                  }                  
                  {keydata[0] =='customer' && keydata[1] =='name' && keydata[2] == 'total_amount'?
                           <div className="pull-left filter-list" id="clist">
                          {this.render_customer()}
                          {this.render_names()}
                          {this.render_totalamount()}
                          </div>
                        :null
                  }                  
                  {keydata[0] =='customer' && keydata[1] =='total_amount' && keydata[2] == 'name'?
                     <div className="pull-left filter-list" id="clist">
                          {this.render_customer()}            
                          {this.render_totalamount()} 
                          {this.render_names()}
                      </div>
                        :null
                  }                  
                  {keydata[0] =='customer' && keydata[1] =='total_amount' && keydata[2] == undefined?
                    <div className="pull-left filter-list" id="clist">
                      {this.render_customer()}
                      {this.render_totalamount()} 
                    </div>
                        :null
                  }
                <form method="post" className="clearfix pull-left" data-toggle="dropdown" aria-haspopup="true">
                    <input type="text" onKeyDown={this.onKeyDown.bind(this)} onKeyPress={this.handleEnterPress.bind(this)} className="form-control" value={this.state.value} onChange={this.handle_search_input.bind(this)} placeholder="Search with Quotation Number Ex.SO001 Or Total Amount Or Customer Name"/>
                    <input type="submit" value="Find" className="search-icon-sprite" />
                </form>
                {
                   this.state.value !=''  ?
                    <div className="dropdown-menu top-search__suggestions">
                        <ul>
                            <li onClick={this.handle_by_name.bind(this)}>Search <em>By Quotation Number </em> for <strong>{this.state.value}</strong></li>
                            <li onClick={this.handle_by_totalamount.bind(this)}>Search <em>By Total Amount</em> for <strong>{this.state.value}</strong></li>
                            <li onClick={this.handle_by_customer.bind(this)}>Search <em>By Customer Name</em> for <strong>{this.state.value}</strong></li>
                        </ul>
                    </div>
                : null
                }
            </div>
            {<HeaderNotification/>}
            {<HeaderProfile />}
        </div>

    </header>
     );
  }


  render() {
    let result     = this.state.result
    let page_start = this.state.page_start;
    let page_end   = this.state.page_end;
    let opportunity_store_id    = this.state.opportunity_id
    let opportunity_store_name    = this.state.opportunity_name
    let parameter_list = this.state.parameter;

    return (
    <div>
      { this.render_header()}
        <div id="crm-app" className="clearfix module__quotation">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                      <div className="row top-actions d-lg-flex">
                          <div className="col-xs-12 col-sm-12">

                           {opportunity_store_id != '' && opportunity_store_id !== null ?
                              <ul className="breadcrumbs-top">
                                  <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li><Link to={'/opportunity/list/'} className="breadcumscolor" title={translate('opportunity')}>{translate('opportunity')}</Link></li>
                                  <li><Link to={'/opportunity/view/'+opportunity_store_id}  className="breadcumscolor"  title={translate('opportunity')}>{opportunity_store_name}</Link></li>
                                  <li>{translate('label_quotation')} </li>
                              </ul>
                           :
                            <ul className="breadcrumbs-top">
                                   <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                  <li>{translate('label_quotation')} </li>
                              </ul>
                            }
                                <Link to={'/quotation/add/'}   className="btn btn-new">
                                       {translate('add_quotation')}
                                </Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 col-md-6 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                              <ul className="list-inline inline-block filters-favourite">
                                  <li className="dropdown selection">
                                      <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="filters">
                                          <i className="filter-icon-sprite"></i> {translate('filter')}
                                          <i className="fa fa-angle-down push-left-3"></i>
                                          </span>
                                      <ul className="dropdown-menu" aria-labelledby="filters">

                                            <li className={this.state.filter_state.indexOf('draft')!==-1?'selected':''} onClick={this.handle_filter.bind(this,'draft')}  >Quotation</li>
                                            <li className="divider"></li>
                                            <li className={this.state.filter_state.indexOf('sent')!==-1?'selected':''} onClick={this.handle_filter.bind(this,'sent')}>Quotation Sent</li>
                                            <li className="divider"></li>
                                            <li className={this.state.filter_state.indexOf('sale')!==-1?'selected':''} onClick = {()=>this.handle_filter('sale')}>Sales Order</li>
                                            <li className="divider"></li>
                                            <li className={this.state.filter_state.indexOf('cancel')!==-1?'selected':''} onClick = {()=>this.handle_filter('cancel')}>Cancelled</li>
                                      </ul>
                                   </li>
                                  <li className="dropdown actions__list-view">
                                    <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions">
                                       {translate('label_action')}<i className="fa fa-angle-down push-left-3"></i>
                                    </span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                       <li><a href="javascript:void(0)" onClick = {this.handleDeleteSelected.bind(this)}>{translate('delete')}</a></li>
                                        <li className="divider"></li>
                                       <li><a href="javascript:void(0)" onClick = {this.handleExport.bind(this)}>Export</a></li>
                                    </ul>
                                  </li>
                              </ul>
                              <ul className="list-inline inline-block top-actions-pagination">
                                <li>{this.state.view_pagging==true?page_start+'-'+page_end+'/'+this.state.total_record:''}</li>
                                <li><a href="javascript:void(0)" onClick={this.getNextPrevPage.bind(this, 'prev')}><i className="fa fa-chevron-left"></i></a></li>
                                <li><a href="javascript:void(0)" onClick={this.getNextPrevPage.bind(this, 'next')} ><i className="fa fa-chevron-right"></i></a></li>
                              </ul>
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
                                  <input id="view-list__cb-all" type="checkbox" checked ={this.state.checkbox==true?'checked':''}  onClick = {(event)=>this.handleMarkUnmarkAll(event)} />
                                  <label htmlFor="view-list__cb-all"></label>
                                </div>
                              </th>
                              <th className="fieldwith">{translate('quotation_number')} </th>
                              <th className="fieldwith">{translate('order_date')}</th>
                              <th className="fieldwith">{translate('customer')}</th>
                              <th className="fieldwith subtotalright">{translate('total')}</th>
                              <th className="subtotalright fieldwith">{translate('label_status')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {result && result.quatation_list!==undefined && result.quatation_list.length > 0?
                              result.quatation_list.map((list, i)=>{
                                return(
                                      <tr key= {list.id}  className = "list_tr" >
                                        <td>
                                         {ROLES.includes("ROLE_VIEW_OWN_MANAGE_OWN_QUOTATION") || ROLES.includes("ROLE_MANAGE_ALL_QUOTATION") ||  list.user_id == ID ?
                                          <div className="checkbox">
                                            <input data-id={list.id} data-action = {list.can_remove}  id={"view-list__cb-"+i} className ="quotation_checkbox" type="checkbox" onClick = {(event)=>this.handleMarkUnmark(event)} />
                                            <label htmlFor={"view-list__cb-"+i}></label>
                                          </div>
                                           :null
                                         }
                                        </td>
                                        <td className="fieldwith" onClick={this.handleView.bind(this,list.uuid)} >
                                          <a href="javascript:void(0)" title={"View Details of  "+list.qt_num}>{list.qt_num}</a>
                                        </td>
                                        <td  style={cursor_pointer} className="fieldwith" onClick={this.handleView.bind(this,list.uuid)}>{list.order_date}</td>
                                        <td  style={cursor_pointer} className="fieldwith" onClick={this.handleView.bind(this,list.uuid)}>{list.customer}</td>
                                        <td  style={cursor_pointer} className="fieldwith subtotalright" onClick={this.handleView.bind(this,list.uuid)}><span>{ list.total ? list.total.toFixed(2) : 0.00 }</span><span className="push-left-2">{this.state.currency}</span></td>
                                        <td  style={cursor_pointer} className="subtotalright fieldwith" onClick={this.handleView.bind(this,list.uuid)}>{list.status}</td>
                                      </tr>
                                    )
                              }):null
                             }
                            </tbody>
                            <tfoot>
                              <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td className="fieldwith subtotalright">
                                    <span>{result && result.total_amount!==undefined ? result.total_amount.toFixed(2) : 0.00}</span>
                                    <span className="push-left-2">{this.state.currency}</span></td>
                                <td>&nbsp;</td>
                              </tr>
                            </tfoot>
                            </table>
                            </div> {/* end #view-list */}
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
module.exports = QuotationList;
