/**
 * 修改文件：services/external/quickChart.ts
 * 变更内容：扩展参数列表以接收颜色数组，并配置黑色字体和 datalabels 插件
 * 实现效果：解决参数数量不匹配报错，支持动态配色
 */
// export const generateMonthlyBarChartUrl = (
//   labels: string[], 
//   data: number[], 
//   width: number = 400,
//   bgColors: string[], 
//   textColors: string[]
// ) => {
//   const chartConfig = {
//     type: 'bar',
//     data: {
//       labels: labels,
//       datasets: [{
//         data: data,
//         backgroundColor: bgColors,
//         borderWidth: 0,
//       }]
//     },
//     options: {
//       // 💡 关键：强制关闭响应式，否则图表会自动缩回默认宽度，导致滑动失效
//       responsive: false,
//       maintainAspectRatio: false,
      
//       legend: { display: false },
//       layout: {
//         padding: { left: 30, right: 30, top: 40, bottom: 10 }
//       },
//       plugins: {
//         datalabels: {
//           display: true,
//           anchor: 'end',
//           align: 'top',
//           color: textColors,
//           font: { weight: 'bold', size: 16 },
//           formatter: (val: number) => val.toFixed(0)
//         }
//       },
//       scales: {
//         yAxes: [{ 
//           display: false, 
//           ticks: { 
//             beginAtZero: true, 
//             suggestedMax: data.length > 0 ? Math.max(...data) * 1.4 : 100 
//           } 
//         }],
//         xAxes: [{ 
//           gridLines: { 
//             display: true,
//             drawOnChartArea: false, 
//             drawTicks: true,        
//             lineWidth: 2,           
//             color: '#94A3B8',       
//           },
//           ticks: { 
//             fontColor: '#334155', 
//             fontSize: 12,
//             padding: 10             
//           },
//           barPercentage: 0.5 
//         }]
//       }
//     }
//   };

//   return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=${width}&h=320&devicePixelRatio=2&plugin=datalabels`;
// };

// export const generateMonthlyBarChartUrl = (
//   labels: string[], 
//   safeData: number[], 
//   excessData: number[], 
//   limit: number, 
//   width: number,
//   bgColorsSafe: string[], 
//   bgColorsExcess: string[]
// ) => {
//   const chartConfig = {
//     type: 'bar',
//     data: {
//       labels: labels,
//       datasets: [
//         { data: safeData, backgroundColor: bgColorsSafe },
//         { data: excessData, backgroundColor: bgColorsExcess }
//       ]
//     },
//     options: {
//       responsive: false,
//       maintainAspectRatio: false,
//       legend: { display: false },
//       plugins: {
//         datalabels: {
//           display: true,
//           anchor: 'end',
//           align: 'top',
//           color: '#475569',
//           font: { weight: 'bold', size: 14 },
//           // ✨ 修复：明确 ctx 类型，解决 TypeScript 报错
//           formatter: (val: number, ctx: { dataIndex: number; datasetIndex: number }) => {
//             const idx = ctx.dataIndex;
//             // 逻辑：如果本月超标，只在红色(dataset 1)显示总数；否则在灰色/绿色(dataset 0)显示
//             const hasExcess = excessData[idx] > 0;
//             if (ctx.datasetIndex === (hasExcess ? 1 : 0)) {
//               return (safeData[idx] + excessData[idx]).toFixed(0);
//             }
//             return '';
//           }
//         }
//       },
//       scales: {
//         yAxes: [{ 
//           stacked: true, 
//           display: false, 
//           ticks: { beginAtZero: true, suggestedMax: limit * 1.3 } 
//         }],
//         xAxes: [{ 
//           stacked: true, 
//           gridLines: { display: false },
//           barPercentage: 0.6 
//         }]
//       }
//     }
//   };

//   return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&w=${width}&h=320&devicePixelRatio=2&plugin=datalabels`;
// };

// services/external/quickChart.ts
// services/external/quickChart.ts

// export const generateMonthlyBarChartUrl = (
//   labels: string[],
//   safeData: number[],
//   excessData: number[],
//   limit: number,
//   width: number,
//   bgColorsSafe: string[],
//   bgColorsExcess: string[]
// ) => {
//   // ⚡ 核心改动：在发送给 QuickChart 之前，把所有的 0 全部物理蒸发成 null
//   // 绘图引擎遇到 null 是绝对画不出数字标签的
//   const cleanSafeData = safeData.map(v => (v > 0 ? v : null));
//   const cleanExcessData = excessData.map(v => (v > 0 ? v : null));

//   const chartConfig = {
//     type: 'bar',
//     data: {
//       labels: labels,
//       datasets: [
//         {
//           data: cleanSafeData,
//           backgroundColor: bgColorsSafe,
//           datalabels: { display: true } // 仅在有数据的层开启
//         },
//         {
//           data: cleanExcessData,
//           backgroundColor: bgColorsExcess,
//           datalabels: { display: true } // 仅在有数据的层开启
//         }
//       ]
//     },
//     options: {
//       responsive: false,
//       maintainAspectRatio: false,
//       legend: { display: false },
//       plugins: {
//         datalabels: {
//           // 💡 这里的逻辑是最后的防线
//           anchor: 'end',
//           align: 'top',
//           color: '#475569',
//           font: { weight: 'bold', size: 14 },
//           formatter: (val: any, ctx: any) => {
//             const num = parseFloat(val);
//             // 只要不是正数，连一个空格都不给它，直接回空
//             if (!num || isNaN(num) || num <= 0) return '';

//             const idx = ctx.dataIndex;
//             const now = new Date();
//             const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//             const isCurrentMonth = labels[idx] === currentMonthStr;

//             // 历史月：只在第一层显示总数
//             if (!isCurrentMonth) {
//               return ctx.datasetIndex === 0 ? num.toFixed(0) : '';
//             }

//             // 本月：逻辑拆分显示
//             const s = parseFloat(cleanSafeData[idx] as any) || 0;
//             const e = parseFloat(cleanExcessData[idx] as any) || 0;
//             if (ctx.datasetIndex === (e > 0 ? 1 : 0)) {
//               return (s + e).toFixed(0);
//             }
//             return '';
//           }
//         }
//       },
//       scales: {
//         yAxes: [{ stacked: true, display: false, ticks: { beginAtZero: true, suggestedMax: limit * 1.2 } }],
//         xAxes: [{ stacked: true, gridLines: { display: false }, barPercentage: 0.6 }]
//       }
//     }
//   };

//   // ⚠️ 增加一个随机参数 t=${Date.now()} 强制刷新缓存，防止你看的是旧图！
//   const jsonStr = encodeURIComponent(JSON.stringify(chartConfig));
//   return `https://quickchart.io/chart?c=${jsonStr}&w=${width}&h=320&devicePixelRatio=2&t=${Date.now()}`;
// };


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
          color: '#1f2937',
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