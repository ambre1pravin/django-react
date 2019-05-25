import React from 'react'
import { render } from 'react-dom'

import 'react-toastify/dist/ReactToastify.css';
import { Router, Route,  browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin';
import {root} from 'baobab-react/higher-order';
import state,{BASE_FULL_URL,RELATIVE_URL} from './common/state';
import Dashboard from 'crm_react/page/dashboard/dashboard';
import FullCalendar from 'crm_react/page/calender/full-calendar';
import SettingCommon from 'crm_react/common/setting';
import Contact from 'crm_react/common/contact';
import InstallApplications from 'crm_react/page/user_settings/install-applications';
import NextActitvityCommon from 'crm_react/component/my-next-activity-common';


import Sales from 'crm_react/page/sales/sales';
    import Opportunity from 'crm_react/page/opportunity/Opportunity';

    import SalesteamList from 'crm_react/page/salesteam/Salesteam_List';
    import SalesteamView from 'crm_react/page/salesteam/Salesteam_View';
    import SalesteamAdd from 'crm_react/page/salesteam/Salesteam_add';
    import SalesteamEdit from 'crm_react/page/salesteam/Salesteam_edit';

    import ProductList from 'crm_react/page/product/Product_List';
    import ProductAdd from 'crm_react/page/product/Product_add';
    import ProductView from 'crm_react/page/product/Product_view';
    import ProductEdit from 'crm_react/page/product/Product_edit';

    import PricelistList from 'crm_react/page/pricelist/Pricelist_List';
    import PricelistAdd from 'crm_react/page/pricelist/Pricelist_add';

    import QuotationList from 'crm_react/page/quotation/Quotation_list';
    import QuotationAdd from 'crm_react/page/quotation/Quotation_add';
    import QuotationView from 'crm_react/page/quotation/Quotation_view';
    import QuotationEdit from 'crm_react/page/quotation/Quotation_edit';
    import QuotationPreview from 'crm_react/page/quotation/Quotation_preview';


    import PaymentList from 'crm_react/page/payment/Payment_list';


    import SalesOrderList from 'crm_react/page/sales_order/sales-order-list';
    import SalesOrderAdd from 'crm_react/page/sales_order/sales-order-add';
    import SalesOrderView from 'crm_react/page/sales_order/sales-order-view';
    import SalesOrderEdit from 'crm_react/page/sales_order/sales-order-edit';
    import SalesOrderPreview from 'crm_react/page/sales_order/sales-order-preview';

    import QuotTemplateAdd from 'crm_react/page/quot_template/quot_template_add';
    import QuotTemplateList from 'crm_react/page/quot_template/quot_template_list';
    import QuotTemplateView from 'crm_react/page/quot_template/quot_template_view';
    import QuotTemplateEdit from 'crm_react/page/quot_template/quot_template_edit';

    import EmailTemplateAdd from 'crm_react/page/email_template/email_template_add';
    import EmailTemplateList from 'crm_react/page/email_template/email_template_list';
    import EmailTemplateEdit from 'crm_react/page/email_template/email_template_edit';

    import DeliveryMethodAdd from 'crm_react/page/delivery_method/delivery_method_add';
    import DeliveryMethodList from 'crm_react/page/delivery_method/delivery_method_list';
    import DeliveryMethodView from 'crm_react/page/delivery_method/delivery_method_view';
    import DeliveryMethodEdit from 'crm_react/page/delivery_method/delivery_method_edit';

    import PaymentTermAdd1 from 'crm_react/page/payment_term/payment_term_add1';
    import PaymentTermList from 'crm_react/page/payment_term/payment_term_list';
    import PaymentTermView from 'crm_react/page/payment_term/payment_term_view';
    import PaymentTermEdit from 'crm_react/page/payment_term/payment_term_edit';

    import UnitofMeasureAdd from 'crm_react/page/unit_of_measure/unit_of_measure_add';
    import UnitofMeasureList from 'crm_react/page/unit_of_measure/unit_of_measure_list';
    import UnitofMeasureView from 'crm_react/page/unit_of_measure/unit_of_measure_view';
    import UnitofMeasureEdit from 'crm_react/page/unit_of_measure/unit_of_measure_edit';

    import CustomerInvoiceAdd from 'crm_react/page/customer_invoice/customer_invoice_add';
    import CustomerInvoiceList from 'crm_react/page/customer_invoice/customer_invoice_list';
    import CustomerInvoiceView from 'crm_react/page/customer_invoice/customer_invoice_view';
    import CustomerInvoiceEdit from 'crm_react/page/customer_invoice/customer_invoice_edit';
    import CustomerInvoiceListid from 'crm_react/page/customer_invoice/customer_invoice_listid';





injectTapEventPlugin();
//webpack-dev-server --progress --colors --history-api-fallback
//TODO: this is an example of todo
class App extends React.Component {

    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/dashboard/' component={Dashboard} />
                <Route name="contact-list" path='/contact/list/' component={Contact}/>
                <Route name="customer-list" path='/customer/list/' component={Contact}/>

                <Route name="contact-add" path='/contact/add/' component={Contact}/>
                <Route name="contact-view" path='/contact/view/:id/' component={Contact}/>
                <Route name="contact-edit" path='/contact/edit/:id/'  component={Contact}/>
                <Route name="contact-next-activity" path='/contact/next-activity/' component={Contact}/>
                <Route name="oppertunity-next-activity" path='/oppertunity/next-activity/' component={Contact} />

                <Route name="opportunity-list" path={'/opportunity/list/'} component={Opportunity}/>
                <Route name="opportunity-view" path={'/opportunity/view/:id/'} component={Opportunity}/>
                <Route name="opportunity-add" path={'/opportunity/add/'} component={Opportunity}/>
                <Route name="opportunity-edit" path={'/opportunity/edit/:id/'} component={Opportunity}/>

                <Route name="calender" path='/calendar/list/' component={FullCalendar}/>
                <Route name="calender" path='/calendar/list/:url' component={FullCalendar} type=""/>
                <Route name="user-list" path='/user/list/' component={SettingCommon} />
                <Route name="user-create" path='/user/create/' component={SettingCommon} />
                <Route name="user-profile" path='/user/profile/' component={SettingCommon} />
                <Route name="user-view" path='/user/view/:id' component={SettingCommon} />
                <Route name="company-settings" path='/company/setting/' component={SettingCommon} />
                <Route name="price-list" path='/price-list/' component={SettingCommon} />
                <Route name="apps" path='/apps/' component={InstallApplications} />
                <Route name="next-activity" path='/next-activity/' component={NextActitvityCommon} />


                    <Route  path={'/sales/'} component={Sales} />

                    <Route name="salesteam_list" path={'/salesteams/list/'} component={SalesteamList}  />
                    <Route name="salesteam_add" path={'/salesteams/add/'}   component={SalesteamAdd}  />
                    <Route name="salesteam_view" path={'/salesteams/view/:Id'}   component={SalesteamView}  />
                    <Route name="salesteam_edit" path={'/salesteams/edit/:Id'}   component={SalesteamEdit}  />

                    <Route name="payment_list" path={'/payment/list/'} component={PaymentList}  />


                    <Route name="product_list" path={'/product/list/'} component={ProductList}  />
                    <Route name="product_add" path={'/product/add/'} component={ProductAdd}  />
                    <Route name="product_view" path={'/product/view/:Id'} component={ProductView}  />
                    <Route name="product_edit" path={'/product/edit/:Id'} component={ProductEdit}  />



                    <Route name="pricelist_list" path={'/pricelist/list/'} component={PricelistList}  />
                    <Route name="pricelist_add" path={'/pricelist/add/'} component={PricelistAdd}  />


                    <Route name="quatation_list" path={'/quotation/list/'} component={QuotationList}  />
                    <Route name="quatation_list" path={'/quotation/list/:Id'} component={QuotationList}  />
                    <Route name="quatation_add" path={'/quotation/add/'}   component={QuotationAdd}  />
                    <Route name="quatation_view" path={'/quotation/view/:Id'}   component={QuotationView}  />
                    <Route name="quatation_edit" path={'/quotation/edit/:Id'}   component={QuotationEdit}  />
                    <Route name="quatation_preview" path={'/quotation/preview/:Id/:previewtype'} component={QuotationPreview}  />


                    <Route name="salers_order_list" path={'/sales/order/list/'} component={SalesOrderList}  />
                    <Route name="salers_order_add" path={'/sales/order/add/'}   module_name="sales-order" component={SalesOrderAdd}  />
                    <Route name="salers_order_view" path={'/sales/order/view/:Id'}   component={SalesOrderView}  />
                    <Route name="salers_order_edit" path={'/sales/order/edit/:Id'}   component={SalesOrderEdit}  />
                    <Route name="salers_order_preview" path={'/sales/order/preview/:Id'}   component={SalesOrderPreview}  />


                    <Route name="quot_template_add" path={'/quot/template/add/'}   module_name="quotation-template" component={QuotTemplateAdd}  />
                    <Route name="quot_template_list" path={'/quot/template/list/'}   component={QuotTemplateList}  />
                    <Route name="quot_template_view" path={'/quot/template/view/:Id'}   component={QuotTemplateView}  />
                    <Route name="quot_template_edit" path={'/quot/template/edit/:Id'}   component={QuotTemplateEdit}  />

                    <Route name="email_template_add" path={'/email/template/add/'}   component={EmailTemplateAdd}  />
                    <Route name="email_template_list" path={'/email/template/list/'}   component={EmailTemplateList}  />
                    <Route name="email_template_edit" path={'/email/template/edit/:Id'}   component={EmailTemplateEdit}  />

                    <Route name="delivery_method_add" path={'/delivery/method/add/'}   component={DeliveryMethodAdd}  />
                    <Route name="delivery_method_list" path={'/delivery/method/list/'}   component={DeliveryMethodList}  />
                    <Route name="delivery_method_view" path={'/delivery/method/view/:Id'}   component={DeliveryMethodView}  />
                    <Route name="delivery_method_edit" path={'/delivery/method/edit/:Id'}   component={DeliveryMethodEdit}  />



                    <Route name="payment_term_add1" path={'/payment/term/add/'}   component={PaymentTermAdd1}  />
                    <Route name="payment_term_list" path={'/payment/term/list/'}   component={PaymentTermList}  />
                    <Route name="payment_term_view" path={'/payment/term/view/:Id'}   component={PaymentTermView}  />
                    <Route name="payment_term_edit" path={'/payment/term/edit/:Id'}   component={PaymentTermEdit}  />


                    <Route name="unit_of_measure_add" path={'/unit/of/measure/add/'}   component={UnitofMeasureAdd}  />
                    <Route name="unit_of_measure_list" path={'/unit/of/measure/list/'}   component={UnitofMeasureList}  />
                    <Route name="unit_of_measure_view" path={'/unit/of/measure/view/:Id'}   component={UnitofMeasureView}  />
                    <Route name="unit_of_measure_edit" path={'/unit/of/measure/edit/:Id'}   component={UnitofMeasureEdit}  />

                    <Route name="customer_invoice_add" path={'/customer/invoice/add/'}   component={CustomerInvoiceAdd} />
                    <Route name="customer_invoice_list" path={'/customer/invoice/list/'}   component={CustomerInvoiceList} />
                    <Route name="customer_invoice_view" path={'/customer/invoice/view/:Id'}   component={CustomerInvoiceView} />
                    <Route name="customer_invoice_edit" path={'/customer/invoice/edit/:Id'}   component={CustomerInvoiceEdit} />
                    <Route name="customer_invoice_listid" path={'/customer/invoice/customerlist/:Id'}   component={CustomerInvoiceListid} />
            </Router>
        );
    }
}
const RootedApp = root(state, App);
render(<RootedApp />, document.getElementById('app'));
