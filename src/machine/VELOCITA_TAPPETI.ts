import { NextFunction } from "express"
import  { Request, Response } from "express";
import { Logger } from "winston";
import { LoggerService } from "../logger/Logger";
import { PLCUtils } from "../plc/PLCUtils";
import { WSServer } from "../websocket/WSServer";


const logger : Logger = LoggerService.create("VELOCITA_TAPPETI");

export class VELOCITA_TAPPETI  {
    

    constructor (protected wss : WSServer){
        
    }


    public start() {
        logger.info("Start");

        PLCUtils.poll(() => this.velocita(), 1000);
    }


    public velocita() {
        try {
   
            let speedValmec  = this.wss.PLCManager?.getValueShort("VALMEC1","D420");

            let KVidali =  12.8 /  5.0;
			let KInput = 5.0 /  4.7;
			let KOutput = 3076.0 /  4.5;
			let KValmec = 5.0 /  4.7;
			
			if (speedValmec) {

                let speedMaster = 1 / ( KValmec / speedValmec);
		
                try {
                    this.wss.PLCManager?.writeShort("RULLIERA","RULLI_CENTRO_TAGLI.RD_Levigatrice_Act_Speed",(KInput * speedMaster));
                } catch (ex) {
                    logger.error( ex); 
                }

                try {
                    this.wss.PLCManager?.writeDouble("ZONA3","EXCHANGE_HMI.Vidali_Vel",(speedValmec * 16.67));
                } catch ( ex) {
                    logger.error(ex); 
                }


                try {
                    this.wss.PLCManager?.writeDouble("VIDALI","Override_Trasp",( KVidali * speedMaster)); 
                } catch ( ex) {
                    logger.error(ex);			
                }
            }
			
			

		

        }catch (e) {
            logger.error("Error ciclo velocità ", e);
        }
       
    }

   

}