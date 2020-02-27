const mysql = require('mysql');

class MessageMonRepository {
    constructor(connection) {
        this.connection = connection;
    }

    saveOrUpdateMessageMon(sourceId, targetId, objectId, content, resultCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO MessageMon (sourceId, targetId, objectId, content, resultCode) ' +
                'VALUES (?,?,?,?,?)'
                ;
            let query = mysql.format(insertQuery,
                [sourceId, targetId, objectId, content, resultCode]);
            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    resolve(rows.insertId);
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });
    }

    updateMessageMonStatus(messageMonId, resultCode, content) {

        let self = this;

        return new Promise(function(resolve, reject) {
            let insertQuery, query;
            if (content && content.length > 0) {
                insertQuery = 'UPDATE MessageMon set resultCode = ?, content = ? ' +
                    'WHERE messageMonId = ?'
                    ;
                query = mysql.format(insertQuery,
                    [resultCode, content, messageMonId]);

            } else {
                insertQuery = 'UPDATE MessageMon set resultCode = ? ' +
                    'WHERE messageMonId = ?'
                    ;
                query = mysql.format(insertQuery,
                    [resultCode, messageMonId]);
            }

            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    resolve(rows.insertId);
                }
                else {
                    console.error(err);
                    //console.log('Error while performing Query.');
                    return reject(err);
                }
            });
        });
    }

    updateMessageMonStatusDetails(messageMonId, resultCode, details) {

        let self = this;

        return new Promise(function(resolve, reject) {
            let insertQuery, query;
            if (details && details.length > 0) {
                insertQuery = 'UPDATE MessageMon set resultCode = ?, details = ? ' +
                    'WHERE messageMonId = ?'
                    ;
                query = mysql.format(insertQuery,
                    [resultCode, details, messageMonId]);

            } else {
                insertQuery = 'UPDATE MessageMon set resultCode = ? ' +
                    'WHERE messageMonId = ?'
                    ;
                query = mysql.format(insertQuery,
                    [resultCode, messageMonId]);
            }

            self.connection.query(query, function(err, rows, fields) {
                if (!err) {
                    //console.log('The solution is: ', rows);
                    resolve(rows.insertId);
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

module.exports = MessageMonRepository;