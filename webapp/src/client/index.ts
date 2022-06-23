import {
  QueryClient, QueryFunction,
} from 'react-query'

import axios from "axios";

export const queryClient = new QueryClient()

export const client =  axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api",
  headers: {
    "Content-type": "application/json"
  }
});


export const getAllCollections = async () => {
  const { data } = await client.get('/collections')
  return data
}

export const getMyCollections: QueryFunction<any> = async ({ queryKey }) => {
  const [, ownerAddress] = queryKey
  const { data } = await client.get('/collections', {
    params: {
      owner_address: ownerAddress,
    }
  })
  return data
}



export const getMyTickets: QueryFunction<any> = async ({ queryKey }) => {
  const [, ownerAddress] = queryKey
  const { data } = await client.get('/ticket-tokens', {
    params: {
      owner_address: ownerAddress,
    }
  })
  return data
}
