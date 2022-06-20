import { Request } from "express";
import { prisma } from "../db";

export const getLoggerUserAddress = async (req: Request): Promise<string | null> => {
  if (!req.headers.authorization) {
    return null
  }
  const parts = req.headers.authorization.split(' ')
  if (parts.length !== 2) {
    return null
  }
  const token = parts[1];
  if (!token || token === '') {
    return null
  }
  const userAccessToken = await prisma.userAccessToken.findUnique({
    where: {
      token,
    }
  })
  if (!userAccessToken) {
    return null
  }
  return userAccessToken.address
}
