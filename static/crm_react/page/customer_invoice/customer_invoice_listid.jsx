import React from 'react';
import ReactTooltip from 'react-tooltip'
import {  Link, browserHistory } from 'react-router'
import state, { DIRECTORY_PATH} from 'crm_react/common/state';
import {translate} from 'crm_react/common/language';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import HeaderNotification from 'crm_react/common/header-notification';
import HeaderProfile from 'crm_react/common/header-profile';
import LoadingOverlay  from 'crm_react/common/loading-overlay';
import {  getCookie} from 'crm_react/common/helper';

class CustomerInvoiceListid extends React.Component {

  constructor(props) {
        super(props);

      this.state = {
                result       : null,
                total_record : 0,
                current_page : 1,
                limit        : '', 
                total_page   : 1,
                page_start   : 0,
                page_end     : 0,
                view_pagging : false,
                checkbox     : false,
                total_amount : [],
                customer     : [],
                names        : [],
                value        : '',
                search_div_suggestions_class:'form-group dropdown top-search',
                processing          : false
      };
      this.serverRequest = $.get('/product/Paginglimit/', function (data) {
        this.setState({limit:data.limit,});

      }.bind(this));
      
      this.getCustomerInvoiceData(this.state.names);  


      localStorage.setItem('setpage','customerlist');
      
      var setpage_q_s = localStorage.getItem('setpage1');

      localStorage.setItem('setpage_q_s',setpage_q_s);

  }

  componentDidMount() {

          var id = this.props.params.Id;
          this.serverRequest = $.get('/quotation/editdata/'+id+'/', function (data) {
             this.setState({name: data.quotation.name});
             localStorage.setItem('quotation_name',data.quotation.name);
          }.bind(this));
          localStorage.setItem('quotation_id',id);
          this.getCustomerInvoiceData()
  }

  handleView(view_id){
      browserHistory.push("/customer/invoice/view/" + view_id +"/");
  }

  handlesendmail(mailid){
            $.ajax({
            type: "POST",
            cache: false,
            url: '/customer/invoice/Checksendmail',
            data: {
              ajax: true,
              ids : JSON.stringify(mailid),
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {
              if(data.success == true){
                 this.setState({processing:false})
                 NotificationManager.success('Automatic Email has been Cancel!', 'Success message',5000);
                 this.getCustomerInvoiceData()
              }
            }.bind(this)
        });
  }

getCustomerInvoiceData(){

    var storegetss_1 = localStorage.getItem('search1');
    var storegets = storegetss_1 ? JSON.parse(storegetss_1) : []  

    var storegetsstotal_1 = localStorage.getItem('searchtotal1');
    var storegets_total = storegetsstotal_1 ? JSON.parse(storegetsstotal_1) : []   

    var storegetsscustomer_1 = localStorage.getItem('searchcustomer1');
    var storegets_customer   = storegetsscustomer_1 ? JSON.parse(storegetsscustomer_1) : []

    var names_list = this.state.names;
    var total_list = this.state.total_amount;
    var customer_list = this.state.customer;
    var parameter_list = this.state.parameter;
    var name_1;
    var keyword_1;



   if (storegets.length >0) {
        storegets.forEach(function(element, i) {

                   name_1       = element.name
                   keyword_1    = element.key

                  if (names_list.length >0) {
                     for(var i=0; i<names_list.length; i++){
                       var name = names_list[i];
                       if(name == name_1){

                       }
                       else{
                          name_1.forEach(function(element1, i) {
                             names_list.push(element1)
                            })
                       }
                      }
                  }
                  else{
                  name_1.forEach(function(element1, i) {
                     names_list.push(element1)
                    })
                  }

                var temp_arr = []
                temp_arr.push({'name':name_1,'key':keyword_1});
                localStorage.setItem('search',JSON.stringify(temp_arr));  
                    }.bind(this));
        };

        if (storegets_total.length >0) {
        storegets_total.forEach(function(element, i) {
                   name_1       = element.name
                   keyword_1    = element.key

                  if (total_list.length >0) {
                     for(var i=0; i<total_list.length; i++){
                       var name = total_list[i];
                       if(name == name_1){

                       }
                       else{
                          name_1.forEach(function(element1, i) {
                             total_list.push(element1)
                            })
                       }
                      }
                  }
                  else{
                  name_1.forEach(function(element1, i) {
                     total_list.push(element1)
                    })
                  }
                var temp_arr = []
                temp_arr.push({'name':name_1,'key':keyword_1});
                localStorage.setItem('searchtotal',JSON.stringify(temp_arr));  
                    }.bind(this));
        };        
        if (storegets_customer.length >0) {

        storegets_customer.forEach(function(element, i) {
                   name_1       = element.name
                   keyword_1    = element.key
                   if (customer_list.length >0) {
                    if (customer_list.includes(name_1) == false) 
                    {
                       name_1.forEach(function(element1, i) {
                         customer_list.push(element1)
                    })
                    }
                  }
                    else{
                       name_1.forEach(function(element1, i) {
                         customer_list.push(element1)
                    })
                    }
                var temp_arr = []
                temp_arr.push({'name':name_1,'key':keyword_1});
                localStorage.setItem('searchcustomer',JSON.stringify(temp_arr)); 

                    }.bind(this));
        };

      var page   = this.state.current_page;
      var limit  = this.state.limit;
      var offset = (page-1)*limit;

      var Data = [{'name':'limit', 'value':limit}, {'name':'offset', 'value':offset}];

       $.ajax({
            type: "POST",
            cache: false,
            url: '/customer/invoice/customerinvoicelistdata/'+ this.props.params.Id+ "/",
            data: {
              ajax: true,
              fields              : JSON.stringify(Data),
              names               : JSON.stringify(this.state.names),
              total_amount        : JSON.stringify(this.state.total_amount),
              customer            : JSON.stringify(this.state.customer),
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {

                
                  if(data.Customer.length==0 && page>1){
                    this.setState({current_page: page-1}, ()=>{this.getCustomerInvoiceData()})
                  }
                  else if(data.Customer.length>0){
                    var total_page =  Math.floor(data.total_count/limit);
                      if(data.total_count%limit!=0){
                            total_page +=1;                     
                      }
                      var page_start = offset+1;
                      var page_end   = offset+ data.Customer.length;
                      
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
                            result :null ,
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
  
  handleCancelSendmail(){

    var confrm = confirm("Do you really want to remove these record?");

    if(confrm===false){
      return;
    }

    var selected_product   = $('tr.list_tr ').find('.quotation_checkbox:checked');

    var quot_ids = [];

      selected_product.each(function(){

        quot_ids.push($(this).attr('data-id'));     
      })

      if(quot_ids.length>0){
        $.ajax({
            type: "POST",
            cache: false,
            url: '/customer/invoice/CancelChecksendmail',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {
              if(data.success == true){
                this.setState({processing:false})
                this.getCustomerInvoiceData()
              }
            }.bind(this)
        });
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
            url: '/customer/invoice/invoiceexport',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {
              if(data.success == true){
                this.setState({processing:false});
                window.open('/'+data.file);
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
        alert('You cannot delete an invoice which is not draft or cancelled. You should create a credit note instead. ');
        return;
      }


      if(quot_ids.length>0){
        $.ajax({
            type: "POST",
            cache: false,
            url: '/customer/invoice/deletecustomer',
            data: {
              ajax: true,
              ids : JSON.stringify(quot_ids),
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {
              if(data.success == true){
                this.setState({current_page:current_page, processing: false},()=>{this.getCustomerInvoiceData()})
              }
            }.bind(this)
        });
      }

  }

  getNextPrevPage(action){

    var current_page = this.state.current_page;
    var limit        = this.state.limit;
    var total_page   = this.state.total_page;

    if(action=='prev'){
      current_page--;
      if(current_page<1){
        current_page = total_page;
      }
     this.setState({current_page:current_page}, ()=>{this.getCustomerInvoiceData()})
    }
    else if(action=='next'){
      current_page++;
      if(current_page>total_page){
        current_page =1
      }
      this.setState({current_page:current_page}, ()=>{this.getCustomerInvoiceData()})
    }

  }

 handle_search_input(event){
        if(event.target.value !=''){
            this.setState({value:event.target.value,search_div_suggestions_class:'form-group dropdown top-search open' })
            
        }else{
            this.setState({value:''})
        }

    }
 handleEnterPress(e) {
        if (e.key === 'Enter') {
            this.state.names.push(this.state.value)
            this.render_names()
            this.getCustomerInvoiceData()
            this.setState({value:''})
        }
    }


  
 onKeyDown(e) {

        if (e.keyCode === 8) {
            this.setState({names:[]})
            this.setState({emails:[]})
            this.setState({tags:[]})
            this.setState({value:''})
            var csrftoken = this.getCookie('csrftoken');
            if(this.state.value == '') {
              this.removeData('alldelete')
              }
              this.getCustomerInvoiceData()
              localStorage.clear();
        }
    }

    handle_by_name(){
        this.state.names.push(this.state.value)
        this.setState({value:''})
        this.getCustomerInvoiceData()
        var temp_arr  = []
        temp_arr.push({'name':this.state.names,'key':'Invoice Numberr'});
        localStorage.setItem('search',JSON.stringify(temp_arr));
    }

    render_names(){

        let names = this.state.names
        return (
            <div data-type="search" data-key="Invoice Number">
            {
                names.map((name, j) =>{
                    return <span  data-separator="or" key= {j}>{name}</span>
                })
            }
            <i className="fa fa-times-circle" aria-hidden="true" onClick={this.remove_names.bind(this)}></i>
            </div>
        );
    }  

    handle_by_totalamount(){
        this.state.total_amount.push(this.state.value)
        this.setState({value:''})
        this.getCustomerInvoiceData()
        var temp_arr  = []
        temp_arr.push({'name':this.state.total_amount,'key':'Invoice Total Amount'});
        localStorage.setItem('searchtotal',JSON.stringify(temp_arr));
    }

    render_totalamount(){

        let total_amount = this.state.total_amount
        return (
            <div data-type="search" data-key="Invoice Total Amount">
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
        this.setState({value:''})
        this.getCustomerInvoiceData()
        var temp_arr  = []
        temp_arr.push({'name':this.state.customer,'key':'Invoice Customer'});
        localStorage.setItem('searchcustomer',JSON.stringify(temp_arr));
    }

  
  render_customer(){

        let customer = this.state.customer
        return (
            <div data-type="search" data-key="Invoice Customer">
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
        this.setState({names:[]})
        var name =[]
        var total_amount =this.state.total_amount
        var customer =this.state.customer
        localStorage.removeItem('search');
        localStorage.removeItem('search1');
      }
      else if(remove =='total_amount'){
        this.setState({total_amount:[]})
        var total_amount =[]
        var name =this.state.names
        var customer =this.state.customer
        localStorage.removeItem('searchtotal');
        localStorage.removeItem('searchtotal1');
      }
      else if (remove =='customer') {
        this.setState({customer:[]})
        var customer =[]
        var total_amount =this.state.total_amount
        var name =this.state.names
        localStorage.removeItem('searchcustomer');
        localStorage.removeItem('searchcustomer1');
      }
      else if (remove =='alldelete' ) {

        var total_amount =[]
        var name =[]
        var customer =[]
        localStorage.clear();
      };


            $.ajax({
            type: "POST",
            cache: false,
             url: '/customer/invoice/customerinvoicelistdata/'+ this.props.params.Id +"/",
            data: {
              ajax: true,
              fields              : JSON.stringify(Data),
              names               : JSON.stringify(name),
              total_amount        : JSON.stringify(total_amount),
              customer            : JSON.stringify(customer),
              csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
                this.setState({processing:true})
            }.bind(this),
            success: function (data) {
                  this.setState({processing:false})
                  if(data.Customer.length==0 && page>1){
                    this.setState({current_page: page-1}, ()=>{this.getCustomerInvoiceData()})
                  }
                  else if(data.Customer.length>0){
                    var total_page =  Math.floor(data.total_count/limit);
                      if(data.total_count%limit!=0){
                            total_page +=1;                     
                      }
                      var page_start = offset+1;
                      var page_end   = offset+ data.Customer.length;
                      
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
                            result :null ,
                            total_record : 0,
                            total_page   : 1, 
                            view_pagging : false,
                            page_start   : 0,
                            page_end     : 0 ,
                            checkbox     : false,
                          },
                          ()=>{this.handleSetResetAll()})
                  }
                  
            }.bind(this)
        });

    }

    remove_names(){
        this.setState({names:[]})
        var csrftoken = this.getCookie('csrftoken');
        localStorage.removeItem('search');
        localStorage.removeItem('search1');
        this.removeData('name')
    }    
    remove_totalamount(){
        this.setState({total_amount:[]})
        var csrftoken = this.getCookie('csrftoken');
        localStorage.removeItem('searchtotal');
        localStorage.removeItem('searchtotal1');
        this.removeData('total_amount')
    }    
    remove_customers(){
        this.setState({customer:[]})
        var csrftoken = this.getCookie('csrftoken');
        localStorage.removeItem('searchcustomer');
        localStorage.removeItem('searchcustomer1');
        this.removeData('customer')
    }





    render_header(){

        return (
        <header className="crm-header clearfix module__product">
        <div id="mega-icon" className="pull-left">
          <Link to={"/dashboard/"} title="Services"><i className="fa fa-th" aria-hidden="true"></i></Link>
        </div>
        <h1 className="pull-left"><a href="#" title="Saalz"><img src={'/static/front/images/saalz-small.jpg'} alt="Saalz" height="40" /></a></h1>
        <div className="pull-right">

            <div className={this.state.search_div_suggestions_class}>
                <div className="pull-left filter-list">
                    {
                        this.state.names.length > 0?
                            this.render_names()
                        :null
                    }
                    {
                     this.state.total_amount.length > 0 ?
                            this.render_totalamount()
                        :null
                     }
                    {
                      this.state.customer.length > 0 ?
                            this.render_customer()
                        :null
                    }
                </div>


                <form method="post" className="clearfix pull-left" data-toggle="dropdown" aria-haspopup="true">
                    <input type="text" onKeyDown={this.onKeyDown.bind(this)} onKeyPress={this.handleEnterPress.bind(this)} className="form-control" value={this.state.value} onChange={this.handle_search_input.bind(this)} placeholder="Search with Invoice Number Or Total Amount Or Customer Name"/>
                    <input type="submit" value="Find" className="search-icon-sprite" />
                </form>
                {
                   this.state.value !=''  ?
                    <div className="dropdown-menu top-search__suggestions">
                         <ul>
                            <li onClick={this.handle_by_name.bind(this)}>Search <em>By Invoice Number </em> for <strong>{this.state.value}</strong></li>
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
    var setpage_q_s = localStorage.getItem('setpage1');


    return (
    <div>
    <NotificationContainer/>
        { this.render_header() }    
        <div id="crm-app" className="clearfix module__quotation">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                      <div className="row top-actions d-lg-flex">
                          <div className="col-xs-12 col-sm-12">
                          {setpage_q_s == 'quotation'?
                             <ul className="breadcrumbs-top">
                             <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                    <li><Link to={'/quotation/list/'} className="breadcumscolor" title={translate('label_quotation')}>{translate('label_quotation')}</Link></li>
                                    <li><Link to={'/quotation/view/'+this.props.params.Id+'/'}  className="breadcumscolor"  title={translate('edit_quotation')}>{this.state.name}</Link></li>
                                    <li>Customer Invoice</li>
                              </ul>
                           :null
                          }
                          {setpage_q_s == 'salers'?
                           <ul className="breadcrumbs-top">
                                <li> <Link to={'/sales/'} className="breadcumscolor" title={translate('label_sales')}>{translate('label_sales')}</Link></li>
                                <li><Link to={'/sales/order/list/'} className="breadcumscolor" title={translate('label_salers')}>{translate('label_salers')}</Link></li>
                                <li><Link to={'/sales/order/view/'+this.props.params.Id +'/'}  className="breadcumscolor"  title={translate('label_salers')}>{this.state.name}</Link></li>
                                <li>Customer Invoice</li>
                           </ul>
                            :null
                          }
                           <Link to={'/customer/invoice/add/'}   className="btn btn-new">Add Customer Invoice</Link>
                          </div>
                          <div className="col-xs-12 col-sm-12 col-md-6 top-actions__right d-lg-flex justify-content-lg-end align-items-lg-center">
                              <ul className="list-inline inline-block filters-favourite">
                                  <li className="dropdown actions__list-view"> 
                                    <span className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true" id="actions">
                                        {translate('label_action')}
                                        <i className="fa fa-angle-down push-left-3"></i>
                                    </span>
                                    <ul className="dropdown-menu" aria-labelledby="actions">
                                      <li><a href="javascript:void(0)" onClick = {this.handleDeleteSelected.bind(this)}>{translate('delete')}</a></li>
                                      <li className="divider"></li>
                                      <li><a href="javascript:void(0)" onClick = {this.handleCancelSendmail.bind(this)}>Cancel email</a></li>
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
                              <th className="invoicecustomerwidth">Customer </th>
                              <th className="invoicewidth">Send Email</th>
                              <th className="invoicewidth">Invoice Date</th> 
                              <th className="invoicewidth">Number</th>
                              <th className="invoicewidth"> Salesperson</th>
                              <th className="invoicewidth">Due Date</th>
                              <th className="invoicewidth">Source Document</th>
                              <th className="invoicewidth">Total</th>
                              <th className="invoicewidth">Amount Due</th>
                              <th className="invoicewidth">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {result && result.Customer!==undefined && result.Customer.length > 0 ?
                              result.Customer.map((list, i)=>{
                                return(
                                      <tr key= {list.id}  className = "list_tr" >
                                        <td>
                                          <div className="checkbox">
                                            <input data-id={list.id} data-action = {list.can_remove}  id={"view-list__cb-"+i} className ="quotation_checkbox" type="checkbox" onClick = {(event)=>this.handleMarkUnmark(event)} />
                                            <label htmlFor={"view-list__cb-"+i}></label>
                                          </div>
                                        </td>
                                        <td data-th="Customer" onClick={this.handleView.bind(this,list.uuid)} >{list.customer}</td>
                                        <td data-th="Send Email" >
                                         {list.checkbox_email == 1?
                                           <span>
                                               <span  data-tip data-for={'envelope_'+list.uuid}   className="glyphicon glyphicon-envelope" style={{'color':list.color}}></span>
                                               <ReactTooltip place="top" id={'envelope_'+list.uuid} type="info" effect="float">
                                                  <span>{list.envelop_info}</span>
                                               </ReactTooltip>
                                           </span>
                                          :null
                                         }
                                         {list.checkbox_email == 1 && !list.remove_cross_button ?
                                           <span onClick={this.handlesendmail.bind(this,list.id)} className="push-left-5">
                                               <span  data-tip data-for={'email_'+list.id}   className="glyphicon glyphicon-remove" style={{'color':list.color}}></span>
                                               <ReactTooltip place="top" id={'email_'+list.id}  type="info" effect="float">
                                                  <span>{list.cross_button_info}</span>
                                               </ReactTooltip>
                                           </span>
                                          :null
                                         }
                                        </td>
                                        <td data-th="Invoice Date" onClick={this.handleView.bind(this,list.uuid)} >{list.invoice_date}</td>
                                        <td data-th="Quotation Number" onClick={this.handleView.bind(this,list.uuid)} >
                                          <a href="javascript:void(0)" title={"View Details of  "+list.invoice_number}>{list.invoice_number}</a>
                                        </td>
                                        <td data-th="Sales Person" onClick={this.handleView.bind(this,list.uuid)} >{list.sales_person}</td>
                                           {list.due_dated =='after' ?
                                              <td data-th="Order Date" onClick={this.handleView.bind(this,list.uuid)} >{list.due_date}</td>
                                            : <td className="isAfterDate" data-th="Order Date" onClick={this.handleView.bind(this,list.uuid)} >{list.due_date}</td>
                                           }
                                        <td data-th="Customer" onClick={this.handleView.bind(this,list.uuid)} >{list.source_document}</td>
                                         <td data-th="Total"  onClick={this.handleView.bind(this,list.uuid)} >{list.total !='' && list.total !==null ? list.total.toFixed(2): 0} {result && result.currency!==undefined ? result.currency : '' }</td>
                                        <td data-th="Total"  onClick={this.handleView.bind(this,list.uuid)} >{list.amount_due !='' && list.amount_due !==null ? list.amount_due.toFixed(2): 0} {result && result.currency!==undefined ? result.currency : '' }</td>
                                        <td data-th="Status" onClick={this.handleView.bind(this,list.uuid)} >{list.status}</td>
                                      </tr>
                                    )
                              })
                                :null
                             }
                            </tbody>
                            <tfoot>
                              <tr>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
                                    <td data-th="Total">{result && result.total_amount!==undefined ? result.total_amount.toFixed(2) : 0} {result && result.currency!==undefined ? result.currency : '' }</td>
                                    <td>&nbsp;</td>
                                    <td>&nbsp;</td>
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
        <LoadingOverlay processing={this.state.processing}/>
     </div>
    );
  }
}


module.exports = CustomerInvoiceListid;



