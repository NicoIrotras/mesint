const mysql = require('mysql');

class DcDataRepository {
    constructor(connection) {
        this.connection = connection;
    }


    saveOrUpdateDcData(dcParameterId, dcValue, collectionSeqId, workcenterId, shopOrderOperationId) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO DcData (dcParameterId, dcValue, collectionSeqId, workcenterId, shopOrderOperationId) ' +
                'VALUES (?,?,?,?,?)' +
                'ON DUPLICATE KEY UPDATE ' +
                'dcValue = ?, collectionSeqId = ?, workcenterId = ?, shopOrderOperationId = ?'
                ;
            let query = mysql.format(insertQuery, [dcParameterId, dcValue, collectionSeqId, workcenterId, shopOrderOperationId,
                dcValue, collectionSeqId, workcenterId, shopOrderOperationId]);
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

module.exports = DcDataRepository;