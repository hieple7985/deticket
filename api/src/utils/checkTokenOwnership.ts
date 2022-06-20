import { getContract } from "../tezos"

export const checkTokenOwnership = async (tokenId: number, address: string): Promise<boolean> => {
  const contract = await getContract()
  const storage = await contract.storage<{ ledger: any }>()
  const tokenOwner = await storage.ledger.get(tokenId)
  console.log({ tokenOwner })
  return tokenOwner === address
}
