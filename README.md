# deTicket - Decentralized Tickets


## About
This project was created for the "User-Friendly NFT Ticketing System For Cultural Institutions" hackathon sponsored by Tezos.

- [📹 Video Presentation](https://youtu.be/Jv7PwvFp6Ms)
- [📕 Technical Overview Presentation PDF](https://github.com/strandgeek/deticket/raw/main/presentation/deTicket%20Presentation.pdf)
- [⚡️Demo](https://deticket.strandgeek.com/)
- [📄 Smart Contract](https://better-call.dev/ithacanet/KT1GUHb2PJsWATBsbmTxZjZ9bNgzhAySCTfF)

## Tech Stack
- Tezos Blockchain
- dApp: React + Typescript + Tezos Taquito using Beacon
- Indexer: NodeJS + Typescript + Postgres
- Smart Contract: SmartPy using FA2 lib


## Preview
![dApp Screenshot](https://github.com/strandgeek/deticket/raw/main/presentation/screenshot.png)


## Quickstart

### Deploying the Smart Contract

To deploy the Smart Contract, go to the contract folder and configure a `.env` file with the following env vars:

```
RPC_URL=https://ithacanet.smartpy.io/
ACCOUNT_PRIVATE_KEY=<YOUR_TEZOS_PRIVATE_KEY>
ADMIN_ADDRESS=<THE_ADMIN_ADDRESS>
METADATA_URL=https://example.com/metadata
```
The Admin does not necessarily need the same account as the deployer and he has the following powers:
- Withdraw the Smart Contract balance
- Check/Uncheck a ticket collection as verified

## Building the API

On the `api` folder create a `.env` file with the following content:

```
CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/deticket?schema=public"
INFURA_PROJECT_ID=foo
INFURA_PROJECT_SECRET=bar
```

Use the same contract address that you deployed on the first step.

Also, for build you have to install npm packages and run build:

```
npm install
npm run build
```

And to start it for production just run `npm run start`


## Building the Webapp

On the `webapp` folder create a `.env` file with the following content:

```
REACT_APP_CONTRACT_ADDRESS=<YOUR_CONTRACT_ADDRESS>
REACT_APP_API_BASE_URL=https://yourdomain.com/api
```

Use the same contract address that you deployed on the first step.

Also, for build you have to install npm packages and run build:

```
npm install
npm run build
```

After that, you'll have a `build` folder that you can use to upload to any static host.
