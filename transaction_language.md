## Define language for reducing

.filter(t => t.bill_date > date && t.bill_date < date2)
.reduce((cur, acc) => cur.total + acc)

get transactions after {start_date} in {category} and reduce transaction total plus accumilator


S := <expression>
func := <expression> | <expression> if <condition> else <expression>

condition := <expression> | <expression> <comp> <expression> | <condition> <condition_merger> <condition>
condition_merger := || | &&

expression := <list> | property-of-elem | number | <var> | <expression> <op> <expression> | <somthing> if <condition> else <expression>

list := [] | [<listItem>]
listItem := <expression> | <expression>, <expression>

comp := < | > | <= | => | == | !=
op := + | - | * | / | ++
var := i | cur | acc | all.length
func := ! <condition>

# Todo
Add syntax for filter to get correct length
nest reduce? 
Add categories as possible input list
Add not

filter:
reduce((cur, acc) => 
    acc + cur if cur.something op something else acc
)
sum: 
reduce ((cur, acc) => acc + cur.something)

avg:
reduce((cur, acc, i, all) => acc + cur.something/all.length)

length: 
reduce((cur, acc) => acc + 1)




parameters: 
    start_date
    end_date
    except_categories
    including_categories
    reduce_any
    

