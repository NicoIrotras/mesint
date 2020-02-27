const fs = require('fs');
const unirest = require('unirest');

/*
{
	"prodOrder": "232323",
	"finalConfirmation": "0",
	"reelSeq": "3",
	"material": "70707070",
	"batch": "Sono BATCHMAN",
	"chars": [{
			"nameChar": "PLD104",
			"valueChar": 34.6
		}, {
			"nameChar": "PLD130",
			"valueChar": 324.6
		}
	]
}
*/

class ErpCharSender {
    constructor() {
    }

    loadErpConfFromJson(erpJsonConfFile) {
        this.erpJsonConfFile = erpJsonConfFile;
        let rawdata = fs.readFileSync(this.erpJsonConfFile);
        this.data = JSON.parse(rawdata);
    }

    getErpCharUrl() {
        return this.data.protocol + "://" + this.data.erpHost + ":" + this.data.erpPort + this.data.apiPath;
    }

    async sendChars(charMessage) {

        console.log("Sending [" + this.getErpCharUrl() + "]: " + JSON.stringify(charMessage));

        let self = this;

        return new Promise(function(resolve, reject) {

            unirest.post(self.getErpCharUrl())
                .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
                .send(charMessage)
                .end((response) => {
                    if (response.status === 200) {
                        if ('S' === response.body.TYPE) {
                            resolve(response.body);
                        } else {
                            reject(response.body.RESULTMESSAGE);
                        }
                    } else if (response.error && response.error.code) {
                        //console.log(JSON.stringify(response.error));
                        let message = response.error.code + ': address: ' + response.error.address + ', port: ' + response.error.port;
                        reject(message);
                    } else if (response.error) {
                        //console.log(JSON.stringify(response.error));
                        reject("Cannot send char info");
                    } else {
                        console.log(JSON.stringify(response));
                        reject("Cannot send char info");
                    }
                });

        });
    }


}

let instance = new ErpCharSender();
module.exports = instance;