/* Flying Notification */

$('body').append('<div id="flying-notification"></div>');
var notification = $('#flying-notification');

function show_notification(msg, type, time) {
    time = time || 5000;
    notification.text(msg).addClass(type).css({'left': ($(document).width()/2 - notification.outerWidth()/2)}).fadeIn(500, function() {
            notification.delay(time).fadeOut(800, function() { $(this).removeClass().text('').removeAttr('style');
        });
    });
}


/* set height of elements which required same height */

function set_height(ele1, ele2) {
    ele1.css('height', '');
    ele2.css('height', '');
    if(ele1.height() > ele2.height()) {
        ele2.height(ele1.height());
    } else {
        ele1.height(ele2.height());
    }
}


/* open the datepicker on click of calendar icon */

$('span.input-group-addon').click(function() {
    $(this).prev('input[data-provide="datepicker"]').datepicker('show');
});


/* modal */

function init_modal() {
    id = 'crm_modal-'+($('div.modal[role="dialog"]').length+1);
    var modal_html = '<div class="modal fade" id="'+ id +'" tabindex="-1" role="dialog" aria-labelledby="">';
    modal_html += '<div class="modal-dialog modal-sm" role="document">';
    modal_html += '<div class="modal-content"><div class="modal-header">';
    modal_html += '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title"></h4></div>';
    modal_html += '<div class="modal-body"></div><div class="modal-footer">';
    modal_html += '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button type="button" class="btn btn-primary">Save</button>';
    modal_html += '</div></div></div></div>';
    
    $('body').append(modal_html);   
    modal = $('#'+id);
    
    modal.on('show.bs.modal', function(e) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 5).addClass('modal-stack');
        }, 0);
    });
    
    modal.on('hidden.bs.modal', function(e) {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
        var ths_modal = $(this);
        ths_modal.removeClass().addClass('modal fade');
        ths_modal.find('div.modal-dialog').removeClass('modal-lg').addClass('modal-sm');
        ths_modal.attr('aria-labelledby', '');
        ths_modal.find('h4.modal-title, div.modal-body').text('');
        ths_modal.find('button.btn-primary').text('Save');
    });
    
    return modal;
}
var crm_modal = init_modal();

function show_modal(modal, options) {
    modal.addClass(options.class);
    modal.attr('aria-labelledby', options.title);
    modal.find('h4.modal-title').text(options.title);
    modal.find('div.modal-body').html(options.body);
    if(options.hasOwnProperty('size') && options.size != '') {
        if(options.size == 'large') {
            modal.find('div.modal-dialog').removeClass('modal-sm').addClass('modal-lg');
        }
    }
    if(options.hasOwnProperty('button') && options.button != '') {
        modal.find('button.btn-primary').text(options.button);
    }
    modal.modal('show');
}
function close_modal(modal) {
    modal = (modal == undefined) ? crm_modal : modal;
    modal.modal('hide');
}


/* autocomplete dropdown */

function create_autocomplete_li(obj, list) {      
    var attrs = '';
    $.each(obj, function(j, u) {
        u = (['', null].indexOf(u) == -1) ? u : '';
        attrs += (j != 'name' ) ? ' data-'+ j +'="'+ u +'"' : '';
    });
    $('<li'+ attrs +'>'+ obj.name +'</li>').insertBefore(list.find('li[data-action="create"]'));
}
function dropdown_autocomplete(ele, obj, total) {
    total = total || 10;
    var list = ele.find('ul.options-list');
    list.append('<li data-action="create"><em>Create</em></li>');
    list.append('<li data-action="create-edit"><em>Create and Edit</em></li>');
    
    $.each(obj, function(c) {
        create_autocomplete_li(this, list);                             
        if((c+1) == total) {
            return false;
        }
    });
    
    ele.find('input.form-control[data-toggle="dropdown"]').keyup(function() {
        if(!$(this).closest('dropdown').hasClass('open')) {
            $(this).closest('dropdown').addClass('open');
        }
        
        var ths = $(this),
            ths_txt = ths.val();
        list.find('li:not([data-action="create"], [data-action="create-edit"])').remove();
        if(ths_txt != '') {
            $.each(obj, function(i, v) {
                if(v.name.toLowerCase().indexOf(ths_txt.toLowerCase()) !== -1) {
                    create_autocomplete_li(this, list);
                }
            });
            list.find('li[data-action="create"] em').text('Create "'+ ths_txt +'"');
            list.find('li[data-action="create-edit"] em').text('Create and Edit "'+ ths_txt +'"');
        }
    });
}

$(document).on('click', 'div.form-group ul.options-list li:not([data-action="create"], [data-action="create-edit"])', function() {
    var my_input = $(this).closest('div.dropdown').find('input[data-toggle="dropdown"]');
    my_input.val($(this).text().trim());
    $.each(this.attributes, function() {
        my_input.attr(this.nodeName, this.nodeValue);
    });
    $.each($._data(my_input[0], 'events'), function() {
        if(this[0].type.indexOf('_crm') != -1) {
            my_input.trigger(this[0].type);
        }
    });
});

/* remove tag from tag-list */
$(document).on('click', 'ul.tagbox i.remove-icon-sprite', function() {
    $(this).closest('li').remove();
});





