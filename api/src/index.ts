import express, { Express, Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import { prisma } from './db';
import { startTezosWatcher } from './watcher';
import { getPaginationParams } from './utils/paginate'
import { Prisma } from '@prisma/client';
import cors from 'cors';
import { uploadImageToIPFS } from './ipfs';
import { v4 as uuidv4 } from 'uuid';
import { verifyUserSignature } from './utils/verifySignature';
import { generateSignaturePayloadBytes } from './utils/generateSignaturePayloadBytes';
import { getLoggerUserAddress } from './utils/getLoggerUser';
import { checkTokenOwnership } from './utils/checkTokenOwnership';
import { getContract } from './tezos';

dotenv.config();

const app: Express = express();
app.use(express.json({ limit: '10mb' }));
const port = process.env.PORT || 4000;
app.use(cors())

app.get('/', (req: Request, res: Response) => {
  res.send('OK');
});

startTezosWatcher()

const apiRouter = Router()

apiRouter.get('/collections', async (req: Request, res: Response) => {
  const where: Prisma.TicketCollectionWhereInput = {}
  const { owner_address } = req.query
  if (owner_address) {
    where.owner = owner_address as string
  }
  const data = await prisma.ticketCollection.findMany({
    ...getPaginationParams(req),
    where,
    select: {
      ticket_collection_id: true,
      name: true,
      owner: true,
      purchase_amount_mutez: true,
      cover_image: true,
      datetime: true,
      max_supply: true,
      supply: true,
      balance_mutez: true,
      ticket_type: true,
      verified: true,
    },
    orderBy: {
      datetime: 'asc',
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
    orderBy: {
      collection: {
        datetime: 'asc',
      }
    },
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
          location: true,
          supply: true,
          balance_mutez: true,
          ticket_type: true,
          verified: true,
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
  try {
    const { url } = await uploadImageToIPFS(req.body.imageBase64)
    res.json({ url })
  } catch (error) {
    res.sendStatus(500)
  }
})


apiRouter.post('/generate-nonce', async (req: Request, res: Response) => {
  const { address } = req.body
  const nonce = uuidv4()
  const userNonce = await prisma.userNonce.upsert({
    where: {
       address,
    },
    create: {
      address,
      nonce,
    },
    update: {
      nonce,
    }
  })
  res.json({
    nonce: userNonce.nonce,
  })
})

apiRouter.post('/auth', async (req: Request, res: Response) => {
  try {
    const { address, signature, publicKey } = req.body
    const userNonce = await prisma.userNonce.findUnique({
      where: {
        address,
      }
    })
    if (!userNonce) {
      return res.sendStatus(401)
    }
    const { nonce } = userNonce
    const payloadBytes = generateSignaturePayloadBytes(nonce)
    const verify = await verifyUserSignature(payloadBytes, signature, publicKey)
    if (!verify) {
      res.sendStatus(401)
    }
    const token = uuidv4()
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 30);
    await prisma.userAccessToken.upsert({
      where: {
        address,
      },
      update: {
        token,
        expires_at,
      },
      create: {
        address,
        token,
        expires_at,
      }
    })
    res.json({ token })
  } catch (error) {
    res.sendStatus(500)
  }
})

apiRouter.post('/issue-ticket-token', async (req: Request, res: Response) => {
  const { tokenId } = req.body
  const loggedUserAddress = await getLoggerUserAddress(req)
  if (!loggedUserAddress) {
    return res.sendStatus(401)
  }
  const isTokenOwner = await checkTokenOwnership(tokenId, loggedUserAddress)
  if (!isTokenOwner) {
    return res.sendStatus(401)
  }
  const ticketAccessToken = await prisma.ticketAccessToken.findFirst({
    where: {
      owner_address: loggedUserAddress,
      ticket_token_id: tokenId,
    }
  })
  if (ticketAccessToken) {
    return res.json({ token: ticketAccessToken.token })
  }
  const token = uuidv4()
  const expires_at = new Date();
  expires_at.setMinutes(expires_at.getMinutes() + 30);
  await prisma.ticketAccessToken.upsert({
    where: {
      ticket_token_id: tokenId,
    },
    update: {
      token: token,
    },
    create: {
      owner_address: loggedUserAddress,
      token: token,
      ticket_token_id: tokenId,
    }
  })
  return res.json({ token })
})

apiRouter.post('/gate-scan-verify', async (req: Request, res: Response) => {
  const loggedUserAddress = await getLoggerUserAddress(req)
  if (!loggedUserAddress) {
    return res.sendStatus(401)
  }
  const { token, ticket_collection_id } = req.body
  const ticketAccessToken = await prisma.ticketAccessToken.findUnique({
    where: {
      token,
    },
  })

  if (!ticketAccessToken) {
    return res.json({
      authorized: false,
      reason: 'Token not found',
    })
  }

  const ticket = await prisma.ticketTokens.findUnique({
    where: {
      token_id: ticketAccessToken.ticket_token_id,
    },
    include: {
      collection: true,
    }
  })

  if (!ticket) {
    return res.json({
      authorized: false,
      reason: 'Could not find ticket',
    })
  }

  if (ticket.collection.owner !== loggedUserAddress) {
    return res.sendStatus(403)
  }

  if (ticket.collection.ticket_collection_id !== ticket_collection_id) {
    return res.json({
      authorized: false,
      reason: 'Unrecognized ticket for this collection',
    })
  }

  const { ticket_token_id } = ticketAccessToken

  const gateScanConfirmationCount = await prisma.gateScanConfirmation.count({
    where: {
      ticket_token_id: ticket_token_id,
    }
  })

  if (ticket.collection.ticket_type === 'ADMIT_ONE' && gateScanConfirmationCount > 0) {
    return res.json({
      authorized: false,
      reason: `Ticket #${ticket_token_id} already used`,
    })
  }

  // Verify On-Chain Ownership
  const contract = await getContract()
  const s = await contract.storage<{ ledger: any }>()
  const onChainOwnerAddress = await s.ledger.get(ticket_token_id)
  if (onChainOwnerAddress !== ticketAccessToken.owner_address) {
    return res.json({
      authorized: false,
      reason: 'Ownership verification failed',
    })
  }

  // Create Gate Scan Confirmation
  await prisma.gateScanConfirmation.create({
    data: {
      address: onChainOwnerAddress,
      ticket_token_id: ticketAccessToken.ticket_token_id,
      entry_at: new Date(),
    }
  })

  return res.json({
    authorized: true,
    token_id: ticket.token_id,
  })
})

app.use('/api', apiRouter)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
