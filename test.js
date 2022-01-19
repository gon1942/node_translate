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


var tmpArray = new Array(); // 테그 기준으로 문자열을 배열에 저장
let dataRowCount = 0;
let tmpTransData = new Array();


const getRowsData222 = async function (rowDataLimit) {

  const data = fs.readFileSync('./sample.txt', {
    encoding: 'utf8',
    flag: 'r'
  });


  console.log("\r\nStart - Trans ] ##############################################");

  // translateAction(data, rowDataLimit);

  // h, p, ul 테그는  번역기를 이용한다. 그외 태그는 통과
  let aabt = await test(data, dataRowCount);
  console.log("---@@@@@@@@@@@@@@@@@@@@@@@@22---@@@--------" + aabt.length);
  for (var i in aabt) {
    console.log(i + "==========>" + aabt[i]);
    console.log("\r\n");
  }

  console.log("------#################################--###------");

}


function test(data, dataRowCount) {
  // console.log("#################3");

  let stTag = data.indexOf("<");
  let endTag = data.indexOf(">")


  let tagName = data.substr((stTag + 1), (endTag - 1));
  // console.log(dataRowCount + "] ---tagName=========++" + tagName);
  // console.log("\r\n\r\n");


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

    console.log("::: chk tag Info ::: stat name & index>>------------------------tagStName===" + findStTagNm + '===' + tagStNameNumber);
    console.log("::: chk tag Info ::: end name * index >>------------------------tagEndName===" + findEndTagNm + '===' + tagEndNameNumber);

    let tagBody = data.substr(tagStNameNumber, tagEndNameNumber) + findEndTagNm;
    let tmpData = data.substring(tagEndNameNumber + findEndTagNm.length).trim();

    tmpArray[dataRowCount] = tagBody;

    dataRowCount = dataRowCount + 1;
    // console.log("################ ] tagBody---------------------------------------------------------------------");
    // console.log(tagBody);
    // console.log("################] tmpData-------------------------------------------------------------------");
    // console.log("tmpData====================>>>>>\r\n" + tmpData);
    // console.log(dataRowCount - 1 + "]  END----- [" + tagName + "]--------\r\n\r\n\r\n");
    test(tmpData, dataRowCount);

  }


  return tmpArray;
}


//const translateAction = async( rowsData ) => {
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
let retTransDatamap = new Map();

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
          'text': data
        },
        headers: {
          'X-Naver-Client-Id': client_id,
          'X-Naver-Client-Secret': client_secret
        }
      };

      console.log("papago data is 0000 ::: " + data);
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




console.log("\r\n>> Available Tools :::" + translateTool + ", length is :: " + translateTool.length);
console.log("\r\n>> Used Translator Tool Name is :: " + transConfig.constHandler.getTrandTool());
console.log("\r\n>> Trans Tool Used Count is :: " + transConfig.constHandler.toolCount);

let rowDataLimit = transConfig.constHandler.rowDataLimit;
// getRowsData(rowDataLimit);



const DbModelHandler = require('./dbHandler');
const dbHandler = new DbModelHandler();
// dbHandler.readAll('12578499');

const getRowsData = async (rowDataLimit) => {
  // console.log("getRowsData=============+++" + rowDataLimit);
  // let a = await dbHandler.read(rowDataLimit);
  // console.log("Start Base Data================+++++");
  // console.log(a);
  // console.log("End Base Data================+++++");


  // if (a !== null) {
  //   translateAction(a[0].body, rowDataLimit);
  // } else {
  //   console.log("get row data exists");
  // }

//#######################################3

// test & dev 

  const data = fs.readFileSync('./sample.txt', {
    encoding: 'utf8',
    flag: 'r'
  });



  // translateAction(data, rowDataLimit);

  // h, p, ul 테그는  번역기를 이용한다. 그외 태그는 통과
  let getRowData = test(data, dataRowCount);
  console.log("---@@@@@@@@@@@@@@@@@@@@@@@@22---@@@--------" + getRowData.length);
  // for (var i in getRowData) {
  //   console.log(i + "==========>" + getRowData[i]);
  //   console.log("\r\n");
  // }


  testTrains(getRowData);
}

getRowsData(rowDataLimit);
// getRowsData222(rowDataLimit);

let arrTransData = new Array();
async function testTrains(getRowData){

  console.log(transConfig.constHandler.getTrandTool() + "--trans start] #########################################################################################################################");


  for (var i in getRowData) {
    console.log(i + "==========>" + getRowData[i]);
    console.log("\r\n");
    let findStTagNm = getRowData[i].substring();

    //

    let stTag = getRowData[i].indexOf("<");
    let endTag = getRowData[i].indexOf(">")
    // console.log(stTag + "==" + (endTag - 1));


    let tagName = getRowData[i].substr((stTag + 1), (endTag - 1));
    console.log(i + "] ---tagName=========++" + tagName);
    console.log("\r\n\r\n");

    if (tagName.length > 0) {

      let findStTagNm = "<" + tagName + ">";
      let findEndTagNm = "</" + tagName + ">";

      if (findStTagNm.indexOf("<p>") >= 0 || findStTagNm.indexOf("h1") >= 0 || findStTagNm.indexOf("ul") >= 0) {
        console.log("\r\n ::: 번역 대상 텍스트 :::  START ##############");
        console.log(getRowData[i]);
        console.log("\r\n ::: 텍스트 HTML replace :::  START ##############");
        console.log(getRowData[i].replace(/(<([^>]+)>)/ig, ""));



        let retTmpMap = new Map();
        retTmpMap = fn_errCheck(await getRequestTranslate(getRowData[i].replace(/(<([^>]+)>)/ig, ""), getRequestCallBack));
        console.log("##############retTmpMap###################");
        console.log(retTmpMap);
        console.log("##############retTmpMap###################");
        
        if (retTmpMap.get("status") != 'Y') {

          if (translateTool.length - 1 != transConfig.constHandler.toolCount) {
            transConfig.constHandler.setTransTool(translateTool[transConfig.constHandler.toolCount + 1], 'Y');
            rowDataLimit = transConfig.constHandler.rowDataLimit;
            return testTrains(getRowData);
          } else {
            rowDataLimit = transConfig.constHandler.rowDataLimit + 1;
            return testTrains(getRowData);
          }

        } else {
          if(findStTagNm.indexOf("<p>") >= 0){
            arrTransData[i] = '<p>' + retTmpMap.get('data').trim() +'</p>';
          }else if( findStTagNm.indexOf("h1") >= 0 ){
            arrTransData[i] = '<h1>' + retTmpMap.get('data').trim() +'</h1>';
          }else if( findStTagNm.indexOf("ul") >= 0 ){
            arrTransData[i] = '<ul>' + retTmpMap.get('data').trim() +'</ul>';
          }
        }

      }else{
        arrTransData[i] = getRowData[i];
      }
    }
  }

  console.log(transConfig.constHandler.getTrandTool() + "--trans END] #########################################################################################################################");


  for( var i in arrTransData){
    console.log(i+'-=--------' + arrTransData[i]);
  }
}

/*
선택한 테그 삭제 ==============================================
oriText = '<div>Remove Span</div> <span>tag only</span>';
newText = oriText.replace(/<(\/span|span)([^>]*)>/gi,"");
============================================================*/

/*

  var htmlRegex = new RegExp("<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)</\1>");
  console.log(rowsData);
  console.log("##################");
  console.log("htmlRegex===" + htmlRegex.test(rowsData));

  console.log(/<\/?[a-z][\s\S]*>/i.test(rowsData)); // html tag check , return ture,false


  // const aa = /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i.test(rowsData) ;
  const aaRegexp = /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|p|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i;


  const aa = /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/ig.test(rowsData);
  var regexp = /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/ig;
  var matches_array = rowsData.match(regexp);



  // console.log( rowsData.match(/<\/?[a-z][\s\S]*>/i)); 

  console.log(rowsData.indexOf("<") + "==" + rowsData.indexOf(">"));
  console.log(rowsData.substr(0, (11 + 1)));


  // let ta = rowsData.substr(0, 30);
  // var ar = ta.match(aaRegexp);
  // console.log(ta);
  // console.log(ar);
  // console.log( /<(?=.*? .*?\/ ?>|pre|hr|blockquot|p)[a-z]+.*?>|<([a-z]+).*?<\/\1>/ig.test(ta) );

  // let newHtml = rowsData.replace(/[\n\t ]+/g, " ");

  //     //RegEX to check HTML
  //     let checkHtml = /<([A-Za-z][A-Za-z0-9]*)\b[^>]*>(.*?)<\/\1>/.test(rowsData);

  //     //Check it is html or not
  //     if (checkHtml){
  //         console.log('This is an HTML');
  //         console.log(newHtml.trim());
  //     }
  //     else{
  //         console.log('This is a TEXT');
  //         console.log(elem.innerText.trim());
  //     }


  return;


*/