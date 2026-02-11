// services/external/quickChart.ts

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
        { 
          // 🛑 绝对不写 label
          data: safeData, 
          backgroundColor: bgColorsSafe 
        },
        { 
          // 🛑 绝对不写 label
          data: excessData, 
          backgroundColor: bgColorsExcess 
        }
      ]
    },
    options: {
      // 🔥 终极招式 1：在 options 根部直接暴力禁用
      legend: false, 
      layout: {
        padding: {
          top: 35,    // 给顶部留出足够高度放数字
          bottom: 10,
          left: 10,
          right: 10
        }
      },
      plugins: {
        legend: { display: false }, // 双重保险
        datalabels: {
          display: true,
          anchor: 'end',
          align: 'top',
          color: '#1f2937',
          font: { weight: 'bold', size: 16 },
          formatter: (val: any, ctx: any) => {
            const idx = ctx.dataIndex;
            const isLast = idx === labels.length - 1;
            if (val === null || val === undefined) return '';
            if (!isLast) return ctx.datasetIndex === 0 ? Math.round(val).toString() : '';
            return (ctx.datasetIndex === 1 && val > 0) ? `Excess: +${Math.round(val)}` : '';
          }
        }
      },
      scales: {
        yAxes: [{ stacked: true, display: false, ticks: { beginAtZero: true, max: Math.max(maxValue, limit) * 1.3 } }],
        xAxes: [{ stacked: true, gridLines: { display: false }, ticks: { fontStyle: 'bold' } }]
      }
    } 
  };

  // 🔥 终极招式 2：使用 Date.now() 确保每一毫秒生成的 URL 都是全新的，彻底杀死缓存
  const timestamp = Date.now();
  return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=${width}&h=300&v=${timestamp}`;
};

