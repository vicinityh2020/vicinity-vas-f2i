# vicinity-vas-f2i

Ensuring accurate datasets through fault monitoring and isolation is crucial for operational Internet of Things (IoT) deployments. In fact, IoT devices and sensors can generate incorrect measurements which can be attributed to software and hardware issues. As an example, if an IoT system is used to perform predictive maintenance of a smart building, the collected IoT datasets must accurately reflect the status of the monitored system. Continually monitoring and isolating faults is an
important feature in IoT.

Additionally, in this experiment, we integrate a smart building infrastructure where data coming from sensors are published using NGSI-LD context data model instantiating SAREF for building ontology to enhance building exploitation.

F2I-VAS objectives are articulated around the following aspects:
- Integration of VICINITY with IBM Watson IoT platform to offer fault detection as a service providing insights to dashboard application of smart building operators. Fault detection with IBM Watson IoT is based on both machine learning of data sets as well as detection models known as SPSS (Statistical Package for the Social Sciences). We refine SPSS models for data sets pertaining to Smart Building.

- To integrate smart building infrastructure and fault detection and isolation capabilities, we need to develop adapters that translate between NGSI-LD model and the VICINITY Thing Description and VICINITY ontology to Watson IoT data model.

- To enhance the learning capabilities of our value-added service, we bring different datasets
types from smart building.
