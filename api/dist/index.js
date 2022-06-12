"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const watcher_1 = require("./watcher");
const paginate_1 = require("./utils/paginate");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server');
});
(0, watcher_1.startTezosWatcher)();
app.get('/ticket-tokens', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const where = {};
    const { collection_id, owner_address } = req.query;
    if (collection_id) {
        where.collection = {
            ticket_collection_id: parseInt(collection_id)
        };
    }
    if (owner_address) {
        where.owner_address = owner_address;
    }
    const data = yield db_1.prisma.ticketTokens.findMany(Object.assign(Object.assign({}, (0, paginate_1.getPaginationParams)(req)), { where, select: {
            token_id: true,
            name: true,
            collection: {
                select: {
                    name: true,
                    purchase_amount_mutez: true,
                    owner: true,
                }
            }
        } }));
    const count = yield db_1.prisma.ticketTokens.count({
        where,
    });
    res.json({ data, count });
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
