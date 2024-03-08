import { MODBUS, MODBUSReadRequest } from "./modbus";
import { PLC, PLCVariable } from "./PLC";


export class DELTAOptions {
}

export class DELTA extends MODBUS {
    

    protected createReadRequest(v: PLCVariable): MODBUSReadRequest {
        let ret : MODBUSReadRequest = {
            address : 0,
            size : 1,
        }


        if (v.address?.startsWith("M")){
           ret.address= Number.parseInt(v.address.substring(1));
           ret.address += 2048;
        }else if (v.address?.startsWith("D")) {
            ret.address= Number.parseInt(v.address.substring(1));
            ret.address += 4096;
        }else if (v.address?.startsWith("D")) {
            ret.address= Number.parseInt(v.address.substring(1));
            ret.address += 4096;
        }else if (v.address?.startsWith("D")) {
            ret.address= Number.parseInt(v.address.substring(1));
            ret.address += 4096;
        }


        if (v.type === "BOOL"){
            ret.size = 1;
        }else if (v.type === "FLOAT"){
            ret.size = 4;
        }else if (v.type === "INTEGER"){
            ret.size = 4;
        }else if (v.type === "SHORT"){
            ret.size = 2;
        }else if (v.type === "LONG"){
            ret.size = 8;
        }else if (v.type === "DOUBLE"){
            ret.size = 8;
        }

        return ret;
    }



/*
    protected createReadRequest(var: PLCVariable) : MODBUSReadRequest {

        let ret = {

        }




        if (var.)

        if (var.clazz.equals(Boolean.class.getName())){
            if (var.address.startsWith("M"))
            {
                
                 int addr = Integer.parseInt(var.address.substring(1));
                 addr += 2048;
                 var.address = Integer.toString(addr);
            }      
        }

        
        if (var.clazz.equals(Float.class.getName())){
            if (var.address.startsWith("D"))
            {
                 int addr = Integer.parseInt(var.address.substring(1));
                 addr += 4096;
                 var.address = Integer.toString(addr);
            }    
        }
        
        if (var.clazz.equals(Double.class.getName())){
            if (var.address.startsWith("D"))
            {
                 int addr = Integer.parseInt(var.address.substring(1));
                 addr += 4096;
                 var.address = Integer.toString(addr);
            }      
        }
        
        if (var.clazz.equals(Short.class.getName())){
            if (var.address.startsWith("D"))
            {
                 int addr = Integer.parseInt(var.address.substring(1));
                 addr += 4096;
                 var.address = Integer.toString(addr);
            }      
        }
    */
    
}
