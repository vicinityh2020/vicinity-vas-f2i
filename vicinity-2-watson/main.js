var mapper = require ('./lib/mapper'); 

function start () {
    mapper.discoverAndRegister.then (function(clients, devicesInfos) {
        setInterval (function() {
            for (let i=0; i<clients.length; i++) {
                mapper.publishData(devicesInfos[i], clients[i]); 
            }
        }, 1000); 
        
    });
}

start(); 

 