const mysql = require('mysql');

class ExchangeMappingRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getMapping() {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM ExchangeMapping';
            let query = mysql.format(getQuery, []);
            try {
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
            } catch (err) {
                console.error(err);
            }
        });

    }

}

module.exports = ExchangeMappingRepository;