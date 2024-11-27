import {queryPoints,connect} from "./src/sql.js";

connect()
queryPoints('ByBit','GRASS', Date.now(), function(err,result){
    console.log(result);
})

