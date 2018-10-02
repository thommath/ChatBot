## Define language for reducing

.filter(t => t.bill_date > date && t.bill_date < date2)
.reduce((cur, acc) => cur.total + acc)

get transactions after {start_date} in {category} and reduce transaction total plus accumilator


S := <expression>
func := <expression> | <expression> if <condition> else <expression>

condition := <expression> | <expression> <comp> <expression> | <condition> <condition_merger> <condition>
condition_merger := || | &&

expression := <list> | property | number | <var> | <function> <expression> | <expression> <op> <expression> | <expression> if <condition> else <expression>

list := [] | [<listItem>]
listItem := <expression> | <expression>, <expression>

comp := < | > | <= | => | == | !=
op := + | - | * | / | .
var := i | cur | acc | all
func := ! <condition>



V2

S := <expression> | <expression> then <S>
expression := 
    function do <expression> | 
    while <condition> do <expression>
    remember <expression> as <string> | 
    <expression> also <expression> | 
    <expression> if <condition> else <expression> | 
    run <expression> | 
    <expression> <op> <expression> | 
    <list> | 
    property | 
    number | 
    <var> | 

list := [] | [<listItem>]
listItem := <expression> | <expression>, <expression>

comp := < | > | <= | => | == | !=
op := + | - | * | / | .


V3

S := <expression> | <expression> then <S>
expression := 
    function <expression> | 
    while <condition> do <expression>
    remember <expression> as <string> | set <string> to <expression>
    if <condition> do <expression> else <expression> |
    <expression> also <expression> |
    run <expression> | 
    <expression> <op> <expression> | 
    <list> | 
    <string> | 
    <number> | 
    <var> | 

list := [] | [<listItem>]
listItem := <expression> | <expression>, <expression>

comp := < | > | <= | => | == | !=
op := + | - | * | / | .




# Todo
Add categories as possible input list
()
remember vars in scope
Remember inside remember, while inside while etc.  
Remember inside remember 
Remove function 'do'
Remove language function
Add quotes for string 