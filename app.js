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
        
        // Event listener para filtro mensal
        document.getElementById('filtro-tipo-mensal').addEventListener('change', () => {
            exibirAnaliseMensal(dadosOriginais.por_mes);
        });
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar os dados do dashboard. Verifique se o arquivo JSON está presente.');
    }
}

function popularFiltros(data) {
    // Popular filtro de tipos para análise mensal
    const tipos = Object.keys(data.por_tipo);
    const selectTipo = document.getElementById('filtro-tipo-mensal');
    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        selectTipo.appendChild(option);
    });
}

function exibirDados(data) {
    exibirKPIs(data.kpis);
    exibirConsumoOrcamento(data.kpis);
    exibirCustosAdicionais(data.custos_adicionais);
    exibirAnaliseMensal(data.por_mes);
    exibirAnalisePorTipo(data.por_tipo, data.kpis.custo_total);
    exibirTopVisitantes(data);
    exibirConsultores(data);
    exibirUltimaAtualizacao();
}

function exibirKPIs(kpis) {
    document.getElementById('custo-total').textContent = formatarMoeda(kpis.custo_total);
    document.getElementById('qtd-passagens').textContent = `${kpis.total_passagens} passagens`;
    document.getElementById('orcamento-total').textContent = formatarMoeda(kpis.orcamento_total);
    document.getElementById('utilizacao-orcamento').textContent = 
        `${kpis.utilizacao_orcamento.toFixed(1)}% utilizado • Válido até maio/2026`;
    document.getElementById('saldo-disponivel').textContent = formatarMoeda(kpis.saldo_disponivel);
    document.getElementById('total-geral').textContent = formatarMoeda(kpis.total_geral);
}

function exibirConsumoOrcamento(kpis) {
    document.getElementById('consumo-gasto').textContent = formatarMoeda(kpis.total_geral);
    document.getElementById('consumo-orcamento').textContent = formatarMoeda(kpis.orcamento_total);
    document.getElementById('consumo-saldo').textContent = formatarMoeda(kpis.saldo_disponivel);
    
    const percentConsumo = kpis.utilizacao_orcamento;
    const percentSaldo = 100 - percentConsumo;
    
    document.getElementById('consumo-fill').style.width = `${percentConsumo}%`;
    document.getElementById('consumo-fill').textContent = `${percentConsumo.toFixed(1)}% consumido`;
    document.getElementById('consumo-percent').textContent = `${percentConsumo.toFixed(1)}% consumido`;
    document.getElementById('saldo-percent').textContent = `${percentSaldo.toFixed(1)}% restante`;
}

function exibirCustosAdicionais(custosAdicionais) {
    if (!custosAdicionais || !custosAdicionais.resumo) return;
    
    const resumo = custosAdicionais.resumo;
    const custoTotal = dadosOriginais.kpis.custo_total;
    
    // Reembolsos
    if (resumo.Reembolsos) {
        document.getElementById('reembolsos-valor').textContent = formatarMoeda(resumo.Reembolsos.valor);
        const percent = ((resumo.Reembolsos.valor / custoTotal) * 100).toFixed(1);
        document.getElementById('reembolsos-details').textContent = 
            `${resumo.Reembolsos.quantidade} registros • ${percent}% do total`;
    }
    
    // Ônibus Fretado
    if (resumo['Ônibus Fretado']) {
        document.getElementById('onibus-valor').textContent = formatarMoeda(resumo['Ônibus Fretado'].valor);
        const percent = ((resumo['Ônibus Fretado'].valor / custoTotal) * 100).toFixed(1);
        document.getElementById('onibus-details').textContent = 
            `${resumo['Ônibus Fretado'].quantidade} colaboradores • ${percent}% do total`;
    }
    
    // Prêmio Baixada
    if (resumo['Prêmio Baixada']) {
        document.getElementById('premio-valor').textContent = formatarMoeda(resumo['Prêmio Baixada'].valor);
        const percent = ((resumo['Prêmio Baixada'].valor / custoTotal) * 100).toFixed(1);
        document.getElementById('premio-details').textContent = 
            `${resumo['Prêmio Baixada'].quantidade} colaboradores • ${percent}% do total`;
    }
    
    // Visitas da Sede à Obra
    if (resumo['Visitas da Sede à Obra']) {
        document.getElementById('visitas-valor').textContent = formatarMoeda(resumo['Visitas da Sede à Obra'].valor);
        const percent = ((resumo['Visitas da Sede à Obra'].valor / custoTotal) * 100).toFixed(1);
        document.getElementById('visitas-details').textContent = 
            `${resumo['Visitas da Sede à Obra'].quantidade} colaboradores • ${percent}% do total`;
    }
    
    // Passagens Aéreas
    if (resumo['Passagens Aéreas']) {
        document.getElementById('aereas-qtd').textContent = resumo['Passagens Aéreas'].quantidade;
        const media = resumo['Passagens Aéreas'].valor / resumo['Passagens Aéreas'].quantidade;
        document.getElementById('aereas-media').textContent = `Média: ${formatarMoeda(media)}`;
    }
}

function exibirAnaliseMensal(porMes) {
    const tipoFiltro = document.getElementById('filtro-tipo-mensal').value;
    
    const mesesHTML = porMes.map(mesData => {
        let gasto = mesData.custo_total;
        
        // Aplicar filtro de tipo se selecionado
        if (tipoFiltro) {
            const passagensTipo = mesData.por_tipo[tipoFiltro] || [];
            gasto = passagensTipo.reduce((sum, p) => sum + (p.Custo || 0), 0);
        }
        
        const orcado = mesData.orcamento || 0;
        const percentual = orcado > 0 ? (gasto / orcado) * 100 : 0;
        
        let corBarra = 'green';
        if (percentual > 100) {
            corBarra = 'red';
        } else if (percentual >= 80) {
            corBarra = 'yellow';
        }
        
        const larguraBarra = Math.min(percentual, 100);
        
        return `
            <div class="mes-item">
                <div class="mes-header">
                    <span class="mes-nome">${mesData.mes}</span>
                    <div class="mes-info">
                        <div class="mes-gasto">Gasto: ${formatarMoeda(gasto)}</div>
                        <div class="mes-orcado">Orçado: ${formatarMoeda(orcado)}
                            <span class="mes-percentual">${percentual.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                <div class="mes-bar">
                    <div class="mes-fill ${corBarra}" style="width: ${larguraBarra}%"></div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('meses-list').innerHTML = mesesHTML;
}

function exibirAnalisePorTipo(porTipo, custoTotal) {
    const tiposHTML = Object.entries(porTipo)
        .map(([tipo, passagens]) => {
            const custo = passagens.reduce((sum, p) => sum + (p.Custo || 0), 0);
            const percentual = ((custo / custoTotal) * 100).toFixed(1);
            
            return `
                <div class="tipo-card">
                    <h4>${tipo}</h4>
                    <div class="tipo-value">${formatarMoeda(custo)}</div>
                    <div class="tipo-percent">${percentual}% do total</div>
                </div>
            `;
        })
        .join('');
    
    document.getElementById('tipos-list').innerHTML = tiposHTML;
}

function exibirTopVisitantes(data) {
    // Buscar passagens de Visitas da Sede à Obra
    const visitasPassagens = data.por_tipo['Visitas da Sede à Obra'] || [];
    
    // Agrupar por solicitante
    const visitantesMap = {};
    visitasPassagens.forEach(p => {
        const nome = p.Solicitante;
        if (!visitantesMap[nome]) {
            visitantesMap[nome] = { nome, passagens: 0, custo: 0 };
        }
        visitantesMap[nome].passagens += 1;
        visitantesMap[nome].custo += p.Custo || 0;
    });
    
    // Top 6
    const topVisitantes = Object.values(visitantesMap)
        .sort((a, b) => b.custo - a.custo)
        .slice(0, 6);
    
    const visitantesHTML = topVisitantes.map((v, index) => {
        const media = v.custo / v.passagens;
        return `
            <div class="ranking-item">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-nome">${v.nome}</div>
                    <div class="ranking-detalhes">${v.passagens} passagens</div>
                </div>
                <div class="ranking-stats">
                    <div class="ranking-valor">${formatarMoeda(v.custo)}</div>
                    <div class="ranking-media">Média: ${formatarMoeda(media)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('visitantes-list').innerHTML = visitantesHTML;
    
    const totalTop6 = topVisitantes.reduce((sum, v) => sum + v.custo, 0);
    document.getElementById('visitantes-total').textContent = formatarMoeda(totalTop6);
}

function exibirConsultores(data) {
    // Buscar passagens de consultores (Outros tipo)
    const outrosPassagens = data.por_tipo['Outros'] || [];
    
    // Filtrar consultores conhecidos
    const consultoresNomes = ['Claudio Ferreira Barbosa', 'Enrico Pieta'];
    const consultoresMap = {};
    
    outrosPassagens.forEach(p => {
        const nome = p.Solicitante;
        if (consultoresNomes.includes(nome)) {
            if (!consultoresMap[nome]) {
                consultoresMap[nome] = { nome, passagens: 0, custo: 0 };
            }
            consultoresMap[nome].passagens += 1;
            consultoresMap[nome].custo += p.Custo || 0;
        }
    });
    
    const consultores = Object.values(consultoresMap)
        .sort((a, b) => b.custo - a.custo);
    
    const consultoresHTML = consultores.map((c, index) => {
        const media = c.custo / c.passagens;
        return `
            <div class="ranking-item">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-nome">${c.nome}</div>
                    <div class="ranking-detalhes">${c.passagens} passagens</div>
                </div>
                <div class="ranking-stats">
                    <div class="ranking-valor">${formatarMoeda(c.custo)}</div>
                    <div class="ranking-media">Média: ${formatarMoeda(media)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('consultores-list').innerHTML = consultoresHTML;
    
    const totalConsultores = consultores.reduce((sum, c) => sum + c.custo, 0);
    const totalPassagens = consultores.reduce((sum, c) => sum + c.passagens, 0);
    
    document.getElementById('consultores-total').textContent = formatarMoeda(totalConsultores);
    document.getElementById('consultores-subtitle').textContent = 
        `${totalPassagens} passagens • ${consultores.length} consultores`;
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
