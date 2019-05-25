import React from 'react';
import {translate} from 'crm_react/common/language';
class  ProductHeader extends React.Component {
  render() {
    return (
          <thead>
              <tr>
                 <th>&nbsp;</th>
                 <th className="desc_width">{translate('product')}</th>
                 <th className="desc_width">{translate('description')}</th>
                 <th className="fieldwith">{translate('order_qty')}</th>
                 <th className="fieldwith">{translate('unit_of_measure')}</th>
                 <th className="fieldwith">{translate('unit_price')}</th>
                 <th className="fieldwith">{translate('taxes')}</th>
                 {this.props.module == 'quotation' ?
                     <th className="fieldwith">{translate('discount')} (%)</th>
                 : null
                 }
                 <th className="fieldwith subtotalright">{translate('subtotal')}</th>
              </tr>
          </thead>
    );
  }
}
module.exports = ProductHeader;

