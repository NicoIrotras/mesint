const mysql = require('mysql');
const MyUtil = require('./myUtil');

class ExchangeTableRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getLastDcData(lock) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM exchange_table WHERE status_code = ? ';
            if (lock) {
                getQuery = getQuery + 'for update';
            }
            let query = mysql.format(getQuery, ['OUTGOING_PARAMS']);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    if (rows && rows.length > 0) {
                        resolve(rows);
                    } else {
                        resolve(null);
                    }
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });

    }

    getIncomingDcData(shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM exchange_table WHERE shop_order = ? AND status_code = ? '
                + ' AND exchange_table.update_time = (SELECT MAX(update_time) FROM exchange_table WHERE shop_order = ? AND status_code = ?)';
            let query = mysql.format(getQuery, [shopOrderCode, 'INCOMING_PARAMS', shopOrderCode, 'INCOMING_PARAMS']);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    if (rows && rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(null);
                    }
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });

    }

    updateDcDataStatusById(exchangeTableId, statusCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let updateQuery = 'UPDATE exchange_table SET status_code = ? WHERE exchange_table_id = ? ';
            let query = mysql.format(updateQuery, [statusCode, exchangeTableId]);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    resolve(rows);
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });
    }

    closeIncomingDcDataByOrder(orderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let updateQuery = 'UPDATE exchange_table SET status_code = ? WHERE shop_order = ? and status_code = ?';
            let query = mysql.format(updateQuery, ["INCOMING_PARAMS_LOADED", orderCode, "INCOMING_PARAMS"]);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    if (rows.length > 0) {
                        resolve(rows[0]);
                    } else {
                        resolve(null);
                    }
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });
    }

    createExchangeRecord(exchangeDTO) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO exchange_table (';
            let columns = [];
            let values = [];
            let bindArr = [];
            for (let key in exchangeDTO) {
                columns.push(key);
                values.push(exchangeDTO[key]);
                bindArr.push('?');
            }
            insertQuery += columns.join(',') + ') VALUES (';
            insertQuery += bindArr.join(',') + ')';

            let query = mysql.format(insertQuery, values);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    resolve(rows);
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });

    }

    updateExchangeRecord(exchangeTableId, exchangeDTO) {

        let self = this;

        return new Promise(function(resolve, reject) {

            exchangeDTO.exchange_table_id = exchangeTableId;
            let replaceQuery = 'REPLACE INTO exchange_table (';
            let columns = [];
            let values = [];
            let bindArr = [];
            for (let key in exchangeDTO) {
                columns.push(key);
                values.push(exchangeDTO[key]);
                bindArr.push('?');
            }
            replaceQuery += columns.join(',') + ') VALUES (';
            replaceQuery += bindArr.join(',') + ')';

            let query = mysql.format(replaceQuery, values);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    resolve(rows);
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });
    }

    fixCoilDateTime(exchangeTableId, dateAndTimeCoil) {

        let self = this;

        let coilDate = "";
        let coilTime = "";

        try {
            coilDate = MyUtil.getEccDateStr(dateAndTimeCoil);
            coilTime = MyUtil.getEccTimeStr(dateAndTimeCoil);
            console.log("update coilDate and coilTime to: " + coilDate + " -- " + coilTime);
        } catch (err) {
            console.log(err.stack);
        }

        return new Promise(function(resolve, reject) {

            let updateQuery = 'UPDATE exchange_table SET coil_date = ?, coil_time = ? WHERE exchange_table_id = ? ';
            let query = mysql.format(updateQuery, [coilDate, coilTime, exchangeTableId]);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('FIX DATE The solution is: ', rows);
                    resolve({ coil_date: coilDate, coil_time: coilTime });
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });

        });

    }

}

module.exports = ExchangeTableRepository;
