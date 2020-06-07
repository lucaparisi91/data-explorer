
console.log("Running...")
var socket = io();

socket.on('connect', () => console.log("connected") );


function receiveData(data)
{
    console.log("received data")
    console.log(data["x"].length )
}


socket.on('sendData', receiveData);

button=document.getElementById("requestDataButton");

button.onclick=function() {socket.emit("requestData");}

