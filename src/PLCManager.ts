
import fs from 'fs'
import { ReplaySubject } from 'rxjs';
import { Logger } from 'winston';
import { threadId } from 'worker_threads';
import { LoggerService } from './logger/Logger';
import { ADS } from './plc/ADS';
import { Arduino } from './plc/ARDUINO';
import { DELTA } from './plc/DELTA';
import { OMRON_ETHIP } from './plc/OMRON_ETHIP';
import { OPCUA } from './plc/OPCUA';
import { PLC, PLCVariable } from './plc/PLC';
import { S7 } from './plc/S7';
import { PLCVariableRequest } from './plc_types';
import { PLCHandle } from './websocket/WSServer';



export class PLCConfig {
    "plcs":   PLC[]   
}

const logger : Logger = LoggerService.create("PLCManager");

export class PLCManager {
   
    
    public config:PLCConfig | null = null;

   
    //private instances : PLC[] = [];

    public handle(plc : PLC) : void{
    }

    public get(id : string) : PLC | undefined {
        return this.config?.plcs.find( c => c.id == id);
    }

    public load(jsonPath: string ):PLCConfig | undefined {
        try {
            this.config = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        } catch(e) {
            console.error("Error reading " + jsonPath, e)
        }
        
        if (!this.config || !this.config.plcs) {
            console.info("Config seems empty")
            return undefined
        }

        for (var x = 0; x < this.config.plcs.length; x++) {
            let plc = this.config.plcs[x]
            var i = this.instancePLC(plc);
            if (i)
                this.config.plcs.splice(x,1,i) // replace with the proper instance
        }

        return this.config
    }

    // todo loop over available drivers
    public  instancePLC(plc : PLC ):PLC | undefined {
        var withType

        logger.info("InstancePLC:",plc);

        if (plc.driver == "ADS") {
            withType = Object.assign(new ADS(), plc)
        } else if  (plc.driver == "OPCUA") {
            //withType = Object.assign(new OPCUA(plc.options), plc)
            //return ;
            //this.handle(plc);
        } else if (plc.driver == "S7") {
            withType = Object.assign(new S7(plc.options), plc)
        } else if (plc.driver == "ARDUINO") {
            withType = Object.assign(new Arduino(), plc)
        } else if (plc.driver == "DELTA") {
            withType = Object.assign(new DELTA(), plc)
        } else if (plc.driver == "OMRON_ETHIP") {
            withType = Object.assign(new OMRON_ETHIP(), plc)
        } 


        withType?.init();

        return withType
    }

  

    writeById(plc: string, variables: string[], values: any[]) {

        var p = this.config?.plcs.find(p => p.id == plc)
        if (!p) {
            console.error("Can't find PLC ", plc)
            return 
        }
        
        let valuesToWrite = []
        let varsToWrite = []

        for (var x = 0; x < variables.length; x++) {

            var v = p.variables.find(v => variables[x] == v.name )
            if (v) {
                varsToWrite.push(v)
                valuesToWrite.push(values[x])
            }
        }
        p.write(varsToWrite, valuesToWrite)
    
    }

    write2(variables:PLCHandle[], values: any[]) {
        //console.log("WRITE2.....", variables)
        
        variables.forEach((v,i) => {
            if (!v || !v.name || (v.name && v.name.split && v.name.split('@').length != 2)){
                console.log("erro wri", v.name)
                return
            }
            var p = this.config?.plcs.find(p => p.id == v.name.split('@')[1])
            if (!p) {
                console.error("Can't find PLC22 ", v)
                return 
            }

            let valuesToWrite = []
            let varsToWrite = []
            
            var vx = p.variables.find((pv) => pv.name == v.name)
            //console.log("VXXXXXXXXx", vx)
            if (vx) {
                     varsToWrite.push(vx)
                     valuesToWrite.push(values[i])
            }

            console.log("write2", [v], values[i])
            p.write(varsToWrite, valuesToWrite)
        })
       
        

        // for (var x = 0; x < variables.length; x++) {
        //     var v = p.variables.find(v => v.name == variables[x])
        //     if (v) {
        //         varsToWrite.push(v)
        //         valuesToWrite.push(values[x])
        //     }
        // }
        // p.writeTest(varsToWrite, valuesToWrite)
    
    }


    public writeBool(plc:string, alias:string, value:boolean) {
      let v = this.findVariable(plc,alias);
      
      let vs : PLCVariable[] = [];
      let vl : any[] = [];
    
        vs.push(v);
        vl.push(value)
        this.get(plc)?.write(vs,vl)
    }


    public writeShort(plc:string, alias:string, value:number) {
        let v = this.findVariable(plc,alias);
        
        let vs : PLCVariable[] = [];
        let vl : any[] = [];
      
          vs.push(v);
          vl.push(value)
          this.get(plc)?.write(vs,vl);
    }

    public writeDouble(plc:string, alias:string, value:number) {
        let v = this.findVariable(plc,alias);
        
        let vs : PLCVariable[] = [];
        let vl : any[] = [];
      
          vs.push(v);
          vl.push(value)
          this.get(plc)?.write(vs,vl);
    }
    
    public getValueBool(plc:string, alias:string) : boolean {
       return this.findVariable(plc,alias)?.value;
    }

    public getValueShort(plc:string, alias:string) : number {
        return this.findVariable(plc,alias)?.value;
     }

    public findVariable(plc:string, alias:string) : PLCVariable{

        let p =  this.get(plc);
        
        if (!p)
           throw "PLC " + plc + ": non trovato";

       let ret =  p.findByAlias(alias);

        if (!ret)
            throw "Variabile " + plc + ":" + alias + " non trovata";

        return ret;
     }

}