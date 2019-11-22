const config = require ('../config/config'); 
const mqttClient = require ('../app/watsonClient'); 

var isConnected = false; 
var devicesClients = new Array(); 

function connect (deviceType, deviceId, protocol) {
  
    let iot_host = config['watson'].organization_ID + ".messaging.internetofthings.ibmcloud.com";
    let iot_port = protocol == "https:" ? config['watson'].HTTPS_PORT : config['watson'].HTTP_PORT;
    let iot_clientid = "d:" + config['watson'].organization_ID + ":" + deviceType  + ":" + deviceId;
    let client = new mqttClient.Client(iot_host, iot_port, iot_clientid); 
    devicesClients.push(client); 
    connectDevice(client, protocol);

}

function connectDevice (client, protocol) {
    
    let topic = config['watson'].topic;
    console.log("Connecting device to IBM Watson IoT Platform...");
    client.connect({
        onSuccess: onConnectSuccess,
        onFailure: onConnectFailure(client, protocol),
        userName: "use-token-auth",
        password: config['watson'].authenticationToken,
        useSSL: protocol
    });
	
}


function onConnectSuccess() {
    isConnected = true;
}

function onConnectFailure(client, protocol) {
    let i = 0; 
    while (i < 5) {
        i++; 
        setInterval(connectDevice(client, protocol), 1000);
    }
   
}

function publish (client, payload, protocol) {
        
    // We only attempt to publish if we're actually connected, saving CPU and battery
    if (isConnected) {
        var message = new mqttClient.Message(JSON.stringify(payload));
        message.destinationName = config['watson'].topic;
        try {
            client.send(message);
            console.log("[%s] Published", new Date().getTime());
        } catch (err) {
            console.error(err);
            isConnected = false;
            setTimeout(connectDevice(client, protocol), 1000);
        }
    }
   
}

module.exports = {connect, publish, devicesClients}