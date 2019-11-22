  
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rp = require('request-promise');
var http = require('http');
var router = express.Router();
const JWT = require(path.join(__dirname, 'lib', 'jwt.js'));


const Pkg = require(path.join(__dirname, '../', 'package.json'));



const app = express();


app.set('port', process.env.PORT || 3000);

app.use(router);

//app.use(bodyParser.json());


// Register middleware that parses the request payload.
app.use(bodyParser.raw({
    type: 'application/jwt'
}));



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
    console.log("REQ BODY: " + JSON.stringify(req.body));


    //JWT(req.body, process.env.jwtSecret, (err, decoded) => {
    JWT(req.body, Pkg.options.salesforce.marketingCloud.jwtSecret, (err, decoded) => {

        console.log("ERR: " + err);
        console.log("DECODED: " + JSON.stringify(decoded));

        if (err) {
            console.error(err);
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
 
    /*
    rp(options).then(function (response) {
        console.log("Success " + response);
    })
    .catch(function (err) {
        console.log("Failed " + err);
    });
    */


    datetime = new Date();
    console.log("FINISH TIME: " + datetime);

}



app.use(express.static(path.join(__dirname, '../public')));


app.get('/', function (req, res){
    console.log('*************INDEX***************');
    console.log(req.body);
    res.status(200);
    res.sendFile(path.join(__dirname, '../public/appjs.html'));
});

app.post('/login', function(req,res){
    console.log( '_Login_');
    console.log( 'req.body: ', req.body );
    res.redirect( '/' );

});

app.post('/logout', function(req,res){
    console.log('Logout');
    req.session.token = '';
} );


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


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

