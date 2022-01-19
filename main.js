const zlib = require("zlib");
const https = require('https');
const fs = require('fs');

const Poller = require('./Poller');
const pg = require('pg');
const R = require('ramda');
var request = require('request');
var log = require('./google-logger');

const cs = 'postgres://de:exitem0*@192.168.0.233:5432/decommunity';
const client = new pg.Client(cs);
// client.connect();
client.connect(err => { if (err) { console.log('Failed to connect db ' + err) } else { console.log('Connect to db done!') } })

var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
//var date = moment().format('YYYY-MM-DD HH:mm:ss');



const getRowsCntData = function (){
	const sql = 'select count(*) from tbl_stack_data';
        //const values = [key.owner, key.question_id, answersObjCnt, key.link, key.title, key.body];

        //client.query(sql, values, (err, res) => {
        client.query(sql, (err, ret) => {
               if (err) {
                        log.info(err.stack);
               } else {
		       //total rows count
		       log.info("get data === "+ JSON.stringify(ret.rows[0].count));
               }
        });

}
getRowsCntData( );



const getRowsData = function (limitCnt){

        const sql = 'select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer order by seq asc limit 1 offset '+ limitCnt;
	 log.info("sql---" + sql);

        //client.query(sql, values, (err, res) => {
        client.query(sql, (err, ret) => {
               if (err) {
                        log.info(err.stack);
               } else {

                       	//total rows count
		       	var bodyData = ret.rows[0].body;
		       	var bodyDataSplit = bodyData.split("<p>");
		       	//console.log("row cnt is ::: "+ bodyDataSplit.length);
		       
		        translateAction(ret.rows, limitCnt);
		       
               }
        });

}
let getRowsCnt = 343;
// getRowsData( getRowsCnt );

//const translateAction = async( rowsData ) => {
async function translateAction(rowsData, limitCnt){

	 log.info( "data row seq is ::: " + rowsData[0].seq );
	var rowsSeq = rowsData[0].seq;
	var rowsBody = "";
	var bodyDataSplit = rowsData[0].body.split("<p>");


	rowsBody = await getRequestTranslatePapago( rowsData[0].body, getRequestCallBack)

	//var tmpryan = "";	
	//for (var item in bodyDataSplit){
	//        var aTagChk = bodyDataSplit.indexOf("<a");
	//        var imgTagChk = bodyDataSplit[item].indexOf("\<a");

	//	if( aTagChk < 0 && imgTagChk < 0 && bodyDataSplit[item].length > 0){
	//		//console.log("a---yy" + item+"===="+ bodyDataSplit[item].length);
	//		
	//		//번역기 선택
	//		//tmpryan = await getRequestTranslatePapago( rowsData[0].body, getRequestCallBack);
	//		//tmpryan = await getRequestTranslatePapago( bodyDataSplit[item], getRequestCallBack);
	//	
	//		tmpryan = await getRequestTranslateGoogle(bodyDataSplit[item], getRequestCallBack);
	//		
	//		bodyDataSplit[item] = tmpryan;
	//		rowsBody += tmpryan;


	//	}else if( bodyDataSplit[item].length > 0){
	//		//bodyDataSplit[item] = "<p>" + bodyDataSplit[item];
	//		rowsBody += "<p>"+bodyDataSplit[item];
	//	}
	//}

	var rowsQuestion_id = rowsData[0].question_id;
	var rowsIs_Accepted = rowsData[0].is_accepted;
	var rowsAnswer_id = rowsData[0].answer_id;

	insertTransData(rowsSeq, rowsQuestion_id, rowsIs_Accepted, rowsAnswer_id, rowsBody, limitCnt );

}


function insertTransData( rowsSeq, question_id, is_Accepted, answer_id, body, limitCnt ){
	log.info("limit cnt  is " + limitCnt);

	log.info("seq is " + rowsSeq);
	log.info("question id is " + question_id);
	log.info("is_accepted is " + is_Accepted);
	log.info("answer_id is " + answer_id);
	log.info("body is " + body);

		const sql = 'insert into tbl_stack_answer_ko (base_seq, answer_id, question_id, body, ins_date) values( $1, $2, $3, $4, now() ) ';
                const values = [rowsSeq, answer_id, question_id, body];

                client.query(sql, values, (err, res) => {
                       if (err) {
                               log.info(err);
                       } else {
			       //log.info(JSON.stringify(res));
			       //setTimeout(() => { getRowsData( ++limitCnt ); }, 6000);
			       setTimeout(() => { getRowsData( ++limitCnt ); }, 600000); //10m
                       }
                });

//	}
}

function sleep(time ) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
}



// translation] naver
let client_id = 'GaRr6G3O0E3ZIQBX74mr';
let client_secret = 'e31d4kLTkv';
let url = "https://openapi.naver.com/v1/papago/n2mt";
let getRequestCallBack = function (pagecnt, questionCnt, answersCnt, totalCnt){

};


//const getRequestTranslatePapago = function ( data,  getRequestCallBack ){
function getRequestTranslatePapago( data,  getRequestCallBack ){
        return new Promise(function(resolve, reject){
	
//console.log("data>>>>>>>>>>>>>>" + data);

	//let client_id = 'lXcYqHZGWz8A0zEy5_00';
	//let client_secret = '0HejW2Rynn';
	//var client_id = 'lXcYqHZGWz8A0zEy5_00';
	//var client_secret = '0HejW2Rynn'
	let url = "https://openapi.naver.com/v1/papago/n2mt";

	var queryText = data.split("</p");
        var sourceLanguage = "en";
        var targetLanguage = "ko";

        var options = {
                url: url,
                form: {'source': sourceLanguage, 'target': targetLanguage, 'text': queryText[0]},
                headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
        };

	console.log("text is 0000 ::: " + queryText[0]);
	console.log("text is 1111 ::: " + queryText[1]);

        //https.get(options, function(response) {
	request.post(options, function (error, response, body) {

		 if (!error && response.statusCode == 200) {
                        var jsonData = JSON.parse(body);
                        //console.log("translate jsonData is :: " + JSON.stringify(jsonData));
                        var resData = {}
                        resData.success = 'Y';
                        resData.translateData = jsonData.message.result.translatedText;
			resolve(resData.translateData+"</p>");
                } else {
                        //res.status(response.statusCode).end();
                        //log.info('error = ' + response.statusCode);
                }

	});
	});		
}

