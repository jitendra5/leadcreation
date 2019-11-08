var express = require('express');
var app = express();
var http           = require( 'http' );
var jsforce        = require('jsforce');
var bodyParser = require('body-parser');
var log4js = require('log4js');
let tStamp =Date.now();
log4js.configure({ // configure to use all types in different files.
appenders: {
    cheeseLogs: { type: 'file', base: 'logs/', filename: 'logs/debugLogs-'+tStamp+'.log' },
    console: { type: 'console' },
    },
    categories: {
    another: { appenders: ['console'], level: 'debug' },
    default: { appenders: [ 'console','cheeseLogs'], level: 'debug' }
}
});
const log4js_extend = require("log4js-extend");

log4js_extend(log4js, {
path: __dirname,
format: "at @name (@file:@line:@column)"
});

var logger = log4js.getLogger('debug');
let conn;
app.set( 'port', process.env.PORT || 3000 );
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(bodyParser.json({ type: 'application/json' }));

//test get end point
app.get('/', function (req, res) {
    logger.debug('data--- test end point');
    logger.debug(req.baseUrl);
res.send('Hello World!');
});

//post end point
app.post('/api1.0/cloudbyz/createlead',urlencodedParser, function (req, res) {
    logger.debug('data---');
    logger.debug(req.body);
    logger.debug('conn');
    logger.debug(conn);
    let insertOPS = function insertLead(conn){
        logger.debug('Inserting Lead now.!!!');
        return new Promise(function(resolve, reject) {
            // Single record creation
            conn.sobject("Account").create(req.body, function(err, ret) {
            if (err || !ret.success) 
            { 
                return console.error(err, ret); 
            }
            else{
                console.log("Created record id : " + ret.id);
            }
            });
        })
    }
    let sfdcConnFn =function callJSForce(tables){
        logger.debug('Calling JSFORCE now.!!!');
        return new Promise(function(resolve, reject) {
            var conn = new jsforce.Connection({
                // you can change loginUrl to connect to sandbox or prerelease env.
                loginUrl : 'https://test.salesforce.com'
                });
                conn.login('hariharan@cloudbyz.com.wcct.ctmsdev', 'wcct@2019ZCWqz8UMHZ47EDkisVpMQW2bu', function(err, userInfo) {
                if (err) { 
                    var resp={
                        con :'error',
                        status:'400'
                    };
                    reject(resp);
                    console.error(err); 
                }
                else{
                    //logger.debug(conn.instanceUrl);
                    logger.debug("User ID: " + userInfo.id);
                    logger.debug("Org ID: " + userInfo.organizationId);
                    var resp={
                        con :conn,
                        status:'200',
                    };
                    resolve(resp);
                }//sucess conn else
                });//conn login fn.
        
        })
    }
    function main() {
        var con;
        //var db =dynamodb;
        let connectSFDC = sfdcConnFn();
        var totalTables=[];
        connectSFDC.then((result)=>{
            logger.debug("#####connected to SFDC "+result.status);
            logger.debug('resul--------t');
            logger.debug(result);
            //logger.debug(result);
            return insertOPS(result.con);
        })
        .then((result)=>{
            //logger.debug(result);
            logger.debug('####insertOps called: ');
            res.send(JSON.stringify({'Status': 'Lead created successfully!!','Response':'200'}));
        })
        .catch((error)=>{
            logger.debug(error);
            res.status(404).end();
        });
    };
    //starting the Event loop execution.
    main();
    });


app.listen(3000, function () {
console.log('Example app listening on port 3000!');
});