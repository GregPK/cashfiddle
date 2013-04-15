var test_strings_flo;

test_strings_flo = {
  basic_flo_events_one_month: "-100 on 2013-03-10 because I'm going out to dinner\n+2000 on 2013-03-12 - I'm getting a premium\n-200 @ 2013-03-20 - Buying a present",
  repeatable_events_only: "-4300 every february,august on the 1st ending on 2014-01-30 - Repay outstanding debt\n3500 every month on 18th ending at 2013-04-30 - Paycheck (G)\n6200 every month on 10th starting at 2013-06-01 - Paycheck\n-88 every month on 12th - Internet\n-550 every month on 6 - Rent\n-850 every 8th - Loan repayment\n-70 every monday,fri - Grocery shopping"
};

module("Parsing simple flows from plaintext");

test("Parsing simple 3 line parsing", function() {
  var f1, flows, parser;
  parser = new TxtFlowParser(test_strings_flo.basic_flo_events_one_month);
  flows = parser.parse();
  equal(parser.lines.length, 3, "Parser should have parsed 3 lines");
  equal(flows.length, 3, "Parser should have extracted 3 flow events");
  f1 = flows.shift();
  ok(f1.change_value === -100, "change_value should be -100, is:  [" + f1.change_value + "]");
  ok(f1.get_date_string() === '2013-03-10', "ts should be [2013-03-10], is:  [" + (f1.get_date_string()) + "]");
  ok(f1.name === "I'm going out to dinner", "name should be [I'm going out to dinner], is:  [" + f1.name + "]");
  f1 = flows.shift();
  ok(f1.change_value === 2000, "change_value should be [2000], is:  [" + f1.change_value + "]");
  ok(f1.get_date_string() === '2013-03-12', "ts should be [2013-03-12], is:  [" + (f1.get_date_string()) + "]");
  ok(f1.name === "I'm getting a premium", "name should be [I'm getting a premium], is:  [" + f1.name + "]");
  f1 = flows.shift();
  ok(f1.change_value === -200, "change_value should be [-200], is:  [" + f1.change_value + "]");
  ok(f1.get_date_string() === '2013-03-20', "ts should be [2013-03-20], is:  [" + (f1.get_date_string()) + "]");
  return ok(f1.name === "Buying a present", "name should be [Buying a present], is:  [" + f1.name + "]");
});

module("Parsing repeatable flows from plaintext");

/*
    todo: Check endind and starting dates
*/


test("Parsing only repeatable events, all cases", function() {
  var check_flow_repeatable, flows, parser;
  parser = new TxtFlowRepeatableParser(test_strings_flo.repeatable_events_only);
  flows = parser.parse();
  equal(parser.lines.length, 7, "Parser should have parsed 7 lines");
  equal(flows.length, 7, "Parser should have extracted 7 flow events");
  check_flow_repeatable = function(flow, value, name, repeat_on_day_of_month, repeat_on_day_of_week, repeat_in_these_months_only, ts_start, ts_stop) {
    var skip_start_dates, skip_stop_dates, start_dates_match, stop_dates_match;
    if (repeat_on_day_of_week == null) {
      repeat_on_day_of_week = null;
    }
    if (repeat_in_these_months_only == null) {
      repeat_in_these_months_only = null;
    }
    if (ts_start == null) {
      ts_start = null;
    }
    if (ts_stop == null) {
      ts_stop = null;
    }
    ok(flow.name === name, "FER.name should be [" + name + "], is [" + flow.name + "]");
    ok(flow.change_value === value, "FER.change_value should be [" + value + "], is [" + flow.change_value + "]");
    ok((flow.repeat_on_day_of_month === null && repeat_on_day_of_month === null) || ArrayExtensions.compare_flat(flow.repeat_on_day_of_month, repeat_on_day_of_month), "FER.repeat_on_day_of_month should be " + repeat_on_day_of_month + ", is " + flow.repeat_on_day_of_month);
    ok((flow.repeat_on_day_of_week === null && repeat_on_day_of_week === null) || ArrayExtensions.compare_flat(flow.repeat_on_day_of_week, repeat_on_day_of_week), "FER.repeat_on_day_of_week should be " + repeat_on_day_of_week + ", is " + flow.repeat_on_day_of_week);
    ok((flow.repeat_in_these_months_only === null && repeat_in_these_months_only === null) || ArrayExtensions.compare_flat(flow.repeat_in_these_months_only, repeat_in_these_months_only), "FER.repeat_in_these_months_only should be " + repeat_in_these_months_only + ", is " + flow.repeat_in_these_months_only);
    skip_start_dates = flow.ts_start === null && ts_start === null;
    start_dates_match = !skip_start_dates && ((ts_start != null) && (flow.ts_start != null) && flow.ts_start.getTime() === ts_start.getTime());
    ok(skip_start_dates || start_dates_match, "FER.ts_start should be " + ts_start + ", is " + flow.ts_start);
    skip_stop_dates = flow.ts_stop === null && ts_stop === null;
    stop_dates_match = !skip_stop_dates && ((ts_stop != null) && (flow.ts_stop != null) && flow.ts_stop.getTime() === ts_stop.getTime());
    return ok(skip_stop_dates || stop_dates_match, "FER.ts_stop should be " + ts_stop + ", is " + flow.ts_stop);
  };
  check_flow_repeatable(flows.shift(), -4300, 'Repay outstanding debt', [1], null, [2, 8], null, DateExtentions.parse('2014-01-30'));
  check_flow_repeatable(flows.shift(), 3500, 'Paycheck (G)', [18], null, null, null, DateExtentions.parse('2013-04-30'));
  check_flow_repeatable(flows.shift(), 6200, 'Paycheck', [10], null, null, DateExtentions.parse('2013-06-01'), null);
  check_flow_repeatable(flows.shift(), -88, 'Internet', [12]);
  check_flow_repeatable(flows.shift(), -550, 'Rent', [6]);
  check_flow_repeatable(flows.shift(), -850, 'Loan repayment', [8]);
  return check_flow_repeatable(flows.shift(), -70, 'Grocery shopping', null, [1, 5]);
});

module("Checking calculations (isolated from parser)");

test("Testing CashFlowDay (isolated from flow)", function() {
  var ca, cfd;
  cfd = new CashFlowDay('2013-03-13', 0);
  cfd.add_flo_event(new FloEvent(100, '1', '2013-03-13'));
  ca = cfd.cash_after();
  ok(ca === 100, "CashFlowDay after 1 event should be 100, is " + ca);
  cfd.add_flo_event(new FloEvent(-1000, '2', '2013-03-13'));
  ca = cfd.cash_after();
  ok(ca === -900, "CashFlowDay after 2 events should be -900, is " + ca);
  cfd.add_flo_event(new FloEvent(2000, '3', '2013-03-13'));
  ca = cfd.cash_after();
  return ok(ca === 1100, "CashFlowDay after 3 events should be 1100, is " + ca);
});

test("Testing repeatable events ", function() {
  var event, testDate;
  testDate = function(flo_event, date, expected) {
    var res;
    if (expected == null) {
      expected = true;
    }
    res = flo_event.is_valid_for_date(date);
    return ok(res === expected, "Event(" + (flo_event.to_s()) + ") should be " + expected + " for " + date + ", was " + res);
  };
  event = new FloEventRepeatable(-600, "");
  event.ts_start = DateExtentions.parse('2013-03-01');
  event.ts_stop = DateExtentions.parse('2013-03-31');
  testDate(event, DateExtentions.parse('2013-02-27'), false);
  testDate(event, DateExtentions.parse('2013-04-01'), false);
  testDate(event, DateExtentions.parse('2013-03-01'), true);
  testDate(event, DateExtentions.parse('2013-03-31'), true);
  event.set_repeat_on_days_of_week(1);
  testDate(event, DateExtentions.parse('2013-03-11'), true);
  testDate(event, DateExtentions.parse('2013-03-18'), true);
  testDate(event, DateExtentions.parse('2013-03-25'), true);
  testDate(event, DateExtentions.parse('2013-03-10'), false);
  testDate(event, DateExtentions.parse('2013-03-12'), false);
  testDate(event, DateExtentions.parse('2013-03-13'), false);
  testDate(event, DateExtentions.parse('2013-03-14'), false);
  testDate(event, DateExtentions.parse('2013-03-15'), false);
  testDate(event, DateExtentions.parse('2013-03-16'), false);
  testDate(event, DateExtentions.parse('2013-03-17'), false);
  event.set_repeat_on_days_of_week(null);
  event.set_repeat_on_days_of_month(1);
  testDate(event, DateExtentions.parse('2013-03-01'), true);
  testDate(event, DateExtentions.parse('2013-03-10'), false);
  testDate(event, DateExtentions.parse('2013-03-12'), false);
  testDate(event, DateExtentions.parse('2013-03-13'), false);
  event.set_repeat_on_days_of_month(14);
  testDate(event, DateExtentions.parse('2013-03-14'), true);
  testDate(event, DateExtentions.parse('2013-03-01'), false);
  testDate(event, DateExtentions.parse('2013-03-10'), false);
  testDate(event, DateExtentions.parse('2013-03-12'), false);
  testDate(event, DateExtentions.parse('2013-03-13'), false);
  event.set_repeat_on_days_of_month([1, 3, 9, 16, 25]);
  testDate(event, DateExtentions.parse('2013-03-01'), true);
  testDate(event, DateExtentions.parse('2013-03-03'), true);
  testDate(event, DateExtentions.parse('2013-03-09'), true);
  testDate(event, DateExtentions.parse('2013-03-16'), true);
  testDate(event, DateExtentions.parse('2013-03-25'), true);
  testDate(event, DateExtentions.parse('2013-03-02'), false);
  testDate(event, DateExtentions.parse('2013-03-12'), false);
  testDate(event, DateExtentions.parse('2013-03-13'), false);
  testDate(event, DateExtentions.parse('2013-03-20'), false);
  testDate(event, DateExtentions.parse('2013-03-26'), false);
  return testDate(event, DateExtentions.parse('2013-03-28'), false);
});

test("Simple one month calculation for five items", function() {
  var cf;
  cf = new CashFlow('2013-03-01', '2013-03-31', 1000);
  cf.add_flow(new FloEvent(-100, "I'm going out to dinner", '2013-03-10'));
  ok(cf.current_cash === 900, "Current cash should be 900 after first event, is " + cf.current_cash);
  cf.add_flow(new FloEvent(2000, "I'm getting a premium", '2013-03-12'));
  ok(cf.current_cash === 2900, "Current cash should be 2900 after second event, is " + cf.current_cash);
  cf.add_flow(new FloEvent(-100, "Buying a present", '2013-03-20'));
  ok(cf.current_cash === 2800, "Current cash should be 2800 after third event, is " + cf.current_cash);
  return ok(cf.flo_days.length === 4, "CashFlow should calculate 4 days (1 start + 3 events), is " + cf.flo_days.length);
});

module("Testing parser based cashflows");

test("Testing cashflow based on repeatable events", function() {
  var cf, check_event_count_for_day, day, flows, parser, uneventful_dates, _i, _len;
  parser = new TxtFlowRepeatableParser(test_strings_flo.repeatable_events_only);
  flows = parser.parse();
  cf = new CashFlow('2013-04-01', '2013-05-01', 5000);
  cf.set_events([], flows);
  check_event_count_for_day = function(dates, count_exp) {
    var count_is, date, _i, _len, _results;
    if (dates.constructor.name !== 'Array') {
      dates = [dates];
    }
    _results = [];
    for (_i = 0, _len = dates.length; _i < _len; _i++) {
      date = dates[_i];
      count_is = cf.get_events_for_day(date).length;
      _results.push(ok(count_is === count_exp, "CashFlow should get [" + count_exp + "] events for [" + date + "] , is [" + count_is + "]"));
    }
    return _results;
  };
  check_event_count_for_day(new Date('2013/04/01'), 2);
  check_event_count_for_day(new Date('2013/04/05'), 1);
  check_event_count_for_day(new Date('2013/04/06'), 1);
  check_event_count_for_day(new Date('2013/04/08'), 2);
  check_event_count_for_day(new Date('2013/04/12'), 2);
  check_event_count_for_day(new Date('2013/04/15'), 1);
  check_event_count_for_day(new Date('2013/04/18'), 1);
  check_event_count_for_day(new Date('2013/04/19'), 1);
  check_event_count_for_day(new Date('2013/04/22'), 1);
  check_event_count_for_day(new Date('2013/04/26'), 1);
  check_event_count_for_day(new Date('2013/04/29'), 1);
  uneventful_dates = ["02", "03", "04", "07", "09", "11", "13", "14", "16", "17", "20", "21", "23", "24", "25", "27", "28", "30"];
  for (_i = 0, _len = uneventful_dates.length; _i < _len; _i++) {
    day = uneventful_dates[_i];
    check_event_count_for_day(new Date('2013/04/' + day), 0);
  }
  return ok(cf.flo_days.length === 13, "CashFlow should calculate 13 days (5 monthly start + 4x2 weekly), is " + cf.flo_days.length);
});

test("Testing mixed cashflow for 3 months based on repeatable events, with all features", function() {
  var cf, check_cash_for_day, day, flows, flows_rep, last_cash, mixed_flo, parser, parser_rep, uneventful_dates, _i, _len, _results;
  mixed_flo = {
    "static": "+500 on 2013-05-01 - One time event 1\n+1000 on 2013-04-01 - One time event 2\n-1500 @ 2013-03-20 - One time event 3",
    repeatable: "-4000 every february,august on the 1st ending on 2014-01-30 - Repeatable (1st february,august) \n4500 every month on 18th ending at 2013-04-30 - Repeatable (18th, ending on 2013-04-30)\n6500 every month on 18th starting at 2013-05-01 - Repeatable (17th, starting at 2013-05-01)\n-500 every month on 6 - Repeatable (6-th every month)\n-100 every monday,fri - Repeatable (every monday and friday)"
  };
  parser = new TxtFlowParser(mixed_flo["static"]);
  parser_rep = new TxtFlowRepeatableParser(mixed_flo.repeatable);
  flows = parser.parse();
  flows_rep = parser_rep.parse();
  cf = new CashFlow('2013-04-01', '2013-06-01', 5000);
  cf.set_events(flows_rep, flows);
  last_cash = 5000;
  check_cash_for_day = function(dates, cash_exp) {
    var cash_is, date, day, _i, _len, _results;
    if (dates.constructor.name !== 'Array') {
      dates = [dates];
    }
    _results = [];
    for (_i = 0, _len = dates.length; _i < _len; _i++) {
      date = dates[_i];
      day = cf.get_day_for_date(date);
      _results.push(cash_is = ok(count_is === count_exp, "CashFlow should get [" + count_exp + "] events for [" + date + "] , is [" + count_is + "]"));
    }
    return _results;
  };
  uneventful_dates = ["02", "03", "04", "07", "09", "11", "13", "14", "16", "17", "20", "21", "23", "24", "25", "27", "28", "30"];
  _results = [];
  for (_i = 0, _len = uneventful_dates.length; _i < _len; _i++) {
    day = uneventful_dates[_i];
    _results.push(check_event_count_for_day(new Date('2013/04/' + day), 0));
  }
  return _results;
});

module("Testing auxilary extensions");

test("String extensions", function() {
  var lptest;
  lptest = function(n, should) {
    var res;
    res = StringExtensions.lpad0(n);
    return ok(res === should, "lpad0(" + n + ") should be [" + should + "], is [" + res + "]");
  };
  lptest(0, "00");
  lptest(1, "01");
  lptest(9, "09");
  lptest(10, "10");
  return lptest(99, "99");
});

test("ArrayExtensions", function() {
  var arrTest;
  arrTest = function(a1, a2, a3, should) {
    var res;
    if (a3 == null) {
      a3 = null;
    }
    if (should == null) {
      should = true;
    }
    res = ArrayExtensions.compare_flat(a1, a2, a3);
    return ok(res === should, "Expecting " + should + " when comparing [" + a1 + "," + a2 + "," + a3 + "], is " + res);
  };
  arrTest(['A'], ['A']);
  arrTest(['A', 'B'], ['A', 'B']);
  arrTest(['A', 'B'], ['A', 'B']);
  arrTest(['A', 'B'], ['A', 'B'], ['A', 'B']);
  arrTest(['A'], ['B'], null, false);
  arrTest(['A', 'X'], ['A', 'B'], null, false);
  arrTest(['A', 'X'], ['A', 'B'], null, false);
  arrTest(['A', 'X'], ['A', 'B'], ['A', 'B'], false);
  ok(ArrayExtensions.make_from_scalar(null) === null);
  ok(ArrayExtensions.compare_flat(ArrayExtensions.make_from_scalar(1), [1]));
  return ok(ArrayExtensions.compare_flat(ArrayExtensions.make_from_scalar([1]), [1]));
});

test("DateExtensions", function() {});
