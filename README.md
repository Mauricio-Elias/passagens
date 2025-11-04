[README.md](https://github.com/user-attachments/files/23320492/README.md)
# Dashboard de Passagens | Consórcio Seriemas

Dashboard interativo de análise de custos e indicadores de passagens do Consórcio Seriemas.

## 📊 Indicadores Exibidos

- **KPIs Principais:** Custo total, total geral, orçamento e saldo disponível
- **Análise por Tipo:** Distribuição de custos por categoria de passagem
- **Análise Mensal:** Evolução de custos ao longo dos meses com comparação ao orçamento
- **Top 10 Solicitantes:** Maiores custos por solicitante
- **Custos Adicionais:** Alimentação, hospedagem, transporte e outros
- **Filtros Interativos:** Por tipo, solicitante e mês

## 🚀 Como Publicar no GitHub Pages

### Criar Novo Repositório

1. Acesse [GitHub](https://github.com) e faça login com a conta `mauricioelias`

2. Clique em **"New repository"** (ou acesse https://github.com/new)

3. Configure o repositório:
   - **Repository name:** `passagens` (ou outro nome de sua preferência)
   - **Description:** "Dashboard de Passagens - Consórcio Seriemas"
   - Marque como **Public**
   - **NÃO** marque "Add a README file"

4. Clique em **"Create repository"**

5. Na página do repositório criado, clique em **"uploading an existing file"**

6. Arraste e solte TODOS os arquivos desta pasta:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `dashboard_passagens.json`
   - `logo-seriemas.png`

7. Adicione uma mensagem de commit: "Initial commit - Dashboard Passagens"

8. Clique em **"Commit changes"**

9. Vá em **Settings** → **Pages**

10. Em **"Source"**, selecione **"Deploy from a branch"**

11. Em **"Branch"**, selecione **"main"** e pasta **"/ (root)"**

12. Clique em **"Save"**

13. Aguarde alguns minutos e seu site estará disponível em:
    ```
    https://mauricioelias.github.io/passagens/
    ```

## 📁 Estrutura de Arquivos

```
dashboard_passagens_standalone/
├── index.html                    # Página principal
├── styles.css                    # Estilos CSS
├── app.js                        # JavaScript para carregar dados e filtros
├── dashboard_passagens.json      # Dados do dashboard
├── logo-seriemas.png             # Logo do Consórcio Seriemas
└── README.md                     # Este arquivo
```

## 🔄 Como Atualizar os Dados

Para atualizar os dados do dashboard:

1. Substitua o arquivo `dashboard_passagens.json` pelo novo arquivo gerado

2. Faça upload do arquivo atualizado no GitHub:
   - Acesse o repositório
   - Clique no arquivo `dashboard_passagens.json`
   - Clique no ícone de lápis (Edit)
   - Cole o novo conteúdo JSON
   - Clique em "Commit changes"

3. O site será atualizado automaticamente em alguns minutos

## 🎯 Funcionalidades

### Filtros Interativos

- **🎫 Tipo de Passagem:** Filtra por categoria (Folga de Campo, Mobilização, etc.)
- **👤 Solicitante:** Filtra por pessoa específica
- **📅 Mês:** Filtra por período específico

Os filtros podem ser combinados e recalculam automaticamente todos os KPIs, gráficos e rankings.

### Análises Disponíveis

- **Distribuição por Tipo:** Visualiza custos e percentuais por categoria
- **Evolução Mensal:** Acompanha gastos mês a mês com indicadores de orçamento
- **Top Solicitantes:** Identifica maiores custos por pessoa
- **Custos Adicionais:** Detalha despesas complementares

## 💡 Dicas

- **Domínio personalizado:** Configure em Settings → Pages → Custom domain
- **HTTPS:** Fornecido automaticamente pelo GitHub Pages
- **Atualizações:** Qualquer commit atualiza o site automaticamente
- **Cache:** Limpe o cache do navegador (Ctrl+F5) se não ver mudanças

## 📱 Compatibilidade

O dashboard é totalmente responsivo e funciona em:
- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet
- ✅ Mobile

## 🆘 Suporte

Se tiver problemas:
1. Verifique se todos os arquivos foram enviados corretamente
2. Confirme que o GitHub Pages está ativado nas configurações
3. Aguarde 2-3 minutos após o commit para o site atualizar
4. Limpe o cache do navegador

---

**Elaborado por:** Mauricio Elias  
**Consórcio Seriemas**
