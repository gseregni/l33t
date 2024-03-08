

import { createLogger, transports, format, Logger } from "winston";



export class LoggerService {

    public static create(s : string) : Logger{

        return   createLogger({
            transports: [new transports.Console()],
            level: "debug",
            format: format.combine(
              format.colorize(),
              format.timestamp(),
              format.errors({ stack: true }),
              format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label', 'logger'] }),
       
              format.printf(({ timestamp, level, message, metadata }) => {
                return `[${timestamp}]  ${s} ${level}: ${message} ${metadata ? (typeof metadata === 'string' ? metadata :  JSON.stringify(metadata) ) : ''}`;
              })
            )
         
          });
    }
}


