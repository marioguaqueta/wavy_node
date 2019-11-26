  
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rp = require('request-promise');
var http = require('http');
var uuid = require('uuid');
var router = express.Router();
const JWT = require(path.join(__dirname, 'lib', 'jwt.js'));

const Pkg = require(path.join(__dirname, '../', 'package.json'));



const app = express();


app.set('port', process.env.PORT || 3000);


process.env.token = '';
process.env.endToken = '';

// Register middleware that parses the request payload.
app.use(bodyParser.raw({
    type: 'application/jwt'
}));


app.use(express.static(path.join(__dirname, '../public')));

app.post('/save',function (req, res){
    console.log('ON SAVE');
    console.log(req.headers);
    console.log(req.body);

    res.status(200);
    res.send({
        route: 'save'
    });
});

app.post('/publish',function (req, res){
    console.log('ON PUBLISH');
    console.log(req.headers);
    console.log(req.body);
    res.status(200);
    res.send({
        route: 'publish'
    });
});



app.post('/validate',function (req, res){
    console.log('ON VALIDATE');
    console.log(req.headers);
    console.log(req.body);
    res.status(200);
    res.send({
        route: 'validate'
    });
});



app.post('/execute',function (req, res){



    console.log('------------------------------ON EXECUTE----------------------');


    JWT(req.body, Pkg.options.salesforce.marketingCloud.jwtSecret, (err, decoded) => {


        console.log(req.body);
        console.log(decoded);
        if (err) {
            console.log("ERR: " + err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

            sendWavyMessage(decoded.inArguments);
            res.status(200);
            res.send({
                route: 'execute'
            });
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }



    });


});



function sendWavyMessage(decoded){
    var inArguments = decoded;
    var message = '';
    var phone = '';

    var regex = {};



    inArguments.forEach(function(obj) { 



        if (obj.message != undefined) {
            message = obj.message;
        }else if(obj.phone != undefined){
            phone = obj.phone;
        }else{
            regex['%%' + extractFieldName(Object.keys(obj)) + '%%'] =  Object.values(obj);            
        }
    });


    var decodedMessage = GFG_Fun(regex, message);
    decodedMessage = decodedMessage.replace(/(\r\n|\n|\r)/gm," ");


    var options = {
        method: 'POST',
        uri: 'https://whatsapp-sulamerica-dev.mybluemix.net/api/v1/ativo',
        headers: {
            'content-type': 'application/json',
            'Authorization': 'apikey 71135a72-42e2-4d15-9569-da3e2263a0f3'
        },
        body: 
        {
            'id_ativo'   : "5dba157f7eef08d6ea1bfc2a",
            'destino'    : phone,
            'idCase'     : "5000Z00001F34exQBB",
            'ttl'        : 1,
            'context'    :{}, 
            'parametros' :["SulAmérica", decodedMessage]
        },
        json: true
    };



    
    rp(options).then(function (response) {

        saveWhatappSendLog(phone, "success", decodedMessage);
        console.log("Success Wavy");
    })
    .catch(function (err) {
        saveWhatappSendLog(phone, "fail", decodedMessage);
        console.log("Failed Wavy");
    });
    



}





function extractFieldName(field) {
    var stringField = field.toString();
    var index = stringField.lastIndexOf('.');
    return field.toString().substring(index + 1);
}

function GFG_Fun(Obj, str) { 
    var regex = Obj;
    var RE = new RegExp(Object.keys(regex).join("|"), "gi"); 
    var newMessage = str.replace(RE, function(matched) { 
        return regex[matched]; 
    });

    return newMessage;
}



function saveWhatappSendLog(phone, status, message){


   var optionsToken = {
    method: 'POST',
    uri: Pkg.options.salesforce.marketingCloud.authEndpoint + 'v2/token',
    headers: {
        'content-type': 'application/json'
    },
    body: 
    {
        'grant_type'   : "client_credentials",
        'client_id'    : Pkg.options.salesforce.marketingCloud.clientId,
        'client_secret'     : Pkg.options.salesforce.marketingCloud.clientSecret
    },
    json: true
};




rp(optionsToken).then(function (response) {
    process.env.token = response.access_token;
    var optionsInsertDE = {
        method: 'POST',
        uri: Pkg.options.salesforce.marketingCloud.restEndpoint + 'hub/v1/dataevents/key:4CEA9EC6-1EB8-4C73-8EC2-B2F7FF025F73/rowset',
        headers: {
            'content-type': 'application/json',
            'Authorization' : 'Bearer ' + response.access_token
        },
        body: 
        [
        {
            "keys":{
                "IdCase" : uuid.v1()
                
            },
            "values":{
                "Mensagens": message,
                "Status": status,
                "Phone": phone,
                "DateCreated": new Date()
            }
        }
        ],
        json: true
    };


    rp(optionsInsertDE).then(function (responseInsert) {
        console.log("Sucess insert");

    })
    .catch(function (errInsert) {
        console.log("Fail Insert");
    });


})
.catch(function (err) {
    console.log("Error token");
});



}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

