const fs = require('fs');
const nodemailer = require('nodemailer');


class ErrorMailManager {
    constructor() {
    }

    loadConfFromJson(confFile) {
        this.confFile = confFile;
        let rawdata = fs.readFileSync(this.confFile);
        this.conf = JSON.parse(rawdata);
        this.transport = nodemailer.createTransport(this.conf.mailServerConf);
    }

    initialize() {
        try {
            this.loadConfFromJson("mailConf.json");
        } catch (err) {
            console.error(err.stack);
        }
    }

    notifyError(error) {
        try {
            let message = JSON.parse(JSON.stringify(this.conf.contentErrorTemplate));
            message.text = error.stack ? error.stack : error;
            console.debug("sending email error: " + message.text);
            this.transport.sendMail(message, function(err, info) {
                if (err) {
                    console.error(err)
                } else {
                    console.debug(info);
                }
            });
        } catch (err) {
            console.error(err);
        }
    }

}

let instance = new ErrorMailManager();
module.exports = instance;