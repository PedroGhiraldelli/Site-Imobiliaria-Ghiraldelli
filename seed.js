/**
 * Script de inicialização do banco de dados.
 * Cria as tabelas e insere dados de exemplo.
 * Uso: node seed.js
 */
require('dotenv').config();
const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true,
  });

  const DB = process.env.DB_NAME || 'ghiraldelli_imoveis';
  console.log(`\n📦  Criando banco "${DB}"...`);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB}\``);
  await conn.query(`USE \`${DB}\``);

  console.log('📋  Criando tabelas...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS imoveis (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      titulo      VARCHAR(255) NOT NULL,
      tipo        ENUM('Casa','Apartamento','Terreno','Comercial') NOT NULL,
      transacao   ENUM('Venda','Aluguel') NOT NULL,
      preco       DECIMAL(15,2) NOT NULL,
      cidade      VARCHAR(100) NOT NULL,
      bairro      VARCHAR(100),
      area        DECIMAL(10,2),
      quartos     INT DEFAULT 0,
      banheiros   INT DEFAULT 0,
      vagas       INT DEFAULT 0,
      descricao   TEXT,
      destaque    TINYINT(1) DEFAULT 0,
      ativo       TINYINT(1) DEFAULT 1,
      criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS fotos (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      imovel_id   INT NOT NULL,
      caminho     VARCHAR(255) NOT NULL,
      ordem       INT DEFAULT 0,
      FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS config (
      chave  VARCHAR(100) PRIMARY KEY,
      valor  TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('🔑  Configurando admin...');
  const hash = await bcrypt.hash('ghiraldelli2024', 10);
  await conn.query(`
    INSERT INTO config (chave, valor) VALUES ('admin_hash', ?)
    ON DUPLICATE KEY UPDATE valor = ?`, [hash, hash]);
  await conn.query(`
    INSERT INTO config (chave, valor) VALUES ('whatsapp', '5511999999999')
    ON DUPLICATE KEY UPDATE valor = valor`);

  console.log('🏠  Inserindo imóveis de exemplo...');
  const imoveis = [
    ['Casa de Alto Padrão em Condomínio', 'Casa', 'Venda', 1850000, 'São Paulo', 'Alphaville', 380, 4, 5, 4,
     'Luxuosa casa em condomínio fechado com piscina aquecida, churrasqueira, jardim projetado e acabamento premium em todos os ambientes. Segurança 24h.', 1],
    ['Apartamento com Vista para o Mar', 'Apartamento', 'Venda', 950000, 'Santos', 'Gonzaga', 120, 3, 2, 2,
     'Lindo apartamento com varanda gourmet e vista panorâmica para o oceano. Posição privilegiada, andar alto, totalmente reformado.', 1],
    ['Sala Comercial no Centro', 'Comercial', 'Aluguel', 4500, 'São Paulo', 'Centro', 60, 0, 1, 1,
     'Sala comercial em prédio corporativo com recepção, ar-condicionado central e estacionamento rotativo. Ideal para escritórios e consultórios.', 0],
    ['Terreno em Loteamento Fechado', 'Terreno', 'Venda', 280000, 'Campinas', 'Nova Campinas', 500, 0, 0, 0,
     'Terreno plano em loteamento fechado de alto padrão com infraestrutura completa. Ótima localização próxima a escolas e comércio.', 1],
    ['Apartamento Studio Moderno', 'Apartamento', 'Aluguel', 2800, 'São Paulo', 'Pinheiros', 38, 1, 1, 1,
     'Studio moderno e funcional em bairro nobre. Cozinha integrada, varanda, academia e área de lazer no condomínio. Próximo ao metrô.', 0],
    ['Casa com Piscina em Bairro Tranquilo', 'Casa', 'Venda', 620000, 'Sorocaba', 'Jardim Europa', 210, 3, 3, 2,
     'Casa espaçosa com piscina, área gourmet e quintal amplo. Bairro residencial tranquilo, ótima infraestrutura e segurança.', 1],
  ];

  for (const im of imoveis) {
    await conn.query(
      `INSERT INTO imoveis (titulo,tipo,transacao,preco,cidade,bairro,area,quartos,banheiros,vagas,descricao,destaque)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, im
    );
  }

  await conn.end();
  console.log('\n✅  Banco de dados inicializado com sucesso!');
  console.log('    Usuário admin: admin');
  console.log('    Senha admin:   ghiraldelli2024\n');
}

seed().catch(err => {
  console.error('\n❌  Erro ao inicializar banco:', err.message);
  process.exit(1);
});
