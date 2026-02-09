/**
 * 修改文件：services/external/quickChart.ts
 * 变更内容：扩展参数列表以接收颜色数组，并配置黑色字体和 datalabels 插件
 * 实现效果：解决参数数量不匹配报错，支持动态配色
 */
export const generateMonthlyBarChartUrl = (
  labels: string[], 
  data: number[], 
  width: number = 400,
  bgColors: string[], 
  textColors: string[]
) => {
  const chartConfig = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 0,
      }]
    },
    options: {
      // 💡 关键：强制关闭响应式，否则图表会自动缩回默认宽度，导致滑动失效
      responsive: false,
      maintainAspectRatio: false,
      
      legend: { display: false },
      layout: {
        padding: { left: 30, right: 30, top: 40, bottom: 10 }
      },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          color: textColors,
          font: { weight: 'bold', size: 16 },
          formatter: (val: number) => val.toFixed(0)
        }
      },
      scales: {
        yAxes: [{ 
          display: false, 
          ticks: { 
            beginAtZero: true, 
            suggestedMax: data.length > 0 ? Math.max(...data) * 1.4 : 100 
          } 
        }],
        xAxes: [{ 
          gridLines: { 
            display: true,
            drawOnChartArea: false, 
            drawTicks: true,        
            lineWidth: 2,           
            color: '#94A3B8',       
          },
          ticks: { 
            fontColor: '#334155', 
            fontSize: 12,
            padding: 10             
          },
          barPercentage: 0.5 
        }]
      }
    }
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=${width}&h=320&devicePixelRatio=2&plugin=datalabels`;
};