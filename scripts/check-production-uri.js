console.log('🔍 Verificando variáveis de ambiente...');
console.log(
  'MONGODB_URI:',
  process.env.MONGODB_URI ? 'Configurada' : 'Não configurada',
);
console.log('NODE_ENV:', process.env.NODE_ENV);

if (process.env.MONGODB_URI) {
  console.log(
    'URI (primeiros 20 chars):',
    process.env.MONGODB_URI.substring(0, 20) + '...',
  );
} else {
  console.log('❌ MONGODB_URI não está configurada localmente');
  console.log('💡 Isso significa que os scripts estão usando o banco local');
  console.log(
    '💡 Para conectar na produção, precisa configurar a variável MONGODB_URI',
  );
}
