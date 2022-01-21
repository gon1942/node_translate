module.exports = (function () {
  return {
    local: { // localhost
	host     : '192.168.0.18',
	// host     : '192.168.0.118',
	user     : 'de',
	password : 'exitem0*',
	port     : 5432,
	database : 'decommunity'
    },
    //real: { // real server db info
    //    host     : '192.168.0.2'
    //    user     : 'hamonitr',
    //    password : 'gkahslzk!$(',
    //    port     : 3306,
    //    database : 'jaycedb'
    //},
    dev: { // dev server db info
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    }
  }
})();

