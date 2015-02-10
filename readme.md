## CashFiddle

CashFiddle is a project to make simple web based tools for financial uses.
The basic premise if that all input will be text, and the whole thing
client-side and thus fast and simple.

A this time, there is a vision of 2 separate tools:

* [somewhat done] Cash flow - show a graph of projected cash flow for a given time and events - both one-off and repeatable.
* [planned & started] Debt calculator - given X number of people, where the people give uneven amount
    of money for a common cause, calculate who owes who what and present it in an appealing form

## Todo

### Bugs

 * fix chart x axis
 * debootstrap - change default look & feel
 * add validation for empty elements

### Features

####[importance: 1]:

* Parsing hashbangs (as a user I want to be able to share the results with other people)
* Add error handling
* Think about user interaction (employ user development)

####[importance: 2]:

* add currency
* add interactivity to chart (hovering on points displays items)
* add date picker

## Roadmap (todo for later)

* Save as url (backend)
* Add spending advisor - given a list of "want to have"`s give an appropriate date of when something can be bought (not causing negative cash flow)
* Add savings advisor - given a set of rules, advise on how much can money can you save at a given time (to not cause negative cashflow later on)
* Make the debt calculator

## Contributing

## Changelog

### 0.2

#### build 16: 2013-06-20

* [1] Autosaving to local storage (as a user I want to be able to open the browser and pick up where I left of)
* refactored JS from main index file to separate objects
* added main controller object CashFiddle.App
* added state managements object CashFiddle.AppState
* design tweaks

#### build 15: 2013-06-18

* revamped design to more Fiddle-like
* added icons
* revamped internals (project is actually buildable now)
* readme file translated
* namespaced all classes under 'CashFiddle', refactored most polluting functions

### 0.1

#### build 14: 2013-04-22

* first working version
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

* starting development on repeatable events
* add date.js dependency for date parsing

#### build 6: 2013-03-13

* bump debt calculator tests into separate file
* models still in one file

#### build 5: 2013-03-10

* other tests
* parser development
* fixed js pseudo inheritance glitches

#### build 4: 2013-03-09

* change of direction in favour of the more immediately useful cash flow tool
* basic cash flow models
* cashflow test cases written

#### build 3:

* move to Grunt.js 0.4
* tests can run headless via grunt and phantom.js

#### build 2:

* unit test harness
* unit test for two cases
* refactored for test
* the idea that this could be a good candidate for the "fiddle" paradigm

#### build 1:

* Idea for a quick debt calculator for multiple parties.
* Quick parser in coffeescript written



