const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


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
	//console.log(req.headers);
    //console.log(req.body);

    var inArguments = req.body['arguments'].execute.inArguments;
    var message = '';

    var datetime = new Date();
    console.log("INIT TIME: " + datetime);

    var regex = {};



    inArguments.forEach(function(obj) { 

        if (obj.message != undefined) {
            message = obj.message;
        }else{
            regex['%%' + extractFieldName(Object.keys(obj)) + '%%'] =  Object.values(obj);            
        }
    });


    var decodedMessage = GFG_Fun(regex, message);
    console.log(decodedMessage);


    datetime = new Date();
    console.log("FINISH TIME: " + datetime);


    res.status(200);
    res.send({
        route: 'execute'
    });
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
