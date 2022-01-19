module.exports = (function () {
  return {
    local: { // localhost
	host     : '192.168.0.118',
	user     : 'ryan',
	password : '1234',
	port     : 5432,
	database : 'ask_db'
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

