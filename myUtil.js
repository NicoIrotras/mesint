

const moment = require('moment');

class MyUtil {

  static leadingZeros(numberString) {
    return numberString.replace(/^0+/, '');
  }

  static getSuccessResponseFrom(resultMessage, type, resultCode) {
    let responseTemplate = { RESULT: "OK", RESULTMESSAGE: "", TYPE: "", NUMBER: "" };
    responseTemplate.RESULTMESSAGE = resultMessage;
    responseTemplate.TYPE = type;
    responseTemplate.RESULTCODE = resultCode;
    responseTemplate.NUMBER = resultCode;
    return responseTemplate;
  }

  static getErrorResponseFrom(resultMessage, type, resultCode) {
    let responseTemplate = { RESULT: "KO", RESULTMESSAGE: "", TYPE: "", NUMBER: "" };
    responseTemplate.RESULTMESSAGE = resultMessage;
    responseTemplate.TYPE = type;
    responseTemplate.RESULTCODE = resultCode;
    responseTemplate.NUMBER = resultCode;
    return responseTemplate;
  }

  static initGracefulShutDown(process, connectionPoolManagerInstance, dcSchedulerInstance) {
    process.stdin.resume();//so the program will not close instantly

    function exitHandler(options, exitCode) {
      console.log("closing db connection");
      if (options.cleanup) {
        dcSchedulerInstance.stop();
        if (connectionPoolManagerInstance.getConnectionPool()) {
          connectionPoolManagerInstance.getConnectionPool().end();
        }
      } else if (exitCode || exitCode === 0) {
        dcSchedulerInstance.stop();
        if (connectionPoolManagerInstance.getConnectionPool()) {
          connectionPoolManagerInstance.getConnectionPool().end();
        }
      }
      if (options.exit) {
        dcSchedulerInstance.stop();
        if (connectionPoolManagerInstance.getConnectionPool()) {
          connectionPoolManagerInstance.getConnectionPool().end();
        }
        process.exit();
      }
    }

    //do something when app is closing
    process.on('exit', exitHandler.bind(null, { cleanup: true }));

    //catches ctrl+c event
    process.on('SIGINT', exitHandler.bind(null, { exit: true }));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
    process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

    //catches uncaught exceptions
    process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

  }

  static getExchangeDTO() {
    //exchange table just for LD3 workcenter
    let exchangeDTO = {
      shop_order: "",
      plant: "",
      workcenter: "LD3",
      status_code: "INCOMING_PARAMS",
      material: "",
      material_desc: "",
      quantity: -1,
      cycle_group: "",
      start_date: new Date(0),
      end_date: new Date(0),
      comm_status: -1,
      coil_weight: -1,
      ext_diameter: -1,
      coil_length: -1,
      coil_date: "",
      coil_time: "",
      final_confirmation: -1,
      material_sl: "",
      batch_sl: "",
      reel_history_pdf: ""
    };
    return exchangeDTO;
  }

  static getParamToExclude() {
    let exchangeDTO = {
      shop_order: "",
      plant: "",
      workcenter: "LD3",
      status_code: "INCOMING_PARAMS",
      material: "",
      material_desc: "",
      quantity: -1,
      cycle_group: "",
      start_date: new Date(0),
      end_date: new Date(0),
      comm_status: -1,
      final_confirmation: -1,
      date_and_time_coil: "",
      coil_height: -1,
      material_sl: "",
      batch_sl: "",
      reel_history_pdf: ""
    };
    exchangeDTO.exchange_table_id = -1;
    exchangeDTO.reel_seq = -1;
    exchangeDTO.update_time = -1;

    return exchangeDTO;
  }

  static get MANDATORY_CHARS() {
    return {
      coil_weight: -1,
      ext_diameter: -1,
      coil_length: -1,
      real_grammage: -1,
      coil_date: "",
      coil_time: ""
    };
  }

  static get WORKCENTER_LD3() {
    return 'LD3';
  }

  static get CTRL_PLAN_LD3() {
    return 'CTRL_PLAN_LD3';
  }

  static validateExchangeTableResult(result) {

    if ("" === result.plant || null === result.plant) {
      throw new Error("PLant is empty");
    }

    if ("" === result.workcenter || null === result.workcenter) {
      throw new Error("Workcenter is empty");
    }

    if ("" === result.shop_order || null === result.shop_order) {
      throw new Error("ShopOrder is empty");
    }

    if ("" === result.material || null === result.material) {
      throw new Error("Material is empty");
    }

  }

  static getEccDateStr(plcDateTime) {

    if (!plcDateTime || "" === plcDateTime) {
      return "";
    }

    let plcDate = moment(plcDateTime, 'DD/MM/YYYY hh.mm.ss');
    return plcDate.format('YYYYMMDD');

  }

  static getEccTimeStr(plcDateTime) {

    if (!plcDateTime || "" === plcDateTime) {
      return "";
    }

    let plcDate = moment(plcDateTime, 'DD/MM/YYYY hh.mm.ss');
    return plcDate.format('HH:mm:ss');

  }

  static checkTecoStatus(statuses) {
    let isTeco = false;
    if (statuses && statuses.length > 0) {
      for (let status of statuses) {
        if ("I0045" === status.STAT) {
          isTeco = true;
          break;
        }
      }
    }
    return isTeco;
  }

}

module.exports = MyUtil;
