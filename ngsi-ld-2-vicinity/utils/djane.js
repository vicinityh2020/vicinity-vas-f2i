var request = require ('request'); 
var config = require ('../config/config'); 
var auth = require ('../auth/auth')
class Djane {

    constructor() {
      // Singleton class
      if (!Djane.instance) {     
        
        /*
            Tab to register devices ids (oid in vicinity)
        */
        this.token=null; 
        this.devices_oid = [];
  
        Djane.instance = this;
      }
      return Djane.instance;
    }

    // Start djane server
    start() {
    
        console.log('Starting interaction with djane server');
    
        auth.generatetoken().then( function (token) {
            console.log('token', token); 
            this.token=token; 
            // Initial device discovery
            this.getEntities(token).then (function (response) {       
                    for (let i=0; i<response.length; i++) {
                        this.devices_oid.push(response[i].id); 
                    }
                }
            )
        });     
    };

    /**
     * Get all entities stored at djane server (with particular fiware-service and fiware-servicepth)   
     * returns Array with all the context entities
    */
    getEntities(token) { 
        let method = "GET"; 
        let uri = config['djane'].NGSI_LD_HOST+'/'+config['djane'].collection; 
        let options = {
            uri : uri, 
            method : method, 
            headers : {
                "Accept" : config['djane'].accept, 
                "X-AUTH-TOKEN" : token
            }
        }; 
        
        return new Promise (function(resolve, reject) {
            request(options, function (error, response, body) {
                if(error){
                    //console.log(error);
                    reject(error); 
                } else {
                    //console.log('status code: ',response.statusCode);
                    //console.log('body', body);
                    resolve(body); 
                }
            });
        }); 
    }

    /**
        * Get the representation of a particular device (entity)
    */
    getEntity(entityId, token) {
        let method = "GET"; 
        let uri = config['djane'].NGSI_LD_HOST+'/'+config['djane'].collection+'/'+entityId; 
        let options = {
            uri : uri, 
            method : method, 
            headers : {
                "Accept" : config['djane'].accept, 
                "X-AUTH-TOKEN" : token
            }
        }; 
        return new Promise (function(resolve, reject) {
            request(options, function (error, response, body) {
                if(error){
                    //console.log(error);
                    reject(error); 
                } else {
                    //console.log('status code: ',response.statusCode);
                    //console.log('body', body);
                    resolve(body); 
                }
            });
        }); 
    }


}




const instance = new Djane();
exports.instance = instance;