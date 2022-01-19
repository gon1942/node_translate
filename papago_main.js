const zlib = require("zlib");
const https = require('https');
const fs = require('fs');

const Poller = require('./Poller');
const pg = require('pg');
const R = require('ramda');
var request = require('request');
var log = require('./logger');
//var sleep = require('sleep');

const cs = 'postgres://de:exitem0*@192.168.0.2:5432/decommunity';
const client = new pg.Client(cs);
client.connect();

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
                        //log.info(err.stack);
               } else {
		       //total rows count
		       //log.info("get data === "+ JSON.stringify(ret.rows[0].count));
               }
        });

}
//getRowsCntData( );



const getRowsData = function (limitCnt){

        const sql = 'select seq, accepted_answer_id, answer_count,  question_id, title, body, is_answered, tag, ins_date, taggubun  from tbl_stack_question order by seq asc limit 1 offset '+ limitCnt;
	 log.info("sql---" + sql);

        //client.query(sql, values, (err, res) => {
        client.query(sql, (err, ret) => {
               if (err) {
                        //log.info(err.stack);
               } else {

                       	//total rows count
		       	var bodyData = ret.rows[0].body;
		       	var bodyDataSplit = bodyData.split("<p>");
		       	//console.log("row cnt is ::: "+ bodyDataSplit.length);
		       
		        translateAction(ret.rows, limitCnt);
		       
               }
        });

}
let getRowsCnt = 229;
getRowsData( getRowsCnt );

//const translateAction = async( rowsData ) => {
async function translateAction(rowsData, limitCnt){

	 //log.info( "data row seq is ::: " + rowsData[0].seq );
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
	//		tmpryan = await getRequestTranslatePapago( rowsData[0].body, getRequestCallBack);
	//		//tmpryan = await getRequestTranslatePapago( bodyDataSplit[item], getRequestCallBack);
	//	
	//		//tmpryan = await getRequestTranslateGoogle(bodyDataSplit[item], getRequestCallBack);
	//		
	//		bodyDataSplit[item] = tmpryan;
	//		rowsBody += tmpryan;


	//	}else if( bodyDataSplit[item].length > 0){
	//		//bodyDataSplit[item] = "<p>" + bodyDataSplit[item];
	//		rowsBody += "<p>"+bodyDataSplit[item];
	//	}
	//}


	var rowsTitle = rowsData[0].title;
	//var rowsTitleKo = await getRequestTranslateGoogle(rowsTitle, getRequestCallBack);
	var rowsTitleKo = await getRequestTranslatePapago(rowsTitle, getRequestCallBack);
	var rowsQuestion_id = rowsData[0].question_id;
	var rowsAccepted_answer_id = rowsData[0].accepted_answer_id;
	var rowsAnswer_count = rowsData[0].answer_count;
	var rowsIs_answered = rowsData[0].is_answered;
	var rowsTag = rowsData[0].tag;
	var rowsTaggubun = rowsData[0].taggubun;


	insertTransData(rowsSeq, rowsQuestion_id, rowsTitleKo, rowsBody, limitCnt, rowsAccepted_answer_id, rowsAnswer_count, rowsIs_answered, rowsTag, rowsTaggubun );

}


function insertTransData(seq, question_id, title, body, limitCnt, rowsAccepted_answer_id, rowsAnswer_count, rowsIs_answered, rowsTag, rowsTaggubun){
	//log.info("limit cnt  is " + limitCnt);
	//log.info("seq is " + seq);
	//log.info("question id is " + question_id);
	//log.info("title is " + title);
	//log.info("body is " + body);
	//log.info(" rowsAccepted_answer_id is ::  " + rowsAccepted_answer_id);
	//log.info(" rowsAnswer_count, is ::  " + rowsAnswer_count );
	//log.info(" rowsIs_answered, is ::  " + rowsIs_answered );
	//log.info(" rowsTag is ::  " +rowsTag );
	//log.info(" rowsTaggubun is ::  " + rowsTaggubun );

//	if( limitCnt <= 5){

		//setTimeout(() => {
		//	const sql = 'insert into tbl_stack_data_ko (base_seq, question_id, title, body) values( $1, $2, $3, $4) ';
                //	const values = [seq, question_id, title, body];

                //	client.query(sql, values, (err, res) => {
                //	       if (err) {
                //	               console.log(err);
                //	       } else {
                //	               console.log(res);
		//		       if( res.rowCount == 1){
		//			       getRowsData(++limitCnt);
		//		       }
                //	              // sleepAction(4000, getRowsData( limitCnt ));
                //	       }
                //	});	
		//
		//}, 1800000);
		const sql = 'insert into tbl_stack_question_ko (base_seq, question_id, body, title, accepted_answer_id, answer_count, is_answered, tag, ins_date, taggubun) values( $1, $2, $3, $4, $5, $6, $7, $8, now(), $9) ';
                const values = [seq, question_id, title, body, rowsAccepted_answer_id, rowsAnswer_count, rowsIs_answered, rowsTag,  rowsTaggubun];

                client.query(sql, values, (err, res) => {
                       if (err) {
                               //log.info(err);
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


// translation] google 
//const getRequestTranslateGoogle = function ( data,  getRequestCallBack ){
function getRequestTranslateGoogle( data,  getRequestCallBack ){
	return new Promise(function(resolve, reject){
	
		// version 1
		var queryText = data.split("</p");
		var urlGoogle = "https://translation.googleapis.com/language/translate/v2?q="+queryText+"&source=&target=ko&model=nmt&key=AIzaSyDbLHlxeb4XzDtSj_uPoFu4D1w1qPvPKEM"
		var gunzip = require('zlib').createGunzip();
		var options = {
			host: 'translation.googleapis.com',
		    	path: '/language/translate/v2?q='+encodeURI(queryText[0])+'&source=&target=ko&model=nmt&key=AIzaSyDbLHlxeb4XzDtSj_uPoFu4D1w1qPvPKEM',
			headers : {
		        //    'Authorization' : 'Basic VHJhZasfasNWEWFScsdfsNCdXllcjE6dHJhZGVjYXJk',
		            'Content-Type' : 'application/json; charset=UTF=8',
		            'Accept-Encoding' : 'gzip,deflate,sdch'
		        }
		};
		
		request.post(options, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var jsonData = JSON.parse(body);
				//log.info("translate jsonData is :: " + jsonData);
				var resData = {}
				resData.success = 'Y';
				resData.translateData = jsonData.message.result.translatedText;
				////res.send(resData);

			} else {
			//	res.status(response.statusCode).end();
				//log.info('error = ' + response);
			}
		});

		//https.get(options, function(res) {
		//	var body = '';
		//  	res.pipe(gunzip);
		//  	gunzip.on('data', function (data) {
		//      		body += data;
		//  	});
		//  	gunzip.on('end', function() {
		//		var jsonData = JSON.parse(body);
		//		console.log("====>>>" + JSON.stringify(jsonData) );
		//		var jsonTransData = JSON.stringify(jsonData.data.translations[0].translatedText);
		//		//console.log("====>"+ jsonTransData.replace(/"/gi, ""));
		//		resolve("<p>" + jsonTransData.replace(/"/gi, "")+"</p>");
		//  	});
		//});

		// version 2
		//const translate = require('@vitalets/google-translate-api');
        	//var queryText = data.split("</p");
        	//var sourceLanguage = "en";
        	//var targetLanguage = "ko";

        	//console.log("text is ::: " + queryText[0]);
		//
		//translate(queryText[0], {to: 'ko'}).then(res => {
		//    console.log(res.text);
		//    //=> I speak English
		//    //console.log(res.from.language.iso);
		//    //=> nl
		//}).catch(err => {
		//    console.error(err);
		//});
	});

}


// translation] naver
let client_id = 'lXcYqHZGWz8A0zEy5_00';
let client_secret = '0HejW2Rynn';
let url = "https://openapi.naver.com/v1/papago/n2mt";
let getRequestCallBack = function (pagecnt, questionCnt, answersCnt, totalCnt){

};


//const getRequestTranslatePapago = function ( data,  getRequestCallBack ){
function getRequestTranslatePapago( data,  getRequestCallBack ){
        return new Promise(function(resolve, reject){
	
//console.log("data>>>>>>>>>>>>>>" + data);

	//let client_id = 'lXcYqHZGWz8A0zEy5_00';
	//let client_secret = '0HejW2Rynn';
	var client_id = 'lXcYqHZGWz8A0zEy5_00';
	var client_secret = '0HejW2Rynn'
	let url = "https://openapi.naver.com/v1/papago/n2mt";

	var queryText = data.split("</p");
        var sourceLanguage = "en";
        var targetLanguage = "ko";

        var options = {
                url: url,
                form: {'source': sourceLanguage, 'target': targetLanguage, 'text': queryText[0]},
                headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
        };

//	console.log("text is ::: " + queryText[0]);

        //https.get(options, function(response) {
	request.post(options, function (error, response, body) {
		 if (!error && response.statusCode == 200) {
                        var jsonData = JSON.parse(body);
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

