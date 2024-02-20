import {program} from 'commander';
import chalk from 'chalk';


program
  .option('--first')
  .option('-s, --separator <char>');

// program.parse();

// const options = program.opts();
// const limit = options.first ? 1 : undefined;
// console.log(program.args[0].split(options.separator, limit));



import express from 'express';
const app = express();
import  http from 'http';
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

app.get('/boss', (req, res) => {
  res.sendFile(__dirname + '/boss/index.html');
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});

