## CashFiddle

CashFiddle is a project to make a simple web based tools for financial uses.
The basic premise if that all input will be text, and the whole thing
client-side and thus fast and simple.

A this time, there is a vision of 2 separate tools:

* [somewhat done] Cash flow - show a graph of projected cash flow for a given time and events - both one-off and repeatable.
* [planned & started] Debt calculator - given X number of people, where the people give uneven amount
    of money for a common cause, calculate who owes who what and present it in

## Todo

### Bugs

* fix chart x axis
* debootstrap - change default look & feel
* translate bottom sections of this readme from Polish

### Features

####[importance: 1]:
* Autosaving to local storage (as a user I want to be able to open the browser and pick up where I left of)
* Parsing hashbangs (as a user I want to be able to share the results with other people)
* Make the a grunt task to copy `view/index.html` to `dist/` (as the developer I want to have the `dist/' folder be auto managerd

####[importance: 2]:
* add currency
* add interactivity to chart (hovering on points displays items)

## Roadmap (todo for later)

* Save as url (backend)
* Add spending advisor - given a list of "want to have"`s give an appropriate date of when something can be bought (not causing negative cash flow)
* Add savings advisor - given a set of rules, advise on how much can money can you save at a given time (to not cause negative cashflow later on)
* Make the debt calculator

## Contributing



## Changelog

### 0.1.0

#### build 14: 2013-04-22
* first relatively working version
* still a lot to do, but relatively useful (at least for me)


### 0.0.0 (pre-release)

#### build 13: 2013-04-10

* switched do NV-D3 charts, but encountered serious issues
* trying out flot as a stable, known and small choice


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



