const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const DbUpdateManager = require('./dbUpdateManager');
const ExchangeMappingRepository = require('./exchangeMappingRepository');
const characteristicMap = require('./characteristicMap');
const dcSchedulerInstance = require('./dcScheduler');

const connectionPoolManagerInstance = require('./connectionPoolManager');
const MessageMonRepository = require('./messageMonRepository');
const MyUtil = require('./myUtil');

const errorMailManager = require('./errorMailManager');
errorMailManager.initialize();

const initializationObj = {
  messageMonRepo: null,
  dbUpdateManager: null
}

// Set up the express app
const app = express();

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// -- main ERP->MES API (update MES DB from IDOC)
app.post('/', (req, res) => {

  var response;
  let jsonRequest = JSON.stringify(req.body);
  let msgObjectId = "ORDER_" + req.body.AUFNR;


  initializationObj.messageMonRepo.saveOrUpdateMessageMon("ERP", "MES", msgObjectId, jsonRequest, "PROCESSING")
    .then(
      (msgId) => {
        initializationObj.dbUpdateManager.updateMesDb(req.body).then(
          () => {
            initializationObj.messageMonRepo.updateMessageMonStatus(msgId, "SUCCESS").catch(
              (err) => { console.error(err); }
            );
            response = MyUtil.getSuccessResponseFrom("IDOC loaded", "S", "30");
            res.status(200).send(response);
          }
        ).catch(
          (err) => {
            initializationObj.messageMonRepo.updateMessageMonStatus(msgId, "FAILED").catch(
              (err) => { console.error(err); }
            );
            response = MyUtil.getErrorResponseFrom("IDOC NOT loaded: " + err, "E", "31");
            console.error(err);
            errorMailManager.notifyError(err);
            res.status(400).send(response);
          }
        );
      }

    ).catch((err) => {
      response = MyUtil.getErrorResponseFrom("IDOC NOT loaded: " + err, "E", "31");
      console.error(err);
      errorMailManager.notifyError(err);
      res.status(400).send(response);
    });

});

// starting the server
app.listen(3002, () => {
  initApplication(initializationObj);
  console.log('listening on port 3002');
}).on('error', (err) => {
  console.error(err);
});

function initApplication(initializationObj) {

  //initialize db connection
  connectionPoolManagerInstance.initDb().catch(
    (err) => { console.error(err.stack) }
  );

  MyUtil.initGracefulShutDown(process, connectionPoolManagerInstance, dcSchedulerInstance);

  dcSchedulerInstance.initScheduler("exchangeCronJob.json").then((jobs) => {
    dcSchedulerInstance.start();
  }).catch((err) => {
    console.error(err);
  });

  initializationObj.messageMonRepo = new MessageMonRepository(connectionPoolManagerInstance.getConnectionPool());
  initializationObj.exchangeMappingRepository = new ExchangeMappingRepository(connectionPoolManagerInstance.getConnectionPool());

  characteristicMap.loadMappingFromDb(initializationObj.exchangeMappingRepository);

  initializationObj.dbUpdateManager = new DbUpdateManager();

}