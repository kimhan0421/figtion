const { widget } = figma;
const { AutoLayout, Text } = widget;

function Widget() {
  return (
    <AutoLayout
      direction="horizontal"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      height="hug-contents"
      padding={8}
      fill="#FFFFFF"
      cornerRadius={8}
      spacing={12}
      onClick={async () => {
        await new Promise((resolve) => {
          figma.showUI(__html__, { width: 400, height: 600 });
          figma.ui.onmessage = async (msg) => {
            figma.closePlugin();
          };
        });
      }}>
      <Text fontSize={32} horizontalAlignText="center">
        Click Me
      </Text>
    </AutoLayout>
  );
}
widget.register(Widget);
