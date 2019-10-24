const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, '../public')));

app.post('/save',function (req, res){
    console.log('ON SAVE');
	console.log(req.body["name"]);
    res.status(200);
    res.send({
        route: 'save'
    });
});

app.post('/publish',function (req, res){
    console.log('ON PUBLISH');
	console.log(req.headers);
    res.status(200);
    res.send({
        route: 'publish'
    });
});



app.post('/validate',function (req, res){
    console.log('ON VALIDATE');
	console.log(req.headers);
    res.status(200);
    res.send({
        route: 'validate'
    });
});



app.post('/execute',function (req, res){
    console.log('ON EXECUTE');
	console.log(req.body);



    //TODO Request to Wavy

    res.status(200);
    res.send({
        route: 'execute'
    });
});


app.post('/',function (req, res){
    res.status(200);
    res.sendFile('../public/index.html');
});




app.listen(PORT, function (){
	console.log("Esperando requests en el puerto " + PORT);
});
