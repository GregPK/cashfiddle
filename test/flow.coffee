test_strings_flo =
    basic_flo_events_one_month: """
                                -100 on 2013-03-10 because I'm going out to dinner
                                +2000 on 2013-03-12 - I'm getting a premium
                                -200 @ 2013-03-20 - Buying a present
                                """
    repeatable_events_only: """
                            -4300 every april,august on the 1st ending on 2014-01-30 - Repay outstanding debt
                            3500 every month on 18th ending at 2013-04-30 - Paycheck (G)
                            6200 every month on 10th starting at 2013-06-01 - Paycheck
                            -88 every month on 12th - Internet
                            -550 every month on 6 - Rent
                            -850 every 8th - Loan repayment
                            -70 every monday,fri - Grocery shopping
                            """
eq = (value, value_expected, msg = null) ->
  msg = "Expected to get #{value_expected}, got #{value}" unless msg?
  ok value == value_expected, msg 
                            
testDate = (flo_event,date,expected = true) ->
  res = flo_event.is_valid_for_date date
  ok res == expected, "Event(#{flo_event.to_s()}) should be #{expected} for #{DateExtensions.to_ymd(date)}, was #{res}"                            

check_event_count_for_day = (cf,dates,count_exp) ->
  dates = [dates] if dates.constructor.name != 'Array'
  for date in dates
    count_is = cf.get_events_for_day(date).length
    ok count_is == count_exp, "CashFlow should get [#{count_exp}] events for [#{DateExtensions.to_ymd(date)}] , is [#{count_is}]"  
                            

module "Parsing simple flows from plaintext"

test "Parsing simple 3 line parsing", ->
    parser = new TxtFlowParser test_strings_flo.basic_flo_events_one_month
    flows = parser.parse()

    equal parser.lines.length, 3, "Parser should have parsed 3 lines"
    equal flows.length, 3, "Parser should have extracted 3 flow events"

    f1 = flows.shift()
    ok f1.change_value == -100 , "change_value should be -100, is:  [#{f1.change_value}]"
    ok f1.get_date_string() == '2013-03-10', "ts should be [2013-03-10], is:  [#{f1.get_date_string()}]"
    ok f1.name == "I'm going out to dinner", "name should be [I'm going out to dinner], is:  [#{f1.name}]"

    f1 = flows.shift()
    ok f1.change_value == 2000 , "change_value should be [2000], is:  [#{f1.change_value}]"
    ok f1.get_date_string() == '2013-03-12', "ts should be [2013-03-12], is:  [#{f1.get_date_string()}]"
    ok f1.name == "I'm getting a premium", "name should be [I'm getting a premium], is:  [#{f1.name}]"

    f1 = flows.shift()
    ok f1.change_value == -200 , "change_value should be [-200], is:  [#{f1.change_value}]"
    ok f1.get_date_string() == '2013-03-20', "ts should be [2013-03-20], is:  [#{f1.get_date_string()}]"
    ok f1.name == "Buying a present", "name should be [Buying a present], is:  [#{f1.name}]"

module "Parsing repeatable flows from plaintext"

###
    todo: Check endind and starting dates
###
test "Parsing only repeatable events, all cases", ->
    parser = new TxtFlowRepeatableParser test_strings_flo.repeatable_events_only
    flows = parser.parse()

    equal parser.lines.length, 7, "Parser should have parsed 7 lines"
    equal flows.length, 7, "Parser should have extracted 7 flow events"

    check_flow_repeatable = (flow,value,name,repeat_on_day_of_month,repeat_on_day_of_week = null,repeat_in_these_months_only=null,ts_start=null,ts_stop=null) ->
        ok flow.name == name, "FER.name should be [#{name}], is [#{flow.name}]"
        ok flow.change_value == value, "FER.change_value should be [#{value}], is [#{flow.change_value}]"
        ok((flow.repeat_on_day_of_month == null and repeat_on_day_of_month == null) or ArrayExtensions.compare_flat(flow.repeat_on_day_of_month,repeat_on_day_of_month),
            "FER.repeat_on_day_of_month should be #{repeat_on_day_of_month}, is #{flow.repeat_on_day_of_month}")
        ok (flow.repeat_on_day_of_week == null and repeat_on_day_of_week == null) or ArrayExtensions.compare_flat(flow.repeat_on_day_of_week,repeat_on_day_of_week), "FER.repeat_on_day_of_week should be #{repeat_on_day_of_week}, is #{flow.repeat_on_day_of_week}"
        ok (flow.repeat_in_these_months_only == null and repeat_in_these_months_only == null) or ArrayExtensions.compare_flat(flow.repeat_in_these_months_only,repeat_in_these_months_only), "FER.repeat_in_these_months_only should be #{repeat_in_these_months_only}, is #{flow.repeat_in_these_months_only}"

        skip_start_dates = (flow.ts_start == null and ts_start == null)
        start_dates_match = not skip_start_dates and (ts_start? and flow.ts_start? and flow.ts_start.getTime() == ts_start.getTime())
        ok skip_start_dates or start_dates_match, "FER.ts_start should be #{ts_start}, is #{flow.ts_start}"

        skip_stop_dates = (flow.ts_stop == null and ts_stop == null)
        stop_dates_match = not skip_stop_dates and (ts_stop? and flow.ts_stop? and flow.ts_stop.getTime() == ts_stop.getTime())
        ok skip_stop_dates or stop_dates_match, "FER.ts_stop should be #{ts_stop}, is #{flow.ts_stop}"

    check_flow_repeatable flows.shift(), -4300, 'Repay outstanding debt', [1], null, [4,8], null, DateExtensions.parse('2014-01-30')
    check_flow_repeatable flows.shift(), 3500, 'Paycheck (G)', [18], null, null,null, DateExtensions.parse('2013-04-30')
    check_flow_repeatable flows.shift(), 6200, 'Paycheck', [10], null, null, DateExtensions.parse('2013-06-01'), null 
    check_flow_repeatable flows.shift(), -88, 'Internet', [12]
    check_flow_repeatable flows.shift(), -550, 'Rent', [6]
    check_flow_repeatable flows.shift(), -850, 'Loan repayment', [8]
    check_flow_repeatable flows.shift(), -70, 'Grocery shopping', null, [1,5]

module "Checking calculations (isolated from parser)"

test "Testing CashFlowDay (isolated from flow)", ->
    cfd = new CashFlowDay('2013-03-13',0)
    
    cfd.add_flo_event new FloEvent(100,'1', '2013-03-13')
    ca = cfd.cash_after()
    ok ca == 100, "CashFlowDay after 1 event should be 100, is #{ca}"

    cfd.add_flo_event new FloEvent(-1000,'2', '2013-03-13')
    ca = cfd.cash_after()
    ok ca == -900, "CashFlowDay after 2 events should be -900, is #{ca}"

    cfd.add_flo_event new FloEvent(2000,'3','2013-03-13')
    ca = cfd.cash_after()
    ok ca == 1100, "CashFlowDay after 3 events should be 1100, is #{ca}"

test "Testing repeatable events ", ->
    event = new FloEventRepeatable(-600,"")
    event.ts_start = DateExtensions.parse('2013-03-01')
    event.ts_stop = DateExtensions.parse('2013-03-31')

    testDate(event,DateExtensions.parse('2013-02-27'),false)
    testDate(event,DateExtensions.parse('2013-04-01'),false)
    testDate(event,DateExtensions.parse('2013-03-01'),true)
    testDate(event,DateExtensions.parse('2013-03-31'),true)

    event.set_repeat_on_days_of_week(1)

    testDate(event,DateExtensions.parse('2013-03-11'),true)
    testDate(event,DateExtensions.parse('2013-03-18'),true)
    testDate(event,DateExtensions.parse('2013-03-25'),true)

    testDate(event,DateExtensions.parse('2013-03-10'),false)
    testDate(event,DateExtensions.parse('2013-03-12'),false)
    testDate(event,DateExtensions.parse('2013-03-13'),false)
    testDate(event,DateExtensions.parse('2013-03-14'),false)
    testDate(event,DateExtensions.parse('2013-03-15'),false)
    testDate(event,DateExtensions.parse('2013-03-16'),false)
    testDate(event,DateExtensions.parse('2013-03-17'),false)

    event.set_repeat_on_days_of_week(null)
    event.set_repeat_on_days_of_month(1)
    testDate(event,DateExtensions.parse('2013-03-01'),true)
    testDate(event,DateExtensions.parse('2013-03-10'),false)
    testDate(event,DateExtensions.parse('2013-03-12'),false)
    testDate(event,DateExtensions.parse('2013-03-13'),false)

    event.set_repeat_on_days_of_month(14)
    testDate(event,DateExtensions.parse('2013-03-14'),true)
    testDate(event,DateExtensions.parse('2013-03-01'),false)
    testDate(event,DateExtensions.parse('2013-03-10'),false)
    testDate(event,DateExtensions.parse('2013-03-12'),false)
    testDate(event,DateExtensions.parse('2013-03-13'),false)

    event.set_repeat_on_days_of_month([1,3,9,16,25])
    testDate(event,DateExtensions.parse('2013-03-01'),true)
    testDate(event,DateExtensions.parse('2013-03-03'),true)
    testDate(event,DateExtensions.parse('2013-03-09'),true)
    testDate(event,DateExtensions.parse('2013-03-16'),true)
    testDate(event,DateExtensions.parse('2013-03-25'),true)
    testDate(event,DateExtensions.parse('2013-03-02'),false)
    testDate(event,DateExtensions.parse('2013-03-12'),false)
    testDate(event,DateExtensions.parse('2013-03-13'),false)
    testDate(event,DateExtensions.parse('2013-03-20'),false)
    testDate(event,DateExtensions.parse('2013-03-26'),false)
    testDate(event,DateExtensions.parse('2013-03-28'),false)
    
test "Test for repeatables for only certain months", ->
    event = new FloEventRepeatable(-600,"")
    event.ts_start = DateExtensions.parse('2013-01-01')
    event.ts_stop = DateExtensions.parse('2014-02-31')
    event.set_repeat_on_days_of_month(1)
    event.set_repeat_in_these_months_only([2,7])
    
    testDate(event,DateExtensions.parse('2013-01-01'),false)
    testDate(event,DateExtensions.parse('2013-01-15'),false)
    testDate(event,DateExtensions.parse('2013-02-01'),true)
    
    #
    for i in [1..12]
      testDate(event,DateExtensions.parse("2013-#{StringExtensions.lpad0(i)}-01"),i in [2,7])
      for d in [2..30]
        testDate(event,DateExtensions.parse("2013-#{StringExtensions.lpad0(i)}-#{StringExtensions.lpad0(d)}"),false)

    

test "Simple one month calculation for five items", ->
    cf = new CashFlow('2013-03-01', '2013-03-31', 1000)

    cf.add_flow new FloEvent(-100, "I'm going out to dinner",'2013-03-10')
    ok cf.current_cash == 900, "Current cash should be 900 after first event, is #{cf.current_cash}"

    cf.add_flow new FloEvent(2000, "I'm getting a premium",'2013-03-12')
    ok cf.current_cash == 2900, "Current cash should be 2900 after second event, is #{cf.current_cash}"

    cf.add_flow new FloEvent(-100, "Buying a present",'2013-03-20')
    ok cf.current_cash == 2800, "Current cash should be 2800 after third event, is #{cf.current_cash}"

    ok cf.flo_days_count == 4, "CashFlow should calculate 4 days (1 start + 3 events), is #{cf.flo_days.length}"

module "Testing parser based cashflows"

test "Testing cashflow based on repeatable events", ->
    parser = new TxtFlowRepeatableParser test_strings_flo.repeatable_events_only
    flows = parser.parse()
    
    cf = new CashFlow('2013-04-01', '2013-05-01', 5000)
    cf.set_events [], flows
    
    check_event_count_for_day(cf,new Date('2013/04/01'),2)
    check_event_count_for_day(cf,new Date('2013/04/05'),1)
    check_event_count_for_day(cf,new Date('2013/04/06'),1)
    check_event_count_for_day(cf,new Date('2013/04/08'),2)
    check_event_count_for_day(cf,new Date('2013/04/12'),2)
    check_event_count_for_day(cf,new Date('2013/04/15'),1)
    check_event_count_for_day(cf,new Date('2013/04/18'),1)
    check_event_count_for_day(cf,new Date('2013/04/19'),1)
    check_event_count_for_day(cf,new Date('2013/04/22'),1)
    check_event_count_for_day(cf,new Date('2013/04/26'),1)
    check_event_count_for_day(cf,new Date('2013/04/29'),1)
    
    uneventful_dates = ["02","03","04","07","09","11","13","14","16","17","20","21","23","24","25","27","28","30"]
    for day in uneventful_dates
        check_event_count_for_day(cf, new Date('2013/04/'+day),0) 
    
    ok cf.flo_days_count == 11, "CashFlow should calculate 11 days (5 monthly start + 4x2 weekly), is #{cf.flo_days_count}"
   ### 
test "Testing mixed cashflow for 3 months based on repeatable events, with all features", ->
    mixed_flo =
      static: """
                            +500 on 2013-05-01 - One time event 1
                            +1000 on 2013-04-01 - One time event 2
                            -1500 @ 2013-03-20 - One time event 3
                            """
      repeatable: """
                            -4000 every february,august on the 1st ending on 2014-01-30 - Repeatable (1st february,august) 
                            4500 every month on 18th ending at 2013-04-30 - Repeatable (18th, ending on 2013-04-30)
                            6500 every month on 18th starting at 2013-05-01 - Repeatable (17th, starting at 2013-05-01)
                            -500 every month on 6 - Repeatable (6-th every month)
                            -100 every monday,fri - Repeatable (every monday and friday)
                            """
                            
    parser = new TxtFlowParser mixed_flo.static
    parser_rep = new TxtFlowRepeatableParser mixed_flo.repeatable
    flows = parser.parse()
    flows_rep = parser_rep.parse()
    
    cf = new CashFlow('2013-04-01', '2013-06-01', 5000)
    cf.set_events flows,flows_rep
    
    last_cash = 5000
    
    check_cash_for_day = (dates,cash_exp) ->
      dates = [dates] if dates.constructor.name != 'Array'
      for date in dates
        day = cf.get_day_for_date(date)
        cash_is = 
        ok count_is == count_exp, "CashFlow should get [#{count_exp}] events for [#{date}] , is [#{count_is}]"
        
    
    uneventful_dates = ["02","03","04","07","09","11","13","14","16","17","20","21","23","24","25","27","28","30"]
    for day in uneventful_dates
      check_event_count_for_day(cf,new Date('2013/04/'+day),0)    
###

module "Testing auxilary extensions"

test "String extensions", ->
    lptest = (n,should) ->
        res = StringExtensions.lpad0(n)
        ok res == should, "lpad0(#{n}) should be [#{should}], is [#{res}]"
    lptest(0,"00")
    lptest(1,"01")
    lptest(9,"09")
    lptest(10,"10")
    lptest(99,"99")

test "ArrayExtensions", ->
    arrTest = (a1,a2,a3 = null,should = true) ->
        res = ArrayExtensions.compare_flat(a1,a2,a3)
        ok res == should, "Expecting #{should} when comparing [#{a1},#{a2},#{a3}], is #{res}"

    arrTest(['A'],['A'])
    arrTest(['A','B'],['A','B'])
    arrTest(['A','B'],['A','B'])
    arrTest(['A','B'],['A','B'],['A','B'])
    arrTest(['A'],['B'] ,null, false)
    arrTest(['A','X'],['A','B'] ,null, false)
    arrTest(['A','X'],['A','B'] ,null, false)
    arrTest(['A','X'],['A','B'],['A','B'], false)

    ok ArrayExtensions.make_from_scalar(null) == null
    ok ArrayExtensions.compare_flat(ArrayExtensions.make_from_scalar(1),[1])
    ok ArrayExtensions.compare_flat(ArrayExtensions.make_from_scalar([1]),[1])

test "DateExtensions", ->
    eq DateExtensions.parse('2013-04-17').getTime(), (new Date('2013/04/17')).getTime()
  
    
