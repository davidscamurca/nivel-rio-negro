// Funções utilitárias para manipulação de dados

export function formatDate(date) {
  return date.toLocaleDateString("pt-BR");
}

export function parseDate(dateStr) {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}

export function calculateMovingAverage(data, windowSize) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const sum = window.reduce((a, b) => a + b, 0);
    result.push(sum / window.length);
  }
  return result;
}

export function filterDataByYear(data, year) {
  return data.filter(item => item.date.getFullYear() === year);
}

export function filterDataByPeriod(data, days) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  return data.filter(item => item.date >= startDate && item.date <= endDate);
}

export function getStatistics(data) {
  if (!data || data.length === 0) {
    return {
      current: 0,
      trend: 0,
      max: 0,
      min: 0,
      total: 0,
      average: 0
    };
  }

  const sortedData = [...data].sort((a, b) => a.date - b.date);
  const levels = sortedData.map(d => d.level);
  
  // Nível atual e tendência
  const current = levels[levels.length - 1];
  const previous = levels[levels.length - 2] || current;
  const trend = current - previous;

  // Estatísticas básicas
  const max = Math.max(...levels);
  const min = Math.min(...levels);
  const total = levels.length;
  const average = levels.reduce((a, b) => a + b, 0) / total;

  return {
    current,
    trend,
    max,
    min,
    total,
    average
  };
}

export function getUniqueYears(data) {
  const years = new Set(data.map(item => item.date.getFullYear()));
  return Array.from(years).sort((a, b) => a - b);
}

export function groupDataByYear(data) {
  const grouped = {};
  data.forEach(item => {
    const year = item.date.getFullYear();
    if (!grouped[year]) {
      grouped[year] = [];
    }
    grouped[year].push(item);
  });
  return grouped;
}

export function calculatePercentiles(data, percentiles = [25, 50, 75]) {
  const sorted = [...data].sort((a, b) => a - b);
  return percentiles.map(p => {
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  });
} 