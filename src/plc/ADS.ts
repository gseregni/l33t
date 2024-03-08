import { PLC, PLCVariable, PLCVariableType } from "./PLC";



var ads = require('node-ads')

export class ADS extends PLC {
    reconnectTimeout?: NodeJS.Timeout;
    public client : any;

    private onTimeout() {

        this.logger?.warn("ON TIMEOUT");
        if (this.reconnectTimeout)
            return
    
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = undefined
            this.client.end()
            this.client = undefined
            this.start()
        },2000)
    }
   
    public  async start() {
     
        if (!this.client) {
     
            this.logger?.info ("Apertura connessione plc: " + this.id);
            this.client = await ads.connect(this.options,  () => {

                this.status.connected = true;
                this.logger?.info ("Connessione plc: " + this.id +  " OK ");

                this.registerAllVariables();

            });

            this.client.on('notification', (handle:any) => {

                if (this.wsServer) {
                    
                    let v = this.variables.find(v=> v.address == handle.symname)

                    if (v && v.value != handle.value) {
                        //console.log("NOTIFY ", v)
                        v.value = handle.value
                        this.wsServer.plc$.next([v])
                }   }
            });

            this.client.on('error', (e:any) => {
                if (e != null)
                    this.onTimeout()
            })


           
            
        }
         
    }


    private registerAllVariables() {

        console.log("REGISTER")
        this.variables.forEach(v => {
            this.registerVariable(v)
        })
    }


    public unregisterAll(): undefined {
        throw new Error("Method not implemented.");
    }

    public stop(): void {
        
    }

    protected getSize (variable: PLCVariable) : any {
        if (variable.type === PLCVariableType.SHORT)
            return ads.SHORT
       
        if (variable.type === PLCVariableType.STRING)
            return ads.STRING
        if (variable.type === PLCVariableType.BOOL)
            return ads.BOOL
        if (variable.type === PLCVariableType.INTEGER)
            return  ads.INT;
        if (variable.type === PLCVariableType.FLOAT) {
            console.log("FLOAT")
            return  ads.REAL;
        }
        if (variable.type === PLCVariableType.DOUBLE)
            return  ads.LREAL;
        if (variable.type === PLCVariableType.ARRAY_OF_BOOL)
            return ads.array(ads.BOOL,0, variable.size)
        return
    }

    public registerVariable(variable: PLCVariable): Promise<any> {

       let bytes = this.getSize(variable);

       if (bytes == -1)
            throw Error("Tipo di variabile sconosciuta " + variable.type  +  " impossibile stabilire la lunghezza " );

        var h = {
            symname: variable.address,
            bytelength:  bytes ,
            propname: 'value' 
        }

        return new Promise((res,err) => {
            variable.plc = this.id
            variable.name = variable.address + "@" + variable.plc

            this.client.notify(h, (err:any) => {
                if (err)
                    this.logger?.error("Error registrazione variabile client " + variable.name);
                    //this.logger?.error(err);
                variable.handle = h
                
                res(err);
             })
         })

    }


    public write(variables:PLCVariable[], values:string[]) {

        //console.log("WITETE", variables)
        if (!this.client)
        {
            console.error("Cant write")
            return
        }
        variables.forEach((v,i) => {
            v.handle.value = values[i]
        })
        var hs = variables.map(v => v.handle)

        this.logger?.debug("Write: ", hs);

        this.client.multiWrite(hs, (err:any) => {
            //if (err) console.log("ERRORE", err)
            if (err == "timeout") {
                this.onTimeout()
            }

            
          /*   this.read(myHandle, function(err, handle) {
                if (err) console.log(err)
                console.log(handle.value)
                this.end()
            }) */
            return null
        })
    
    }



}


export interface ADSOptions {
    host: string,
    amsNetIdTarget: string,
    amsNetIdSource: string,
    amsPortTarget: number 
}
