var request = require ('request');
var config = require ('../config/config')
var utils = require ('../lib/utils'); 

var devicesInfos = new Array(); 
var clients = new Array(); 

function discoverAndRegister () {

    let device = {
        deviceId : '', 
        properties : []
    }
    let method = "GET"; 
    let uri = config['adapter'].AGENT_ENDPOINT; 
    let options = {
        uri : uri, 
        method : method, 
        headers : {
            "adapter-id" : config['adapter'].adapter_id, 
            "infrastructure-id" : config['adapter'].service_id
        }
    }; 
    
    return new Promise (function(resolve, reject){
        request(options, function (error, response, body) {
            if(error){
                return error; 
            } else { //to add : handle error status code 
                console.log('body', body);
                for (let i=0; i< body.length; i++) {
                    device.deviceId = body[i].oid; 
                    for (let j=0; j<body[i].properties.length; j++) {
                        device.properties.push(body[i].properties[j]); 
                    }
                    devicesInfos.push(device); 
                    utils.connect('device',device.deviceId, 'https'); 
                    device = {
                        deviceId : '', 
                        properties : []
                    }; 
                }
                clients=utils.devicesClients; 
                resolve(devicesInfos, clients)
                
            }
        }); 
    });

}

function publishData (device, client) {
    let payload = {data : []}; 
    let element = {
        value : '', 
        property : ''
    }; 
    //{value : message[0].value, type : pid}
    for (let i=0; i<device.properties.length; i++){
        element = generatePayload(device.deviceId, device.properties[i]); 
        payload.data.push(element); 
        element = {
            value : '', 
            property : ''
        }; 
    }
    utils.publish(client, payload, 'https'); 
} 

function generatePayload (oid, pid) { 
    let element = {
        value : '', 
        property : pid
    }; 

    let promises = []; 
    let method = "GET"; 
    let uri = config['adapter'].AGENT_ENDPOINT+'/'+oid+'/properties/'+pid; 
    let options = {
        uri : uri, 
        method : method, 
        headers : {
            "adapter-id" : config['adapter'].adapter_id, 
            "infrastructure-id" : config['adapter'].service_id
        }
    }; 
    promise = new Promise (function(resolve, reject) {
        request(options, function (error, response, body) {
            if(error){
                reject (error); 
            } else {
                console.log('body', body);
                element.value = body.message[0].value; 
                resolve(element);  
                
            }
        });
    });
    
    promises.push(promise); 
    Promise.all(promises).then(function() {
        return element; 
    });
    
}


module.exports = {
    devicesInfos, 
    discoverAndRegister, 
    publishData
}