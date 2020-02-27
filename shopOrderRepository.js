const mysql = require('mysql');

class ShopOrderRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getActiveShopOrderByCode(shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'SELECT * FROM ShopOrder WHERE shopOrderCode = ? ' +
            'AND statusCode = ?';
            let query = mysql.format(insertQuery, [shopOrderCode, 'ACTIVE']);
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

    getCompletedShopOrderByCode(shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'SELECT * FROM ShopOrder WHERE shopOrderCode = ? ' +
            'AND statusCode = ?';
            let query = mysql.format(insertQuery, [shopOrderCode, 'COMPLETED']);
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

    getShopOrderByCode(shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ShopOrder WHERE shopOrderCode = ?';
            let query = mysql.format(getQuery, [shopOrderCode]);
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

    saveOrUpdateShopOrder(shopOrderCode, materialId, uom, quantity, plantId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO ShopOrder (shopOrderCode, materialId, uom, quantity, plantId) ' +
                'VALUES (?,?,?,?,?) ' +
                'ON DUPLICATE KEY UPDATE ' +
                'materialId = ?, uom = ?, quantity = ?, plantId = ?'
                ;
            let query = mysql.format(insertQuery, 
                [shopOrderCode, materialId, uom, quantity, plantId, materialId, uom, quantity, plantId]);
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

    deleteShopOrderByCode(shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE ShopOrder ' +
                'WHERE shopOrderCode = ?'
                ;
            let query = mysql.format(deleteQuery, [shopOrderCode]);
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

    deactivateShopOrderById(shopOrderId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE ShopOrder ' +
                'SET statusCode = ? WHERE shopOrderId = ?'
                ;
            let query = mysql.format(deaQuery, ['DEACTIVATED', shopOrderId]);
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

    deactivateShopOrderByCode(shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE ShopOrder ' +
                'SET statusCode = ? WHERE shopOrderCode = ?'
                ;
            let query = mysql.format(deaQuery, ['DEACTIVATED', shopOrderCode]);
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

    completeShopOrderByCode(shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE ShopOrder ' +
                'SET statusCode = ?, endDate = NOW() WHERE shopOrderCode = ? and statusCode = ?'
                ;
            let query = mysql.format(deaQuery, ['COMPLETED', shopOrderCode, 'ACTIVE']);
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

}

module.exports = ShopOrderRepository;