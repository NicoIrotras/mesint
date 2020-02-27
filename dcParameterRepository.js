const mysql = require('mysql');

class DcParameterRepository {
    constructor(connection) {
        this.connection = connection;
    }

    getDcParameterByCode(dcParameterCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = 'SELECT * FROM DcParameter WHERE dcParameterCode = ?';
            let query = mysql.format(getQuery, [dcParameterCode]);
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

    saveOrUpdateDcParameter(dcGroupId, shopOrderOperationId, dcParameterCode, uom, description, infoField1) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO DcParameter (dcGroupId, shopOrderOperationId, dcParameterCode, uom, description, infoField1) ' +
                'VALUES (?,?,?,?,?,?)' +
                'ON DUPLICATE KEY UPDATE ' +
                'uom = ?, description = ?, infoField1 = ?'
                ;
            let query = mysql.format(insertQuery, [dcGroupId, shopOrderOperationId, dcParameterCode, uom, description, infoField1, uom, description, infoField1]);
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

    saveOrUpdateDcParameterErp(dcGroupId, shopOrderOperationId, dcParameterCode, uom, description, infoField1) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let insertQuery = 'INSERT INTO DcParameter (dcGroupId, shopOrderOperationId, \
                dcParameterCode, uom, description, infoField1, dcParameterType) ' +
                'VALUES (?,?,?,?,?,?,?)' +
                'ON DUPLICATE KEY UPDATE ' +
                'uom = ?, description = ?, infoField1 = ?, dcParameterType = ?'
                ;
            let query = mysql.format(insertQuery, [dcGroupId, shopOrderOperationId, dcParameterCode, 
                uom, description, infoField1, 'ERP_CHAR',
                uom, description, infoField1, 'ERP_CHAR']);
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

    deleteDcParameterByCode(dcParameterCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let deleteQuery = 'DELETE DcParameter ' +
                'WHERE dcParameterCode = ?'
                ;
            let query = mysql.format(deleteQuery, [dcParameterCode]);
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

    getActiveDcParameterFromCode(dcParameterCode, shopOrderCode) {

        let self = this;

        return new Promise(function(resolve, reject) {

            let getQuery = "SELECT dcp.*, sop.shopOrderId FROM DcParameter dcp " +
                "LEFT JOIN ShopOrderOperation sop " +
                "ON dcp.shopOrderOperationId = sop.shopOrderOperationId " +
                "INNER JOIN ShopOrder so " +
                "ON sop.shopOrderId = so.shopOrderId " +
                "AND so.statusCode = ? AND so.shopOrderCode = ? " +
                "WHERE dcp.dcParameterCode = ? ";

            let query = mysql.format(getQuery, ['ACTIVE', shopOrderCode, dcParameterCode]);
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

}

module.exports = DcParameterRepository;