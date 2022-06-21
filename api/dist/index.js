"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importStar(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const watcher_1 = require("./watcher");
const paginate_1 = require("./utils/paginate");
const cors_1 = __importDefault(require("cors"));
const ipfs_1 = require("./ipfs");
const uuid_1 = require("uuid");
const verifySignature_1 = require("./utils/verifySignature");
const generateSignaturePayloadBytes_1 = require("./utils/generateSignaturePayloadBytes");
const getLoggerUser_1 = require("./utils/getLoggerUser");
const checkTokenOwnership_1 = require("./utils/checkTokenOwnership");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '10mb' }));
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('OK');
});
(0, watcher_1.startTezosWatcher)();
const apiRouter = (0, express_1.Router)();
apiRouter.get('/collections', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const where = {};
    const { owner_address } = req.query;
    if (owner_address) {
        where.owner = owner_address;
    }
    const data = yield db_1.prisma.ticketCollection.findMany(Object.assign(Object.assign({}, (0, paginate_1.getPaginationParams)(req)), { where, select: {
            ticket_collection_id: true,
            name: true,
            owner: true,
            purchase_amount_mutez: true,
            cover_image: true,
            datetime: true,
            max_supply: true,
            supply: true,
            balance_mutez: true,
        } }));
    const count = yield db_1.prisma.ticketCollection.count();
    res.json({ data, count });
}));
apiRouter.get('/ticket-tokens', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                    ticket_collection_id: true,
                    name: true,
                    purchase_amount_mutez: true,
                    owner: true,
                    cover_image: true,
                    datetime: true,
                    max_supply: true,
                    location: true,
                    supply: true,
                    balance_mutez: true,
                }
            }
        } }));
    const count = yield db_1.prisma.ticketTokens.count({
        where,
    });
    res.json({ data, count });
}));
apiRouter.get('/transactions/:hash', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tx = yield db_1.prisma.transaction.findFirst({
            where: {
                hash: req.params.hash,
            },
            select: {
                hash: true,
                source: true,
            }
        });
        if (!tx) {
            return res.sendStatus(404);
        }
        return res.json(tx);
    }
    catch (error) {
        res.sendStatus(500);
    }
    res.sendStatus(500);
}));
apiRouter.post('/upload-image', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { url } = yield (0, ipfs_1.uploadImageToIPFS)(req.body.imageBase64);
        res.json({ url });
    }
    catch (error) {
        res.sendStatus(500);
    }
}));
apiRouter.post('/generate-nonce', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { address } = req.body;
    const nonce = (0, uuid_1.v4)();
    const userNonce = yield db_1.prisma.userNonce.upsert({
        where: {
            address,
        },
        create: {
            address,
            nonce,
        },
        update: {
            nonce,
        }
    });
    res.json({
        nonce: userNonce.nonce,
    });
}));
apiRouter.post('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, signature, publicKey } = req.body;
        const userNonce = yield db_1.prisma.userNonce.findUnique({
            where: {
                address,
            }
        });
        if (!userNonce) {
            return res.sendStatus(401);
        }
        const { nonce } = userNonce;
        const payloadBytes = (0, generateSignaturePayloadBytes_1.generateSignaturePayloadBytes)(nonce);
        const verify = yield (0, verifySignature_1.verifyUserSignature)(payloadBytes, signature, publicKey);
        if (!verify) {
            res.sendStatus(401);
        }
        const token = (0, uuid_1.v4)();
        const expires_at = new Date();
        expires_at.setMinutes(expires_at.getMinutes() + 30);
        yield db_1.prisma.userAccessToken.upsert({
            where: {
                address,
            },
            update: {
                token,
                expires_at,
            },
            create: {
                address,
                token,
                expires_at,
            }
        });
        res.json({ token });
    }
    catch (error) {
        res.sendStatus(500);
    }
}));
apiRouter.post('/issue-ticket-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenId } = req.body;
    const loggedUserAddress = yield (0, getLoggerUser_1.getLoggerUserAddress)(req);
    if (!loggedUserAddress) {
        return res.sendStatus(401);
    }
    const isTokenOwner = yield (0, checkTokenOwnership_1.checkTokenOwnership)(tokenId, loggedUserAddress);
    if (!isTokenOwner) {
        return res.sendStatus(401);
    }
    const ticketAccessToken = yield db_1.prisma.ticketAccessToken.findFirst({
        where: {
            owner_address: loggedUserAddress,
            ticket_token_id: tokenId,
        }
    });
    if (ticketAccessToken) {
        return res.json({ token: ticketAccessToken.token });
    }
    const token = (0, uuid_1.v4)();
    const expires_at = new Date();
    expires_at.setMinutes(expires_at.getMinutes() + 30);
    yield db_1.prisma.ticketAccessToken.upsert({
        where: {
            ticket_token_id: tokenId,
        },
        update: {
            token: token,
        },
        create: {
            owner_address: loggedUserAddress,
            token: token,
            ticket_token_id: tokenId,
        }
    });
    return res.json({ token });
}));
app.use('/api', apiRouter);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
