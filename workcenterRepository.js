const mysql = require('mysql');

class WorkcenterRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getWorkcenterByCode(workcenterCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'SELECT * FROM Workcenter WHERE workcenterCode = ? ';
            let query = mysql.format(insertQuery, [workcenterCode]);
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

    saveOrUpdateWorkcenter(workcenterCode, plantId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO Workcenter (workcenterCode, plantId) ' +
                'VALUES (?,?) ' +
                'ON DUPLICATE KEY UPDATE ' +
                'plantId = ?'
                ;
            let query = mysql.format(insertQuery, 
                [workcenterCode, plantId, plantId]);
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

    deleteWorkcenterByCode(workcenterCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE Workcenter ' +
                'WHERE workcenterCode = ?'
                ;
            let query = mysql.format(deleteQuery, [workcenterCode]);
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

    deactivateWorkcenterById(workcenterId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE Workcenter ' +
                'SET statusCode = ? WHERE workcenterId = ?'
                ;
            let query = mysql.format(deaQuery, ['DEACTIVATED', workcenterId]);
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

    deactivateWorkcenterByCode(workcenterCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deaQuery = 'UPDATE Workcenter ' +
                'SET statusCode = ? WHERE workcenterCode = ?'
                ;
            let query = mysql.format(deaQuery, ['DEACTIVATED', workcenterCode]);
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

module.exports = WorkcenterRepository;