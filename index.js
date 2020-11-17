const legendGetter = {
  /**
   * 画出legend
   */
  drawLegend (data, colors) {
    const legendWrapper = document.createElement('div')
    legendWrapper.classList.add('legends')
    data.forEach((item, i) => {
      legendWrapper.appendChild(this.drawLegendItem(item, colors[i]))
    })
    return legendWrapper
  },

  drawLegendItem (data, color) {
    const legendItem = document.createElement('span')
    const legendIcon = document.createElement('i')
    legendItem.innerText = data.type
    legendIcon.style.backgroundColor = color
    legendItem.appendChild(legendIcon)
    return legendItem
  }
}

const getPxNumber = (size) => size.slice(0, -2)

class PieChart {
  constructor ({
    container = 'chart', // 容器id
    data = [], // 数据
    padding = [],
    colors = ['red', 'yellow', 'blue', 'black', 'cyan'],
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
  }
  
  // 计算legend高度
  getLegendDom () {
    const legends = legendGetter.drawLegend(this.data, this.colors)
    this.container.append(legends)
    // TODO: 将legend的dom隐藏 (z-index / visible)legends
    this.legendHeight = legends.offsetHeight
    this.radius = this.getRadius()
    return legends
  }

  drawLegend () {
    const legends = this.getLegendDom()
    const styles = getComputedStyle(legends)
    console.log(styles)
    let { fontSize, width, height } = styles
    fontSize = getPxNumber(fontSize)
    width = getPxNumber(width)
    height = getPxNumber(height)
    console.log(fontSize, width, height)

    this.ctx.fontSize = fontSize
  }

  // TODO: 获取全部 i 和 span，绘制canvas
  drawLegendItem (itemDom) {
  }

  // 画pie主体
  drawPie () {
    const total = this.data.reduce((sum, item) => sum + item.value, 0)
    let originPercent = this.startAngle
    this.data.forEach((item, i) => {
      const percent = +(item.value / total * 2).toFixed(2)
      if (i !== this.data.length - 1) {
        this.drawPiePice(originPercent, originPercent + percent, this.colors[i])
      } else {
        this.drawPiePice(originPercent, this.startAngle, this.colors[i])
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
  drawPiePice (sAngle, eAngle, color) {
    const { ctx, radius, } = this
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius, sAngle * Math.PI, eAngle * Math.PI, false)
    ctx.closePath()
    ctx.fill()
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
