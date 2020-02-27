const fs = require('fs');
const CronJob = require('cron').CronJob;
const connectionPoolManagerInstance = require('./connectionPoolManager');
const ExchangeTableRepository = require('./exchangeTableRepository');
const DcGroupRepository = require('./dcGroupRepository');
const DcParameterRepository = require('./dcParameterRepository');
const DcDataRepository = require('./dcDataRepository');
const WorkcenterRepository = require('./workcenterRepository');
const MessageMonRepository = require('./messageMonRepository');
const ShopOrderOperationRepository = require('./shopOrderOperationRepository');
const ShopOrderRepository = require('./shopOrderRepository');
const characteristicMapInstance = require('./characteristicMap');
const MyUtil = require('./myUtil');
const erpCharSenderInstance = require('./erpCharSender');
const errorMailManager = require('./errorMailManager');


class DcScheduler {
    constructor() {
        this.jobs = [];
        this._connection = null;
        this.exchangeTableRepository = null;
        this.dcParameterRepository = null;
        this.dcDataRepository = null;
        this.workcenterRepository = null;
        this.shopOrderOperationRepository = null;
        this.dcGroupRepository = null;
        this.shopOrderRepository = null;
        this.messageTosend = {
            prodOrder: "",
            finalConfirmation: -1,
            reelSeq: -1,
            material: "",
            batch: "",
            chars: []
        }
        this.processing = false;
    }

    resetMessageToSend() {
        this.messageTosend = {
            prodOrder: "",
            finalConfirmation: -1,
            reelSeq: -1,
            material: "",
            chars: []
        }
    }

    async initScheduler(cronFileConf) {
        try {
            this._connection = await connectionPoolManagerInstance.acquireConnFromPool();
            //console.log("initScheduler: " + this._connection.threadId);
            this.exchangeTableRepository = new ExchangeTableRepository(this._connection);
            //outside transaction
            this.messageMonRepository = new MessageMonRepository(connectionPoolManagerInstance.getConnectionPool());
            this.exchangeTableRepositoryNoTrx = new ExchangeTableRepository(connectionPoolManagerInstance.getConnectionPool());

            this.dcParameterRepository = new DcParameterRepository(this._connection);
            this.dcDataRepository = new DcDataRepository(this._connection);
            this.workcenterRepository = new WorkcenterRepository(this._connection);
            this.shopOrderOperationRepository = new ShopOrderOperationRepository(this._connection);
            this.dcGroupRepository = new DcGroupRepository(this._connection);
            this.shopOrderRepository = new ShopOrderRepository(this._connection);
            this.cronFileConf = cronFileConf;
            await this.loadMCron();
            return this.jobs;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async reInitDbConn() {
        try {
            if (this._connection) {
                this._connection.release();
                this._connection.destroy();
            }
        } catch (err) {
            console.error(err);
        }
        try {
            this._connection = await connectionPoolManagerInstance.acquireConnFromPool();
            //console.log("initScheduler: " + this._connection.threadId);
            this.exchangeTableRepository = new ExchangeTableRepository(this._connection);
            //outside transaction
            this.messageMonRepository = new MessageMonRepository(connectionPoolManagerInstance.getConnectionPool());
            this.exchangeTableRepositoryNoTrx = new ExchangeTableRepository(connectionPoolManagerInstance.getConnectionPool());

            this.dcParameterRepository = new DcParameterRepository(this._connection);
            this.dcDataRepository = new DcDataRepository(this._connection);
            this.workcenterRepository = new WorkcenterRepository(this._connection);
            this.shopOrderOperationRepository = new ShopOrderOperationRepository(this._connection);
            this.dcGroupRepository = new DcGroupRepository(this._connection);
            this.shopOrderRepository = new ShopOrderRepository(this._connection);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async loadMCron() {
        let rawdata = fs.readFileSync(this.cronFileConf);
        this.cronTime = JSON.parse(rawdata);
        const job = new CronJob(this.cronTime, () => {
            this.collectAndSendData();
        });
        this.jobs.push(job);
        return this.jobs;
    }

    async collectAndSendData() {

        if (this.processing === true) {
            //console.log("Exiting DC...");
            return;
        }

        if (this._connection.state && this._connection.state === 'disconnected') {
            console.warn("DB connection state: " + this._connection.state + " reconnecting");
            try {
                await this.reInitDbConn();
            } catch (err) {
                console.error(err);
                errorMailManager.notifyError(err);
            }
        }

        //console.log("Starting DC...");
        await this._connection.beginTransaction();
        let useLock = true, results = [];
        //console.log("Getting DC rows before lock...");
        try {
            this.processing = true;
            results = await this.exchangeTableRepository.getLastDcData(useLock);

            results = results || [];
            //console.log("DC rows after lock: " + results.length);
            if (results && results.length > 0) {
                results = await this.exchangeTableRepositoryNoTrx.getLastDcData();
                results = results || [];
            }
            //console.log("DC rows: " + results.length);
            let msgObjectId, jsonRequest, msgId;

            for (let result of results) {
                this.resetMessageToSend();

                /* fix date just because sap ecc */
                let fixDate = await this.exchangeTableRepository.fixCoilDateTime(result.exchange_table_id, result.date_and_time_coil);
                result['coil_date'] = fixDate.coil_date;
                result['coil_time'] = fixDate.coil_time;

                msgObjectId = 'ORDER_' + result.shop_order;
                jsonRequest = JSON.stringify(result);
                msgId = await this.messageMonRepository.saveOrUpdateMessageMon("SHOPFLOOR", "MES",
                    msgObjectId, jsonRequest, "PROCESSING");
                try {
                    if (result && result.exchange_table_id) {

                        await MyUtil.validateExchangeTableResult(result);

                        await this.exchangeTableRepository.updateDcDataStatusById(result.exchange_table_id,
                            'OUTGOING_PARAMS_PROCESSING');

                        let shop_order = result.shop_order;
                        let collectionSeqId = result.reel_seq;
                        this.messageTosend.prodOrder = shop_order;
                        this.messageTosend.finalConfirmation = result.final_confirmation;
                        this.messageTosend.reelSeq = result.reel_seq;
                        this.messageTosend.material = result.material;


                        let workcenterCode = result.workcenter;
                        let workcenter = await this.workcenterRepository.getWorkcenterByCode(workcenterCode);
                        if (workcenter === null) {
                            throw new Error('Cannot find workcenter ' + workcenter.workcenterCode + ' for order ' + shop_order);
                        }

                        /*let completedOrder = await this.shopOrderRepository.getCompletedShopOrderByCode(shop_order);
                        if (completedOrder !== null) {
                            throw new Error('Cannot process order ' + shop_order + ' in COMPLETED status');
                        }*/

                        let activeOrder = await this.shopOrderRepository.getActiveShopOrderByCode(shop_order);
                        if (activeOrder === null) {
                            throw new Error('Cannot process order ' + shop_order + ' not ACTIVE');
                        } else {
                            console.log("Processing order: " + activeOrder.shopOrderCode + ' id: ' + activeOrder.shopOrderId);
                        }


                        for (let col in result) {

                            let erpCode = characteristicMapInstance.getChEccFromMes(col);
                            let value = result[col];

                            let mandatoryVal = Object.prototype.hasOwnProperty.call(MyUtil.MANDATORY_CHARS, col) === true ? 1 : 0;

                            if (value === null ||
                                Object.prototype.hasOwnProperty.call(MyUtil.getParamToExclude(), col) === true) {
                                //console.log("Excluding: " + col);
                                continue;
                            }
                            try {
                                // CASE 0: multi erpCode found
                                let multiErpCode = characteristicMapInstance.getChMultiEccFromMes(col);
                                if (multiErpCode.length > 1) {
                                    for (let tmpErpCode of multiErpCode) {
                                        let dcParameter = await this.dcParameterRepository.getActiveDcParameterFromCode(tmpErpCode, shop_order);
                                        if (dcParameter) {
                                            //console.log(">>>" + dcParameter.dcParameterType + " >>> shopOrder: " + dcParameter.shopOrderId);
                                            await this.dcDataRepository.saveOrUpdateDcData(dcParameter.dcParameterId, value, collectionSeqId,
                                                workcenter.workcenterId, null);
                                            //console.log(dcParameter.dcParameterType);
                                            if ('ERP_CHAR' === dcParameter.dcParameterType || 1 === mandatoryVal) {
                                                this.messageTosend.chars.push({ nameChar: tmpErpCode, valueChar: value, mandatory: mandatoryVal });
                                            }
                                        }
                                        // CASE 1.2: param not found 
                                        else {
                                            console.warn("Cannot find parameter " + tmpErpCode + " creating one");
                                            let dcGroup = await this.dcGroupRepository.getDcGroupByCode(MyUtil.CTRL_PLAN_LD3);
                                            let opLD3 = await this.shopOrderOperationRepository.getActiveShopOrderOperationByWorkcenterCode(workcenterCode, shop_order);
                                            let missParamResult = await this.dcParameterRepository.saveOrUpdateDcParameter(dcGroup.dcGroupId, opLD3.shopOrderOperationId,
                                                tmpErpCode,
                                                '', null, null);
                                            await this.dcDataRepository.saveOrUpdateDcData(missParamResult.insertId, value, collectionSeqId,
                                                workcenter.workcenterId, null);
                                            if (1 === mandatoryVal) {
                                                this.messageTosend.chars.push({ nameChar: tmpErpCode, valueChar: value, mandatory: mandatoryVal });
                                            }
                                        }
                                    }
                                }


                                // CASE 1: erpCode found
                                else if (erpCode) {
                                    //console.log(">CASE1>mandatoryVal:" + mandatoryVal + ">>>erpCode:" + erpCode);
                                    let dcParameter = await this.dcParameterRepository.getActiveDcParameterFromCode(erpCode, shop_order);
                                    // CASE 1.1: param found
                                    if (dcParameter) {
                                        //console.log(">>>" + dcParameter.dcParameterType + " >>> shopOrder: " + dcParameter.shopOrderId);
                                        await this.dcDataRepository.saveOrUpdateDcData(dcParameter.dcParameterId, value, collectionSeqId,
                                            workcenter.workcenterId, null);
                                        //console.log(dcParameter.dcParameterType);
                                        if ('ERP_CHAR' === dcParameter.dcParameterType || 1 === mandatoryVal) {
                                            this.messageTosend.chars.push({ nameChar: erpCode, valueChar: value, mandatory: mandatoryVal });
                                        }
                                    }
                                    // CASE 1.2: param not found 
                                    else {
                                        console.warn("Cannot find parameter " + erpCode + " creating one");
                                        let dcGroup = await this.dcGroupRepository.getDcGroupByCode(MyUtil.CTRL_PLAN_LD3);
                                        let opLD3 = await this.shopOrderOperationRepository.getActiveShopOrderOperationByWorkcenterCode(workcenterCode, shop_order);
                                        let missParamResult = await this.dcParameterRepository.saveOrUpdateDcParameter(dcGroup.dcGroupId, opLD3.shopOrderOperationId,
                                            erpCode,
                                            '', null, null);
                                        await this.dcDataRepository.saveOrUpdateDcData(missParamResult.insertId, value, collectionSeqId,
                                            workcenter.workcenterId, null);
                                        if (1 === mandatoryVal) {
                                            this.messageTosend.chars.push({ nameChar: erpCode, valueChar: value, mandatory: mandatoryVal });
                                        }
                                    }
                                }
                                // CASE 2: erpCode not found 
                                else {
                                    //console.log(">CASE2>mandatoryVal:" + mandatoryVal + ">>>col:" + col);
                                    let dcParameter = await this.dcParameterRepository.getActiveDcParameterFromCode(col, shop_order);
                                    // CASE 2.1: param found 
                                    if (dcParameter) {
                                        await this.dcDataRepository.saveOrUpdateDcData(dcParameter.dcParameterId, value, collectionSeqId,
                                            workcenter.workcenterId, null);
                                        if ('ERP_CHAR' === dcParameter.dcParameterType || 1 === mandatoryVal) {
                                            this.messageTosend.chars.push({ nameChar: col, valueChar: value, mandatory: mandatoryVal });
                                        }
                                    }
                                    // CASE 2.2: param not found
                                    else {
                                        console.warn("Cannot find parameter " + col + " creating one");
                                        let dcGroup = await this.dcGroupRepository.getDcGroupByCode(MyUtil.CTRL_PLAN_LD3);
                                        let opLD3 = await this.shopOrderOperationRepository.getActiveShopOrderOperationByWorkcenterCode(workcenterCode, shop_order);
                                        let missParamResult = await this.dcParameterRepository.saveOrUpdateDcParameter(dcGroup.dcGroupId, opLD3.shopOrderOperationId,
                                            col,
                                            '', null, null);
                                        await this.dcDataRepository.saveOrUpdateDcData(missParamResult.insertId, value, collectionSeqId,
                                            workcenter.workcenterId, null);
                                        if (1 === result.mandatory) {
                                            this.messageTosend.chars.push({ nameChar: col, valueChar: value, mandatory: mandatoryVal });
                                        }
                                    }
                                }

                                //console.log(">>>> message chars length: " + this.messageTosend.chars.length);

                            } catch (err) {
                                console.error("Cannot save parameter " + col + "-->" + erpCode + ": " + err.stack);
                            }

                        }
                        try {
                            if (result.final_confirmation === 1) {
                                await this.shopOrderRepository.completeShopOrderByCode(shop_order);
                            }
                        } catch (err) {
                            console.error(err);
                        }
                        await this.messageMonRepository.updateMessageMonStatus(msgId, "SUCCESS");

                        let msgId2;
                        try {
                            try {
                                this.adjustExtDiameter(this.messageTosend);
                            } catch (err) {
                                console.error(err);
                            }
                            msgId2 = await this.messageMonRepository.saveOrUpdateMessageMon("MES", "ERP",
                                msgObjectId, JSON.stringify(this.messageTosend), "PROCESSING");
                            erpCharSenderInstance.loadErpConfFromJson('erpCommConf.json');
                            let response = await erpCharSenderInstance.sendChars(this.messageTosend);
                            console.log("response from ECC: " + JSON.stringify(response));
                            await this.messageMonRepository.updateMessageMonStatus(msgId2, "SUCCESS");
                            await this.exchangeTableRepository.updateDcDataStatusById(result.exchange_table_id,
                                'OUTGOING_PARAMS_LOADED');
                        } catch (err) {
                            console.error(err);
                            await this.messageMonRepository.updateMessageMonStatus(msgId2, "FAILED");
                            await this.exchangeTableRepository.updateDcDataStatusById(result.exchange_table_id,
                                'OUTGOING_PARAMS_ERROR');
                            errorMailManager.notifyError(err);
                        }
                    }

                } catch (err) {
                    await this.messageMonRepository.updateMessageMonStatus(msgId, "FAILED", err.stack);
                    await this.exchangeTableRepository.updateDcDataStatusById(result.exchange_table_id,
                        'OUTGOING_PARAMS_ERROR');
                    console.error(err);
                    errorMailManager.notifyError(err);
                }
            }
            await this._connection.commit();

        } catch (err) {
            try {
                console.error(err);
                errorMailManager.notifyError(err);
                await this._connection.rollback();
            } catch (errRlbk) {
                console.error(errRlbk);
                errorMailManager.notifyError(errRlbk);
                throw errRlbk;
            }
        } finally {
            this.processing = false;
        }

    }

    adjustExtDiameter(charMessage) {
        for (let valueToModify of charMessage.chars) {
            if ("B_EXT_DIAMETER" === valueToModify.nameChar ||
                "EXT_DIAMETER" === valueToModify.nameChar) {
                try {
                    valueToModify.valueChar = valueToModify.valueChar / 10;
                    valueToModify.valueChar = Number(valueToModify.valueChar).toString().replace(".", ",");
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    start() {

        for (let job of this.jobs) {
            job.start();
        }

    }

    stop() {

        for (let job of this.jobs) {
            console.log("closing job");
            job.stop();
        }
        this._connection.release();
        this.jobs = [];

    }



}

const instance = new DcScheduler();

module.exports = instance;
