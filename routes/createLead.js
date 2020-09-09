var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
global.language = '';
router.post('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log('Executing BD Lead Code');
    console.log('data---');
    console.log(req.body);
    console.log('conn');
    let insertOPS = function insertBDLead(conn) {
        console.log('Inserting BD Lead now.!!!');
        return new Promise(function(resolve, reject) {
            // Single record creation
            let data = req.body;
            language = data['Language__c'];
            email = data['Email'];
            phone = data['Phone'];
            data['RecordTypeId'] = '01254000000K9ggAAC';
            //Check for email, and phone bd lead records, If already exists throw error message
            if (email && phone) {
                conn.query("SELECT Email FROM Lead where (Email ='" + email + "' OR Phone = '" + phone + "')", function(err, result) {
                    if (result.totalSize >= 1)
                        reject('You have already subscribed');
                    else
                        BDLeadRecordCreator(conn, data, reject, resolve);
                });

            } else if (email) {
                //Check for email bd lead records, If already exists throw error message
                conn.query("SELECT Email FROM Lead where Email ='" + email + "'", function(err, result) {
                    if (result.totalSize >= 1)
                        reject('You have already subscribed');
                    else
                        BDLeadRecordCreator(conn, data, reject, resolve);
                });
            } else if (phone) {
                //Check for phone bd lead records, If already exists throw error message
                conn.query("SELECT Phone FROM Lead where Phone ='" + phone + "'", function(err, result) {
                    if (result.totalSize >= 1)
                        reject('You have already subscribed');
                    else
                        BDLeadRecordCreator(conn, data, reject, resolve);
                });
            } else
                BDLeadRecordCreator(conn, data, reject, resolve);
        })
    }

    function BDLeadRecordCreator(conn, data, reject, resolve) {
        conn.sobject("Lead").create(data, function(err, ret) {
            if (err || !ret.success) {
                reject(err.name + ' : ' + err.fields);
            } else {
                console.log("Created record id : " + ret.id);
                console.log('language: ' + language);
                if (language == 'Chinese') {
                    resolve("非常感谢您对我们的临床试验有兴趣。我们的工作人员很快就会与您联系。");
                } else if (language == 'Japanese') {
                    resolve("ご登録ありがとうございました。後ほど担当者からご連絡いたします。");
                } else if (language == 'Spanish') {
                    resolve("Gracias por su interés en el voluntariado. Uno de los miembros de nuestro personal se comunicará con usted en breve.");
                } else {
                    resolve("Thank you for your interest in volunteering. One of our staff members will be reaching out to you shortly.");
                }
            }
        });
    }

    let sfdcConnFn = function callJSForce() {
        console.log('Calling JSFORCE now.!!!');
        console.log("process.env.url: " + process.env.url);
        console.log("process.env.username: " + process.env.username);
        console.log("process.env.password: " + process.env.password);
        return new Promise(function(resolve, reject) {
            var conn = new jsforce.Connection({
                // you can change loginUrl to connect to sandbox or prerelease env.
                loginUrl: process.env.url
            });
            conn.login(process.env.username, process.env.password, function(err, userInfo) {
                if (err) {
                    var resp = {
                        con: 'error',
                        status: '400'
                    };
                    reject(resp);
                    console.error(err);
                } else {
                    //console.log(conn.instanceUrl);
                    console.log("User ID: " + userInfo.id);
                    console.log("Org ID: " + userInfo.organizationId);
                    var resp = {
                        con: conn,
                        status: '200',
                    };
                    resolve(resp);
                } //sucess conn else
            }); //conn login fn.

        })
    }

    function main() {
        var con;
        //var db =dynamodb;
        let connectSFDC = sfdcConnFn();
        var totalTables = [];
        connectSFDC.then((result) => {
                console.log("#####connected to SFDC " + result.status);
                console.log('resul--------t');
                console.log(result);
                //console.log(result);
                return insertOPS(result.con);
            })
            .then((result) => {
                //console.log(result);
                console.log('####insertOps called: ');
                //res.status(200).end();
                res.send(JSON.stringify({ 'Status': result, 'Response': '200' }));
            })
            .catch((error) => {
                console.log(error);
                res.send(JSON.stringify({ 'Status': error, 'Response': '400' }));
                //res.status(404).end();
            });
    };
    //starting the Event loop execution.
    main();
});

module.exports = router;
