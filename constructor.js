// 전역에서 사용할 변수]
class ConstTranslate {
    constructor() {
        this.toolName = '';
        this.toolUsed = '';
        this.toolCount = 0;
        this.rowDataLimit = 1;
    }
    setTransTool( name, used){
        this.toolName = name;
        this.toolUsed = used;
    }
    getTrandTool(){
        return this.toolName;
    }
    getTrandToolUesd(){
        return this.toolUsed;
    }
}
const constHandler = new ConstTranslate();


// 번역 툴]
const transTool = [
    { name:"papago",status:"Y"},
    { name: "google", status:"Y"},
    { name:"libreoffice",status:"N"}
];


// 파파고 데이터]
class papagoOption  {
    constructor(){
        this.client_id = 'GaRr6G3O0E3ZIQBX74mr';
        this.client_secret = 'e31d4kLTkv';
        this.papago_url = "https://openapi.naver.com/v1/papago/n2mt";
    }
}
const papagoHandler = new papagoOption();

// db config]
const dbConfig = "postgres://ryan:1234@192.168.0.118:5432/ask_db";




module.exports.constHandler = constHandler;
module.exports.transTool = transTool;
module.exports.dbConfig = dbConfig;
module.exports.papagoHandler = papagoHandler;


