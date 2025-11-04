// Dados globais
let dadosOriginais = null;

// Carregar e exibir dados do dashboard
async function carregarDados() {
    try {
        const response = await fetch('dashboard_passagens.json');
        const data = await response.json();
        
        dadosOriginais = data;
        
        popularFiltros(data);
        exibirDados(data);
        
        // Adicionar event listeners aos filtros
        document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-solicitante').addEventListener('change', aplicarFiltros);
        document.getElementById('filtro-mes').addEventListener('change', aplicarFiltros);
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar os dados do dashboard. Verifique se o arquivo JSON está presente.');
    }
}

function popularFiltros(data) {
    // Popular filtro de tipos
    const tipos = Object.keys(data.por_tipo);
    const selectTipo = document.getElementById('filtro-tipo');
    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        selectTipo.appendChild(option);
    });
    
    // Popular filtro de meses
    const meses = data.por_mes.map(m => m.mes);
    const selectMes = document.getElementById('filtro-mes');
    meses.forEach(mes => {
        const option = document.createElement('option');
        option.value = mes;
        option.textContent = mes;
        selectMes.appendChild(option);
    });
    
    // Popular filtro de solicitantes (top 20)
    const solicitantes = [...new Set(data.por_mes.flatMap(m => 
        Object.keys(m.por_tipo).flatMap(t => 
            m.por_tipo[t].map(p => p.Solicitante)
        )
    ))].sort().slice(0, 50);
    
    const selectSolicitante = document.getElementById('filtro-solicitante');
    solicitantes.forEach(sol => {
        const option = document.createElement('option');
        option.value = sol;
        option.textContent = sol;
        selectSolicitante.appendChild(option);
    });
}

function aplicarFiltros() {
    const tipoSelecionado = document.getElementById('filtro-tipo').value;
    const solicitanteSelecionado = document.getElementById('filtro-solicitante').value;
    const mesSelecionado = document.getElementById('filtro-mes').value;
    
    const dadosFiltrados = filtrarDados(dadosOriginais, tipoSelecionado, solicitanteSelecionado, mesSelecionado);
    exibirDados(dadosFiltrados);
}

function limparFiltros() {
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-solicitante').value = '';
    document.getElementById('filtro-mes').value = '';
    exibirDados(dadosOriginais);
}

function filtrarDados(data, tipo, solicitante, mes) {
    let dadosFiltrados = JSON.parse(JSON.stringify(data)); // Deep copy
    
    // Filtrar por mês
    if (mes) {
        dadosFiltrados.por_mes = dadosFiltrados.por_mes.filter(m => m.mes === mes);
    }
    
    // Filtrar por tipo e solicitante nos dados mensais
    dadosFiltrados.por_mes = dadosFiltrados.por_mes.map(mesData => {
        let mesFiltrado = JSON.parse(JSON.stringify(mesData));
        
        // Filtrar por tipo
        if (tipo) {
            const tiposFiltrados = {};
            tiposFiltrados[tipo] = mesFiltrado.por_tipo[tipo] || [];
            mesFiltrado.por_tipo = tiposFiltrados;
        }
        
        // Filtrar por solicitante em cada tipo
        if (solicitante) {
            Object.keys(mesFiltrado.por_tipo).forEach(t => {
                mesFiltrado.por_tipo[t] = mesFiltrado.por_tipo[t].filter(p => p.Solicitante === solicitante);
            });
        }
        
        // Recalcular custo total do mês
        mesFiltrado.custo_total = Object.values(mesFiltrado.por_tipo)
            .flat()
            .reduce((sum, p) => sum + (p.Custo || 0), 0);
        
        return mesFiltrado;
    });
    
    // Recalcular por_tipo
    dadosFiltrados.por_tipo = {};
    dadosFiltrados.por_mes.forEach(mesData => {
        Object.keys(mesData.por_tipo).forEach(t => {
            if (!dadosFiltrados.por_tipo[t]) {
                dadosFiltrados.por_tipo[t] = [];
            }
            dadosFiltrados.por_tipo[t] = dadosFiltrados.por_tipo[t].concat(mesData.por_tipo[t]);
        });
    });
    
    // Recalcular KPIs
    const todasPassagens = Object.values(dadosFiltrados.por_tipo).flat();
    dadosFiltrados.kpis.total_passagens = todasPassagens.length;
    dadosFiltrados.kpis.custo_total = todasPassagens.reduce((sum, p) => sum + (p.Custo || 0), 0);
    
    // Manter custos adicionais e orçamento originais
    dadosFiltrados.kpis.total_geral = dadosFiltrados.kpis.custo_total + 
        (dadosOriginais.custos_adicionais?.resumo?.total || 0);
    
    dadosFiltrados.kpis.saldo_disponivel = dadosOriginais.kpis.orcamento_total - dadosFiltrados.kpis.total_geral;
    dadosFiltrados.kpis.utilizacao_orcamento = 
        (dadosFiltrados.kpis.total_geral / dadosOriginais.kpis.orcamento_total) * 100;
    
    return dadosFiltrados;
}

function exibirDados(data) {
    exibirKPIs(data.kpis);
    exibirPorTipo(data.por_tipo, data.kpis.custo_total);
    exibirPorMes(data.por_mes);
    exibirTopSolicitantes(data.por_tipo);
    exibirCustosAdicionais(data.custos_adicionais);
    exibirUltimaAtualizacao();
}

function exibirKPIs(kpis) {
    document.getElementById('custo-total').textContent = formatarMoeda(kpis.custo_total);
    document.getElementById('qtd-passagens').textContent = `${kpis.total_passagens} passagens`;
    document.getElementById('total-geral').textContent = formatarMoeda(kpis.total_geral);
    document.getElementById('orcamento-total').textContent = formatarMoeda(kpis.orcamento_total);
    document.getElementById('utilizacao-orcamento').textContent = `${kpis.utilizacao_orcamento.toFixed(1)}% utilizado`;
    document.getElementById('saldo-disponivel').textContent = formatarMoeda(kpis.saldo_disponivel);
}

function exibirPorTipo(porTipo, custoTotal) {
    const tiposHTML = Object.entries(porTipo)
        .map(([tipo, passagens]) => {
            const custo = passagens.reduce((sum, p) => sum + (p.Custo || 0), 0);
            const percentual = ((custo / custoTotal) * 100).toFixed(1);
            
            return `
                <div class="tipo-item">
                    <div class="tipo-header">
                        <div class="tipo-info">
                            <h4>${tipo}</h4>
                            <p>${passagens.length} passagens</p>
                        </div>
                        <div class="tipo-stats">
                            <div class="tipo-custo">${formatarMoeda(custo)}</div>
                            <div class="tipo-percentual">${percentual}%</div>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentual}%"></div>
                    </div>
                </div>
            `;
        })
        .join('');
    
    document.getElementById('tipos-list').innerHTML = tiposHTML;
}

function exibirPorMes(porMes) {
    const mesesHTML = porMes
        .map(mesData => {
            const orcamento = mesData.orcamento || 0;
            const percentual = orcamento > 0 ? ((mesData.custo_total / orcamento) * 100).toFixed(1) : 0;
            
            let badgeClass = 'success';
            let badgeText = 'Dentro do orçamento';
            
            if (percentual > 100) {
                badgeClass = 'danger';
                badgeText = `${percentual}% do orçado`;
            } else if (percentual > 80) {
                badgeClass = 'warning';
                badgeText = `${percentual}% do orçado`;
            }
            
            return `
                <div class="mes-item">
                    <h4>${mesData.mes}</h4>
                    <div class="mes-custo">${formatarMoeda(mesData.custo_total)}</div>
                    <div class="mes-orcamento">Orçamento: ${formatarMoeda(orcamento)}</div>
                    <span class="mes-badge ${badgeClass}">${badgeText}</span>
                </div>
            `;
        })
        .join('');
    
    document.getElementById('meses-list').innerHTML = mesesHTML;
}

function exibirTopSolicitantes(porTipo) {
    // Agrupar por solicitante
    const solicitantesMap = {};
    
    Object.values(porTipo).flat().forEach(passagem => {
        const nome = passagem.Solicitante;
        if (!solicitantesMap[nome]) {
            solicitantesMap[nome] = { nome, custo: 0, qtd: 0 };
        }
        solicitantesMap[nome].custo += passagem.Custo || 0;
        solicitantesMap[nome].qtd += 1;
    });
    
    // Top 10
    const topSolicitantes = Object.values(solicitantesMap)
        .sort((a, b) => b.custo - a.custo)
        .slice(0, 10);
    
    const solicitantesHTML = topSolicitantes
        .map((sol, index) => `
            <div class="solicitante-item">
                <div class="solicitante-position">${index + 1}</div>
                <div class="solicitante-info">
                    <div class="solicitante-nome">${sol.nome}</div>
                    <div class="solicitante-detalhes">${sol.qtd} passagens</div>
                </div>
                <div class="solicitante-stats">
                    <div class="solicitante-custo">${formatarMoeda(sol.custo)}</div>
                </div>
            </div>
        `)
        .join('');
    
    document.getElementById('solicitantes-list').innerHTML = solicitantesHTML;
}

function exibirCustosAdicionais(custosAdicionais) {
    if (!custosAdicionais || !custosAdicionais.resumo) {
        return;
    }
    
    const resumo = custosAdicionais.resumo;
    
    document.getElementById('custo-alimentacao').textContent = formatarMoeda(resumo.Alimentacao?.valor || 0);
    document.getElementById('qtd-alimentacao').textContent = `${resumo.Alimentacao?.quantidade || 0} itens`;
    
    document.getElementById('custo-hospedagem').textContent = formatarMoeda(resumo.Hospedagem?.valor || 0);
    document.getElementById('qtd-hospedagem').textContent = `${resumo.Hospedagem?.quantidade || 0} itens`;
    
    document.getElementById('custo-transporte').textContent = formatarMoeda(resumo.Transporte?.valor || 0);
    document.getElementById('qtd-transporte').textContent = `${resumo.Transporte?.quantidade || 0} itens`;
    
    document.getElementById('custo-outros').textContent = formatarMoeda(resumo.Outros?.valor || 0);
    document.getElementById('qtd-outros').textContent = `${resumo.Outros?.quantidade || 0} itens`;
}

function exibirUltimaAtualizacao() {
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('ultima-atualizacao').textContent = dataFormatada;
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', carregarDados);
