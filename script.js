// Importando funções utilitárias
import { formatDate, parseDate, calculateMovingAverage, filterDataByYear, filterDataByPeriod, getStatistics } from "./js/utils.js";

// Configuração global do Chart.js
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.defaults.color = '#374151';
Chart.defaults.plugins.tooltip.backgroundColor = '#1f2937';
Chart.defaults.plugins.tooltip.titleColor = '#ffffff';
Chart.defaults.plugins.tooltip.bodyColor = '#ffffff';
Chart.defaults.plugins.tooltip.cornerRadius = 8;

// Variáveis globais
let riverData = [];
let annualComparisonChart = null;
let trendsChart = null;
let filteredData = [];

// Cores para os gráficos
const colors = {
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gradient: {
        blue: ['#dbeafe', '#1e40af'],
        cyan: ['#cffafe', '#06b6d4'],
        green: ['#d1fae5', '#10b981'],
        red: ['#fee2e2', '#ef4444']
    }
};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-container';
    loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
    document.querySelector('.main .container').prepend(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading-container');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.main .container').prepend(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.main .container').prepend(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

async function initializeApp() {
    try {
        showLoading();
        await loadData();
        initializeCharts();
        setupEventListeners();
        updateStats();
        setupFilters();
        showSuccess('Dados carregados com sucesso!');
        console.log('Aplicação inicializada com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        showError('Erro ao carregar os dados. Tente recarregar a página.');
    } finally {
        hideLoading();
    }
}

async function loadData() {
    try {
        await loadRealData('data/rio-negro-data.json');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showError('Erro ao carregar os dados do arquivo JSON');
    }
}

function generateSampleData() {
    const data = [];
    const startDate = new Date('2000-01-01');
    const endDate = new Date();
    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let currentLevel = 15.0; // Nível inicial em metros
    
    for (let i = 0; i <= totalDays; i += 7) { // Dados semanais para performance
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        
        // Simular variação sazonal (cheia/seca)
        const dayOfYear = getDayOfYear(date);
        const seasonalFactor = Math.sin((dayOfYear / 365) * 2 * Math.PI) * 8; // Variação de ±8m
        
        // Adicionar ruído aleatório
        const randomVariation = (Math.random() - 0.5) * 2; // ±1m
        
        // Calcular nível base (entre 10m e 30m)
        const baseLevel = 20 + seasonalFactor + randomVariation;
        currentLevel = Math.max(8, Math.min(32, baseLevel));
        
        // Calcular variação em relação ao dia anterior
        const variation = i === 0 ? 0 : (Math.random() - 0.5) * 20; // ±10cm
        
        data.push({
            data: date.toISOString().split('T')[0],
            nivel_rio: parseFloat(currentLevel.toFixed(1)),
            encheu_vazou: parseFloat(variation.toFixed(1))
        });
    }
    
    return data;
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function initializeCharts() {
    createAnnualComparisonChart();
    createTrendsChart();
}

function createAnnualComparisonChart() {
    const ctx = document.getElementById('annual-comparison-chart').getContext('2d');
    
    // Preparar dados por ano (similar ao seu gráfico matplotlib)
    const yearlyData = prepareYearlyComparisonData();
    
    const datasets = [];
    // Cores exatas do seu matplotlib
    const yearColors = {
        2019: '#1f77b4',  // Azul
        2020: '#ff7f0e',  // Laranja
        2021: '#2ca02c',  // Verde
        2022: '#d62728',  // Vermelho
        2023: '#9467bd',  // Roxo
        2024: '#8c564b',  // Marrom
        2025: '#e377c2'   // Rosa
    };
    
    const currentYear = new Date().getFullYear();
    
    Object.keys(yearlyData).sort().forEach(year => {
        const data = yearlyData[year];
        if (data && data.length > 0) {
            // Estilos diferenciados como no seu código
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
                data: data,
                borderColor: yearColors[year] || '#666666',
                backgroundColor: 'transparent',
                borderWidth: lineWidth,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: yearColors[year],
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                globalAlpha: alpha
            });
        }
    });
    
    annualComparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: generateDayMonthLabels(),
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
                    position: 'lower left',
                    align: 'start',
                    labels: {
                        usePointStyle: false,
                        padding: 15,
                        font: {
                            size: 12
                        },
                        generateLabels: function(chart) {
                            const original = Chart.defaults.plugins.legend.labels.generateLabels;
                            const labels = original.call(this, chart);
                            
                            // Organizar em 2 colunas como no matplotlib
                            return labels;
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
                    grid: {
                        display: false  // Sem grid como no matplotlib
                    },
                    ticks: {
                        maxTicksLimit: 12,
                        font: {
                            size: 14
                        },
                        callback: function(value, index) {
                            // Mostrar apenas alguns meses
                            const label = this.getLabelForValue(value);
                            const parts = label.split('-');
                            if (parts[0] === '01') { // Primeiro dia do mês
                                return parts[1];
                            }
                            return '';
                        }
                    }
                },
                y: {
                    grid: {
                        display: false  // Sem grid como no matplotlib
                    },
                    ticks: {
                        font: {
                            size: 14
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

function createTrendsChart() {
    const ctx = document.getElementById('trends-chart').getContext('2d');
    
    // Calcular médias móveis
    const trendsData = calculateMovingAverages();
    
    // Cores exatas do seu matplotlib
    const trendColors = {
        'Nível do Rio': '#0072B2',
        'MM 6M': '#D55E00',
        'MM 1A': '#CC79A7', 
        'MM 2A': '#009E73'
    };
    
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendsData.labels,
            datasets: [
                {
                    label: 'Nível do Rio',
                    data: trendsData.levels,
                    borderColor: trendColors['Nível do Rio'],
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: trendColors['Nível do Rio'],
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                },
                {
                    label: 'MM 6M',
                    data: trendsData.ma6m,
                    borderColor: trendColors['MM 6M'],
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
                    data: trendsData.ma1y,
                    borderColor: trendColors['MM 1A'],
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
                    data: trendsData.ma2y,
                    borderColor: trendColors['MM 2A'],
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
                            const date = new Date(context[0].label);
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
                    type: 'category',
                    grid: {
                        display: false  // Sem grid como no matplotlib
                    },
                    ticks: {
                        font: {
                            size: 12
                        },
                        maxTicksLimit: 20,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(value);
                            const date = new Date(label);
                            // Mostrar apenas algumas datas para não sobrecarregar
                            if (index % Math.floor(this.chart.data.labels.length / 10) === 0) {
                                return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                            }
                            return '';
                        }
                    }
                },
                y: {
                    grid: {
                        display: false  // Sem grid como no matplotlib
                    },
                    ticks: {
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

function prepareYearlyComparisonData() {
    const yearlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Processar dados para cada ano
    for (let year = 2019; year <= 2025; year++) {
        const yearData = filteredData.filter(d => new Date(d.data).getFullYear() === year);
        if (yearData.length > 0) {
            // Converter para formato dia-mês e agrupar
            const dayMonthData = {};
            yearData.forEach(d => {
                const date = new Date(d.data);
                const dayMonth = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                dayMonthData[dayMonth] = d.nivel_rio;
            });
            
            // Criar array ordenado para o ano
            const labels = generateDayMonthLabels();
            yearlyData[year] = labels.map(label => dayMonthData[label] || null);
        }
    }
    
    return yearlyData;
}

function generateDayMonthLabels() {
    const labels = [];
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Considerando ano bissexto
    
    months.forEach((month, monthIndex) => {
        for (let day = 1; day <= daysInMonth[monthIndex]; day++) {
            labels.push(`${String(day).padStart(2, '0')}-${month}`);
        }
    });
    
    return labels;
}

function calculateMovingAverages() {
    const sortedData = [...filteredData].sort((a, b) => new Date(a.data) - new Date(b.data));
    
    const labels = sortedData.map(d => d.data);
    const levels = sortedData.map(d => d.nivel_rio);
    
    // Calcular médias móveis com janelas menores para dados diários
    const ma6m = calculateMovingAverage(levels, 180); // ~6 meses
    const ma1y = calculateMovingAverage(levels, 365); // ~1 ano  
    const ma2y = calculateMovingAverage(levels, 730); // ~2 anos
    
    console.log('Dados para médias móveis:', {
        totalPoints: levels.length,
        ma6mPoints: ma6m.filter(v => v !== null).length,
        ma1yPoints: ma1y.filter(v => v !== null).length,
        ma2yPoints: ma2y.filter(v => v !== null).length
    });
    
    return {
        labels,
        levels,
        ma6m,
        ma1y,
        ma2y
    };
}

function setupEventListeners() {
    // Filtro por ano
    document.getElementById('year-filter').addEventListener('change', function() {
        applyFilters();
    });
    
    // Filtro por período
    document.getElementById('period-filter').addEventListener('change', function() {
        applyFilters();
    });
    
    // Botão de reset zoom
    document.getElementById('reset-zoom').addEventListener('click', function() {
        resetZoom();
    });
}

function setupFilters() {
    // Preencher dropdown de anos
    const years = [...new Set(riverData.map(d => new Date(d.data).getFullYear()))].sort((a, b) => b - a);
    const yearSelect = document.getElementById('year-filter');
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

function applyFilters() {
    const yearFilter = document.getElementById('year-filter').value;
    const periodFilter = document.getElementById('period-filter').value;
    
    let filtered = [...riverData];
    
    // Filtrar por ano
    if (yearFilter !== 'all') {
        filtered = filtered.filter(d => new Date(d.data).getFullYear() == yearFilter);
    }
    
    // Filtrar por período
    if (periodFilter !== 'all') {
        const now = new Date();
        let startDate;
        
        switch (periodFilter) {
            case 'last-year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case 'last-6-months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                break;
            case 'last-3-months':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'last-month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
        }
        
        if (startDate) {
            filtered = filtered.filter(d => new Date(d.data) >= startDate);
        }
    }
    
    filteredData = filtered;
    updateCharts();
    updateStats();
}

function updateCharts() {
    // Atualizar gráfico de comparação anual
    const yearlyData = prepareYearlyComparisonData();
    const yearColors = {
        2019: '#1f77b4', 2020: '#ff7f0e', 2021: '#2ca02c',
        2022: '#d62728', 2023: '#9467bd', 2024: '#8c564b', 2025: '#e377c2'
    };
    
    const currentYear = new Date().getFullYear();
    annualComparisonChart.data.datasets = [];
    
    Object.keys(yearlyData).sort().forEach(year => {
        const data = yearlyData[year];
        if (data && data.length > 0) {
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
            
            annualComparisonChart.data.datasets.push({
                label: `COTA ${year}`,
                data: data,
                borderColor: yearColors[year] || '#666666',
                backgroundColor: 'transparent',
                borderWidth: lineWidth,
                fill: false,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: yearColors[year],
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                globalAlpha: alpha
            });
        }
    });
    annualComparisonChart.update('none');
    
    // Atualizar gráfico de tendências
    const trendsData = calculateMovingAverages();
    trendsChart.data.labels = trendsData.labels;
    trendsChart.data.datasets[0].data = trendsData.levels;
    trendsChart.data.datasets[1].data = trendsData.ma6m;
    trendsChart.data.datasets[2].data = trendsData.ma1y;
    trendsChart.data.datasets[3].data = trendsData.ma2y;
    trendsChart.update('none');
}

function updateStats() {
    if (filteredData.length === 0) return;
    
    const sortedData = [...filteredData].sort((a, b) => new Date(a.data) - new Date(b.data));
    const levels = sortedData.map(d => d.nivel_rio);
    const variations = sortedData.map(d => d.encheu_vazou);
    
    // Dados mais recentes
    const latestData = sortedData[sortedData.length - 1];
    const currentLevel = latestData.nivel_rio;
    const currentVariation = latestData.encheu_vazou;
    
    // Encontrar máximo e mínimo com suas datas
    const maxLevel = Math.max(...levels);
    const minLevel = Math.min(...levels);
    
    const maxIndex = levels.indexOf(maxLevel);
    const minIndex = levels.indexOf(minLevel);
    
    const maxDate = new Date(sortedData[maxIndex].data);
    const minDate = new Date(sortedData[minIndex].data);
    
    // Determinar tendência (enchendo/vazando)
    let trendText = '';
    let trendIcon = '';
    if (currentVariation > 0) {
        trendText = 'Enchendo';
        trendIcon = '📈';
    } else if (currentVariation < 0) {
        trendText = 'Vazando';
        trendIcon = '📉';
    } else {
        trendText = 'Estável';
        trendIcon = '➡️';
    }
    
    // Atualizar elementos
    document.getElementById('current-level').textContent = currentLevel.toFixed(2) + 'm';
    
    const variationElement = document.getElementById('variation');
    variationElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>${trendIcon}</span>
            <div>
                <div>${(currentVariation > 0 ? '+' : '') + currentVariation.toFixed(1)}cm</div>
                <div style="font-size: 0.8em; opacity: 0.8;">${trendText}</div>
            </div>
        </div>
    `;
    
    document.getElementById('max-level').innerHTML = `
        <div>
            <div>${maxLevel.toFixed(2)}m</div>
            <div style="font-size: 0.8em; opacity: 0.8;">${maxDate.getFullYear()}</div>
        </div>
    `;
    
    document.getElementById('min-level').innerHTML = `
        <div>
            <div>${minLevel.toFixed(2)}m</div>
            <div style="font-size: 0.8em; opacity: 0.8;">${minDate.getFullYear()}</div>
        </div>
    `;
    
    // Calcular estatísticas adicionais
    const averageLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
    const totalRecords = sortedData.length;
    
    // Atualizar novos elementos
    document.getElementById('total-records').textContent = totalRecords.toLocaleString('pt-BR');
    document.getElementById('average-level').textContent = averageLevel.toFixed(2) + 'm';
    
    // Atualizar última atualização
    const lastDate = new Date(latestData.data);
    document.getElementById('last-update').textContent = 
        lastDate.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
}

function resetZoom() {
    annualComparisonChart.resetZoom();
    trendsChart.resetZoom();
}

// Função para exportar dados (útil para desenvolvimento)
function exportData() {
    const dataStr = JSON.stringify(riverData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rio-negro-data.json';
    link.click();
}

// Função para importar dados reais
async function loadRealData(jsonFile) {
    try {
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        riverData = data;
        filteredData = [...riverData];
        
        console.log('Dados carregados:', {
            total: riverData.length,
            primeiro: riverData[0],
            ultimo: riverData[riverData.length - 1]
        });
        
        updateCharts();
        updateStats();
        setupFilters();
    } catch (error) {
        console.error('Erro ao carregar dados reais:', error);
        showError('Erro ao carregar dados do arquivo JSON');
        throw error;
    }
}

// Disponibilizar funções globalmente para debug
window.riverApp = {
    exportData,
    loadRealData,
    riverData: () => riverData,
    filteredData: () => filteredData
}; 