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

        $(alertMessage).hide();
        $(alertDE).hide();
    }


    
    function initialize(data) {
        if(data) {
            payload = data;
        }
        console.log('initialize', data);
    }




    function onClickedNext() {
        console.log("onClickedNext");
        if(currentStep.key === 'review') {
            save();
        } else {
            if(validateMessage()){
                connection.trigger('nextStep');
            }else{
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
       
       /* $('.step').hide();
        $(`#${currentStep.key}`).show();
        */
    }







    function onRequestSchema(data) {
        console.log('schemaDefinition', schemaDefinition);
        schema = data['schema'];
        var schemaPresent = schema !== undefined && schema.length > 0;
        $(dataExtensionWarningSelector).toggle(!schemaPresent);
        
        if(schema !== undefined && schema.length > 0){
            fillPlaceholderList(schema);
        }else{
            $(alertDE).show();
            $(setupMessage).hide();
            
        }
        


        

    }


    
    function onRequestEventDefinition(eventDefinition) {
        console.log('eventDefinition', eventDefinition);
        eventDefinitionKey = eventDefinition.eventDefinitionKey;
        console.log('eventDefinitionKey', eventDefinitionKey);
        
    }



    function save() {
        payload.arguments = payload.arguments || {};
        payload.arguments.execute = payload.arguments.execute || {};
        payload.metaData = payload.metaData || {};
        payload.arguments.execute.inArguments = inArguments;
        
        payload.metaData.isConfigured = true;

        console.log(JSON.stringify(payload));
        connection.trigger('updateActivity', payload);
    }


    function validateMessage(){
        var messageArea = $(setupMessage);
        if ($.trim(messageArea.val()) == '') {
            messageArea.focus();
            $(alertMessage).show();
            return true;
        }else{
            return false;
        }
    }



    function fillPlaceholderList(schema) {
        if (schema !== undefined && schema.length > 0) {
            for (var i in schema) {
                var field = schema[i];
                var fieldName = extractFieldName(field);
                if (isEventDataSourceField(field)) {
                    $(camposDE).append('<li class="list-group-item">%%' + fieldName + '%%</li>');
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




});