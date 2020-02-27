const mysql = require('mysql');

class DcGroupRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getDcGroupByCode(dcGroupCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM DcGroup WHERE dcGroupCode = ?';
            let query = mysql.format(getQuery, [dcGroupCode]);
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

    saveOrUpdateDcGroup(dcGroupCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO DcGroup (dcGroupCode) ' +
                'VALUES (?) '+
                'ON DUPLICATE KEY UPDATE ' +
                'statusCode = ? '
                ;
            let query = mysql.format(insertQuery, 
                [dcGroupCode, 'ACTIVE']);
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

    deleteDcGroupByCode(dcGroupCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE DcGroup ' +
                'WHERE dcGroupCode = ? ' +
                'ON DUPLICATE KEY UPDATE ' +
                'statusCode = ? '
                ;
            let query = mysql.format(deleteQuery, [dcGroupCode, 'ACTIVE']);
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

module.exports = DcGroupRepository;