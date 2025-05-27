// Importando funções utilitárias
import {
    formatDate,
    parseDate,
    calculateMovingAverage,
    filterDataByYear,
    filterDataByPeriod,
    getStatistics,
    getUniqueYears,
    groupDataByYear,
    calculatePercentiles
} from './js/utils.js';

// Configuração global do Chart.js
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6c757d';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 4;

// Variáveis globais
let allData = [];
let dailyChart = null;
let yearlyChart = null;

// Cores para os gráficos (exatamente como no Python)
const colors = {
    // Cores para o gráfico de médias móveis
    daily: {
        level: '#0072B2',    // Azul
        ma6m: '#D55E00',     // Laranja
        ma1y: '#CC79A7',     // Rosa
        ma2y: '#009E73'      // Verde
    },
    // Cores para o gráfico anual (cores do matplotlib)
    yearly: {
        2019: '#1f77b4',     // Azul
        2020: '#ff7f0e',     // Laranja
        2021: '#2ca02c',     // Verde
        2022: '#d62728',     // Vermelho
        2023: '#9467bd',     // Roxo
        2024: '#8c564b',     // Marrom
        2025: '#e377c2'      // Rosa
    }
};

// Funções auxiliares para replicar o comportamento do Python

// Remove outliers pelo método IQR (igual ao Python)
function removeOutliersIQR(data, key = 'level') {
    const values = data.map(d => d[key]).sort((a, b) => a - b);
    const q1 = values[Math.floor(values.length * 0.25)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    return data.filter(d => d[key] >= lower && d[key] <= upper);
}

// Gera labels de dia-mês (igual ao Python)
function generateDayMonthLabels() {
    const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 2020 é bissexto
    const labels = [];
    
    for (let m = 0; m < 12; m++) {
        for (let d = 1; d <= daysInMonth[m]; d++) {
            labels.push(`${String(d).padStart(2, '0')}-${monthAbbr[m]}`);
        }
    }
    return labels;
}

// Deduplica dados por dia-mês (mantém o último registro, igual ao Python)
function deduplicateByDayMonth(data) {
    const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const map = new Map();
    
    data.forEach(d => {
        const dayMonth = `${String(d.date.getDate()).padStart(2, '0')}-${monthAbbr[d.date.getMonth()]}`;
        map.set(dayMonth, d.level); // sobrescreve, mantendo o último
    });
    
    return map;
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Função para inicializar a aplicação
async function initializeApp() {
    console.log('Iniciando aplicação...');
    try {
        await loadData();
        updateUI();
    } catch (error) {
        console.error('Erro ao inicializar a aplicação:', error);
        alert('Erro ao carregar os dados. Por favor, tente novamente mais tarde.');
    }
}

// Função para carregar os dados
async function loadData() {
    console.log('Carregando dados...');
    try {
        const response = await fetch('/data/rio-negro-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        console.log('Dados brutos recebidos:', rawData.length, 'registros');

        // Processar os dados
        allData = rawData.map(item => ({
            date: new Date(item.data),
            level: parseFloat(item.nivel_rio)
        })).sort((a, b) => a.date - b.date);

        console.log('Dados processados:', allData.length, 'registros');
        console.log('Primeiro registro:', allData[0]);
        console.log('Último registro:', allData[allData.length - 1]);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        throw error;
    }
}

// Função para atualizar a interface
function updateUI() {
    console.log('Atualizando interface...');
    
    // Atualizar estatísticas (sem outliers para consistência)
    const dataNoOutliers = removeOutliersIQR(allData);
    const stats = getStatistics(dataNoOutliers);
    updateStatistics(stats);

    // Atualizar gráficos
    createYearlyChart(allData); // Gráfico anual não remove outliers
    createDailyChart(allData);  // Gráfico de médias móveis remove outliers internamente
}

// Função para atualizar as estatísticas
function updateStatistics(stats) {
    document.getElementById('current-level').textContent = stats.current.toFixed(2);
    document.getElementById('trend').textContent = stats.trend.toFixed(2);
    document.getElementById('max-level').textContent = stats.max.toFixed(2);
    document.getElementById('min-level').textContent = stats.min.toFixed(2);
    document.getElementById('total-readings').textContent = stats.total;
    document.getElementById('avg-level').textContent = stats.average.toFixed(2);
}

// Função para criar o gráfico anual (exatamente como no Python)
function createYearlyChart(data) {
    const ctx = document.getElementById('yearlyChart').getContext('2d');
    
    if (yearlyChart) {
        yearlyChart.destroy();
    }

    // Preparar dados por ano (igual ao Python)
    const yearlyData = {};
    const currentYear = new Date().getFullYear();
    const dayMonthLabels = generateDayMonthLabels();
    
    // Processar dados para cada ano individualmente
    for (let year = 2019; year <= 2025; year++) {
        const yearData = data.filter(d => d.date.getFullYear() === year);
        if (yearData.length > 0) {
            // Deduplica por dia-mês (mantém o último registro)
            const dayMonthMap = deduplicateByDayMonth(yearData);
            
            // Criar array ordenado para o ano
            yearlyData[year] = dayMonthLabels.map(label => dayMonthMap.get(label) || null);
        }
    }

    const datasets = [];
    Object.keys(yearlyData).sort().forEach(year => {
        const yearData = yearlyData[year];
        if (yearData && yearData.length > 0) {
            // Estilos diferenciados (igual ao Python)
            let lineWidth, alpha;
            if (year == currentYear) {
                lineWidth = 3.0;
                alpha = 1.0;
            } else if (year >= currentYear - 3) {
                lineWidth = 2.5;
                alpha = 0.8;
            } else {
                lineWidth = 1.5;
                alpha = 0.6;
            }
            
            datasets.push({
                label: `COTA ${year}`,
                data: yearData,
                borderColor: colors.yearly[year] || '#666666',
                backgroundColor: 'transparent',
                borderWidth: lineWidth,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors.yearly[year],
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2
            });
        }
    });

    yearlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dayMonthLabels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'start',
                    labels: {
                        usePointStyle: false,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                    callbacks: {
                        title: function(context) {
                            return `Dia ${context[0].label}`;
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === null || value === undefined) return null;
                            return `${context.dataset.label}: ${value.toFixed(2)}m`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        font: {
                            size: 12
                        },
                        maxTicksLimit: 12,
                        autoSkip: true,
                        callback: function(value, index) {
                            const label = dayMonthLabels[index];
                            if (label && label.startsWith('01-')) {
                                return label.split('-')[1]; // Retorna apenas o mês
                            }
                            return '';
                        }
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value.toFixed(1) + 'm';
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
}

// Função para criar o gráfico de médias móveis (exatamente como no Python)
function createDailyChart(data) {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    
    if (dailyChart) {
        dailyChart.destroy();
    }

    // Remover outliers (igual ao Python)
    const dataNoOutliers = removeOutliersIQR(data);
    console.log(`Dados após remoção de outliers: ${dataNoOutliers.length} de ${data.length} registros`);

    // Calcular médias móveis (janelas iguais ao Python)
    const ma6m = calculateMovingAverage(dataNoOutliers.map(d => d.level), 182); // ~6 meses
    const ma1y = calculateMovingAverage(dataNoOutliers.map(d => d.level), 365); // ~1 ano
    const ma2y = calculateMovingAverage(dataNoOutliers.map(d => d.level), 730); // ~2 anos

    // Criar labels simples para o eixo X
    const xLabels = dataNoOutliers.map((d, index) => {
        if (index % 365 === 0) { // A cada ano aproximadamente
            return d.date.getFullYear().toString();
        } else if (index % 30 === 0) { // A cada mês aproximadamente
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                              'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            return monthNames[d.date.getMonth()];
        }
        return '';
    });

    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [
                {
                    label: 'Nível do Rio',
                    data: dataNoOutliers.map(d => d.level),
                    borderColor: colors.daily.level,
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: colors.daily.level,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                },
                {
                    label: 'MM 6M',
                    data: ma6m,
                    borderColor: colors.daily.ma6m,
                    backgroundColor: 'transparent',
                    borderWidth: 1.0,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'MM 1A',
                    data: ma1y,
                    borderColor: colors.daily.ma1y,
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderDash: [10, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'MM 2A',
                    data: ma2y,
                    borderColor: colors.daily.ma2y,
                    backgroundColor: 'transparent',
                    borderWidth: 2.0,
                    borderDash: [2, 2],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'start',
                    labels: {
                        usePointStyle: false,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#1f2937',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    cornerRadius: 8,
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            const date = dataNoOutliers[index].date;
                            return date.toLocaleDateString('pt-BR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            });
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            if (value === null || value === undefined) return null;
                            return `${context.dataset.label}: ${value.toFixed(1)}m`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    type: 'category',
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        font: {
                            size: 12
                        },
                        maxTicksLimit: 20,
                        autoSkip: false
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            return value.toFixed(1) + 'm';
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
}

// Função para exportar dados (útil para desenvolvimento)
function exportData() {
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rio-negro-data.json';
    link.click();
}

// Disponibilizar funções globalmente para debug
window.riverApp = {
    exportData,
    riverData: () => allData,
    removeOutliers: () => removeOutliersIQR(allData)
}; 