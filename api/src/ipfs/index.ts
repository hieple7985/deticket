import { create } from 'ipfs-http-client';
import { fromString } from 'uint8arrays/from-string';

const INFURA_TOKEN = Buffer.from(`${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`).toString('base64');

export const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + INFURA_TOKEN,
  }
})


export const uploadImageToIPFS = async (imageBase64: string): Promise<{ url: string }> => {
  const content = fromString(imageBase64.split(',')[1], 'base64')
  const cidObj = await ipfs.add(content)
  return {
    url: `ipfs://${cidObj.path}`,
  }
}
