## Define language for reducing

.filter(t => t.bill_date > date && t.bill_date < date2)
.reduce((cur, acc) => cur.total + acc)

get transactions after {start_date} in {category} and reduce transaction total plus accumilator


S := <func>
func := <something> | <something> if <condition> else <something>

condition := <something> | <something> <comp> <something> | <condition> <condition_merger> <condition>
condition_merger := || | &&

something := property-of-elem | number | <var> | <something> <op> <something>
comp := < | > | <= | => | == | !=
op := + | - | * | /
var := i | cur | acc | all.length





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
    

