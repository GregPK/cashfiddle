window.CashFiddle ?= {}

class CashFiddle.StringExtensions
    @lpad0: (str, n = 2) ->
        str = '' + str
        while str.length < n
            str = '0' + str
        str

class CashFiddle.ArrayExtensions
    @compare_flat: (arrBase, others...) ->
        return false unless arrBase?
        for i in arrBase
            for a in others when a?
                return false if a.indexOf(i) == -1
        true

    @make_from_scalar: (scalar) ->
        if scalar == null
            return null
        if typeof scalar == 'string'
            scalar = parseInt(scalar)
        if typeof scalar == 'number'
            scalar = [scalar]
        if typeof scalar == 'object' and typeof scalar.length == 'undefined'
            throw "Bad scalar passed in [#{scalar}"
        scalar
        
class  CashFiddle.DateExtensions
    @is_valid: (date) ->
        unless date != 'object' or date.constructor.name != 'Date'
            date = @parse(date)
        not isNaN(date.getTime())
    @assert_valid: (date) ->
        if typeof date != 'object' or date.constructor.name != 'Date'
            throw "Expected Date to be passed in DateExtensions.assert_valid, got #{date}"
        throw "Setting Invalid date from [#{datestring}]" unless @is_valid(date)

    @parse: (datestring) ->
        return datestring if datestring.constructor.name == 'Date'
        datestring = datestring.replace(/-/g,'/')
        date = new Date(datestring)
        date
    @to_ymd: (date) ->
      d = date.getDate()
      m = date.getMonth() + 1
      y = date.getFullYear()
      m = '0' + m if m <= 9
      d = '0' + d if d <= 9
      "#{y}-#{m}-#{d}"    

class CashFiddle.Actor
    name: ""

class CashFiddle.Debt
    from: []
    to: []
    amount: null

    constructor: (@from, @amount, @to) ->

class CashFiddle.Cashier
    actors:
        {}
    debts: []
    parsing_strategy: null

    constructor: (@parsing_strategy) ->

class CashFiddle.Parser
    input: null

    constructor: (@input) ->
        #console.log "Inputting: " + @input

    parse: ->
        raise "Parser has to be inherited"

class CashFiddle.PlainTextLineParser extends CashFiddle.Parser
    output: []
    current_line: 1
    lines: []

    parse: ->
        @output = []
        @lines = @input.trim().split "\n"
        for line in @lines
            @output.push @parse_line(line)
            @current_line++
        @output

    parse_line: (line) ->
        raise "parse_line has to be implemented in inheriting prototypes"

###
The TxtDebtParser class is a the strategy for handling debt input handling for the Cashier.
###
class CashFiddle.TxtDebtParser extends CashFiddle.PlainTextLineParser
    who_divider: "->" #asdasd

    parse_line: (line) ->
        if line.indexOf(@who_divider) == -1
            throw "Debt direction identifier [#{@who_divider}] missing in line nr #{@current_line} [#{line}]"
            #throw new ParseError("Debt direction identifier [#{@who_divider}] missing in line nr #{@current_line} [#{line}]")
        components = line.split @who_divider

        from = components[0].trim().split(',')
        to = components[2].trim().split(',')
        amount = parseFloat(components[1].trim())
        debt = new CashFiddle.Debt(from, amount, to)
        console.log debt
        debt

class CashFiddle.TxtFlowParser extends CashFiddle.PlainTextLineParser
    LINE_PARSE_REGEX = /// ^
    	([+-]?\s?            # gain or expenditure (gain by default)
    	\d{1,})		    # value of change
    	\s+?(at|on|@)      # date operators
    	\s+?(\d{4}-\d{2}-\d{2})  # the date
    	\s(-|because)    # naming operators
    	\s(.+)              # name title for event
    	///

    parse_line: (line) ->
        rgx_parsed = LINE_PARSE_REGEX.exec(line)

        if rgx_parsed == null
            end = "on line #{@current_line}: [#{line}]"
            unless line.match /at|on|@/
                throw new CashFiddle.ParserException("Missing date operator [at|on|@] " + end,@current_line)
            else unless line.match /-|because/
                throw new CashFiddle.ParserException("Missing name operator [-|because] " + end,@current_line)
            else unless line.match /[+-]?\s?\d{1,}/
                throw new CashFiddle.ParserException("Missing value " + end,@current_line)
            else
                throw new CashFiddle.ParserException("Just bad line " + end,@current_line)

        @current_line++

        amount = parseFloat(rgx_parsed[1].trim())
        date = rgx_parsed[3].trim()
        name = rgx_parsed[5].trim()

        event = new CashFiddle.FloEvent(amount, name, date)
        event

class CashFiddle.SimpleWhitespaceTokenParser
    line: null
    NON_TOKEN_REGEXP = /(\s+)/
    tokens: []

    constructor: (@line) ->
        @tokens = []
        @tokens.push token for token in @line.split NON_TOKEN_REGEXP when token.trim().length > 0

class CashFiddle.TxtFlowRepeatableParser extends CashFiddle.PlainTextLineParser
    DAYS_OF_WEEK = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    DAYS_OF_WEEK_SHORT = ['mon','tue','wed','thu','fri','sat','sun']
    MONTH_REGEXP = /January|February|March|April|May|June|July|August|September|October|November|December/gi
    MONTHS_SHORT = ['january','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
    DAY_REGEXP = /((mon)|(tues)|(tue)|(wed)|(wednes)|(thu)|(thurs)|(fri)|(sat)|(satur)|(sun))(day)?/gi

    parse_line: (line) ->
        tokenizer = new CashFiddle.SimpleWhitespaceTokenParser(line)
        last_token = null
        mode = null
        event = null

        parser_err_end = " on line #{@current_line}: [#{line}]"
        #console.log tokenizer.tokens.join("|")
        for token, i in tokenizer.tokens
            continue if token in ['every','because','on','the','month','-','at'] # syntactic sugar - throwaways

            if i == 0 # the value should always be first
                val = parseInt token
                if val == 0 then throw new CashFiddle.ParserException "Value of event is [0], should be something" + parser_err_end
                event = new CashFiddle.FloEventRepeatable(val,"")
            else
                if token.match MONTH_REGEXP
                    months = @get_months_repeat token
                    event.set_repeat_in_these_months_only(months)
                else if token.match DAY_REGEXP
                    days = @get_days_of_week_repeat token
                    event.set_repeat_on_days_of_week days
                else if token.match(/ending/i)
                    last_token = token
                    continue
                else if last_token.match(/ending/i)
                    event.ts_stop = CashFiddle.DateExtensions.parse token
                else if token.match(/starting/i)
                    last_token = token
                    continue
                else if last_token.match(/starting/i)
                    event.ts_start = CashFiddle.DateExtensions.parse token
                else if parseInt(token) > 0
                    days = @get_days_of_month_repeat token
                    event.set_repeat_on_days_of_month days
                else
                    event.name += "#{token} "
            last_token = token

        event.name = event.name.trim();
        return event

    get_days_of_month_repeat: (dom_str) ->
        parseInt dom_str

    get_days_of_week_repeat: (dow_str) ->
        dow_str = dow_str.trim().replace(/day/gi,'').toLowerCase();
        parser_days = dow_str.split(',')
        days = []
        for day in parser_days
            ind = DAYS_OF_WEEK_SHORT.indexOf(day)
            days.push ind+1 if ind?
        days

    get_months_repeat: (month_str) ->
        parser_months = month_str.split(',')
        months = []
        for m in parser_months
            m = m.substr(0,3).toLowerCase();
            ind = MONTHS_SHORT.indexOf(m)
            months.push ind+1 if ind?
        months



###
    CashFlow handle converting FloEvents into FlowDays.
###
class CashFiddle.CashFlow
    start_date: null
    end_date: null
    cash_start: null

    flo_events: []
    flo_events_repeatable: []

    current_cash: 0
    flo_days: {}
    flo_days_count: 0

    constructor: (@start_date, @end_date, @cash_start) ->
        @recalculate()
        @flo_events = []
        @flo_events_repeatable = []
        @flo_days_count = 0
    
    set_events: (events, events_repeatable) ->
        @flo_events = events
        @flo_events_repeatable = events_repeatable
        @recalculate()

    flo_days_array: ->
        days = []
        days.push v for k,v of @flo_days
        days


    add_flow: (event) ->
        @flo_events.push event
        @recalculate()

    add_flow_repeatable: (event) ->
        @flo_events_repeatable.push event
        @recalculate()

    add_day: (cash_flow_day) ->
        ts_day = @day_hash(cash_flow_day.date)
        days_exists = @flo_days[ts_day]
        if days_exists?
            @flo_days[ts_day] = @merge_days(days_exists,cash_flow_day)
        else
            @flo_days[ts_day] = cash_flow_day
            @flo_days_count += 1
        #console.log("Before day add: #{@current_cash}")
        @current_cash = @flo_days[ts_day].cash_after()
        #console.log("After day add: #{@current_cash}")

    day_hash: (date) ->
        CashFiddle.DateExtensions.to_ymd(date)

    merge_days: (day, other_day) ->
        day.flo_events.push e for e in other_day.flo_events
        day

    get_day_for_date: (date) ->
        return @flo_days[@day_hash(date)]

    # todo: should probably optimize (make hashes of events by date)
    get_events_for_day: (date) ->
        ev = []
         
        ev.push flo_event for flo_event in @flo_events when flo_event.ts.getTime() == date.getTime()
        ev.push flo_event for flo_event in @flo_events_repeatable when flo_event.is_valid_for_date(date)
            
        ev

    recalculate: ->
        #console.log "Calculating when CashFlow has #{@flo_events.length} flow events"
        @flo_days = []
        @flo_days_count = 0
        @current_cash = 0

        @add_day(new CashFiddle.CashFlowDay(@start_date, @cash_start)) # add first day - starting point

        start_date = CashFiddle.DateExtensions.parse(@start_date, "yyyy-MM-dd");
        today_is = start_date;
        day_after_last = CashFiddle.DateExtensions.parse(@end_date, "yyyy-MM-dd")
        day_after_last.setDate(day_after_last.getDate()+1)
        
        while today_is.getTime() < day_after_last.getTime()
            events_today = @get_events_for_day(today_is)
            
            if events_today.length > 0
                console.log "adding day for #{today_is}"
                cfd = new CashFiddle.CashFlowDay(CashFiddle.DateExtensions.to_ymd(today_is), @current_cash)
                cfd.add_flo_event event for event in events_today
                @add_day cfd
            
            today_is.setDate(today_is.getDate()+1)


class CashFiddle.CashFlowDay
    date: null
    flo_events: []
    cash_before: 0

    constructor: (@date, @cash_before) ->
        @date = CashFiddle.DateExtensions.parse @date
        @flo_events = []

    add_flo_event: (item) ->
        item.set_ts(@date)
        @flo_events.push item

    cash_after: ->
        #console.log "### Calculating after for day #{@date}, starting at #{@cash_before}"
        cash = @cash_before
        change = 0
        change += flo_item.change_value for flo_item in @flo_events
        cash += change
        #console.log "### ending at #{cash}, changed by #{change}"
        cash


class CashFiddle.FloEvent
    change_value: 0
    name: ""
    ts: null

    set_ts: (datestring) ->
        @ts = CashFiddle.DateExtensions.parse(datestring)
        CashFiddle.DateExtensions.assert_valid(@ts)

    
    get_date_string: ->
        "#{@ts.getFullYear()}-#{CashFiddle.StringExtensions.lpad0(@ts.getMonth() + 1)}-#{CashFiddle.StringExtensions.lpad0 @ts.getDate()}"

    constructor: (@change_value = 0, @name = "", ts = null) ->
        @set_ts(ts)
        #console.debug "Creating FloEvent(#{@change_value}, #{@name}, #{@ts}"


class CashFiddle.FloEventRepeatable extends CashFiddle.FloEvent
    ts_start: null
    ts_stop: null
    repeat_on_day_of_week: null
    repeat_on_day_of_month: null
    repeat_in_these_months_only: null

    constructor: (@change_value, @name) ->
        #DateExtensions.assert_valid(@ts_start)
        #DateExtensions.assert_valid(@ts_stop)
        repeat_on_day_of_week: null
        repeat_on_day_of_month: null
        repeat_in_these_months_only: null

    validate_dates: (additional) ->
        additional = Date.today() unless additional?
        d = { start:@ts_start, stop:@ts_stop, additional: additional }

    set_repeat_on_days_of_week: (days) ->
        @repeat_on_day_of_week = CashFiddle.ArrayExtensions.make_from_scalar(days)

    set_repeat_on_days_of_month: (days) ->
        @repeat_on_day_of_month = CashFiddle.ArrayExtensions.make_from_scalar(days)

    set_repeat_in_these_months_only: (months) ->
        @repeat_in_these_months_only = CashFiddle.ArrayExtensions.make_from_scalar(months)


    is_valid_for_date: (date) ->
        valid = true
        reasons_if_invalid = []
        
        after_start = (@ts_start == null or date.getTime() >= @ts_start.getTime() )
        before_end = (@ts_stop == null or date.getTime() <= @ts_stop.getTime() )
        unless after_start and before_end
            valid = false
            reasons_if_invalid.push "Date is not in the range [#{@ts_start}.#{@ts_stop}]"

        if @repeat_on_day_of_week?
            dow = ((date.getDay()+6) % 7)+1 # make mon=1 ... sun=7
            if @repeat_on_day_of_week.indexOf(dow) == -1
                reasons_if_invalid.push "Event is set to repeat on days of week (#{@repeat_on_day_of_week}) and the day.#{dow} does not fit"
                valid = false
        
        if @repeat_on_day_of_month?
            dow = date.getDate()
            if @repeat_on_day_of_month.indexOf(dow) == -1
                reasons_if_invalid.push "Event is set to repeat on days of month (#{@repeat_on_day_of_month}) and the day.#{dow} does not fit"
                valid = false
        
        if @repeat_in_these_months_only?
            month_in_year = date.getMonth()+1
            if @repeat_in_these_months_only.indexOf(month_in_year) == -1
                reasons_if_invalid.push "Event is set to repeat only in months: (#{@repeat_in_these_months_only}) and the month [#{month_in_year}] does not fit"
                valid = false
            
        valid

    to_s: () ->
        "#{@change_value} at #{CashFiddle.DateExtensions.to_ymd(@ts_start)}-#{CashFiddle.DateExtensions.to_ymd(@ts_stop)} repeated on [#{@repeat_on_day_of_week},#{@repeat_on_day_of_month},#{@repeat_in_these_months_only}]"


class CashFiddle.ParserException
    msg: ""
    line_nr: null
    constructor: (@msg, @line_nr = '?') ->

class CashFiddle.ParseError extends CashFiddle.ParserException
