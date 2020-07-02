from flask import Flask 
from flask import render_template
from flask_socketio import SocketIO
import numpy as np
from flask_socketio import send, emit
import matplotlib.pylab as plot
from matplotlib.figure import Figure
import matplotlib.pylab as plt
import base64
import seaborn as sns
import pandas as pd 
import io
import urllib


def toArray(x):
    xn = np.asarray([x]) if np.isscalar(x) else np.asarray(x)
    return xn


sns.set_style("whitegrid")

app= Flask (__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

def create_test_data_set():
    x=np.linspace(0,1,num=100)
    y=x**2 + np.random.random(size=len(x))

    z=x + np.random.random(size=len(x))*np.sqrt(0.1)

    return pd.DataFrame({"x":x,"y":y,"z":z})


data=create_test_data_set()        


def create_plot( data , x , y ,minX=0,maxX=1,minY=0,maxY=1):

    for y1 in toArray(y):
        plt.plot(data[x],data[y1],marker="o",linestyle="dashed")
    
    plt.xlabel(x)

    deltax=0.1*(maxX-minX)
    deltay=0.1*(maxY-minY)

    plt.xlim(minX-deltax,maxX+ deltax )
    plt.ylim(minY-deltay,maxY + deltay)




@socketio.on("data_info")
def data_info():

    ranges={ column : [np.min(data[column]),np.max(data[column])]       for column in data.columns }

    emit("data_info", {"columns" : list(data.columns) ,"ranges" : ranges } )
@socketio.on("draw_plot")
def draw_plot(plotSettings):

    

    create_plot(data,**plotSettings)
    imgdata = io.BytesIO()

    plt.savefig(imgdata,format="png")
    plt.clf()

    imgdata.seek(0)

    encoded_plot=base64.b64encode(imgdata.read())


    
    emit("draw_plot",str(encoded_plot))



@app.route("/<project_name>")
def dash_board(project_name=None):
    return render_template("start.html",project_name=project_name)



if __name__ == "__main__":
    socketio.run(app)
    
