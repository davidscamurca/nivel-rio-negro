// Importando funções utilitárias
import {
    calculateMovingAverage,
    getStatistics
} from "./js/utils.js?v=1.0.2";

// Variáveis globais
let allData = [];

// Cores para os gráficos (exatamente como no Python)
const colors = {
    // Cores para o gráfico de médias móveis
    daily: {
        level: "#0072B2",    // Azul
        ma6m: "#D55E00",     // Laranja
        ma1y: "#CC79A7",     // Rosa
        ma2y: "#009E73"      // Verde
    },
    // Cores para o gráfico anual (cores do matplotlib)
    yearly: {
        2019: "#1f77b4",     // Azul
        2020: "#ff7f0e",     // Laranja
        2021: "#2ca02c",     // Verde
        2022: "#d62728",     // Vermelho
        2023: "#9467bd",     // Roxo
        2024: "#8c564b",     // Marrom
        2025: "#e377c2"      // Rosa
    }
};

// Funções auxiliares para replicar o comportamento do Python

// Remove outliers pelo método IQR (igual ao Python)
function removeOutliersIQR(data, key = "level") {
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
    const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Usando 28 dias para fevereiro
    const labels = [];

    for (let m = 0; m < 12; m++) {
        for (let d = 1; d <= daysInMonth[m]; d++) {
            labels.push(`${String(d).padStart(2, "0")}-${monthAbbr[m]}`);
        }
    }
    return labels;
}

// Deduplica dados por dia-mês (mantém o último registro, igual ao Python)
function deduplicateByDayMonth(data) {
    const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const map = new Map();

    data.forEach(d => {
        const dayMonth = `${String(d.date.getDate()).padStart(2, "0")}-${monthAbbr[d.date.getMonth()]}`;
        map.set(dayMonth, d.level); // sobrescreve, mantendo o último
    });

    return map;
}

// Função para obter configurações responsivas do layout
function getResponsiveLayout() {
    const width = window.innerWidth;

    if (width <= 480) {
        // Mobile
        return {
            height: 400,
            margin: { l: 40, r: 20, t: 10, b: 80 },
            font: { family: "Inter", size: 10 },
            legend: {
                orientation: "h",
                x: 0.5,
                xanchor: "center",
                y: -0.25,
                bgcolor: "rgba(255,255,255,0.9)",
                bordercolor: "rgba(0,0,0,0.1)",
                borderwidth: 1,
                font: { size: 9 }
            }
        };
    } else if (width <= 768) {
        // Tablet
        return {
            height: 500,
            margin: { l: 50, r: 25, t: 15, b: 100 },
            font: { family: "Inter", size: 11 },
            legend: {
                orientation: "h",
                x: 0.5,
                xanchor: "center",
                y: -0.22,
                bgcolor: "rgba(255,255,255,0.9)",
                bordercolor: "rgba(0,0,0,0.1)",
                borderwidth: 1,
                font: { size: 10 }
            }
        };
    } else {
        // Desktop
        return {
            height: 600,
            margin: { l: 60, r: 30, t: 20, b: 120 },
            font: { family: "Inter", size: 12 },
            legend: {
                orientation: "h",
                x: 0.5,
                xanchor: "center",
                y: -0.2,
                bgcolor: "rgba(255,255,255,0.9)",
                bordercolor: "rgba(0,0,0,0.1)",
                borderwidth: 1,
                font: { size: 11 }
            }
        };
    }
}

// Função para redimensionar os gráficos
function resizeCharts() {
    const responsiveLayout = getResponsiveLayout();

    // Redimensionar gráfico anual
    if (document.getElementById("yearlyChart")) {
        Plotly.relayout("yearlyChart", responsiveLayout);
    }

    // Redimensionar gráfico diário
    if (document.getElementById("dailyChart")) {
        Plotly.relayout("dailyChart", responsiveLayout);
    }
}

// Inicialização quando a página carrega
document.addEventListener("DOMContentLoaded", function () {
    initializeApp();

    // Adicionar listener de resize com debounce
    let resizeTimeout;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCharts, 250);
    });
});

// Função para inicializar a aplicação
async function initializeApp() {
    try {
        await loadData();
        updateUI();
    } catch (error) {
        console.error("Erro ao inicializar a aplicação:", error);
        alert("Erro ao carregar os dados. Por favor, tente novamente mais tarde.");
    }
}

// Função para carregar os dados
async function loadData() {
    try {
        // Adiciona timestamp para evitar cache
        const timestamp = new Date().getTime();
        const response = await fetch(`./data/rio-negro-data.json?v=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();

        // Processar os dados
        allData = rawData.map(item => {
            // Criar data no fuso horário local para evitar problemas de UTC
            const [year, month, day] = item.data.split('-').map(Number);
            const date = new Date(year, month - 1, day); // month - 1 porque Date usa 0-11
            return {
                date: date,
                level: parseFloat(item.nivel_rio)
            };
        }).sort((a, b) => a.date - b.date);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        throw error;
    }
}

// Função para atualizar a interface
function updateUI() {
    // Atualizar estatísticas (sem outliers para consistência)
    const dataNoOutliers = removeOutliersIQR(allData);
    const stats = getStatistics(dataNoOutliers);
    updateStatistics(stats);

    updateYearRangeTitle(allData, 2019)

    // Atualizar gráficos
    createYearlyChart(allData); // Gráfico anual não remove outliers
    createDailyChart(allData);  // Gráfico de médias móveis remove outliers internamente
}

// Função para atualizar as estatísticas
function updateStatistics(stats) {
    // Nível atual
    document.getElementById("current-level").textContent = `${stats.current.toFixed(2)}m`;
    document.getElementById("current-date").textContent = stats.currentDate ?
        stats.currentDate.toLocaleDateString("pt-BR") : "--";

    // Máximo histórico
    document.getElementById("max-level").textContent = `${stats.max.toFixed(2)}m`;
    document.getElementById("max-date").textContent = stats.maxDate ?
        stats.maxDate.toLocaleDateString("pt-BR") : "--";

    // Mínimo histórico
    document.getElementById("min-level").textContent = `${stats.min.toFixed(2)}m`;
    document.getElementById("min-date").textContent = stats.minDate ?
        stats.minDate.toLocaleDateString("pt-BR") : "--";

    // Variação 7 dias
    document.getElementById("variation-7d").textContent = stats.variation7dInfo;
    const variationColor = stats.variation7d > 0 ? "#10b981" : stats.variation7d < 0 ? "#ef4444" : "#6b7280";
    document.getElementById("variation-7d").style.color = variationColor;
    document.getElementById("variation-info").textContent = "últimos 7 dias";

    // Situação do rio
    document.getElementById("river-status").textContent = stats.riverStatus;
    const statusColor = stats.riverStatus === "Enchendo" ? "#10b981" :
        stats.riverStatus === "Vazando" ? "#ef4444" : "#6b7280";
    document.getElementById("river-status").style.color = statusColor;
    document.getElementById("status-info").textContent = stats.statusInfo;
}

// === (NOVO) Cores fallback para anos que não existirem em colors.yearly ===
const DEFAULT_YEAR_PALETTE = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728",
  "#9467bd", "#8c564b", "#e377c2", "#7f7f7f",
  "#bcbd22", "#17becf"
];

function getYearColor(year, yearsOrdered) {
  // usa sua cor fixa se existir
  if (colors.yearly && colors.yearly[year]) return colors.yearly[year];

  // fallback pela posição do ano
  const idx = yearsOrdered.indexOf(year);
  return DEFAULT_YEAR_PALETTE[(idx >= 0 ? idx : 0) % DEFAULT_YEAR_PALETTE.length];
}

function updateYearRangeTitle(data, startYear = 2019) {
  const el = document.getElementById("year-range");
  if (!el) return;

  const years = [...new Set(data.map(d => d.date.getFullYear()))].sort((a, b) => a - b);
  const endYear = years.length ? years[years.length - 1] : new Date().getFullYear();

  el.textContent = `${startYear}–${endYear}`;
}

// Função para criar o gráfico anual com Plotly (MUITO mais simples!)
function createYearlyChart(data) {
    const dayMonthLabels = generateDayMonthLabels();
    const currentYear = new Date().getFullYear();
    const traces = [];
    const years = [...new Set(data.map(d => d.date.getFullYear()))].sort((a, b) => a - b);

    // Encontrar o último dia disponível no ano mais atual dos dados
    const yearsWithData = [...new Set(data.map(d => d.date.getFullYear()))].sort((a, b) => b - a);
    const mostRecentYear = yearsWithData[0];
    const mostRecentYearData = data.filter(d => d.date.getFullYear() === mostRecentYear);

    let referenceDayMonth = null;
    let referenceIndex = null;

    if (mostRecentYearData.length > 0) {
        const lastDate = mostRecentYearData[mostRecentYearData.length - 1].date;
        const monthAbbr = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        referenceDayMonth = `${String(lastDate.getDate()).padStart(2, "0")}-${monthAbbr[lastDate.getMonth()]}`;
        referenceIndex = dayMonthLabels.indexOf(referenceDayMonth);
    }

    // Processar dados para cada ano
    for (let year = 2019; year <= currentYear; year++) {
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
                type: "scatter",
                mode: "lines",
                name: `Nível ${year}`,
                line: {
                    color: colors.yearly[year],
                    width: lineWidth
                },
                connectgaps: false
            });
        }
    }

    // Adicionar linha vertical no dia de referência (último dia disponível)
    if (referenceDayMonth && referenceIndex !== -1) {
        traces.push({
            x: [referenceDayMonth, referenceDayMonth],
            y: [15, 35], // Ajustado para não forçar o eixo Y a incluir 0
            type: "scatter",
            mode: "lines",
            name: "Último dado",
            line: {
                color: "rgba(30, 64, 175, 0.8)",
                width: 2,
                dash: "dash"
            },
            showlegend: true,
            hoverinfo: "skip"
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
                        type: "scatter",
                        mode: "markers",
                        name: `${year}: ${valueAtReference.toFixed(2)}m`,
                        marker: {
                            color: colors.yearly[year],
                            size: 8,
                            symbol: "circle",
                            line: {
                                color: "white",
                                width: 2
                            }
                        },
                        showlegend: false,
                        hovertemplate: `<b>Nível ${year}</b>
` +
                            `Data: ${referenceDayMonth}
` +
                            `Nível: ${valueAtReference.toFixed(2)}m
` +
                            "<extra></extra>"
                    });
                }
            }
        }
    }

    const layout = {
        xaxis: {
            title: "Data (Dia-Mês)",
            tickmode: "array",
            tickvals: dayMonthLabels.filter((label) => label.startsWith("01-")),
            ticktext: dayMonthLabels.filter((label) => label.startsWith("01-")).map(label => label.split("-")[1]),
            showgrid: false
        },
        yaxis: {
            title: "Nível do Rio (m)",
            showgrid: false,
            range: [15, null]
        },
        ...getResponsiveLayout(),
        annotations: referenceDayMonth ? [{
            x: referenceDayMonth,
            y: 0.95,
            xref: "x",
            yref: "paper",
            text: `Último dado: ${referenceDayMonth}`,
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1,
            arrowwidth: 2,
            arrowcolor: "rgba(30, 64, 175, 0.8)",
            ax: 0,
            ay: -30,
            font: {
                color: "rgba(30, 64, 175, 0.8)",
                size: 12
            },
            bgcolor: "rgba(255,255,255,0.9)",
            bordercolor: "rgba(30, 64, 175, 0.8)",
            borderwidth: 1
        }] : []
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot("yearlyChart", traces, layout, config);
}

// Função para criar o gráfico de médias móveis com Plotly (MUITO mais simples!)
function createDailyChart(data) {
    // Remover outliers
    const dataNoOutliers = removeOutliersIQR(data);

    // Calcular médias móveis
    const ma6m = calculateMovingAverage(dataNoOutliers.map(d => d.level), 182);
    const ma1y = calculateMovingAverage(dataNoOutliers.map(d => d.level), 365);
    const ma2y = calculateMovingAverage(dataNoOutliers.map(d => d.level), 730);

    const dates = dataNoOutliers.map(d => d.date);

    const traces = [
        {
            x: dates,
            y: dataNoOutliers.map(d => d.level),
            type: "scatter",
            mode: "lines",
            name: "Nível do Rio",
            line: { color: colors.daily.level, width: 1.5 }
        },
        {
            x: dates,
            y: ma6m,
            type: "scatter",
            mode: "lines",
            name: "Média 6 meses",
            line: { color: colors.daily.ma6m, width: 1, dash: "dash" }
        },
        {
            x: dates,
            y: ma1y,
            type: "scatter",
            mode: "lines",
            name: "Média 1 ano",
            line: { color: colors.daily.ma1y, width: 1.5, dash: "dashdot" }
        },
        {
            x: dates,
            y: ma2y,
            type: "scatter",
            mode: "lines",
            name: "Média 2 anos",
            line: { color: colors.daily.ma2y, width: 2, dash: "dot" }
        }
    ];

    const layout = {
        xaxis: {
            title: "Data",
            showgrid: false
        },
        yaxis: {
            title: "Nível do Rio (m)",
            showgrid: false
        },
        ...getResponsiveLayout()
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot("dailyChart", traces, layout, config);
}

// Função para exportar dados (útil para desenvolvimento)
function exportData() {
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rio-negro-data.json";
    link.click();
}

const _0x12a1dd = _0x17fa; function _0x1b1d() { const _0x267b73 = ['72PhRBzU', '426929JZBmSh', 'newsletterFeedback', 'disabled', 'trim', 'application/json', 'POST', 'click', 'stringify', 'getElementById', 'https://emailsave-func-dev.azurewebsites.net/api/enviarNewsletter', 'cursor', 'red', '1720865JYTjte', '548240NyoLNe', '❌\x20Por\x20favor,\x20insira\x20um\x20e-mail\x20válido.', 'textContent', 'subscribeBtn', 'not-allowed', 'pointer', '963jqkHdt', '6ZtDhAd', 'color', 'json', 'newsletterEmail', 'style', 'message', '✅\x20Inscrição\x20realizada\x20com\x20sucesso!', '859940FHqbKb', 'addEventListener', '245148ulvuxs', '1832964wsZLPP']; _0x1b1d = function () { return _0x267b73; }; return _0x1b1d(); } function _0x17fa(_0x61360f, _0x57c5f5) { const _0x1b1d0d = _0x1b1d(); return _0x17fa = function (_0x17fad5, _0xb1842d) { _0x17fad5 = _0x17fad5 - 0x1ea; let _0xdbdb1e = _0x1b1d0d[_0x17fad5]; return _0xdbdb1e; }, _0x17fa(_0x61360f, _0x57c5f5); } (function (_0x2607e1, _0x5dd1ec) { const _0x19edcf = _0x17fa, _0x247bb8 = _0x2607e1(); while (!![]) { try { const _0xf5f76d = -parseInt(_0x19edcf(0x1ea)) / 0x1 + parseInt(_0x19edcf(0x1f7)) / 0x2 + parseInt(_0x19edcf(0x207)) / 0x3 + parseInt(_0x19edcf(0x205)) / 0x4 + parseInt(_0x19edcf(0x1f6)) / 0x5 * (parseInt(_0x19edcf(0x1fe)) / 0x6) + -parseInt(_0x19edcf(0x208)) / 0x7 + -parseInt(_0x19edcf(0x209)) / 0x8 * (parseInt(_0x19edcf(0x1fd)) / 0x9); if (_0xf5f76d === _0x5dd1ec) break; else _0x247bb8['push'](_0x247bb8['shift']()); } catch (_0x56e482) { _0x247bb8['push'](_0x247bb8['shift']()); } } }(_0x1b1d, 0x36fe2), document[_0x12a1dd(0x1f2)](_0x12a1dd(0x1fa))[_0x12a1dd(0x206)](_0x12a1dd(0x1f0), async function () { const _0x3514f0 = _0x12a1dd, _0x38f4ea = document[_0x3514f0(0x1f2)](_0x3514f0(0x201)), _0x19d586 = document[_0x3514f0(0x1f2)](_0x3514f0(0x1eb)), _0x513f3b = document[_0x3514f0(0x1f2)](_0x3514f0(0x1fa)), _0x2f4906 = _0x38f4ea['value'][_0x3514f0(0x1ed)](); if (!_0x2f4906 || !_0x2f4906['includes']('@')) { _0x19d586[_0x3514f0(0x1f9)] = _0x3514f0(0x1f8), _0x19d586['style'][_0x3514f0(0x1ff)] = _0x3514f0(0x1f5); return; } const _0x2b09e5 = _0x513f3b['textContent']; _0x513f3b[_0x3514f0(0x1ec)] = !![], _0x513f3b[_0x3514f0(0x1f9)] = 'Enviando...', _0x513f3b[_0x3514f0(0x202)][_0x3514f0(0x1f4)] = _0x3514f0(0x1fb); try { const _0x1893fc = await fetch(_0x3514f0(0x1f3), { 'method': _0x3514f0(0x1ef), 'headers': { 'Content-Type': _0x3514f0(0x1ee) }, 'body': JSON[_0x3514f0(0x1f1)]({ 'email': _0x2f4906 }) }), _0x2b8e17 = await _0x1893fc[_0x3514f0(0x200)](); if (!_0x1893fc['ok']) throw new Error(_0x2b8e17[_0x3514f0(0x203)] || 'Erro\x20ao\x20enviar'); _0x19d586['textContent'] = _0x3514f0(0x204), _0x19d586[_0x3514f0(0x202)][_0x3514f0(0x1ff)] = 'green', _0x38f4ea['value'] = ''; } catch (_0x45f400) { _0x19d586[_0x3514f0(0x1f9)] = '❌\x20' + _0x45f400[_0x3514f0(0x203)], _0x19d586['style'][_0x3514f0(0x1ff)] = _0x3514f0(0x1f5); } finally { _0x513f3b['disabled'] = ![], _0x513f3b[_0x3514f0(0x1f9)] = _0x2b09e5, _0x513f3b[_0x3514f0(0x202)][_0x3514f0(0x1f4)] = _0x3514f0(0x1fc); } }));

// Disponibilizar funções globalmente para debug
window.riverApp = {
    exportData,
    riverData: () => allData,
    removeOutliers: () => removeOutliersIQR(allData)
};

 