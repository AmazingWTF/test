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
    this.padding = padding
    this.init(container)

    this.drawPie()
  }

  init (container) {
    this.can = document.createElement('canvas')
    this.ctx = this.can.getContext('2d')
    this.container = document.getElementById(container)
    this.can.height = this.container.offsetHeight
    this.can.width = this.container.offsetWidth
    this.radius = this.getRadius()
    this.translateOriginToCenter()

    const legends = this.drawLegend()
    document.body.appendChild(legends)
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
   * 画出legend
   */
  drawLegend () {
    const legendWrapper = document.createElement('div')
    legendWrapper.classList.add('legends')
    this.data.forEach((data, i) => {
      legendWrapper.appendChild(this.drawLegendItem(data, i))
    })
    return legendWrapper
  }

  drawLegendItem (data, i) {
    const legendItem = document.createElement('span')
    const legendIcon = document.createElement('i')
    legendItem.innerText = data.type
    legendIcon.style.backgroundColor = this.colors[i]
    legendItem.appendChild(legendIcon)
    return legendItem
  }

  /**
   * 通过padding 和 height 计算半径
   */
  getRadius () {
    let radius = this.can.height / 2
    if (this.padding.length) {
      radius -= this.padding[0]
    }
    return radius
  }

  /**
   * 将canvas原点移动至 center
   */
  translateOriginToCenter () {
    const { width, height } = this.can
    this.ctx.translate(width / 2, height / 2)
  }
}
