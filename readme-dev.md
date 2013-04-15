## BHAG

* $1000/month in passive income
* How? Advertisements? What?

## Todo

MVP:
* Test cases
	** Repeatable events cash flow
	** Combined events cash flow
* Interface
	** make najs chart with interactivity
	** debootstrap
* Autosaving to local storage

Later:
* Save as url (backend)
* add spending advisor


## Ideas

* Later on - make the debt calculator

## Changelog

### 0.0.0

#### build 12: 2013-04-02

* basic chart based on chart.js now working
* caught a bug - repetable event for february and august (only in months) not working properly - writing tests
* ^ also writing a mixed integration test for parsers of both types of events 


#### build 11: 2013-03-29

* made preliminary interface
* implemented showing days as table
* got rid of date.js
* some administrative tools (Guard + Rake) to easy dev

#### build 10: 2013-03-26

* finished cash flow testing (preliminary)
* starting to get rid of dependency (Date.js)

#### build 9: 2013-03-24

* beginning work on repeatable event parser passes all tests
* starting work on test cases for cash flows for repeatable objects
* rewrote CashFlow#recalculate to account for repeatables

#### build 8: 2013-03-19

* repeatable events tested and working
* made a test case for repeatable event parser
* beginning work on repeatable event parser

#### build 7: 2013-03-14

* początki tworzenia powtarzalnych wydarzeń
* dorzucenie date.js jako zależności - będzie przydatne do parsowania dat i takich tam


#### build 6: 2013-03-13

* rozbicie testów na flow i debt, obiekty nadal w jednym pliku

#### build 5: 2013-03-10

* dalszy rozwój testów, parsera, obliczeń
* rozwiązanie problemów z dziedziczeniem JS

#### build 4: 2013-03-09

* testy do cashflow - na razie bez powtórzeń
* pierwsze boje

#### build 4:

* zmiana kierunku na narzędzie głównie do cashflow (rozliczanie mniej przydatne)
* wstępne obiekty cashflowowe


#### build 3:

* dostosowanie do grunt 0.4
* możliwość uruchamaniania testów z konsoli

#### build 2:

* ustawienie unit testów i testowanie na dwóch przypadkach
* refactoring na testy
* nazwa cashfiddle się pojawiła

#### build 1:

* Pomysł na zrobienie szybkiego rozliczacza na podstawie plaintextu.
* Napisanie szybkiego parsera w coffee-script



