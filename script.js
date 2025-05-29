// Importando funções utilitárias
import {
    calculateMovingAverage,
    getStatistics
} from "./js/utils.js?v=1.0.1";

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
    const monthAbbr = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
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
    const monthAbbr = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
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
document.addEventListener("DOMContentLoaded", function() {
    initializeApp();
    
    // Adicionar listener de resize com debounce
    let resizeTimeout;
    window.addEventListener("resize", function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(resizeCharts, 250);
    });

    // Newsletter form handler
    const newsletterForm = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const email = emailInput.value.trim();
                
                if (!email) {
                    alert('Por favor, digite um email válido.');
                    return;
                }
                
                // Validação básica de email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Por favor, digite um email válido.');
                    return;
                }
                
                // Cadastro real via API Vercel
                const button = newsletterForm.querySelector('.newsletter-btn');
                const originalText = button.textContent;
                
                button.textContent = 'Cadastrando...';
                button.disabled = true;
                
                // Fazer requisição para API
                const response = await fetch('/api/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(`✅ Email ${email} cadastrado com sucesso!\n\nVocê receberá atualizações diárias sobre o nível do Rio Negro.\n\n📧 Primeiro email chegará amanhã às 8h!\n\n📊 Total de inscritos: ${result.total}`);
                    emailInput.value = '';
                    
                    // Atualizar contador na interface
                    updateSubscriberCount();
                } else {
                    if (result.error === 'Email já cadastrado') {
                        alert(`⚠️ O email ${email} já está cadastrado na nossa newsletter!`);
                    } else {
                        alert(`❌ Erro: ${result.error}`);
                    }
                }
                
                button.textContent = originalText;
                button.disabled = false;
                
            } catch (error) {
                console.error('Erro no formulário da newsletter:', error);
                
                // Restaurar botão em caso de erro
                const button = newsletterForm.querySelector('.newsletter-btn');
                if (button) {
                    button.textContent = 'Cadastrar';
                    button.disabled = false;
                }
                
                alert('Erro ao cadastrar email. Verifique sua conexão e tente novamente.');
            }
        });
    }
});

// Função para atualizar contador de inscritos
async function updateSubscriberCount() {
    try {
        console.log('Carregando contador de inscritos da API...');
        const response = await fetch('/api/newsletter');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados do contador carregados:', data);
        
        // Mostrar contador na interface
        if (data.total_subscribers > 0) {
            const noteElement = document.querySelector('.newsletter-note');
            if (noteElement) {
                noteElement.innerHTML = `
                    Gratuito • Dados atualizados diariamente • Cancele quando quiser<br>
                    <small style="opacity: 0.7;">📊 ${data.total_subscribers} pessoas já cadastradas</small>
                `;
                console.log('Contador atualizado na interface');
            }
        }
    } catch (error) {
        console.warn('Não foi possível carregar contador de inscritos:', error.message);
        // Fallback para arquivo local se API não estiver disponível
        try {
            const response = await fetch('./data/newsletter-emails.json');
            const data = await response.json();
            if (data.total_subscribers > 0) {
                const noteElement = document.querySelector('.newsletter-note');
                if (noteElement) {
                    noteElement.innerHTML = `
                        Gratuito • Dados atualizados diariamente • Cancele quando quiser<br>
                        <small style="opacity: 0.7;">📊 ${data.total_subscribers} pessoas já cadastradas</small>
                    `;
                }
            }
        } catch (fallbackError) {
            console.warn('Fallback também falhou:', fallbackError.message);
        }
    }
}

// Função para inicializar a aplicação
async function initializeApp() {
    console.log("Iniciando aplicação...");
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
    console.log("Carregando dados...");
    try {
        // Adiciona timestamp para evitar cache
        const timestamp = new Date().getTime();
        const response = await fetch(`./data/rio-negro-data.json?v=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        console.log("Dados brutos recebidos:", rawData.length, "registros");

        // Processar os dados
        allData = rawData.map(item => ({
            date: new Date(item.data),
            level: parseFloat(item.nivel_rio)
        })).sort((a, b) => a.date - b.date);

        console.log("Dados processados:", allData.length, "registros");
        console.log("Primeiro registro:", allData[0]);
        console.log("Último registro:", allData[allData.length - 1]);
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        throw error;
    }
}

// Função para atualizar a interface
function updateUI() {
    console.log("Atualizando interface...");
    
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

// Função para criar o gráfico anual com Plotly (MUITO mais simples!)
function createYearlyChart(data) {
    const dayMonthLabels = generateDayMonthLabels();
    const currentYear = new Date().getFullYear();
    const traces = [];
    
    // Encontrar o último dia disponível no ano mais atual dos dados
    const yearsWithData = [...new Set(data.map(d => d.date.getFullYear()))].sort((a, b) => b - a);
    const mostRecentYear = yearsWithData[0];
    const mostRecentYearData = data.filter(d => d.date.getFullYear() === mostRecentYear);
    
    let referenceDayMonth = null;
    let referenceIndex = null;
    
    if (mostRecentYearData.length > 0) {
        const lastDate = mostRecentYearData[mostRecentYearData.length - 1].date;
        const monthAbbr = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
        referenceDayMonth = `${String(lastDate.getDate()).padStart(2, "0")}-${monthAbbr[lastDate.getMonth()]}`;
        referenceIndex = dayMonthLabels.indexOf(referenceDayMonth);
        console.log(`Último dia disponível (${mostRecentYear}): ${referenceDayMonth} (índice: ${referenceIndex})`);
        console.log(`Data de referência: ${lastDate.toLocaleDateString("pt-BR")}`);
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
                        hovertemplate: `<b>Nível ${year}</b><br>` +
                                     `Data: ${referenceDayMonth}<br>` +
                                     `Nível: ${valueAtReference.toFixed(2)}m<br>` +
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
    const dataBlob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rio-negro-data.json";
    link.click();
}

// Disponibilizar funções globalmente para debug
window.riverApp = {
    exportData,
    riverData: () => allData,
    removeOutliers: () => removeOutliersIQR(allData)
};
