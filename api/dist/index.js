"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const taquito_1 = require("@taquito/taquito");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
const contract = process.env.CONTRACT_ADDRESS;
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
const tezos = new taquito_1.TezosToolkit('https://ithacanet.smartpy.io/');
tezos.stream.subscribeOperation({ destination: contract || '' }).on('data', (data => {
    console.log(data);
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
