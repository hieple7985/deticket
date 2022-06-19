import express, { Express, Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import { prisma } from './db';
import { startTezosWatcher } from './watcher';
import { getPaginationParams } from './utils/paginate'
import { Prisma } from '@prisma/client';
import cors from 'cors';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;
app.use(cors())

app.get('/', (req: Request, res: Response) => {
  res.send('OK');
});

startTezosWatcher()

const apiRouter = Router()

apiRouter.get('/collections', async (req: Request, res: Response) => {
  const data = await prisma.ticketCollection.findMany({
    ...getPaginationParams(req),
    select: {
      ticket_collection_id: true,
      name: true,
      owner: true,
      purchase_amount_mutez: true,
      cover_image: true,
      datetime: true,
      max_supply: true,
    }
  })
  const count = await prisma.ticketCollection.count()
  res.json({ data, count })
})


apiRouter.get('/ticket-tokens', async (req: Request, res: Response) => {
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
          ticket_collection_id: true,
          name: true,
          purchase_amount_mutez: true,
          owner: true,
          cover_image: true,
          datetime: true,
          max_supply: true,
        }
      }
    }
  })
  const count = await prisma.ticketTokens.count({
    where,
  })
  res.json({ data, count })
})

apiRouter.get('/transactions/:hash', async (req: Request, res: Response) => {
  try {    
    const tx = await prisma.transaction.findFirst({
      where: {
        hash: req.params.hash,
      },
      select: {
        hash: true,
        source: true,
      }
    })
    if (!tx) {
      return res.sendStatus(404)
    }
    return res.json(tx)
  } catch (error) {
    res.sendStatus(500)
  }
  res.sendStatus(500)
})

apiRouter.post('/upload-image', async (req: Request, res: Response) => {
  
})

app.use('/api', apiRouter)


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});


