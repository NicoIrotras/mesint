const fs = require('fs');
const mysql = require('mysql');

class ConnectionPoolManager {

    constructor() {
        this._connection = null;
    }

    async initDb() {
        try {
            let rawdata = fs.readFileSync('mysqlds1.datasource.json');
            let mysqlDS = JSON.parse(rawdata);
            let mysqlDSHidePwd = JSON.parse(JSON.stringify(mysqlDS));
            mysqlDSHidePwd.password = "************";
            console.log("DB connection params: " + JSON.stringify(mysqlDSHidePwd));

            this._connection = mysql.createPool({
                connectionLimit: 100,
                host: mysqlDS.host,
                user: mysqlDS.user,
                port: mysqlDS.port,
                password: mysqlDS.password,
                database: mysqlDS.database
            });

            this._connection.on('acquire', function(connection) {
                console.log('Connection %d acquired', connection.threadId);
            });
            this._connection.on('release', function(connection) {
                console.log('Connection %d released', connection.threadId);
            });
            return this._connection;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    getConnectionPool() {
        return this._connection;
    }

    async acquireConnFromPool() {

        console.log("acquire from pool");

        let self = this;

        return new Promise(
            (resolve, reject) => {
                self._connection.getConnection(
                    (err, connection) => {
                        if (!err) {
                            resolve(connection);
                        } else {
                            console.error(err);
                            reject(err);
                        }
                    }
                );
            }
        );
    }
}

const instance = new ConnectionPoolManager();

module.exports = instance;