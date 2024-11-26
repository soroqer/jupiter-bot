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
export async function insertPoint(point,source) {

    let str;
    if (source === 'BitGet') {
        str = 'INSERT into scatter_bitget SET ?';
    }else{
        str = 'INSERT into scatter_bybit SET ?';
    }
    connection.query(str, point, (err, result) => {
        if (err) {
            console.log('insert price',err);
        }
    })
}
export async function queryPoints() {

}
