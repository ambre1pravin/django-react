import React from 'react';


class  DropDown extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            key : this.props.component_data.data_id,
            name : this.props.component_data.name ? this.props.component_data.name : '',
            field_id : this.props.component_data.data_id,
            field_type : this.props.component_data.type,
            display_position: this.props.component_data.display_position,
            select_value: this.props.component_data.input_value ? this.props.component_data.input_value : '',
            default_value :this.props.component_data.default_value.length > 0 ? this.props.component_data.default_value : [],
            open_class:'dropdown',
            display_options: this.props.component_data.default_value.length > 0 ? this.props.component_data.default_value: [],
            display_type: this.props.component_data.display_type  ? this.props.component_data.display_type: '',

        }
    }

    changesValue(index){
	    //alert(e.target.name)
        this.setState({select_value :index})
    }

    addClass(){
        this.setState({open_class: 'dropdown open'})
    }

    handleKeyPress(e){

        console.log(this.state.default_value.length)
        if(this.state.default_value.length > 0 && e.target.value.trim() !=''){
        let filterTags = [];
            this.state.default_value.map(function( index ) {
                 if(index.indexOf(e.target.value.trim()) !== -1 || index.toLowerCase().indexOf(e.target.value.trim()) !== -1){
                     filterTags.push(index);
                 }
            });
            console.log('tag:: '+filterTags)
             this.setState({display_options: filterTags,css_change:'dropdown  open'});
        }else{
            this.setState({display_options: this.state.default_value,css_change:'dropdown open'});
        }

        this.setState({
            select_value:e.target.value

        });
    }
  render() {
        //alert(this.props.component_data.display_type)
    return (
        <tr key={this.state.field_id}>
            <td>
                <label className="control-label">
                    {this.state.name}
                </label>
            </td>
            <td>
            {
            (this.state.display_type ==='view') ?
                <div  className="form-group" data-id={this.state.field_id }  data-type={this.state.field_type} >
                    {this.state.select_value}
                </div>
            :
            <div className="form-group" data-name={this.state.name} data-id={this.state.field_id}  data-type={this.state.field_type} data-position={this.state.display_position}>
                <div className={this.state.open_class}>
                        <input type="text"  onChange={this.handleKeyPress.bind(this)}
                               onKeyUp={this.handleKeyPress.bind(this)} value={this.state.select_value}
                               placeholder={this.state.name + '...'} className="form-control" data-toggle="dropdown"
                               name={this.state.name} />
                    <span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown" >
                        <i className="fa fa-angle-down black"></i>
                    </span>
                    <div className="dd-options">
                        <ul className="options-list">
                        {
                            this.state.display_options.length > 0 ?
                                this.state.display_options.map((opt, i) =>{
                                    return <li key={i} onClick={this.changesValue.bind(this,opt)}>{opt}</li>
                                })
                            :null
                        }
                        </ul>
                    </div>
                    </div>
                </div>
            }
            </td>
        </tr>
    );
  }
}
module.exports = DropDown;

