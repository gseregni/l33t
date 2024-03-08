
export class PLCUtils {

    public static poll( funct : ()  => void , ts : number) : void{
         funct();
         setTimeout(() => PLCUtils.poll(funct, ts), ts);
    }

}