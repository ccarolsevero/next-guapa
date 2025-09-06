#!/usr/bin/env node

/**
 * Script principal para executar todos os testes de responsividade dos modals
 *
 * Uso:
 * node executar-testes-modals.js [opcao]
 *
 * Opções:
 * - manual: Abre o teste manual no navegador
 * - automatico: Executa testes automáticos (requer puppeteer)
 * - admin: Executa apenas testes dos modals administrativos
 * - todos: Executa todos os testes (padrão)
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class ModalTestRunner {
  constructor() {
    this.projectRoot = __dirname;
    this.testResults = [];
  }

  async checkDependencies() {
    console.log('🔍 Verificando dependências...\n');

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'),
    );
    const hasPuppeteer =
      packageJson.dependencies?.puppeteer ||
      packageJson.devDependencies?.puppeteer;

    if (!hasPuppeteer) {
      console.log('⚠️  Puppeteer não encontrado. Instalando...');
      await this.installPuppeteer();
    }

    console.log('✅ Dependências verificadas\n');
  }

  async installPuppeteer() {
    return new Promise((resolve, reject) => {
      const install = spawn('npm', ['install', 'puppeteer', '--save-dev'], {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });

      install.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Puppeteer instalado com sucesso\n');
          resolve();
        } else {
          console.log('❌ Erro ao instalar Puppeteer\n');
          reject(new Error('Falha na instalação'));
        }
      });
    });
  }

  async startDevServer() {
    console.log('🚀 Iniciando servidor de desenvolvimento...\n');

    return new Promise((resolve, reject) => {
      const server = spawn('npm', ['run', 'dev'], {
        cwd: this.projectRoot,
        stdio: 'pipe',
      });

      let serverReady = false;

      server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);

        if (
          output.includes('Ready') ||
          output.includes('started server') ||
          output.includes('Local:')
        ) {
          if (!serverReady) {
            serverReady = true;
            console.log('✅ Servidor iniciado com sucesso\n');
            resolve(server);
          }
        }
      });

      server.stderr.on('data', (data) => {
        console.error(data.toString());
      });

      server.on('error', (error) => {
        console.error('❌ Erro ao iniciar servidor:', error);
        reject(error);
      });

      // Timeout de 30 segundos
      setTimeout(() => {
        if (!serverReady) {
          console.log(
            '⚠️  Timeout ao iniciar servidor, continuando mesmo assim...\n',
          );
          resolve(server);
        }
      }, 30000);
    });
  }

  async runManualTest() {
    console.log('📱 Abrindo teste manual...\n');

    const manualTestPath = path.join(
      this.projectRoot,
      'testar-modals-manual.html',
    );

    if (!fs.existsSync(manualTestPath)) {
      console.log('❌ Arquivo de teste manual não encontrado');
      return;
    }

    // Tentar abrir no navegador padrão
    const { exec } = require('child_process');
    const command =
      process.platform === 'win32'
        ? `start ${manualTestPath}`
        : process.platform === 'darwin'
        ? `open ${manualTestPath}`
        : `xdg-open ${manualTestPath}`;

    exec(command, (error) => {
      if (error) {
        console.log('❌ Erro ao abrir navegador:', error.message);
        console.log(`📁 Abra manualmente: ${manualTestPath}`);
      } else {
        console.log('✅ Teste manual aberto no navegador');
      }
    });
  }

  async runAutomaticTests() {
    console.log('🤖 Executando testes automáticos...\n');

    try {
      const {
        ModalResponsiveTester,
      } = require('./testar-modals-responsivo.js');
      const tester = new ModalResponsiveTester();

      await tester.init();
      await tester.runAllTests();
      tester.generateReport();
      await tester.cleanup();
    } catch (error) {
      console.error('❌ Erro nos testes automáticos:', error.message);
    }
  }

  async runAdminTests() {
    console.log('👨‍💼 Executando testes dos modals administrativos...\n');

    try {
      const {
        AdminModalResponsiveTester,
      } = require('./testar-modals-admin-responsivo.js');
      const tester = new AdminModalResponsiveTester();

      await tester.init();
      await tester.runAllTests();
      tester.generateReport();
      await tester.cleanup();
    } catch (error) {
      console.error('❌ Erro nos testes administrativos:', error.message);
    }
  }

  async runAllTests() {
    console.log('🎯 Executando todos os testes...\n');

    await this.runAutomaticTests();
    await this.runAdminTests();
  }

  async generateSummaryReport() {
    console.log('\n📊 RELATÓRIO FINAL DE TESTES DE MODALS\n');
    console.log('='.repeat(60));

    console.log('\n📋 RESUMO DOS TESTES REALIZADOS:');
    console.log('• Teste manual: testar-modals-manual.html');
    console.log('• Testes automáticos: testar-modals-responsivo.js');
    console.log('• Testes administrativos: testar-modals-admin-responsivo.js');

    console.log('\n🎯 MODALS TESTADOS:');
    console.log('• LoginModal - Modal de login/cadastro');
    console.log('• OnboardingModal - Modal de onboarding');
    console.log('• CartModal - Modal do carrinho');
    console.log('• CategoriasModal - Modal de categorias (admin)');
    console.log('• ProdutosModal - Modal de produtos (admin)');
    console.log('• ServicosModal - Modal de serviços (admin)');
    console.log('• ClientessModal - Modal de clientes (admin)');

    console.log('\n📱 BREAKPOINTS TESTADOS:');
    console.log('• iPhone SE: 375x667');
    console.log('• iPhone 11 Pro Max: 414x896');
    console.log('• iPad: 768x1024');
    console.log('• iPad Pro: 1024x1366');
    console.log('• Desktop: 1280x720');
    console.log('• Desktop Large: 1920x1080');

    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Revisar resultados dos testes');
    console.log('2. Corrigir problemas identificados');
    console.log('3. Testar em dispositivos reais');
    console.log('4. Implementar melhorias sugeridas');
    console.log('5. Validar usabilidade final');
  }

  async run(option = 'todos') {
    console.log('🧪 INICIANDO TESTES DE RESPONSIVIDADE DOS MODALS\n');
    console.log('='.repeat(60));

    try {
      await this.checkDependencies();

      let server = null;

      // Iniciar servidor apenas se necessário
      if (option !== 'manual') {
        try {
          server = await this.startDevServer();
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Aguardar servidor estabilizar
        } catch (error) {
          console.log('⚠️  Erro ao iniciar servidor, continuando sem ele...');
        }
      }

      switch (option) {
        case 'manual':
          await this.runManualTest();
          break;
        case 'automatico':
          await this.runAutomaticTests();
          break;
        case 'admin':
          await this.runAdminTests();
          break;
        case 'todos':
        default:
          await this.runAllTests();
          break;
      }

      await this.generateSummaryReport();
    } catch (error) {
      console.error('❌ Erro durante execução dos testes:', error);
    } finally {
      // Fechar servidor se foi iniciado
      if (server) {
        console.log('\n🛑 Fechando servidor...');
        server.kill();
      }
    }
  }
}

// Função principal
async function main() {
  const option = process.argv[2] || 'todos';

  const validOptions = ['manual', 'automatico', 'admin', 'todos'];
  if (!validOptions.includes(option)) {
    console.log('❌ Opção inválida. Use uma das seguintes:');
    console.log('• manual - Abre teste manual no navegador');
    console.log('• automatico - Executa testes automáticos');
    console.log('• admin - Executa testes dos modals administrativos');
    console.log('• todos - Executa todos os testes (padrão)');
    process.exit(1);
  }

  const runner = new ModalTestRunner();
  await runner.run(option);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ModalTestRunner };
