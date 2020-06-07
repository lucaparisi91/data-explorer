import numpy as np
import json
from math import *
import pandas as pd
import copy

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
def createPlotInfo(df,x,y,label):
	data=np.array([df[x],df[y],df[label]]).transpose().tolist()
	json_data={}
	json_data["data"]=data
	json_data["labels"]=list(set(df[label]))
	
	return json_data
	
	
def createPlotsInfo(df,x,y,label,split_label=None):
	json_datas={"figures":[]}
	if split_label is None:
		json_data=createPlotInfo(df,x,y,label)
		json_datas["figures"].append(json_data)
	else:
		for label_value,df_g in df.groupby(split_label):
			df_g=copy.deepcopy(df_g)
			df_g.loc[:,split_label]=label_value
			json_data=createPlotInfo(df_g,x,y,label)
			json_datas["figures"].append(json_data)



	with open("plot.json","w",encoding="utf-8") as f:
		json.dump(json_datas,f)	



#createPlotsInfo(data,"x","y","label",split_label="label")
data=pd.read_csv("energyAll.dat",sep=" ",index_col=0)[["time","energy","timeStep"]]
createPlotsInfo(data,"time","energy","timeStep",split_label="timeStep")
