String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
/* case-insensitive jQuery contains selector */
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});
$(document).on('click', 'a[href="#"]', function(e) {
    return false;
});

/* div.top-actions filters */

$(document).on('click', 'li[class*="selection"] .dropdown-menu', function(e) {
    e.stopPropagation();
});
$(document).on('click', 'li[class*="selection"] .dropdown-menu li', function() {
    var ths = $(this),
    single = ths.closest('li[class*="selection"]');
    if(ths.hasClass('selected')) {
        ths.removeClass('selected');
    } else {
        if(single.hasClass('selection__single')) {
            single.find('li').removeClass('selected');
        }
        ths.addClass('selected');
    }
});



/* Tooltip */
$('[data-toggle="tooltip"]').tooltip();

/* popup notification */
if($.notify) {
    $.notify.defaults( {showAnimation: 'fadeIn'} );
    $.notify.addStyle('crm', {
      html: "<div><span data-notify-text/></div>"
    });
    function notification(msg, type) {
        $.notify(msg, {
          style: 'crm',
          className: type
        });
    }
}

/* header notification */
function noti_mark_read(ele) {
    if(ele.originalEvent) {
        eles = $('div.notifications ul.dropdown-menu-right li.unread');
    } else {
        eles = ele.closest('li.unread');
    }
    $.each(eles, function() {
        var ths = $(this);
        ths.find('ul.noti-options a[data-action="mark-read"]').parent().addClass('disabled');
        ths.animate({backgroundColor:'#fff'}, 100, function() {
            $(this).removeClass('unread').removeAttr('style');
        });
    });
}
$('a.mark-all-read').click(noti_mark_read);
$(document).on('click', 'div.notifications li a', function(e) {
    e.stopPropagation();
});
$(document).on('click', 'div.notifications li a[role="button"]', function(e) {
    e.stopPropagation();
    var ths = $(this);
    if(ths.attr('aria-expanded') == 'true') {
        ths.attr('aria-expanded', 'false');
    } else {
        ths.attr('aria-expanded', 'true');
    }
    $(this).parent().toggleClass('open');
});
$('div.notifications.dropdown').on('show.bs.dropdown', function(e){
    $(this).find('> .dropdown-menu').stop(true, true).slideDown()
});
$('div.notifications.dropdown').on('hide.bs.dropdown', function(e){
    e.preventDefault();
    $(this).find('> .dropdown-menu').stop(true, true).slideUp(400, function() {
        $('div.notifications a[role="button"]').attr('aria-expanded', 'false');
        $('div.notifications.dropdown, div.notifications div.dropdown').removeClass('open');
    });
});
/* div.notifications ul.noti-options li:not(.disabled) a */

/* counter */
function counter(parent, cards, numbers, show) {
    if(typeof parent == 'string') {
        parent = $(parent);
    }
    $.each(parent, function() {
        var ths = $(this),
        total = 0,
        from = parseFloat(ths.find(show).text().replace(',', '')),
        to = 0;
        if(ths.find(cards).length) {
            $.each(ths.find(cards), function() {
                if($(this).find(numbers).text() != '') {
                    total += parseFloat($(this).find(numbers).text().replace(',', ''));
                }
            });
            to = total;
        }
        if(from != to) {
            count($(this).find(show), from, to);
        }
    });

}
function count(ele, from, to) {
    $({countNum: parseFloat(from)}).animate({countNum: parseFloat(to)}, {
      duration: 1000,
      easing:'linear',
      step: function() {
        ele.text(Math.floor(this.countNum));
      },
      complete: function() {
        var n = this.countNum.toString().split(".");
        n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        this.countNum = n.join(".");
        /*val = this.countNum;
        while (/(\d+)(\d{3})/.test(val.toString())) {
          val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
        }
        this.countNum = val;*/
        ele.text(this.countNum);
      }
    });
}

/* set height of elements which required same height */

var resize_set_height = [];
function set_height(ele1, ele2) {
    ele1.css('height', '');
    ele2.css('height', '');
    if(ele1.height() > ele2.height()) {
        ele2.height(ele1.height());
    } else {
        ele1.height(ele2.height());
    }
    if(!resize_set_height.hasOwnProperty(ele1.selector)) {
        $(window).resize(function() { set_height(ele1, ele2); });
        resize_set_height[ele1.selector] = true;
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
    modal_html += '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button><button type="button" class="btn btn-default btn-primary">Save</button>';
    modal_html += '</div></div></div></div>';

    $('body > div').append(modal_html);
    modal = $('#'+id);

    modal.on('show.bs.modal', function(e) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 5).addClass('modal-stack');
        }, 0);
    });

    modal.on('hidden.bs.modal', function(e) {
        $('.modal:visible').length && $(document.body).addClass('modal-open');//console.log(modal);
        var ths_modal = $(this);
        ths_modal.removeClass().addClass('modal fade');
        ths_modal.find('*').removeClass('hide');
        ths_modal.find('div.modal-header div.dropdown.pull-right').remove();
        ths_modal.find('div.modal-dialog').removeClass('modal-lg').addClass('modal-sm');
        ths_modal.attr('aria-labelledby', '');
        ths_modal.find('h4.modal-title, div.modal-body').text('');
        ths_modal.find('button.btn-default.btn-primary').text('Save');
        if(window.new_modal) {
            window[window.new_modal[0]](window.new_modal[1]);
            window.new_modal = undefined;
        }
    });

    return modal;
}
var crm_modal = init_modal();

function show_modal(modal, options) {
    modal.addClass(options.class);
    modal.attr('aria-labelledby', options.title);
    if(options.hasOwnProperty('extra') && options.extra.indexOf('no-title') != -1) {
        modal.find('h4.modal-title').addClass('hide');
    } else {
        modal.find('h4.modal-title').text(options.title);
    }
    if(options.hasOwnProperty('extra') && options.extra.indexOf('header-dropdown') != -1) {
        modal.find('div.modal-header button').addClass('hide');
        if(modal.find('div.modal-header div.dropdown').length == 0) {
            modal.find('div.modal-header').append('<div class="dropdown pull-right"><span id="event-popup-close" class="och-options" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><i class="fa fa-ellipsis-h" aria-hidden="true"></i></span><div class="dd-options" aria-labelledby="event-popup-close"><span>Select Option</span><ul class="options-list"><li data-action="edit">Edit</li><li data-action="delete">Delete</li><li data-action="close" data-dismiss="modal">Close</li></ul></div></div>');
        }
    }
    modal.find('div.modal-body').html(options.body);
    if(options.hasOwnProperty('size') && options.size != '') {
        if(options.size == 'large') {
            modal.find('div.modal-dialog').removeClass('modal-sm').addClass('modal-lg');
        }
    }
    if(options.hasOwnProperty('extra') && options.extra.indexOf('no-footer-buttons') != -1) {
        modal.find('div.modal-footer button').addClass('hide');
    }
    if(options.hasOwnProperty('button') && options.button != '') {
        modal.find('button.btn-default.btn-primary').text(options.button).addClass(options.button.replace(' ', '-').toLowerCase());
    }
    if(options.hasOwnProperty('extra') && options.extra.indexOf('footer-color-border') != -1) {
        modal.find('div.modal-footer').addClass('border-primary');
    }
    if(options.hasOwnProperty('buttons')) {
        $.each(options.buttons, function(i, b) {
            if(!modal.find('button.btn-primary.'+b.replace(' ', '-').toLowerCase()).length) {
                $('<button type="button" class="btn btn-primary '+b.replace(' ', '-').toLowerCase()+'">'+b+'</button>').insertBefore(modal.find('button.btn-primary'));
            }
        });
    }
    /*if(modal.attr('id') != 'crm_modal-1') {
        modal.modal({backdrop: false});
    }*/
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
        attrs += (j != 'name' ) ? (j.indexOf('_class') == 0) ? ' '+ j.replace('_', '') +'="tag-'+ u +'"' : ' data-'+ j.replace('_', '') +'="'+ u +'"' : '';
    });
    $('<li'+ attrs +'>'+ obj.name +'</li>').insertBefore(list.find('li[data-action="create"]'));
}
function dropdown_autocomplete(ele, obj, total, create) {
    total = typeof total !== 'undefined' ? total : 10;
    create = typeof create !== 'undefined' ? create : true;
    var list = ele.find('ul.options-list');

    list.append('<li data-action="create"><em>Create</em></li>');
    //list.append('<li data-action="create-edit"><em>Create and Edit</em></li>');

    $.each(obj, function(c) {
        create_autocomplete_li(this, list);
        if((c+1) == total) {
            return false;
        }
    });
    if(!create) {
        list.find('li[data-action="create"]').remove();
    }

    ele.find('input.form-control').keyup(function() {

        var ths = $(this),
            ths_txt = ths.val().trim();

        list.find('li:not([data-action="create"], [data-action="create-edit"])').addClass('hide');
        if(ths_txt != '') {
            list.find('li:contains("'+ths_txt+'")').removeClass('hide');
            list.find('li[data-action="create"] em').text('Create "'+ ths_txt +'"');
            //list.find('li[data-action="create-edit"] em').text('Create and Edit "'+ ths_txt +'"');
        } else {
            list.find('li:not([data-action="create"], [data-action="create-edit"])').removeClass('hide');
            list.find('li[data-action="create"] em').text('Create');
            //list.find('li[data-action="create-edit"] em').text('Create and Edit');
        }
    });
}



/* remove tag from tag-list */
$(document).on('click', 'ul.tagbox i.remove-icon-sprite', function() {
    var li = $(this).closest('li');
    li.closest('div.dropdown').find('.dropdown-menu li[data-id="'+li.attr('data-id')+'"]').removeClass('hide');
    li.remove();
});

$(window).resize(function() {
var main_nav = $('#main-nav ul.navbar-nav');
    if(main_nav.hasClass('active')) {
        if($(window).width() < 768) {
            main_nav.removeClass('active');
            push_pull('pull');
        }
        $('#crm-app > div.container-fluid > div.row').width($(window).width() - 58);
        $('#crm-app > div.container-fluid').width($(window).width() - 260);
    }
});

/* tasks */
var task_opt = 'all',
    chk_tsk_grp = undefined;

function check_task_grp(vis) {

    if(vis == undefined) {
        $.each($('div.mail-messages ul.timelines li'), function() {
            if(!$(this).find('div.media:visible').length) {
                $(this).fadeOut(100);
            }
        });
        clearTimeout(chk_tsk_grp);
    } else {
        if(task_opt == 'all') {
            $('div.mail-messages ul.timelines li').removeAttr('style');
        } else {
            $.each($('div.mail-messages ul.timelines li:not(:visible)'), function() {
                if(!$(this).find('div.media:visible').length) {
                    if(task_opt == 'complited' && $(this).find('div.media.done').length) {
                        $(this).show();
                    } else if(task_opt == 'incomplited' && $(this).find('div.media.undone').length) {
                        $(this).show();
                    }
                }
            });
        }
    }
}
$(document).on('click', 'div.mail-messages ul.timelines span.done-mark', function() {
    var msg = $(this).closest('.media'),
        rm_anim = setTimeout(function(){
            msg.removeClass('done-undone');
        }, 810);

    msg.addClass('done-undone');

    if(msg.hasClass('done')) {
        msg.removeClass('done').addClass('undone');
        if(task_opt == 'complited') {
            msg.fadeOut(300);
        }
    } else {
        msg.removeClass('undone').addClass('done');
        if(task_opt == 'incomplited') {
            msg.fadeOut(300);
        }
    }
    chk_tsk_grp = setTimeout(check_task_grp, 310);
});
$(document).on('click', 'div.mail-messages__options ul.dropdown-menu a[msg-option]', function() {
    task_opt = $(this).attr('msg-option');

    if(task_opt.indexOf('mark-all') == -1) {
        $(this).closest('ul').find('li').removeClass('selected');
        $(this).closest('li').addClass('selected');
    }
    check_task_grp('vis');
    if(task_opt == 'incomplited') {
        $('div.mail-messages ul.timelines .media.done:visible').fadeOut(300);
        $('div.mail-messages ul.timelines .media.undone:not(:visible)').fadeIn(300);
    } else if(task_opt == 'complited') {
        $('div.mail-messages ul.timelines .media.undone:visible').fadeOut(300);
        $('div.mail-messages ul.timelines .media.done:not(:visible)').fadeIn(300);
    } else if(task_opt == 'all') {
        $('div.mail-messages ul.timelines .media:not(:visible)').fadeIn(300);
    } else if(task_opt == 'mark-all-complited') {
        $('div.mail-messages ul.timelines .media.undone span.done-mark').trigger('click');
    } else if(task_opt == 'mark-all-incomplited') {
        $('div.mail-messages ul.timelines .media.done span.done-mark').trigger('click');
    }
    chk_tsk_grp = setTimeout(check_task_grp, 310);
});

/* main left nav plus icon click */
$(document).on('click', '#main-nav ul a i.fa-plus', function() {
    $(this).closest('a').blur();
    return false;
});

/* notification options */
$(document).on('click', 'div.notifications ul.noti-options li:not(.disabled) a', function(e) {
    var ths = $(this),
        action = ths.attr('data-action');

    if(action == 'mark-read') {     //
        noti_mark_read(ths);        // don't change this
    }                               // put other options in elseif
});


window.onbeforeunload = function(){
       window.localStorage.clear();
       window.sessionStorage.clear();
}

$(document).ready(function(){
 $(function() {
      $('.summernote').summernote({
        height: 200
      });
      $('form').on('submit', function (e) {
        e.preventDefault();
      });
    });

});

function loaddeleteload(id,url) {

           $.ajax({
            type: "POST",
            cache: false,
            url: url,
            data: {
              ajax: true,
              ids : JSON.stringify(id),
            },
            beforeSend: function () {
            },
            success: function (data) {
              if(data.success == true){

                 $('#deletetr_'+id+'').closest('tr').remove();
              }

            }.bind(this)
        });
}

function getFormattedDate(date){
  if(date=='' || date==null)
      return '';
  var date = new Date(date);
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return month + '/' + day + '/' + year;
}

function getFormattedDateTime(dateTime) {
  if(dateTime=='' || dateTime==null)
      return '';
  var date = new Date(dateTime);
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  var hour   = date.getHours().toString();
      hour   = hour.length>1 ? hour : '0' + hour;
  var minute = date.getMinutes().toString();
      minute = minute.length>1 ? minute : '0' + minute;
  var second = date.getSeconds().toString();
      second = second.length>1 ? second : '0' + second;
  return month + '/' + day + '/' + year+' '+ hour+':'+ minute+':'+second;
}

function load_img_action(){



}


    $('#myPopup').modal({
        backdrop: 'static',
        keyboard: false  // to prevent closing with Esc button (if you want this too)
    })
    $("body").click(function(){
         if($('#myPopup').hasClass('in')) {
           $('#myPopup').removeClass('in');
        }  $('#myPopup').toggle();
    });

    $(document).on('click', '.popup', function(e) {

        var popup = document.getElementById("myPopup");
        console.log(popup)
        popup.classList.toggle("in");
        $('#myPopup').toggle();


      if($('#myPopup').hasClass('in')) {

         $('#myPopup').toggle('destroy');
      } else {
           $('#myPopup').toggle();
      }
    });




    /*$(document).on('click', '#ufileimage', function(e) {
            $('input[name="ufile[]"]')[0].click();
    });*/

    $(document).on('click', '#ufileimage1', function(e) {
            $('input[name="ufile1[]"]')[0].click();
    });

    $(document).on('change', '#message_attatchment_file2', function (e){

                var total_file1=document.getElementById("message_attatchment_file2").files.length;
                 for(var i=0;i<total_file1;i++)
               {
                var form_data = new FormData();
                var file_data = event.target.files[i];
                form_data.append("ufile1", file_data);

                 $.ajax({
                    type: "POST",
                    cache: false,
                    url: '/quotation/upload_file1/',
                    data: form_data,
                    processData: false,
                    contentType: false,
                    beforeSend: function () {
                    },
                    success: function (data) {
                      if(data.success === true){
                        $('#loader-icon').show();
                        var extn = data.file_name.substring(data.file_name.lastIndexOf('.') + 1).toLowerCase();
                        if (extn == "gif" || extn == "png" || extn == "jpg" || extn == "jpeg") {

                           $("ul.intro1").addClass("tabs1").append('<li class="attached_file1" data-action-id = "'+data.file_name+'"><img class="iframes1" data-action-id = "'+data.file_name+'" style="width: 125px;height: 125px;" name="message_file_uploader1" id="message_file_uploader1" src="/media/email/' + data.file_name +'"><button class="btn btn-default delete_pdf1"><i class="fa fa-trash-o"></i></button></li>');
                         }
                         else
                         {

                           $("ul.intro1").addClass("tabs1").append( '<li class="attached_file1" style="width: 260px;" value= "'+data.file_name+'" data-action-id = "'+data.file_name+'"><a id="attachm" href="/media/email/' + data.file_name +'">'+data.file_name+'</a><button class="btn btn-default delete_pdf1"><i class="fa fa-trash-o"></i></button></li>' );
                         }

                        $('#loader-icon').hide();

                       }
                    }
                  });
                }
              });

     $(document).ready(function(){
      $('[data-toggle="tooltip"]').tooltip();
  });


  $(document).on('click', '.attached_file1 button', function (e){
    if ('li.attached_file1' !== '') {
      $("ul.intro1").removeClass("tabs1");
     }
     var currentli = $(this).parent('li');
     currentli.remove();
      if ('li .attached_file1' == '') {
        $("ul").removeClass("tabs1");
     }
    });

  $(document).on('click', '.selected_email_delete_row', function (e){
     var selected_email_delete = $(this).parent('li');
     selected_email_delete.remove();


    });




    $(document).on('click', '.attached_file button', function (e){
      if ('li.attached_file' !== '') {
        $("ul.intro").removeClass("tabs");
       }
     var currentli = $(this).parent('li');
     currentli.remove();
    });


  function getCookie(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie != '') {
          var cookies = document.cookie.split(';');
          for (var i = 0; i < cookies.length; i++) {
              var cookie = jQuery.trim(cookies[i]);
              // Does this cookie string begin with the name we want?
              if (cookie.substring(0, name.length + 1) == (name + '=')) {
                  cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                  break;
              }
          }
      }
      return cookieValue;
}



function chartJsData(paid_data) {
        console.log(paid_data)
       Chart.defaults.global.pointHitDetectionRadius = 1;
        var ctx = document.getElementById('quote-dash-chart').getContext('2d'),
          data = {
              "labels": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              "datasets": [{
                  "label": "Paid Invoices",
                  "data": paid_data.Customer_list,
                  "fill": false,
                  "backgroundColor": "rgb(64, 195, 9)",
                  "borderColor": "rgb(64, 195, 9)",
                  "borderWidth": 2,
                  "lineTension": 0.2,
                  "pointBackgroundColor": '#fff',
                  "pointRadius": 4,
                  "pointHoverBackgroundColor": 'rgb(64, 195, 9)',
                  "pointHoverBorderColor": "rgba(64, 195, 9, 0.4)",
                  "pointHoverBorderWidth": 20,
                  "pointHoverRadius": 4
              }, {
                  "label": "Sales Orders",
                  "data": paid_data.salers_list,
                  "fill": false,
                  "backgroundColor": "rgb(252, 127, 53)",
                  "borderColor": "rgb(252, 127, 53)",
                  "borderWidth": 2,
                  "lineTension": 0.2,
                  "pointBackgroundColor": '#fff',
                  "pointRadius": 4,
                  "pointHoverBackgroundColor": 'rgb(252, 127, 53)',
                  "pointHoverBorderColor": "rgba(252, 127, 53, 0.4)",
                  "pointHoverBorderWidth": 20,
                  "pointHoverRadius": 4
              }, {
                  "label": "Quotations",
                  "data": paid_data.quatation_list,
                  "fill": false,
                  "backgroundColor": "rgb(223, 40, 115)",
                  "borderColor": "rgb(223, 40, 115)",
                  "borderWidth": 2,
                  "lineTension": 0.2,
                  "pointBackgroundColor": '#fff',
                  "pointRadius": 4,
                  "pointHoverBackgroundColor": 'rgb(223, 40, 115)',
                  "pointHoverBorderColor": "rgba(223, 40, 115, 0.4)",
                  "pointHoverBorderWidth": 20,
                  "pointHoverRadius": 4
              }]
          },
          options = {
            responsive: true,
            animation: {
              animateRotate: true,
              animateScale: true
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        color: '#f8f8f8',
                        display: true,
                        drawBorder: false,
                        drawOnChartArea: true,
                        drawTicks: true,
                        zeroLineColor: '#f8f8f8'
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: '#f8f8f8',
                        display: true,
                        drawBorder: false,
                        drawOnChartArea: true,
                        drawTicks: true,
                        zeroLineColor: '#f8f8f8'
                    }
                }]
            },
            legend: false,
            legendCallback: function(chart) {
              var text = '<ul class="' + chart.id + '-legend list-inline">';
              for(var i = 0; i < chart.data.datasets.length; i++) {
                text += '<li><input type="checkbox" name="toggle-'+i+'" id="dataset-'+i+'" checked="checked"/><label for="dataset-'+i+'">';
                text += chart.data.datasets[i].label;
                text += '</label></li>';
              }
              text += '</ul>';
              return text;
            },
            tooltips: {
              enabled: false,
              mode: 'nearest',
              position: 'nearest',
              xAlign: "center",
              yAlign: "left",
              custom: function(tooltip) {
                // Tooltip Element
                var tooltipEl = document.getElementById('chartjs-tooltip');

                if (!tooltipEl) {
                  tooltipEl = document.createElement('div');
                  tooltipEl.id = 'chartjs-tooltip';
                  tooltipEl.innerHTML = "<table></table>"
                  document.getElementsByClassName('quote-chart')[0].appendChild(tooltipEl);
                }

                // Hide if no tooltip
                if (tooltip.opacity === 0) {
                  tooltipEl.style.opacity = 0;
                  return;
                }

                // Set caret Position
                tooltipEl.classList.remove('above', 'below', 'no-transform');
                if(tooltip.yAlign) {
                  tooltipEl.classList.add(tooltip.yAlign);
                } else {
                  tooltipEl.classList.add('no-transform');
                }

                function getBody(bodyItem) {
                  return bodyItem.lines;
                }

                // Set Text
                if (tooltip.body) {
                  var titleLines = tooltip.title || [];
                  var bodyLines = tooltip.body.map(getBody);

                  var innerHtml = '<thead>';

                  titleLines.forEach(function(title) {
                    innerHtml += '<tr><th>' + title + '</th></tr>';
                  });
                  innerHtml += '</thead><tbody>';

                  bodyLines.forEach(function(body, i) {
                    var colors = tooltip.labelColors[i];
                    var style = 'background:' + colors.backgroundColor;
                    style += '; border-color:' + colors.borderColor;
                    style += '; border-width: 2px';
                    var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                    innerHtml += '<tr><td>' + span + body + '</td></tr>';
                  });
                  innerHtml += '</tbody>';

                  var tableRoot = tooltipEl.querySelector('table');
                  tableRoot.innerHTML = innerHtml;
                }

                var position = this._chart.canvas;

                // Display, position, and set styles for font
                tooltipEl.style.opacity = 1;
                if((tooltip.caretX+tooltip.width) > position.width) {
                  tooltipEl.style.left = 'auto';
                  tooltipEl.style.right = 0-(tooltip.width/3)+'px';
                } else {
                  tooltipEl.style.left = (tooltip.x > 1) ? position.offsetLeft + tooltip.caretX + 'px' : position.offsetLeft + (tooltip.caretX*2) + 'px';
                  tooltipEl.style.right = 'auto';
                }
                tooltipEl.style.top = position.offsetTop + tooltip.caretY + 'px';
                tooltipEl.style.fontFamily = '"Open Sans", Arial, sans-serif';
                tooltipEl.style.fontSize = '12px';
                tooltipEl.style.fontStyle = tooltip._fontStyle;
                tooltipEl.style.padding = '10px';
              }
            }
          };
        console.log(options)
        var chart = new Chart(ctx, {
          type: 'line',
          data: data,
          options: options
       });
      $(".chartjs-legend").html(chart.generateLegend());
      $(".chartjs-legend").on('click', "label", function() {
          var index = $(this).closest('li').index();
          var meta = chart.getDatasetMeta(index);
          meta.hidden = meta.hidden === null? !chart.data.datasets[index].hidden : null;
          chart.update();
      });
}




