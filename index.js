const getRandomColor = function (){
  return  '#' +
    (function(color){
      return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
        && (color.length == 6) ?  color : arguments.callee(color)
    })('')
}

const legendGetter = {
  /**
   * 画出legend
   */
  drawLegendDom (data, colors) {
    const legendWrapper = document.createElement('div')
    legendWrapper.classList.add('legends')
    data.forEach((item, i) => {
      legendWrapper.appendChild(this.drawLegendItemDom(item, colors[i]))
    })
    return legendWrapper
  },

  drawLegendItemDom (data, color) {
    const legendItem = document.createElement('div')
    const legendText = document.createElement('span')
    const legendIcon = document.createElement('i')
    legendItem.classList.add('legend')
    legendText.innerText = data.type
    legendIcon.style.backgroundColor = color
    legendItem.appendChild(legendIcon)
    legendItem.appendChild(legendText)
    return legendItem
  },

  drawLegendCan (legends, { maxWidth, maxHeight, padding }) {
    const can = document.createElement('canvas')
    const ctx = can.getContext('2d')
    const styles = getComputedStyle(legends)
    let { fontSize } = styles
    can.width = maxWidth
    can.height = maxHeight

    let currPoint = [padding[0], 0]
    ctx.fontSize = fontSize

    // TODO: 暂时写死 待修改
    ctx.fillStyle = '#f00'
    ctx.font = `${fontSize} sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const items = [].slice.call(legends.querySelectorAll('.legend'))
    items.forEach(legend => {
      this.drawLegendItemCan(ctx, legend, currPoint, maxWidth, padding)
    })

    return can
  },

  drawLegendItemCan (ctx, legend, currPoint, maxWidth, padding) {
    const elText = legend.querySelector('span')
    const elIcon = legend.querySelector('i')
    // const iconStyle = getComputedStyle(elIcon)
    const color = elIcon.style.backgroundColor
    const itemWidth = legend.offsetWidth
    const itemHeight = legend.offsetHeight

    const legendStyle = getComputedStyle(legend)
    const textLeft = getPxNumber(legendStyle.paddingLeft)

    // 画legend的icon
    ctx.strokeStyle = color
    ctx.lineCap = 'round'
    ctx.lineWidth = elIcon.offsetHeight

    if (currPoint[0] + itemWidth > maxWidth) {
      currPoint[0] = padding[0]
      currPoint[1] += itemHeight
      this.drawIcon(ctx, currPoint, { width: elIcon.offsetWidth, height: elIcon.offsetHeight, top: elIcon.offsetTop })
      ctx.fillText(elText.innerText, currPoint[0] + Number(textLeft), currPoint[1])
    } else {
      this.drawIcon(ctx, currPoint, { width: elIcon.offsetWidth, height: elIcon.offsetHeight, top: elIcon.offsetTop })
      ctx.fillText(elText.innerText, currPoint[0] + Number(textLeft), currPoint[1])
      currPoint[0] = currPoint[0] + itemWidth
    }
  },

  drawIcon (ctx, currPoint, { width, height, top }) {
    const y = top + currPoint[1] - height / 2
    ctx.beginPath()
    ctx.moveTo(currPoint[0], y)
    ctx.lineTo(currPoint[0] + width, y)
    ctx.stroke()
  },

  drawLabel ({ ctx, color, text, angle, radius }) {
    const offset = 15
    ctx.fillText(
      text,
      Math.sin(Math.PI * (0.5 - angle)) * (radius + offset),
      Math.cos(Math.PI * (0.5 - angle)) * (radius + offset)
    )
  }
}

const getPxNumber = (size) => size.slice(0, -2)

class PieChart {
  constructor ({
    container = 'chart', // 容器id
    data = [], // 数据
    padding = [],
    colors = [],
    startAngle = -0.5
  }) {
    this.can = null
    this.ctx = null
    this.container = null
    this.radius = 0
    this.startAngle = startAngle
    this.data = data
    this.colors = colors
    this.padding = this.formatPadding(padding)

    this.legendHeight = 0
    this.init(container)

    this.drawLegend()
    this.translateOriginToCenter()
    this.drawPie()
  }

  init (container) {
    this.can = document.createElement('canvas')
    this.ctx = this.can.getContext('2d')
    this.container = document.getElementById(container)
    this.can.height = this.container.offsetHeight
    this.can.width = this.container.offsetWidth
    this.radius = this.getRadius()
    this.fillColors()
  }

  // 将colors补全
  fillColors () {
    let dis = this.data.length - this.colors.length
    while (dis--) {
      this.colors.push(getRandomColor())
    }
  }

  // 计算legend高度
  getLegendDom () {
    const legends = legendGetter.drawLegendDom(this.data, this.colors)
    this.container.append(legends)
    this.legendHeight = legends.offsetHeight
    this.radius = this.getRadius()
    return legends
  }

  drawLegend () {
    const padding = this.padding
    const legendDom = this.getLegendDom()
    const maxWidth = legendDom.offsetWidth - (padding[1] + padding[3])

    const maxHeight = legendDom.offsetHeight
    const legendCan = legendGetter.drawLegendCan(legendDom, { maxWidth, maxHeight, padding })

    const originPoint = [padding[3], this.can.height - this.legendHeight - padding[2]]
    this.ctx.drawImage(legendCan, ...originPoint)

    this.container.removeChild(legendDom)
  }

  // 画pie主体
  drawPie () {
    const total = this.data.reduce((sum, item) => sum + item.value, 0)
    let originPercent = this.startAngle
    this.data.forEach((item, i) => {
      const percent = +(item.value / total * 2).toFixed(2)
      if (i !== this.data.length - 1) {
        this.drawPiePice(originPercent, originPercent + percent, this.colors[i], item.type)
      } else {
        this.drawPiePice(originPercent, this.startAngle, this.colors[i], item.type)
      }
      originPercent += percent
    })

    this.container.appendChild(this.can)
  }

  /**
   * 画单独的扇形
   * @param {string} color 扇形颜色
   * @param {number} radius 扇形角度(占总数比例的小数)
   */
  drawPiePice (sAngle, eAngle, color, text) {
    const { ctx, radius } = this
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius, sAngle * Math.PI, eAngle * Math.PI, false)
    ctx.closePath()
    ctx.fill()

    window.ctx = ctx

    legendGetter.drawLabel({ ctx, color, text, angle: (sAngle + eAngle) / 2, radius: this.radius })
  }

  /**
   * 通过padding 和 height 计算半径
   */
  getRadius () {
    let radius = this.can.height / 2
    if (this.padding.length) {
      radius -= this.padding[0]
    }
    radius -= this.legendHeight
    return radius
  }

  /**
   * 将canvas原点移动至 center
   * 考虑进padding和legend的影响
   */
  translateOriginToCenter () {
    const { width, height } = this.can
    const { padding, legendHeight } = this
    const [top, right, bottom, left] = padding
    const x = (width - (right + left)) / 2 + left
    const y = (height - (top + bottom + legendHeight)) / 2 + top
    this.ctx.save()
    this.ctx.translate(x, y)
  }

  /**
   * 规整padding长度为4，便于计算
   */
  formatPadding (padding = []) {
    if (!padding.length) {
      padding = [0, 0, 0, 0]
    } else if (padding.length === 2) {
      padding = [...padding, ...padding]
    }
    return padding
  }

}
