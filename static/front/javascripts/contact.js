
    function prepare_form_data(form_id,form_contact_type){
       
        var form_object = $('#'+form_id);
        //console.log(form_contact_type)
        
        var contact_company = form_object.find('input[name="name"]').val(),
            profile_image = (form_object.find('#hidden_profile_image').val()!==undefined) ? form_object.find('#hidden_profile_image').val() : $("#subcontact_hidden_profile_image").val(),
            contact = {},
            subcontacts =[],
            fields = (form_object.find('input[name="all_fields"]').val()=== undefined) ? [] : JSON.parse(form_object.find('input[name="all_fields"]').val()),
            contact_compay_id = form_object.find('input[name="company"]').attr('data-id');
        
        contact.profile_image = profile_image;
        contact.name = form_object.find('input[name="name"]').val();
        contact.contact_type = form_contact_type;
        
        contact.contact_company = ( form_contact_type ==='company') ? '' : ( contact_compay_id !== undefined) ? contact_compay_id  : 0;
       
        contact.fields = fields; 
        contact.subcontacts = subcontacts;

        form_object.find('div.form-group').each(function() {
            var ths = $(this),
                data_id = ths.attr('data-id');
                if(data_id !== undefined && data_id !==''){
                    var type    = ths.attr('data-type'),
                        name    = ths.attr('data-name').toLowerCase().replace(" ", "-");

                    if( type === 'single-line' || type === 'phone' || type === 'drop-down' || type === 'date' ){
                        //if(data_id !== undefined && data_id !==''){
                            var field = {
                                "field_id":     data_id,
                                "field_value":  ths.find('input').val(),
                                "field_type":   type,
                                "field_name":   name
                            };  
                         contact.fields.push(field);
                        //}
                    }

                    if( type === 'multiselect'){
                        var tags = [];
                        if(ths.find('ul.tagbox li').length > 0){
                            $.each(ths.find('ul.tagbox li'), function(t, li){
                                tags.push($(this).attr('data-id'));
                            });
                        }    
                        var field = {
                            "field_id":     data_id,
                            "field_value":  (tags.length > 0) ? tags.join(",") : '',
                            "field_type":   type,
                            "field_name":   name
                        };
                        contact.fields.push(field);   
                    }
                    if( type === 'multi-line' ){
                        var field = {
                            "field_id":     data_id,
                            "field_value":  ths.find('textarea').val(),
                            "field_type":   type,
                            "field_name":   name
                        };
                        contact.fields.push(field);                                 
                    }
                    if( type === 'radio' ){
                       var radio_list =[];
                        $.each(ths.find('input[type="radio"]'), function(){
                            var r_this = $(this);
                            if(r_this.is(":checked")){
                                radio_list.push(r_this.val());
                            }
                        });
                         var field = {
                            "field_id":     ths.closest('div.form-group').attr('data-id'),
                            "field_value":  (radio_list.length > 0) ? radio_list.join(",") : '',//JSON.stringify(checkbox_list),
                            "field_type":   type,
                            "field_name":   name
                        };
                        contact.fields.push(field);
                    }        
                    if( type === 'checkbox'){
                       var checkbox_list =[];
                        $.each(ths.find('input[type="checkbox"]'), function(){
                            var c_this = $(this);
                            if(c_this.is(":checked")){
                                checkbox_list.push(c_this.val());
                            }
                        });
                        var field = {
                            "field_id":     ths.closest('div.form-group').attr('data-id'),
                            "field_value":  (checkbox_list.length > 0) ? checkbox_list.join(",") : '',//JSON.stringify(checkbox_list),
                            "field_type":   type,
                            "field_name":   name
                        };
                        contact.fields.push(field);                                 
                    }        
                    //contact.fields.push(field);
            }
        });
        //console.log(contact);
        return contact;
    }
    function sub_contact_model(all_fields, form_data){
        form_data = form_data || undefined;
        
        //console.log(all_fields)
        var other_fields = [],
            sub_contact_html ='',
            contact_name = (form_data !== undefined) ? form_data.name : '';
        $.each(all_fields, function(id, fields){
            var left = fields.left_fields !== undefined ? fields.left_fields : fields.leftFields
            var right = fields.right_fields !== undefined ? fields.right_fields : fields.rightFields
            
            if(fields.is_default_tab === 1 && fields.is_default_tab !==null){
                sub_contact_html +='<form id="sub_contact_model_form" class="edit-form">';
                var avtar_sprite =  get_new_sprite($('#sub-contacts div.col-xs-6.col-sm-3.col-lg-3.col-md-3'));
                sub_contact_html +='<div class="tab-pane active"><div class="tab-content"><div class="row">';
                sub_contact_html +='<div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 border-right">';
                sub_contact_html +='<table class="detail_table">';
                sub_contact_html +='<tbody>';
                sub_contact_html +='<tr>';
                sub_contact_html +='<td rowspan="2">';
                sub_contact_html +='<div class="edit-profile">';
                sub_contact_html +='<div class="avtar-cir big custom_profile_image" data-index="sub_contact_form" data-color="'+avtar_sprite.replace('-Avtar-icon-sprite','')+'"><i class="'+avtar_sprite+'" ></i></div>';
                sub_contact_html +='<img width="82" height="82" class="img-circle custom_profile_image hidden" data-index="sub_contact_form" id="popup_u_image" src="'+base_static_url +'images/profile.png">';
                sub_contact_html +='<input type="hidden" autocomplete="off" value="'+avtar_sprite.replace('-Avtar-icon-sprite','')+'" id="subcontact_hidden_profile_image">';
                sub_contact_html +='<span class="fa fa-pencil edit"></span>';
                sub_contact_html +='</div>';
                sub_contact_html +='</td>';
                sub_contact_html +='<td>';
                sub_contact_html +='<div class="form-group">';
                sub_contact_html +='<input type="text" class="edit-input form-control" required="required" name="name" id="name" value="'+contact_name+'">';
                sub_contact_html +='</div>';
                sub_contact_html +='</td>';
                sub_contact_html +='</tr>';
                sub_contact_html +='<tr><td style="display: none;"> <input type="text" autocomplete="off" name="company" class="form-control valid" value=""></td></tr>';
                sub_contact_html += sub_contact_modal_fields(left);
                sub_contact_html +='</tbody>';
                sub_contact_html +='</table>';
                sub_contact_html +='</div>';
                sub_contact_html +='<div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">';
                sub_contact_html +='<table class="detail_table">';
                sub_contact_html +='<tbody>';
                sub_contact_html += sub_contact_modal_fields(right);
                sub_contact_html +='</tbody>';
                sub_contact_html +='</table>';
                sub_contact_html +='</div>';
                sub_contact_html +='</div></div></div>';
                sub_contact_html +="<input type='hidden' name='all_fields' value='__other_fields__'></form>";
            }else{
                $.each([left,right], function(i,fields){
                    $.each(fields, function(j,f){
                        var field = {
                            "field_id": f.id,
                            "field_value": '',
                            "field_type":f.type,
                            "field_name":f.name
                        };
                    other_fields.push(field);
                    });
                });
            }
        });
        return sub_contact_html.replace('__other_fields__', JSON.stringify(other_fields));
    }
     function sub_contact_modal_fields(fields){
         //console.log(fields)
        var sub_contact_html='';
        
         $.each(fields, function(idx, rec){ 
             var required_star = '',
                required = '',
                field_name = rec.name.toLowerCase().replace(" ", "-");
             if(rec.isRequired===1){
                required_star = ' * ';
                required =  'required = "required"';
             }
                sub_contact_html +='<tr>';
                sub_contact_html +='<td>';
                sub_contact_html +='<label class="text-muted control-label">'+rec.label+required_star+'</label>';
                sub_contact_html +='</td>';
                sub_contact_html +='<td>';
                sub_contact_html +='<div class="form-group" data-id="'+rec.id+'" data-type="'+rec.type+'" data-name="'+field_name+'">';
                
               if(rec.type === 'single-line' || rec.type === 'phone'){
                    sub_contact_html +='<input type="text"  value="" name="'+field_name+'" class="form-control" '+required+'>';
                }else if( rec.type === 'multi-line' ){
                    sub_contact_html +='<textarea class="form-control" rows="10"  type="textarea" name="'+field_name+'"></textarea>';                                
                }else if( rec.type === 'multiselect' ){                                                  
                    sub_contact_html +='<ul class="tagbox" id="main_form_tagbox"></ul>';
                    sub_contact_html +='<div class="dropdown autocomplete">';
                    sub_contact_html +='<input type="text"  data-toggle="dropdown"  class="form-control"  id="main_form_tags" name="'+field_name+'" value="" />';
                    sub_contact_html +='<span data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="fa fa-angle-down black" id="main_form_tags_down_icon"></i></span>';
                    sub_contact_html +='<div class="dd-options">';
                    sub_contact_html +='<ul class="options-list"></ul>';
                    sub_contact_html +='</div>';
                    sub_contact_html +='</div>';
                    sub_contact_html +='</div> ';
                }else if( rec.type === 'checkbox' ){ 
                    var temp = new Array();
                    var temparray = rec.defaultValues.split(","); 
                    sub_contact_html +='<ul class="list-inline">';
                    for( var i =0; i < temparray.length ; i++ ){
                        sub_contact_html +='<li>';
                        sub_contact_html +='<div class="checkbox">';
                        sub_contact_html +='<input id="checkbox_'+i+'" name ="'+field_name+'" type="checkbox" data-id="" value=""  >';
                        sub_contact_html +='<label for="checkbox_'+i+'">'+temparray[i]+'</label>';
                        sub_contact_html +='</div>';
                        sub_contact_html +='</li>';
                    }
                    sub_contact_html +='</ul>';
                }else if( rec.type === 'radio' ){ 
                    sub_contact_html +='<div class="form-group" data-id="'+rec.id+'">';
                }else if( rec.type === 'date' ){ 
                    sub_contact_html +='<div class="input-group date">';
                    sub_contact_html +='<input type="text" name="expecting-closing" value="" data-date-format="dd/mm/yyyy" class="form-control" data-provide="datepicker">';
                    sub_contact_html +='<span class="input-group-addon"> <i class="cal-icon-sprite inline"></i> </span>'; 
                    sub_contact_html +='</div>'; 
                }else if(rec.type === 'drop-down'){
                    var temp = new Array();
                    var temparray = rec.defaultValues.split(","); 
                    var text_string = temparray[0].charAt(0).toUpperCase() + temparray[0].slice(1);

                    sub_contact_html +='<div class="dropdown">';
                    sub_contact_html +='<input type="text"  value="'+text_string+'" class="form-control valid" data-toggle="dropdown" name="'+field_name+'">';
                    sub_contact_html +='<span aria-expanded="false" aria-haspopup="true" role="button" data-toggle="dropdown"><i class="fa fa-angle-down black"></i></span>';
                    sub_contact_html +='<div class="dd-options">';
                    sub_contact_html +='<ul class="options-list">';
                    for( var i =0; i < temparray.length ; i++ ){
                        sub_contact_html +='<li>'+temparray[i]+'</li>';
                    }
                    sub_contact_html +='</ul>';
                    sub_contact_html +='</div>';
                    sub_contact_html +='</div>';
                }
                sub_contact_html +='</div>';
                sub_contact_html +='</div></td>';
                sub_contact_html +='</tr>';
        });
        return sub_contact_html;
       
    }
    
function prepare_field_data(contact_initial_data,data){
    var contact = {},
        fields =[];
    contact.name = contact_initial_data.name;
    contact.contact_type = contact_initial_data.type;
    contact.contact_company ='';
    contact.profile_image = '';
    contact.fields = fields;
    $.each(data, function (i,element){
        var left,right;
        left = element.left_fields !== undefined ? element.left_fields : element.leftFields
        right = element.right_fields !== undefined ? element.right_fields : element.rightFields
        $.each(left,function(j, ele){
            var field = {
                "field_id":     ele.id,
                "field_value":   '',
                "field_type":   ele.type
            };
            contact.fields.push(field);
        });
        $.each(right,function(j, ele){
            //console.log(ele.id)
            var field = {
                "field_id":     ele.id,
                "field_value":   '',
                "field_type":   ele.type
            };
            contact.fields.push(field);
        });        
    });
    return contact;
}
    //#uimage,#popup_u_image  
    $('body').on('click', '.custom_profile_image', function () {
        $('#file_upload_action_from').val($(this).attr('data-index'));
        $('#ufile').click();
    });
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
               // $('#uimage').attr('src', e.target.result).width(150).height(200);
            };
            reader.readAsDataURL(input.files[0]);
        }
    
        $("#avatar_form").submit();  // Submits the form on change event, you consider this code as the start point of your request (to show loader)
        $("#uploader_iframe").unbind().load(function() {  // This block of code will execute when the response is sent from the server.
            var result = JSON.parse($(this).contents().text());  // Content of the iframe will be the response sent from the server. Parse the response as the JSON object
            if(result.success =='true' || result.success==true){
                if(result.retrun.file_upload_action_from === 'main_form'){
                    $("#uimage").prev('div.custom_profile_image').addClass('hidden');
                    $("#uimage").attr("src", result.retrun.file_full_path).removeClass('hidden'); 
                    $("#hidden_profile_image").val(result.retrun.file_name);
                    
                }else if(result.retrun.file_upload_action_from === 'sub_contact_form'){
                    $("#popup_u_image").prev('div.custom_profile_image').addClass('hidden');
                    $("#popup_u_image").attr("src", result.retrun.file_full_path).removeClass('hidden'); 
                    $("#subcontact_hidden_profile_image").val(result.retrun.file_name);
                }else{
                    $("#hidden_profile_image").val('');
                    $("#subcontact_hidden_profile_image").val('');
                }
            }else{
                $("#uimage").attr("src", '/images/image3.png'); 
                $("#hidden_profile_image").val('');
                $("#subcontact_hidden_profile_image").val('');
            }
        });
    } 

    
    

