import React from 'react';

class  TopLoadingIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<span>
              {
                  this.props.processing ?
                    <span className="fa fa-2x fa-spinner fa-spin"></span>
                  :null
              }
            </span>
        );
     }
}
module.exports = TopLoadingIcon;

