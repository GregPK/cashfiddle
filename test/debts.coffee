test_strings_debt =
    txt1: """
          XX -> 30 -> ZZ
          """
    txt2: """
          XX -> 20 -> YY
          YY -> 10 -> XX
          """
    multiple_people: """
                     XX -> 60 -> XX,YY,ZZ
                     YY -> 20 -> XX
                     """


module "Parsing debts from plaintext"

test "Parsing simple text", ->
    parser = new CashFiddle.TxtDebtParser test_strings_debt.txt1
    debts = parser.parse()

    equal parser.lines.length, 1, "Parser should have parsed 1 line"
    equal debts.length, 1, "Parser should have extracted 1 debt"

    ok debts[0].from != undefined, "The parse results should be a debt (have a from attr)"
    ok debts[0].to != undefined, "The parse results should be a debt (have a to attr)"
    ok debts[0].amount != undefined, "The parse results should be a debt (have a amount attr)"

    ok ArrayExtensions.compare_flat(debts[0].from,["XX"]), "The person in debt should be [XX], is [#{debts[0].from}]"
    ok ArrayExtensions.compare_flat(debts[0].to,["ZZ"]), "The person to whom the debt is owed should be [ZZ], is [#{debts[0].to}]"
    ok debts[0].amount == 30, "The amount should be 30, is [#{debts[0].amount}]"

test "Parsing two lines", ->
    parser = new CashFiddle.TxtDebtParser test_strings_debt.txt2
    debts = parser.parse()

    equal parser.lines.length, 2, "Parser should have parsed 2 line"
    equal debts.length, 2, "Parser should have extracted 2 debts"

    d1 = debts[0]
    ok ArrayExtensions.compare_flat(d1.from,["XX"]), "The person in debt should be XX is [#{d1.from}]"
    ok ArrayExtensions.compare_flat(d1.to,["YY"]), "The person to whom the debt is owed should be YY, is [#{d1.to}]"
    ok d1.amount == 20, "The amount should be 20, is [#{d1.amount}]"

    d1 = debts[1]
    ok ArrayExtensions.compare_flat(d1.from,["YY"]), "The person in debt should be [YY], is [#{d1.from}]"
    ok ArrayExtensions.compare_flat(d1.to,["XX"]), "The person to whom the debt is owed should be XX is [#{d1.to}]"
    ok d1.amount == 10, "The amount should be 10, is [#{d1.amount}]"


test "Parsing two lines with multiple personas", ->
    parser = new CashFiddle.TxtDebtParser test_strings_debt.multiple_people
    debts = parser.parse()

    equal parser.lines.length, 2, "Parser should have parsed 2 line"
    equal debts.length, 2, "Parser should have extracted 2 debts"

    d1 = debts[0]
    ok ArrayExtensions.compare_flat(d1.from,["XX"]), "The person in debt should be XX is [#{d1.from}]"
    ok ArrayExtensions.compare_flat(d1.to,["XX", "YY", "ZZ"]), "There should be 3 poeple, is [#{d1.to}]"
    ok d1.amount == 60, "The amount should be 60, is [#{d1.amount}]"

    d1 = debts[1]
    ok ArrayExtensions.compare_flat(d1.from,["YY"]), "The person in debt should be [YY], is [#{d1.from}]"
    ok ArrayExtensions.compare_flat(d1.to,["XX"]), "The person to whom the debt is owed should be XX is [#{d1.to}]"
    ok d1.amount == 20, "The amount should be 20, is [#{d1.amount}]"
