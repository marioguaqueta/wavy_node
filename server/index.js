const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rp = require('request-promise');
var jwt = require('jwt-simple');



var secret = 'kQvK3KXSUAa4Fn7pO3-03b6uD1Ic0DrFsqMWcIHz1wwZQEYhFLcPwmBnYvxZCe-QOOf0BpaxwBQHWulEpUtTCxN9y0fvYOCCJMjEs_IZvprlfi4QohspvhMTY4F5KkaEMA6xLxo40OApZujD9njNEW2GaWHgFCroMteLAGCCIaofXTsAG3SeEpOzcxipOEgY5VA0ALncSzOIcyM9A1Cag-bIAOq95O9Q-f8CTfrnuKdbjfNQxQShU6K0df6_gA2';






const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


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
	//console.log(req.get('host'));
    //console.log(req.headers);
    console.log("REQ BODY: " + req.body);

    var decoded = jwt.decode(req.body, secret);
    console.log("DECODED REQ BODY: " + decoded);


    /*

    var inArguments = req.body.inArguments;
    var message = '';
    var phone = '';

    var datetime = new Date();
    console.log("INIT TIME: " + datetime);

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
    console.log(decodedMessage);


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


    console.log(options);
 
    
    rp(options).then(function (response) {
        console.log("Success " + response);
    })
    .catch(function (err) {
        console.log("Failed " + err);
    });
    

    //ToDo Send To wavy



    datetime = new Date();
    console.log("FINISH TIME: " + datetime);


    res.status(200);
    res.send({
        route: 'execute'
    });


    */

});



app.post('/',function (req, res){
    res.status(200);
    res.sendFile('../public/index.html');
});




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

app.listen(PORT, function (){
	console.log("Esperando requests en el puerto " + PORT);
});
