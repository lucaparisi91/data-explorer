import numpy as np
import json
from math import *
import pandas as pd

N=10000
x_max=1
sigma=0.1
x=np.linspace(0,x_max,num=N)
y1= 0.5 + np.random.normal(size=N)*sqrt(sigma)
y2= 1 + np.random.normal(size=N)*sqrt(0.2*sigma)
data1=pd.DataFrame({"x":x,"y":y1})
data1["label"]="gamma=0.1"
data2=pd.DataFrame({"x":x,"y":y2})
data2["label"]="gamma=1"

data=pd.concat([data1,data2])
def createPlotInfo(df):
	data=np.array([df["x"],df["y"],df["label"]]).transpose().tolist()
	json_data={}
	json_data["data"]=data
	json_data["labels"]=list(set(df["label"]))
	
	
	with open("plot.json","w",encoding="utf-8") as f:
		json.dump(json_data,f)

createPlotInfo(data)