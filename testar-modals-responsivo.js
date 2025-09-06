/**
 * Script para testar o responsivo de todos os modals do site
 *
 * Este script testa:
 * - LoginModal
 * - OnboardingModal
 * - Cart Modal
 * - Modals de categorias (admin)
 * - Outros modals encontrados no projeto
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

// URLs e seletores para testar
const testCases = [
  {
    name: 'LoginModal',
    url: 'http://localhost:3000',
    triggerSelector:
      '[data-testid="login-button"], .login-button, button:contains("Login"), button:contains("Entrar")',
    modalSelector: '.fixed.inset-0.z-\\[10000\\]',
    expectedElements: [
      'h2:contains("Fazer Login")',
      'input[name="email"]',
      'input[name="password"]',
      'button[type="submit"]',
    ],
  },
  {
    name: 'CartModal',
    url: 'http://localhost:3000/produtos',
    triggerSelector:
      '[data-testid="cart-button"], .cart-button, button:contains("Carrinho")',
    modalSelector: '.fixed.inset-0.z-\\[9999\\]',
    expectedElements: ['h2:contains("Carrinho")', '.cart-item', '.total'],
  },
  {
    name: 'OnboardingModal',
    url: 'http://localhost:3000/painel-cliente',
    triggerSelector: '[data-testid="onboarding-trigger"]',
    modalSelector: '.fixed.inset-0.bg-black.bg-opacity-50',
    expectedElements: [
      'h2:contains("Complete seu Cadastro")',
      'input[name="name"]',
      'input[name="email"]',
      'input[name="phone"]',
    ],
  },
];

class ModalResponsiveTester {
  constructor() {
    this.browser = null;
    this.results = [];
  }

  async init() {
    console.log('🚀 Iniciando testes de responsividade dos modals...\n');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],
    });
  }

  async testModalResponsive(testCase, breakpoint) {
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
          // Se não encontrou trigger, tentar abrir modal diretamente via JavaScript
          await page.evaluate(() => {
            // Simular abertura do modal via eventos ou estado
            const event = new CustomEvent('openModal');
            window.dispatchEvent(event);
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

        // Verificar responsividade
        const responsiveChecks = await page.evaluate((selector) => {
          const modal = document.querySelector(selector);
          if (!modal) return null;

          const rect = modal.getBoundingClientRect();
          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
          };

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

        // Identificar problemas
        if (responsiveChecks?.isOverflowing) {
          result.issues.push('Modal está transbordando da viewport');
        }

        if (!responsiveChecks?.isCentered) {
          result.issues.push('Modal não está centralizado');
        }

        const missingElements = elementsFound.filter((el) => !el.found);
        if (missingElements.length > 0) {
          result.issues.push(
            `Elementos não encontrados: ${missingElements
              .map((el) => el.selector)
              .join(', ')}`,
          );
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
    for (const testCase of testCases) {
      for (const [key, breakpoint] of Object.entries(breakpoints)) {
        await this.testModalResponsive(testCase, breakpoint);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Pausa entre testes
      }
    }
  }

  generateReport() {
    console.log('\n📊 RELATÓRIO DE TESTES DE RESPONSIVIDADE DOS MODALS\n');
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

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES');
    console.log('='.repeat(50));

    const commonIssues = {};
    this.results.forEach((result) => {
      if (result.issues) {
        result.issues.forEach((issue) => {
          commonIssues[issue] = (commonIssues[issue] || 0) + 1;
        });
      }
    });

    if (Object.keys(commonIssues).length > 0) {
      console.log('Problemas mais comuns:');
      Object.entries(commonIssues)
        .sort(([, a], [, b]) => b - a)
        .forEach(([issue, count]) => {
          console.log(`• ${issue} (${count} ocorrências)`);
        });
    }

    console.log('\n🎯 AÇÕES SUGERIDAS:');
    console.log('1. Verificar CSS responsivo dos modals');
    console.log('2. Testar em dispositivos reais');
    console.log('3. Ajustar breakpoints se necessário');
    console.log('4. Implementar scroll interno para modals grandes');
    console.log('5. Garantir que modals sejam centralizados em todas as telas');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Função principal
async function main() {
  const tester = new ModalResponsiveTester();

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

module.exports = { ModalResponsiveTester, breakpoints, testCases };
