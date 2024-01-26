var schedule = {
    initialize: function () {
        schedule.activities.set();
    },
    options: {
        schedule: '#schedule',
        breaks: [0, 0, 0, 0, 0, 0, 0, 0, 0], // breaks duration
        s_breaks: [480, 540, 600, 660, 720, 780, 840, 900, 960, 1020, 1080, 1140, 1200, 1260, 1320], // the time after which the break begins
        lesson_time: 15, // lesson duration (minutes)
        lessons: 56, // number of lessons per week
        start: function () { // start at 8.00
            return schedule.general.toMin(8, 0)
        },
        end: function () { // start at 20.00
            return schedule.general.toMin(22, 0)
        },
        h_width: $('.s-hour-row').width(), // get a width of hour div
        minToPx: function () { // divide the box width by the duration of one lesson
            return schedule.options.h_width / schedule.options.lesson_time / 4;
        },
    },
    general: {
        hoursRegEx: function (hours) {
            var regex = /([0-9]{1,2}).([0-9]{1,2})-([0-9]{1,2}).([0-9]{1,2})/;
            if (regex.test(hours)) {
                return true;
            } else {
                return false;
            }

        },
        toMin: function (hours, minutes, string) {
            // change time format (10,45) to minutes (645)
            if (!string) {
                return (hours * 60) + minutes;
            }

            if (string.length > 0) {
                // "7.10"
                var h = parseInt(string.split('.')[0]),
                    m = parseInt(string.split('.')[1]);

                return schedule.general.toMin(h, m);
            }
        },
        getPosition: function (start, duration, end) {
            var translateX = (start - schedule.options.start()) * schedule.options.minToPx(),
                width = duration * schedule.options.minToPx(),
                breaks = schedule.options.breaks,
                s_breaks = schedule.options.s_breaks;
            $.each(breaks, function (index, item) {
                if (start < s_breaks[index] && duration > item && end > (s_breaks[index] + item)) {
                    width -= item * schedule.options.minToPx();
                }
                if (start > s_breaks[index] && duration > item && end > (s_breaks[index] + item)) {
                    translateX -= item * schedule.options.minToPx();
                }
            });

            return [translateX, width];
        }
    },
    activities: {
        delete: function (week, hours) {
            /* week: 0-4 << remove all activities from a day
               hours: "7.10-16.10" << remove all activities from a choosed hours
            */
            function finalize(message) {
                if (confirm(message)) {
                    return true;
                }
            }

            if (week && !hours) {
                if (finalize("Do you want to delete all activities on the selected day?")) {
                    $('.s-activities .s-act-row:eq(' + week + ')').empty();
                }
            }

            if (!week && !hours) {
                console.log('Error. You have to add variables like a week (0-4) or hours ("9.10-10.45")!')
            }
            // if day is not defined and hours has got a correct form
            if (!week && schedule.general.hoursRegEx(hours)) {

                console.log('Week not defined and hours are defined!');

                $(schedule.options.schedule + ' .s-act-tab').each(function (i, v) {
                    var t = $(this), // get current tab
                        name = t.children('.s-act-name').text(), // get tab name
                        h = t.attr('data-hours').split('-'), // get tab hours
                        s = schedule.general.toMin(0, 0, h[0]), // get tab start time (min)
                        e = schedule.general.toMin(0, 0, h[1]), // get tab end time (min)
                        uh = hours.split('-'), // user choosed time
                        us = schedule.general.toMin(0, 0, uh[0]), // user choosed start time (min)
                        ue = schedule.general.toMin(0, 0, uh[1]); // user choosed end time (min)

                    if (us <= s && ue >= e) {
                        $(this).remove();
                    }

                })

            }

            if (week && hours) {
                // if week and hours is defined
                console.log('Week is defined and hours are defined too!');

                $('#schedule .s-act-row:eq(' + week + ') .s-act-tab').each(function (i, v) {
                    var t = $(this), // get current tab
                        name = t.children('.s-act-name').text(), // get tab name
                        h = t.attr('data-hours').split('-'), // get tab hours
                        s = schedule.general.toMin(0, 0, h[0]), // get tab start time (min)
                        e = schedule.general.toMin(0, 0, h[1]), // get tab end time (min)
                        uh = hours.split('-'), // user choosed time
                        us = schedule.general.toMin(0, 0, uh[0]), // user choosed start time (min)
                        ue = schedule.general.toMin(0, 0, uh[1]); // user choosed end time (min)

                    if (us <= s && ue >= e) {
                        $(this).remove();
                    }

                })


            }
            ;

        },
        add: function (day, lesson, hours, classroom, teacher, color) {
            var tab = "<div class='s-act-tab " + color + "' data-hours='" + hours + "'>\
            <div class='s-act-name'>" + lesson + "</div>\
            <div class='s-wrapper'>\
              <div class='s-act-teacher'>" + teacher + "</div>\
              <div class='s-act-room'>" + classroom + "</div>\
            </div>\
          </div>";
            $('.s-activities .s-act-row:eq(' + day + ')').append(tab);
            schedule.activities.set();
        },
        set: function () {
            $(schedule.options.schedule + ' .s-act-tab').each(function (i) {
                var hours = $(this).attr('data-hours').split("-"),
                    start = /* HOURS */ parseInt(hours[0].split(".")[0] * 60)
                        + /* MINUTES */ parseInt(hours[0].split(".")[1]),
                    end = /* HOURS */ parseInt(hours[1].split(".")[0] * 60)
                        + /* MINUTES */ parseInt(hours[1].split(".")[1]),
                    duration = end - start,
                    translateX = schedule.general.getPosition(start, duration, end)[0],
                    width = schedule.general.getPosition(start, duration, end)[1];

                $(this)
                    .attr({"data-start": start, "data-end": end})
                    .css({"transform": "translateX(" + translateX + "px)", "width": width + "px"});
            });
        }
    }

}

schedule.initialize();

let commands = "";

function saveTimetable() {
    html2canvas(document.querySelector("#schedule")).then((canvas) => {
        document.body.appendChild(canvas);
        Canvas2Image.saveAsPNG(canvas);
    });
}

function clearInput(input, prune = false) {
    input.classList.remove('is-valid');
    input.classList.remove('is-invalid');
    if(input.nextElementSibling) {
        input.nextElementSibling.innerHTML = "";
    }

    if (prune) {
        if (input.tagName === "SELECT") {
            input.value = "none";
        } else {
            input.value = "";
        }
    }
}

function checkInput(input) {
    clearInput(input);

    const errorField = input.nextElementSibling;
    if (input.value === "" || input.value === "none") {
        input.nextElementSibling.innerHTML = "A mező nem lehet üres!";
        input.classList.add('is-invalid');
        return false;
    } else {
        input.classList.add('is-valid');
        return true;
    }
}

function checkTime(startTime, endTime) {
    clearInput(startTime);
    clearInput(endTime);

    if (endTime.value < startTime.value) {
        document.getElementById('time-error').innerHTML = "A befejezés ideje nem lehet hamarabb, mint a kezdés ideje!";
        document.getElementById('time-error').style = "display: block;";
        startTime.classList.add('is-invalid');
        endTime.classList.add('is-invalid');
        return false;
    } else {
        document.getElementById('time-error').style = "display: none;";
        startTime.classList.add('is-valid');
        endTime.classList.add('is-valid');
        return true;
    }
}

function addClass() {
    const className = document.getElementById('subject');
    const teacher = document.getElementById('teacher');
    const room = document.getElementById('room');
    const day = document.getElementById('day');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const color = document.getElementById('color');

    let inputs = [];

    inputs[0] = checkInput(className);
    inputs[1] = checkInput(teacher);
    inputs[2] = checkInput(room);
    inputs[3] = checkInput(color);
    inputs[4] = checkInput(day);
    inputs[5] = checkTime(startTime, endTime);

    if (inputs.every(element => element === true)) {
        schedule.activities.add(day.value, className.value, startTime.value.replace(":", ".") + "-" + endTime.value.replace(":", "."), room.value, teacher.value, color.value);

        commands += "schedule.activities.add(" + day.value + ", \"" + className.value + "\", \"" + startTime.value.replace(":", ".") + "-" + endTime.value.replace(":", ".") + "\", \"" + room.value + "\", \"" + teacher.value + "\", \"" + color.value + "\");";

        clearInput(className, true);
        clearInput(teacher, true);
        clearInput(room, true);
        clearInput(color, true);
        clearInput(day, true);
    }
}

function downloadTimetable() {
    var textToSave = commands;
    var hiddenElement = document.createElement('a');

    hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'timetable.js';
    hiddenElement.click();
}

function uploadTimetable() {
    var myUploadedFile = document.getElementById("file").files[0];
    var script = document.createElement('script');
    var reader = new FileReader();
    reader.readAsText(myUploadedFile, "UTF-8");
    reader.onload = function (evt) {
        commands += evt.target.result;
        script.innerHTML = evt.target.result;
    };
    script.type = "text/javascript";
    document.body.appendChild(script);

    document.getElementById("file").value = "";
}


$("#startTime").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    minTime: "08:00",
    maxTime: "20:00",
    defaultDate: "08:00",
    minuteIncrement: 15,
    time_24hr: true
});

$("#endTime").flatpickr({
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    minTime: "08:00",
    maxTime: "20:00",
    defaultDate: "09:00",
    minuteIncrement: 15,
    time_24hr: true
});

function changeTheme(def = false) {
    const sw = document.getElementById('theme');

    if(def) {
        if(window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            sw.checked = false;
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
            sw.checked = true;
        }
    } else {
        if(sw.checked === true) {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        }
    }
}