const mysql = require('mysql');

class ShopOrderOperationRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getShopOrderOperationByCode(shopOrderOperationCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ShopOrderOperation WHERE shopOrderOperationCode = ?';
            let query = mysql.format(getQuery, [shopOrderOperationCode]);
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

    getShopOrderOperationByCodeAndOrder(shopOrderOperationCode, shopOrderId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ShopOrderOperation WHERE shopOrderOperationCode = ? AND shopOrderId = ?';
            let query = mysql.format(getQuery, [shopOrderOperationCode, shopOrderId]);
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

    getActiveShopOrderOperationByCode(shopOrderOperationCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ShopOrderOperation WHERE shopOrderOperationCode = ?'
            + 'AND shopOrderId in (SELECT shopOrderId FROM ShopOrder WHERE statusCode = ?)';
            let query = mysql.format(getQuery, [shopOrderOperationCode, 'ACTIVE', 'ACTIVE']);
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

    getActiveShopOrderOperationByWorkcenterCode(workcenterCode, shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ShopOrderOperation WHERE '
            + 'shopOrderId in (SELECT shopOrderId FROM ShopOrder WHERE statusCode = ? AND shopOrderCode = ?) ' 
            + 'AND workcenterId = (SELECT workcenterId from Workcenter WHERE workcenterCode = ?)';
            let query = mysql.format(getQuery, ['ACTIVE', shopOrderCode, workcenterCode]);
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

    saveOrUpdateShopOrderOperation(shopOrderOperationCode, shopOrderId, workcenterId, description) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO ShopOrderOperation (shopOrderOperationCode, shopOrderId, workcenterId, description) ' +
                'VALUES (?,?,?,?) ' +
                'ON DUPLICATE KEY UPDATE ' +
                'shopOrderId = ?, workcenterId = ?, description = ?'
                ;
            let query = mysql.format(insertQuery, 
                [shopOrderOperationCode, shopOrderId, workcenterId, description,
                    shopOrderId, workcenterId, description]);
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

    deleteShopOrderOperationByCode(shopOrderOperationCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE ShopOrderOperation ' +
                'WHERE shopOrderOperationCode = ?'
                ;
            let query = mysql.format(deleteQuery, [shopOrderOperationCode]);
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

    deactivateShopOrderOperationByShopOrderId(shopOrderId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE ShopOrderOperation ' +
                'SET statusCode = ? WHERE shopOrderId = ?'
                ;
            let query = mysql.format(deaQuery, ['DEACTIVATED',shopOrderId]);
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

    deactivateShopOrderOperationById(shopOrderOperationId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE ShopOrderOperation ' +
                'SET statusCode = ? WHERE shopOrderOperationId = ?'
                ;
            let query = mysql.format(deaQuery, ['DEACTIVATED', shopOrderOperationId]);
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

module.exports = ShopOrderOperationRepository;