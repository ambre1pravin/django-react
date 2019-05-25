import React from 'react';
import ReactDOM from 'react-dom';
import DjangoCSRFToken from 'django-react-csrftoken'
import state, {RELATIVE_URL,BASE_FULL_URL,IMAGE_PATH} from 'crm_react/common/state';

class  ImgUpload extends React.Component {

    /*uploadFile: function (e) {
        var fd = new FormData();
        fd.append('file', this.refs.file.getDOMNode().files[0]);

        $.ajax({
            url: 'http://localhost:51218/api/Values/UploadFile',
            data: fd,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data){
                alert(data);
            }
        });
        e.preventDefault()
    }*/
    constructor(props) {
        super(props);
        this.state = {
            value: '',
        }

    }




    handleFileOnChange(){
         $("#message_file_upload_from").submit();
         $("#message_file_uploader").unbind().load(function() {  // This block of code will execute when the response is sent from the server.
           var result =  JSON.parse($("#message_file_uploader").contents().text());
           alert(result.success)
           //var files = this.state.attachements;
          // console.log(result)
            if(result.success === 'true' || result.success === true){
                //console.log(result.return_value.file_full_path)
                //var attachements = {
                //    'file_name':result.fileName,
                //    'file_path':result.path
                //}
               // files.push(attachements);
                //this.setState({ main_conatact_profile_image : result.return_value.file_full_path})
            }
        }.bind(this));
    }

    render() {
        return (
            <span className="hidden">
                <div className="o_hidden_input_file ">
                    <form id="message_file_upload_from" target="message_file_uploader" action={BASE_FULL_URL + '/contact/upload/'} method="post" encType='multipart/form-data' className="o_form_binary_form">
                        <input type="file" name="ufile" id="message_attatchment_file" className="o_form_input_file" onChange={this.handleFileOnChange.bind(this)} />
                        <DjangoCSRFToken/>
                    </form>
                    <iframe name="message_file_uploader" id="message_file_uploader" className="hidden"></iframe>
                </div>
            </span>
        );
    }
}

module.exports = ImgUpload;