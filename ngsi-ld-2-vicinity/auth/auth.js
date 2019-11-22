var request = require ('request'); 
var config = require ('../config/config'); 

function generatetoken() {


    var body = {
        username : config['djane'].USERNAME, 
        password: config['djane'].PWD
    }; 

    let method = "POST"; 
    let uri = config['djane'].DJANE_BASE_URL+'/login';  
    let options = {
        uri : uri, 
        method : method, 
        headers : {
            "Content-Type" : config['djane'].contentType 
        }, 
        json : body
    }; 

    var token = null; 

    return new Promise (function(resolve, reject){
        request(options, function (error, response, body) {
            if(error){
                console.log(error);
                reject (error); 
            }else{
                token = body.token;
                resolve(token); 
            }
        }); 
    }); 

}

module.exports = {generatetoken}