var express = require('express');
var router = express.Router();
var jsforce = require('jsforce');

router.post('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log('data---');
  console.log(req.body);
  console.log('conn');
  let insertOPS = function insertLead(conn){
      console.log('Inserting Lead now.!!!');
      return new Promise(function(resolve, reject) {
          // Single record creation
          let data =req.body;
          data['RecordTypeId'] ='012540000018F47AAE';
          if(Object.keys(data).includes('LastName')){
            data['LastName'] =data['LastName'];
          }
          else{
            data['LastName'] ='Volunteer Lead';
          }
          if(Object.keys(data).includes('Company')){
            data['Company'] =data['Company'];
          }
          else{
            data['Company'] ='Volunteer Lead';
          }
          conn.sobject("Lead").create(data, function(err, ret) {
          if (err || !ret.success) 
          { 
              //return console.error(err, ret); 
              //resolve(err.name +' : '+err.fields);
              reject(err.name +' : '+err.fields);
          }
          else{
              console.log("Created record id : " + ret.id);
              resolve("Thank you for your interest in volunteering. One of our staff members will be reaching out to you shortly.");
          }
          });
      })
  }
  let sfdcConnFn =function callJSForce(tables){
      console.log('Calling JSFORCE now.!!!');
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
                  //console.log(conn.instanceUrl);
                  console.log("User ID: " + userInfo.id);
                  console.log("Org ID: " + userInfo.organizationId);
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
          console.log("#####connected to SFDC "+result.status);
          console.log('resul--------t');
          console.log(result);
          //console.log(result);
          return insertOPS(result.con);
      })
      .then((result)=>{
          //console.log(result);
          console.log('####insertOps called: ');
          //res.status(200).end();
          res.send(JSON.stringify({'Status': result,'Response':'200'}));
      })
      .catch((error)=>{
          console.log(error);
          res.send(JSON.stringify({'Status': error,'Response':'400'}));
          //res.status(404).end();
      });
  };
  //starting the Event loop execution.
  main();
});

module.exports = router;
