import './bootstrap';
import {
    addMonths,
    endOfDay,
    endOfMonth,
    endOfQuarter,
    endOfWeek,
    startOfDay,
    startOfMonth,
    startOfQuarter,
    startOfWeek,
    startOfYear,
    subDays,
    subMonths
} from "date-fns";
import format from './util/format'

class MainApp {
    range = {
        start: null, end: null
    };
    defaultRange = {
        start: null, end: null
    };
    viewRange = '1M';
    locale = 'en-US';
    language = 'en-US';

    constructor() {
        console.log('MainApp constructor');
        let start = window.BasicStore.get('start');
        let end = window.BasicStore.get('end');
        if (null !== start && null !== end) {
            console.log('start + end is not null, recycle it.');
            this.range = {
                start: new Date(start),
                end: new Date(end),
            };
            return;
        }
        console.log('start + end = null!');

    }

    init() {
        console.log('MainApp init');
        // get values from store and use them accordingly.
        this.viewRange = window.BasicStore.get('viewRange');
        this.locale = window.BasicStore.get('locale');
        this.language = window.BasicStore.get('language');
        this.locale = 'equal' === this.locale ? this.language : this.locale;
        window.__localeId__ = this.language;

        // the range is always null but later on we will store it in BasicStore.
        if (null === this.range.start && null === this.range.end) {
            console.log('start + end = null, calling setDatesFromViewRange()');
            this.range = this.setDatesFromViewRange(new Date);
        }
        console.log('MainApp: set defaultRange');
        this.defaultRange = this.setDatesFromViewRange(new Date);
        // default range is always the current period (initialized ahead)
    }

    setDatesFromViewRange(today) {
        console.log('MainApp: setDatesFromViewRange');
        let start;
        let end;
        let viewRange = this.viewRange;

        console.log('MainApp: viewRange: ' + viewRange);

        switch (viewRange) {
            case 'last365':
                start = startOfDay(subDays(today, 365));
                end = endOfDay(today);
                break;
            case 'last90':
                start = startOfDay(subDays(today, 90));
                end = endOfDay(today);
                break;
            case 'last30':
                start = startOfDay(subDays(today, 30));
                end = endOfDay(today);
                break;
            case  'last7':
                start = startOfDay(subDays(today, 7));
                end = endOfDay(today);
                break;
            case  'YTD':
                start = startOfYear(today);
                end = endOfDay(today);
                break;
            case  'QTD':
                start = startOfQuarter(today);
                end = endOfDay(today);
                break;
            case  'MTD':
                start = startOfMonth(today);
                end = endOfDay(today);
                break;
            case '1D':
                // today:
                start = startOfDay(today);
                end = endOfDay(today);
                break;
            case '1W':
                // this week:
                start = startOfDay(startOfWeek(today, {weekStartsOn: 1}));
                end = endOfDay(endOfWeek(today, {weekStartsOn: 1}));
                break;
            case '1M':
                // this month:
                start = startOfDay(startOfMonth(today));
                end = endOfDay(endOfMonth(today));
                break;
            case '3M':
                // this quarter
                start = startOfDay(startOfQuarter(today));
                end = endOfDay(endOfQuarter(today));
                break;
            case '6M':
                // this half-year
                if (today.getMonth() <= 5) {
                    start = new Date(today);
                    start.setMonth(0);
                    start.setDate(1);
                    start = startOfDay(start);
                    end = new Date(today);
                    end.setMonth(5);
                    end.setDate(30);
                    end = endOfDay(start);
                }
                if (today.getMonth() > 5) {
                    start = new Date(today);
                    start.setMonth(6);
                    start.setDate(1);
                    start = startOfDay(start);
                    end = new Date(today);
                    end.setMonth(11);
                    end.setDate(31);
                    end = endOfDay(start);
                }
                break;
            case '1Y':
                // this year
                start = new Date(today);
                start.setMonth(0);
                start.setDate(1);
                start = startOfDay(start);

                end = new Date(today);
                end.setMonth(11);
                end.setDate(31);
                end = endOfDay(end);
                break;
        }
        console.log('MainApp: setDatesFromViewRange done!');
        return {start: start, end: end};
    }

    buildDateRange() {
        console.log('MainApp: buildDateRange');
        // generate ranges
        let nextRange = this.getNextRange();
        let prevRange = this.getPrevRange();
        let last7 = this.lastDays(7);
        let last30 = this.lastDays(30);
        let mtd = this.mtd();
        let ytd = this.ytd();

        // set the title:
        let element = document.getElementsByClassName('daterange-holder')[0];
        element.textContent = format(this.range.start) + ' - ' + format(this.range.end);
        element.setAttribute('data-start', format(this.range.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(this.range.end, 'yyyy-MM-dd'));

        // set the current one
        element = document.getElementsByClassName('daterange-current')[0];
        element.textContent = format(this.defaultRange.start) + ' - ' + format(this.defaultRange.end);
        element.setAttribute('data-start', format(this.defaultRange.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(this.defaultRange.end, 'yyyy-MM-dd'));

        // generate next range
        element = document.getElementsByClassName('daterange-next')[0];
        element.textContent = format(nextRange.start) + ' - ' + format(nextRange.end);
        element.setAttribute('data-start', format(nextRange.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(nextRange.end, 'yyyy-MM-dd'));

        // previous range.
        element = document.getElementsByClassName('daterange-prev')[0];
        element.textContent = format(prevRange.start) + ' - ' + format(prevRange.end);
        element.setAttribute('data-start', format(prevRange.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(prevRange.end, 'yyyy-MM-dd'));

        // last 7
        element = document.getElementsByClassName('daterange-7d')[0];
        element.setAttribute('data-start', format(last7.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(last7.end, 'yyyy-MM-dd'));

        // last 30
        element = document.getElementsByClassName('daterange-90d')[0];
        element.setAttribute('data-start', format(last30.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(last30.end, 'yyyy-MM-dd'));

        // MTD
        element = document.getElementsByClassName('daterange-mtd')[0];
        element.setAttribute('data-start', format(mtd.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(mtd.end, 'yyyy-MM-dd'));

        // YTD
        element = document.getElementsByClassName('daterange-ytd')[0];
        element.setAttribute('data-start', format(ytd.start, 'yyyy-MM-dd'));
        element.setAttribute('data-end', format(ytd.end, 'yyyy-MM-dd'));

        // custom range.
        console.log('MainApp: buildDateRange end');
    }

    getNextRange() {
        let start = startOfMonth(this.range.start);
        let nextMonth = addMonths(start, 1);
        let end = endOfMonth(nextMonth);
        return {start: nextMonth, end: end};
    }

    getPrevRange() {
        let start = startOfMonth(this.range.start);
        let prevMonth = subMonths(start, 1);
        let end = endOfMonth(prevMonth);
        return {start: prevMonth, end: end};
    }

    ytd() {
        let end = new Date;
        let start = startOfYear(this.range.start);
        return {start: start, end: end};
    }

    mtd() {

        let end = new Date;
        let start = startOfMonth(this.range.start);
        return {start: start, end: end};
    }

    lastDays(days) {
        let end = new Date;
        let start = subDays(end, days);
        return {start: start, end: end};
    }

    changeDateRange(e) {
        console.log('MainApp: changeDateRange');
        let target = e.currentTarget;
        //alert('OK 3');
        let start = new Date(target.getAttribute('data-start'));
        let end = new Date(target.getAttribute('data-end'));
        console.log('MainApp: Change date range', start, end);
        e.preventDefault();
        // TODO send start + end to the store and trigger this again?
        window.app.setStart(start);
        window.app.setEnd(end);
        window.app.buildDateRange();
        console.log('MainApp: end changeDateRange');
        return false;
    }

    setStart(date) {
        console.log('MainApp: setStart');
        this.range.start = date;
        window.BasicStore.store('start', date);
    }

    setEnd(date) {
        console.log('MainApp: setEnd');
        this.range.end = date;
        window.BasicStore.store('end', date);
    }
}

let app = new MainApp();

// Listen for the basic store, we need it to continue with the
document.addEventListener("BasicStoreReady", (e) => {
    console.log('MainApp: app.js from event handler');
    app.init();
    app.buildDateRange();
    const event = new Event("AppReady");
    document.dispatchEvent(event);
}, false,);

if (window.BasicStore.isReady()) {
    console.log('MainApp: app.js from store ready');
    app.init();
    app.buildDateRange();
    const event = new Event("AppReady");
    document.dispatchEvent(event);
}

window.app = app;

export default app;
