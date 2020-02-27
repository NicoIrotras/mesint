const mysql = require('mysql');

class PlantRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getPlantByCode(plantCode) {

        let self = this;
        
        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM Plant WHERE plantCode = ? ';
            let query = mysql.format(getQuery, [plantCode]);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
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

    saveOrUpdatePlant(plantCode, description) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO Plant (plantCode, description) ' +
                'VALUES (?,?)' +
                'ON DUPLICATE KEY UPDATE ' +
                'description = ?'
                ;
            let query = mysql.format(insertQuery, 
                [plantCode, description, description]);
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

    deletePlantByCode(plantCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE Plant ' +
                'WHERE materialCode = ?'
                ;
            let query = mysql.format(deleteQuery, [plantCode]);
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

    deactivatePlantById(plantId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'UPDATE Plant ' +
                'SET statusCode=\'DEACTIVATED\' WHERE plantId = ?'
                ;
            let query = mysql.format(deleteQuery, [plantId]);
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

module.exports = PlantRepository;