import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Server } from 'http';
import { Server as IOServer } from "socket.io";
import { PLCVariable } from "../plc/PLC";
import { PLCManager } from "../PLCManager";

export class PLCHandle {
    "name":string
}

export class WSEmitter {
}

export class WSMessage {
    content?: string
    tags?: string[]
}

export class WSServer {
    io: IOServer;
    public message$: Subject<WSMessage> = new Subject()
    public plc$: Subject<PLCVariable[]> = new Subject()
    PLCManager?: PLCManager;


    constructor(http: Server) {

        this.io = new IOServer(http, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });


        this.plc$.subscribe(v => {
            this.io.sockets.emit("plc_read", JSON.stringify(v, ['name', 'address', 'plc', 'value']))
        })


       

        this.run()
    }


    public run() {

        this.io.sockets.on("error", e => console.log(e));


        this.io.sockets.on("connection", socket => {

            socket.on("plc_subscriber", (id, plc) => {
                let p = this.PLCManager?.get(plc)
                if (!p) return

                //let vs = {}

                let vs = p.variables.map(v => {
                    return {
                        name: v.name,
                        plc: v.plc,
                        value: v.value
                    }
                })
                socket.emit("plc_read", JSON.stringify(vs))
            })

            socket.on("broadcaster", (message) => {
                console.log("broadcaster")
                //broadcaster = socket.id;
                socket.broadcast.emit("broadcaster", message);
            });

            socket.on("watcher", (message) => {
                console.log("watcher", message)
                socket.broadcast.emit("watcher", socket.id, message);
            });

            socket.on("offer", (id, message) => {
                console.log("offer")

                socket.to(id).emit("offer", socket.id, message);
            });

            socket.on("answer", (id, message) => {
                socket.to(id).emit("answer", socket.id, message);
            });

            socket.on("candidate", (id, message) => {
                socket.to(id).emit("candidate", socket.id, message);
            });
            socket.on("disconnect", () => {
                socket.emit("disconnectPeer", socket.id);
            });


            socket.on('plc_write', (plc, varid, value) => {

                if (this.PLCManager)
                    this.PLCManager.writeById(plc, varid, value)
                else
                    console.warn("missing plcmanager writing to ", plc)
            })

            socket.on('plc_write2', (vars: PLCHandle[], values: any[]) => {

                console.log("WRITE 2", vars, values)

                try {
                    if (this.PLCManager)
                        this.PLCManager.write2(vars as any, values)
                    else
                        console.warn("missing plcmanager writing ", vars)
                } catch(e) {
                    console.error(e)
                }

                
            })

        });
    }


}



