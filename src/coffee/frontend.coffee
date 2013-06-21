
###
	CashFiddle.App is the main controller that handles app flow.
	At this time, you just pass in the input.
###

class CashFiddle.App
    error_handler: null
    app_state: null
    
    constructor: () ->
        @app_state = new CashFiddle.AppState(window.localStorage,Base64)
        
    run: ->
        @app_state.load_from_local_storage()
        unless @app_state.is_loaded()
            CashFiddle.DefaultValues.fill_all()
            @bind_view_to_state()
        @bind_state_to_view()
        
    

    bind_state_to_view: ->
        $("body").on 'click', "#recalc" , =>
            @recalc()
            $('html, body').animate( {
                scrollTop: $("#results").offset().top
            }, 500)
            return false
        
        for vname in @app_state.get_data_keys()
            $("#"+vname).val(@app_state[vname])
    
    bind_view_to_state: ->
        for vname in @app_state.get_data_keys()
            @app_state[vname] = $("#"+vname).val()
            
    recalc: () ->
        @bind_view_to_state()
    
        try
            parser = new CashFiddle.TxtFlowParser @app_state.events
            flows = parser.parse()
            
            parser_rep = new CashFiddle.TxtFlowRepeatableParser @app_state.events_rep
            rep_flows = parser_rep.parse()
            
            cf = new CashFiddle.CashFlow( @app_state.start_date, @app_state.end_date, parseInt(@app_state.cash_start))
            cf.set_events flows,rep_flows
            
            CashFiddle.ExpenditureTable.fill_table_from_days cf.flo_days_array()
            CashFiddle.FlowChart.make_chart_from_days(cf.flo_days_array())
        catch e 
            if e instanceof CashFiddle.ParserException
                console.log(e.msg)
            else
                console.error e
                alert(e)
        @app_state.save_to_local_storage()   
        false
    
class CashFiddle.AppState
    state_loaded: false
    
    # an object that handles state (usually window.localStorage)
    storage_container: null
    # used to encode/decode data, expects an object with encode(str), decode(str) functions
    data_encoder: null
    
    end_date: null
    start_date: null
    cash_start: null
    
    events: null
    events_rep: null
    
    constructor: (@storage_container,@data_encoder) ->
    
    get_data_keys: () ->
        ['start_date','end_date','cash_start','events','events_rep']
    
    is_loaded: ->
        @state_loaded
    
    get_json: ->
        return JSON.stringify
            end_date: @end_date                
            start_date: @start_date
            cash_start: @cash_start
            events: @events
            events_rep: @events_rep
        
    save_to_local_storage: ->
        @storage_container['cashfiddle_data_json'] = @get_json()
    
    load_from_local_storage: ->
        json = @storage_container['cashfiddle_data_json']
        data = JSON.parse(json) if json?
        if data?
            @end_date = data.end_date                
            @start_date = data.start_date
            @cash_start = data.cash_start
            @events = data.events
            @events_rep = data.events_rep
            @state_loaded = true
    
    # @todo
    load_from_encoded_str: ->
    # @todo    
    get_encoded_str: ->        

### THIS will handle messages, like errors and info messages    
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
###                

class CashFiddle.DefaultValues
    one_time = """
    -100 on %year_month_now%-10 because I'm going out to dinner
    +2000 on %year_month_now%-12 - I'm getting a premium
    -200 @ %year_month_now%-20 - Buying a present
    -3000 @ %year_month_next_month%-15 - Buying a new laptop
    -10000 @ %year_month_three_months%-07 - Renovate kitchen
    """
    repeatable = """
    4500 every month on 5th ending at %year_month_three_months%-04 - Paycheck from Widget Inc.
    6000 every month on 5th starting at %year_month_three_months%-01 - Paycheck from SuperCoolStartup
    -5000 every august on the 1st - Splurge on vacation
    -88 every month on 12th - Internet
    -850 every month on 6 - Rent
    -70 every monday - Grocery shopping
    """

    @replace_date_placeholders: (str) ->
        year_month = (d) ->
             d.getFullYear() + '-' + CashFiddle.StringExtensions.lpad0(d.getMonth()+1)
                
        vars = {}
        d = new Date()
        d_1m = new Date(d.getFullYear(), d.getMonth()+1)
        d_3m = new Date(d.getFullYear(), d.getMonth()+3)
        d_6m = new Date(d.getFullYear(), d.getMonth()+6)
        
        vars['year_month_now'] = year_month(d)
        vars['year_month_next_month'] = year_month(d_1m)
        vars['year_month_three_months'] = year_month(d_3m)
        vars['year_month_six_months'] = year_month(d_6m)
        
        str = str.replace(new RegExp("%#{key}%","gi"),val) for key,val of vars
        str
    @fill_all: () ->
        @fill_events()    
        @fill_dates()
    
    @fill_events: () -> 
        $("#events").val(@replace_date_placeholders(one_time))
        $("#events_rep").val(@replace_date_placeholders(repeatable))
        
    @fill_dates: () -> 
        $("#end_date").val(@replace_date_placeholders("%year_month_six_months%-01"))    
        $("#start_date").val(@replace_date_placeholders("%year_month_now%-01"))
        
         
class CashFiddle.ExpenditureTable
    @fill_table_from_days = (days) ->
        $("#cashflow-table tbody").html('')
        for day in days
            day_event_names = (event.name for event in day.flo_events)
            html = tpl('cashflowday-row', { date: CashFiddle.DateExtensions.to_ymd(day.date), cash_after: day.cash_after(), events:day_event_names} )
            $("#cashflow-table tbody").append html
    
class CashFiddle.FlowChart
    @make_chart_from_days = (days) ->
        chart_values = []
        for day in days
            chart_values.push [CashFiddle.DateExtensions.parse(day.date).getTime(),day.cash_after()]
    
        chart_options =
            colors: ["#0088CC", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
            lines: 
                show: true
                fill: true
            points: 
                show: true
            xaxis:
                mode: "time"
            grid:
                hoverable: true
                backgroundColor: 
                    colors: [ "#fff", "#DBEFFB" ]
                borderWidth: 1
    
        $.plot("#cf-chart", [chart_values], chart_options)
        $("#cf-chart").bind("plothover", @on_chart_hover)

			
    
    @on_chart_hover = (event, pos, item) ->
        if (item)
            if (previousPoint != item.dataIndex)
                previousPoint = item.dataIndex;
                $("#tooltip").remove()
                x = CashFiddle.DateExtensions.to_ymd(new Date(item.datapoint[0]))
                y = item.datapoint[1].toFixed(0)
    
                @showTooltip(item.pageX, item.pageY, x + ": " + y + " PLN")
        else
            $("#tooltip").remove()
            previousPoint = null                 
    
    @showTooltip = (x, y, contents) ->
        $("<div id='tooltip'>" + contents + "</div>").css(
            position: "absolute"
            display: "none"
            top: y + 5
            left: x + 5
            border: "1px solid #fdd"
            padding: "2px"
            "background-color": "#fee"
            opacity: 0.80
        ).appendTo("body").fadeIn 200    

tpl = (tpl_id,context) ->
    source     = $("#"+tpl_id).html()
    template = Handlebars.compile source
    
    template(context)
    
    
    
    
