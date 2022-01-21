const dbModel = require('./dbModel');

class dbHandler {
    constructor() {
        this.model = new dbModel();
    }

    updateQuestion(_data, _seq, _gubun) {
        console.log("update===========================" + _seq);
        this.model.updateQuestion(_data, _seq, _gubun)
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.log(error);
            });
    }
    readAll(id) {
        console.log("id=========+++++" + id);
        let question_id = id;

        console.log("question_id=========+++++" + question_id);

        this.model.readAll(question_id)
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    read_question(limitNum) {
        console.log("limitNum ---> " + limitNum);

        return new Promise((resolve, reject) => {
            this.model.read_question(limitNum)
                .then(data => {
                    console.log('got query results');
                    resolve(data);
                    // return resolve(data);
                })
                .catch(error => {
                    // error; 
                    reject('N');
                });
        });



        // this.model.read(limitNum)
        //     .then(data => {
        //         console.log(data); 
        //         resolve(data);
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     }); 
    }
}

module.exports = dbHandler;


