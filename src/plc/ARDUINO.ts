import { PLC, PLCVariable } from "./PLC";
import { Board, Led, Pin, Ping, Proximity, Servo } from 'johnny-five';
const keypress = require("keypress");

export class Arduino extends PLC {
    client: any;

    pos:number = 0
    servo: Servo | undefined;



    writePos(pos:number) {

        console.log("THIS serv", this.servo, pos)
        this.servo?.to(pos)
    }

    

    public start(reconnect: boolean): void {

    


        console.log("start")
        // var five = require('johnny-five');
        var board = new Board();


        process.stdin.on('keypress', (str, key) => {

            console.log("keypress")
            if (key.name === 'a') {
                this.pos = this.pos > 0 ? this.pos - 6 : 0
                this.writePos(this.pos)
            }

            if (key.name === 's') {
                this.pos = this.pos < 180 ? this.pos + 6 : 180
                this.writePos(this.pos)
            }
            
            // if (key.ctrl && key.name === 'c') {
            //   process.exit();
            // } else {
            //   console.log(`You pressed the "${str}" key`);
            //   console.log();
            //   console.log(key);
            //   console.log();
            // }
          });
          keypress(process.stdin);
          console.log("keypress", keypress)
          process.stdin.setRawMode(true);
          process.stdin.resume();



        board.on('ready', async () => {
            var leds: Led[] = []
            // leds.push(new Led(9))
            // leds.push(new Led(10))
            // leds.push(new Led(11))
            // leds.forEach(l => l.on())
            
            // echoPin 2 // attach pin D2 Arduino to pin Echo of HC-SR04
            // // // #define trigPin 3
            // let trig = new Pin({
            //     pin: 3,
            //     type: "digital"
            // });

            // let echo = new Pin({
            //     pin: 2,
            //     type: "digital"
            // });


            
            var pos = 0
            var proximity = new Proximity({
                controller: "HCSR04",
                pin: 3
              });
              this.servo = new Servo(6);

            //   proximity.on("data", x=>  {
            //       var pos = ((Number(x.cm) / 600) * 180)
            //       console.log(x.cm + "cm", pos);


            //     if ( pos < 0 )
            //         pos = 0
            //     else if (pos > 180)
            //         pos = 180

            //     servo.to(pos)
                
            //   });





              

            
            //   proximity.on("change", function() {
            //     console.log("The obstruction has moved.");
            //   });



             


        });

    }


                    // await new Promise(f => setTimeout(f, 1000));
                // await new Promise(f => setTimeout(f, 10));

                // await new Promise(f => setTimeout(f, 10));


              



                // await new Promise(f => setTimeout(f, 2));
                // // delayMicroseconds(2);
                // // Sets the trigPin HIGH (ACTIVE) for 10 microseconds
                // trig.high()
                // // digitalWrite(trigPin, HIGH);
                // await new Promise(f => setTimeout(f, 10));
                // // delayMicroseconds(10);
                // trig.low()
                // // digitalWrite(trigPin, LOW);
                


                // // Reads the echoPin, returns the sound wave travel time in microseconds
                // duration = pulseIn(echoPin, HIGH);
                // // Calculating the distance
                // distance = duration * 0.034 / 2; // Speed of sound wave divided by 2 (go and back)
                // // Displays the distance on the Serial Monitor
                // Serial.print("Distance: ");
                // Serial.print(distance);
                // Serial.println(" cm");
            // while(true) {


            //     leds.forEach(l => l.fadeOut(500))
            //     await new Promise(f => setTimeout(f, 1000));

            //     leds.forEach(l => l.fadeIn(500))
            //     await new Promise(f => setTimeout(f, 1000));

            // //     leds.forEach(l => l.on())
            // //     await(1000)
            // }
    // }

    public stop(): void {
        throw new Error("Method not implemented.");
    }
    public registerVariable(variable: PLCVariable): Promise<PLCVariable> {
        throw new Error("Method not implemented.");
    }
    public unregisterAll(): undefined {
        throw new Error("Method not implemented.");
    }
    public write(variabiles: PLCVariable[], values: any[]): void {
        throw new Error("Method not implemented.");
    }
    
}

