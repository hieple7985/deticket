import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { OperationContent, TezosToolkit } from '@taquito/taquito';
import { prisma } from './db';
import { startTezosWatcher } from './watcher';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});


startTezosWatcher()

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});


