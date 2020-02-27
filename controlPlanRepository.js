const mysql = require('mysql');

class ControlPlanRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getControlPlanByCode(controlPlanCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ControlPlan WHERE controlPlanCode = ?';
            let query = mysql.format(getQuery, [controlPlanCode]);
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

    getControlPlanByCodeAndOrder(controlPlanCode, shopOrderId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ControlPlan WHERE controlPlanCode = ? AND shopOrderId = ?';
            let query = mysql.format(getQuery, [controlPlanCode, shopOrderId]);
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

    getActiveControlPlanByCode(controlPlanCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ControlPlan WHERE controlPlanCode = ?'
            + 'AND shopOrderId in (SELECT shopOrderId FROM ShopOrder WHERE statusCode = ?)';
            let query = mysql.format(getQuery, [controlPlanCode, 'ACTIVE', 'ACTIVE']);
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

    saveOrUpdateControlPlan(controlPlanCode, shopOrderId, materialId, quantity, commStatus, startDate, endDate, cycleGroup) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO ControlPlan (controlPlanCode, shopOrderId, materialId, quantity, commStatus, \
                startDate, endDate, cycleGroup) ' +
                'VALUES (?,?,?,?,?,?,?,?) ' +
                'ON DUPLICATE KEY UPDATE ' +
                'shopOrderId = ?, materialId = ?, quantity = ?, commStatus= ?, startDate = ?, endDate = ?, cycleGroup = ?'
                ;
            let query = mysql.format(insertQuery, 
                [controlPlanCode, shopOrderId, materialId, quantity, commStatus, startDate, endDate, cycleGroup, 
                    shopOrderId, materialId, quantity, commStatus, startDate, endDate, cycleGroup]);
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

    deleteControlPlanByCode(controlPlanCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE ControlPlan ' +
                'WHERE controlPlanCode = ?'
                ;
            let query = mysql.format(deleteQuery, [controlPlanCode]);
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

module.exports = ControlPlanRepository;