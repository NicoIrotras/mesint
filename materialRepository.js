const mysql = require('mysql');

class MaterialRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getMaterialByCode(materialCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM Material WHERE materialCode = ?';
            let query = mysql.format(getQuery, [materialCode]);
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

    saveOrUpdateMaterial(materialCode, materialDesc) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO Material (materialCode, description) ' +
                'VALUES (?,?)' +
                'ON DUPLICATE KEY UPDATE ' +
                'description = ?'
                ;
            let query = mysql.format(insertQuery, [materialCode, materialDesc, materialDesc]);
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

    deleteMaterialByCode(materialCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE Material ' +
                'WHERE materialCode = ?'
                ;
            let query = mysql.format(deleteQuery, [materialCode]);
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

module.exports = MaterialRepository;