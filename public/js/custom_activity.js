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

    let setupMessage = '#setup-message';
    let messageText = 'textarea#message-text';
    let camposDEodd = '#campos-de-odd';
    let camposDEeven = '#campos-de-even';
    let phoneSelector = '#glo-phone-parameter';
    var phoneSelectorValue = undefined;

    var authTokens = {};


    $(window).ready(onRender);


    connection.on('initActivity', initialize);


    connection.on('requestedTriggerEventDefinition', onRequestEventDefinition);


    connection.on('requestedSchema', onRequestSchema);


    connection.on('clickedNext', onClickedNext);


    connection.on('clickedBack', onClickedBack);


    connection.on('gotoStep', onGotoStep);

    
    connection.on('requestedTokens', onGetTokens);

    
    connection.on('requestedEndpoints', onGetEndpoints);


    function onGetTokens(tokens){
        console.log(tokens);
        authTokens = tokens;


        

    }

    function onGetEndpoints(endpoints){
        console.log(endpoints);
    }



    //This function executes render the activity
    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestSchema');
        connection.trigger('requestTriggerEventDefinition');


        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');



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

            $(setupMessage).css("display", "block");
            
            fillPlaceholderList(schema);
            fillPhoneCombobox(schema);
        }else{
            $(setupMessage).css("display", "none");

            
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

    function getPhone() {
        return $(phoneSelector).val();
    } 

    function save() {

        configureInArguments();


        console.log("ON SAVE: " + JSON.stringify(payload));
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
        inArguments.push({ "phone": getPhone() });
        inArguments.push({ "tokens": authTokens });


        payload['metaData'].isConfigured = true;
        
        
        payload['arguments'].execute.inArguments = inArguments;
    }


    function validateMessage(){
        var messageArea = $(messageText);
        if ($.trim(messageArea.val()) == '') {
            console.log("Message Null");
            messageArea.focus();
            connection.trigger('updateButton', { button: 'next', enabled: false });
            return false;
        }else{
            console.log("Message Filled");
            connection.trigger('updateButton', { button: 'next', enabled: true });
            return true;
        }
    }



    function fillPlaceholderList(schema) {
        $(camposDEodd).html('');
        $(camposDEeven).html('');
        //console.log("Filled DE");
        if (schema !== undefined && schema.length > 0) {
            //console.log("With Fields");
            for (var i in schema) {
                //console.log("Index Schema: " + i);
                var field = schema[i];
                var fieldName = extractFieldName(field);
                if (isEventDataSourceField(field)) {
                    if ((i % 2) == 0){
                        $(camposDEodd).append('<li class="list-group-item">%%' + fieldName + '%%</li>');
                    }else{
                        $(camposDEeven).append('<li class="list-group-item">%%' + fieldName + '%%</li>');
                    }
                    
                }
            }
        }
    }


    function fillPhoneCombobox(schema) {
        console.log('Fill Phone');
        if (schema !== undefined && schema.length > 0) {
            for (var i in schema) {
                var field = schema[i];
                var fieldName = extractFieldName(field);
                var fieldValue = "{{" + field.key + "}}";
                var fieldType = field.type;
                if(fieldType == "Phone"){                    
                    if (isEventDataSourceField(field)) {
                        var selected = fieldValue === phoneSelectorValue;
                        $(phoneSelector).append(new Option(fieldName, fieldValue, false, selected));
                    }
                }
            }
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
       data.arguments.execute.inArguments.forEach(function(obj) { 

        if (obj.message != undefined) {
            message = obj.message;
            console.log("OLD MESSAGE " + message);
            $(messageText).val(message);
        }else if (obj.phone != undefined) {
            phoneSelectorValue = obj.phone;
            console.log("OLD Phone " + phoneSelectorValue);
            $(phoneSelector).val(phoneSelectorValue);
        
        }
    });


   }

});