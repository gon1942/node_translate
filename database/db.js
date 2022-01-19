const pg = require('pg');

const config = require("./config").local;
const logger = require('../logger');

const pool = pg.createPool(config);
logger.info('Connection pool created.');

pool.on('acquire', function (connection) {
  logger.info(`Connection ${connection.threadId} acquired`);
});

pool.on('enqueue', function () {
  logger.info('Waiting for available connection slot');
});

pool.on('release', function (connection) {
  logger.info(`Connection ${connection.threadId} released`);
});

const getConn = function(callback) {
  pool.getConnection(function(err, connection) {
    callback(err, connection);
  });
}

module.exports = getConn;


//var pg = require('pg')
//var PGUSER = 'deploy'
//var PGDATABASE = 'oscpushserver'
//var config = {
//  user: PGUSER, // name of the user account
//  database: PGDATABASE, // name of the database
//  max: 10, // max number of clients in the pool
//  idleTimeoutMillis: 30000
//}
//
//var pool = new pg.Pool(config);
//
//module.exports = pool;
