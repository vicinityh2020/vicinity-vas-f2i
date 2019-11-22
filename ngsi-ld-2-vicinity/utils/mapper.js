const config = require ('../config/config'); 
const _ = require('lodash');

function NGSILD2TD(body) { 
    let aux = {}

    let output = {
        "adapter-id": config['adapter'].adapter_id
    }

    aux = _.map(body, entity => {
        let properties = [];
        const temp = _.omit(entity, ['id', 'type', 'createdAt']);

        if ((!_.isEmpty(temp)) && (temp.type == 'Property')) {
            _.map(temp, (value, key) => {
                let property = AddProperty(entity.id, key, value)
                if (!_.isEmpty(property)) {
                    properties.push(property);
                }
            })
        }


        const located_in = [
            {
                location_type: "s4bldg:BuildingSpace",
                label: "Office", 
                location_id: entity.containedIn.object
            },
                {
                location_type: "s4city:City",
                label: "Toulouse"
                },
            {
                location_type: "s4city:Country",
                label: "France",
                location_id: "http://dbpedia.org/resource/France"
            }
        ]

        // Static GPS coordinates

        properties.push({
            pid: "longitude",
            monitors: "adapters:GPSLongitude",
            read_link: {
                href: "/objects/{oid}/properties/{pid}",
                'static-value': {                  
                    longitude_value: entity.location.value.coordinates[0]
            },
            output: {
                type: "object",
                field: [{
                    name: "longitude_value",
                    predicate: "core:value",
                    schema: {
                        "type": "double"
                    }
                }]
            }
            }
        });

        properties.push({
            pid: "latitude",
            monitors: "adapters:GPSLatitude",
            read_link: {
            href: "/objects/{oid}/properties/{pid}",
            'static-value': {                  
                latitude_value: entity.location.value.coordinates[1]
            },
            output: {
                type: "object",
                field: [{
                    name: "latitude_value",
                    predicate: "core:value",
                    schema: {
                        type: "double"
                    }
                }]
            }
            }
        })


        return {
            name: entity.name,
            oid: entity.id,
            type: 'core:Device',
            version: '0.1',
            'located-in': located_in,
            actions: [],
            events: [],
            properties: properties,
        }
    })

    output["thing-descriptions"] = aux;

    return output;
}

// oid : entity.id/ pid : key, attribute : value
function AddProperty(oid, pid, attribute) {

        return {
            pid: oid,
            monitors: pid, //adapters:pid
            read_link: {
            href: "/objects/{oid}/properties/{pid}",
            output: {
                type: "object",
                field: [
                    {
                        name: "property",
                        schema: {
                            type: "string"
                        }
                    },
                    {
                        name: "timestamp",
                        predicate: "core:timestamp",
                        schema: {
                                type: "long"
                        }
                    },
                    {
                        name: "value",
                        predicate: "core:value",
                        schema: {
                            type: CheckType(attribute)
                        }
                    }
                ]
            }
            }
        };
    
}



function CheckType(value) {

    let type;

    if (typeof(value) == 'Number') {
        _.isInteger(value) ? type = "integer" : type = "double";
    } else if (typeof(value) == 'string') {
        type = 'string'; 
    } else if (typeof(value) == 'boolean') {
        type = 'boolean'
    } else {
        type = 'string'; 
    }
    
    return type;
}


 
 
module.exports = {NGSILD2TD}