import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import Select from 'react-select';
import fetch from 'isomorphic-fetch';
import {getCookie } from 'crm_react/common/helper';


const SelectOption = createClass({
	propTypes: {
		label: PropTypes.string,
	},
	getInitialState () {
		return {
			backspaceRemoves: true,
			multi: true,
			creatable: false,
		};
	},
	onChange (value) {
		this.setState({value: value});
		this.props.set_recipients(value)
	},
	switchToMulti () {
		this.setState({
			multi: true,
			value: [this.state.value],
		});
	},
	switchToSingle () {
		this.setState({
			multi: false,
			value: this.state.value ? this.state.value[0] : null
		});
	},

	getUsers (input) {
		var csrftoken = getCookie('csrftoken');
		if (!input) {
			return Promise.resolve({ options: [] });
		}
		return fetch('/get_recipient/', {
		  method: "POST",
		  body: input,
		  headers: {
			"Content-Type": "application/json",
			 "csrfmiddlewaretoken": csrftoken
		  },
		  credentials: "same-origin"
		}).then((response) => response.json() ).then((json) => {
			return { options: json.result };
		});
	},

	gotoUser (value, event) {
		window.open(value.html_url);
	},
	toggleBackspaceRemoves () {
		this.setState({
			backspaceRemoves: !this.state.backspaceRemoves
		});
	},
	toggleCreatable () {
		this.setState({
			creatable: !this.state.creatable
		});
	},
	render () {
		const AsyncComponent = this.state.creatable
			? Select.AsyncCreatable
			: Select.Async;

		return (
			<div className="section">
				<AsyncComponent
					multi={this.state.multi}
					value={this.state.value}
					onChange={this.onChange}
					onValueClick={this.gotoUser}
					placeholder ="Enter contact name"
					valueKey="id" labelKey="login"
					loadOptions={this.getUsers}
					backspaceRemoves={this.state.backspaceRemoves}
				/>
			</div>
		);
	}
});

module.exports = SelectOption;
