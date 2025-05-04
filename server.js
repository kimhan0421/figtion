require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { Client } = require("@notionhq/client");
const app = express();

// Notion API 클라이언트 초기화
const notion = new Client({ auth: process.env.NOTION_API_KEY });

app.use(cors());
app.use(express.json());

// Notion Block 데이터를 가져오는 엔드포인트
app.post("/get-block-data", async (req, res) => {
  const { blockId } = req.body;
  if (!blockId || blockId.length !== 32) {
    return res.status(400).json({ error: "Invalid Block ID format" });
  }

  try {
    const response = await notion.blocks.retrieve({ block_id: blockId });
    console.log("blocks", response);
    res.json(response);
  } catch (error) {
    console.error("Error fetching pageData:", error.message);
    res.status(500).json({ error: "Failed to fetch Notion data" });
  }
});
// Notion Block 하위 콘텐츠를 가져오는 엔드포인트
app.post("/get-block-children", async (req, res) => {
  const { blockId } = req.body;

  if (!blockId) {
    return res.status(400).json({ error: "Block ID is required" });
  }

  try {
    const childrenData = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100, // 최대 100개의 하위 블록
    });

    res.json(childrenData.results); // 하위 블록 데이터만 반환
  } catch (error) {
    console.error("Error fetching block children:", error.message);
    res.status(500).json({ error: "Failed to fetch block children" });
  }
});

// 서버 시작
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
