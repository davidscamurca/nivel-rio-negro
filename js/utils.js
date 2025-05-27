// Funções utilitárias para manipulação de dados

export function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export function parseDate(dateStr) {
  return new Date(dateStr);
}

export function calculateMovingAverage(data, window) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((sum, item) => sum + item.nivel_rio, 0) / slice.length;
    result.push({ data: data[i].data, nivel_rio: avg });
  }
  return result;
}

export function filterDataByYear(data, year) {
  if (year === "all") return data;
  return data.filter(item => parseDate(item.data).getFullYear() === parseInt(year, 10));
}

export function filterDataByPeriod(data, period) {
  const now = new Date();
  let startDate;
  switch (period) {
    case "last-month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case "last-3-months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case "last-6-months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case "last-year":
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      return data;
  }
  return data.filter(item => parseDate(item.data) >= startDate);
}

export function getStatistics(data) {
  if (!data.length) return { min: 0, max: 0, avg: 0, total: 0 };
  const levels = data.map(item => item.nivel_rio);
  return {
    min: Math.min(...levels),
    max: Math.max(...levels),
    avg: levels.reduce((sum, val) => sum + val, 0) / levels.length,
    total: data.length
  };
} 