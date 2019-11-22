var config = {};

config.djane = {
    NGSI_LD_HOST_IP :'http://127.0.0.1', 
    NGSI_LD_HOST_PORT : 3000, 
    DJANE_BASE_URL : `${NGSI_LD_HOST_IP}:${NGSI_LD_HOST_PORT}`, 
    NGSI_LD_HOST : DJANE_BASE_URL + '/ngsi-ld/v1',
    collection : 'entities', 
    USERNAME='admin',
    PWD='admin4djane', 
    contentType='application/json', 
    accept='application/json'

};

/**
 * Configuration of the VICINITY adapter
 */
config.adapter = {
    adapter_id : 'SmartBuilding-adapter',
    active_discovery: true,
    agent_endpoint: 'http://localhost:9997/agent/objects',
    port: 4000, 
};

module.exports = config;

