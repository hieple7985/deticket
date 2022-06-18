import {
  QueryClient, QueryFunction,
} from 'react-query'

import axios from "axios";

export const queryClient = new QueryClient()

export const client =  axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-type": "application/json"
  }
});


export const getAllCollections = async () => {
  const { data } = await client.get('/collections')
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
