const zlib = require("zlib");
const https = require('https');
const fs = require('fs');

const Poller = require('./Poller');
const pg = require('pg');
const R = require('ramda');
const request = require('request');
const log = require('./google-logger');
const shell = require('shelljs')

const transConfig = require('./constructor');




// DataBase Connection =============================]
// const cs = 'postgres://de:exitem0*@192.168.0.2:5432/decommunity';
// const cs = transConfig.dbConfig;
// const client = new pg.Client(cs);
// client.connect();
// console.log(client);

// 이거 쓸까나..?==========================================[[[[[[[]]]]]]]
var moment = require('moment');
const {
  query
} = require("./google-logger");
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
//var date = moment().format('YYYY-MM-DD HH:mm:ss');
// 이거 쓸까나..?==========================================[[[[[[[[[]]]]]]]]]






// 이거 쓸까나..?==========================================[[[[[[[[[]]]]]]]]]
const getRowsCntData = function () {
  const sql = 'select count(*) from tbl_stack_data';
  //const values = [key.owner, key.question_id, answersObjCnt, key.link, key.title, key.body];

  //client.query(sql, values, (err, res) => {
  client.query(sql, (err, ret) => {
    if (err) {
      log.info(err.stack);
    } else {
      //total rows count
      log.info("get data === " + JSON.stringify(ret.rows[0].count));
    }
  });

}
//getRowsCntData( );
// 이거 쓸까나..?==========================================[[[[[[[[[]]]]]]]]]


let getRequestCallBack = function (pagecnt, questionCnt, answersCnt, totalCnt) {

};




// async function tmp(val){
//   return await dbHandler.read(val);
// }

// tmp(1).then(x => console.log(x));



const getRowsData222 = function (rowDataLimit) {
  console.log("rowDataLimit==="+rowDataLimit);
  // const sql = 'select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer order by seq asc limit 1 offset ' + rowDataLimit;
  // log.info("sql---" + sql);
  
  // tmp(1).then( 
  //   x =>
  //   translateAction(x[0].body, 1)
  // );
  // tmp(1).then(x => console.log(x));











  // //client.query(sql, values, (err, res) => {
  // client.query(sql, (err, ret) => {
  //   if (err) {
  //     console.log("err------------__"+err.stack);
  //   } else {

  //     //total rows count
  //     var bodyData = ret.rows[0].body;
  //     console.log("bodyData===========++"+bodyData);
  //     var bodyDataSplit = bodyData.split("<p>");
  //     console.log("row cnt is ::: "+ bodyDataSplit.length);
  //     console.log("ret.rows==="+ ret.rows);
  //     // translateAction(ret.rows, rowDataLimit);

  //   }
  // });



  const data = fs.readFileSync('./sample.txt', {
    encoding: 'utf8',
    flag: 'r'
  });




  console.log("\r\nStart - Trans ] ##############################################");

  translateAction(data, rowDataLimit);

}


//const translateAction = async( rowsData ) => {
async function translateAction(rowsData, rowDataLimit) {

  // log.info("data row seq is ::: " + rowsData);
  // log.info("data row seq is ::: " + rowsData[0].seq);
  // var rowsSeq = rowsData[0].seq;
  var rowsBody = "";
  // var bodyDataSplit = rowsData[0].body.split("<p>");

  var bodyDataSplit = rowsData.split("<p>");

  let arrBaseTmpData = new Array(bodyDataSplit.length);
  let arrTransData = new Array(bodyDataSplit.length);


  for (var idx = 0; idx < bodyDataSplit.length; idx++) {
    let retTmpMap = new Map();


    if (bodyDataSplit[idx].length > 0) {

      if (bodyDataSplit[idx].indexOf('<pre><code>') > -1) {
        let tmpData = bodyDataSplit[idx];
        let retTmpData2 = bodyDataSplit[idx].substr(0, tmpData.indexOf('<pre><code>'));
        let retTmpData = bodyDataSplit[idx].substr(tmpData.indexOf('</code></pre>') + 13, tmpData.length);



        retTmpMap = fn_errCheck(await getRequestTranslate(retTmpData2.trim() + retTmpData, getRequestCallBack));
        // retTmpMap = fn_errCheck(await getRequestTranslateGoogle(retTmpData2.trim() + retTmpData, getRequestCallBack));
        // retTmpMap = fn_errCheck(await getRequestTranslatePapago(retTmpData2.trim() + retTmpData, getRequestCallBack));

        if (retTmpMap.get("status") != 'Y') {
          
          if( translateTool.length-1 != transConfig.constHandler.toolCount){
            transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount++], 'Y');
            console.log("========================>"+ transConfig.constHandler.getTrandTool());
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return getRowsData(rowDataLimit);
          }else{
            // rowDataLimit = transConfig.constHandler.rowDataLimit++;
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return getRowsData(rowDataLimit);
          }

          
        } else {
          arrTransData[idx] = retTmpMap.get("data");
        }


        let charExtractionNum = tmpData.indexOf('</code></pre>') - tmpData.indexOf('<pre><code>') + 13;
        let charExtractionData = tmpData.substr(tmpData.indexOf('<pre><code>'), charExtractionNum)
        arrBaseTmpData[idx] = charExtractionData;


      } else {
        retTmpMap = fn_errCheck(await getRequestTranslate(bodyDataSplit[idx], getRequestCallBack));
        // retTmpMap = fn_errCheck(await getRequestTranslateGoogle(bodyDataSplit[idx], getRequestCallBack));
        // retTmpMap = fn_errCheck(await getRequestTranslatePapago(bodyDataSplit[idx], getRequestCallBack));



        if (retTmpMap.get("status") != 'Y') {
          console.log(' Translate fail :: ' + retTmpMap.get("status"));

          if( translateTool.length-1 != transConfig.constHandler.toolCount){
            transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount++], 'Y');
            console.log("========================>"+ transConfig.constHandler.getTrandTool());
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return getRowsData(rowDataLimit);
          }else{
            // rowDataLimit = transConfig.constHandler.rowDataLimit++;
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return getRowsData(rowDataLimit);
          }
          
        } else {
          arrTransData[idx] = retTmpMap.get("data");
        }
      }
    }
    // console.log(arrTransData);
  }

  console.log("===============================\r\n\r\n\r\n");

  let transData = '';
  for (var i in arrTransData) {
    // console.log(i + '===============\n' + arrTransData[i]);
    transData += arrTransData[i] + '\r\n';
    if (typeof arrBaseTmpData[i] != undefined && arrBaseTmpData[i] !== undefined) {
      // console.log(i + '========ssssssssssssssssss=======' + arrBaseTmpData[i]);
      transData += arrBaseTmpData[i] + '\r\n';
    }
  }

  console.log("\r\n\r\n\r\n\r\n");
  console.log("\r\n\r\n\r\n\r\n");
  console.log(transData);


  // rowsBody = await getRequestTranslatePapago(rowsData[0].body, getRequestCallBack)

  // var rowsQuestion_id = rowsData[0].question_id;
  // var rowsIs_Accepted = rowsData[0].is_accepted;
  // var rowsAnswer_id = rowsData[0].answer_id;

  // insertTransData(rowsSeq, rowsQuestion_id, rowsIs_Accepted, rowsAnswer_id, rowsBody, rowDataLimit);

  rowDataLimit = transConfig.constHandler.rowDataLimit++;
  getRowsData(rowDataLimit);
}
let retTransDatamap = new Map();

function fn_errCheck(_val) {
  switch (_val) {
    case '010':
      retTransDatamap.set('status', 'errorcode [010] - limit error');
      retTransDatamap.set('data', 'errorcode');

      return retTransDatamap;
    default:
      retTransDatamap.set('status', 'Y');
      retTransDatamap.set('data', '<p>' + _val);
      return retTransDatamap;
      // default: consterrormag.msg = "succcess";  consterrormag.val ='Y'; return consterrormag;
  }

}

function getRequestTranslate(data, gubun, getRequestCallBack) {
  return new Promise(function (resolve, reject) {

    if ('google' === transConfig.constHandler.getTrandTool()) {
      let errcode = '';
      // //비동기 파일 쓰기, 
      fs.writeFile('./trans.txt', data, function (err) {
        if (err) {
          console.log('error : ' + err);
          return;
        }

        const {
          exec
        } = require("child_process");

        exec("/bin/bash trans file://trans.txt", (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            if (stderr.indexOf("limit")) {
              errcode = '010'
            }
            resolve(errcode);

          } else {
            // console.log(`stdout: ${stdout}`);
            resolve(stdout);
          }
        });

      });


    } else if ('papago' === transConfig.constHandler.getTrandTool()) {

      // Set PAPAGO Translation Client Config =======================================]
      let client_id = transConfig.papagoHandler.client_id;
      let client_secret = transConfig.papagoHandler.client_secret;
      let papago_url = transConfig.papagoHandler.papago_url;

      var sourceLanguage = "en";
      var targetLanguage = "ko";

      var options = {
        url: papago_url,
        form: {
          'source': sourceLanguage,
          'target': targetLanguage,
          'text': queryText
        },
        headers: {
          'X-Naver-Client-Id': client_id,
          'X-Naver-Client-Secret': client_secret
        }
      };

      // console.log("text is 0000 ::: " + queryText);
      request.post(options, function (error, response, body) {

        var jsonData = JSON.parse(body);
        // console.log("translate jsonData is :: " + JSON.stringify(jsonData));
        var resData = {}

        if (!error && response.statusCode == 200) {
          resData.success = 'Y';
          resData.translateData = jsonData.message.result.translatedText;
          resolve(resData.translateData);
        } else {
          // console.log("a===" + jsonData.errorCode);
          resolve(jsonData.errorCode);
          //res.status(response.statusCode).end();
          //log.info('error = ' + response.statusCode);
        }

      });
    }


  });
}



function getRequestTranslateGoogle(data, getRequestCallBack) {
  return new Promise(function (resolve, reject) {

    let errcode = '';
    // //비동기 파일 쓰기, 
    fs.writeFile('./trans.txt', data, function (err) {
      if (err) {
        console.log('error : ' + err);
        return;
      }

      const {
        exec
      } = require("child_process");

      exec("/bin/bash trans file://trans.txt", (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          if (stderr.indexOf("limit")) {
            errcode = '010'
          }
          resolve(errcode);

        } else {
          // console.log(`stdout: ${stdout}`);
          resolve(stdout);
        }
      });

    });
  });
}


//const getRequestTranslatePapago = function ( data,  getRequestCallBack ){
function getRequestTranslatePapago(queryText, getRequestCallBack) {
  return new Promise(function (resolve, reject) {

    let url = "https://openapi.naver.com/v1/papago/n2mt";
    var sourceLanguage = "en";
    var targetLanguage = "ko";

    var options = {
      url: url,
      form: {
        'source': sourceLanguage,
        'target': targetLanguage,
        'text': queryText
      },
      headers: {
        'X-Naver-Client-Id': client_id,
        'X-Naver-Client-Secret': client_secret
      }
    };

    // console.log("text is 0000 ::: " + queryText);
    request.post(options, function (error, response, body) {

      var jsonData = JSON.parse(body);
      // console.log("translate jsonData is :: " + JSON.stringify(jsonData));
      var resData = {}

      if (!error && response.statusCode == 200) {
        resData.success = 'Y';
        resData.translateData = jsonData.message.result.translatedText;
        resolve(resData.translateData);
      } else {
        // console.log("a===" + jsonData.errorCode);
        resolve(jsonData.errorCode);
        //res.status(response.statusCode).end();
        //log.info('error = ' + response.statusCode);
      }

    });
  });
}


function insertTransData(rowsSeq, question_id, is_Accepted, answer_id, body, limitCnt) {
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
      setTimeout(() => {
        getRowsData(++limitCnt);
      }, 600000); //10m
    }
  });

  //	}
}

function sleep(time) {
  var stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {
    ;
  }
}




// check Default Data 
console.log("##############################################");
console.log("\r\nTranslate Init Data Info]  ###################");


// Available Tools
let translateTool = new Array();
// console.log("transConfig.transTool============");
// console.log(transConfig.constHandler);


// transConfig.constHandler.setTransTool('papago', 'Y');
// console.log("get tool name and used is "+ transConfig.constHandler.getTrandTool());

console.log(">> Total Translate Tools is : ");
// 사용가능한 번역툴 확인
for (let ts = 0; ts < transConfig.transTool.length; ts++) {
  console.log(transConfig.transTool[ts]);
  if (transConfig.transTool[ts].status == 'Y') {
    translateTool[ts] = transConfig.transTool[ts].name;
  }
}



// if( translateTool.length > 1 ){
// 사용가능한 툴에서 첫번째를 디폴트로 지정
// transConfig.constHandler.setTransTool(translateTool[0], 'Y');
transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount], 'Y');
// }




console.log("\r\n>> Available Tools :::" + translateTool +", length is :: " + translateTool.length);
console.log("\r\n>> Used Translator Tool Name is :: " + transConfig.constHandler.getTrandTool());
console.log("\r\n>> Trans Tool Used Count is :: " + transConfig.constHandler.toolCount);

let rowDataLimit = transConfig.constHandler.rowDataLimit;
// getRowsData(rowDataLimit);



const DbModelHandler = require('./dbHandler');
const dbHandler = new DbModelHandler();
// dbHandler.readAll('12578499');

const getRowsData = async (rowDataLimit) => {
  console.log("getRowsData=============+++"+ rowDataLimit);
  let a =  await dbHandler.read(rowDataLimit);
  console.log(a[0].body);

  translateAction(a[0].body, rowDataLimit);
  // return a;
}

getRowsData(rowDataLimit);
// getRowsData222(rowDataLimit);
