import { NextFunction } from "express"
import  { Request, Response } from "express";
import { WSServer } from "../websocket/WSServer";


export default class Cambium {
    

    constructor(private wss:WSServer) {
        
    }


    push = (req: Request, response: Response, next: NextFunction) => {
        console.log("CAMBIUM HUNDEGGER")
        let rull = this.wss.PLCManager?.get("RULLIERA")
        console.log(new Date().toLocaleString())
        
        this.wss.PLCManager?.write2([{name: "RULLI_CENTRO_TAGLI.RD_Presenza_Pz_Da_Hundegger@RULLIERA"}], [true])
        setTimeout(() => {
            this.wss.PLCManager?.write2([{name: "RULLI_CENTRO_TAGLI.RD_Presenza_Pz_Da_Hundegger@RULLIERA"}], [false])
            response.status(200)
            response.end()
        },5000)
       

    }
}