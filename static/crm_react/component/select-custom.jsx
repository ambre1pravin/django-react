import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';

var SelectCustome = createClass({
	displayName: 'CreatableDemo',
	propTypes: {
		hint: PropTypes.string,
		label: PropTypes.string
	},
	getInitialState () {
		return {
			multi: true,
			multiValue: [],
			options: this.props.customer,
			value: undefined,
			recp :[]
		};
	},
	onChangeFunc (value) {
        const { multi } = this.state;
		let recp = this.state.recp;
        if (multi) {
			this.setState({multiValue: value});
			recp.push(value)
        }else {
           this.setState({value});
        }

		if(recp.length > 0) {
            this.props.set_recipients(recp)
        }
 	},
	return_recp(recp){

	},
	render () {
		const { multi, multiValue, options, value } = this.state;

		return (
			<div className="section">
				<Select.Creatable
					pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$"
					removeSelected={true}
					multi={multi}
                    placeholder ="Enter recipients email"
					options={options}
					onChange={this.onChangeFunc}
					value={multi ? multiValue : value}
					simpleValue={true}
				/>
			</div>
		);
	}
});

module.exports = SelectCustome;
