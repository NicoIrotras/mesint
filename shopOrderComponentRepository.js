const mysql = require('mysql');

class ShopOrderComponentRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getShopOrderComponentByCode(shopOrderComponentCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ShopOrderComponent WHERE shopOrderOperationCode = ?';
            let query = mysql.format(getQuery, [shopOrderComponentCode]);
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

    getActiveShopOrderComponentByCode(shopOrderComponentCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ShopOrderComponent WHERE shopOrderComponentCode = ?'
                + 'AND shopOrderId in (SELECT shopOrderId FROM ShopOrder WHERE statusCode = ?)';
            let query = mysql.format(getQuery, [shopOrderComponentCode, 'ACTIVE', 'ACTIVE']);
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

    saveOrUpdateShopOrderComponent(materialId, shopOrderOperationId, quantity, uom, storageLocation) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO ShopOrderComponent (materialId, shopOrderOperationId, quantity, uom, storageLocation) ' +
                'VALUES (?,?,?,?,?) ' +
                'ON DUPLICATE KEY UPDATE ' +
                'quantity = ?, uom = ?, storageLocation = ?'
                ;
            let query = mysql.format(insertQuery,
                [materialId, shopOrderOperationId, quantity, uom,
                    storageLocation, quantity, uom, storageLocation]);
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

    deleteShopOrderComponentByCode(shopOrderComponentCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE ShopOrderComponent ' +
                'WHERE shopOrderComponentCode = ?'
                ;
            let query = mysql.format(deleteQuery, [shopOrderComponentCode]);
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

    deactivateShopOrderComponentByShopOrderId(shopOrderId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE ShopOrderComponent ' +
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

    deactivateShopOrderComponentById(shopOrderComponentId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE ShopOrderComponent ' +
                'SET statusCode = ? WHERE shopOrderComponentId = ?'
                ;
            let query = mysql.format(deaQuery, ['DEACTIVATED', shopOrderComponentId]);
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

module.exports = ShopOrderComponentRepository;