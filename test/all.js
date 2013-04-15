var Actor, ArrayExtensions, CashFiddleApp, CashFlow, CashFlowDay, Cashier, DateExtentions, Debt, FloEvent, FloEventRepeatable, ParseError, Parser, ParserException, PlainTextLineParser, SimpleWhitespaceTokenParser, StringExtensions, TxtDebtParser, TxtFlowParser, TxtFlowRepeatableParser,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StringExtensions = (function() {

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

ArrayExtensions = (function() {

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

DateExtentions = (function() {

  function DateExtentions() {}

  DateExtentions.is_valid = function(date) {
    if (!(date !== 'object' || date.constructor.name !== 'Date')) {
      date = this.parse(date);
    }
    return !isNaN(date.getTime());
  };

  DateExtentions.assert_valid = function(date) {
    if (typeof date !== 'object' || date.constructor.name !== 'Date') {
      throw "Expected Date to be passed in DateExtentions.assert_valid, got " + date;
    }
    if (!this.is_valid(date)) {
      throw "Setting Invalid date from [" + datestring + "]";
    }
  };

  DateExtentions.parse = function(datestring) {
    var date;
    if (datestring.constructor.name === 'Date') {
      return datestring;
    }
    datestring = datestring.replace(/-/g, '/');
    date = new Date(datestring);
    return date;
  };

  DateExtentions.to_ymd = function(date) {
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

  return DateExtentions;

})();

Actor = (function() {

  function Actor() {}

  Actor.prototype.name = "";

  return Actor;

})();

Debt = (function() {

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

Cashier = (function() {

  Cashier.prototype.actors = {};

  Cashier.prototype.debts = [];

  Cashier.prototype.parsing_strategy = null;

  function Cashier(parsing_strategy) {
    this.parsing_strategy = parsing_strategy;
  }

  return Cashier;

})();

Parser = (function() {

  Parser.prototype.input = null;

  function Parser(input) {
    this.input = input;
  }

  Parser.prototype.parse = function() {
    return raise("Parser has to be inherited");
  };

  return Parser;

})();

PlainTextLineParser = (function(_super) {

  __extends(PlainTextLineParser, _super);

  function PlainTextLineParser() {
    return PlainTextLineParser.__super__.constructor.apply(this, arguments);
  }

  PlainTextLineParser.prototype.output = [];

  PlainTextLineParser.prototype.current_line = 1;

  PlainTextLineParser.prototype.lines = [];

  PlainTextLineParser.prototype.parse = function() {
    var line, _i, _len, _ref;
    this.output = [];
    this.lines = this.input.trim().split("\n");
    _ref = this.lines;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      this.output.push(this.parse_line(line));
      this.current_line++;
    }
    return this.output;
  };

  PlainTextLineParser.prototype.parse_line = function(line) {
    return raise("parse_line has to be implemented in inheriting prototypes");
  };

  return PlainTextLineParser;

})(Parser);

/*
The TxtDebtParser class is a the strategy for handling debt input handling for the Cashier.
*/


TxtDebtParser = (function(_super) {

  __extends(TxtDebtParser, _super);

  function TxtDebtParser() {
    return TxtDebtParser.__super__.constructor.apply(this, arguments);
  }

  TxtDebtParser.prototype.who_divider = "->";

  TxtDebtParser.prototype.parse_line = function(line) {
    var amount, components, debt, from, to;
    if (line.indexOf(this.who_divider) === -1) {
      throw new ParseError("Debt direction identifier [" + this.who_divider + "] missing in line nr " + this.current_line + " [" + line + "]");
    }
    components = line.split(this.who_divider);
    from = components[0].trim().split(',');
    to = components[2].trim().split(',');
    amount = parseFloat(components[1].trim());
    debt = new Debt(from, amount, to);
    console.log(debt);
    return debt;
  };

  return TxtDebtParser;

})(PlainTextLineParser);

TxtFlowParser = (function(_super) {
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
        throw new ParserException("Missing date operator [at|on|@] " + end);
      } else if (!line.match(/-|because/)) {
        throw new ParserException("Missing name operator [-|because] " + end);
      } else if (!line.match(/[+-]?\s?\d{1,}/)) {
        throw new ParserException("Missing value " + end);
      } else {
        throw new ParserException("Just bad line " + end);
      }
    }
    this.current_line++;
    amount = parseFloat(rgx_parsed[1].trim());
    date = rgx_parsed[3].trim();
    name = rgx_parsed[5].trim();
    event = new FloEvent(amount, name, date);
    return event;
  };

  return TxtFlowParser;

})(PlainTextLineParser);

SimpleWhitespaceTokenParser = (function() {
  var NON_TOKEN_REGEXP;

  SimpleWhitespaceTokenParser.prototype.line = null;

  NON_TOKEN_REGEXP = /(\s+)/;

  SimpleWhitespaceTokenParser.prototype.tokens = [];

  function SimpleWhitespaceTokenParser(line) {
    var token, _i, _len, _ref;
    this.line = line;
    this.tokens = [];
    _ref = this.line.split(NON_TOKEN_REGEXP);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      token = _ref[_i];
      if (token.trim().length > 0) {
        this.tokens.push(token);
      }
    }
  }

  return SimpleWhitespaceTokenParser;

})();

TxtFlowRepeatableParser = (function(_super) {
  var DAYS_OF_WEEK, DAYS_OF_WEEK_SHORT, DAY_REGEXP, MONTHS_SHORT, MONTH_REGEXP;

  __extends(TxtFlowRepeatableParser, _super);

  function TxtFlowRepeatableParser() {
    return TxtFlowRepeatableParser.__super__.constructor.apply(this, arguments);
  }

  DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  DAYS_OF_WEEK_SHORT = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  MONTH_REGEXP = /January|February|March|April|May|June|July|August|September|October|November|December/gi;

  MONTHS_SHORT = ['january', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  DAY_REGEXP = /((mon)|(tues)|(tue)|(wed)|(wednes)|(thu)|(thurs)|(fri)|(sat)|(satur)|(sun))(day)?/gi;

  TxtFlowRepeatableParser.prototype.parse_line = function(line) {
    var days, event, i, last_token, mode, months, parser_err_end, token, tokenizer, val, _i, _len, _ref;
    tokenizer = new SimpleWhitespaceTokenParser(line);
    last_token = null;
    mode = null;
    event = null;
    parser_err_end = " on line " + this.current_line + ": [" + line + "]";
    _ref = tokenizer.tokens;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      token = _ref[i];
      if (token === 'every' || token === 'because' || token === 'on' || token === 'the' || token === 'month' || token === '-' || token === 'at') {
        continue;
      }
      if (i === 0) {
        val = parseInt(token);
        if (val === 0) {
          throw new ParserException("Value of event is [0], should be something" + parser_err_end);
        }
        event = new FloEventRepeatable(val, "");
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
          event.ts_stop = DateExtentions.parse(token);
        } else if (token.match(/starting/i)) {
          last_token = token;
          continue;
        } else if (last_token.match(/starting/i)) {
          event.ts_start = DateExtentions.parse(token);
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

})(PlainTextLineParser);

/*
	CashFiddleApp is the main controller that handles app flow.
	At this time, you just pass in the input.
*/


CashFiddleApp = (function() {

  function CashFiddleApp(input) {
    this.input = input;
  }

  return CashFiddleApp;

})();

/*
    CashFlow handle converting FloEvents into FlowDays.
*/


CashFlow = (function() {

  CashFlow.prototype.start_date = null;

  CashFlow.prototype.end_date = null;

  CashFlow.prototype.cash_start = null;

  CashFlow.prototype.flo_events = [];

  CashFlow.prototype.flo_events_repeatable = [];

  CashFlow.prototype.current_cash = 0;

  CashFlow.prototype.flo_days = [];

  function CashFlow(start_date, end_date, cash_start) {
    this.start_date = start_date;
    this.end_date = end_date;
    this.cash_start = cash_start;
    this.recalculate();
    this.flo_events = [];
    this.flo_events_repeatable = [];
  }

  CashFlow.prototype.set_events = function(events, events_repeatable) {
    this.flo_events = events;
    this.flo_events_repeatable = events_repeatable;
    return this.recalculate();
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
    this.flo_days.push(cash_flow_day);
    return this.current_cash = cash_flow_day.cash_after();
  };

  CashFlow.prototype.get_day_for_date = function(date) {
    var day, day_date, _i, _len, _ref;
    date = DateExtentions.parse(date);
    _ref = this.flo_days;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      day = _ref[_i];
      day_date = DateExtentions.parse(day.date);
      if (day_date.getTime() === date.getTime()) {
        return day;
      }
    }
    return null;
  };

  CashFlow.prototype.get_events_for_day = function(date) {
    var ev, flo_event, _i, _j, _len, _len1, _ref, _ref1;
    ev = [];
    _ref = this.flo_events;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      flo_event = _ref[_i];
      if (flo_event.ts.getTime() === date.getTime()) {
        ev.push(flo_event);
      }
    }
    _ref1 = this.flo_events_repeatable;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      flo_event = _ref1[_j];
      if (flo_event.is_valid_for_date(date)) {
        ev.push(flo_event);
      }
    }
    return ev;
  };

  CashFlow.prototype.recalculate = function() {
    var cfd, day_after_last, event, events_today, start_date, today_is, _i, _len, _results;
    this.flo_days = [];
    this.current_cash = 0;
    this.add_day(new CashFlowDay(this.start_date, this.cash_start));
    start_date = DateExtentions.parse(this.start_date, "yyyy-MM-dd");
    today_is = start_date;
    day_after_last = DateExtentions.parse(this.end_date, "yyyy-MM-dd");
    day_after_last.setDate(day_after_last.getDate() + 1);
    _results = [];
    while (today_is.getTime() < day_after_last.getTime()) {
      events_today = this.get_events_for_day(today_is);
      if (events_today.length > 0) {
        console.log("adding day for " + today_is);
        cfd = new CashFlowDay(DateExtentions.to_ymd(today_is), this.current_cash);
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

CashFlowDay = (function() {

  CashFlowDay.prototype.date = null;

  CashFlowDay.prototype.flo_events = [];

  CashFlowDay.prototype.cash_before = 0;

  function CashFlowDay(date, cash_before) {
    this.date = date;
    this.cash_before = cash_before;
    this.flo_events = [];
  }

  CashFlowDay.prototype.add_flo_event = function(item) {
    item.set_ts(this.date);
    return this.flo_events.push(item);
  };

  CashFlowDay.prototype.cash_after = function() {
    var cash, change, flo_item, _i, _len, _ref;
    cash = this.cash_before;
    change = 0;
    _ref = this.flo_events;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      flo_item = _ref[_i];
      change += flo_item.change_value;
    }
    cash += change;
    return cash;
  };

  return CashFlowDay;

})();

FloEvent = (function() {

  FloEvent.prototype.change_value = 0;

  FloEvent.prototype.name = "";

  FloEvent.prototype.ts = null;

  FloEvent.prototype.set_ts = function(datestring) {
    this.ts = DateExtentions.parse(datestring);
    return DateExtentions.assert_valid(this.ts);
  };

  FloEvent.prototype.get_date_string = function() {
    return "" + (this.ts.getFullYear()) + "-" + (StringExtensions.lpad0(this.ts.getMonth() + 1)) + "-" + (StringExtensions.lpad0(this.ts.getDate()));
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

FloEventRepeatable = (function(_super) {

  __extends(FloEventRepeatable, _super);

  FloEventRepeatable.prototype.ts_start = null;

  FloEventRepeatable.prototype.ts_stop = null;

  FloEventRepeatable.prototype.repeat_on_day_of_week = null;

  FloEventRepeatable.prototype.repeat_on_day_of_month = null;

  FloEventRepeatable.prototype.repeat_in_these_months_only = null;

  function FloEventRepeatable(change_value, name) {
    this.change_value = change_value;
    this.name = name;
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
    return this.repeat_on_day_of_week = ArrayExtensions.make_from_scalar(days);
  };

  FloEventRepeatable.prototype.set_repeat_on_days_of_month = function(days) {
    return this.repeat_on_day_of_month = ArrayExtensions.make_from_scalar(days);
  };

  FloEventRepeatable.prototype.set_repeat_in_these_months_only = function(months) {
    return this.repeat_in_these_months_only = ArrayExtensions.make_from_scalar(months);
  };

  FloEventRepeatable.prototype.is_valid_for_date = function(date) {
    var after_start, before_end, dow, reasons_if_invalid, valid;
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
    return valid;
  };

  FloEventRepeatable.prototype.to_s = function() {
    return "" + this.change_value + " at " + this.ts_start + "-" + this.ts_stop + " repeated on [" + this.repeat_on_day_of_week + "," + this.repeat_on_day_of_month + "," + this.repeat_in_these_months_only + "]";
  };

  return FloEventRepeatable;

})(FloEvent);

ParserException = (function() {

  function ParserException(msg) {
    this.msg = msg;
  }

  return ParserException;

})();

ParseError = (function(_super) {

  __extends(ParseError, _super);

  function ParseError() {
    return ParseError.__super__.constructor.apply(this, arguments);
  }

  return ParseError;

})(ParserException);
