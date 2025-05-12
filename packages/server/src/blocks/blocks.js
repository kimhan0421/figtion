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
const notion_1 = require("../notion");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Notion Block 데이터를 가져오는 엔드포인트
router.post("/get-block-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blockId } = req.body;
    if (!blockId) {
        res.status(400).json({ error: "Invalid or missing blockId" });
        return;
    }
    try {
        const response = yield notion_1.notion.blocks.retrieve({ block_id: blockId });
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
// Notion Block 하위 콘텐츠를 가져오는 엔드포인트
router.post("/get-block-children", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blockId } = req.body;
    if (!blockId) {
        res.status(400).json({ error: "Invalid or missing blockId" });
        return;
    }
    try {
        const response = yield notion_1.notion.blocks.children.list({
            block_id: blockId,
            page_size: 100, // 최대 100개의 하위 블록
        });
        res.json(response.results); // 하위 블록 데이터만 반환
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
exports.default = router;
