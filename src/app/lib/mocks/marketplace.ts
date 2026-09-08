/**
 * Mock Data para o módulo Marketplace
 */

import type { Lojista, Produto, Pedido, PedidoStatus } from '../types/marketplace';

// ============================================
// LOJISTAS (5 lojistas)
// ============================================

export const mockLojistas: Lojista[] = [
  {
    id: 'lojista-001',
    nome: 'TechStore',
    slug: 'techstore',
    descricao: 'Sua loja de tecnologia e eletrônicos. smartphones, notebooks, periféricos e acessórios.',
    logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop',
    capaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
    tipo: 'varejo',
    nota: 4.8,
    totalAvaliacoes: 245,
    telefone: '(11) 99999-0001',
    email: 'contato@techstore.com.br',
    endereco: 'Av. Paulista, 1000',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    createdAt: '2024-01-15T10:00:00Z',
    atualizadoEm: '2024-12-01T15:30:00Z',
  },
  {
    id: 'lojista-002',
    nome: 'Moda Urbana',
    slug: 'moda-urbana',
    descricao: 'Moda streetwear e tendências urbanas. Roupas, tênis e acessórios para quem é cool.',
    logoUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=200&h=200&fit=crop',
    capaUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
    tipo: 'varejo',
    nota: 4.5,
    totalAvaliacoes: 189,
    telefone: '(11) 99999-0002',
    email: 'vendas@modaurbana.com.br',
    endereco: 'Rua Oscar Freire, 250',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01426-001',
    createdAt: '2024-02-20T14:00:00Z',
    atualizadoEm: '2024-11-15T09:00:00Z',
  },
  {
    id: 'lojista-003',
    nome: 'Casa & Decor',
    slug: 'casa-decor',
    descricao: 'Tudo para sua casa ficar mais bonita. Móveis, decoração, utensílios e artigos para lar.',
    logoUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop',
    capaUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=400&fit=crop',
    tipo: 'varejo',
    nota: 4.7,
    totalAvaliacoes: 312,
    telefone: '(11) 99999-0003',
    email: 'atendimento@casadecor.com.br',
    endereco: 'Av. Brasil, 500',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01430-000',
    createdAt: '2024-01-05T08:00:00Z',
    atualizadoEm: '2024-12-10T11:45:00Z',
  },
  {
    id: 'lojista-004',
    nome: 'Beauty Lab',
    slug: 'beauty-lab',
    descricao: 'Cuidados com a pele e beleza. Cosméticos, maquiagem, perfumes e produtos de beleza.',
    logoUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop',
    capaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=400&fit=crop',
    tipo: 'varejo',
    nota: 4.9,
    totalAvaliacoes: 428,
    telefone: '(11) 99999-0004',
    email: 'sac@beautylab.com.br',
    endereco: 'Av. Brigadeiro Faria Lima, 800',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '05426-100',
    createdAt: '2024-03-01T12:00:00Z',
    atualizadoEm: '2024-12-05T16:20:00Z',
  },
  {
    id: 'lojista-005',
    nome: 'Pet Love',
    slug: 'pet-love',
    descricao: 'Tudo para seu pet felizardo. Rações, brinquedos, acessórios e cuidados para pets.',
    logoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
    capaUrl: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=400&fit=crop',
    tipo: 'varejo',
    nota: 4.6,
    totalAvaliacoes: 156,
    telefone: '(11) 99999-0005',
    email: 'contato@petlove.com.br',
    endereco: 'Rua dos Pets, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '05001-000',
    createdAt: '2024-04-10T09:30:00Z',
    atualizadoEm: '2024-11-20T14:10:00Z',
  },
];

// ============================================
// PRODUTOS (20 produtos - 4 por lojista)
// ============================================

export const mockProdutos: Produto[] = [
  // TechStore (4 produtos)
  {
    id: 'produto-001',
    lojistaId: 'lojista-001',
    nome: 'Smartphone Galaxy S24',
    slug: 'smartphone-galaxy-s24',
    descricao: 'Samsung Galaxy S24 com câmera de 50MP, tela AMOLED e processador rápido.',
    preco: 499900, // R$ 4.999,00
    precoPromocional: 449900, // R$ 4.499,00
    imagemUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
    imagens: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
    ],
    categoria: 'Eletrônicos',
    subcategoria: 'Smartphones',
    estoque: 50,
    sku: 'SM-S24-256',
    peso: 167,
    dimensoes: { largura: 70, altura: 147, profundidade: 7 },
    freightGratis: true,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-06-01T10:00:00Z',
    atualizadoEm: '2024-12-01T15:00:00Z',
  },
  {
    id: 'produto-002',
    lojistaId: 'lojista-001',
    nome: 'Notebook Pro 15',
    slug: 'notebook-pro-15',
    descricao: 'Notebook com processador Intel i7, 16GB RAM, SSD 512GB e tela Full HD.',
    preco: 599900, // R$ 5.999,00
    imagemUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop',
    categoria: 'Eletrônicos',
    subcategoria: 'Notebooks',
    estoque: 25,
    sku: 'NP-PRO-15',
    peso: 1900,
    dimensoes: { largura: 360, altura: 20, profundidade: 240 },
    freightGratis: false,
    freightValor: 2990,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-05-15T10:00:00Z',
    atualizadoEm: '2024-11-20T15:00:00Z',
  },
  {
    id: 'produto-003',
    lojistaId: 'lojista-001',
    nome: 'Fone de Ouvido Bluetooth',
    slug: 'fone-bluetooth-pro',
    descricao: 'Fone sem fio com cancelamento de ruído e bateria de 30h.',
    preco: 29990, // R$ 299,90
    imagemUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    categoria: 'Eletrônicos',
    subcategoria: 'Áudio',
    estoque: 100,
    sku: 'FONE-BT-PRO',
    peso: 250,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-07-10T10:00:00Z',
    atualizadoEm: '2024-10-05T15:00:00Z',
  },
  {
    id: 'produto-004',
    lojistaId: 'lojista-001',
    nome: 'Smartwatch Fit Pro',
    slug: 'smartwatch-fit-pro',
    descricao: 'Relógio inteligente com monitoramento de saúde, GPS e resistência à água.',
    preco: 199900, // R$ 1.999,00
    imagemUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
    categoria: 'Eletrônicos',
    subcategoria: 'Wearables',
    estoque: 75,
    sku: 'SW-FIT-PRO',
    peso: 45,
    freightGratis: true,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-08-01T10:00:00Z',
    atualizadoEm: '2024-12-01T15:00:00Z',
  },

  // Moda Urbana (4 produtos)
  {
    id: 'produto-005',
    lojistaId: 'lojista-002',
    nome: 'Jaqueta Corta Vento Street',
    slug: 'jaqueta-corta-vento-street',
    descricao: 'Jaqueta leve e resistente, perfeita para o look urbano.',
    preco: 29990, // R$ 299,90
    precoPromocional: 24990, // R$ 249,90
    imagemUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
    categoria: 'Moda',
    subcategoria: 'Jaquetas',
    estoque: 40,
    sku: 'JKT-STREET',
    peso: 400,
    freightGratis: false,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-06-15T10:00:00Z',
    atualizadoEm: '2024-11-10T15:00:00Z',
  },
  {
    id: 'produto-006',
    lojistaId: 'lojista-002',
    nome: 'Tênis Urban Run',
    slug: 'tenis-urban-run',
    descricao: 'Tênis casual com design moderno e conforto garantido.',
    preco: 34990, // R$ 349,90
    imagemUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
    categoria: 'Moda',
    subcategoria: 'Tênis',
    estoque: 60,
    sku: 'TNS-URBAN',
    peso: 700,
    freightGratis: false,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-05-20T10:00:00Z',
    atualizadoEm: '2024-12-05T15:00:00Z',
  },
  {
    id: 'produto-007',
    lojistaId: 'lojista-002',
    nome: 'Boné Trucker Premium',
    slug: 'bone-trucker-premium',
    descricao: 'Boné estilo trucker com estampa exclusiva.',
    preco: 4990, // R$ 49,90
    imagemUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    categoria: 'Moda',
    subcategoria: 'Acessórios',
    estoque: 0,
    sku: 'BNE-TRUCK',
    peso: 80,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-09-01T10:00:00Z',
    atualizadoEm: '2024-10-15T15:00:00Z',
  },
  {
    id: 'produto-008',
    lojistaId: 'lojista-002',
    nome: 'Mochila Urbana 25L',
    slug: 'mochila-urbana-25l',
    descricao: 'Mochila resistente com design urbano e múltiplos compartimentos.',
    preco: 19990, // R$ 199,90
    imagemUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    categoria: 'Moda',
    subcategoria: 'Bolsas',
    estoque: 35,
    sku: 'MCH-URBAN',
    peso: 600,
    freightGratis: true,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-07-20T10:00:00Z',
    atualizadoEm: '2024-11-25T15:00:00Z',
  },

  // Casa & Decor (4 produtos)
  {
    id: 'produto-009',
    lojistaId: 'lojista-003',
    nome: 'Sofá 2 Lugares Moderno',
    slug: 'sofa-2-lugares-moderno',
    descricao: 'Sofá aconchegante com design moderno e tecido de alta qualidade.',
    preco: 129990, // R$ 1.299,90
    imagemUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    categoria: 'Móveis',
    subcategoria: 'Sofás',
    estoque: 15,
    sku: 'SOF-2L-MOD',
    peso: 35000,
    freightGratis: false,
    freightValor: 7990,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-04-10T10:00:00Z',
    atualizadoEm: '2024-12-01T15:00:00Z',
  },
  {
    id: 'produto-010',
    lojistaId: 'lojista-003',
    nome: 'Luminária Pendente Loft',
    slug: 'luminaria-pendente-loft',
    descricao: 'Luminária de design industrial, perfeito para ambientes modernos.',
    preco: 14990, // R$ 149,90
    imagemUrl: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop',
    categoria: 'Iluminação',
    subcategoria: 'Luminárias',
    estoque: 50,
    sku: 'LUM-PEN-LOFT',
    peso: 800,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-06-01T10:00:00Z',
    atualizadoEm: '2024-10-20T15:00:00Z',
  },
  {
    id: 'produto-011',
    lojistaId: 'lojista-003',
    nome: 'Almofada Decorativa 45x45',
    slug: 'almofada-decorativa-45x45',
    descricao: 'Almofada macia com estampa moderna para sua sala.',
    preco: 4990, // R$ 49,90
    imagemUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop',
    categoria: 'Decoração',
    subcategoria: 'Almofadas',
    estoque: 80,
    sku: 'ALM-DEC-45',
    peso: 300,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-08-15T10:00:00Z',
    atualizadoEm: '2024-11-30T15:00:00Z',
  },
  {
    id: 'produto-012',
    lojistaId: 'lojista-003',
    nome: 'Quadro Abstracto 60x80',
    slug: 'quadro-abstracto-60x80',
    descricao: 'Quadro decorativo com arte abstrata moderna.',
    preco: 8990, // R$ 89,90
    imagemUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop',
    categoria: 'Decoração',
    subcategoria: 'Quadros',
    estoque: 25,
    sku: 'QDR-ABST-60',
    peso: 1200,
    freightGratis: true,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-09-20T10:00:00Z',
    atualizadoEm: '2024-12-05T15:00:00Z',
  },

  // Beauty Lab (4 produtos)
  {
    id: 'produto-013',
    lojistaId: 'lojista-004',
    nome: 'Kit skincare Hydration',
    slug: 'kit-skincare-hydration',
    descricao: 'Kit completo de hidratação para todos os tipos de pele.',
    preco: 24990, // R$ 249,90
    precoPromocional: 19990, // R$ 199,90
    imagemUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    categoria: 'Beleza',
    subcategoria: 'Skincare',
    estoque: 60,
    sku: 'KIT-HYDR',
    peso: 350,
    freightGratis: true,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-05-01T10:00:00Z',
    atualizadoEm: '2024-12-10T15:00:00Z',
  },
  {
    id: 'produto-014',
    lojistaId: 'lojista-004',
    nome: 'Batom Matte Vintage Red',
    slug: 'batom-matte-vintage-red',
    descricao: 'Batom de longa duração com acabamento matte.',
    preco: 4990, // R$ 49,90
    imagemUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop',
    categoria: 'Beleza',
    subcategoria: 'Maquiagem',
    estoque: 100,
    sku: 'BTM-MAT-VR',
    peso: 15,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-07-10T10:00:00Z',
    atualizadoEm: '2024-11-15T15:00:00Z',
  },
  {
    id: 'produto-015',
    lojistaId: 'lojista-004',
    nome: 'Perfume Floral Essence 50ml',
    slug: 'perfume-floral-essence-50ml',
    descricao: 'Perfume feminino com notas florais e frutais.',
    preco: 15990, // R$ 159,90
    imagemUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    categoria: 'Beleza',
    subcategoria: 'Perfumes',
    estoque: 45,
    sku: 'PRF-FLORAL',
    peso: 100,
    freightGratis: false,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-06-20T10:00:00Z',
    atualizadoEm: '2024-12-08T15:00:00Z',
  },
  {
    id: 'produto-016',
    lojistaId: 'lojista-004',
    nome: 'Escova Rotativa Ionic Pro',
    slug: 'escova-rotativa-ionic-pro',
    descricao: 'Escova secadora profissional com íons negativos.',
    preco: 22990, // R$ 229,90
    imagemUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&h=400&fit=crop',
    categoria: 'Beleza',
    subcategoria: 'Cabelos',
    estoque: 30,
    sku: 'ESC-ROT-PRO',
    peso: 600,
    freightGratis: false,
    freightValor: 1990,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-08-05T10:00:00Z',
    atualizadoEm: '2024-11-20T15:00:00Z',
  },

  // Pet Love (4 produtos)
  {
    id: 'produto-017',
    lojistaId: 'lojista-005',
    nome: 'Ração Premium Cães 10kg',
    slug: 'racao-premium-caes-10kg',
    descricao: 'Ração completa para cães adultos, sabor frango.',
    preco: 14990, // R$ 149,90
    imagemUrl: 'https://images.unsplash.com/photo-1589924691195-41432c84c161?w=400&h=400&fit=crop',
    categoria: 'Pet',
    subcategoria: 'Ração',
    estoque: 200,
    sku: 'RAC-CAE-10',
    peso: 10000,
    freightGratis: true,
    destaque: true,
    status: 'ativo',
    criadoEm: '2024-04-15T10:00:00Z',
    atualizadoEm: '2024-12-01T15:00:00Z',
  },
  {
    id: 'produto-018',
    lojistaId: 'lojista-005',
    nome: 'Cama Pet Comfort Large',
    slug: 'cama-pet-comfort-large',
    descricao: 'Cama macia e aconchegante para pets de porte grande.',
    preco: 9990, // R$ 99,90
    imagemUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop',
    categoria: 'Pet',
    subcategoria: 'Camas',
    estoque: 40,
    sku: 'CMA-PET-LG',
    peso: 1500,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-06-01T10:00:00Z',
    atualizadoEm: '2024-10-25T15:00:00Z',
  },
  {
    id: 'produto-019',
    lojistaId: 'lojista-005',
    nome: 'Brinquedo Interativo Mordedor',
    slug: 'brinquedo-interativo-mordedor',
    descricao: 'Brinquedo resistente para entreter seu pet.',
    preco: 2990, // R$ 29,90
    imagemUrl: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
    categoria: 'Pet',
    subcategoria: 'Brinquedos',
    estoque: 150,
    sku: 'BRQ-MORD',
    peso: 200,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-09-10T10:00:00Z',
    atualizadoEm: '2024-11-05T15:00:00Z',
  },
  {
    id: 'produto-020',
    lojistaId: 'lojista-005',
    nome: 'Coleira Regulável com Pingente',
    slug: 'coleira-regulavel-pingente',
    descricao: 'Coleira resistente com pingente personalizado.',
    preco: 4990, // R$ 49,90
    imagemUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop',
    categoria: 'Pet',
    subcategoria: 'Acessórios',
    estoque: 80,
    sku: 'COL-REG-PING',
    peso: 100,
    freightGratis: false,
    destaque: false,
    status: 'ativo',
    criadoEm: '2024-08-01T10:00:00Z',
    atualizadoEm: '2024-12-02T15:00:00Z',
  },
];

// ============================================
// PEDIDOS (10 pedidos com status variados)
// ============================================

export const mockPedidos: Pedido[] = [
  {
    id: 'pedido-001',
    clienteId: 'cliente-001',
    clienteNome: 'João Silva',
    clienteEmail: 'joao.silva@email.com',
    itens: [
      { produtoId: 'produto-001', produtoNome: 'Smartphone Galaxy S24', quantidade: 1, precoUnitario: 449900, precoTotal: 449900 },
    ],
    status: 'pendente',
    valorSubtotal: 449900,
    valorFrete: 0,
    valorTotal: 449900,
    formaPagamento: 'PIX',
    enderecoEntrega: {
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Jardim Primavera',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
    },
    dataPedido: '2024-12-10T14:30:00Z',
  },
  {
    id: 'pedido-002',
    clienteId: 'cliente-002',
    clienteNome: 'Maria Santos',
    clienteEmail: 'maria.santos@email.com',
    itens: [
      { produtoId: 'produto-005', produtoNome: 'Jaqueta Corta Vento Street', quantidade: 1, precoUnitario: 24990, precoTotal: 24990 },
      { produtoId: 'produto-006', produtoNome: 'Tênis Urban Run', quantidade: 1, precoUnitario: 34990, precoTotal: 34990 },
    ],
    status: 'pago',
    valorSubtotal: 59980,
    valorFrete: 1590,
    valorTotal: 61570,
    formaPagamento: 'Cartão de Crédito',
    enderecoEntrega: {
      logradouro: 'Av. Brasil',
      numero: '500',
      bairro: 'Centro',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20040-001',
    },
    dataPedido: '2024-12-09T10:15:00Z',
    dataPagamento: '2024-12-09T10:30:00Z',
  },
  {
    id: 'pedido-003',
    clienteId: 'cliente-003',
    clienteNome: 'Pedro Costa',
    clienteEmail: 'pedro.costa@email.com',
    itens: [
      { produtoId: 'produto-009', produtoNome: 'Sofá 2 Lugares Moderno', quantidade: 1, precoUnitario: 129990, precoTotal: 129990 },
    ],
    status: 'pago',
    valorSubtotal: 129990,
    valorFrete: 7990,
    valorTotal: 137980,
    formaPagamento: 'Boleto Bancário',
    enderecoEntrega: {
      logradouro: 'Rua dos Pinheiros',
      numero: '890',
      complemento: 'Casa',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '05434-010',
    },
    dataPedido: '2024-12-08T16:45:00Z',
    dataPagamento: '2024-12-09T09:00:00Z',
  },
  {
    id: 'pedido-004',
    clienteId: 'cliente-004',
    clienteNome: 'Ana Oliveira',
    clienteEmail: 'ana.oliveira@email.com',
    itens: [
      { produtoId: 'produto-013', produtoNome: 'Kit skincare Hydration', quantidade: 2, precoUnitario: 19990, precoTotal: 39980 },
      { produtoId: 'produto-014', produtoNome: 'Batom Matte Vintage Red', quantidade: 3, precoUnitario: 4990, precoTotal: 14970 },
    ],
    status: 'pago',
    valorSubtotal: 54950,
    valorFrete: 0,
    valorTotal: 54950,
    formaPagamento: 'PIX',
    enderecoEntrega: {
      logradouro: 'Av. Paulista',
      numero: '1000',
      complemento: 'Conj 12',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
    },
    dataPedido: '2024-12-07T11:20:00Z',
    dataPagamento: '2024-12-07T11:35:00Z',
  },
  {
    id: 'pedido-005',
    clienteId: 'cliente-005',
    clienteNome: 'Carlos Ferreira',
    clienteEmail: 'carlos.ferreira@email.com',
    itens: [
      { produtoId: 'produto-017', produtoNome: 'Ração Premium Cães 10kg', quantidade: 3, precoUnitario: 14990, precoTotal: 44970 },
    ],
    status: 'enviado',
    valorSubtotal: 44970,
    valorFrete: 0,
    valorTotal: 44970,
    formaPagamento: 'Cartão de Débito',
    enderecoEntrega: {
      logradouro: 'Rua da Paz',
      numero: '45',
      bairro: 'Jardim das Flores',
      cidade: 'Campinas',
      estado: 'SP',
      cep: '13050-100',
    },
    dataPedido: '2024-12-05T09:00:00Z',
    dataPagamento: '2024-12-05T09:15:00Z',
    dataEnvio: '2024-12-06T14:00:00Z',
  },
  {
    id: 'pedido-006',
    clienteId: 'cliente-006',
    clienteNome: 'Juliana Martins',
    clienteEmail: 'juliana.martins@email.com',
    itens: [
      { produtoId: 'produto-002', produtoNome: 'Notebook Pro 15', quantidade: 1, precoUnitario: 599900, precoTotal: 599900 },
    ],
    status: 'enviado',
    valorSubtotal: 599900,
    valorFrete: 2990,
    valorTotal: 602890,
    formaPagamento: 'Cartão de Crédito',
    enderecoEntrega: {
      logradouro: 'Av. Nossa Senhora de Fátima',
      numero: '200',
      complemento: 'Bloco A',
      bairro: 'Jardim Santo André',
      cidade: 'Santo André',
      estado: 'SP',
      cep: '09060-100',
    },
    dataPedido: '2024-12-04T13:30:00Z',
    dataPagamento: '2024-12-04T14:00:00Z',
    dataEnvio: '2024-12-05T16:00:00Z',
  },
  {
    id: 'pedido-007',
    clienteId: 'cliente-007',
    clienteNome: 'Ricardo Alves',
    clienteEmail: 'ricardo.alves@email.com',
    itens: [
      { produtoId: 'produto-010', produtoNome: 'Luminária Pendente Loft', quantidade: 2, precoUnitario: 14990, precoTotal: 29980 },
    ],
    status: 'entregue',
    valorSubtotal: 29980,
    valorFrete: 1590,
    valorTotal: 31570,
    formaPagamento: 'PIX',
    enderecoEntrega: {
      logradouro: 'Rua das Acácias',
      numero: '78',
      bairro: 'Parque Residencial',
      cidade: 'São Bernardo do Campo',
      estado: 'SP',
      cep: '09750-100',
    },
    dataPedido: '2024-11-28T15:45:00Z',
    dataPagamento: '2024-11-28T16:00:00Z',
    dataEnvio: '2024-11-30T10:00:00Z',
    dataEntrega: '2024-12-03T14:30:00Z',
  },
  {
    id: 'pedido-008',
    clienteId: 'cliente-008',
    clienteNome: 'Fernanda Lima',
    clienteEmail: 'fernanda.lima@email.com',
    itens: [
      { produtoId: 'produto-015', produtoNome: 'Perfume Floral Essence 50ml', quantidade: 1, precoUnitario: 15990, precoTotal: 15990 },
      { produtoId: 'produto-016', produtoNome: 'Escova Rotativa Ionic Pro', quantidade: 1, precoUnitario: 22990, precoTotal: 22990 },
    ],
    status: 'entregue',
    valorSubtotal: 38980,
    valorFrete: 1990,
    valorTotal: 40970,
    formaPagamento: 'Cartão de Crédito',
    enderecoEntrega: {
      logradouro: 'Av. Independência',
      numero: '350',
      complemento: 'Apto 8B',
      bairro: 'Vila independência',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04280-000',
    },
    dataPedido: '2024-11-25T10:00:00Z',
    dataPagamento: '2024-11-25T10:20:00Z',
    dataEnvio: '2024-11-27T09:00:00Z',
    dataEntrega: '2024-12-01T16:00:00Z',
  },
  {
    id: 'pedido-009',
    clienteId: 'cliente-009',
    clienteNome: 'Bruno Souza',
    clienteEmail: 'bruno.souza@email.com',
    itens: [
      { produtoId: 'produto-011', produtoNome: 'Almofada Decorativa 45x45', quantidade: 4, precoUnitario: 4990, precoTotal: 19960 },
      { produtoId: 'produto-012', produtoNome: 'Quadro Abstracto 60x80', quantidade: 1, precoUnitario: 8990, precoTotal: 8990 },
    ],
    status: 'cancelado',
    valorSubtotal: 28950,
    valorFrete: 0,
    valorTotal: 28950,
    formaPagamento: 'Boleto Bancário',
    enderecoEntrega: {
      logradouro: 'Rua das Palmeiras',
      numero: '12',
      bairro: 'Sumaré',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '05450-000',
    },
    dataPedido: '2024-11-20T08:30:00Z',
  },
  {
    id: 'pedido-010',
    clienteId: 'cliente-001',
    clienteNome: 'João Silva',
    clienteEmail: 'joao.silva@email.com',
    itens: [
      { produtoId: 'produto-018', produtoNome: 'Cama Pet Comfort Large', quantidade: 1, precoUnitario: 9990, precoTotal: 9990 },
      { produtoId: 'produto-020', produtoNome: 'Coleira Regulável com Pingente', quantidade: 2, precoUnitario: 4990, precoTotal: 9980 },
    ],
    status: 'pendente',
    valorSubtotal: 19970,
    valorFrete: 1590,
    valorTotal: 21560,
    formaPagamento: 'PIX',
    enderecoEntrega: {
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Jardim Primavera',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
    },
    dataPedido: '2024-12-11T09:00:00Z',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Busca um lojista pelo ID
 */
export function getLojistaById(id: string): Lojista | undefined {
  return mockLojistas.find((lojista) => lojista.id === id);
}

/**
 * Busca um lojista pelo slug
 */
export function getLojistaBySlug(slug: string): Lojista | undefined {
  return mockLojistas.find((lojista) => lojista.slug === slug);
}

/**
 * Busca produtos de um lojista específico
 */
export function getProdutosByLojista(lojistaId: string): Produto[] {
  return mockProdutos.filter((produto) => produto.lojistaId === lojistaId);
}

/**
 * Busca um produto pelo ID
 */
export function getProdutoById(id: string): Produto | undefined {
  return mockProdutos.find((produto) => produto.id === id);
}

/**
 * Filtra produtos com base em opções
 */
export function filtrarProdutos(options: {
  categoria?: string;
  precoMin?: number;
  precoMax?: number;
  freightGratis?: boolean;
  notaMin?: number;
  destaque?: boolean;
  lojistaId?: string;
}): Produto[] {
  return mockProdutos.filter((produto) => {
    if (options.categoria && produto.categoria !== options.categoria) return false;
    if (options.precoMin && produto.preco < options.precoMin) return false;
    if (options.precoMax && produto.preco > options.precoMax) return false;
    if (options.freightGratis && !produto.freightGratis) return false;
    if (options.destaque && !produto.destaque) return false;
    if (options.lojistaId && produto.lojistaId !== options.lojistaId) return false;
    
    // Filtrar por nota mínima do lojista
    if (options.notaMin) {
      const lojista = getLojistaById(produto.lojistaId);
      if (!lojista || lojista.nota < options.notaMin) return false;
    }
    
    return true;
  });
}

/**
 * Busca pedidos por status
 */
export function getPedidosPorStatus(status: PedidoStatus): Pedido[] {
  return mockPedidos.filter((pedido) => pedido.status === status);
}

/**
 * Retorna lista de categorias únicas
 */
export function getCategorias(): string[] {
  const categorias = new Set(mockProdutos.map((p) => p.categoria));
  return Array.from(categorias);
}

/**
 * Retorna categorias por lojista
 */
export function getCategoriasPorLojista(lojistaId: string): string[] {
  const categorias = new Set(
    mockProdutos.filter((p) => p.lojistaId === lojistaId).map((p) => p.categoria)
  );
  return Array.from(categorias);
}