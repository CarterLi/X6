import JQuery from 'jquery'
import { Dom } from '../util'
import { Cell } from '../model'
import { Config } from '../global'
import { View, Markup, CellView } from '../view'
import { Graph } from './graph'

export class GraphView extends View {
  public readonly container: HTMLElement
  public readonly background: HTMLDivElement
  public readonly grid: HTMLDivElement
  public readonly svg: SVGSVGElement
  public readonly defs: SVGDefsElement
  public readonly viewport: SVGGElement
  public readonly primer: SVGGElement
  public readonly stage: SVGGElement
  public readonly decorator: SVGGElement
  public readonly overlay: SVGGElement

  protected get model() {
    return this.graph.model
  }

  protected get options() {
    return this.graph.options
  }

  constructor(protected readonly graph: Graph) {
    super()

    const { selectors, fragment } = Markup.parseJSONMarkup(GraphView.markup)
    this.background = selectors.background as HTMLDivElement
    this.grid = selectors.grid as HTMLDivElement
    this.svg = selectors.svg as SVGSVGElement
    this.defs = selectors.defs as SVGDefsElement
    this.viewport = selectors.viewport as SVGGElement
    this.primer = selectors.primer as SVGGElement
    this.stage = selectors.stage as SVGGElement
    this.decorator = selectors.decorator as SVGGElement
    this.overlay = selectors.overlay as SVGGElement
    this.container = this.options.container
    this.$(this.container)
      .addClass(this.prefixClassName('graph'))
      .append(fragment)

    this.delegateEvents()
  }

  delegateEvents() {
    const ctor = this.constructor as typeof GraphView
    super.delegateEvents(ctor.events)
    return this
  }

  /**
   * Guard the specified event. If the event is not interesting, it
   * returns `true`, otherwise returns `false`.
   */
  guard(e: JQuery.TriggeredEvent, view?: CellView | null) {
    // handled as `contextmenu` type
    if (e.type === 'mousedown' && e.button === 2) {
      return true
    }

    if (this.options.guard && this.options.guard(e, view)) {
      return true
    }

    if (e.data && e.data.guarded !== undefined) {
      return e.data.guarded
    }

    if (view && view.cell && view.cell instanceof Cell) {
      return false
    }

    if (
      this.svg === e.target ||
      this.container === e.target ||
      JQuery.contains(this.svg, e.target)
    ) {
      return false
    }

    return true
  }

  protected findView(elem: Element) {
    return this.graph.renderer.findView(elem)
  }

  protected onDblClick(e: JQuery.DoubleClickEvent) {
    e.preventDefault()
    e = this.normalizeEvent(e) // tslint:disable-line

    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }

    const localPoint = this.graph.snapToGrid(e.clientX, e.clientY)

    if (view) {
      view.onDblClick(e, localPoint.x, localPoint.y)
    } else {
      this.graph.trigger('blank:dblclick', {
        e,
        x: localPoint.x,
        y: localPoint.y,
      })
    }
  }

  protected onClick(e: JQuery.ClickEvent) {
    if (this.getMouseMovedCount(e) <= this.options.clickThreshold) {
      e = this.normalizeEvent(e) // tslint:disable-line
      const view = this.findView(e.target)
      if (this.guard(e, view)) {
        return
      }

      const localPoint = this.graph.snapToGrid(e.clientX, e.clientY)
      if (view) {
        view.onClick(e, localPoint.x, localPoint.y)
      } else {
        this.graph.trigger('blank:click', {
          e,
          x: localPoint.x,
          y: localPoint.y,
        })
      }
    }
  }

  protected onContextMenu(e: JQuery.ContextMenuEvent) {
    if (this.options.preventContextMenu) {
      e.preventDefault()
    }

    e = this.normalizeEvent(e) // tslint:disable-line
    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }

    const localPoint = this.graph.snapToGrid(e.clientX, e.clientY)

    if (view) {
      view.onContextMenu(e, localPoint.x, localPoint.y)
    } else {
      this.graph.trigger('blank:contextmenu', {
        e,
        x: localPoint.x,
        y: localPoint.y,
      })
    }
  }

  delegateDragEvents(e: JQuery.MouseDownEvent, view: CellView | null) {
    if (e.data == null) {
      e.data = {}
    }
    this.setEventData<EventData.Moving>(e, {
      currentView: view || null,
      mouseMovedCount: 0,
    })
    const ctor = this.constructor as typeof GraphView
    this.delegateDocumentEvents(ctor.documentEvents, e.data)
    this.undelegateEvents()
  }

  getMouseMovedCount(e: JQuery.TriggeredEvent) {
    const data = this.getEventData<EventData.Moving>(e)
    return data.mouseMovedCount || 0
  }

  protected onMouseDown(e: JQuery.MouseDownEvent) {
    e = this.normalizeEvent(e) // tslint:disable-line
    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }

    const localPoint = this.graph.snapToGrid(e.clientX, e.clientY)

    if (view) {
      e.preventDefault()
      view.onMouseDown(e, localPoint.x, localPoint.y)
    } else {
      if (this.options.preventDefaultBlankAction) {
        e.preventDefault()
      }

      this.graph.trigger('blank:mousedown', {
        e,
        x: localPoint.x,
        y: localPoint.y,
      })
    }

    this.delegateDragEvents(e, view)
  }

  protected onMouseMove(e: JQuery.MouseMoveEvent) {
    const data = this.getEventData<EventData.Moving>(e)
    if (data.mouseMovedCount == null) {
      data.mouseMovedCount = 0
    }
    data.mouseMovedCount += 1
    const mouseMovedCount = data.mouseMovedCount
    if (mouseMovedCount <= this.options.moveThreshold) {
      return
    }

    e = this.normalizeEvent(e) // tslint:disable-line
    const localPoint = this.graph.snapToGrid(e.clientX, e.clientY)

    const view = data.currentView
    if (view) {
      view.onMouseMove(e, localPoint.x, localPoint.y)
    } else {
      this.graph.trigger('blank:mousemove', {
        e,
        x: localPoint.x,
        y: localPoint.y,
      })
    }

    this.setEventData(e, data)
  }

  protected onMouseUp(e: JQuery.MouseUpEvent) {
    this.undelegateDocumentEvents()

    const normalized = this.normalizeEvent(e)
    const localPoint = this.graph.snapToGrid(
      normalized.clientX,
      normalized.clientY,
    )
    const data = this.getEventData<EventData.Moving>(e)
    const view = data.currentView
    if (view) {
      view.onMouseUp(normalized, localPoint.x, localPoint.y)
    } else {
      this.graph.trigger('blank:mouseup', {
        e: normalized,
        x: localPoint.x,
        y: localPoint.y,
      })
    }

    if (!e.isPropagationStopped()) {
      this.onClick(
        JQuery.Event(e as any, {
          type: 'click',
          data: e.data,
        }) as JQuery.ClickEvent,
      )
    }

    e.stopImmediatePropagation()

    this.delegateEvents()
  }

  protected onMouseOver(e: JQuery.MouseOverEvent) {
    e = this.normalizeEvent(e) // tslint:disable-line
    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }

    if (view) {
      view.onMouseOver(e)
    } else {
      // prevent border of paper from triggering this
      if (this.container === e.target) {
        return
      }
      this.graph.trigger('blank:mouseover', { e })
    }
  }

  protected onMouseOut(e: JQuery.MouseOutEvent) {
    e = this.normalizeEvent(e) // tslint:disable-line
    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }

    if (view) {
      view.onMouseOut(e)
    } else {
      if (this.container === e.target) {
        return
      }
      this.graph.trigger('blank:mouseout', { e })
    }
  }

  protected onMouseEnter(e: JQuery.MouseEnterEvent) {
    e = this.normalizeEvent(e) // tslint:disable-line
    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }

    const relatedView = this.graph.renderer.findView(e.relatedTarget as Element)
    if (view) {
      // mouse moved from tool over view?
      if (relatedView === view) {
        return
      }
      view.onMouseEnter(e)
    } else {
      if (relatedView) {
        return
      }
      this.graph.trigger('graph:mouseenter', { e })
    }
  }

  protected onMouseLeave(e: JQuery.MouseLeaveEvent) {
    e = this.normalizeEvent(e) // tslint:disable-line
    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }
    const relatedView = this.graph.renderer.findView(e.relatedTarget as Element)
    if (view) {
      // mouse moved from view over tool?
      if (relatedView === view) {
        return
      }
      view.onMouseLeave(e)
    } else {
      if (relatedView) {
        return
      }
      this.graph.trigger('graph:mouseleave', { e })
    }
  }

  protected onMouseWheel(e: JQuery.TriggeredEvent) {
    e = this.normalizeEvent(e) // tslint:disable-line
    const view = this.findView(e.target)
    if (this.guard(e, view)) {
      return
    }

    const originalEvent = e.originalEvent as MouseWheelEvent
    const localPoint = this.graph.snapToGrid(
      originalEvent.clientX,
      originalEvent.clientY,
    )
    const delta = Math.max(
      -1,
      Math.min(1, (originalEvent as any).wheelDelta || -originalEvent.detail),
    )

    if (view) {
      view.onMouseWheel(e, localPoint.x, localPoint.y, delta)
    } else {
      this.graph.trigger('blank:mousewheel', {
        e,
        delta,
        x: localPoint.x,
        y: localPoint.y,
      })
    }
  }

  protected onCustomEvent(e: JQuery.MouseDownEvent) {
    const eventNode = e.currentTarget
    const eventName = eventNode.getAttribute('event')
    if (eventName) {
      const view = this.findView(eventNode)
      if (view) {
        e = this.normalizeEvent(e) // tslint:disable-line
        if (this.guard(e, view)) {
          return
        }

        const localPoint = this.graph.snapToGrid(
          e.clientX as number,
          e.clientY as number,
        )
        view.onCustomEvent(e, eventName, localPoint.x, localPoint.y)
      }
    }
  }

  protected handleMagnetEvent<T extends JQuery.TriggeredEvent>(
    e: T,
    handler: (
      this: Graph,
      view: CellView,
      e: T,
      magnet: Element,
      x: number,
      y: number,
    ) => void,
  ) {
    const magnetElem = e.currentTarget
    const magnetValue = magnetElem.getAttribute('magnet')
    if (magnetValue) {
      const view = this.findView(magnetElem)
      if (view) {
        e = this.normalizeEvent(e) // tslint:disable-line
        if (this.guard(e, view)) {
          return
        }
        const localPoint = this.graph.snapToGrid(
          e.clientX as number,
          e.clientY as number,
        )
        handler.call(
          this.graph,
          view,
          e,
          magnetElem,
          localPoint.x,
          localPoint.y,
        )
      }
    }
  }

  protected onMagnetMouseDown(e: JQuery.MouseDownEvent) {
    this.handleMagnetEvent(e, (view, e, magnet, x, y) => {
      view.onMagnetMouseDown(e, magnet, x, y)
    })
  }

  protected onMagnetDblClick(e: JQuery.DoubleClickEvent) {
    this.handleMagnetEvent(e, (view, e, magnet, x, y) => {
      view.onMagnetDblClick(e, magnet, x, y)
    })
  }

  protected onMagnetContextMenu(e: JQuery.ContextMenuEvent) {
    if (this.options.preventContextMenu) {
      e.preventDefault()
    }
    this.handleMagnetEvent(e, (view, e, magnet, x, y) => {
      view.onMagnetContextMenu(e, magnet, x, y)
    })
  }

  protected onLabelMouseDown(e: JQuery.MouseDownEvent) {
    const labelNode = e.currentTarget
    const view = this.findView(labelNode)
    if (view) {
      e = this.normalizeEvent(e) // tslint:disable-line
      if (this.guard(e, view)) {
        return
      }

      const localPoint = this.graph.snapToGrid(e.clientX, e.clientY)
      view.onLabelMouseDown(e, localPoint.x, localPoint.y)
    }
  }

  protected onImageDragStart() {
    // This is the only way to prevent image dragging in Firefox that works.
    // Setting -moz-user-select: none, draggable="false" attribute or
    // user-drag: none didn't help.
    return false
  }
}

export namespace GraphView {
  export type SortType = 'none' | 'approx' | 'exact'
}

export namespace GraphView {
  const prefixCls = `${Config.prefixCls}-graph`

  export const markup: Markup.JSONMarkup[] = [
    {
      ns: Dom.ns.xhtml,
      tagName: 'div',
      selector: 'background',
      className: `${prefixCls}-background`,
    },
    {
      ns: Dom.ns.xhtml,
      tagName: 'div',
      selector: 'grid',
      className: `${prefixCls}-grid`,
    },
    {
      ns: Dom.ns.svg,
      tagName: 'svg',
      selector: 'svg',
      className: `${prefixCls}-svg`,
      attrs: {
        width: '100%',
        height: '100%',
        'xmlns:xlink': Dom.ns.xlink,
      },
      children: [
        {
          tagName: 'defs',
          selector: 'defs',
        },
        {
          tagName: 'g',
          selector: 'viewport',
          className: `${prefixCls}-svg-viewport`,
          children: [
            {
              tagName: 'g',
              selector: 'primer',
              className: `${prefixCls}-svg-primer`,
            },
            {
              tagName: 'g',
              selector: 'stage',
              className: `${prefixCls}-svg-stage`,
            },
            {
              tagName: 'g',
              selector: 'decorator',
              className: `${prefixCls}-svg-decorator`,
            },
            {
              tagName: 'g',
              selector: 'overlay',
              className: `${prefixCls}-svg-overlay`,
            },
          ],
        },
      ],
    },
  ]
}

export namespace GraphView {
  const prefixCls = Config.prefixCls
  export const events = {
    dblclick: 'onDblClick',
    contextmenu: 'onContextMenu',
    touchstart: 'onMouseDown',
    mousedown: 'onMouseDown',
    mouseover: 'onMouseOver',
    mouseout: 'onMouseOut',
    mouseenter: 'onMouseEnter',
    mouseleave: 'onMouseLeave',
    mousewheel: 'onMouseWheel',
    DOMMouseScroll: 'onMouseWheel',
    [`mouseenter  .${prefixCls}-tools`]: 'onMouseEnter',
    [`mouseleave  .${prefixCls}-tools`]: 'onMouseLeave',
    [`mouseenter  .${prefixCls}-cell`]: 'onMouseEnter',
    [`mouseleave  .${prefixCls}-cell`]: 'onMouseLeave',
    [`mousedown   .${prefixCls}-cell [event]`]: 'onCustomEvent',
    [`touchstart  .${prefixCls}-cell [event]`]: 'onCustomEvent',
    [`dblclick    .${prefixCls}-cell [magnet]`]: 'onMagnetDblClick',
    [`contextmenu .${prefixCls}-cell [magnet]`]: 'onMagnetContextMenu',
    [`mousedown   .${prefixCls}-cell [magnet]`]: 'onMagnetMouseDown',
    [`touchstart  .${prefixCls}-cell [magnet]`]: 'onMagnetMouseDown',
    [`dragstart   .${prefixCls}-cell image`]: 'onImageDragStart',
    [`mousedown   .${prefixCls}-edge .label`]: 'onLabelMouseDown',
    [`touchstart  .${prefixCls}-edge .label`]: 'onLabelMouseDown',
  }

  export const documentEvents = {
    mousemove: 'onMouseMove',
    touchmove: 'onMouseMove',
    mouseup: 'onMouseUp',
    touchend: 'onMouseUp',
    touchcancel: 'onMouseUp',
  }
}

namespace EventData {
  export interface Moving {
    mouseMovedCount?: number
    currentView?: CellView | null
  }
}