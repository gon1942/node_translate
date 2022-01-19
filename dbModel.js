const PgPromise = require('pg-promise')(/* initialization options */);

class dbModel{
    constructor(){
        this.db = PgPromise('postgres://ryan:1234@localhost:5432/ask_db');
    }

    insert( trans ){
        let title = trans.title;
        let body = trans.body;

        return this.db.any( 'insert into tbl_stack_answer_ko(title, body) VALUES($1, $2)  ' );
        // return this.db.any( 'insert into tbl_stack_answer_ko(title, body) VALUES($1, $2) RETURNING id ', [title, body] );
    }


    readAll(question_id){
        return this.db.any('SELECT * FROM tbl_stack_answer where question_id = $1', [question_id]);
    }

    read( limitNum ){
        return this.db.any('select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer where question_id = \'21168141\'',[limitNum]);
        // return this.db.any('select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer order by seq asc limit 1 offset $1',[limitNum]);
    }

    test_read(limitNum) {
        return new Promise((resolve, reject) => {
            this.db.one('select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer order by seq asc limit 1 offset $1', [limitNum]).then(data => {
                console.log('got query results');
                resolve(data);
                // return data;
            });
        });
    }

}

module.exports = dbModel;
