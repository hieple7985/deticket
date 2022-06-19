import { prisma } from "../db";
import { getContract, tezos } from "../tezos";
import colors from 'colors'
import BigNumber from 'bignumber.js';
import { bytes2Char } from '@taquito/utils'
import { PollingSubscribeProvider } from "@taquito/taquito";


const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

interface TransactionData {
  kind: string;
  hash: string;
  source: string;
  parameters: {
    entrypoint: string;
    value: any;
  }
}

const getTransferedTokenIds = (transferValue: any): number[] => {
  const tokenIds: number[] = []
  transferValue.forEach((batchRootItem: any) => {
    batchRootItem.args[1].forEach((batchItem: any) => {
      const tokenIdStr = batchItem.args[1].args[0].int
      tokenIds.push(parseInt(tokenIdStr))
    })
  })
  return tokenIds
}

const getLatestContractToken = async (): Promise<number> => {
  const contract = await getContract()
  const storage = await contract.storage<{ last_token_id: BigNumber }>()
  return storage.last_token_id.toNumber()
}

const getLatestSyncedToken = async (): Promise<number> => {
  const ticketToken = await prisma.ticketTokens.findFirst({
    orderBy: [{
      token_id: 'desc',
    }]
  })
  return ticketToken ? ticketToken.token_id : -1
}

const getLatestContractCollection = async (): Promise<number> => {
  const contract = await getContract()
  const storage = await contract.storage<{ last_ticket_collection_id: BigNumber }>()
  return storage.last_ticket_collection_id.toNumber()
}

const getLatestSyncedCollection = async (): Promise<number> => {
  const ticketToken = await prisma.ticketCollection.findFirst({
    orderBy: [{
      ticket_collection_id: 'desc',
    }]
  })
  return ticketToken ? ticketToken.ticket_collection_id : -1
}

const syncSingleToken = async (storage: any, tokenId: number) => {
  const owner = await storage.ledger.get(tokenId)
  console.log(`Token Updated. tokenId=${tokenId} owner=${owner}`)
  const collectionIdBN: BigNumber = await storage.token_ticket_collections.get(tokenId)
  const tokenMetadata = await storage.token_metadata.get(tokenId)
  console.log(tokenMetadata)
  const tokenName = bytes2Char(tokenMetadata.token_info.get('name'))
  // const tokenName = tokenMetadata.get('token_info').name
  const collection = await syncCollection(storage, collectionIdBN.toNumber())
  await prisma.ticketTokens.upsert({
    create: {
      token_id: tokenId,
      name: tokenName,
      owner_address: owner,
      collectionId: collection.id,
    },
    update: {
      name: tokenName,
      owner_address: owner,
    },
    where: {
      token_id: tokenId,
    }
  })
}

const syncCollection = async (storage: any, collectionTokenId: number) => {
  const collection = await storage.ticket_collections.get(collectionTokenId)
  const { name, owner } = collection
  const purchase_amount_mutez = collection.purchase_amount_mutez.toNumber()
  const max_supply = collection.max_supply.toNumber()
  const datetime = collection.datetime.toNumber()
  return prisma.ticketCollection.upsert({
    create: {
      ticket_collection_id: collectionTokenId,
      name,
      owner,
      purchase_amount_mutez,
      cover_image: collection.cover_image,
      datetime: new Date(datetime*1000),
      max_supply,
    },
    update: {
      name,
      owner,
      purchase_amount_mutez,
    },
    where: {
      ticket_collection_id: collectionTokenId,
    }
  })
}

const syncMultipleTokens = async (tokenList: number[]) => {
  const contract = await getContract()
  const storage = await contract.storage<{ ledger: any }>()
  await Promise.all(tokenList.map(tokenId => syncSingleToken(storage, tokenId)))
}

const syncNewTokens = async () => {
  const latestContractToken = await getLatestContractToken()
  const latestSyncedToken = await getLatestSyncedToken()
  if (latestSyncedToken >= latestContractToken) {
    console.log('Nothing to sync')
    return
  }
  const startToken = latestSyncedToken + 1
  const syncTokensList = []
  for (let tokenId = startToken; tokenId < latestContractToken; tokenId++) {
    syncTokensList.push(tokenId)
  }
  await syncMultipleTokens(syncTokensList)
}

const syncMultipleCollections = async (collectionsList: number[]) => {
  const contract = await getContract()
  const storage = await contract.storage<{ ledger: any }>()
  await Promise.all(collectionsList.map(collectionId => syncCollection(storage, collectionId)))
}

const syncNewCollections = async () => {
  const latestContractCollection = await getLatestContractCollection()
  const latestSyncedCollection = await getLatestSyncedCollection()
  if (latestSyncedCollection >= latestContractCollection) {
    console.log('Nothing to sync')
    return
  }
  const startToken = latestSyncedCollection + 1
  const syncCollectionsList = []
  for (let tokenId = startToken; tokenId < latestContractCollection; tokenId++) {
    syncCollectionsList.push(tokenId)
  }
  await syncMultipleCollections(syncCollectionsList)
}

export const startTezosWatcher = () => {
  syncNewCollections()
  syncNewTokens()
  console.log(colors.cyan('Tezos Smart Contract watcher started!'))
  console.log(colors.cyan(`Listening for contract transactions... (contract=${CONTRACT_ADDRESS})`))
  tezos.setStreamProvider(tezos.getFactory(PollingSubscribeProvider)({
    shouldObservableSubscriptionRetry: true,
    pollingIntervalMilliseconds: 5000,
  }));
  const sub = tezos.stream.subscribeOperation({ destination: CONTRACT_ADDRESS || '' })

  sub.on('data', (async (data) => {
    const tData = data as unknown as TransactionData
    const { hash, source, parameters: { entrypoint, value } } = tData
    console.log(`[Watcher] Transaction Received (hash=${hash} source=${source} entrypoint=${entrypoint})`)
    if (entrypoint === 'transfer') {
      const transferedTokens = getTransferedTokenIds(value)
      await syncMultipleTokens(transferedTokens)
    } else if (entrypoint === 'create_ticket_collection')  {
      await syncNewCollections()
    } else if (entrypoint === 'purchase_ticket') {
      await syncNewTokens()
    }
    await prisma.transaction.create({
      data: {
        hash,
        source,
        parameters_entrypoint: entrypoint,
        parameters_value: value,
      }
    })
  }))
}
