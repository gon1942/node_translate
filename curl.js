const { Curl } = require('node-libcurl');
 
const curl = new Curl();
 
curl.setOpt('URL', 'https://api.stackexchange.com/2.2/questions?page=2&pagesize=1&order=desc&sort=votes&tagged=ubuntu&site=stackoverflow&filter=!-n6h_tKlFVeecyArvkbFShIHm7ljZ7o5voxGEDUzKIn3xx0fx--RBH');
curl.setOpt('FOLLOWLOCATION', true);
curl.setOpt(Curl.option.POST, false)
 
curl.on('end', function (statusCode, data, headers) {
  console.info(statusCode);
  console.info('---');
  console.info(data.length);
  console.info('---');
  console.info(this.getInfo( 'TOTAL_TIME'));
  console.info("----");
 console.info(data);
  
  this.close();
});
 
curl.on('error', curl.close.bind(curl));
curl.perform();

// var url = 'https://api.stackexchange.com/2.2/questions?page=2&pagesize=1&order=desc&sort=votes&tagged=ubuntu&site=stackoverflow&filter=!-n6h_tKlFVeecyArvkbFShIHm7ljZ7o5voxGEDUzKIn3xx0fx--RBH'
// var request = require('request');
// request(url, function (error, response, body) {
//  if (!error && response.statusCode == 200) {
//    console.log(body) // Show the HTML for the Google homepage.
//  }
//  else {
//    console.log("Error "+response.statusCode)
//  }
// })



// var request = require('request');
// request(url, function (error, response, body) {
//   if (!error && response.statusCode == 200) {
//     console.log(body);
//     // var jsonArr = JSON.parse(body);
//     // console.log(jsonArr);
//     // console.log("group id:" + jsonArr[0].id);
//   }
// })


