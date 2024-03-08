import { ReplaySubject } from "rxjs";
import { Logger } from "winston";
import { LoggerService } from "../logger/Logger";
import { WSServer } from "../websocket/WSServer";
import { PLC, PLCVariable } from "./PLC";
import { PLCUtils } from "./PLCUtils";

var modbus = require("modbus-stream");

export class ModBusOptions {
}


export interface MODBUSReadRequest {
    address : number,
    size:number,
}

export class MODBUS extends PLC {
    client: any;
    

    constructor() {
        super()
    }


    
    private async poll() {
        this.logger?.info("Poll");

        try {

            for (var x = 0; x < this.variables.length; x++) {
                var p = new Promise<null>((res,rej) => {
                    let v = this.variables[x]
                    let req = this.createReadRequest(v);
                    let oldValue = v.value;
    
          
                    this.logger?.debug("MODBUS: read variable " +  v.alias);
                    this.logger?.debug("MODBUS: read request " , req);
    
                    if (v.type == "BOOL"){
    
                        this.client.readCoils ({
                            address: req.address,
                            quantity: req.size,
                        }, (err:any,info:any)  => {
                            if (err) {
                                this.logger?.error("MODBUS ERROR", err)
                                rej()
                            } else { 
        
                                //console.info("MODBUS: receive response", info.response);
        
                                let data = info.response.data
                                this.handleResponse(v, data);
        
                                
                                if (this.wsServer)
                                    this.wsServer.plc$.next([v])
    
                                if (v.observable && oldValue !== v.value)
                                    (<ReplaySubject<PLCVariable>>v.observable).next(v);
        
                                res(null)
                            }
                        });
    
                    }else {
                        this.client.readHoldingRegisters({
                            address: req.address,
                            quantity: req.size,
                        }, (err:any,info:any)  => {
                            if (err) {
                                this.logger?.error("MODBUS ERROR", err)
                                rej()
                            } else { 
        
                                //console.info("MODBUS: receive response", info.response);
        
                                let data = info.response.data
                                this.handleResponse(v, data);
        
                                if (this.wsServer)
                                    this.wsServer.plc$.next([v])
    
                                if (v.observable && oldValue !== v.value)
                                    (<ReplaySubject<PLCVariable>>v.observable).next(v);
        
                                res(null)
                            }
                        });
                    }

                
                });

   
                try {
                    await p;
                } catch (error){
                    this.logger?.error("Error reading " + this.variables[x].alias);
                    this.handleError();
                }
                
            } 
        } catch (e){
            this.logger?.error("Error polling!");
        }


      
        // console.log("polling ", this.variables)
    }

    public start(reconnect: boolean): void {
        try {
         
            this.logger?.info("Connecting",  this.options.port, this.options.host);

            modbus.tcp.connect(this.options.port, this.options.host, { debug: null }, (err:any, connection:any) => {
               
                if (err) {
                    this.stop();
                    this.logger?.error("Error starting ", err)
                    return;
                }
 
                this.client = connection;

                this.notifyConnected();

                PLCUtils.poll(() => this.poll(), 200);

            });

        } catch(e) {
            
            this.stop();
            this.logger?.error("Error starting ", this.id)
        }
        
    }


    public stop(): void {
        this.notifyDisconnected();
    }

    public registerVariable(variable: PLCVariable): Promise<PLCVariable> {
        throw new Error("Method not implemented.");
    }
    public unregisterAll(): undefined {
        throw new Error("Method not implemented.");
    }
    public write(variabiles: PLCVariable[], values: any[]): void {
        throw new Error("Method not implemented.");
    }


    protected createReadRequest(v: PLCVariable) : MODBUSReadRequest{
        return {
            address : Number.parseInt(v.address ? v.address : "0"),
            size : 2
        }
    }


    protected  handleResponse(v: PLCVariable, data:any) {

        this.logger?.debug("MODBUS Handle response data", data);

        if (v.type === "BOOL"){
            v.value = data[0] == 1;

        }else if (v.type === "FLOAT"){

            let u8array = new Uint8Array([data[0][0], data[0][1], data[1][0], data[1][1]]); // -1
            let view = new DataView(u8array.buffer)
            v.value = view.getFloat32(0)
            
        }else if (v.type === "INTEGER"){
            
            let u8array = new Uint8Array([
                data[0][0], 
                data[0][1], 
                data[1][0], 
                data[1][1],
            ]); // -1
            let view = new DataView(u8array.buffer)
            v.value = view.getInt32(0);

        }else if (v.type === "SHORT"){

            let u8array = new Uint8Array([
                data[0][0], 
                data[0][1]
            ]); // -1
            let view = new DataView(u8array.buffer)
            v.value = view.getInt16(0);
            
        }else if (v.type === "LONG"){

            let u8array = new Uint8Array([
                data[0][0], 
                data[0][1], 
                data[1][0], 
                data[1][1],
                data[2][0], 
                data[2][1],
                data[3][0], 
                data[3][1]
            ]); // -1
            let view = new DataView(u8array.buffer)
            v.value = view.getBigInt64(0);

        }else if (v.type === "DOUBLE"){

            let u8array = new Uint8Array([
                data[0][0], 
                data[0][1], 
                data[1][0], 
                data[1][1],
                data[2][0], 
                data[2][1],
                data[3][0], 
                data[3][1]
            ]); // -1
            let view = new DataView(u8array.buffer)
            v.value = view.getFloat64(0);
            
        }


        //console.info("MODBUS Handle response value", v.value);


    }
    
}
