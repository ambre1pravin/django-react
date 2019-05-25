import React from 'react';
import {translate} from 'crm_react/common/language';
class ProductTabs extends React.Component {

    handle_tab_click(tab_name) {
        this.props.handle_tab_click(tab_name)
    }

    render() {
        return (
            <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
                {this.props.handle_tab_click != undefined ?
                    <li role="presentation" className="active" onClick={this.handle_tab_click.bind(this, 'order')}>
                        <a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab"
                           aria-expanded="false">{translate('order_lines')}</a>
                    </li>
                    :
                    <li role="presentation" className="active" >
                        <a href="#field-tab-1" aria-controls="field-tab-1" role="tab" data-toggle="tab"
                           aria-expanded="false">{translate('order_lines')}</a>
                    </li>
                }
                {this.props.handle_tab_click != undefined && this.props.module == 'quotation' ?
                    <li role="presentation" onClick={this.handle_tab_click.bind(this, 'optional')}>
                        <a href="#field-tab-2" aria-controls="field-tab-2" role="tab"
                           data-toggle="tab">{translate('optional_product')}</a>
                    </li>
                    :
                    this.props.module == 'quotation' ?
                    <li role="presentation">
                        <a href="#field-tab-2" aria-controls="field-tab-2" role="tab"
                           data-toggle="tab">{translate('optional_product')}</a>
                    </li>
                    :null

                }
                { this.props.module == 'quotation' ?
                    <li role="presentation">
                        <a href="#field-tab-3" aria-controls="field-tab-3" role="tab"
                           data-toggle="tab">{translate('extra_options')}</a>
                    </li>
                  :null
                }
            </ul>
        );
    }
}
module.exports = ProductTabs;

