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


let retTransDatamap = new Map();


// 이거 쓸까나..?========================================================[[[[[[[]]]]]]]
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

const getRowsDataFromDB = function (limitCnt) {

  const sql = 'select seq, is_accepted, score, answer_id, question_id, body, ins_date from tbl_stack_answer order by seq asc limit 1 offset ' + limitCnt;
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

function insertTransData(_data) {
  console.log("insert=====================");
  let dataInfo = transConfig.constHandler.rowDataInfo;
  let updateSql = '';
  let updateValues = '';



  //origin row data infot 
  log.info(`seq is [${dataInfo.seq}]`);
  log.info(`question_id  is [${dataInfo.question_id}]`);
  // log.info(`body  is [${_data}]`);
  log.info(`tr_status_title is [${dataInfo.tr_status_title}]`);
  log.info(`tr_status_body is [${dataInfo.tr_status_body}]`);
  log.info(`answer_count is [${dataInfo.answer_count}]`);
  log.info(`accepted_answer_id is [${dataInfo.is_answered}]`);
  log.info(`tr_status_body id is [${dataInfo.tag}]`);
  log.info(`tr_status_body id is [${dataInfo.ins_date}]`);
  log.info(`tr_status_body id is [${dataInfo.taggubun}]`);

  if (dataInfo.tr_status_title == false) {
    dbHandler.updateQuestion(_data, dataInfo.seq, 'title');
  } else if (dataInfo.tr_status_body == false) {
    dbHandler.updateQuestion(_data, dataInfo.seq, 'body');
  }

}
function insertTransData2(rowsSeq, question_id, is_Accepted, answer_id, body, limitCnt) {
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



// 이거 쓸까나..?==========================================[[[[[[[[[]]]]]]]]]


let getRequestCallBack = function (pagecnt, questionCnt, answersCnt, totalCnt) {

};


var dataConvertArray = new Array(); // 테그 기준으로 문자열을 배열에 저장
let dataRowCount = 0;
let tmpTransData = new Array();



/**
 * 번역 대상 텍스트 문구에서 Html tag을 기준으로 번역 문구 판별.
 * @param {} data 
 * @param {*} dataRowCount 
 * @returns 
 */
function dataConvert(data, dataRowCount) {
  // console.log("################# dataConvert==========> " + data);

  let stTag = data.indexOf("<");
  let endTag = data.indexOf(">")
  let tagName = data.substr((stTag + 1), (endTag - 1));

  if (tagName.length > 0) {

    let findStTagNm = "<" + tagName + ">";
    let findEndTagNm = "</" + tagName + ">";

    let tagStNameNumber = '';
    let tagEndNameNumber = '';

    if (tagName.indexOf("pre") > -1) {
      findStTagNm = "<pre";
      findEndTagNm = "</pre>";
    } else {
      findStTagNm = "<" + tagName + ">";
      findEndTagNm = "</" + tagName + ">";
    }


    tagStNameNumber = data.indexOf(findStTagNm);
    tagEndNameNumber = data.indexOf(findEndTagNm);

    console.log("::: chk tag Info ::: stat name & index>>------------------------tagStName===" + findStTagNm + '(' + tagStNameNumber + ')-' + findEndTagNm + '(' + tagEndNameNumber + ')');
    // console.log("::: chk tag Info ::: end name * index >>------------------------tagEndName===" + findEndTagNm + '===' + tagEndNameNumber);

    let tagBody = data.substr(tagStNameNumber, tagEndNameNumber) + findEndTagNm;
    let tmpData = data.substring(tagEndNameNumber + findEndTagNm.length).trim();

    dataConvertArray[dataRowCount] = tagBody;

    dataRowCount = dataRowCount + 1;
    // console.log("################ ] tagBody---------------------------------------------------------------------");
    // console.log(tagBody);
    // console.log("################] tmpData-------------------------------------------------------------------");
    // console.log("tmpData====================>>>>>\r\n" + tmpData);
    // console.log(dataRowCount - 1 + "]  END----- [" + tagName + "]--------\r\n\r\n\r\n");
    dataConvert(tmpData, dataRowCount);

  } else {
    dataConvertArray[0] = data;
  }


  return dataConvertArray;
}


// 사용안함
async function translateAction(rowsData, rowDataLimit) {


  var rowsBody = "";
  // var bodyDataSplit = rowsData[0].body.split("<p>");

  for (var idx = 0; idx < bodyDataSplit.length; idx++) {
    let retTmpMap = new Map();


    if (bodyDataSplit[idx].length > 0) {

      // console.log(idx +"------->"+"#################SSSSSSSSSSSSSSSS###########################");
      // console.log(bodyDataSplit[idx]);
      // console.log(idx +"------->"+"###############EEEEEEEEEEEEE#############################\r\n\r\n");

      if (bodyDataSplit[idx].indexOf('<pre><code>') > -1) {
        let tmpData = bodyDataSplit[idx];
        let retTmpData2 = bodyDataSplit[idx].substr(0, tmpData.indexOf('<pre><code>'));
        let retTmpData = bodyDataSplit[idx].substr(tmpData.indexOf('</code></pre>') + 13, tmpData.length);

        retTmpMap = fn_errCheck(await getRequestTranslatePapago(retTmpData2.trim() + retTmpData, getRequestCallBack));


        if (retTmpMap.get("status") != 'Y') {

          if (translateTool.length - 1 != transConfig.constHandler.toolCount) {
            transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount + 1], 'Y');
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return getRowsData(rowDataLimit);
          } else {
            rowDataLimit = transConfig.constHandler.rowDataLimit + 1;
            return getRowsData(rowDataLimit);
          }

        } else {
          arrTransData[idx] = retTmpMap.get("data");
        }


        let charExtractionNum = tmpData.indexOf('</code></pre>') - tmpData.indexOf('<pre><code>') + 13;
        let charExtractionData = tmpData.substr(tmpData.indexOf('<pre><code>'), charExtractionNum)
        arrBaseTmpData[idx] = charExtractionData;


      } else {

        retTmpMap = fn_errCheck(await getRequestTranslatePapago(bodyDataSplit[idx], getRequestCallBack));

        if (retTmpMap.get("status") != 'Y') {
          console.log('#### Translate fail :: ' + retTmpMap.get("status"));

          if (translateTool.length - 1 != transConfig.constHandler.toolCount) {
            transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount + 1], 'Y');
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return getRowsData(rowDataLimit);
          } else {
            rowDataLimit = transConfig.constHandler.rowDataLimit + 1;
            return getRowsData(rowDataLimit);
          }
        } else {
          arrTransData[idx] = retTmpMap.get("data");
        }

      }


    }
    // console.log(arrTransData);
  }

  console.log("########################33\r\n\r\n\r\n");

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
  console.log(" translate End ====> now row data limit number is " + (rowDataLimit - 1));
  // getRowsData(rowDataLimit);
}


// 에러 코드 관리
function fn_errCheck(_val) {
  switch (_val) {
    case '010':
      retTransDatamap.set('status', transConfig.constHandler.getTrandTool() + ' :::> errorcode [010] - limit error');
      retTransDatamap.set('data', 'errorcode');

      return retTransDatamap;
    default:
      retTransDatamap.set('status', 'Y');
      retTransDatamap.set('data', _val);
      return retTransDatamap;
    // default: consterrormag.msg = "succcess";  consterrormag.val ='Y'; return consterrormag;
  }

}


/**
 * 번역
 * @param {*} data 
 * @param {*} gubun 
 * @param {*} getRequestCallBack 
 * @returns 
 */
function getRequestTranslate(data, gubun, getRequestCallBack) {
  return new Promise(function (resolve, reject) {
    if ('google' === transConfig.constHandler.getTrandTool()) {
      // let errcode = '';
      // // //비동기 파일 쓰기, 
      // fs.writeFile('./trans.txt', data, function (err) {
      //   if (err) {
      //     console.log('error : ' + err);
      //     return;
      //   }

      //   const {
      //     exec
      //   } = require("child_process");

      //   exec("/bin/bash trans file://trans.txt", (error, stdout, stderr) => {
      //     if (error) {
      //       console.log(`error: ${error.message}`);
      //       return;
      //     }
      //     if (stderr) {
      //       console.log(`stderr: ${stderr}`);
      //       if (stderr.indexOf("limit")) {
      //         errcode = '010'
      //       }
      //       resolve(errcode);

      //     } else {
      //       // console.log(`stdout: ${stdout}`);
      //       resolve(stdout);
      //     }
      //   });
      // });


      // version 2
      const translate = require('google-translate-api'); //require('@vitalets/google-translate-api');
      var queryText = data;
      var sourceLanguage = "en";
      var targetLanguage = "ko";

      // console.log("data text is ::: " + queryText);

      translate(queryText, {
        to: 'ko'
      }).then(res => {
        resolve(res.text);
      }).catch(err => {
        console.error(err);
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
          'text': data
        },
        headers: {
          'X-Naver-Client-Id': client_id,
          'X-Naver-Client-Secret': client_secret
        }
      };

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





// 사용안함
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




// 사용안함
function getRequestTranslatePapago(queryText, getRequestCallBack) {
  return new Promise(function (resolve, reject) {
    let client_id = transConfig.papagoHandler.client_id;
    let client_secret = transConfig.papagoHandler.client_secret;
    let papago_url = transConfig.papagoHandler.papago_url;

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


// function sleep(time) {
//   var stop = new Date().getTime();
//   while (new Date().getTime() < stop + time) {
//     ;
//   }
// }



let arrTransData = new Array();
async function actionTransText(getRowData) {

  console.log(transConfig.constHandler.getTrandTool() + "--trans start] ###############################################");

  for (var i in getRowData) {

    let findStTagNm = getRowData[i].substring();
    let stTag = getRowData[i].indexOf("<");
    let endTag = getRowData[i].indexOf(">")
    let tagName = getRowData[i].substr((stTag + 1), (endTag - 1));
    if (tagName.length > 0) {

      let findStTagNm = "<" + tagName + ">";
      let findEndTagNm = "</" + tagName + ">";

      if (findStTagNm.indexOf("<p>") >= 0 || findStTagNm.indexOf("h1") >= 0) { // || findStTagNm.indexOf("ul") >= 0
        // console.log("\r\n ---"+i+"--- ::: 번역 대상 텍스트 :::  START ##############");
        // console.log(getRowData[i]);
        // console.log("\r\n ::: 텍스트 HTML replace :::  START ##############");
        // console.log(getRowData[i].replace(/(<([^>]+)>)/ig, ""));



        let retTmpMap = new Map();
        retTmpMap = fn_errCheck(await getRequestTranslate(getRowData[i].replace(/(<([^>]+)>)/ig, ""), getRequestCallBack));
        // console.log("##############retTmpMap###################");
        // console.log("\r\n ---"+i+"--- ::: 번역 결과 텍스트 :::  ##############" );
        // console.log(retTmpMap +"\r\n\r\n");
        // console.log("##############retTmpMap###################");

        if (retTmpMap.get("status") != 'Y') {

          if (translateTool.length - 1 != transConfig.constHandler.toolCount) {
            transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount + 1], 'Y');
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return actionTransText(getRowData);
          } else {
            rowDataLimit = transConfig.constHandler.rowDataLimit + 1;
            return actionTransText(getRowData);
          }

        } else {
          if (findStTagNm.indexOf("<p>") >= 0) {
            arrTransData[i] = '<p>' + retTmpMap.get('data').trim() + '</p>';
          } else if (findStTagNm.indexOf("h1") >= 0) {
            arrTransData[i] = '<h1>' + retTmpMap.get('data').trim() + '</h1>';
          } else if (findStTagNm.indexOf("ul") >= 0) {
            arrTransData[i] = '<ul>' + retTmpMap.get('data').trim() + '</ul>';
          }
        }

      } else {
        // console.log("\r\n ---"+i+"---::: 번역 대상 텍스트 아님:::  ##############");
        arrTransData[i] = getRowData[i];
      }
    } else {
      let retTmpMap = new Map();
      retTmpMap = fn_errCheck(await getRequestTranslate(getRowData[i].replace(/(<([^>]+)>)/ig, ""), getRequestCallBack));
      // console.log("##############retTmpMap###################");
      // console.log("\r\n ---"+i+"--- ::: 번역 결과 텍스트 :::  ##############" );
      // console.log(retTmpMap +"\r\n\r\n");
      // console.log("##############retTmpMap###################");

      if (retTmpMap.get("status") != 'Y') {

        if (translateTool.length - 1 != transConfig.constHandler.toolCount) {
          transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount + 1], 'Y');
          rowDataLimit = transConfig.constHandler.rowDataLimit;
          return actionTransText(getRowData);
        } else {
          rowDataLimit = transConfig.constHandler.rowDataLimit + 1;
          return actionTransText(getRowData);
        }

      } else {
        arrTransData[0] = '<p>' + retTmpMap.get('data').trim() + '</p>';
      }
    }
  }

  console.log(transConfig.constHandler.getTrandTool() + "--trans END] #########################################################################################################################");
  let strTransData = '';
  for (var i in arrTransData) {
    // console.log(i + '-=--------' + arrTransData[i]);
    strTransData += arrTransData[i] + '\r\n';
  }
  transConfig.constHandler.isChkTrans = true;
  console.log(strTransData);

  console.log(transConfig.constHandler.isChkTrans);

  // insertTransData(rowsSeq, rowsQuestion_id, rowsIs_Accepted, rowsAnswer_id, rowsBody, rowDataLimit);
  insertTransData(strTransData);

}






// check Default Data 
console.log("##############################################");
console.log("\r\nTranslate Init Data Info]  ###################");


// Available Tools
let translateTool = new Array();

console.log(">> Total Translate Tools is : ");
// 사용가능한 번역툴 확인
let transArrayCnt = 0;
for (let ts = 0; ts < transConfig.transTool.length; ts++) {
  console.log(transConfig.transTool[ts]);
  if (transConfig.transTool[ts].status == 'Y') {
    translateTool[transArrayCnt] = transConfig.transTool[ts].name;
    transArrayCnt++;
  }
}

// if( translateTool.length > 1 ){
// 사용가능한 툴에서 첫번째를 디폴트로 지정
// transConfig.constHandler.setTransTool(translateTool[0], 'Y');
transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount], 'Y');
// }

console.log("\r\n>> Available Tools :::" + translateTool + ", length is :: " + translateTool.length);
console.log("\r\n>> Used Translator Tool Name is :: " + transConfig.constHandler.getTrandTool());
console.log("\r\n>> Trans Tool Used Count is :: " + transConfig.constHandler.toolCount);

let rowDataLimit = transConfig.constHandler.rowDataLimit;


const DbModelHandler = require('./dbHandler');
const dbHandler = new DbModelHandler();
// dbHandler.readAll('12578499');



const getRowsData = async (rowDataLimit) => {
  console.log("getRowsData=============+++" + rowDataLimit);
  let getOriginData = await dbHandler.read_question(rowDataLimit);
  console.log("Start Origin Data================+++++");
  console.log(getOriginData);

  let isAcitons = false;

  if (getOriginData !== null) {

    console.log(
      `#####get DB Row Data Info is #####\r\n seq Number  : ${getOriginData[0].seq} \r\n question id  : ${getOriginData[0].question_id}  \r\n tr_status_title : ${getOriginData[0].tr_status_title}  \r\n tr_status_body : ${getOriginData[0].tr_status_body} ################\r\n `
    );

    let dataConvertData = '';
    // 제목과본문  번역여부 판별
    // h, p, ul 테그는  번역기를 이용한다. 그외 태그는 통과
    if (getOriginData[0].tr_status_title == false) {
      console.log("getOriginData[0].tr_status_title=======+++" + getOriginData[0].tr_status_title);
      dataConvertData = dataConvert(getOriginData[0].title, dataRowCount);
      isActions = true;
    }else if (getOriginData[0].tr_status_body == false) {
      console.log("getOriginData[0].tr_status_body=======+++" + getOriginData[0].tr_status_body);
      dataConvertData = dataConvert(getOriginData[0].body, dataRowCount);
      isActions = true;
    }

    if (isActions) {
      // console.log(dataConvertData);
      transConfig.constHandler.rowDataInfo = getOriginData[0];
      actionTransText(dataConvertData);
    }



  } else {
    console.log("get row data exists");
  }

  //#######################################3

  // test & dev 
  // const data = fs.readFileSync('./sample.txt', {
  //   encoding: 'utf8',
  //   flag: 'r'
  // });

  // console.log("Settings Info End ##############################");

}

getRowsData(rowDataLimit);
