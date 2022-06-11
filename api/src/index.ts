import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { TezosToolkit } from '@taquito/taquito';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;
const contract = process.env.CONTRACT_ADDRESS;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

const tezos = new TezosToolkit('https://ithacanet.smartpy.io/');

tezos.stream.subscribeOperation({destination: contract || ''}).on('data', (data => {
  console.log(data);
}));

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
