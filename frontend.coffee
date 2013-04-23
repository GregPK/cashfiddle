recalc = (start_date,end_date,cash_start,events_string,events_rep_string) ->
  cash_start = parseInt cash_start
  parser = new TxtFlowParser events_string
  flows = parser.parse()
  
  
  parser_rep = new TxtFlowRepeatableParser events_rep_string
  rep_flows = parser_rep.parse()
  
  #console.log "Found #{flows.length} events"
  
  cf = new CashFlow(start_date,end_date,cash_start)
  cf.set_events flows,rep_flows
  
  fill_table_from_days cf.flo_days_array()
  make_chart_from_days(cf.flo_days_array())
  
  false

fill_table_from_days = (days) ->
  $("#cashflow-table tbody").html('')
  for day in days
    day_event_names = (event.name for event in day.flo_events)
    html = tpl('cashflowday-row', { date: DateExtensions.to_ymd(day.date), cash_after: day.cash_after(), events:day_event_names} )
    $("#cashflow-table tbody").append html
  
make_chart_from_days = (days) ->

  chart_values = []
  for day in days
    chart_values.push [DateExtensions.parse(day.date).getTime(),day.cash_after()]

  chart_options =
    colors: ["#0088CC", "#afd8f8", "#cb4b4b", "#4da74d", "#9440ed"],
    lines: 
      show: true
      fill: true
    points: 
      show: true
    xaxix:
      mode: "time"
      timeformat: "%Y-%M-%D"
      minTickSize: [1, "day"]
    grid:
      hoverable: true
      backgroundColor: 
        colors: [ "#fff", "#DBEFFB" ]
      borderWidth: 1

  $.plot("#cf-chart", [chart_values], chart_options)
  $("#cf-chart").bind("plothover", on_chart_hover)

			
  
on_chart_hover = (event, pos, item) ->
  if (item)
    if (previousPoint != item.dataIndex)
      previousPoint = item.dataIndex;
      $("#tooltip").remove()
      x = DateExtensions.to_ymd(new Date(item.datapoint[0]))
      y = item.datapoint[1].toFixed(0)

      showTooltip(item.pageX, item.pageY, x + ": " + y + "PLN")
  else
    $("#tooltip").remove()
    previousPoint = null         
  
showTooltip = (x, y, contents) ->
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
  source   = $("#"+tpl_id).html()
  template = Handlebars.compile source
  
  template(context)
  
  
  
  
