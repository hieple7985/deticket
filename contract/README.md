# deTicket Tezos Smart Contract

This directory contains the multi-asset FA2 smart contract written in SmartPy used by deTicket.

### Requirements
- Python 3
- SmartPy
- Tezos Account (Testnet or Mainnet) Private Key

## Instalation

### 1 - Install SmartPy
Make sure you have installed the [SmartPy CLI](https://smartpy.io/docs/cli/) by running the command below:

```sh
~/smartpy-cli/SmartPy.sh --version
```

### 2 - Create the .env file with your contract settings

Example:

```conf
RPC_URL=https://rpc.ithacanet.teztnets.xyz
ACCOUNT_PRIVATE_KEY=<YOUR_DEPLOYER_ACCOUNT_PRIVATE_KEY>
ADMIN_ADDRESS=<THE_CONTRACT_ADMIN_ADDRESS>
METADATA_URL=https://example.com/metadata
```

### 3 - Compile and deploy the Smart Contract
To build and deploy the smart contract, you just need to run the command below:

```sh
RPC_URL=https://rpc.ithacanet.teztnets.xyz \
ACCOUNT_PRIVATE_KEY=YOUR_TEZOS_PRIVATE_KEY \
make deploy 
```


### 4 - Get the deployed contract address
If everything goes well, you should see a message like this:

```
...
[INFO] - Using RPC https://rpc.ithacanet.teztnets.xyz...
[INFO] - Contract KT1FacG5WyhJqcTRHcHmaewQt4PpS1nuiFHE originated!!!
```

Once you have this address, you can set it on webapp which will interact with this contract.

