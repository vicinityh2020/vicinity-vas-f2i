var  config = {}

config.watson = {
    id : 'ghada.gharbi@sensinov.com',
    organization_ID : 'ug1idc',
    authenticationMethod = 'apikey',
    authenticationToken = 'mytoken', 
    HTTPS_PORT : 8883, 
    HTTP_PORT : 1883, 
    topic : 'iot-2/evt/sensorData/fmt/json'
}

config.adapter = {
    adapter_id : 'SmartBuilding-adapter',
    service_id : "read-and-write", 
    active_discovery: true,
    AGENT_HOST_IP : '', //Put your adress here, 
    AGENT_HOST_PORT : 9997,
    AGENT_BASE_URL : `${AGENT_HOST_IP}:${AGENT_HOST_PORT}`, 
    AGENT_ENDPOINT: AGENT_BASE_URL+'/agent/remote/objects'
}

module.exports = config; 
