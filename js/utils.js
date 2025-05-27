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
      currentDate: null,
      max: 0,
      maxDate: null,
      min: 0,
      minDate: null,
      variation7d: 0,
      variation7dInfo: ""
    };
  }

  const sortedData = [...data].sort((a, b) => a.date - b.date);
  
  // Nível atual
  const currentRecord = sortedData[sortedData.length - 1];
  const current = currentRecord.level;
  const currentDate = currentRecord.date;

  // Máximo e mínimo com datas
  const maxRecord = sortedData.reduce((max, item) => 
    item.level > max.level ? item : max
  );
  const minRecord = sortedData.reduce((min, item) => 
    item.level < min.level ? item : min
  );

  // Variação dos últimos 7 dias
  const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dataLast7Days = sortedData.filter(d => d.date >= sevenDaysAgo);
  
  let variation7d = 0;
  let variation7dInfo = "Sem dados suficientes";
  
  if (dataLast7Days.length >= 2) {
    const oldestIn7Days = dataLast7Days[0];
    variation7d = current - oldestIn7Days.level;
    const sign = variation7d >= 0 ? "+" : "";
    variation7dInfo = `${sign}${variation7d.toFixed(2)}m`;
  }

  return {
    current,
    currentDate,
    max: maxRecord.level,
    maxDate: maxRecord.date,
    min: minRecord.level,
    minDate: minRecord.date,
    variation7d,
    variation7dInfo
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