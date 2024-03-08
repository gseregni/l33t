
import express from "express" ;
import { createServer, IncomingMessage, ServerResponse } from 'http';




const app:express.Application = express();
const httpServer = createServer(app);

const port = 1337; // default port to listen

// define a route handler for the default home page

app.use(express.static(__dirname + "/public"));

app.use(express.json());



// const wss = new WSServer(httpServer)


// start the Express server
httpServer.listen( port, () => {
    console.log( `server started at http://0.0.0.0:${ port }` );
} );


try {
    // loadGali()
    //load()
} catch (e) {
    console.error(e);
}

