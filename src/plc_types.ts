

export interface PLCVariableRequest {
    uri: string
    plcName : string,
    addess : string,
    name : string,
    value : any,
}


export interface PLCVariablesRequest {
    variables : PLCVariableRequest[];
}