import { NextFunction } from "express"
import  { Request, Response } from "express";
import { Logger } from "winston";
import { LoggerService } from "../logger/Logger";
import { PLCUtils } from "../plc/PLCUtils";
import { WSServer } from "../websocket/WSServer";


const logger : Logger = LoggerService.create("VALMEC_ASPIRZIONE");

export class VALMEC_ASPIRAZIONE  {
    

      
    protected m : boolean[] = Array.from({length: 19}, i => i = false);
    protected run : boolean = false;
    protected error : boolean = false;
    
    protected speed : number = 0;
     

   


    constructor (protected wss : WSServer){

    }


    public start() {

        logger.info("Start");

        PLCUtils.poll(() => this.calcolaStatoBocchette(), 30000);


        this.wss.PLCManager?.findVariable("VALMEC1","M513")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        this.wss.PLCManager?.findVariable("VALMEC1","M514")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        
        this.wss.PLCManager?.findVariable("VALMEC2","M515")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        this.wss.PLCManager?.findVariable("VALMEC2","M513")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        
        this.wss.PLCManager?.findVariable("VALMEC3","M513")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        this.wss.PLCManager?.findVariable("VALMEC3","M514")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        
        this.wss.PLCManager?.findVariable("VALMEC4","M513")?.observable?.subscribe( r => this.calcolaStatoBocchette());
       this.wss.PLCManager?.findVariable("VALMEC4","M514")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        this.wss.PLCManager?.findVariable("VALMEC4","M515")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        
        this.wss.PLCManager?.findVariable("VALMEC5","M513")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        this.wss.PLCManager?.findVariable("VALMEC5","M515")?.observable?.subscribe( r => this.calcolaStatoBocchette());
        this.wss.PLCManager?.findVariable("VALMEC5","M516")?.observable?.subscribe( r => this.calcolaStatoBocchette());


      

    }





    public calcolaStatoBocchette(){


        try {

            logger.info("Calcolo stato bocchette");

            if (!this.wss.PLCManager?.get("ASPIRAZIONE")?.status.connected){
                logger.warn("PLC aspirazione disconnesso");
                return;
            }
              


            if (!this.wss.PLCManager){
                logger.warn("PLCManager sconosciuto");
                return;
            }
            


            this.run =  this.wss.PLCManager?.getValueBool("VALMEC1","M0");
            this.speed =  this.wss.PLCManager?.getValueShort("VALMEC1","D420");
            this.error = false;

            this.m[2] = this.wss.PLCManager?.getValueBool("VALMEC1","M513");
            this.m[3] = this.m[4] = this.wss.PLCManager?.getValueBool("VALMEC1","M514");
            
            this.m[7] = this.m[8] = this.wss.PLCManager?.getValueBool("VALMEC2","M515");
            this.m[5] = this.m[6] = this.wss.PLCManager?.getValueBool("VALMEC2","M513");
            
            this.m[9]=this.wss.PLCManager?.getValueBool("VALMEC3","M513");
            this.m[10] = this.m[11] = this.wss.PLCManager?.getValueBool("VALMEC3","M514");
            
            this.m[12] = this.wss.PLCManager?.getValueBool("VALMEC4","M513");
            this.m[13] = this.wss.PLCManager?.getValueBool("VALMEC4","M514");
            this.m[14] = this.m[15] = this.wss.PLCManager?.getValueBool("VALMEC4","M515");
            
            this.m[16] = this.m[17]= this.wss.PLCManager?.getValueBool("VALMEC5","M513");
            this.m[18] = this.wss.PLCManager?.getValueBool("VALMEC5","M515");
            this.m[19] = this.wss.PLCManager?.getValueBool("VALMEC5","M516");

            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_1", this.m[2] || this.m[3] || this.m[4]);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_2", this.m[6] || this.m[5] || this.m[9]);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_3", this.m[7] || this.m[8] || this.m[12]);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_4", this.m[11] || this.m[10] || this.m[13]);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_5", this.m[15] || this.m[14] || this.m[18]);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_6", this.m[16] || this.m[17] || this.m[18]);

        } catch (e){
            console.error(e);
            logger.error("Errore calcolo stato bocchette", e);

            this.run = false;
            this.error = true;
            this.speed = 0;

            this.chiudiBocchette();
        }

      
       

    }

    public chiudiBocchette(){
        try {
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_1", false);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_2", false);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_3", false);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_4", false);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_5", false);
            this.wss.PLCManager?.writeBool("ASPIRAZIONE","MAIN.RD_Levigatrice_Serranda_6", false);
        } catch (e){
            logger.error(e);
        }
       
    }

   

}