import React from 'react';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css'; // ES6

class CustomEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorHtml: this.props.editor_txt,
            modules: {
                toolbar: {
                    container: "#"+this.props.toolbar_id,
                    handlers: {
                        "insertFirstName": function () {
                            this.quill.insertText(this.quill.getSelection().index, "[FirstName]");
                        },
                        "insertLastName": function () {
                            this.quill.insertText(this.quill.getSelection().index, "[LastName]");
                        },
                        "insertCompanyName": function () {
                            this.quill.insertText(this.quill.getSelection().index, "[CompanyName]");
                        },
                        "insertQname": function () {
                            this.quill.insertText(this.quill.getSelection().index, "[qname]");
                        },
                        "insertTamount": function () {
                            this.quill.insertText(this.quill.getSelection().index, "[tamount]");
                        },
                        "insertUrl": function () {
                            this.quill.insertText(this.quill.getSelection().index, "[url]");
                        },
                        "insertDueDate": function () {
                            this.quill.insertText(this.quill.getSelection().index, "[duedate]");
                        },                    },
                },
            }
        };
        this.handleChange = this.handleChange.bind(this)
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.editor_txt !== prevProps.editor_txt) {
            this.setState({editorHtml: this.props.editor_txt});
        }
    }

    handleChange(html) {
        this.setState({editorHtml: html});
        this.props.get_editor_txt(html);
    }

    insertCustomer() {
        const cursorPosition = this.quill.getSelection().index;
        this.quill.insertText(cursorPosition, "[customer]");
        this.quill.setSelection(cursorPosition + 25);
    }

    render_first_name_button(){
        return(
            <span>[FirstName]<span className="fa fa-clipboard push-left-2"></span></span>
        );
    }
    render_last_name_button(){
        return(
            <span>[LastName]<span className="fa fa-clipboard push-left-2"></span></span>
        );
    }
    render_company_name_button(){
        return(
            <span>[CompanyName]<span className="fa fa-clipboard push-left-2"></span></span>
        );
    }

    render_quotation_button(){
        return(
            <span>[qname]<span className="fa fa-clipboard push-left-2"></span></span>
       );
    }

    render_total_amount_button(){
        return(
            <span>[tamount]<span className="fa fa-clipboard push-left-2"></span></span>
       );
    }

    render_url_button(){
        return(
            <span>[url]<span className="fa fa-clipboard push-left-2"></span></span>
       );
    }

    render_duedate_button(){
        return(
            <span>[duedate]<span className="fa fa-clipboard push-left-2"></span></span>
       );
    }

    render_toolbaar() {
        return (
            <div id={this.props.toolbar_id}>
                {this.props.use_custom_button ?
                <select className="ql-font" defaultValue={"serif"} onChange={e => e.persist()}>
                    <option value="serif"></option>
                    <option value="monospace"></option>
                    <option selected></option>
                </select>
                :null
                }
                {this.props.use_custom_button ?
                <select className="ql-header" defaultValue={"3"} onChange={e => e.persist()}>
                    <option value="1"></option>
                    <option value="2"></option>
                    <option value="3" selected="selected"></option>
                </select>
                :null
                }
                <button className="ql-bold"></button>
                <button className="ql-italic"></button>
                {this.props.use_custom_button ?

                <select className="ql-color">
                    <option value="red"></option>
                    <option value="green"></option>
                    <option value="blue"></option>
                    <option value="orange"></option>
                    <option value="violet"></option>
                    <option value="#d0d1d2"></option>
                </select>
                :null
                }
                <button type="button" className="ql-list" value="ordered">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="7" x2="15" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="7" x2="15" y1="9" y2="9"></line>
                        <line className="ql-stroke" x1="7" x2="15" y1="14" y2="14"></line>
                        <line className="ql-stroke ql-thin" x1="2.5" x2="4.5" y1="5.5" y2="5.5"></line>
                        <path className="ql-fill"
                              d="M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z"></path>
                        <path className="ql-stroke ql-thin"
                              d="M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156"></path>
                        <path className="ql-stroke ql-thin"
                              d="M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109"></path>
                    </svg>
                </button>
                <button type="button" className="ql-list " value="bullet">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="6" x2="15" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="6" x2="15" y1="9" y2="9"></line>
                        <line className="ql-stroke" x1="6" x2="15" y1="14" y2="14"></line>
                        <line className="ql-stroke" x1="3" x2="3" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="3" x2="3" y1="9" y2="9"></line>
                        <line className="ql-stroke" x1="3" x2="3" y1="14" y2="14"></line>
                    </svg>
                </button>
                <button type="button" className="ql-indent" value="-1">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="3" x2="15" y1="14" y2="14"></line>
                        <line className="ql-stroke" x1="3" x2="15" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="9" x2="15" y1="9" y2="9"></line>
                        <polyline className="ql-stroke" points="5 7 5 11 3 9 5 7"></polyline>
                    </svg>
                </button>
                <button type="button" className="ql-indent" value="+1">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="3" x2="15" y1="14" y2="14"></line>
                        <line className="ql-stroke" x1="3" x2="15" y1="4" y2="4"></line>
                        <line className="ql-stroke" x1="9" x2="15" y1="9" y2="9"></line>
                        <polyline className="ql-fill ql-stroke" points="3 7 3 11 5 9 3 7"></polyline>
                    </svg></button>
                {this.props.use_custom_button ?
                <button type="button" className="ql-link">
                    <svg viewBox="0 0 18 18">
                        <line className="ql-stroke" x1="7" x2="11" y1="7" y2="11"></line>
                        <path className="ql-even ql-stroke" d="M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z"></path>
                        <path className="ql-even ql-stroke" d="M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z"></path>
                    </svg>
                </button>
                :null
                }
                {this.props.use_custom_button ?
                <button type="button" className="ql-image">
                    <svg viewBox="0 0 18 18">
                        <rect className="ql-stroke" height="10" width="12" x="3" y="4"></rect>
                        <circle className="ql-fill" cx="6" cy="7" r="1"></circle>
                        <polyline className="ql-even ql-fill" points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"></polyline>
                    </svg>
                </button>
                :null
                }
                    {this.props.use_custom_button ?
                    <button className="ql-insertFirstName btn btn-default" type="button" value="[FirstName]"
                            style={{'width': 'auto'}}>
                        {this.render_first_name_button() }
                    </button>
                    :null
                    }
                    {this.props.use_custom_button ?
                    <button className="ql-insertLastName btn btn-default" type="button" value="[LastLname]"
                            style={{'width': 'auto'}}>
                        {this.render_last_name_button() }
                    </button>
                    :null
                    }
                    {this.props.use_custom_button ?
                    <button className="ql-insertCompanyName btn btn-default" type="button" value="[CompanyName]"
                            style={{'width': 'auto'}}>
                        {this.render_company_name_button() }
                    </button>
                    :null
                    }
                    {this.props.module !== 'contact' && this.props.use_custom_button ?
                    <button className="ql-insertQname btn btn-default" type="button" value="[qname]"
                            style={{'width': 'auto'}}>
                        {this.render_quotation_button() }
                    </button>
                    :null
                    }
                    {this.props.module !== 'contact' && this.props.use_custom_button ?
                    <button className="ql-insertTamount btn btn-default" type="button" value="[qname]"
                            style={{'width': 'auto'}}>
                        {this.render_total_amount_button() }
                    </button>
                    :null
                    }
                    {this.props.module !== 'contact' && this.props.use_custom_button ?
                    <button className="ql-insertUrl btn btn-default" type="button" value="[qname]"
                            style={{'width': 'auto'}}>
                        {this.render_url_button() }
                    </button>
                    :null
                    }
                    {this.props.module !== 'contact' && this.props.use_custom_button ?
                    <button className="ql-insertDueDate btn btn-default" type="button" value="[duedate]"
                            style={{'width': 'auto'}}>
                        {this.render_duedate_button() }
                    </button>
                    :null
                    }
            </div>
        );
    }

    render() {
        //console.log("custome tool", this.props.editor_txt);
        return (
            <div className="text-editor">
                {this.render_toolbaar()}
                <ReactQuill
                    value={this.state.editorHtml}
                    onChange={this.handleChange}
                    placeholder={this.props.placeholder}
                    modules={this.state.modules}
                />
            </div>
        )
    }
}






/*
 * PropType validation
 */
CustomEditor.propTypes = {
    placeholder: React.PropTypes.string,
};

module.exports = CustomEditor;