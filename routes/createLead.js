var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');
global.language = '';
router.get('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    console.log('data---');
    console.log(req.body);
    console.log('conn');
    let insertOPS = function insertLead(conn) {
        console.log('Inserting BD Lead now.!!!');
        return new Promise(function(resolve, reject) {
            // Single record creation
            let data = req.body;
            language = data['Language__c'];
            email = data['Email__c'];
            clinicalstudy = data['Clinical_Study__c'];
            phone = data['Phone__c'];
            //Check for email, phone, and clinical study volunteer lead records, If already exists throw error message
            if (email && phone && clinicalstudy) {
                conn.query("SELECT Email__c FROM Volunteer_Lead__c where Clinical_Study__c ='" + clinicalstudy + "' AND (Email__c ='" + email + "' OR Phone__c = '" + phone + "')", function(err, result) {
                    if (result.totalSize >= 1)
                        reject('You have already subscribed');
                    else
                        volunteerLeadRecordCreator(conn, data, reject, resolve);
                });

            } else if (email && phone) {
                //Check for email and phone volunteer lead records with clinical study as null, If already exists throw error message
                conn.query("SELECT Email__c FROM Volunteer_Lead__c where Clinical_Study__c ='' AND (Email__c ='" + email + "' OR Phone__c = '" + phone + "')", function(err, result) {
                    if (result.totalSize >= 1)
                        reject('You have already subscribed');
                    else
                        volunteerLeadRecordCreator(conn, data, reject, resolve);
                });
            } else if (email && clinicalstudy) {
                conn.query("SELECT Email__c FROM Volunteer_Lead__c where Clinical_Study__c ='" + clinicalstudy + "' AND Email__c ='" + email + "'", function(err, result) {
                    if (result.totalSize >= 1)
                        reject('You have already subscribed');
                    else
                        volunteerLeadRecordCreator(conn, data, reject, resolve);
                });
            } else
                volunteerLeadRecordCreator(conn, data, reject, resolve);
        })
    }

    function volunteerLeadRecordCreator(conn, data, reject, resolve) {
        conn.sobject("Volunteer_Lead__c").create(data, function(err, ret) {
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
        
                res.send('success');
            
    };
    //starting the Event loop execution.
    main();
});

module.exports = router;
