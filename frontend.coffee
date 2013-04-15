recalc = (start_date,end_date,cash_start,events_string,events_rep_string) ->
  cash_start = parseInt cash_start
  parser = new TxtFlowParser events_string
  flows = parser.parse()
  
  
  parser_rep = new TxtFlowRepeatableParser events_rep_string
  rep_flows = parser_rep.parse()
  
  #console.log "Found #{flows.length} events"
  
  cf = new CashFlow(start_date,end_date,cash_start)
  cf.set_events flows,rep_flows
  
  fill_table_from_days cf.flo_days
  chart = make_chart_from_days(cf.flo_days)
  nv.addGraph chart
  
  false

fill_table_from_days = (days) ->
  $("#cashflow-table tbody").html('')
  for day in days
    day_event_names = (event.name for event in day.flo_events)
    html = tpl('cashflowday-row', { date: day.date, cash_after: day.cash_after(), events:day_event_names} )
    $("#cashflow-table tbody").append html
  
make_chart_from_days = (days) ->

  chart = nv.models.lineChart()

  chart.xAxis
    .axisLabel('Date')
    .rotateLabels(-45)
    .tickFormat (d) ->
      return d3.time.format('%Y-%m-%d')(new Date(d))

  chart.yAxis
    .axisLabel('Cash (PLN)')
    #.tickFormat(d3.format('d'))

  chart_values = []
  for day in days
    point = 
      "x": DateExtentions.parse(day.date).getTime()
      "y": day.cash_after()
    chart_values.push point
    
  chart_axis_cash =
    key: "Cash"
    color: '#ff7f0e'
    values: chart_values
    
  d3.select('#myChart svg')
    .datum([chart_axis_cash])
    .transition().duration(500)
    .call(chart)

  nv.utils.windowResize( -> 
    d3.select('#chart svg').call(chart)
  )

  return chart

tpl = (tpl_id,context) ->
  source   = $("#"+tpl_id).html()
  template = Handlebars.compile source
  
  template(context)
  
  
  
  
