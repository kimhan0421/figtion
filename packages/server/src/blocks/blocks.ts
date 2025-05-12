import { notion } from "../notion";
import express, { Request, Response } from "express";

type BlockRequest = { blockId: string };

const router = express.Router();

// Notion Block 데이터를 가져오는 엔드포인트
router.post(
  "/get-block-data",
  async (req: Request<{}, {}, BlockRequest>, res: Response) => {
    const { blockId } = req.body;

    if (!blockId) {
      res.status(400).json({ error: "Invalid or missing blockId" });
      return;
    }

    try {
      const response = await notion.blocks.retrieve({ block_id: blockId });
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Notion Block 하위 콘텐츠를 가져오는 엔드포인트
router.post(
  "/get-block-children",
  async (req: Request<{}, {}, BlockRequest>, res: Response) => {
    const { blockId } = req.body;
    if (!blockId) {
      res.status(400).json({ error: "Invalid or missing blockId" });
      return;
    }

    try {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        page_size: 100, // 최대 100개의 하위 블록
      });
      res.json(response.results); // 하위 블록 데이터만 반환
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
