## Define language for reducing

.filter(t => t.bill_date > date && t.bill_date < date2)
.reduce((cur, acc) => cur.total + acc)

get transactions after {start_date} in {category} and reduce transaction total plus accumilator


S := <expression>
func := <expression> | <expression> if <condition> else <expression>

condition := <expression> | <expression> <comp> <expression> | <condition> <condition_merger> <condition>
condition_merger := || | &&

expression := <list> | property | number | <var> | <function> <expression> | <expression> <op> <expression> | <somthing> if <condition> else <expression>

list := [] | [<listItem>]
listItem := <expression> | <expression>, <expression>

comp := < | > | <= | => | == | !=
op := + | - | * | / | .
var := i | cur | acc | all
func := ! <condition>

# Todo
Add categories as possible input list
() 
remember vars in scope 
