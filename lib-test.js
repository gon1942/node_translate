var stackexchange = require('./lib/stackexchange');

var options = { version: 2.2 };
//var options = { site: 'cooking.stackexchange', version: 2.2 };
//var options = { site: 'askubuntu', version: 2.2 };
var context = new stackexchange(options);

var filter = {
  key: ')LtCU01ZkKcOzeECl7TXvA((',
  pagesize: 10,
//  tagged: 'node.js',
 tagged: 'ubuntu',
  //tagged: 'java',
  sort: 'votes',
  order: 'desc'
};

/* url : https://api.stackexchange.com/docs/js-lib
 * filter : activity - last_activity_date
 * creation - creation_date
 * votes -score
 * hot -by the formula 
 * week
 * month 
 * activity is default sort
 */


// Get all the questions (http://api.stackexchange.com/docs/questions)
context.questions.questions(filter, function(err, results){
  if (err) throw err;
  
  console.log(results.items);
  console.log(results.has_more);
});

// Get results for a different website within the stackexchange network
//filter.site = 'softwareengineering';
filter.site = 'stackoverflow';

context.questions.questions(filter, function(err, results){
  if (err) throw err;
  
  console.log(results.items);
  console.log(results.has_more);
});

// Get all users
context.users.users(filter, function(err, results){
  if (err) throw err;

  console.log(results.items);
  console.log(results.has_more);
});
