import mysql from 'mysql';
import {sqlConfig} from "../config.js";

const connection = mysql.createConnection(sqlConfig);

export function connect() {
    connection.connect(function(err) {
        if (err) throw err;
    });
}


export async function insertPrice(price) {
    const str = 'INSERT into price_all SET ?';
    connection.query(str, price, (err, result) => {
        if (err) {
            console.log('insert price',err);
        }
    })
}
export async function insertBitGetPoint(point, source) {

    let str = 'INSERT into scatter_bitget SET ?';
    connection.query(str, point, (err, result) => {
        if (err) {
            console.log('insert bitget point',err);
        }
        // else{
        //     console.log('insert point',result);
        //     return result;
        // }
    })
}
export async function insertByBitPoint(point, source) {

    let str = 'INSERT into scatter_bybit SET ?';
    connection.query(str, point, (err, result) => {
        if (err) {
            console.log('insert bybit point',err);
        }
        // else{
        //     console.log('insert point',result);
        //     return result;
        // }
    })
}
export  function queryPoints(source, symbol,timeBefore) {
    let str;
    if (source === 'BitGet') {
        str = 'SELECT x,y1,y2 FROM scatter_bitget WHERE x < ? AND symbol = ? LIMIT 500';
    }else{
        str = 'SELECT x,y1,y2 FROM scatter_bybit WHERE x < ? AND symbol = ? LIMIT 500';
    }
    connection.query(str,[timeBefore, symbol], (err, result) => {
        if (err) {
            console.log('query points',err);
        }else{
            return result;
        }
    })
}
