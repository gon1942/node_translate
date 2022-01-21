const PgPromise = require('pg-promise')(/* initialization options */);

class dbModel {
    constructor() {
        this.db = PgPromise('postgres://de:exitem0*@192.168.0.2:5432/decommunity');
    }

    insert(trans) {
        let title = trans.title;
        let body = trans.body;

        return this.db.any('insert into tbl_stack_answer_ko(title, body) VALUES($1, $2)  ');
        // return this.db.any( 'insert into tbl_stack_answer_ko(title, body) VALUES($1, $2) RETURNING id ', [title, body] );
    }


    updateQuestion(data, seq, gubun ) {
        // return this.db.any( 'insert into tbl_stack_answer_ko(title, body) VALUES($1, $2)  ' );
        if( gubun == 'title'){
            return this.db.any('UPDATE tbl_stack_question_test SET tr_status_title=true, title_ko=$1 WHERE seq = $2', [data, seq]);
        }else {
            return this.db.any('UPDATE tbl_stack_question_test SET tr_status_body=true, body_ko=$1 WHERE seq = $2', [data, seq]);
        }
        // return this.db.any( 'insert into tbl_stack_answer_ko(title, body) VALUES($1, $2) RETURNING id ', [title, body] );
    }


    readAll(question_id) {
        return this.db.any('SELECT * FROM tbl_stack_answer_test where question_id = $1', [question_id]);
    }

    read_question(limitNum) {
        // return this.db.any('select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer where question_id = \'21168141\'',[limitNum]);
        // return this.db.any('select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer order by seq asc limit 1 offset $1',[limitNum]);
        let sql = 'SELECT seq, tr_status_title, tr_status_body, accepted_answer_id, answer_count, question_id, title, body, is_answered, tag, ins_date, taggubun FROM tbl_stack_question_test where question_id =\'9346211\' limit 1 offset $1';
        console.log(sql + '==' + limitNum);
        return this.db.any(sql, [limitNum]);

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
