import { Graph, Rectangle, Point, util } from '../../../../../src'
import { Polyline } from '../../../../../src/shape'
import { GraphView } from './view'

export class EditorGraph extends Graph {
  view: GraphView
  autoTranslate: boolean

  sizeDidChange() {
    if (this.container && util.hasScrollbars(this.container)) {
      const size = this.getPageSize()
      const pages = this.getPageLayout()
      const padding = this.getPagePadding()

      const minw = Math.ceil(2 * padding[0] + pages.width * size.width)
      const minh = Math.ceil(2 * padding[1] + pages.height * size.height)

      const min = this.minGraphSize
      if (min == null || min.width != minw || min.height != minh) {
        this.minGraphSize = { width: minw, height: minh }
      }

      const dx = padding[0] - pages.x * size.width
      const dy = padding[1] - pages.y * size.height

      const s = this.view.scale
      const t = this.view.translate
      const tx = t.x
      const ty = t.y

      if (!this.autoTranslate && (tx != dx || ty != dy)) {
        this.autoTranslate = true

        this.view.x0 = pages.x
        this.view.y0 = pages.y

        this.view.setTranslate(dx, dy)

        this.container.scrollLeft += Math.round((dx - tx) * s)
        this.container.scrollTop += Math.round((dy - ty) * s)

        this.autoTranslate = false

        return
      }

      super.sizeDidChange()
    }
  }

  getPreferredPageSize() {
    const size = this.getPageSize()
    const pages = this.getPageLayout()

    return {
      width: pages.width * size.width,
      height: pages.height * size.height,
    }
  }

  getPageSize() {
    return {
      width: this.pageFormat.width * this.pageScale,
      height: this.pageFormat.height * this.pageScale,
    }
  }

  getPageLayout() {
    const size = this.getPageSize()
    const bounds = this.getGraphBounds()

    if (bounds.width == 0 || bounds.height == 0) {
      return new Rectangle(0, 0, 1, 1)
    } else {
      const s = this.view.scale
      const t = this.view.translate
      const x = Math.ceil(bounds.x / s - t.x)
      const y = Math.ceil(bounds.y / s - t.y)
      const w = Math.floor(bounds.width / s)
      const h = Math.floor(bounds.height / s)

      const x0 = Math.floor(x / size.width)
      const y0 = Math.floor(y / size.height)
      const w0 = Math.ceil((x + w) / size.width) - x0
      const h0 = Math.ceil((y + h) / size.height) - y0

      return new Rectangle(x0, y0, w0, h0)
    }
  }

  getPagePadding() {
    const scale = this.view.scale
    const container = this.container
    return [
      Math.max(0, Math.round((container.offsetWidth - 32) / scale)),
      Math.max(0, Math.round((container.offsetHeight - 32) / scale))
    ]
  }

  updatePageBreaks(visible: boolean, width: number, height: number) {
    const s = this.view.scale
    const t = this.view.translate
    const fmt = this.pageFormat
    const ps = s * this.pageScale
    const bgBounds = this.view.getBackgroundPageBounds()

    width = bgBounds.width // tslint:disable-line
    height = bgBounds.height // tslint:disable-line

    const right = bgBounds.x + width
    const bottom = bgBounds.y + height

    const bounds = new Rectangle(
      s * t.x,
      s * t.y,
      fmt.width * ps,
      fmt.height * ps,
    )

    // tslint:disable-next-line
    visible = (
      visible &&
      Math.min(bounds.width, bounds.height) > this.minPageBreakDist
    )

    const hCount = visible ? Math.ceil(height / bounds.height) - 1 : 0
    const vCount = visible ? Math.ceil(width / bounds.width) - 1 : 0

    if (this.viewport.horizontalPageBreaks == null && hCount > 0) {
      this.viewport.horizontalPageBreaks = []
    }

    if (this.viewport.verticalPageBreaks == null && vCount > 0) {
      this.viewport.verticalPageBreaks = []
    }

    const drawPageBreaks = (breaks: Polyline[]) => {
      if (breaks != null) {
        const count = breaks === this.viewport.horizontalPageBreaks
          ? hCount
          : vCount

        for (let i = 0; i <= count; i += 1) {
          let points: Point[]
          if (breaks === this.viewport.horizontalPageBreaks) {
            const y = Math.round(bgBounds.y + (i + 1) * bounds.height) - 1
            points = [
              new Point(Math.round(bgBounds.x), y),
              new Point(Math.round(right), y),
            ]
          } else {
            const x = Math.round(bgBounds.x + (i + 1) * bounds.width) - 1
            points = [
              new Point(x, Math.round(bgBounds.y)),
              new Point(x, Math.round(bottom)),
            ]
          }

          if (breaks[i] != null) {
            breaks[i].points = points
            breaks[i].redraw()
          } else {
            const pageBreak = new Polyline(points, this.pageBreakColor)
            pageBreak.dialect = this.dialect
            pageBreak.dashed = this.pageBreakDashed
            pageBreak.pointerEvents = false
            pageBreak.init(this.view.getBackgroundPane())
            pageBreak.redraw()

            breaks[i] = pageBreak
          }
        }

        for (let i = count; i < breaks.length; i += 1) {
          breaks[i].dispose()
        }

        breaks.splice(count, breaks.length - count)
      }
    }

    drawPageBreaks(this.viewport.horizontalPageBreaks)
    drawPageBreaks(this.viewport.verticalPageBreaks)
  }

  resetScrollbars() {
    const container = this.container

    if (this.pageVisible && util.hasScrollbars(container)) {
      const padding = this.getPagePadding()
      container.scrollLeft = Math.floor(Math.min(
        padding[0],
        (container.scrollWidth - container.clientWidth) / 2),
      )
      container.scrollTop = padding[1]

      // Scrolls graph to visible area
      const bounds = this.getGraphBounds()
      if (bounds.width > 0 && bounds.height > 0) {
        if (bounds.x > container.scrollLeft + container.clientWidth * 0.9) {
          container.scrollLeft = Math.min(
            bounds.x + bounds.width - container.clientWidth,
            bounds.x - 10,
          )
        }

        if (bounds.y > container.scrollTop + container.clientHeight * 0.9) {
          container.scrollTop = Math.min(
            bounds.y + bounds.height - container.clientHeight,
            bounds.y - 10,
          )
        }
      }
    }
  }
}