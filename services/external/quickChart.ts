/**
 * 修改文件：services/external/quickChart.ts
 * 变更内容：扩展参数列表以接收颜色数组，并配置黑色字体和 datalabels 插件
 * 实现效果：解决参数数量不匹配报错，支持动态配色
 */

export const generateMonthlyBarChartUrl = (
  labels: string[],
  safeData: number[],
  excessData: (number | null)[], 
  limit: number,
  width: number,
  bgColorsSafe: string[],
  bgColorsExcess: string[],
  maxValue: number
) => {
  const chartConfig = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { data: safeData, backgroundColor: bgColorsSafe },
        { data: excessData, backgroundColor: bgColorsExcess }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      legend: { display: false },
      plugins: {
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          offset: 5,
          color: (ctx: any) => {
            const idx = ctx.dataIndex;
            const e = parseFloat(excessData[idx] as any) || 0;
            return (ctx.datasetIndex === 1 && e > 0) ? '#ef4444' : '#1f2937';
          },
          font: { 
            weight: 'bold', 
            size: 18, 
            family: 'Arial'
          },
          formatter: (val: any, ctx: any) => {
            const idx = ctx.dataIndex;
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const isCurrentMonth = labels[idx] === currentMonthStr;

            if (val === null || val === undefined || isNaN(parseFloat(val))) return '';

            if (!isCurrentMonth) {
              return ctx.datasetIndex === 0 ? parseFloat(val).toFixed(0) : '';
            }

            const e = parseFloat(excessData[idx] as any) || 0;
            const hasExcess = e > 0;
            if (ctx.datasetIndex === (hasExcess ? 1 : 0)) {
              const s = parseFloat(safeData[idx] as any) || 0;
              return (s + e).toFixed(0);
            }
            return '';
          }
        }
      },
      scales: {
        yAxes: [{ 
          stacked: true, 
          display: false, 
          ticks: { 
            beginAtZero: true,
            max: (maxValue || limit) * 1.2
          } 
        }],
        xAxes: [{ 
          stacked: true, 
          gridLines: { display: false }, 
          barPercentage: 0.7, 
          categoryPercentage: 0.85,
          ticks: {
            fontColor: '#1f2937',
            fontSize: 14,
            fontStyle: 'bold'
          }
        }]
      }
    } 
  };

  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=${width}&h=320&devicePixelRatio=2`;
};