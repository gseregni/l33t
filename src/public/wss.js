import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

export function wss() {
    return xx
}
    var xx  = {
        count: 0,
        variables: [],
        addEventListener(l) {
            this.listener = l
        },
        getHandle(name) {
            var h = this.variables.find(v => v.name == name)
            if (!h) {
                h = {
                    name: name
                }
                this.variables.push(h)
            }

            return h
        
        },
        async start(data) {
            
            this.variables = data
            const config = {
                iceServers: [
                    { 
                    "urls": "stun:stun.l.google.com:19302",
                    }
                ]
                };
              
            const socket = await io("http://192.168.30.152:1337");
            
            socket.on("plc_read", (message) => {
                var vs = JSON.parse(message)
                for (var x = 0; x < vs.length; x++) {
                    var v = vs[x]
                    let h = this.getHandle(v.name)
                    h.plc = v.plc
                    h.value = v.value
                }
            })
            
            socket.on("connect", () => {
                socket.emit("plc_subscriber",socket.id, "RULLIERA")
                socket.emit("plc_subscriber",socket.id, "ZONA3")
                socket.emit("plc_subscriber",socket.id, "ASPIRAZIONE")
                socket.emit("plc_subscriber",socket.id, "VALMEC1")
                socket.emit("plc_subscriber",socket.id, "VALMEC2")
                socket.emit("plc_subscriber",socket.id, "VALMEC3")
                socket.emit("plc_subscriber",socket.id, "VALMEC4")
                socket.emit("plc_subscriber",socket.id, "VALMEC5")
               
            });

        }

    }