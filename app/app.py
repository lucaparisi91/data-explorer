from  flask import Flask,render_template
from flask_socketio import SocketIO
from flask_socketio import send, emit
import numpy as np
app=Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
socketio=SocketIO(app)


@app.route("/")
def hello():
    data="x"

    return render_template("base.html")


@socketio.on('requestData')
def handle_requestData():
    x=np.linspace(0,1,num=1000)
    y=x**2
    
    emit('sendData', {"x": list( x), "y" : list(y)}  );
    
if __name__== "__main__":
    socketio.run(app)
    
    


