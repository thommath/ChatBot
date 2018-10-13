# Chat Client with RegStat integration

## The client

The chatbot runs on a kubernetes cluster and is configured with environement variables.

The variables needed are:

    REGSTAT_CLIENT_SECRET - auth to regstat
    REGSTAT_CLIENT_ID - auth to regstat
    GOOGLE_APPLICATION_CREDENTIALS - access to dialogflow
    mongodburl - url with authentication to db

### Structure

Index has a persistant connection to each client and has one regstat object for each connection. It can authenticate with RegStat and get data through the api. This is in the Regstat.js file.

The intentToAction can run functions in different applicationInterfaces and returns an error if it isn't implemented yet.

Mongodb saves and loads data, very simple hacky solution made for the regstat component.

## The language

### The idea

I want to make all kinds of queries about my economy: "how much did I spend on rema last week?". This is very spesific and it will take forever to implement all these different questions in dialogflow or node.js or whatever. So I thought I can make a syntax in english that is converted to a function that is applied to reduce and let the user define the query.

    acc + cur if cur > 0 else acc

This was the first iteration of the language. The problem with this was if you wanted average on a spesific time period.

    acc + cur / length if date > "20-04-2017"

Here the length would be the length of the list before filtering. So the it must be expanded to have filter first and the do the reduce on the result. This of course was to spesific for me so I wanted to be able to describe if I wanted to have filter or reduce or something else.

This quickly expanded to be able to handle custom variables, run functions with parameters and do much more. Since it had gone so far I added while to make it a more complete language.

In the far future I see a world where I make these kinds of queries in a more normal language and have defined most of what I might want to know. When I want something else I use the functions I have defined to make it, connect to apis and etc. I want to be able to do everything by defining small functions that build on each other to be a very big voice assistant with lots of functionality defined on the fly.

### Syntax

S := <expression> | <expression> then <S>
expression := 
    function do <expression> | 
    while <condition> do <expression>
    remember <expression> as <string> | 
    <expression> also <expression> | 
    <expression> if <condition> else <expression> | 
    run <expression> {parameter <expression>}| 
    <expression> <op> <expression> | 
    <list> | 
    property | 
    number | 
    <var>

list := [] | [<listItem>]
listItem := <expression> | <expression>, <expression>

comp := < | > | <= | => | == | !=
op := + | - | * | / | .

This is kind of the definition of the syntax. You can define functions, remember variables and access them. 

Some notes: 

run: the run can have as many parameters as needed and actually runs the expression as a function with parameters. This is needed to run functions like filter and reduce with a function sent in as a parameter. This can also be used if you want to remember the result of an expresssion and not the expression by itself.
remember: This needs to be run (it gets ran by regstat chat wether you have run or not). When this is ran it remembers the expression inside and that is not ran without the run function.

Since some things are not left oriented it can be ambiguous so try to save vars instead of running everything in one line. 

### Examples

See test folder for examples on expressions you can use. 