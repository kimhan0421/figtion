export async function handlePluginMessages(figma) {
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "render-blocks") {
      console.log("selectedNodes", msg);
      const selectedNodes = figma.currentPage.selection;

      if (selectedNodes.length === 0) {
        figma.notify("Please select a frame.");
        return;
      }

      const frame = selectedNodes[0];
      if (!("children" in frame)) {
        figma.notify("Selected node is not a frame.");
        return;
      }

      // Clear the frame's children
      frame.children.forEach((child) => child.remove());

      const blockData = msg.blockData;
      if (!blockData || !blockData.children) {
        figma.notify("No valid block data to render.");
        return;
      }

      // Load the font before creating text nodes
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });

      // Render blocks inside the frame
      blockData.children.forEach((block, index) => {
        if (block.type === "paragraph") {
          const textNode = figma.createText();
          textNode.characters =
            block.paragraph?.rich_text
              ?.map((text) => text.plain_text)
              .join("") || "";
          textNode.fontName = { family: "Inter", style: "Regular" };
          textNode.y = index * 30; // Vertical positioning
          frame.appendChild(textNode);
        } else if (block.type === "heading_1") {
          const textNode = figma.createText();
          textNode.characters =
            block.heading_1?.rich_text
              ?.map((text) => text.plain_text)
              .join("") || "";
          textNode.fontName = { family: "Inter", style: "Regular" };
          textNode.fontSize = 32;
          textNode.y = index * 40; // Vertical positioning
          frame.appendChild(textNode);
        } else {
          figma.notify(`Unsupported block type: ${block.type}`);
        }
      });

      figma.notify("Block data rendered successfully!");
    }
  };
}
