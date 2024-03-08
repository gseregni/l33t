
const { Client } = require('pg')





export class PGLogger  {

    constructor(private host:string, private port:number, private user:string, private password:string, private database:string, private table:string) {
 
        const client = new Client({
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password,
            database: this.database
        })

        client.connect()

        client.query('SELECT * from log_aspirazione', (err:any, res:any) => {
            console.log(err ? err.stack : res.rows) // Hello World!
            client.end()
        })
    }

    
    add(message: any): Promise<undefined> {

        return Promise.resolve(undefined)
    }

    
    search(): Promise<undefined> {
        throw new Error("Method not implemented.");
    }

}