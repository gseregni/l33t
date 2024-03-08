import { Observable, ReplaySubject } from "rxjs";
import { Logger } from "winston";
import { LoggerService } from "../logger/Logger";
import { PLCManager } from "../PLCManager";
import { WSServer } from "../websocket/WSServer";

export enum PLCVariableType {
    STRING = "STRING",
    INTEGER = "INTEGER",
    FLOAT = "FLOAT",
    DOUBLE = "DOUBLE",
    LONG = "LONG",
    SHORT = "SHORT",
    BOOL = "BOOL",
    ARRAY_OF_BOOL = "ARRAY_OF_BOOL"
}

export class PLCVariable {
    constructor(type:PLCVariableType) {
        this.type = type
    }

    name?: string
    plc?: string 
    address? : string
    type : PLCVariableType;
    size?: number;
    value?: any
    observable?: Observable<PLCVariable> = new ReplaySubject<PLCVariable>(1)
    handle?: any;
    alias?:string;
}


/*
* Abstract one
*/
export abstract class PLC {

    constructor() {

    }

    public id : string = "";
  
    public wsServer?:WSServer
    
    public status:PLCStatus = {
        connected: false,
    }

    driver?: string;

    options  : any;

    disable? : boolean;

    logerLevel : string ="debug";

    logger ? : Logger = undefined;

    public manager?:PLCManager = undefined

    public variables:PLCVariable[] = [];
   
    public abstract start(reconnect?:boolean) : void;

    public abstract stop():void

    public abstract registerVariable(variable : PLCVariable):Promise<PLCVariable>

    public abstract unregisterAll():undefined

    public abstract write(variabiles:PLCVariable[], values:any[]):void

    public abstract write(variabiles:PLCVariable[], values:any[]):void

    public init(){
        this.logger = LoggerService.create(this.id);
        this.logger.level = this.logerLevel;
        this?.variables.forEach( v =>  this.initVariable(v));
    }

    initVariable (v : PLCVariable){
        v.observable = new ReplaySubject<PLCVariable>(1);
        v.alias = v.alias ? v.alias : v.address;  // se non esiste alias allora alisa è l'address
    }
    


    public findByAlias(alias : string): PLCVariable | undefined {
       return this.variables.find( v => v.alias == alias);
    }

    public findByName(name : string): PLCVariable | undefined {
        return this.variables.find( v => v.name == name);
    }

    protected notifyConnected(){
        this.logger?.info("PLC connected");
        this.status.connected = true;
        this.status.connectedTs =  Date.now();
    }

    protected notifyDisconnected(){
        this.logger?.warn("PLC disconnected");
        this.status.connected = false;
        this.status.connectedTs = undefined;
    }

    protected handleError(){

    }


 
}


export interface PLCStatus {
    connected : boolean, 
    connectedTs ?: EpochTimeStamp,
}
