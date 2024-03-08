import { ReplaySubject } from "rxjs";
import { PLC, PLCVariable, PLCVariableType } from "./PLC";
var nodeS7 = require('nodeS7')


var variables = {
    EMERGENCY: 'DB1000,X0.0',
    STATO: 'DB1000,INT0',
    STATO2: 'DB1000,INT1',
    CORSIA_APERTA: 'DB1000,INT4',
    RICHIESTA_1: 'DB1001,X0.0',
    PRESTART: 'DB1001,X0.7',
};


export class S7Options {

}
export class S7 extends PLC {
    client: any;
    interval: NodeJS.Timer | undefined;
   
    constructor (public options : S7Options){
        super();
        this.client = new nodeS7()
    }
    
    public start(reconnect: unknown): void {
        this.client.initiateConnection(
            { port: 102, host: '192.168.30.20', rack: 0, slot: 0, debug: true }, 
            (err:any) => {
                console.log(err)
            }); 

        // todo - wait to read and only after reschedule a new read
        this.interval = setInterval(() => {
            this.client.readAllItems((err:any, values:any) => {
                var delta:PLCVariable[] = []
                Object.keys(values).forEach((k:string) => {
                    //console.log("values", values)
                    var x = this.variables.find(x => x.address == k)
                    if (x) {
                        x.value = values[k]
                        delta.push(x)
                    }
                })
                this.wsServer?.plc$.next(delta)
            })
        },300)
    }


    public stop(): void {

    }
    


    public unregisterAll(): undefined {
        throw new Error("Method not implemented.");
    }

    public registerVariable(variable: PLCVariable): Promise<PLCVariable> {

        let v = Object.assign(variable)
        //let v = new PLCVariable(variable.type)
        v.observable = new ReplaySubject()

        this.variables.push(v)
        this.client.addItems([v.address])

        return Promise.resolve<PLCVariable>(variable)
        // conn.removeItems(['TEST2', 'TEST3']); // We could do this.
        // conn.writeItems(['TEST5', 'TEST6'], [ 867.5309, 9 ], valuesWritten); // You can write an array of items as well.
        // conn.writeItems('TEST7', [666, 777], valuesWritten); // You can write a single array item too.
       // conn.writeItems('TEST3', true, valuesWritten); // This writes a single boolean item (one bit) to true
        /* conn.readAllItems((err, values) => {
          console.log("values", values)
        });
        conn.writeItems("RICHIESTA_1", true,(x) => {

        })
 */       // conn.writeItems("PRESTART", true)
        
    }


    public write(vs:PLCVariable[], values:any[]): undefined {

        if (vs.length != values.length) {
            console.error("Variables and valus should have the same lenght")
            return
        }

       // console.log("write itesm", v.address, value)
       // console.log(v.address, typeof(value))
       let addresses = vs.map(v => v.address)
        this.client.writeItems(addresses, values, () => {
            console.log("RITE")
        })
        //this.client.writeItems([v.address],value)
        return
     }
     

}


 








      
        



        