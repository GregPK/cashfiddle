var _ref,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if ((_ref = window.CashFiddle) == null) {
  window.CashFiddle = {};
}

CashFiddle.StringExtensions = (function() {

  function StringExtensions() {}

  StringExtensions.lpad0 = function(str, n) {
    if (n == null) {
      n = 2;
    }
    str = '' + str;
    while (str.length < n) {
      str = '0' + str;
    }
    return str;
  };

  return StringExtensions;

})();

CashFiddle.ArrayExtensions = (function() {

  function ArrayExtensions() {}

  ArrayExtensions.compare_flat = function() {
    var a, arrBase, i, others, _i, _j, _len, _len1;
    arrBase = arguments[0], others = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (arrBase == null) {
      return false;
    }
    for (_i = 0, _len = arrBase.length; _i < _len; _i++) {
      i = arrBase[_i];
      for (_j = 0, _len1 = others.length; _j < _len1; _j++) {
        a = others[_j];
        if (a != null) {
          if (a.indexOf(i) === -1) {
            return false;
          }
        }
      }
    }
    return true;
  };

  ArrayExtensions.make_from_scalar = function(scalar) {
    if (scalar === null) {
      return null;
    }
    if (typeof scalar === 'string') {
      scalar = parseInt(scalar);
    }
    if (typeof scalar === 'number') {
      scalar = [scalar];
    }
    if (typeof scalar === 'object' && typeof scalar.length === 'undefined') {
      throw "Bad scalar passed in [" + scalar;
    }
    return scalar;
  };

  return ArrayExtensions;

})();

CashFiddle.DateExtensions = (function() {

  function DateExtensions() {}

  DateExtensions.is_valid = function(date) {
    if (!(date !== 'object' || date.constructor.name !== 'Date')) {
      date = this.parse(date);
    }
    return !isNaN(date.getTime());
  };

  DateExtensions.assert_valid = function(date) {
    if (typeof date !== 'object' || date.constructor.name !== 'Date') {
      throw "Expected Date to be passed in DateExtensions.assert_valid, got " + date;
    }
    if (!this.is_valid(date)) {
      throw "Setting Invalid date from [" + datestring + "]";
    }
  };

  DateExtensions.parse = function(datestring) {
    var date;
    if (datestring.constructor.name === 'Date') {
      return datestring;
    }
    datestring = datestring.replace(/-/g, '/');
    date = new Date(datestring);
    return date;
  };

  DateExtensions.to_ymd = function(date) {
    var d, m, y;
    d = date.getDate();
    m = date.getMonth() + 1;
    y = date.getFullYear();
    if (m <= 9) {
      m = '0' + m;
    }
    if (d <= 9) {
      d = '0' + d;
    }
    return "" + y + "-" + m + "-" + d;
  };

  return DateExtensions;

})();

CashFiddle.Actor = (function() {

  function Actor() {}

  Actor.prototype.name = "";

  return Actor;

})();

CashFiddle.Debt = (function() {

  Debt.prototype.from = [];

  Debt.prototype.to = [];

  Debt.prototype.amount = null;

  function Debt(from, amount, to) {
    this.from = from;
    this.amount = amount;
    this.to = to;
  }

  return Debt;

})();

CashFiddle.Cashier = (function() {

  Cashier.prototype.actors = {};

  Cashier.prototype.debts = [];

  Cashier.prototype.parsing_strategy = null;

  function Cashier(parsing_strategy) {
    this.parsing_strategy = parsing_strategy;
  }

  return Cashier;

})();

CashFiddle.Parser = (function() {

  Parser.prototype.input = null;

  function Parser(input) {
    this.input = input;
  }

  Parser.prototype.parse = function() {
    return raise("Parser has to be inherited");
  };

  return Parser;

})();

CashFiddle.PlainTextLineParser = (function(_super) {

  __extends(PlainTextLineParser, _super);

  function PlainTextLineParser() {
    return PlainTextLineParser.__super__.constructor.apply(this, arguments);
  }

  PlainTextLineParser.prototype.output = [];

  PlainTextLineParser.prototype.current_line = 1;

  PlainTextLineParser.prototype.lines = [];

  PlainTextLineParser.prototype.parse = function() {
    var line, _i, _len, _ref1;
    this.output = [];
    this.lines = this.input.trim().split("\n");
    _ref1 = this.lines;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      line = _ref1[_i];
      this.output.push(this.parse_line(line));
      this.current_line++;
    }
    return this.output;
  };

  PlainTextLineParser.prototype.parse_line = function(line) {
    return raise("parse_line has to be implemented in inheriting prototypes");
  };

  return PlainTextLineParser;

})(CashFiddle.Parser);

/*
The TxtDebtParser class is a the strategy for handling debt input handling for the Cashier.
*/


CashFiddle.TxtDebtParser = (function(_super) {

  __extends(TxtDebtParser, _super);

  function TxtDebtParser() {
    return TxtDebtParser.__super__.constructor.apply(this, arguments);
  }

  TxtDebtParser.prototype.who_divider = "->";

  TxtDebtParser.prototype.parse_line = function(line) {
    var amount, components, debt, from, to;
    if (line.indexOf(this.who_divider) === -1) {
      throw "Debt direction identifier [" + this.who_divider + "] missing in line nr " + this.current_line + " [" + line + "]";
    }
    components = line.split(this.who_divider);
    from = components[0].trim().split(',');
    to = components[2].trim().split(',');
    amount = parseFloat(components[1].trim());
    debt = new CashFiddle.Debt(from, amount, to);
    console.log(debt);
    return debt;
  };

  return TxtDebtParser;

})(CashFiddle.PlainTextLineParser);

CashFiddle.TxtFlowParser = (function(_super) {
  var LINE_PARSE_REGEX;

  __extends(TxtFlowParser, _super);

  function TxtFlowParser() {
    return TxtFlowParser.__super__.constructor.apply(this, arguments);
  }

  LINE_PARSE_REGEX = /^([+-]?\s?\d{1,})\s+?(at|on|@)\s+?(\d{4}-\d{2}-\d{2})\s(-|because)\s(.+)/;

  TxtFlowParser.prototype.parse_line = function(line) {
    var amount, date, end, event, name, rgx_parsed;
    rgx_parsed = LINE_PARSE_REGEX.exec(line);
    if (rgx_parsed === null) {
      end = "on line " + this.current_line + ": [" + line + "]";
      if (!line.match(/at|on|@/)) {
        throw new CashFiddle.ParserException("Missing date operator [at|on|@] " + end, this.current_line);
      } else if (!line.match(/-|because/)) {
        throw new CashFiddle.ParserException("Missing name operator [-|because] " + end, this.current_line);
      } else if (!line.match(/[+-]?\s?\d{1,}/)) {
        throw new CashFiddle.ParserException("Missing value " + end, this.current_line);
      } else {
        throw new CashFiddle.ParserException("Just bad line " + end, this.current_line);
      }
    }
    this.current_line++;
    amount = parseFloat(rgx_parsed[1].trim());
    date = rgx_parsed[3].trim();
    name = rgx_parsed[5].trim();
    event = new CashFiddle.FloEvent(amount, name, date);
    return event;
  };

  return TxtFlowParser;

})(CashFiddle.PlainTextLineParser);

CashFiddle.SimpleWhitespaceTokenParser = (function() {
  var NON_TOKEN_REGEXP;

  SimpleWhitespaceTokenParser.prototype.line = null;

  NON_TOKEN_REGEXP = /(\s+)/;

  SimpleWhitespaceTokenParser.prototype.tokens = [];

  function SimpleWhitespaceTokenParser(line) {
    var token, _i, _len, _ref1;
    this.line = line;
    this.tokens = [];
    _ref1 = this.line.split(NON_TOKEN_REGEXP);
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      token = _ref1[_i];
      if (token.trim().length > 0) {
        this.tokens.push(token);
      }
    }
  }

  return SimpleWhitespaceTokenParser;

})();

CashFiddle.TxtFlowRepeatableParser = (function(_super) {
  var DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT, DAY_REGEXP, MONTHS_SHORT, MONTH_REGEXP;

  __extends(TxtFlowRepeatableParser, _super);

  function TxtFlowRepeatableParser() {
    return TxtFlowRepeatableParser.__super__.constructor.apply(this, arguments);
  }

  DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  DAYS_OF_WEEK_SHORT = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  MONTH_REGEXP = /January|February|March|April|May|June|July|August|September|October|November|December/gi;

  MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  DAY_REGEXP = /((mon)|(tues)|(tue)|(wed)|(wednes)|(thu)|(thurs)|(fri)|(sat)|(satur)|(sun))(day)?/gi;

  TxtFlowRepeatableParser.prototype.parse_line = function(line) {
    var days, event, i, last_token, mode, months, parser_err_end, token, tokenizer, val, _i, _len, _ref1;
    tokenizer = new CashFiddle.SimpleWhitespaceTokenParser(line);
    last_token = null;
    mode = null;
    event = null;
    parser_err_end = " on line " + this.current_line + ": [" + line + "]";
    _ref1 = tokenizer.tokens;
    for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
      token = _ref1[i];
      if (token === 'every' || token === 'because' || token === 'on' || token === 'the' || token === 'month' || token === '-' || token === 'at') {
        continue;
      }
      if (i === 0) {
        val = parseInt(token);
        if (val === 0) {
          throw new CashFiddle.ParserException("Value of event is [0], should be something" + parser_err_end);
        }
        event = new CashFiddle.FloEventRepeatable(val, "");
      } else {
        if (token.match(MONTH_REGEXP)) {
          months = this.get_months_repeat(token);
          event.set_repeat_in_these_months_only(months);
        } else if (token.match(DAY_REGEXP)) {
          days = this.get_days_of_week_repeat(token);
          event.set_repeat_on_days_of_week(days);
        } else if (token.match(/ending/i)) {
          last_token = token;
          continue;
        } else if (last_token.match(/ending/i)) {
          event.ts_stop = CashFiddle.DateExtensions.parse(token);
        } else if (token.match(/starting/i)) {
          last_token = token;
          continue;
        } else if (last_token.match(/starting/i)) {
          event.ts_start = CashFiddle.DateExtensions.parse(token);
        } else if (parseInt(token) > 0) {
          days = this.get_days_of_month_repeat(token);
          event.set_repeat_on_days_of_month(days);
        } else {
          event.name += "" + token + " ";
        }
      }
      last_token = token;
    }
    event.name = event.name.trim();
    return event;
  };

  TxtFlowRepeatableParser.prototype.get_days_of_month_repeat = function(dom_str) {
    return parseInt(dom_str);
  };

  TxtFlowRepeatableParser.prototype.get_days_of_week_repeat = function(dow_str) {
    var day, days, ind, parser_days, _i, _len;
    dow_str = dow_str.trim().replace(/day/gi, '').toLowerCase();
    parser_days = dow_str.split(',');
    days = [];
    for (_i = 0, _len = parser_days.length; _i < _len; _i++) {
      day = parser_days[_i];
      ind = DAYS_OF_WEEK_SHORT.indexOf(day);
      if (ind != null) {
        days.push(ind + 1);
      }
    }
    return days;
  };

  TxtFlowRepeatableParser.prototype.get_months_repeat = function(month_str) {
    var ind, m, months, parser_months, _i, _len;
    parser_months = month_str.split(',');
    months = [];
    for (_i = 0, _len = parser_months.length; _i < _len; _i++) {
      m = parser_months[_i];
      m = m.substr(0, 3).toLowerCase();
      ind = MONTHS_SHORT.indexOf(m);
      if (ind != null) {
        months.push(ind + 1);
      }
    }
    return months;
  };

  return TxtFlowRepeatableParser;

})(CashFiddle.PlainTextLineParser);

/*
    CashFlow handle converting FloEvents into FlowDays.
*/


CashFiddle.CashFlow = (function() {

  CashFlow.prototype.start_date = null;

  CashFlow.prototype.end_date = null;

  CashFlow.prototype.cash_start = null;

  CashFlow.prototype.flo_events = [];

  CashFlow.prototype.flo_events_repeatable = [];

  CashFlow.prototype.current_cash = 0;

  CashFlow.prototype.flo_days = {};

  CashFlow.prototype.flo_days_count = 0;

  function CashFlow(start_date, end_date, cash_start) {
    this.start_date = start_date;
    this.end_date = end_date;
    this.cash_start = cash_start;
    this.recalculate();
    this.flo_events = [];
    this.flo_events_repeatable = [];
    this.flo_days_count = 0;
  }

  CashFlow.prototype.set_events = function(events, events_repeatable) {
    this.flo_events = events;
    this.flo_events_repeatable = events_repeatable;
    return this.recalculate();
  };

  CashFlow.prototype.flo_days_array = function() {
    var days, k, v, _ref1;
    days = [];
    _ref1 = this.flo_days;
    for (k in _ref1) {
      v = _ref1[k];
      days.push(v);
    }
    return days;
  };

  CashFlow.prototype.add_flow = function(event) {
    this.flo_events.push(event);
    return this.recalculate();
  };

  CashFlow.prototype.add_flow_repeatable = function(event) {
    this.flo_events_repeatable.push(event);
    return this.recalculate();
  };

  CashFlow.prototype.add_day = function(cash_flow_day) {
    var days_exists, ts_day;
    ts_day = this.day_hash(cash_flow_day.date);
    days_exists = this.flo_days[ts_day];
    if (days_exists != null) {
      this.flo_days[ts_day] = this.merge_days(days_exists, cash_flow_day);
    } else {
      this.flo_days[ts_day] = cash_flow_day;
      this.flo_days_count += 1;
    }
    return this.current_cash = this.flo_days[ts_day].cash_after();
  };

  CashFlow.prototype.day_hash = function(date) {
    return CashFiddle.DateExtensions.to_ymd(date);
  };

  CashFlow.prototype.merge_days = function(day, other_day) {
    var e, _i, _len, _ref1;
    _ref1 = other_day.flo_events;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      e = _ref1[_i];
      day.flo_events.push(e);
    }
    return day;
  };

  CashFlow.prototype.get_day_for_date = function(date) {
    return this.flo_days[this.day_hash(date)];
  };

  CashFlow.prototype.get_events_for_day = function(date) {
    var ev, flo_event, _i, _j, _len, _len1, _ref1, _ref2;
    ev = [];
    _ref1 = this.flo_events;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      flo_event = _ref1[_i];
      if (flo_event.ts.getTime() === date.getTime()) {
        ev.push(flo_event);
      }
    }
    _ref2 = this.flo_events_repeatable;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      flo_event = _ref2[_j];
      if (flo_event.is_valid_for_date(date)) {
        ev.push(flo_event);
      }
    }
    return ev;
  };

  CashFlow.prototype.recalculate = function() {
    var cfd, day_after_last, event, events_today, start_date, today_is, _i, _len, _results;
    this.flo_days = [];
    this.flo_days_count = 0;
    this.current_cash = 0;
    this.add_day(new CashFiddle.CashFlowDay(this.start_date, this.cash_start));
    start_date = CashFiddle.DateExtensions.parse(this.start_date, "yyyy-MM-dd");
    today_is = start_date;
    day_after_last = CashFiddle.DateExtensions.parse(this.end_date, "yyyy-MM-dd");
    day_after_last.setDate(day_after_last.getDate() + 1);
    _results = [];
    while (today_is.getTime() < day_after_last.getTime()) {
      events_today = this.get_events_for_day(today_is);
      if (events_today.length > 0) {
        cfd = new CashFiddle.CashFlowDay(CashFiddle.DateExtensions.to_ymd(today_is), this.current_cash);
        for (_i = 0, _len = events_today.length; _i < _len; _i++) {
          event = events_today[_i];
          cfd.add_flo_event(event);
        }
        this.add_day(cfd);
      }
      _results.push(today_is.setDate(today_is.getDate() + 1));
    }
    return _results;
  };

  return CashFlow;

})();

CashFiddle.CashFlowDay = (function() {

  CashFlowDay.prototype.date = null;

  CashFlowDay.prototype.flo_events = [];

  CashFlowDay.prototype.cash_before = 0;

  function CashFlowDay(date, cash_before) {
    this.date = date;
    this.cash_before = cash_before;
    this.date = CashFiddle.DateExtensions.parse(this.date);
    this.flo_events = [];
  }

  CashFlowDay.prototype.add_flo_event = function(item) {
    item.set_ts(this.date);
    return this.flo_events.push(item);
  };

  CashFlowDay.prototype.cash_after = function() {
    var cash, change, flo_item, _i, _len, _ref1;
    cash = this.cash_before;
    change = 0;
    _ref1 = this.flo_events;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      flo_item = _ref1[_i];
      change += flo_item.change_value;
    }
    cash += change;
    return cash;
  };

  return CashFlowDay;

})();

CashFiddle.FloEvent = (function() {

  FloEvent.prototype.change_value = 0;

  FloEvent.prototype.name = "";

  FloEvent.prototype.ts = null;

  FloEvent.prototype.set_ts = function(datestring) {
    this.ts = CashFiddle.DateExtensions.parse(datestring);
    return CashFiddle.DateExtensions.assert_valid(this.ts);
  };

  FloEvent.prototype.get_date_string = function() {
    return "" + (this.ts.getFullYear()) + "-" + (CashFiddle.StringExtensions.lpad0(this.ts.getMonth() + 1)) + "-" + (CashFiddle.StringExtensions.lpad0(this.ts.getDate()));
  };

  function FloEvent(change_value, name, ts) {
    this.change_value = change_value != null ? change_value : 0;
    this.name = name != null ? name : "";
    if (ts == null) {
      ts = null;
    }
    this.set_ts(ts);
  }

  return FloEvent;

})();

CashFiddle.FloEventRepeatable = (function(_super) {

  __extends(FloEventRepeatable, _super);

  FloEventRepeatable.prototype.ts_start = null;

  FloEventRepeatable.prototype.ts_stop = null;

  FloEventRepeatable.prototype.repeat_on_day_of_week = null;

  FloEventRepeatable.prototype.repeat_on_day_of_month = null;

  FloEventRepeatable.prototype.repeat_in_these_months_only = null;

  function FloEventRepeatable(change_value, name) {
    this.change_value = change_value;
    this.name = name;
    ({
      repeat_on_day_of_week: null,
      repeat_on_day_of_month: null,
      repeat_in_these_months_only: null
    });
  }

  FloEventRepeatable.prototype.validate_dates = function(additional) {
    var d;
    if (additional == null) {
      additional = Date.today();
    }
    return d = {
      start: this.ts_start,
      stop: this.ts_stop,
      additional: additional
    };
  };

  FloEventRepeatable.prototype.set_repeat_on_days_of_week = function(days) {
    return this.repeat_on_day_of_week = CashFiddle.ArrayExtensions.make_from_scalar(days);
  };

  FloEventRepeatable.prototype.set_repeat_on_days_of_month = function(days) {
    return this.repeat_on_day_of_month = CashFiddle.ArrayExtensions.make_from_scalar(days);
  };

  FloEventRepeatable.prototype.set_repeat_in_these_months_only = function(months) {
    return this.repeat_in_these_months_only = CashFiddle.ArrayExtensions.make_from_scalar(months);
  };

  FloEventRepeatable.prototype.is_valid_for_date = function(date) {
    var after_start, before_end, dow, month_in_year, reasons_if_invalid, valid;
    valid = true;
    reasons_if_invalid = [];
    after_start = this.ts_start === null || date.getTime() >= this.ts_start.getTime();
    before_end = this.ts_stop === null || date.getTime() <= this.ts_stop.getTime();
    if (!(after_start && before_end)) {
      valid = false;
      reasons_if_invalid.push("Date is not in the range [" + this.ts_start + "." + this.ts_stop + "]");
    }
    if (this.repeat_on_day_of_week != null) {
      dow = ((date.getDay() + 6) % 7) + 1;
      if (this.repeat_on_day_of_week.indexOf(dow) === -1) {
        reasons_if_invalid.push("Event is set to repeat on days of week (" + this.repeat_on_day_of_week + ") and the day." + dow + " does not fit");
        valid = false;
      }
    }
    if (this.repeat_on_day_of_month != null) {
      dow = date.getDate();
      if (this.repeat_on_day_of_month.indexOf(dow) === -1) {
        reasons_if_invalid.push("Event is set to repeat on days of month (" + this.repeat_on_day_of_month + ") and the day." + dow + " does not fit");
        valid = false;
      }
    }
    if (this.repeat_in_these_months_only != null) {
      month_in_year = date.getMonth() + 1;
      if (this.repeat_in_these_months_only.indexOf(month_in_year) === -1) {
        reasons_if_invalid.push("Event is set to repeat only in months: (" + this.repeat_in_these_months_only + ") and the month [" + month_in_year + "] does not fit");
        valid = false;
      }
    }
    return valid;
  };

  FloEventRepeatable.prototype.to_s = function() {
    return "" + this.change_value + " at " + (CashFiddle.DateExtensions.to_ymd(this.ts_start)) + "-" + (CashFiddle.DateExtensions.to_ymd(this.ts_stop)) + " repeated on [" + this.repeat_on_day_of_week + "," + this.repeat_on_day_of_month + "," + this.repeat_in_these_months_only + "]";
  };

  return FloEventRepeatable;

})(CashFiddle.FloEvent);

CashFiddle.ParserException = (function() {

  ParserException.prototype.msg = "";

  ParserException.prototype.line_nr = null;

  function ParserException(msg, line_nr) {
    this.msg = msg;
    this.line_nr = line_nr != null ? line_nr : '?';
  }

  return ParserException;

})();

CashFiddle.ParseError = (function(_super) {

  __extends(ParseError, _super);

  function ParseError() {
    return ParseError.__super__.constructor.apply(this, arguments);
  }

  return ParseError;

})(CashFiddle.ParserException);

/*
	CashFiddle.App is the main controller that handles app flow.
	At this time, you just pass in the input.
*/

var tpl;

CashFiddle.App = (function() {

  App.prototype.error_handler = null;

  App.prototype.app_state = null;

  function App() {
    this.app_state = new CashFiddle.AppState(window.localStorage, Base64);
  }

  App.prototype.run = function() {
    this.app_state.load_from_local_storage();
    if (!this.app_state.is_loaded()) {
      CashFiddle.DefaultValues.fill_all();
      this.bind_view_to_state();
    }
    return this.bind_state_to_view();
  };

  App.prototype.bind_state_to_view = function() {
    var vname, _i, _len, _ref, _results,
      _this = this;
    $("body").on('click', "#recalc", function() {
      _this.recalc();
      $('html, body').animate({
        scrollTop: $("#results").offset().top
      }, 500);
      return false;
    });
    _ref = this.app_state.get_data_keys();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vname = _ref[_i];
      _results.push($("#" + vname).val(this.app_state[vname]));
    }
    return _results;
  };

  App.prototype.bind_view_to_state = function() {
    var vname, _i, _len, _ref, _results;
    _ref = this.app_state.get_data_keys();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vname = _ref[_i];
      _results.push(this.app_state[vname] = $("#" + vname).val());
    }
    return _results;
  };

  App.prototype.recalc = function() {
    var cf, flows, parser, parser_rep, rep_flows;
    this.bind_view_to_state();
    try {
      parser = new CashFiddle.TxtFlowParser(this.app_state.events);
      flows = parser.parse();
      parser_rep = new CashFiddle.TxtFlowRepeatableParser(this.app_state.events_rep);
      rep_flows = parser_rep.parse();
      cf = new CashFiddle.CashFlow(this.app_state.start_date, this.app_state.end_date, parseInt(this.app_state.cash_start));
      cf.set_events(flows, rep_flows);
      CashFiddle.ExpenditureTable.fill_table_from_days(cf.flo_days_array());
      CashFiddle.FlowChart.make_chart_from_days(cf.flo_days_array());
    } catch (e) {
      if (e instanceof CashFiddle.ParserException) {
        console.log(e.msg);
      } else {
        console.error(e);
        alert(e);
      }
    }
    this.app_state.save_to_local_storage();
    return false;
  };

  return App;

})();

CashFiddle.AppState = (function() {

  AppState.prototype.state_loaded = false;

  AppState.prototype.storage_container = null;

  AppState.prototype.data_encoder = null;

  AppState.prototype.end_date = null;

  AppState.prototype.start_date = null;

  AppState.prototype.cash_start = null;

  AppState.prototype.events = null;

  AppState.prototype.events_rep = null;

  function AppState(storage_container, data_encoder) {
    this.storage_container = storage_container;
    this.data_encoder = data_encoder;
  }

  AppState.prototype.get_data_keys = function() {
    return ['start_date', 'end_date', 'cash_start', 'events', 'events_rep'];
  };

  AppState.prototype.is_loaded = function() {
    return this.state_loaded;
  };

  AppState.prototype.get_json = function() {
    return JSON.stringify({
      end_date: this.end_date,
      start_date: this.start_date,
      cash_start: this.cash_start,
      events: this.events,
      events_rep: this.events_rep
    });
  };

  AppState.prototype.save_to_local_storage = function() {
    return this.storage_container['cashfiddle_data_json'] = this.get_json();
  };

  AppState.prototype.load_from_local_storage = function() {
    var data, json;
    json = this.storage_container['cashfiddle_data_json'];
    if (json != null) {
      data = JSON.parse(json);
    }
    if (data != null) {
      this.end_date = data.end_date;
      this.start_date = data.start_date;
      this.cash_start = data.cash_start;
      this.events = data.events;
      this.events_rep = data.events_rep;
      return this.state_loaded = true;
    }
  };

  AppState.prototype.load_from_encoded_str = function() {};

  AppState.prototype.get_encoded_str = function() {};

  return AppState;

})();

/* THIS will handle messages, like errors and info messages    
class CashFiddle.MessageHandler
    messages: null
    
    constructor: () ->
        @reset()
        
    reset: ->
        @messages = 
            error: []
            warning: []
            info: []
    
    addMessage: (msg, type) ->
        @messages[type].push msg
*/


CashFiddle.DefaultValues = (function() {
  var one_time, repeatable;

  function DefaultValues() {}

  one_time = "-100 on %year_month_now%-10 because I'm going out to dinner\n+2000 on %year_month_now%-12 - I'm getting a premium\n-200 @ %year_month_now%-20 - Buying a present\n-3000 @ %year_month_next_month%-15 - Buying a new laptop\n-10000 @ %year_month_three_months%-07 - Renovate kitchen";

  repeatable = "4500 every month on 5th ending at %year_month_three_months%-04 - Paycheck from Widget Inc.\n6000 every month on 5th starting at %year_month_three_months%-01 - Paycheck from SuperCoolStartup\n-5000 every august on the 1st - Splurge on vacation\n-88 every month on 12th - Internet\n-850 every month on 6 - Rent\n-70 every monday - Grocery shopping";

  DefaultValues.replace_date_placeholders = function(str) {
    var d, d_1m, d_3m, d_6m, key, val, vars, year_month;
    year_month = function(d) {
      return d.getFullYear() + '-' + CashFiddle.StringExtensions.lpad0(d.getMonth() + 1);
    };
    vars = {};
    d = new Date();
    d_1m = new Date(d.getFullYear(), d.getMonth() + 1);
    d_3m = new Date(d.getFullYear(), d.getMonth() + 3);
    d_6m = new Date(d.getFullYear(), d.getMonth() + 6);
    vars['year_month_now'] = year_month(d);
    vars['year_month_next_month'] = year_month(d_1m);
    vars['year_month_three_months'] = year_month(d_3m);
    vars['year_month_six_months'] = year_month(d_6m);
    for (key in vars) {
      val = vars[key];
      str = str.replace(new RegExp("%" + key + "%", "gi"), val);
    }
    return str;
  };

  DefaultValues.fill_all = function() {
    this.fill_events();
    return this.fill_dates();
  };

  DefaultValues.fill_events = function() {
    $("#events").val(this.replace_date_placeholders(one_time));
    return $("#events_rep").val(this.replace_date_placeholders(repeatable));
  };

  DefaultValues.fill_dates = function() {
    $("#end_date").val(this.replace_date_placeholders("%year_month_six_months%-01"));
    return $("#start_date").val(this.replace_date_placeholders("%year_month_now%-01"));
  };

  return DefaultValues;

})();

CashFiddle.ExpenditureTable = (function() {

  function ExpenditureTable() {}

  ExpenditureTable.fill_table_from_days = function(days) {
    var day, day_event_names, event, html, _i, _len, _results;
    $("#cashflow-table tbody").html('');
    _results = [];
    for (_i = 0, _len = days.length; _i < _len; _i++) {
      day = days[_i];
      day_event_names = (function() {
        var _j, _len1, _ref, _results1;
        _ref = day.flo_events;
        _results1 = [];
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          event = _ref[_j];
          _results1.push(event.name);
        }
        return _results1;
      })();
      html = tpl('cashflowday-row', {
        date: CashFiddle.DateExtensions.to_ymd(day.date),
        cash_after: day.cash_after(),
        events: day_event_names
      });
      _results.push($("#cashflow-table tbody").append(html));
    }
    return _results;
  };

  return ExpenditureTable;

})();

CashFiddle.FlowChart = (function() {
  var _this = this;

  function FlowChart() {}

  FlowChart.make_chart_from_days = function(days) {
    var chart_options, chart_values, day, _i, _len;
    chart_values = [];
    for (_i = 0, _len = days.length; _i < _len; _i++) {
      day = days[_i];
      chart_values.push([CashFiddle.DateExtensions.parse(day.date).getTime(), day.cash_after()]);
    }
    chart_options = {
      colors: ["#0088CC", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
      lines: {
        show: true,
        fill: true
      },
      points: {
        show: true
      },
      xaxis: {
        mode: "time"
      },
      grid: {
        hoverable: true,
        backgroundColor: {
          colors: ["#fff", "#DBEFFB"]
        },
        borderWidth: 1
      }
    };
    $.plot("#cf-chart", [chart_values], chart_options);
    return $("#cf-chart").bind("plothover", this.on_chart_hover);
  };

  FlowChart.on_chart_hover = function(event, pos, item) {
    var previousPoint, x, y;
    if (item) {
      if (previousPoint !== item.dataIndex) {
        previousPoint = item.dataIndex;
        $("#tooltip").remove();
        x = CashFiddle.DateExtensions.to_ymd(new Date(item.datapoint[0]));
        y = item.datapoint[1].toFixed(0);
        return FlowChart.showTooltip(item.pageX, item.pageY, x + ": " + y + " PLN");
      }
    } else {
      $("#tooltip").remove();
      return previousPoint = null;
    }
  };

  FlowChart.showTooltip = function(x, y, contents) {
    return $("<div id='tooltip'>" + contents + "</div>").css({
      position: "absolute",
      display: "none",
      top: y + 5,
      left: x + 5,
      border: "1px solid #fdd",
      padding: "2px",
      "background-color": "#fee",
      opacity: 0.80
    }).appendTo("body").fadeIn(200);
  };

  return FlowChart;

}).call(this);

tpl = function(tpl_id, context) {
  var source, template;
  source = $("#" + tpl_id).html();
  template = Handlebars.compile(source);
  return template(context);
};
