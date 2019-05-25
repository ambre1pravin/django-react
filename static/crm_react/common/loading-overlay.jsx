import React from 'react';

class  LoadingOverlay extends React.Component {
        constructor(props) {
        super(props);
    }

    render() {
        return (
             this.props.processing ?
                <div id="overlay" className="page-loading">
                    <div id="text"><span className="fa fa-1x fa-spinner fa-spin"></span></div>
                </div>
             : null

        );
     }
}
module.exports = LoadingOverlay;

