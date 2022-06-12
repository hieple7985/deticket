import express, { Request } from 'express';


type PrismaPaginationFilter = { skip?: number, take?: number }

export const getPaginationParams = (req: Request): PrismaPaginationFilter=> {
  const params: PrismaPaginationFilter = {}
  const { limit, skip } = req.query
  if (req.query.limit) {
    params.take = parseInt(limit as string)
  }
  if (req.query.skip) {
    params.skip = parseInt(skip as string)
  }
  return params
}
