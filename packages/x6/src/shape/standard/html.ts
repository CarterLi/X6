import { Dom } from '../../util'
import { Registry } from '../../registry'
import { Node } from '../../model/node'
import { NodeView } from '../../view/node'
import { Graph } from '../../graph/graph'
import { Base } from '../base'

export class HTML<
  Properties extends HTML.Properties = HTML.Properties
> extends Base<Properties> {
  get html() {
    return this.getHTML()
  }

  set html(val: HTML.Component | null | undefined) {
    this.setHTML(val)
  }

  getHTML() {
    return this.store.get<HTML.Component | null | undefined>('html')
  }

  setHTML(
    html: HTML.Component | null | undefined,
    options: Node.SetOptions = {},
  ) {
    if (html == null) {
      this.removeHTML(options)
    } else {
      this.store.set('html', html, options)
    }

    return this
  }

  removeHTML(options: Node.SetOptions = {}) {
    return this.store.remove('html', options)
  }
}

export namespace HTML {
  export type Elem = string | HTMLElement | null | undefined
  export interface Properties extends Node.Properties {
    html?: ((this: Graph, node: Node) => Elem) | Elem
  }
}

export namespace HTML {
  export class View extends NodeView<HTML> {
    render() {
      super.render()
      this.renderHTMLComponent()
      return this
    }

    confirmUpdate(flag: number) {
      const ret = super.confirmUpdate(flag)
      return this.handleAction(ret, View.action, () =>
        this.renderHTMLComponent(),
      )
    }

    protected renderHTMLComponent() {
      const wrap = this.selectors.wrap
      const $wrap = wrap
        ? this.$(wrap)
        : this.$(this.container).find('foreignObject > body > div')

      $wrap.empty()

      const component = this.graph.hook.getHTMLComponent(this.cell)
      if (component) {
        if (typeof component === 'string') {
          $wrap.html(component)
        } else {
          $wrap.append(component)
        }
      }
    }
  }

  export namespace View {
    export const action = 'html' as any

    View.config({
      bootstrap: [action],
      actions: {
        html: action,
      },
    })

    NodeView.registry.register('html-view', View)
  }
}

export namespace HTML {
  HTML.config({
    view: 'html-view',
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'foreignObject',
        selector: 'fo',
        children: [
          {
            ns: Dom.ns.xhtml,
            tagName: 'body',
            selector: 'foBody',
            attrs: {
              xmlns: Dom.ns.xhtml,
            },
            children: [
              {
                tagName: 'div',
                selector: 'wrap',
                style: {
                  width: '100%',
                  height: '100%',
                },
              },
            ],
          },
        ],
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ],
    attrs: {
      body: {
        fill: 'none',
        stroke: 'none',
        refWidth: '100%',
        refHeight: '100%',
      },
      fo: {
        refWidth: '100%',
        refHeight: '100%',
      },
    },
  })

  Node.registry.register('html', HTML)
}

export namespace HTML {
  export type Component =
    | HTMLElement
    | string
    | ((this: Graph, node: HTML) => HTMLElement | string)

  export const componentRegistry = Registry.create<Component>({
    type: 'html componnet',
  })
}
