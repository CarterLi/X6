---
title: 使用标签 Labels
order: 2
redirect_from:
  - /zh/docs
  - /zh/docs/tutorial
  - /zh/docs/tutorial/intermediate
---

在之前的[教程](../basic/edge#labels)中我们简单介绍了如何为边配置标签，由于 X6 中边的标签配置非常灵活，所以这里用单独的篇幅来详细介绍如何使用边的标签。

开始之前，我们先简单了解一下 Edge 实例上操作标签的几个方法。

| 方法签名                                                                          | 说明                     |
|-----------------------------------------------------------------------------------|------------------------|
| [edge.getLabels()]()                                                              | 获取所有标签。            |
| [edge.setLabels(labels: Edge.Label \| Edge.Label[], options?: Edge.SetOptions)]() | 设置标签。                |
| [edge.insertLabel(label: Edge.Label, index?: number, options: Edge.SetOptions)]() | 在 `index` 位置插入标签。 |
| [edge.appendLabel(label: Edge.Label, options?: Edge.SetOptions)]()                | 在末尾追加标签。          |
| [edge.setLabelAt(index: number, label: Edge.Label, options?: Edge.SetOptions)]()  | 设置 `index` 位置的标签。 |
| [edge.getLabelAt(index: number)]()                                                | 获取 `index` 位置的标签。 |
| [edge.removeLabelAt(index: number, options?: Edge.SetOptions)]()                  | 删除 `index` 位置的标签。 |

## 标签定义

标签包含标签 Markup、标签位置、标签样式等，完整的定义如下。

```ts
interface Label {
  markup?: Markup
  attrs?: Attr.CellAttrs
  position?: number | {
    distance: number
    offset?: number | {
      x?: number
      y?: number
    }
    angle?: number
    options?: {
      absoluteDistance?: boolean
      reverseDistance?: boolean
      absoluteOffset?: boolean
      keepGradient?: boolean
      ensureLegibility?: boolean
    }
  }
}
```

- `markup` 标签 Markup。
- `attrs` 标签样式。
- `position` 标签位置。当其值为 `number` 时，相当于设置 `position.distance` 的值。
  - `distance` [标签位置](#位置)。
  - `offset` [标签偏移](#偏移)。
  - `angle` [标签旋转](#旋转)。

## 默认标签

创建 Edge 时可以通过 [defaultLabel 选项](../basic/edge#defaultlabel) 来设置默认标签，其默认值如下：

```ts
{
  markup: [
    {
      tagName: 'rect',
      selector: 'rect',
    },
    {
      tagName: 'text',
      selector: 'text',
    },
  ],
  attrs: {
    text: {
      fill: '#000000',
      fontSize: 14,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      pointerEvents: 'none',
    },
    rect: {
      ref: 'text',
      fill: '#ffffff',
      rx: 3,
      ry: 3,
      refWidth: 1,
      refHeight: 1,
      refX: 0,
      refY: 0,
    },
  },
  position: {
    distance: 0.5,
  },
}
```

该默认标签包含一个 `<text>` 元素（表示标签文本）和一个 `<rect>` 元素（表示标签背景），默认居中对齐，并拥有白色圆角背景。由于所有自定义标签都将与该默认标签进行 [merge](https://www.lodashjs.com/docs/latest#_mergeobject-sources)，所以我们可以像下面这样简单提供一个标签的文本属性来添加一个标签。

```ts
edge.appendLabel({
  attrs: {
    text: {
      text: 'Hello Label',
    },
  },
})
```

<iframe
     src="https://codesandbox.io/embed/x6-edge-append-label-8nuhy?fontsize=14&hidenavigation=1&theme=light&view=preview"
     style="width:100%; height:130px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
     title="x6-edge-append-label"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## 标签位置

### 位置

我们可以通过 Label 的 `position.distance` 选项来指定标签的位置，默认值为 `0.5` 表示标签位于边长度的中心位置。根据取值不同，标签位置的计算方式分下面三种情况。

- 位于 `[0, 1]` 之间时，表示标签位于**从起点开始，沿长度方向，多少相对长度（比例）的位置**。
- 正数表示标签位于**从起点开始，沿边长度方向，偏离起点多少长度的位置**。
- 负数表示标签位于**从终点开始，沿长度方向，偏离终点多少长度的位置**。

```ts
edge.appendLabel({
  attrs: {
    text: {
      text: "0.25",
    },
  },
  position: {
    distance: 0.25,
  },
})

edge.appendLabel({
  attrs: {
    text: {
      text: "150",
    },
  },
  position: {
    distance: 150,
  },
})

edge.appendLabel({
  attrs: {
    text: {
      text: "-100",
    },
  },
  position: {
    distance: -100,
  },
})
```

<iframe
     src="https://codesandbox.io/embed/x6-edge-label-position-742ob?fontsize=14&hidenavigation=1&theme=light&view=preview"
     style="width:100%; height:290px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
     title="x6-edge-label-position"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### 偏移

我们可以通过 Label 的 `position.offset` 选项来设置标签的偏移量，默认值为 `0` 表示不偏移。根据取值不同，标签偏移量的计算方式分为下面三种情况。

- 正数表示标签**沿垂直于边向下的绝对偏移量**。
- 负数表示标签**沿垂直于边向上的绝对偏移量**。
- 坐标对象 `{x: number; y: number }` 表示标签**沿 `x` 和 `y` 两个方向的绝对偏移量**。

```ts
edge.appendLabel({
  attrs: {
    text: {
      text: "offset: 40",
    },
  },
  position: {
    distance: 0.66,
    offset: 40,
  },
})

edge.appendLabel({
  attrs: {
    text: {
      text: "offset: -40",
    },
  },
  position: {
    distance: 0.66,
    offset: -40,
  },
})

edge.appendLabel({
  attrs: {
    text: {
      text: "offset: { x: -40, y: 80 }",
    },
  },
  position: {
    distance: 0.66,
    offset: {
      x: -40,
      y: 80,
    },
  },
});
```

<iframe
     src="https://codesandbox.io/embed/x6-edge-label-offset-dpunh?fontsize=14&hidenavigation=1&theme=light&view=preview"
     style="width:100%; height:290px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
     title="x6-edge-label-offset"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### 旋转

我们可以通过 Label 的 `position.angle` 选项来设置标签沿**顺时针方向**的旋转角度，默认值为 `0` 表示不旋转。

**选项**

- 当 `position.options.keepGradient` 为 `true` 时，标签的初始旋转角度是标签所在位置的边的角度，后续设置的 `position.angle` 角度是相对于该初始角度的。
-  当 `position.options.ensureLegibility` 为 `true` 时，在必要时将为标签增加 180° 旋转量，以保证标签文本更易读。

```ts
edge.appendLabel({
  attrs: {
    text: {
      text: "70°\nkeepGradient"
    }
  },
  position: {
    distance: 0.05,
    angle: 70,
    options: {
      keepGradient: true
    }
  }
})

edge.appendLabel({
  attrs: {
    text: {
      text: "0°\nkeepGradient"
    }
  },
  position: {
    distance: 0.3,
    options: {
      keepGradient: true
    }
  }
})

edge.appendLabel({
  attrs: {
    text: {
      text: "45°"
    }
  },
  position: {
    distance: 0.8,
    angle: 45
  }
})

edge.appendLabel({
  attrs: {
    text: {
      text: "135°"
    }
  },
  position: {
    distance: 0.9,
    angle: 135
  }
})

edge.appendLabel({
  attrs: {
    text: {
      text: "270°\nkeepGradient"
    }
  },
  position: {
    distance: 0.66,
    offset: 80,
    angle: 270,
    options: {
      keepGradient: true
    }
  }
})

edge.appendLabel({
  attrs: {
    text: {
      text: "270°\nkeepGradient\nensureLegibility"
    }
  },
  position: {
    distance: 0.66,
    offset: -80,
    angle: 270,
    options: {
      keepGradient: true,
      ensureLegibility: true
    }
  }
})
```

<iframe
     src="https://codesandbox.io/embed/x6-edge-label-rotate-579lq?fontsize=14&hidenavigation=1&theme=light&view=preview"
     style="width:100%; height:370px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
     title="x6-edge-label-rotate"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

## 标签样式

我们可以通过 `markup` 和 `attrs` 两个选项来定制标签样式，并支持两个维度的定制。

**方式一：**创建 Edge 时全局覆盖默认标签的定义，影响所有标签。
  
```ts
const edge = graph.addEdge({
  source: { x: 100, y: 40 },
  target: { x: 400, y: 40 },
  defaultLabel: {
    markup: [
      {
        tagName: "ellipse",
        selector: "bg"
      },
      {
        tagName: "text",
        selector: "txt"
      }
    ],
    attrs: {
      txt: {
        fill: "#7c68fc",
        textAnchor: "middle",
        textVerticalAnchor: "middle"
      },
      bg: {
        ref: "txt",
        refRx: "70%",
        refRy: "80%",
        stroke: "#7c68fc",
        fill: "white",
        strokeWidth: 2
      }
    }
  }
})

edge.appendLabel({
  attrs: {
    txt: {
      text: "First"
    }
  },
  position: {
    distance: 0.3
  }
})

edge.appendLabel({
  attrs: {
    txt: {
      text: "Second"
    }
  },
  position: {
    distance: 0.7
  }
})
```

<iframe
  src="https://codesandbox.io/embed/x6-edge-label-markup-xpn9j?fontsize=14&hidenavigation=1&theme=light&view=preview"
  style="width:100%; height:130px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
  title="x6-edge-label-markup"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

**方式二：**创建单个标签时覆盖默认标签的定义，影响单个标签。

```ts
edge.appendLabel({
  markup: [
    {
      tagName: "circle",
      selector: "body"
    },
    {
      tagName: "text",
      selector: "label"
    },
    {
      tagName: "circle",
      selector: "asteriskBody"
    },
    {
      tagName: "text",
      selector: "asterisk"
    }
  ],
  attrs: {
    label: {
      text: "½",
      fill: "#000",
      fontSize: 12,
      textAnchor: "middle",
      textVerticalAnchor: "middle",
      pointerEvents: "none"
    },
    body: {
      ref: "label",
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 1,
      refR: 1,
      refCx: 0,
      refCy: 0
    },
    asterisk: {
      ref: "label",
      text: "＊",
      fill: "#ff0000",
      fontSize: 8,
      textAnchor: "middle",
      textVerticalAnchor: "middle",
      pointerEvents: "none",
      refX: 16.5,
      refY: -2
    },
    asteriskBody: {
      ref: "asterisk",
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 1,
      refR: 1,
      refCx: "50%",
      refCy: "50%",
      refX: 0,
      refY: 0
    }
  }
})
```
<iframe
  src="https://codesandbox.io/embed/x6-edge-label-attrs-xl5vs?fontsize=14&hidenavigation=1&theme=light&view=preview"
  style="width:100%; height:130px; border:1px solid #f0f0f0; border-radius: 4px; overflow:hidden;"
  title="x6-edge-label-attrs"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-autoplay allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>