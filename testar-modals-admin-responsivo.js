/**
 * Script específico para testar modals do painel administrativo
 *
 * Testa modals que só existem na área administrativa:
 * - Modal de categorias
 * - Modal de produtos
 * - Modal de serviços
 * - Modal de clientes
 * - Outros modals administrativos
 */

const puppeteer = require('puppeteer');

// Breakpoints para testar
const breakpoints = {
  mobile: { width: 375, height: 667, name: 'iPhone SE' },
  mobileLarge: { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
  tablet: { width: 768, height: 1024, name: 'iPad' },
  tabletLarge: { width: 1024, height: 1366, name: 'iPad Pro' },
  desktop: { width: 1280, height: 720, name: 'Desktop' },
  desktopLarge: { width: 1920, height: 1080, name: 'Desktop Large' },
};

// Testes específicos para modals administrativos
const adminTestCases = [
  {
    name: 'CategoriasModal',
    url: 'http://localhost:3000/admin/categorias',
    triggerSelector:
      'button:contains("Nova Categoria"), [data-testid="nova-categoria"]',
    modalSelector: '.fixed.inset-0.bg-gray-600.bg-opacity-50',
    expectedElements: [
      'h3:contains("Nova Categoria")',
      'input[name="name"]',
      'select[name="type"]',
      'textarea[name="description"]',
      'button[type="submit"]',
    ],
    requiresAuth: true,
  },
  {
    name: 'ProdutosModal',
    url: 'http://localhost:3000/admin/produtos',
    triggerSelector:
      'button:contains("Novo Produto"), [data-testid="novo-produto"]',
    modalSelector: '.fixed.inset-0',
    expectedElements: [
      'input[name="name"]',
      'input[name="price"]',
      'input[name="stock"]',
      'textarea[name="description"]',
    ],
    requiresAuth: true,
  },
  {
    name: 'ServicosModal',
    url: 'http://localhost:3000/admin/servicos',
    triggerSelector:
      'button:contains("Novo Serviço"), [data-testid="novo-servico"]',
    modalSelector: '.fixed.inset-0',
    expectedElements: [
      'input[name="name"]',
      'input[name="price"]',
      'textarea[name="description"]',
    ],
    requiresAuth: true,
  },
  {
    name: 'ClientesModal',
    url: 'http://localhost:3000/admin/clientes',
    triggerSelector:
      'button:contains("Novo Cliente"), [data-testid="novo-cliente"]',
    modalSelector: '.fixed.inset-0',
    expectedElements: [
      'input[name="name"]',
      'input[name="email"]',
      'input[name="phone"]',
    ],
    requiresAuth: true,
  },
];

class AdminModalResponsiveTester {
  constructor() {
    this.browser = null;
    this.results = [];
    this.isAuthenticated = false;
  }

  async init() {
    console.log(
      '🚀 Iniciando testes de responsividade dos modals administrativos...\n',
    );
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],
    });
  }

  async authenticate() {
    const page = await this.browser.newPage();

    try {
      console.log('🔐 Fazendo login administrativo...');

      await page.goto('http://localhost:3000/admin/login', {
        waitUntil: 'networkidle0',
      });

      // Tentar fazer login (ajustar conforme necessário)
      await page.type('input[name="email"]', 'admin@guapa.com');
      await page.type('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');

      // Aguardar redirecionamento
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // Verificar se está logado
      const currentUrl = page.url();
      if (
        currentUrl.includes('/admin/dashboard') ||
        currentUrl.includes('/admin/')
      ) {
        this.isAuthenticated = true;
        console.log('✅ Login administrativo realizado com sucesso');
      } else {
        console.log('⚠️  Login pode ter falhado, continuando mesmo assim...');
      }
    } catch (error) {
      console.log('⚠️  Erro no login administrativo:', error.message);
      console.log('Continuando sem autenticação...');
    } finally {
      await page.close();
    }
  }

  async testAdminModalResponsive(testCase, breakpoint) {
    const page = await this.browser.newPage();

    try {
      console.log(
        `📱 Testando ${testCase.name} em ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`,
      );

      // Definir viewport
      await page.setViewport({
        width: breakpoint.width,
        height: breakpoint.height,
      });

      // Navegar para a página
      await page.goto(testCase.url, { waitUntil: 'networkidle0' });

      // Aguardar carregamento
      await page.waitForTimeout(2000);

      // Verificar se precisa de autenticação
      if (testCase.requiresAuth && !this.isAuthenticated) {
        console.log(`⚠️  ${testCase.name} requer autenticação, pulando...`);
        return;
      }

      // Tentar encontrar e clicar no trigger do modal
      let modalOpened = false;
      try {
        // Tentar diferentes seletores para o trigger
        const triggerSelectors = testCase.triggerSelector.split(', ');
        for (const selector of triggerSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            await page.click(selector);
            modalOpened = true;
            break;
          } catch (e) {
            // Continuar tentando outros seletores
          }
        }

        if (!modalOpened) {
          // Tentar abrir modal via JavaScript
          await page.evaluate(() => {
            // Procurar por botões que possam abrir modals
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
              if (
                button.textContent.includes('Nova') ||
                button.textContent.includes('Novo')
              ) {
                button.click();
                break;
              }
            }
          });
        }

        // Aguardar modal aparecer
        await page.waitForSelector(testCase.modalSelector, { timeout: 5000 });

        // Verificar se o modal está visível
        const isModalVisible = await page.evaluate((selector) => {
          const modal = document.querySelector(selector);
          return modal && window.getComputedStyle(modal).display !== 'none';
        }, testCase.modalSelector);

        if (!isModalVisible) {
          throw new Error('Modal não está visível');
        }

        // Capturar screenshot do modal
        const modalElement = await page.$(testCase.modalSelector);
        const screenshot = await modalElement.screenshot({
          type: 'png',
          encoding: 'base64',
        });

        // Verificar elementos esperados
        const elementsFound = [];
        for (const elementSelector of testCase.expectedElements) {
          try {
            const element = await page.$(elementSelector);
            elementsFound.push({
              selector: elementSelector,
              found: !!element,
              visible: element
                ? await page.evaluate((el) => {
                    const style = window.getComputedStyle(el);
                    return (
                      style.display !== 'none' && style.visibility !== 'hidden'
                    );
                  }, element)
                : false,
            });
          } catch (e) {
            elementsFound.push({
              selector: elementSelector,
              found: false,
              visible: false,
            });
          }
        }

        // Verificar responsividade específica para modals administrativos
        const responsiveChecks = await page.evaluate((selector) => {
          const modal = document.querySelector(selector);
          if (!modal) return null;

          const rect = modal.getBoundingClientRect();
          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
          };

          // Verificar se o modal tem scroll interno
          const modalContent = modal.querySelector(
            '.max-h-\\[90vh\\], .overflow-y-auto, .max-h-screen',
          );
          const hasInternalScroll =
            modalContent &&
            modalContent.scrollHeight > modalContent.clientHeight;

          return {
            modalWidth: rect.width,
            modalHeight: rect.height,
            viewportWidth: viewport.width,
            viewportHeight: viewport.height,
            isOverflowing:
              rect.width > viewport.width || rect.height > viewport.height,
            isCentered:
              Math.abs(rect.left - (viewport.width - rect.width) / 2) < 10,
            hasScroll: modal.scrollHeight > modal.clientHeight,
            hasInternalScroll,
            formElementsVisible: modal.querySelectorAll(
              'input, select, textarea',
            ).length,
            buttonsVisible: modal.querySelectorAll('button').length,
          };
        }, testCase.modalSelector);

        // Resultado do teste
        const result = {
          testCase: testCase.name,
          breakpoint: breakpoint.name,
          dimensions: `${breakpoint.width}x${breakpoint.height}`,
          success: true,
          modalOpened: true,
          elementsFound,
          responsiveChecks,
          screenshot: `data:image/png;base64,${screenshot}`,
          issues: [],
        };

        // Identificar problemas específicos para modals administrativos
        if (responsiveChecks?.isOverflowing) {
          result.issues.push('Modal está transbordando da viewport');
        }

        if (!responsiveChecks?.isCentered) {
          result.issues.push('Modal não está centralizado');
        }

        if (responsiveChecks?.formElementsVisible === 0) {
          result.issues.push('Nenhum elemento de formulário visível');
        }

        if (responsiveChecks?.buttonsVisible === 0) {
          result.issues.push('Nenhum botão visível');
        }

        // Verificar se elementos de formulário estão acessíveis
        const missingElements = elementsFound.filter((el) => !el.found);
        if (missingElements.length > 0) {
          result.issues.push(
            `Elementos não encontrados: ${missingElements
              .map((el) => el.selector)
              .join(', ')}`,
          );
        }

        // Verificar usabilidade em mobile
        if (breakpoint.width <= 768) {
          if (responsiveChecks?.modalWidth < 300) {
            result.issues.push('Modal muito estreito para mobile');
          }
          if (
            responsiveChecks?.formElementsVisible > 5 &&
            !responsiveChecks?.hasInternalScroll
          ) {
            result.issues.push(
              'Muitos campos de formulário sem scroll em mobile',
            );
          }
        }

        this.results.push(result);
        console.log(
          `✅ ${testCase.name} em ${breakpoint.name}: ${
            result.issues.length === 0 ? 'OK' : 'PROBLEMAS'
          }`,
        );

        if (result.issues.length > 0) {
          console.log(`   ⚠️  Problemas: ${result.issues.join(', ')}`);
        }
      } catch (error) {
        console.log(
          `❌ ${testCase.name} em ${breakpoint.name}: ERRO - ${error.message}`,
        );
        this.results.push({
          testCase: testCase.name,
          breakpoint: breakpoint.name,
          dimensions: `${breakpoint.width}x${breakpoint.height}`,
          success: false,
          error: error.message,
          issues: ['Falha ao abrir modal'],
        });
      }
    } catch (error) {
      console.log(
        `❌ Erro geral em ${testCase.name} em ${breakpoint.name}: ${error.message}`,
      );
    } finally {
      await page.close();
    }
  }

  async runAllTests() {
    // Fazer login primeiro
    await this.authenticate();

    for (const testCase of adminTestCases) {
      for (const [key, breakpoint] of Object.entries(breakpoints)) {
        await this.testAdminModalResponsive(testCase, breakpoint);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Pausa entre testes
      }
    }
  }

  generateReport() {
    console.log(
      '\n📊 RELATÓRIO DE TESTES DE RESPONSIVIDADE DOS MODALS ADMINISTRATIVOS\n',
    );
    console.log('='.repeat(80));

    const summary = {
      total: 0,
      success: 0,
      failed: 0,
      withIssues: 0,
    };

    // Agrupar resultados por modal
    const groupedResults = {};
    this.results.forEach((result) => {
      if (!groupedResults[result.testCase]) {
        groupedResults[result.testCase] = [];
      }
      groupedResults[result.testCase].push(result);
    });

    // Relatório por modal
    Object.entries(groupedResults).forEach(([modalName, results]) => {
      console.log(`\n🔍 ${modalName.toUpperCase()}`);
      console.log('-'.repeat(50));

      results.forEach((result) => {
        summary.total++;
        if (result.success) {
          summary.success++;
          if (result.issues && result.issues.length > 0) {
            summary.withIssues++;
          }
        } else {
          summary.failed++;
        }

        const status = result.success
          ? result.issues && result.issues.length > 0
            ? '⚠️'
            : '✅'
          : '❌';

        console.log(`${status} ${result.breakpoint} (${result.dimensions})`);

        if (result.issues && result.issues.length > 0) {
          result.issues.forEach((issue) => {
            console.log(`   • ${issue}`);
          });
        }

        if (result.error) {
          console.log(`   • Erro: ${result.error}`);
        }
      });
    });

    // Resumo geral
    console.log('\n📈 RESUMO GERAL');
    console.log('='.repeat(50));
    console.log(`Total de testes: ${summary.total}`);
    console.log(`✅ Sucessos: ${summary.success}`);
    console.log(`⚠️  Com problemas: ${summary.withIssues}`);
    console.log(`❌ Falhas: ${summary.failed}`);
    console.log(
      `📊 Taxa de sucesso: ${((summary.success / summary.total) * 100).toFixed(
        1,
      )}%`,
    );

    // Análise específica para modals administrativos
    console.log('\n🎯 ANÁLISE ESPECÍFICA PARA MODALS ADMINISTRATIVOS');
    console.log('='.repeat(60));

    const mobileIssues = this.results
      .filter(
        (r) => r.breakpoint.includes('iPhone') || r.breakpoint.includes('iPad'),
      )
      .filter((r) => r.issues && r.issues.length > 0);

    if (mobileIssues.length > 0) {
      console.log('📱 Problemas em dispositivos móveis:');
      mobileIssues.forEach((result) => {
        console.log(
          `• ${result.testCase} em ${result.breakpoint}: ${result.issues.join(
            ', ',
          )}`,
        );
      });
    }

    const formIssues = this.results.filter(
      (r) =>
        r.issues &&
        r.issues.some(
          (issue) => issue.includes('formulário') || issue.includes('input'),
        ),
    );

    if (formIssues.length > 0) {
      console.log('\n📝 Problemas com formulários:');
      formIssues.forEach((result) => {
        console.log(
          `• ${result.testCase}: ${result.issues
            .filter((i) => i.includes('formulário') || i.includes('input'))
            .join(', ')}`,
        );
      });
    }

    console.log('\n💡 RECOMENDAÇÕES ESPECÍFICAS PARA MODALS ADMINISTRATIVOS:');
    console.log(
      '1. Implementar scroll interno para formulários longos em mobile',
    );
    console.log(
      '2. Garantir que campos de formulário sejam facilmente acessíveis',
    );
    console.log('3. Testar usabilidade com teclado virtual em mobile');
    console.log(
      '4. Verificar se botões de ação são grandes o suficiente para touch',
    );
    console.log('5. Implementar validação responsiva de formulários');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Função principal
async function main() {
  const tester = new AdminModalResponsiveTester();

  try {
    await tester.init();
    await tester.runAllTests();
    tester.generateReport();
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await tester.cleanup();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AdminModalResponsiveTester, breakpoints, adminTestCases };
