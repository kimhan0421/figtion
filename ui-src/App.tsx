import React, { useState } from "react";
import "./App.css";
import { PartialPageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

function App() {
  const [notionUrl, setNotionUrl] = useState("");
  const [blockData, setBlockData] = useState<PartialPageObjectResponse | null>(
    null
  );
  const [error, setError] = useState(null);

  // Notion URL에서 Block ID 추출 함수
  const extractBlockIdFromURL = (url: string) => {
    try {
      const match = url.match(/([a-f0-9]{32})/); // 32자리 16진수 매칭
      if (!match) throw new Error("Invalid Notion URL format.");
      return match[1]; // Block ID 반환
    } catch (err) {
      console.error("Error extracting Block ID:", err);
      return null;
    }
  };

  // Notion API 호출 함수
  const fetchBlockData = async (blockId) => {
    try {
      // Notion API를 호출하여 블록 데이터를 가져옴
      const response = await fetch("http://localhost:5001/get-block-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blockId }),
      });

      if (!response) {
        throw new Error("Failed to fetch block data");
      }
      if (!response.ok) {
        throw new Error("Failed to fetch block data");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching block data:", err);
      setError(err.message);
      return null;
    }
  };

  // 하위 블록 데이터를 가져오는 함수
  const fetchBlockChildren = async (blockId) => {
    try {
      const response = await fetch("http://localhost:5001/get-block-children", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blockId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch block children");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching block children:", err);
      setError("Failed to fetch block children.");
      return null;
    }
  };

  // Notion 데이터를 가져오는 메인 함수
  const handleFetchData = async () => {
    const postUrl = notionUrl;
    const blockId = extractBlockIdFromURL(postUrl);
    if (!blockId) {
      setError("Invalid Notion URL. Please check the format.");
      return;
    }
    setError(null); // 에러 초기화

    try {
      // 1. 메타데이터 가져오기
      const pageData = await fetchBlockData(blockId);
      if (!pageData) return;

      // 2. 하위 콘텐츠 가져오기
      if (pageData.has_children) {
        const childrenData = await fetchBlockChildren(blockId);
        console.log("childrenData", blockId, childrenData);
        if (childrenData) {
          pageData.children = childrenData;
        }
      }
      // 최종 데이터 설정
      setBlockData(pageData);
    } catch (err) {
      console.error("Error in handleFetchData:", err);
      setError("An error occurred while fetching data.");
    }
  };

  // 하위 블록 데이터를 가져오는 함수
  const enrichBlockWithChildren = async (block) => {
    if (!block.has_children) return block;

    const children = await fetchBlockChildren(block.id);
    if (!children) return block;

    const enrichedChildren = await Promise.all(
      children.map(enrichBlockWithChildren)
    );

    return {
      ...block,
      children: enrichedChildren,
    };
  };

  // Notion 블록 데이터를 렌더링하는 함수
  const renderBlock = (block) => {
    if (!block) return null;

    switch (block.type) {
      case "heading_1":
      case "heading_2":
      case "heading_3": {
        const HeadingTag =
          block.type === "heading_1"
            ? "h1"
            : block.type === "heading_2"
            ? "h2"
            : "h3";
        return (
          <HeadingTag key={block.id}>
            {block[block.type]?.rich_text
              ?.map((text) => text.plain_text)
              .join("")}
          </HeadingTag>
        );
      }
      case "paragraph":
        return (
          <p key={block.id}>
            {block.paragraph?.rich_text
              ?.map((text) => text.plain_text)
              .join("") || ""}
          </p>
        );
      case "bulleted_list_item":
      case "numbered_list_item":
        return (
          <li key={block.id}>
            {block[block.type]?.rich_text
              ?.map((text) => text.plain_text)
              .join("")}
          </li>
        );
      case "to_do":
        return (
          <div key={block.id}>
            <label>
              <input type="checkbox" disabled checked={block.to_do.checked} />{" "}
              {block.to_do?.rich_text?.map((text) => text.plain_text).join("")}
            </label>
          </div>
        );
      case "quote":
        return (
          <blockquote
            key={block.id}
            style={{ fontStyle: "italic", color: "#555" }}>
            {block.quote?.rich_text?.map((text) => text.plain_text).join("")}
          </blockquote>
        );
      case "divider":
        return <hr key={block.id} />;
      case "code":
        return (
          <pre
            key={block.id}
            style={{
              backgroundColor: "#f4f4f4",
              padding: "10px",
              borderRadius: "5px",
              fontFamily: "monospace",
            }}>
            {block.code?.rich_text?.map((text) => text.plain_text).join("")}
          </pre>
        );
      case "image":
        return (
          <img
            key={block.id}
            src={block.image?.file?.url || block.image?.external?.url}
            alt="Notion Image"
            style={{ maxWidth: "100%", borderRadius: "5px" }}
          />
        );
      case "toggle":
        console.log("1111-toggle", block);
        return (
          <details key={block.id}>
            <summary>
              {block.toggle.rich_text?.map((text) => text.plain_text).join("")}
            </summary>
            <div style={{ paddingLeft: "1rem" }}>
              {block.children?.map((child) => renderBlock(child))}
            </div>
          </details>
        );

      default:
        return (
          <p key={block.id} style={{ color: "gray" }}>
            Unsupported block type: {block.type}
          </p>
        );
    }
  };

  // Notion 데이터를 렌더링하는 함수
  const renderStructuredData = (data) => {
    if (!data) return null;

    return (
      <div className="structured-data">
        {/* 페이지 제목 */}
        <h2>{data.child_page?.title || "No Title"}</h2>

        {/* 블록 데이터 렌더링 */}
        {data.children?.map((block) => renderBlock(block))}
      </div>
    );
  };

  return (
    <div className="App">
      <h1>Notion to Figma</h1>
      {/* Notion URL 입력 */}
      <input
        type="text"
        placeholder="Enter Notion URL"
        value={notionUrl}
        onChange={(e) => setNotionUrl(e.target.value)}
        style={{
          width: "80%",
          padding: "10px",
          marginBottom: "10px",
          fontSize: "14px",
        }}
      />
      {/* 데이터 요청 버튼 */}
      <button onClick={handleFetchData} style={{ padding: "10px 20px" }}>
        Fetch Block Data
      </button>

      {/* 에러 메시지 표시 */}
      {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
      {/* Block 데이터 렌더링 */}
      {blockData && (
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          {renderStructuredData(blockData)}
        </div>
      )}
      {/* JSON 디버깅 섹션 */}
      {/* {blockData && (
        <pre
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            border: "1px solid #ddd",
            borderRadius: "5px",
            fontSize: "12px",
            overflowX: "auto",
          }}>
          {JSON.stringify(blockData, null, 2)}
        </pre>
      )} */}
    </div>
  );
}

export default App;
