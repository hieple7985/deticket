import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { prisma } from './db';
import { startTezosWatcher } from './watcher';
import { getPaginationParams } from './utils/paginate'
import { Prisma } from '@prisma/client';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});


startTezosWatcher()


app.get('/ticket-tokens', async (req: Request, res: Response) => {
  const where: Prisma.TicketTokensWhereInput = {}
  const { collection_id, owner_address } = req.query
  if (collection_id) {
    where.collection = {
      ticket_collection_id: parseInt(collection_id as string)
    }
  }
  if (owner_address) {
    where.owner_address = owner_address as string
  }
  const data = await prisma.ticketTokens.findMany({
    ...getPaginationParams(req),
    where,
    select: {
      token_id: true,
      name: true,
      collection: {
        select: {
          name: true,
          purchase_amount_mutez: true,
          owner: true,
        }
      }
    }
  })
  const count = await prisma.ticketTokens.count({
    where,
  })
  res.json({ data, count })
})


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});


