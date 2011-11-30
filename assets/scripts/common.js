/*
Copyright © 2011, PINT, Inc. 

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions: 

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software. 

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE. 
*/
if(typeof this.PINT=="undefined"){var PINT={}; }
PINT.modalOverlay = false;
PINT.calendarInfo = [];
if ( !$.cookie('ZINGcalendar') ) {
	$.cookie('ZINGcalendar', '', { path:'/', expires:60 });
} 
else {
	PINT.calendarInfo = $.cookie('ZINGcalendar').split(',');
}

/** FUNCTIONS **********/
(function ($) {

    /** CALENDAR ACTION **********/
    // Sets Action on calendar click
    // Example with default overrides: $('ul.component-calendar').PINT_calendar({ date:12 });
    $.fn.PINT_calendar = function(options) {
        
        /** USER ADDED SETTINGS ( Pass into function/method call init ) **/
        var settings = $.extend( {
            // Defaults
            date:1, //new Date().getDate();  Set Limit Day ( all days before this selectable )
            month:12, //new Date().getMonth()+1; Sets which month to set this up for (i.e. December)
            fadeTiming:300, // When you hover on a calendar day, this is the 'fade' animation speed
            daySlideDuration:500 // When you click a calendar day, this is the 'slide' animation speed
        }, options);
        
        return this.each(function() {

            var calendar = $(this);
        
            calendar.find('li').each(function(){
                if ( settings.month == 12 && settings.date >= parseInt( $(this).find('.day').text(), 10) ) {
                    $(this).addClass('active');
                } else {
                    $(this).removeClass('active');
                }
            });
        
            // SET OFFSET VALUE
            var offset = '-' + $(this).children(':first-child').width();

            /** FIND EACH A TAG *****/
            // Find each A tag inside our calendar list
            calendar.find('a').each(function() {

                /* Mouse Enter *****/
                $(this).mouseenter(function() {
                    currentThis = $(this);
                    /** IF 'Active' link **/
                    if ( currentThis.parent().hasClass('active') ) {
                        currentThis
                            // Fade in hover
                            .children('.day')
                                .addClass('hover')
                                .children('span')
                                    .stop()
                                    .css('opacity','.3')
                                    .animate({ opacity:'1' }, settings.fadeTiming, function() {})
                        ;
                    }
                    /** ELSE 'Non-Active' link **/
                    else {
                        currentThis
                            // Fade in hover
                            .children('.day').addClass('hover')
                                .children('span')
                                    .stop()
                                    .css('opacity','0')
                                    .animate({ opacity:'.14' }, settings.fadeTiming, function() {})
                                    .end()
                                .children('strong')
                                    .stop()
                                    .css('opacity','1')
                                    .animate({ opacity:'.5' }, settings.fadeTiming, function() {})
                        ;
                    }
                });

                /* Mouse Leave *****/
                $(this).mouseleave(function() {
                    $(this)
                        .children('.day')
                            .children('span')
                                .stop()
                                .animate({ opacity:'0' }, settings.fadeTiming, function() {})
                    ;
                });

            });

            // SET 'ALLOWABLE' DAYS
            function PINT_calendarActivateDay(aObj, bRaiseOverlay) {
                if ($(aObj).length == 0) return;
                                
                var sDay = $(aObj).attr('href').replace('#day', '');
                if ($.inArray(sDay, PINT.calendarInfo) == -1) {
                    PINT.calendarInfo.push(sDay);
                    $.cookie('ZINGcalendar', PINT.calendarInfo.join(','), { path : '/', expires : 60 });
                }
                $(aObj)
                    .stop()
                    .animate({ opacity:'1' }, 800, function() {})
                    // Add class to remove CSS shadow once active A clicked
                    .parent()
                    .addClass('remove-css')
                    .end()

                    // Find '.day' element to slide 'out'
                    .children('.day')
                        // Add '.day-active' so background gradient stays if you hover off
                        .addClass('day-active')
                        .animate({ left:offset }, settings.daySlideDuration, function() {

                            // Remove class when anim finishes to remove solid-state class for normal hover functionality
                            $(this).removeClass('day-active');

                            if (bRaiseOverlay) {
                                var ordinal = $(this).find('strong').text();
                                var selectedDay = '#day'+ordinal;
                                var selectedDayCode = $(selectedDay).html();
                                
                                $(this).PINT_showOverlay(selectedDayCode);
                            }
                        })

                    // Return focus back to 'this' (.active a)
                    .end()

                    // Then find the 'current' .content box
                    .children('.content')
                        // slide 'in' .content while .day slides 'out'
                        .animate({ marginLeft:'0' }, settings.daySlideDuration, function() {})
                ;
            }
            $.each(PINT.calendarInfo, function() {
                PINT_calendarActivateDay($('a[href=#day' + this.toString() + ']'), false);
            });

            /** FIND EACH 'ACTIVE' A TAG *****/
            // Find each A tag inside our calendar list
            $(this).find('.active a').each(function() {
                var currentThis = $(this);

                currentThis
                    // Mouse Down
                    .mousedown(function() {
                        $(this)
                            .animate({ opacity:'.7' }, 600, function() {})
                            .parent().addClass('remove-css');
                    })
                    // Mouse Up
                    .mouseup(function() {
                        $(this)
                            .animate({ opacity:'1' }, 600, function() {})
                            .parent().removeClass('remove-css');
                    })
                    // Click
                    .click(function() {
                        // Actions
                        PINT_calendarActivateDay(this, true);
                        // Return false on the first click since we don't want to run the A tag HREF yet
                        return false;
                    })
                ;
            });

        })
    };

    /** HEADLINE ANIMATION **********/
    // Fades in Headlines (H1,H2)
    $.fn.PINT_headlineFade = function() {
        this.each(function() {
            // Setup Elements
            var el1 = $(this);
            var el2 = el1.next();
            var el3 = el2.next();
            // Set Initial Element CSS
            el1.css({ opacity:0, marginLeft:'-200px' })
            el2.css({ opacity:0, marginLeft:'-5px' });
            el3.css({ opacity:0, marginLeft:'95px' });
            // Set Constants
            var animDuration = 450;
            var timeOutDuration = 250;
            
            el1.animate({ opacity:'1', marginLeft:'0' }, animDuration, function() {
                el3.animate({ opacity:'1', marginLeft:'-55px' }, animDuration, function() {
                    window.setTimeout(function() {
                        el3.animate({ opacity:'1', marginLeft:'0' }, animDuration, function() {
                            el2.animate({ opacity:'1' }, animDuration, function() {})
                        });
                    }, timeOutDuration);
                })
            })
        })
    };
    
    
    /** OVERLAY: INITIALIZE **********/
    // Fades in Overlay
    $.fn.PINT_showOverlay = function(content) {
        this.each(function() {
            if( !$('#overlay-main').length ) {
                $('body').prepend($('<div id="overlay-main"><div id="overlay-body"><div id="overlay-close">Close<span>&nbsp;</span></div></div></div>').css({
                    display: 'none'
                }));
            }
            
            if( !$('#overlay-mask').length ) {
                $('body').prepend($('<div id="overlay-mask"></div>').css({
                    opacity: 0.65,
                    width: $(window).width(),
                    height: $(document).height(),
                    display: 'none'
                }));
            }

            var closeCode = '<div id="overlay-close">Close<span>&nbsp;</span></div>';    
        
            $('#overlay-body').html(content+closeCode);
        
            $('#overlay-close').bind('click', function () {
                $('#overlay-mask').fadeOut('fast');
                $(this).parent().parent().fadeOut('fast');
            });
            
            $('body').PINT_centerOverlay();
            $('#overlay-mask').fadeIn('fast');
            $('#overlay-main').fadeIn('slow');
        })
    }
    
    /** OVERLAY: CENTER **********/
    // Centers the Overlay on browser resize
    $.fn.PINT_centerOverlay = function() {
    
        $('#overlay-main')
            .css("position","absolute")
            .css("top", (($(window).height() - $('#overlay-main').outerHeight()) / 2) + $(window).scrollTop() + "px")
            .css("left", (($(window).width() - $('#overlay-main').outerWidth()) / 2) + $(window).scrollLeft() + "px");    
    
    }

    /** TOOLTIP **********/
    // Show 'tooltip' box on hover of TRIGGER
    $.fn.PINT_tooltip = function() {
        this.each(function() {
            // TRIGGER Variables
            var eachThis = $(this);
            var eachThisPosition = eachThis.position();
            var eachThisLeftPos = eachThisPosition.left;
            var eachThisTopPos = eachThisPosition.top;
            
            // TARGET Variables
            var target = eachThis.next();
            var targetWidth = target.width();
            var targetHeight = target.innerHeight();
            var targetLeftPos = eachThisLeftPos - Math.floor(targetWidth/2);
            var targetTopPos = eachThisTopPos - targetHeight;
            var targetTopPosOffset = targetTopPos+5;
            
            // Set MOUSEENTER action/event of TRIGGER
            eachThis
                .mouseenter(function(e) {
                    if ( $(e.target).is( $(this).next() ) ) return false;
                    // CLOSE Button
                    var closeCode = $('<span class="close">Close<span>&nbsp;</span></span>').click(function() { $(this).parent().hide() });
                    $(this)
                        // Find TARGET, position it and animate/show it
                        .next()
                            .stop()
                            .not(':visible')
                            .append( closeCode )
                            .css({ top:targetTopPosOffset, left:targetLeftPos, display:'inline-block', opacity:0 })
                            .animate({ top:targetTopPos, opacity:1 }, 200, function() {})
                })
            ;
            // Set MOUSEOUT action/event of TARGET
            target
                .mouseleave(function() {
                    $(this)
                        .stop()
                        .not(':animated')
                        .css({ display:'none', opacity:0 })
                        .find('span.close').remove()
                })
            ;
        });
    };

    /** SHARE MENU **********/
    // Creates SHARE menu on load
    $.fn.PINT_share = function(timing) {
        this.each(function() {
            // SHARE code
            var shareCode = [
                    '<div id="share">',
                    '    <ul>',
                    '        <li><a id="share-facebook" href="javascript:;" class="icon-facebook">Facebook<span>&nbsp;</span></a></li>',
                    '        <li><a id="share-twitter" href="javascript:;" class="icon-twitter">Twitter<span>&nbsp;</span></a></li>',
                    '        <li><a id="share-bookmark" href="javascript:;" class="icon-bookmark">Bookmark This Page<span>&nbsp;</span></a></li>',
                    '        <li><a id="share-email" href="javascript:;" class="icon-share">Share Page With a Friend<span>&nbsp;</span></a></li>',
                    '    </ul>',
                    '    <p>Share</p>',
                    '</div>'
                ].join('')
            ;
            var animDuration = timing || 450;
            
            // Append SHARE code to selected element
            $(this).append(
                $(shareCode)
                    .mouseenter(function() {
                        $(this)
                            .stop()
                            .animate({ top:'0' }, animDuration, function() {})
                            .children('p').text('Close');
                    })
                    .mouseleave(function() {
                        $(this)
                            .stop()
                            .animate({ top:'-146px' }, animDuration, function() {})
                            .children('p').text('Share');
                    })
                    .click(function() {
                        if (parseInt($(this).css('top'), 10) == 0) {
                            $(this)
                                .stop()
                                .animate({ top:'-146px' }, animDuration, function() {})
                                .children('p').text('Share');
                        } else {
                            $(this)
                                .stop()
                                .animate({ top:'0' }, animDuration, function() {})
                                .children('p').text('Close');
                        }
                    })
            );

            $('#share-facebook').click(function() {
                window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(window.location.href), 'fbwin', 'height=440,width=620');
            });
            $('#share-twitter').click(function() {
                window.open('http://twitter.com/home?status=' + encodeURIComponent("Add your default Twitter Msg Here") + '+-+' + encodeURIComponent(window.location.href), 'twitterwin', 'height=650,width=1024,scrollbars=yes');
            });
            $('#share-bookmark').click(function() {
                PINT.bookmarkPage(encodeURIComponent(document.title), encodeURIComponent(window.location.href));
            });
            $('#share-email').click(function() {
                //$(this).PINT_overlayMain(true);
                
                $('body').PINT_showOverlay([
                    '<div id="share-form">',
                        '<h1>Share This Item With A Friend</h1>',
                        '<div><label for="share-your-name">Enter your name:</label></div>',
                        '<div><input type="text" id="share-your-name" /><br />&nbsp;<span class="share-error" id="share-your-name-error">Please enter your name...</span></div>',
                        '<div><label for="share-friends-emails">Add friends email addresses below separated by a comma:</label></div>',
                        '<div><input type="text" id="share-friends-emails" /><br />&nbsp;<span class="share-error" id="share-friends-emails-error">Please enter the email addresses...</span></div>',
                        '<div><label for="share-message">Type in your message to your friends in the space below:</label></div>',
                        '<div><textarea id="share-message"></textarea><br />&nbsp;<span class="share-error" id="share-message-error">Please enter your message...</span></div>',
                        '<div><button id="share-submit">Send Email</button><span id="share-status"></span></div>',
                    '</div>'
                ].join(''));
                
                return;
            });
        })
    };

    PINT.bookmarkPage = function(title, url) {
        if (window.sidebar) {
            window.sidebar.addPanel(title, window.location, '');
        } else {
            if (window.opera && window.print) {
                var elem = document.createElement('a');
                elem.setAttribute('href', url);
                elem.setAttribute('title', title);
                elem.setAttribute('rel', 'sidebar');
                elem.click();
            } else {
                if (document.all) {
                    window.external.AddFavorite(window.location, title);
                }
            }
        }
    };
    
    // WINDOW RESIZE
    window.onresize = function() {
        //$('body').PINT_setOverlayPosition(false);
        $('body').PINT_centerOverlay();
    }
    window.onscroll = function() {
        //$('body').PINT_setOverlayPosition(false);
        $('body').PINT_centerOverlay();
    }

}(jQuery));
    
/** INITIALIZE/RUN FUNCTIONS **********/
$(document).ready(function() {

    /** SET JS-ENABLED CLASS *****/
    $('body').addClass('js');

    /** CALENDAR *****/
    $('ul.component-calendar').PINT_calendar();
    
    /** ADD 'SHARE' MENU *****/
    $('#header').PINT_share();

    /** HEADLINE ANIMATION *****/
    $('#headline-first').PINT_headlineFade();

    /** TOOLTIP *****/
    $('#zingchart').PINT_tooltip();

});