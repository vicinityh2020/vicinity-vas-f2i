const express = require('express');
const router = express.Router();
const _ = require('lodash');


const  djane = require('../utils/djane').instance; 
const  mapper = require('../utils/mapper'); 



/**
 * Get all entities registred in djane running instance 
 */
router.get('/objects', function (req, res, next) {
    djane.getEntities(djane.token).then(function (response, error) {
        if (error) {
            res.status(500); 
            return res.json(error); 

        } else {
            console.log (response); 
            let result = mapper.NGSILD2TD(response); 
            return res.json(result); 
        }
    }); 
});

/**
 * Get the info of an entity property
 */
router.get('/objects/:oid/properties/:pid', function (req, res, next) {  

    djane.getEntity(req.params.oid, djane.token).then(function(response, error){
        if (error) {
            return res.status(404).send('Entity ' + req.params.oid + ' not found');; 
        } else {
            const pid = _.find(response, function(value, key) {              
                return _.toLower(req.params.pid) === _.lowerCase(key.replace(/[_0-9]/g, ''));
            })
      
            if (pid) {
                let timestamp = '';
                if (_.has(pid, 'observedAt')) {            
                    timestamp = pid.observedAt;
                }
                else if (_.has(pid, 'modifiedAt')) {
                    timestamp = pid.modifiedAt;
                }
                else if (_.has(pid, 'createdAt')) {
                    timestamp = pid.createdAt;
                }
                return res.json({
                    timestamp: timestamp,
                    value: pid.value
                })
            } else {
                return res.status(404).send('Property ' + req.params.pid + ' not found');  
            }               
        }
    }); 
});

/**
 * Update the info of a single context element
 */
router.put('/objects/:oid/properties/:pid', function (req, res, next) {  
    res.status(422); 
    res.send('Operation Not Supported'); 
}); 


module.exports = router; 