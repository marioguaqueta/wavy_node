define(['postmonger'], (Postmonger) => {


    const connection = new Postmonger.Session();

    const steps = [
    { "label": "Message", "key": "message" },
    { "label": "Review", "key": "review" }
    ];

    const inArguments = [];


    //Global Variable
    let eventDefinitionKey = null;
    let payload = {};
    let step = steps[0].key;
    var schema = {};


    //Input Names

    let alertDE = '#alert-de';
    let setupMessage = '#setup-message';
    let messageText = '#message-text';
    let camposDE = '#campos-de';
    let alertMessage = "#alert-message";




    $(window).ready(onRender);


    connection.on('initActivity', initialize);


    connection.on('requestedTriggerEventDefinition', onRequestEventDefinition);


    connection.on('requestedSchema', onRequestSchema);


    connection.on('clickedNext', onClickedNext);


    connection.on('clickedBack', onClickedBack);


    connection.on('gotoStep', onGotoStep);






    //This function executes render the activity
    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestSchema');
        connection.trigger('requestTriggerEventDefinition');

        $(messageText).change(function(){
            console.log("change message");
            validateMessage();
        });


        onInputChange();

        
    }

    function onInputChange(){
        var validate = validateMessage();
        connection.trigger('updateButton', { button: 'next', enabled: validate });
    }

    
    function initialize(data) {
        if(data) {
            payload = data;
        }
        getMessageIfExists(data);
        showStep(null);
        validateMessage();
        console.log('initialize', data);
    }




    function onClickedNext() {
        console.log("onClickedNext");

        if(currentStep.key === 'review') {
            console.log('Saving');
            save();
        } else {
            if(validateMessage()){
                console.log('Valid Message');
                connection.trigger('nextStep');
            }else{
                console.log('invalid Message');
                setTimeout(function(){
                    $(alertMessage).hide();
                }, 3000);
            }
            
        }
    }


    function onClickedBack() {
        console.log("onClickedBack");
        connection.trigger('prevStep');
    }



    function onGotoStep(step) {

        currentStep = step;
        console.log('currentStep', currentStep.key);
        showStep(step);
        
       
    }







    function onRequestSchema(data) {
        console.log('schemaDefinition', data);
        schema = data['schema'];
        
        if(schema !== undefined && schema.length > 0){

            $(alertDE).css("display", "none");
            $(setupMessage).css("display", "block");
            
            fillPlaceholderList(schema);
        }else{
            $(setupMessage).css("display", "none");
            $(alertDE).css("display", "block");
            
        }
        


        

    }


    
    function onRequestEventDefinition(eventDefinition) {
        console.log('eventDefinition', eventDefinition);
        eventDefinitionKey = eventDefinition.eventDefinitionKey;
        console.log('eventDefinitionKey', eventDefinitionKey);
        
    }

    function getMessage(){
        return $(messageText).val();
    }

    function save() {
        
        configureInArguments();


        console.log(JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }


    function configureInArguments() {
        var inArguments = [];
        if (schema !== undefined && schema.length > 0) {
            for (var i in schema) {
                var field = schema[i];
                if (isEventDataSourceField(field)) {
                    var fieldName = extractFieldName(field);
                    var prefixedFieldName = 'com.globant.event.data.' + fieldName;
                    saveFieldToInArguments(field, prefixedFieldName, inArguments);
                }
            }
        }


        inArguments.push({ "message": getMessage() });
        
        payload['arguments'].execute.inArguments = inArguments;
    }


    function validateMessage(){
        var messageArea = $(messageText);
        if ($.trim(messageArea.val()) == '') {
            console.log("Message Null");
            messageArea.focus();
            $(alertMessage).css("display", "block");
            connection.trigger('updateButton', { button: 'next', enabled: false });
            return false;
        }else{
            console.log("Message Filled");
            connection.trigger('updateButton', { button: 'next', enabled: true });
            return true;
        }
    }



    function fillPlaceholderList(schema) {
        $(camposDE).html('');
        console.log("Filled DE");
        if (schema !== undefined && schema.length > 0) {
            $(alertDE).hide();
            console.log("With Fields");
            for (var i in schema) {
                var field = schema[i];
                var fieldName = extractFieldName(field);
                if (isEventDataSourceField(field)) {
                    $(camposDE).append('<li class="list-group-item">%%' + fieldName + '%%</li>');
                }
            }
        }else{
            $(alertDE).show();
        }
    }

     function extractFieldName(field) {
        var index = field.key.lastIndexOf('.');
        return field.key.substring(index + 1);
    }

    function isEventDataSourceField(field) {
        return !field.key.startsWith('Interaction.');
    }

    function saveFieldToInArguments(field, fieldName, inArguments) {
        var obj = {};
        obj[fieldName] = "{{" + field.key + "}}";
        inArguments.push(obj);
    }


     function showStep(step) {
        $('.step').hide();


        if (step == null) {
            $('#message').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'Next',
                    enabled: validateMessage() 
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
        }

        

        switch(currentStep.key) {
            case 'message':
                $('#message').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'Next',
                    enabled: validateMessage() 
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'review':
                $('#review').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'Done',
                    visible: true
                });
                break;
        }
    }

    function getMessageIfExists(data){
        console.log(data.arguments.execute.inArguments);
    }

});