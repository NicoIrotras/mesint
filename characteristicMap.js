const fs = require('fs');

class CharacteristicMap {
    constructor() {
        this.mapping = null;
        this.mesToEcc = {};
        this.mesToMultiEcc = {};
        this.eccToMes = {};
    }

    loadMappingFromJson(mappingJson) {
        this.jsonMapFile = mappingJson;
        let rawdata = fs.readFileSync(this.jsonMapFile);
        this.mapping = JSON.parse(rawdata);
        for (let tmp of this.mapping) {
            this.mesToEcc[tmp.mesName] = tmp.eccName;
            this.eccToMes[tmp.eccName] = tmp.mesName;
        }

        //console.log(JSON.stringify(this.mesToEcc));
        //console.log(JSON.stringify(this.eccToMes));
    }

    loadMappingFromDb(mappingRepository) {
        let missCharMes = 1;
        let missCharEcc = 1;
        this.dbMapRepo = mappingRepository.getMapping().then(
            (result) => {
                this.mapping = result;
                for (let tmp of this.mapping) {
                    //console.log("mesName: " + tmp.mesName + " -- eccName: " + tmp.eccName);
                    if (tmp.mesName === '') {
                        this.mesToEcc["missing" + missCharMes] = tmp.eccName;
                        missCharMes++;
                    } else {
                        //!!! one column mes more ecc chars
                        if (!this.mesToMultiEcc[tmp.mesName]) {
                            this.mesToMultiEcc[tmp.mesName] = [];
                        }
                        this.mesToMultiEcc[tmp.mesName].push(tmp.eccName);
                        this.mesToEcc[tmp.mesName] = tmp.eccName;
                    }
                    if (tmp.eccName === '') {
                        this.eccToMes["missing" + missCharEcc] = tmp.mesName;
                        missCharEcc++;
                    } else {
                        this.eccToMes[tmp.eccName] = tmp.mesName;
                    }

                }
                //console.log(JSON.stringify(this.mesToEcc));
                //console.log(JSON.stringify(this.eccToMes));
            }
        ).catch(
            (err) => {
                console.error(err);
            }
        );
    }

    getChEccFromMes(mesName) {
        //console.log("RETRIEVING mesName: " + mesName + "--> eccName: " + this.mesToEcc[mesName]);
        return this.mesToEcc[mesName];
    }

    getChMultiEccFromMes(mesName) {
        //console.log("RETRIEVING mesName: " + mesName + "--> eccName: " + this.mesToEcc[mesName]);
        return this.mesToMultiEcc[mesName];
    }

    getChMesFromEcc(eccName) {
        return this.eccToMes[eccName];
    }
}

const instance = new CharacteristicMap();

module.exports = instance;
