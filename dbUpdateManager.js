const mysql = require('mysql');

const connectionPoolManagerInstance = require('./connectionPoolManager');
const MaterialRepository = require('./materialRepository');
const PlantRepository = require('./plantRepository');
const WorkcenterRepository = require('./workcenterRepository');
const ShopOrderRepository = require('./shopOrderRepository');
const ControlPlanRepository = require('./controlPlanRepository');
const ShopOrderOperationRepository = require('./shopOrderOperationRepository');
const ShopOrderComponentRepository = require('./shopOrderComponentRepository');
const MessageMonRepository = require('./messageMonRepository');
const DcParameterRepository = require('./dcParameterRepository');
const DcGroupRepository = require('./dcGroupRepository');
const ExchangeTableRepository = require('./exchangeTableRepository');
const MyUtil = require('./myUtil');
const characteristicMapInstance = require('./characteristicMap');
const errorMailManager = require('./errorMailManager');

class DbUpdateManager {
    constructor() {

    }

    async updateMesDb(json) {

        //exchange table just for LD3 workcenter
        let exchangeDTO = MyUtil.getExchangeDTO();

        let connection = await connectionPoolManagerInstance.acquireConnFromPool();

        //console.log("updateMesDb connection id: " + connection.threadId)

        let plantRepo = new PlantRepository(connection);
        let matRepo = new MaterialRepository(connection);
        let wcRepository = new WorkcenterRepository(connection);
        let orderRepo = new ShopOrderRepository(connection);
        let orderOpRepo = new ShopOrderOperationRepository(connection);
        let controlPlanRepository = new ControlPlanRepository(connection);
        let orderCompRepo = new ShopOrderComponentRepository(connection);
        let dcParameterRepository = new DcParameterRepository(connection);
        let dcGroupRepository = new DcGroupRepository(connection);
        let exchangeTableRepository = new ExchangeTableRepository(connection);

        let materialCode = MyUtil.leadingZeros(json.MATNR);

        let isTeco = MyUtil.checkTecoStatus(json.E1JSTKL);

        if ("" === json.AUFNR) {
            throw new Error("Order number cannot be empty");
        }

        try {
            await connection.beginTransaction();

            if (isTeco === true) {
                orderRepo.completeShopOrderByCode(json.AUFNR);
                exchangeTableRepository.closeIncomingDcDataByOrder(json.AUFNR);
                await connection.commit();
                return;
            }

            await plantRepo.saveOrUpdatePlant(json.WERKS, "");
            let plant = await plantRepo.getPlantByCode(json.WERKS);
            await matRepo.saveOrUpdateMaterial(materialCode, "");
            let materialFP = await matRepo.getMaterialByCode(materialCode);

            await orderRepo.deactivateShopOrderByCode(json.AUFNR);
            /*exchange dto */
            exchangeDTO.shop_order = json.AUFNR;
            exchangeDTO.plant = json.WERKS;
            /*exchange dto */


            await orderRepo.saveOrUpdateShopOrder(json.AUFNR, materialFP.materialId,
                json.BMEINS, json.BMENGE, plant.plantId);
            let order = await orderRepo.getActiveShopOrderByCode(json.AUFNR);

            let dcGroupId = null;
            if (json.ZLDPROG) {
                await matRepo.saveOrUpdateMaterial(MyUtil.leadingZeros(json.ZLDPROG.MATNR_L), json.ZLDPROG.MAKTX_L);
                let materialPlan = await matRepo.getMaterialByCode(MyUtil.leadingZeros(json.ZLDPROG.MATNR_L));
                let startDateStr = json.ZLDPROG.DATA_I + "T" + json.ZLDPROG.ORA_I + "";
                let endDateStr = json.ZLDPROG.DATA_F + "T" + json.ZLDPROG.ORA_F + "";
                let commStatus = json.ZLDPROG.STATO_COMM;
                let startDate = new Date(startDateStr);
                let endDate = new Date(endDateStr);
                await controlPlanRepository.saveOrUpdateControlPlan(json.ZLDPROG.PLNNR + "_" + order.shopOrderId,
                    order.shopOrderId, materialPlan.materialId,
                    json.ZLDPROG.QTA_L, commStatus, startDate, endDate, json.ZLDPROG.PLNNR);

                //create LD3 groupid if not exists
                await dcGroupRepository.saveOrUpdateDcGroup(MyUtil.CTRL_PLAN_LD3);
                let dcGroup = await dcGroupRepository.getDcGroupByCode(MyUtil.CTRL_PLAN_LD3);
                dcGroupId = dcGroup.dcGroupId;
                //console.log("dcGroupId: " + dcGroupId);

                /*exchange dto */
                exchangeDTO.material = MyUtil.leadingZeros(json.ZLDPROG.MATNR_L);
                exchangeDTO.material_desc = json.ZLDPROG.MAKTX_L;
                exchangeDTO.quantity = json.ZLDPROG.QTA_L;
                exchangeDTO.start_date = startDate;
                exchangeDTO.end_date = endDate;
                exchangeDTO.comm_status = commStatus;
                exchangeDTO.cycle_group = json.ZLDPROG.PLNNR;
                /*exchange dto */
            }

            for (let c_e1affll of json.E1AFFLL) {
                for (let c_e1afvol of c_e1affll.E1AFVOL) {
                    await wcRepository.saveOrUpdateWorkcenter(c_e1afvol.ARBPL, plant.plantId);
                    let workcenter = await wcRepository.getWorkcenterByCode(c_e1afvol.ARBPL);
                    if (c_e1afvol.ARBPL.endsWith('LD3')) {
                        exchangeDTO.workcenter = c_e1afvol.ARBPL;
                    }
                    let opResult = await orderOpRepo.saveOrUpdateShopOrderOperation(c_e1afvol.VORNR,
                        order.shopOrderId, workcenter.workcenterId, c_e1afvol.LTXA1);
                    if (c_e1afvol.E1RESBL) {
                        for (let c_e1resbl of c_e1afvol.E1RESBL) {
                            //let operation = await orderOpRepo.getShopOrderOperationByCodeAndOrder(c_e1afvol.VORNR, order.shopOrderId);
                            let description = "", materialCode = MyUtil.leadingZeros(c_e1resbl.MATNR);
                            await matRepo.saveOrUpdateMaterial(materialCode, description);
                            let material = await matRepo.getMaterialByCode(materialCode);
                            let quantity = c_e1resbl.BDMNG !== "" ? c_e1resbl.BDMNG : 0;
                            let uom = c_e1resbl.MEINS;
                            await orderCompRepo.saveOrUpdateShopOrderComponent(material.materialId, opResult.insertId,
                                quantity, uom, c_e1resbl.LGORT);
                        }
                    }
                    if (c_e1afvol.ZCHARACTERISTICS) {
                        for (let c_zchar of c_e1afvol.ZCHARACTERISTICS) {
                            await dcParameterRepository.saveOrUpdateDcParameterErp(dcGroupId, opResult.insertId, c_zchar.MSTR_CHAR,
                                c_zchar.MEAS_UNIT, c_zchar.CHAR_DESCR, c_zchar.INFOFIELD1);
                            let mesChar = characteristicMapInstance.getChMesFromEcc(c_zchar.MSTR_CHAR);
                            if (mesChar) {
                                let value = c_zchar.INFOFIELD1;
                                //fix number format
                                value = value.replace(/\./g, '').replace(',', '.');
                                try {
                                    if ("" === value) {
                                        value = 0;
                                    } else {
                                        value = Number(value);
                                        if (isNaN(value)) {
                                            throw new Error("characteristic: " + mesChar + ', value = ' + value + ' is not a number');
                                        }
                                    }
                                } catch (err) {
                                    console.warn("characteristic: " + mesChar + ', value = ' + value + ' is not a number');
                                    value = 0;
                                }
                                //console.log("characteristic: " + mesChar + ', value = ' + value);
                                exchangeDTO[mesChar] = value;
                            }
                        }
                    }

                    //console.log(c_e1afvol);
                }
            }

            //let op = await orderOpRepo.getActiveShopOrderOperationByCode("op11");
            console.log("Writing: " + JSON.stringify(exchangeDTO));
            let incomingDc = await exchangeTableRepository.getIncomingDcData(exchangeDTO.shop_order);
            if (!incomingDc) {
                await exchangeTableRepository.createExchangeRecord(exchangeDTO);
            } else {
                if (incomingDc.comm_status === 3 && false === isTeco) {
                    throw new Error("Cannot update order " + incomingDc.shop_order + " with comm_status = 3");
                }
                await exchangeTableRepository.updateExchangeRecord(incomingDc.exchange_table_id, exchangeDTO);
            }

            await connection.commit();

        } catch (err) {
            console.error(err);
            errorMailManager.notifyError(err);
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

}

module.exports = DbUpdateManager;