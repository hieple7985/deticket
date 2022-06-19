/*
  Wait for transaction to be synced into the api database.
  This method makes polling on API within a given timeout
*/

import { client } from "../client"

interface WaitForTxOptions {
  pollingIntervalMs?: number
  timeoutMs?: number 
}

export const waitForTx = async (txHash: string, opts?: WaitForTxOptions): Promise<void> => {
  const { pollingIntervalMs = 1000, timeoutMs = 120000 } = opts || {}
  return new Promise(async (resolve, reject) => {
    const pollingInterval = setInterval(async () => {
      try {        
        const res = await client.get(`/transactions/${txHash}`)
        if (res.status === 200) {
          clearInterval(pollingInterval)
          return resolve()
        }
      } catch (error) {
        console.log(`txHash=${txHash} not synced on API yet... Waiting...`)
      }
    }, pollingIntervalMs)
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      return reject()
    }, timeoutMs)
  })
}
