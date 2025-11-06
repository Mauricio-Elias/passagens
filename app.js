// Carregar dados do JSON
let dadosOriginais = null;

async function carregarDados() {
    try {
        const response = await fetch('dashboard_passagens.json');
        dadosOriginais = await response.json();
        
        exibirDados(dadosOriginais);
        
        // Event listener para filtro mensal
        document.getElementById('filtro-tipo-mensal').addEventListener('change', () => {
            exibirAnaliseMensal(dadosOriginais.por_mes);
        });
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar os dados do dashboard. Verifique se o arquivo JSON está presente.');
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarNumero(valor) {
    return new Intl.NumberFormat('pt-BR').format(valor);
}

function exibirDados(data) {
    // KPIs Principais
    document.getElementById('custo-total').textContent = formatarMoeda(data.kpis.custo_total);
    document.getElementById('qtd-passagens').textContent = `${formatarNumero(data.kpis.qtd_passagens)} passagens`;
    
    document.getElementById('orcamento-total').textContent = formatarMoeda(data.kpis.orcamento_total);
    const utilizacao = ((data.kpis.total_geral / data.kpis.orcamento_total) * 100).toFixed(1);
    document.getElementById('utilizacao-orcamento').textContent = `${utilizacao}% utilizado • Válido até maio/2026`;
    
    document.getElementById('saldo-disponivel').textContent = formatarMoeda(data.kpis.saldo_disponivel);
    document.getElementById('total-geral').textContent = formatarMoeda(data.kpis.total_geral);
    
    // Barra de Consumo
    document.getElementById('consumo-gasto').textContent = formatarMoeda(data.kpis.total_geral);
    document.getElementById('consumo-orcamento').textContent = formatarMoeda(data.kpis.orcamento_total);
    document.getElementById('consumo-percent').textContent = `${utilizacao}% consumido`;
    document.getElementById('consumo-fill').style.width = `${Math.min(utilizacao, 100)}%`;
    document.getElementById('consumo-saldo').textContent = formatarMoeda(data.kpis.saldo_disponivel);
    document.getElementById('saldo-percent').textContent = `${(100 - parseFloat(utilizacao)).toFixed(1)}% restante`;
    
    // Custos Adicionais
    if (data.custos_adicionais && data.custos_adicionais.resumo) {
        const resumo = data.custos_adicionais.resumo;
        const totalCustos = data.kpis.total_geral;
        
        // Reembolsos
        if (resumo.Reembolsos) {
            document.getElementById('reembolsos-valor').textContent = formatarMoeda(resumo.Reembolsos.valor);
            const percReembolsos = ((resumo.Reembolsos.valor / totalCustos) * 100).toFixed(1);
            document.getElementById('reembolsos-details').textContent = 
                `${formatarNumero(resumo.Reembolsos.quantidade)} registros • ${percReembolsos}% do total`;
        }
        
        // Ônibus Fretado
        if (resumo['Ônibus Fretado']) {
            document.getElementById('onibus-valor').textContent = formatarMoeda(resumo['Ônibus Fretado'].valor);
            const percOnibus = ((resumo['Ônibus Fretado'].valor / totalCustos) * 100).toFixed(1);
            document.getElementById('onibus-details').textContent = 
                `${formatarNumero(resumo['Ônibus Fretado'].quantidade)} colaboradores • ${percOnibus}% do total`;
        }
        
        // Prêmio Baixada
        if (resumo['Prêmio Baixada']) {
            document.getElementById('premio-valor').textContent = formatarMoeda(resumo['Prêmio Baixada'].valor);
            const percPremio = ((resumo['Prêmio Baixada'].valor / totalCustos) * 100).toFixed(1);
            document.getElementById('premio-details').textContent = 
                `${formatarNumero(resumo['Prêmio Baixada'].quantidade)} colaboradores • ${percPremio}% do total`;
        }
        
        // Visitas da Sede
        if (resumo['Visitas da Sede à Obra']) {
            document.getElementById('visitas-valor').textContent = formatarMoeda(resumo['Visitas da Sede à Obra'].valor);
            const percVisitas = ((resumo['Visitas da Sede à Obra'].valor / totalCustos) * 100).toFixed(1);
            document.getElementById('visitas-details').textContent = 
                `${formatarNumero(resumo['Visitas da Sede à Obra'].quantidade)} colaboradores • ${percVisitas}% do total`;
        }
        
        // Passagens Aéreas
        if (resumo['Passagens Aéreas']) {
            document.getElementById('aereas-qtd').textContent = formatarNumero(resumo['Passagens Aéreas'].quantidade);
            const mediaAereas = resumo['Passagens Aéreas'].valor / resumo['Passagens Aéreas'].quantidade;
            document.getElementById('aereas-media').textContent = `Média: ${formatarMoeda(mediaAereas)}`;
        }
    }
    
    // Análise Mensal
    exibirAnaliseMensal(data.por_mes);
    
    // Análise por Tipo
    exibirAnalisePorTipo(data.por_tipo);
    
    // Top Visitantes e Consultores
    exibirTopVisitantes(data);
    exibirConsultores(data);
}

function exibirAnaliseMensal(dadosMensais) {
    const container = document.getElementById('analise-mensal-list');
    const filtroTipo = document.getElementById('filtro-tipo-mensal').value;
    
    container.innerHTML = '';
    
    dadosMensais.forEach(mes => {
        const mesDiv = document.createElement('div');
        mesDiv.className = 'mes-card';
        
        const percentual = (mes.custo_total / mes.orcamento) * 100;
        let corBarra = 'verde';
        if (percentual > 100) corBarra = 'vermelho';
        else if (percentual >= 80) corBarra = 'amarelo';
        
        mesDiv.innerHTML = `
            <div class="mes-header">
                <span class="mes-nome">${mes.mes}</span>
                <div class="mes-valores">
                    <div>Gasto: ${formatarMoeda(mes.custo_total)}</div>
                    <div>Orçado: ${formatarMoeda(mes.orcamento)} <strong>${percentual.toFixed(1)}%</strong></div>
                </div>
            </div>
            <div class="mes-barra">
                <div class="barra-progresso-mes ${corBarra}" style="width: ${Math.min(percentual, 100)}%"></div>
            </div>
        `;
        
        container.appendChild(mesDiv);
    });
}

function exibirAnalisePorTipo(dadosPorTipo) {
    const container = document.getElementById('analise-tipo-list');
    container.innerHTML = '';
    
    dadosPorTipo.forEach(tipo => {
        const tipoDiv = document.createElement('div');
        tipoDiv.className = 'tipo-card';
        
        tipoDiv.innerHTML = `
            <div class="tipo-header">
                <h4>${tipo.tipo}</h4>
                <span class="tipo-percentual">${tipo.percentual.toFixed(1)}%</span>
            </div>
            <div class="tipo-valores">
                <span>${formatarMoeda(tipo.custo_total)}</span>
                <span>${formatarNumero(tipo.quantidade)} passagens</span>
            </div>
            <div class="tipo-barra">
                <div class="barra-progresso-tipo" style="width: ${tipo.percentual}%"></div>
            </div>
        `;
        
        container.appendChild(tipoDiv);
    });
}

function exibirTopVisitantes(data) {
    // Esta função precisa de dados específicos de visitantes
    // Por enquanto, deixar zerado até termos os dados corretos
    document.getElementById('visitantes-total').textContent = 'R$ 0,00';
}

function exibirConsultores(data) {
    // Esta função precisa de dados específicos de consultores
    // Por enquanto, deixar zerado até termos os dados corretos
    document.getElementById('consultores-total').textContent = 'R$ 0,00';
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDados);
