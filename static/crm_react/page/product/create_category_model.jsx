import React from 'react';
import state, {MACHINE_DEFAULT_DATA,BASE_FULL_URL} from 'crm_react/common/state';

import Dropdown from 'crm_react/component/Dropdown'; 
import {translate} from 'crm_react/common/language';
import { Modal, ModalManager, Effect} from 'crm_react/component/custom_modal';
import { modal_style, ModalbodyStyle, getCookie} from 'crm_react/common/helper';

class  CreateCategoryModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = ({
            category_id: 0,
            category_name: '',
            parent_id: '',
            parent_name: '',
            title: 'Category',
            list_cate_modal_is_open: false,
        })
    }


    componentDidMount() {
        var id = this.props.id;
        var input_value = this.props.input_value;
        var model_id = this.props.model_id;
        this.openModalWithData(id, input_value, model_id)
    }

    openModalWithData(id, input_value, model_id) {
        if (id != 0 && id > 0) {
            $.ajax({
                type: "POST",
                cache: false,
                url: '/product/categorydataByid/' + id,
                data: {
                    ajax: true,
                    csrfmiddlewaretoken: getCookie('csrftoken')
                },
                beforeSend: function () {
                },
                success: function (data) {
                    if (data.success === true) {
                        this.setState({
                            category_id: id,
                            category_name: data.category_name,
                            parent_id: data.parent_id,
                            parent_name: data.parent_name,
                            title: "Edit : Product Category",
                        })
                        $(model_id).modal('show');
                    }
                }.bind(this)
            });
        }else if (id == 0) {
            this.setState({category_name: input_value, title: "Create : Product Category",});
            $(model_id).modal('show');
        }
    }

    handleChange(e) {
        let input_value = e.target.value;
        this.setState({category_name: input_value})
    }

    handleSubmit() {

        var Data = $('#pro_cate_form').serializeArray();
        $.ajax({
            type: "POST",
            cache: false,
            url: '/product/categorysave/',
            data: {
                ajax: true,
                fields: JSON.stringify(Data),
                csrfmiddlewaretoken: getCookie('csrftoken')
            },
            beforeSend: function () {
            },
            success: function (data) {
                if (data.success == true) {
                    $('#product_cate_Model').modal('hide');
                    this.setState({
                        category_id: 0,
                        category_name: '',
                        parent_id: '',
                        parent_name: '',
                    });
                    this.props.handleClose()
                    this.props.setCreatedCategory(data.id, data.name)
                }
            }.bind(this)
        });
    }

    handleClose() {
        this.props.handleClose()
    }

    setSelectedCategory(id, name) {
        this.setState({
            parent_id: id,
            parent_name: name,
        })
    }

    handleViewCateList() {
        this.setState({list_cate_modal_is_open: true}, () => {
            this.refs.category_list_modal.openModalwithListCategory()
        })
    }

    handleCloseCateListModal() {
        this.setState({
            list_cate_modal_is_open: false
        })
    }


    render_header(title) {
        return (
            <div className="modal-header text-left">
                <button type="button" className="close" aria-label="Close" onClick={this.handleClose.bind(this)}><span
                    aria-hidden="true" className="close_style">&times;</span></button>
                <ul className="list-inline inline">
                    <li className="border-line">{this.state.title}</li>
                </ul>
            </div>
        );
    }


    render_footer() {
        return (
            <div className="modal-footer modal-text-left">
                <button type="button" id="submituser" className="btn btn-primary"
                        onClick={this.handleSubmit.bind(this)}>{translate('save')}
                </button>
                <button type="button" id="delete_close" className="btn btn-default"
                        onClick={this.handleClose.bind(this)}>{translate('close')}
                </button>
            </div>
        );
    }

    render_body() {
        return (
            <form id="pro_cate_form" className="edit-form" action="" method="POST">
                <div className="panel-body">
                    <div className="row">
                        <div className="col-xs-11 col-sm-10 col-md-11 col-lg-11 " id="category">
                            <label htmlFor="category-name">{translate('category_name')} </label>
                            <h3 className="category-name">
                                <input type="text" id="category_name" className="capsname"
                                       onChange={this.handleChange.bind(this)} value={this.state.category_name}
                                       name="category_name" placeholder={translate('category_name')}/>
                            </h3>
                        </div>
                        <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12  " id="category-type">
                            <h4>{translate('category_type')}</h4>
                            <div className="col-xs-12 col-sm-12 col-md-6 col-lg-6  ">
                                <table className="detail_table">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <label className="text-muted control-label">{translate('parent_category')}</label>
                                            </td>
                                            <td>
                                                { this.props.json_data ?
                                                    <Dropdown inputname='parent_category'
                                                              json_data={this.props.json_data}
                                                              input_value={this.state.parent_name}
                                                              input_id={this.state.parent_id}
                                                              setSelected={this.setSelectedCategory.bind(this)}
                                                              handleViewCateList={this.handleViewCateList.bind(this)}
                                                              attr_id='parent_category'/>
                                                    : null
                                                }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <input type="hidden" name="category_id" value={this.state.category_id}/>
            </form>
        )
    }

    render() {
        return (
            <div>
                <Modal
                    style={modal_style}
                    onRequestClose={() => true}
                    effect={Effect.Fall}>
                    <div className="modal-dialog  modal-lg in">
                        <div className="modal-content">
                            { this.render_header() }
                            <div className="modal-body" style={ModalbodyStyle}>
                                { this.render_body() }
                            </div>
                            { this.render_footer() }
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}
module.exports = CreateCategoryModel;