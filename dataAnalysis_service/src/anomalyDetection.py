import pixiedust
import pandas as pd
from pyspark.sql import *
from pyspark.sql.functions import udf, col, asc, desc,to_date, unix_timestamp, weekofyear, countDistinct
from datetime import datetime
from pyspark.sql.types import DateType, TimestampType, IntegerType


import matplotlib.pyplot as plt
import pprint
from collections import Counter
import numpy as np
from matplotlib import dates

from pyspark.sql.functions import window
from functools import reduce

credentials_1 = {
    'username': 'XXXX',
    'password': 'XXXXXXX',
    'custom_url': 'XXXXXXX',
    'port': 'XXXX',
    'url': 'XXXXXXX'
}

username = credentials_1["username"]
password = credentials_1["password"]

host = username + '.cloudant.com'

dbName = "databasename"

cloudantdata=sqlContext.read.format("com.cloudant.spark").\
option("cloudant.host", host).\
option("cloudant.username", username).\
option("cloudant.password", password).\
option("view","_design/iotp/_view/by-date").\
option("jsonstore.rdd.partitions", 4).\
load(dbName)

cloudantdata.show()

str_to_ts =  udf (lambda d: datetime.strptime(d, "%Y-%m-%dT%H:%M:%S.%fZ"), TimestampType())

sparkDf = cloudantdata.selectExpr("value.deviceId as deviceId", "value.deviceType as deviceType", "value.eventType as eventType" ,  "value.timestamp as timestamp", "value.data.*","value.data.d.temp as temp","value.data.d.hum as hum","value.data.d.lum as lum", "value.data.d.nrj as nrj")
sparkDf = sparkDf.withColumn('ts', str_to_ts(col('timestamp')))
sparkDf.cache()
sparkDf.createOrReplaceTempView("deviceData")

# show the resulting schema and data 
sparkDf.printSchema()
spark.sql("SELECT * from deviceData").show(10)

deviceId = ['humidity', 'luminosity', 'temperature', 'energy']
deviceType = ['humidity_sensor', 'luminosity_sensor', 'temperature_sensor', 'counter']

# Data Visualization 
EperDtDF = spark.sql("SELECT ts,deviceType from deviceData").groupBy("deviceType").count()
EperDtDF.cache()
EperDtDF.show()

EperDtPanda = EperDtDF.toPandas().set_index('deviceType')

#How many reports each device type had?
ax = EperDtPanda.plot(kind='bar',legend=False)
ax.set_xlabel("deviceType")
ax.set_ylabel("events count")
ax.set_title('count of events by deviceType')

EperDdf = spark.sql("SELECT deviceId,ts from deviceData").groupBy("deviceId").count()####.sort()########
EperDtDF.cache()
EperDdf.show()


#How many reports have been sent by each device?
EperDPanda = EperDdf.toPandas().set_index('deviceId')

ax = EperDPanda.plot(kind='bar',legend=False)
ax.set_xlabel("deviceId")
ax.set_ylabel("events count")
ax.set_title('count of events by deviceId')

#find all numeric columns of the DataFrame
numericCols = [name_dt for name_dt in sparkDf.dtypes if (('double' in name_dt[1]) or ('int' in name_dt[1]) or ('long' in name_dt[1]))] 

#numericCols is a list of pairs (columnName, dataType), here we select only the column name into the allkeys list
allkeys = [x[0] for x in numericCols]
print("all numeric columns", allkeys)

#select only 4 numeric columns for further detailed visualizations
keys = ['lum', 'temp', 'hum', 'nrj']
print("selected 4 numeric columns", keys)

showing visualization for specific deviceID set above

for key in keys:
    df = spark.sql("SELECT deviceId, ts," + key +" from deviceData where deviceId='" + deviceId + "'").where(col(key).isNotNull())

    df = df.groupBy("deviceId", window("ts", "30 seconds")).agg(max(key), min(key), mean(key))
    #df = df.groupBy("deviceId", window("ts", "1 minute")).agg(max(key), min(key), mean(key))
    #df.groupBy("deviceId", window("ts", "5 minutes")).agg(max(key), min(key), mean(key))
    #df.groupBy("deviceId", window("ts", "1 hour")).agg(max(key), min(key), mean(key))
    
    #change automatic name of aggregated column
    oldColumns = df.schema.names
    newColumns = ["deviceId", "window", "max", "min", "avg"]
    df = reduce(lambda df, idx: df.withColumnRenamed(oldColumns[idx], newColumns[idx]), range(len(oldColumns)), df)
    
    win_to_ts =  udf (lambda d: d.start, TimestampType())

    df = df.withColumn('ts', win_to_ts(col('window')))
    df = df.select('deviceId','ts',"max", "min", "avg")
    df.cache()
    
    if (df.count() > 0):
        pandaDF = df.toPandas()

        ax = pandaDF.plot(x='ts', y='min', legend=True, figsize=(15,9), ls='-', marker='o', c="red")
        ax = pandaDF.plot(ax=ax, x='ts', y='max', legend=True, figsize=(15,9), ls='-', marker='o', c="red")
        ax = pandaDF.plot(ax=ax, x='ts', y='avg', legend=True, figsize=(15,9), ls='-', marker='o', c="green")
        
        #'S' secondly frequency, 'T' minutely frequency, 'H' hourly frequency
        xtick = pd.date_range(start=pandaDF['ts'].min(), end=pandaDF['ts'].max(), freq='30S')
        ax.set_xticks(xtick)

        ax.xaxis_date()
        ax.set_title(key + ' over time groupped by 30 sec')
        ax.set_ylabel(key)
    
        ax.autoscale_view()

		
'''
This function detects the spike and dip by returning a non-zero value 
when the z-score is above 3 (spike) and below -3(dip). 
'''
upperThreshold = 2
lowerThreshold = -2
def spike(row):
    if(row['zscore'] >=upperThreshold or row['zscore'] <=lowerThreshold):
        return row[key]
    else:
        return 0

#get the list of available devices
deviceTypes = sparkDf.select("deviceType").groupBy("deviceType").count().rdd.map(lambda r: r[0]).collect()

#calculate for each device type and each key
for devt in deviceTypes:
    for key in keys:
        df = spark.sql("SELECT deviceType, ts," + key +" from deviceData where deviceType='" + devt + "'").where(col(key).isNotNull())
        if (df.count() > 0):
            pandaDF = df.toPandas().set_index("ts")
            
            # calculate z-score and populate a new column
            pandaDF['zscore'] = (pandaDF[key] - pandaDF[key].mean())/pandaDF[key].std(ddof=0)

            #add new column - spike, and calculate its value based on the thresholds, usinf spike function, defined above
            pandaDF['spike'] = pandaDF.apply(spike, axis=1)
            
            
            #plot the chart, only if spikes were detected (not all values of "spike" are zero)
            if (pandaDF['spike'].nunique() > 1):
                # select rows that are required for plotting
                plotDF = pandaDF[[key,'spike']]
                #calculate the y minimum value
                y_min = (pandaDF[key].max() - pandaDF[key].min()) / 10
                fig, ax = plt.subplots(num=None, figsize=(14, 6), dpi=80, facecolor='w', edgecolor='k')
                ax.set_ylim(plotDF[key].min() - y_min, plotDF[key].max() + y_min)
                x_filt = plotDF.index[plotDF.spike != 0]
                plotDF['spikes'] = plotDF[key]
                y_filt = plotDF.spikes[plotDF.spike != 0]
                #Plot the raw data in blue colour
                line1 = ax.plot(plotDF.index, plotDF[key], '-', color='blue', animated = True, linewidth=1, marker='o')
                #plot the anomalies in red circle
                line2 = ax.plot(x_filt, y_filt, 'ro', color='red', linewidth=2, animated = True)
                #Fill the raw area
                ax.fill_between(plotDF.index, (pandaDF[key].min() - y_min), plotDF[key], interpolate=True, color='blue',alpha=0.6)

                # calculate the sensor value that is corresponding to z-score that defines a spike
                valUpperThreshold = (pandaDF[key].std(ddof=0) * upperThreshold) + pandaDF[key].mean()
                # calculate the sensor value that is corresponding to z-score that defines a dip
                valLowerThreshold = (pandaDF[key].std(ddof=0) * lowerThreshold) + pandaDF[key].mean()

                #plot the thresholds
                ax.axhline(y=valUpperThreshold,c="red",linewidth=2,zorder=0,linestyle='dashed',label='Upper threshold')
                ax.axhline(y=valLowerThreshold,c="red",linewidth=2,zorder=0,linestyle='dotted',label='Lower threshold')
                
                # Label the axis
                ax.set_xlabel("Sequence",fontsize=20)
                ax.set_ylabel(key,fontsize=20)
                ax.set_title("deviceType: " + devt + " sensor:" + key)
                plt.tight_layout()
                plt.legend()
                
                print("Device Type: " + devt + ", sensor: " + key)
                print("Upper treshould based on the z-score calculation: " , upperThreshold , ": " , valUpperThreshold)
                print("Lower treshould based on the z-score calculation: ", lowerThreshold, ": " , valLowerThreshold)
                
                plt.show()
