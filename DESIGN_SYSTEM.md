# 舞萌DX 实用工具站 - UI 设计规范 (Design System)

## 1. 设计理念 (Design Philosophy)
*   **风格定义**: **Neo-Brutalism (新粗野主义) / Pop Art**。
*   **核心特征**: 高对比度、粗边框、硬阴影、高饱和度纯色。
*   **绝对原则**: **禁止使用渐变色 (No Gradients)**。所有颜色必须是纯色 (Solid Colors)。
*   **视觉语言**: 硬朗、游戏化、清晰、高可读性。

## 2. 色彩系统 (Color Palette)

### 2.1 基础色 (Neutrals)
用于布局骨架、文字和边框。
*   **Black (墨黑)**: `#000000` - 用于文字、边框、硬阴影。
*   **White (纯白)**: `#FFFFFF` - 用于页面背景、卡片背景、文字反白。
*   **Light Gray (浅灰)**: `#F3F4F6` (Tailwind `gray-100`) - 用于次级背景、画布底色。

### 2.2 强调色 (Accents)
用于按钮、卡片背景、高亮状态。**必须使用纯色**。
*   **Maimai Purple (萌紫)**: `#D946EF` (Tailwind `fuchsia-500`) - 替代原粉色，对应“最爱”、“喜欢”等积极情绪。
*   **Sky Blue (天蓝)**: `#38BDF8` (Tailwind `sky-400`) - 对应“水平”、“代表作”等理性情绪。
*   **Warning Yellow (警示黄)**: `#FACC15` (Tailwind `yellow-400`) - 对应“苦手”、“注意”等。
*   **Action Green (行动绿)**: `#4ADE80` (Tailwind `green-400`) - 用于确认按钮、成功状态。
*   **Destructive Red (破坏红)**: `#F87171` (Tailwind `red-400`) - 用于删除、重置操作。

## 3. 边框与阴影 (Borders & Shadows)

### 3.1 边框 (Borders)
所有容器、按钮、输入框均需带有明显的黑色边框。
*   **粗细**: 统一使用 `2px` 或 `3px` 实线 (`solid`)。
*   **圆角**:
    *   **小圆角**: `4px` (Tailwind `rounded`) - 用于输入框、小按钮。
    *   **大圆角**: `12px` (Tailwind `rounded-xl`) - 用于大卡片、模态框。
    *   **直角**: `0px` - 用于某些风格化容器（可选）。

### 3.2 阴影 (Shadows)
使用**不模糊的硬阴影 (Hard Shadows)**，模拟立体感。
*   **常规阴影**: X偏移 `4px`, Y偏移 `4px`, 模糊 `0px`, 颜色 `#000000`。
    *   CSS: `box-shadow: 4px 4px 0px 0px #000000;`
*   **悬浮/激活状态**:
    *   **Hover**: 阴影保持不变或轻微位移。
    *   **Active (点击)**: 阴影消失 (`0px 0px`)，元素向右下位移 `4px`，产生“按下”的物理反馈。

## 4. 排版 (Typography)

### 4.1 字体栈 (Font Stack)
优先使用无衬线字体，保证在各平台的清晰度。
*   `font-family`: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif.

### 4.2 字号层级 (Type Scale)
*   **Heading 1 (页面标题)**: `24px` / `32px` (Bold)
*   **Heading 2 (模块标题)**: `20px` / `28px` (Bold)
*   **Heading 3 (卡片标题)**: `18px` / `24px` (Bold)
*   **Body (正文)**: `16px` / `24px` (Regular)
*   **Small (辅助文字)**: `14px` / `20px` (Regular)
*   **Tiny (标签/提示)**: `12px` / `16px` (Bold)

## 5. 组件规范 (Component Specs)

### 5.1 按钮 (Buttons)
*   **样式**: 纯色背景 + 黑色文字 + 2px 黑边框 + 4px 硬阴影。
*   **交互**:
    *   Default: 正常显示。
    *   Hover: 背景色亮度微调 (e.g., brightness-110%)，光标变为 `pointer`。
    *   Active: `transform: translate(4px, 4px); box-shadow: none;`

### 5.2 输入框 (Inputs)
*   **样式**: 白色背景 + 2px 黑边框 + 4px 圆角。
*   **状态**:
    *   Default: 边框黑色。
    *   Focus: 边框加粗或变为强调色 (如蓝色)，背景色可微调为极淡灰。
    *   Placeholder: 灰色文字。

### 5.3 卡片 (Cards)
*   **样式**: 白色或强调色背景 + 2px 黑边框 + 硬阴影。
*   **布局**: 内部 Padding 统一为 `16px` 或 `24px`。

### 5.4 模态框 (Modals)
*   **遮罩**: 黑色半透明 (`rgba(0, 0, 0, 0.5)`) 或 纯白/纯黑网点图案。
*   **容器**: 居中，白色背景，3px 黑边框，8px 硬阴影。

## 6. 响应式策略 (Responsive Strategy)
*   **断点**:
    *   **Mobile**: `< 768px` (单栏布局，侧边栏转为抽屉/汉堡菜单)。
    *   **Desktop**: `>= 768px` (双栏布局，侧边栏固定)。
*   **触控优化**: 移动端交互元素（按钮、输入框）最小高度为 `44px`，确保手指易点击。

## 7. CSS 工具类映射 (Tailwind Config 建议)
建议在 `tailwind.config.js` 中扩展以下配置：
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'maimai-purple': '#D946EF',
        'maimai-blue': '#38BDF8',
        'maimai-yellow': '#FACC15',
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
      }
    }
  }
}
```
