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
export async function insertBitGetPoint(point) {

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
export async function insertByBitPoint(point) {

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
export function queryPoints(source, symbol,timeBefore, callback) {
    let str;
    if (source === 'BitGet') {
        str = 'SELECT * FROM scatter_bitget WHERE x < ? AND symbol = ? ORDER BY id DESC LIMIT 500';
    }else{
        str = 'SELECT * FROM scatter_bybit WHERE x < ? AND symbol = ? ORDER BY id DESC LIMIT 500';
    }
    connection.query(str,[timeBefore, symbol], (err, result) => {
        callback(err, result.reverse());
    })
}
