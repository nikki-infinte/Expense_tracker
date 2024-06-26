document.addEventListener('DOMContentLoaded', function() {
    if (typeof FullCalendar === 'undefined') {
        console.error('FullCalendar is not defined. Please check the script inclusion.');
        return;
    }

    var calendarEl = document.getElementById('calendar');

    if (!calendarEl) {
        console.error('Calendar element not found!');
        return;
    }

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: '/api/events', // Update this URL to fetch your events
        eventDidMount: function(info) {
            if (typeof tippy === 'undefined') {
                console.error('Tippy.js is not defined. Please check the script inclusion.');
                return;
            }
            tippy(info.el, {
                content: info.event.title,
            });
        },
        loading: function(isLoading) {
            if (isLoading) {
                console.log('Loading events...');
            } else {
                console.log('Events loaded.');
            }
        }
    });

    calendar.render();
});
