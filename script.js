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

// Variáveis globais
let allData = [];

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

// Função para criar o gráfico anual com Plotly (MUITO mais simples!)
function createYearlyChart(data) {
    const dayMonthLabels = generateDayMonthLabels();
    const currentYear = new Date().getFullYear();
    const traces = [];
    
    // Encontrar o último dia disponível em 2025 (dia atual da série)
    const data2025 = data.filter(d => d.date.getFullYear() === 2025);
    let referenceDayMonth = null;
    let referenceIndex = null;
    
    if (data2025.length > 0) {
        const lastDate2025 = data2025[data2025.length - 1].date;
        const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        referenceDayMonth = `${String(lastDate2025.getDate()).padStart(2, '0')}-${monthAbbr[lastDate2025.getMonth()]}`;
        referenceIndex = dayMonthLabels.indexOf(referenceDayMonth);
        console.log(`Dia de referência: ${referenceDayMonth} (índice: ${referenceIndex})`);
    }
    
    // Processar dados para cada ano
    for (let year = 2019; year <= 2025; year++) {
        const yearData = data.filter(d => d.date.getFullYear() === year);
        if (yearData.length > 0) {
            // Deduplica por dia-mês
            const dayMonthMap = deduplicateByDayMonth(yearData);
            const yValues = dayMonthLabels.map(label => dayMonthMap.get(label) || null);
            
            // Estilo da linha baseado no ano
            let lineWidth;
            if (year == currentYear) {
                lineWidth = 3;
            } else if (year >= currentYear - 3) {
                lineWidth = 2.5;
            } else {
                lineWidth = 1.5;
            }
            
            traces.push({
                x: dayMonthLabels,
                y: yValues,
                type: 'scatter',
                mode: 'lines',
                name: `COTA ${year}`,
                line: {
                    color: colors.yearly[year],
                    width: lineWidth
                },
                connectgaps: false
            });
        }
    }
    
    // Adicionar linha vertical no dia de referência (se encontrado)
    if (referenceDayMonth && referenceIndex !== -1) {
        traces.push({
            x: [referenceDayMonth, referenceDayMonth],
            y: [0, 35], // Ajustar conforme o range dos seus dados
            type: 'scatter',
            mode: 'lines',
            name: 'Dia Atual',
            line: {
                color: 'rgba(255, 0, 0, 0.8)',
                width: 2,
                dash: 'dash'
            },
            showlegend: true,
            hoverinfo: 'skip'
        });
        
        // Adicionar pontos destacados no dia de referência para cada ano
        for (let year = 2019; year <= 2025; year++) {
            const yearData = data.filter(d => d.date.getFullYear() === year);
            if (yearData.length > 0) {
                const dayMonthMap = deduplicateByDayMonth(yearData);
                const valueAtReference = dayMonthMap.get(referenceDayMonth);
                
                if (valueAtReference !== undefined && valueAtReference !== null) {
                    traces.push({
                        x: [referenceDayMonth],
                        y: [valueAtReference],
                        type: 'scatter',
                        mode: 'markers',
                        name: `${year}: ${valueAtReference.toFixed(2)}m`,
                        marker: {
                            color: colors.yearly[year],
                            size: 8,
                            symbol: 'circle',
                            line: {
                                color: 'white',
                                width: 2
                            }
                        },
                        showlegend: false,
                        hovertemplate: `<b>COTA ${year}</b><br>` +
                                     `Data: ${referenceDayMonth}<br>` +
                                     `Nível: ${valueAtReference.toFixed(2)}m<br>` +
                                     '<extra></extra>'
                    });
                }
            }
        }
    }
    
    const layout = {
        title: {
            text: 'Comparação de Níveis do Rio (2019-2025)',
            font: { size: 20, family: 'Inter' }
        },
        xaxis: {
            title: 'Data (Dia-Mês)',
            tickmode: 'array',
            tickvals: dayMonthLabels.filter((label, index) => label.startsWith('01-')),
            ticktext: dayMonthLabels.filter((label, index) => label.startsWith('01-')).map(label => label.split('-')[1]),
            showgrid: false
        },
        yaxis: {
            title: 'Nível do Rio (m)',
            showgrid: false
        },
        legend: {
            x: 0.02,
            y: 0.98,
            bgcolor: 'rgba(255,255,255,0.9)'
        },
        margin: { l: 60, r: 30, t: 60, b: 60 },
        font: { family: 'Inter' },
        annotations: referenceDayMonth ? [{
            x: referenceDayMonth,
            y: 0.95,
            xref: 'x',
            yref: 'paper',
            text: `Dia Atual: ${referenceDayMonth}`,
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1,
            arrowwidth: 2,
            arrowcolor: 'red',
            ax: 0,
            ay: -30,
            font: {
                color: 'red',
                size: 12
            },
            bgcolor: 'rgba(255,255,255,0.9)',
            bordercolor: 'red',
            borderwidth: 1
        }] : []
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('yearlyChart', traces, layout, config);
}

// Função para criar o gráfico de médias móveis com Plotly (MUITO mais simples!)
function createDailyChart(data) {
    // Remover outliers
    const dataNoOutliers = removeOutliersIQR(data);
    console.log(`Dados após remoção de outliers: ${dataNoOutliers.length} de ${data.length} registros`);
    
    // Calcular médias móveis
    const ma6m = calculateMovingAverage(dataNoOutliers.map(d => d.level), 182);
    const ma1y = calculateMovingAverage(dataNoOutliers.map(d => d.level), 365);
    const ma2y = calculateMovingAverage(dataNoOutliers.map(d => d.level), 730);
    
    const dates = dataNoOutliers.map(d => d.date);
    
    const traces = [
        {
            x: dates,
            y: dataNoOutliers.map(d => d.level),
            type: 'scatter',
            mode: 'lines',
            name: 'Nível do Rio',
            line: { color: colors.daily.level, width: 1.5 }
        },
        {
            x: dates,
            y: ma6m,
            type: 'scatter',
            mode: 'lines',
            name: 'MM 6M',
            line: { color: colors.daily.ma6m, width: 1, dash: 'dash' }
        },
        {
            x: dates,
            y: ma1y,
            type: 'scatter',
            mode: 'lines',
            name: 'MM 1A',
            line: { color: colors.daily.ma1y, width: 1.5, dash: 'dashdot' }
        },
        {
            x: dates,
            y: ma2y,
            type: 'scatter',
            mode: 'lines',
            name: 'MM 2A',
            line: { color: colors.daily.ma2y, width: 2, dash: 'dot' }
        }
    ];
    
    const layout = {
        title: {
            text: 'Nível do Rio e Médias Móveis',
            font: { size: 20, family: 'Inter' }
        },
        xaxis: {
            title: 'Data',
            showgrid: false
        },
        yaxis: {
            title: 'Nível do Rio (m)',
            showgrid: false
        },
        legend: {
            x: 0.02,
            y: 0.98,
            bgcolor: 'rgba(255,255,255,0.9)'
        },
        margin: { l: 60, r: 30, t: 60, b: 60 },
        font: { family: 'Inter' }
    };
    
    const config = {
        responsive: true,
        displayModeBar: false
    };
    
    Plotly.newPlot('dailyChart', traces, layout, config);
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