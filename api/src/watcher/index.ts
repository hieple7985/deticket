import { prisma } from "../db";
import { getContract, tezos } from "../tezos";
import colors from 'colors'
import BigNumber from 'bignumber.js';

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

const syncSingleToken = async (storage: any, tokenId: number) => {
  const owner = await storage.ledger.get(tokenId)
  console.log(`Token Updated. tokenId=${tokenId} owner=${owner}`)
  await prisma.ticketTokens.upsert({
    create: {
      token_id: tokenId,
      owner_address: owner,
    },
    update: {
      owner_address: owner,
    },
    where: {
      token_id: tokenId,
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
  const startToken = latestSyncedToken+1
  const syncTokensList = []
  for (let tokenId=startToken; tokenId < latestContractToken; tokenId++) {
    syncTokensList.push(tokenId)
  }
  await syncMultipleTokens(syncTokensList)
}

export const startTezosWatcher = () => {
  syncNewTokens()
  console.log(colors.cyan('Tezos Smart Contract watcher started!'))
  console.log(colors.cyan(`Listening for contract transactions... (contract=${CONTRACT_ADDRESS})`))
  tezos.stream.subscribeOperation({destination: CONTRACT_ADDRESS || ''}).on('data', (async (data) => {
    const tData = data as unknown as TransactionData
    const { hash, source, parameters: { entrypoint, value } } = tData
    console.log(`[Watcher] Transaction Received (hash=${hash} source=${source} entrypoint=${entrypoint})`)
    if (entrypoint === 'transfer') {
      const transferedTokens = getTransferedTokenIds(value)
      await syncMultipleTokens(transferedTokens)
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
  }));
}
