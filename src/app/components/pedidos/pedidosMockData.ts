// ============================================================
// MOCK DATA — Módulo Gestão de Pedidos
// ============================================================

export type StatusPedido =
  | "aguardando"
  | "pago"
  | "separacao"
  | "enviado"
  | "entregue"
  | "cancelado";

export type CanalVenda = "pdv" | "loja" | "whatsapp" | "outros";
export type FormaPagamento =
  | "pix"
  | "cartao_credito"
  | "cartao_debito"
  | "dinheiro"
  | "boleto";

export interface ItemPedido {
  id: string;
  nome: string;
  variacao?: string;
  quantidade: number;
  precoUnitario: number;
  foto: string;
}

export interface TimelineEntry {
  status: StatusPedido;
  dataHora: string;
  responsavel: string;
  observacao?: string;
  codigoRastreio?: string;
}

export interface Pedido {
  id: string;
  numero: string;
  dataHora: string;
  cliente: {
    nome: string;
    telefone: string;
    email: string;
    documento: string;
    tipo: "pf" | "pj";
  };
  canal: CanalVenda;
  itens: ItemPedido[];
  subtotal: number;
  frete: number;
  desconto: number;
  total: number;
  formaPagamento: FormaPagamento;
  statusPagamento: "confirmado" | "pendente" | "recusado";
  status: StatusPedido;
  endereco?: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  timeline: TimelineEntry[];
  codigoRastreio?: string;
  motivoCancelamento?: string;
  notasInternas?: string;
}

// ----- helpers -----
const dateBack = (days: number, hour = "10:00") => {
  const d = new Date("2026-04-02");
  d.setDate(d.getDate() - days);
  return `${d.toISOString().split("T")[0]}T${hour}:00`;
};

// ----- mock orders -----
export const PEDIDOS: Pedido[] = [
  // ---- HOJE ----
  {
    id: "ped-001",
    numero: "#4521",
    dataHora: dateBack(0, "09:14"),
    cliente: {
      nome: "Ana Carolina Souza",
      telefone: "(11) 98765-4321",
      email: "ana.souza@email.com",
      documento: "348.129.870-12",
      tipo: "pf",
    },
    canal: "loja",
    itens: [
      {
        id: "item-1",
        nome: "Camiseta Premium Branca",
        variacao: "Tam. M",
        quantidade: 2,
        precoUnitario: 89.9,
        foto: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=80&h=80&fit=crop",
      },
      {
        id: "item-2",
        nome: "Calça Slim Preta",
        variacao: "Tam. 38",
        quantidade: 1,
        precoUnitario: 179.9,
        foto: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 359.7,
    frete: 18.5,
    desconto: 0,
    total: 378.2,
    formaPagamento: "pix",
    statusPagamento: "confirmado",
    status: "pago",
    endereco: {
      rua: "Rua das Acácias",
      numero: "245",
      complemento: "Apto 31",
      bairro: "Jardim América",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01308-000",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(0, "09:14"), responsavel: "Sistema (Loja Virtual)" },
      { status: "pago", dataHora: dateBack(0, "09:16"), responsavel: "Sistema (PIX Auto)", observacao: "Pagamento PIX confirmado automaticamente" },
    ],
  },
  {
    id: "ped-002",
    numero: "#4520",
    dataHora: dateBack(0, "08:32"),
    cliente: {
      nome: "Roberto Lima",
      telefone: "(11) 97654-3210",
      email: "roberto.lima@gmail.com",
      documento: "521.348.920-45",
      tipo: "pf",
    },
    canal: "whatsapp",
    itens: [
      {
        id: "item-3",
        nome: "Tênis Casual Masculino",
        variacao: "N° 42",
        quantidade: 1,
        precoUnitario: 249.0,
        foto: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 249.0,
    frete: 0,
    desconto: 24.9,
    total: 224.1,
    formaPagamento: "cartao_credito",
    statusPagamento: "confirmado",
    status: "separacao",
    endereco: {
      rua: "Av. Brigadeiro Faria Lima",
      numero: "1811",
      bairro: "Pinheiros",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01452-001",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(0, "08:32"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(0, "08:45"), responsavel: "Maria Silva", observacao: "Cartão aprovado" },
      { status: "separacao", dataHora: dateBack(0, "09:00"), responsavel: "Maria Silva" },
    ],
  },
  {
    id: "ped-003",
    numero: "#4519",
    dataHora: dateBack(0, "07:50"),
    cliente: {
      nome: "Loja Moda Fácil LTDA",
      telefone: "(11) 3456-7890",
      email: "compras@modafacil.com",
      documento: "12.345.678/0001-90",
      tipo: "pj",
    },
    canal: "pdv",
    itens: [
      {
        id: "item-4",
        nome: "Kit Básico Feminino",
        quantidade: 5,
        precoUnitario: 75.0,
        foto: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=80&h=80&fit=crop",
      },
      {
        id: "item-5",
        nome: "Bolsa Couro Caramelo",
        quantidade: 2,
        precoUnitario: 320.0,
        foto: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 1015.0,
    frete: 0,
    desconto: 101.5,
    total: 913.5,
    formaPagamento: "boleto",
    statusPagamento: "pendente",
    status: "aguardando",
    timeline: [
      { status: "aguardando", dataHora: dateBack(0, "07:50"), responsavel: "Maria Silva" },
    ],
  },

  // ---- ONTEM ----
  {
    id: "ped-004",
    numero: "#4518",
    dataHora: dateBack(1, "18:22"),
    cliente: {
      nome: "Fernanda Oliveira",
      telefone: "(21) 99876-5432",
      email: "feh.oliveira@hotmail.com",
      documento: "198.234.560-78",
      tipo: "pf",
    },
    canal: "loja",
    itens: [
      {
        id: "item-6",
        nome: "Vestido Floral Verão",
        variacao: "Tam. P",
        quantidade: 1,
        precoUnitario: 169.9,
        foto: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 169.9,
    frete: 22.0,
    desconto: 0,
    total: 191.9,
    formaPagamento: "pix",
    statusPagamento: "confirmado",
    status: "enviado",
    codigoRastreio: "BR458921047BR",
    endereco: {
      rua: "Rua Voluntários da Pátria",
      numero: "98",
      complemento: "Casa 2",
      bairro: "Botafogo",
      cidade: "Rio de Janeiro",
      estado: "RJ",
      cep: "22270-010",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(1, "18:22"), responsavel: "Sistema (Loja Virtual)" },
      { status: "pago", dataHora: dateBack(1, "18:23"), responsavel: "Sistema (PIX Auto)" },
      { status: "separacao", dataHora: dateBack(1, "19:00"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(0, "08:00"), responsavel: "Maria Silva", codigoRastreio: "BR458921047BR", observacao: "Postado nos Correios" },
    ],
  },
  {
    id: "ped-005",
    numero: "#4517",
    dataHora: dateBack(1, "15:10"),
    cliente: {
      nome: "Carlos Eduardo Prado",
      telefone: "(31) 98321-6789",
      email: "carlos.prado@empresa.com",
      documento: "087.432.560-34",
      tipo: "pf",
    },
    canal: "pdv",
    itens: [
      {
        id: "item-7",
        nome: "Polo Masculina Azul",
        variacao: "Tam. G",
        quantidade: 3,
        precoUnitario: 119.9,
        foto: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 359.7,
    frete: 0,
    desconto: 0,
    total: 359.7,
    formaPagamento: "cartao_debito",
    statusPagamento: "confirmado",
    status: "entregue",
    timeline: [
      { status: "aguardando", dataHora: dateBack(1, "15:10"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(1, "15:12"), responsavel: "Sistema (Cartão)" },
      { status: "separacao", dataHora: dateBack(1, "15:20"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(1, "16:00"), responsavel: "Maria Silva" },
      { status: "entregue", dataHora: dateBack(1, "17:30"), responsavel: "Maria Silva", observacao: "Retirada na loja" },
    ],
  },
  {
    id: "ped-006",
    numero: "#4516",
    dataHora: dateBack(1, "11:05"),
    cliente: {
      nome: "Patrícia Mendes",
      telefone: "(11) 94567-8901",
      email: "pati.mendes@gmail.com",
      documento: "234.567.890-11",
      tipo: "pf",
    },
    canal: "whatsapp",
    itens: [
      {
        id: "item-8",
        nome: "Jaqueta Jeans Feminina",
        variacao: "Tam. M",
        quantidade: 1,
        precoUnitario: 289.9,
        foto: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 289.9,
    frete: 19.9,
    desconto: 0,
    total: 309.8,
    formaPagamento: "pix",
    statusPagamento: "confirmado",
    status: "cancelado",
    motivoCancelamento: "Cliente solicitou cancelamento por arrependimento de compra.",
    timeline: [
      { status: "aguardando", dataHora: dateBack(1, "11:05"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(1, "11:10"), responsavel: "Sistema (PIX Auto)" },
      { status: "cancelado", dataHora: dateBack(1, "14:30"), responsavel: "Maria Silva", observacao: "Cancelamento a pedido da cliente - estorno em até 5 dias" },
    ],
  },

  // ---- 3 DIAS ATRÁS ----
  {
    id: "ped-007",
    numero: "#4515",
    dataHora: dateBack(3, "16:45"),
    cliente: {
      nome: "Thiago Rodrigues",
      telefone: "(11) 95432-1098",
      email: "thiagords@outlook.com",
      documento: "456.789.012-33",
      tipo: "pf",
    },
    canal: "loja",
    itens: [
      {
        id: "item-9",
        nome: "Short Masculino Esportivo",
        variacao: "Tam. M",
        quantidade: 2,
        precoUnitario: 69.9,
        foto: "https://images.unsplash.com/photo-1562183241-b937e95585b6?w=80&h=80&fit=crop",
      },
      {
        id: "item-10",
        nome: "Meias Kit 3 Pares",
        quantidade: 2,
        precoUnitario: 29.9,
        foto: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 199.6,
    frete: 14.9,
    desconto: 20.0,
    total: 194.5,
    formaPagamento: "cartao_credito",
    statusPagamento: "confirmado",
    status: "entregue",
    codigoRastreio: "BR448831052BR",
    endereco: {
      rua: "Alameda Santos",
      numero: "1000",
      bairro: "Cerqueira César",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01419-100",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(3, "16:45"), responsavel: "Sistema (Loja Virtual)" },
      { status: "pago", dataHora: dateBack(3, "16:47"), responsavel: "Sistema (Cartão)" },
      { status: "separacao", dataHora: dateBack(3, "17:00"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(2, "09:00"), responsavel: "Maria Silva", codigoRastreio: "BR448831052BR" },
      { status: "entregue", dataHora: dateBack(1, "14:22"), responsavel: "Sistema (Correios)" },
    ],
  },
  {
    id: "ped-008",
    numero: "#4514",
    dataHora: dateBack(3, "12:20"),
    cliente: {
      nome: "Juliana Ferreira",
      telefone: "(11) 96543-2109",
      email: "ju.ferreira@gmail.com",
      documento: "567.890.123-44",
      tipo: "pf",
    },
    canal: "pdv",
    itens: [
      {
        id: "item-11",
        nome: "Blazer Feminino Cinza",
        variacao: "Tam. P",
        quantidade: 1,
        precoUnitario: 349.9,
        foto: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 349.9,
    frete: 0,
    desconto: 0,
    total: 349.9,
    formaPagamento: "cartao_credito",
    statusPagamento: "confirmado",
    status: "entregue",
    timeline: [
      { status: "aguardando", dataHora: dateBack(3, "12:20"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(3, "12:22"), responsavel: "Sistema (Cartão)" },
      { status: "entregue", dataHora: dateBack(3, "12:25"), responsavel: "Maria Silva", observacao: "Retirada no PDV" },
    ],
  },

  // ---- 5-7 DIAS ----
  {
    id: "ped-009",
    numero: "#4513",
    dataHora: dateBack(5, "10:05"),
    cliente: {
      nome: "Marcos Antônio Costa",
      telefone: "(41) 97890-1234",
      email: "marcos.costa@hotmail.com",
      documento: "678.901.234-55",
      tipo: "pf",
    },
    canal: "loja",
    itens: [
      {
        id: "item-12",
        nome: "Conjunto Esportivo Masculino",
        variacao: "Tam. G",
        quantidade: 1,
        precoUnitario: 399.0,
        foto: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 399.0,
    frete: 25.0,
    desconto: 0,
    total: 424.0,
    formaPagamento: "pix",
    statusPagamento: "confirmado",
    status: "entregue",
    codigoRastreio: "BR428731058BR",
    endereco: {
      rua: "Rua XV de Novembro",
      numero: "512",
      bairro: "Centro",
      cidade: "Curitiba",
      estado: "PR",
      cep: "80020-310",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(5, "10:05"), responsavel: "Sistema (Loja Virtual)" },
      { status: "pago", dataHora: dateBack(5, "10:06"), responsavel: "Sistema (PIX Auto)" },
      { status: "separacao", dataHora: dateBack(5, "11:00"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(4, "09:30"), responsavel: "Maria Silva", codigoRastreio: "BR428731058BR" },
      { status: "entregue", dataHora: dateBack(2, "10:15"), responsavel: "Sistema (Correios)" },
    ],
  },
  {
    id: "ped-010",
    numero: "#4512",
    dataHora: dateBack(6, "14:30"),
    cliente: {
      nome: "Luciana Barbosa",
      telefone: "(19) 98901-2345",
      email: "lu.barbosa@email.com",
      documento: "789.012.345-66",
      tipo: "pf",
    },
    canal: "whatsapp",
    itens: [
      {
        id: "item-13",
        nome: "Saia Midi Floral",
        variacao: "Tam. M",
        quantidade: 1,
        precoUnitario: 139.9,
        foto: "https://images.unsplash.com/photo-1583496661160-fb5218afa9a3?w=80&h=80&fit=crop",
      },
      {
        id: "item-14",
        nome: "Top Cropped Branco",
        variacao: "Tam. M",
        quantidade: 2,
        precoUnitario: 59.9,
        foto: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 259.7,
    frete: 18.0,
    desconto: 0,
    total: 277.7,
    formaPagamento: "pix",
    statusPagamento: "confirmado",
    status: "entregue",
    codigoRastreio: "BR418631049BR",
    endereco: {
      rua: "Rua Barão de Jaguara",
      numero: "782",
      bairro: "Centro",
      cidade: "Campinas",
      estado: "SP",
      cep: "13015-002",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(6, "14:30"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(6, "14:35"), responsavel: "Sistema (PIX Auto)" },
      { status: "separacao", dataHora: dateBack(6, "15:00"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(5, "09:00"), responsavel: "Maria Silva", codigoRastreio: "BR418631049BR" },
      { status: "entregue", dataHora: dateBack(3, "11:00"), responsavel: "Sistema (Correios)" },
    ],
  },
  {
    id: "ped-011",
    numero: "#4511",
    dataHora: dateBack(7, "09:00"),
    cliente: {
      nome: "Diego Alves",
      telefone: "(85) 99012-3456",
      email: "diego.alves@email.com",
      documento: "890.123.456-77",
      tipo: "pf",
    },
    canal: "pdv",
    itens: [
      {
        id: "item-15",
        nome: "Camisa Social Branca",
        variacao: "Tam. M",
        quantidade: 2,
        precoUnitario: 159.9,
        foto: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=80&h=80&fit=crop",
      },
      {
        id: "item-16",
        nome: "Gravata Listrada",
        quantidade: 1,
        precoUnitario: 79.9,
        foto: "https://images.unsplash.com/photo-1589756823695-278bc923f962?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 399.7,
    frete: 0,
    desconto: 40.0,
    total: 359.7,
    formaPagamento: "dinheiro",
    statusPagamento: "confirmado",
    status: "entregue",
    timeline: [
      { status: "aguardando", dataHora: dateBack(7, "09:00"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(7, "09:02"), responsavel: "Maria Silva", observacao: "Pago em dinheiro" },
      { status: "entregue", dataHora: dateBack(7, "09:05"), responsavel: "Maria Silva", observacao: "Retirada no PDV" },
    ],
  },

  // ---- 10-20 DIAS ----
  {
    id: "ped-012",
    numero: "#4510",
    dataHora: dateBack(10, "11:30"),
    cliente: {
      nome: "Sabrina Castro",
      telefone: "(51) 98321-4567",
      email: "sabrina.castro@gmail.com",
      documento: "901.234.567-88",
      tipo: "pf",
    },
    canal: "loja",
    itens: [
      {
        id: "item-17",
        nome: "Vestido de Festa Azul Royal",
        variacao: "Tam. G",
        quantidade: 1,
        precoUnitario: 459.9,
        foto: "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 459.9,
    frete: 28.0,
    desconto: 0,
    total: 487.9,
    formaPagamento: "cartao_credito",
    statusPagamento: "confirmado",
    status: "entregue",
    codigoRastreio: "BR398531044BR",
    endereco: {
      rua: "Av. Ipiranga",
      numero: "2300",
      bairro: "Azenha",
      cidade: "Porto Alegre",
      estado: "RS",
      cep: "90610-000",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(10, "11:30"), responsavel: "Sistema (Loja Virtual)" },
      { status: "pago", dataHora: dateBack(10, "11:31"), responsavel: "Sistema (Cartão)" },
      { status: "separacao", dataHora: dateBack(10, "12:00"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(9, "09:00"), responsavel: "Maria Silva", codigoRastreio: "BR398531044BR" },
      { status: "entregue", dataHora: dateBack(7, "14:00"), responsavel: "Sistema (Correios)" },
    ],
  },
  {
    id: "ped-013",
    numero: "#4509",
    dataHora: dateBack(12, "15:00"),
    cliente: {
      nome: "Bruno Santos",
      telefone: "(71) 97654-8901",
      email: "b.santos@yahoo.com",
      documento: "012.345.678-99",
      tipo: "pf",
    },
    canal: "loja",
    itens: [
      {
        id: "item-18",
        nome: "Tênis Running Profissional",
        variacao: "N° 43",
        quantidade: 1,
        precoUnitario: 549.0,
        foto: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 549.0,
    frete: 32.0,
    desconto: 54.9,
    total: 526.1,
    formaPagamento: "pix",
    statusPagamento: "confirmado",
    status: "entregue",
    codigoRastreio: "BR378431040BR",
    endereco: {
      rua: "Rua Chile",
      numero: "100",
      bairro: "Comércio",
      cidade: "Salvador",
      estado: "BA",
      cep: "40020-170",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(12, "15:00"), responsavel: "Sistema (Loja Virtual)" },
      { status: "pago", dataHora: dateBack(12, "15:01"), responsavel: "Sistema (PIX Auto)" },
      { status: "separacao", dataHora: dateBack(12, "16:00"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(11, "09:30"), responsavel: "Maria Silva", codigoRastreio: "BR378431040BR" },
      { status: "entregue", dataHora: dateBack(9, "13:00"), responsavel: "Sistema (Correios)" },
    ],
  },
  {
    id: "ped-014",
    numero: "#4508",
    dataHora: dateBack(14, "10:15"),
    cliente: {
      nome: "Tatiane Moraes",
      telefone: "(62) 96543-9012",
      email: "tati.moraes@hotmail.com",
      documento: "123.456.789-10",
      tipo: "pf",
    },
    canal: "whatsapp",
    itens: [
      {
        id: "item-19",
        nome: "Conjunto Pijama Feminino",
        variacao: "Tam. P",
        quantidade: 2,
        precoUnitario: 89.9,
        foto: "https://images.unsplash.com/photo-1566479174861-e58a5a4f7ca1?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 179.8,
    frete: 16.0,
    desconto: 0,
    total: 195.8,
    formaPagamento: "pix",
    statusPagamento: "confirmado",
    status: "entregue",
    codigoRastreio: "BR358331036BR",
    endereco: {
      rua: "Av. Goiás",
      numero: "812",
      bairro: "Centro",
      cidade: "Goiânia",
      estado: "GO",
      cep: "74015-011",
    },
    timeline: [
      { status: "aguardando", dataHora: dateBack(14, "10:15"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(14, "10:20"), responsavel: "Sistema (PIX Auto)" },
      { status: "separacao", dataHora: dateBack(14, "11:00"), responsavel: "Maria Silva" },
      { status: "enviado", dataHora: dateBack(13, "09:00"), responsavel: "Maria Silva", codigoRastreio: "BR358331036BR" },
      { status: "entregue", dataHora: dateBack(11, "12:00"), responsavel: "Sistema (Correios)" },
    ],
  },
  {
    id: "ped-015",
    numero: "#4507",
    dataHora: dateBack(20, "08:45"),
    cliente: {
      nome: "Rafael Gonçalves",
      telefone: "(92) 95432-0123",
      email: "rafa.g@email.com",
      documento: "234.567.890-21",
      tipo: "pf",
    },
    canal: "pdv",
    itens: [
      {
        id: "item-20",
        nome: "Bermuda Tactel Masculina",
        variacao: "Tam. XG",
        quantidade: 3,
        precoUnitario: 79.9,
        foto: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=80&h=80&fit=crop",
      },
    ],
    subtotal: 239.7,
    frete: 0,
    desconto: 0,
    total: 239.7,
    formaPagamento: "cartao_debito",
    statusPagamento: "confirmado",
    status: "entregue",
    timeline: [
      { status: "aguardando", dataHora: dateBack(20, "08:45"), responsavel: "Maria Silva" },
      { status: "pago", dataHora: dateBack(20, "08:47"), responsavel: "Sistema (Cartão)" },
      { status: "entregue", dataHora: dateBack(20, "08:50"), responsavel: "Maria Silva", observacao: "Retirada no PDV" },
    ],
  },
];

// ==============================
// STATUS CONFIG
// ==============================
export const STATUS_CONFIG: Record<
  StatusPedido,
  { label: string; color: string; bg: string; borderColor: string; icon: string }
> = {
  aguardando: {
    label: "Aguardando",
    color: "#D97706",
    bg: "#FFFBEB",
    borderColor: "#FDE68A",
    icon: "⏳",
  },
  pago: {
    label: "Pago",
    color: "#059669",
    bg: "#F0FDF4",
    borderColor: "#A7F3D0",
    icon: "✅",
  },
  separacao: {
    label: "Em Separação",
    color: "#0284C7",
    bg: "#F0F9FF",
    borderColor: "#BAE6FD",
    icon: "📦",
  },
  enviado: {
    label: "Enviado",
    color: "#7C3AED",
    bg: "#F5F3FF",
    borderColor: "#DDD6FE",
    icon: "🚚",
  },
  entregue: {
    label: "Entregue",
    color: "#1f2937",
    bg: "#ECFDF5",
    borderColor: "#6EE7B7",
    icon: "🎉",
  },
  cancelado: {
    label: "Cancelado",
    color: "#DC2626",
    bg: "#FEF2F2",
    borderColor: "#FECACA",
    icon: "❌",
  },
};

export const CANAL_CONFIG: Record<
  CanalVenda,
  { label: string; color: string; bg: string }
> = {
  pdv: { label: "PDV", color: "#0284C7", bg: "#E0F2FE" },
  loja: { label: "Loja Virtual", color: "#7C3AED", bg: "#EDE9FE" },
  whatsapp: { label: "WhatsApp", color: "#16A34A", bg: "#DCFCE7" },
  outros: { label: "Outros", color: "#627271", bg: "#efefef" },
};

export const PAGAMENTO_LABELS: Record<FormaPagamento, string> = {
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  dinheiro: "Dinheiro",
  boleto: "Boleto",
};

// ==============================
// HELPERS
// ==============================
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Status flow — fulfillment independente de pagamento
export const NEXT_STATUS: Partial<Record<StatusPedido, StatusPedido[]>> = {
  aguardando: ["separacao", "cancelado"],
  separacao: ["enviado", "cancelado"],
  enviado: ["entregue"],
  entregue: [],
  cancelado: [],
};

// ==============================
// CHART DATA (30 days sales trend)
// ==============================
export function getChartData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date("2026-04-02");
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    // simulate realistic variation
    const base = 800;
    const noise = Math.sin(i * 0.8) * 300 + Math.random() * 400;
    const weekendBoost = d.getDay() === 5 || d.getDay() === 6 ? 500 : 0;
    const valor = Math.max(0, Math.round(base + noise + weekendBoost));
    const pedidos = Math.round(valor / 180);
    data.push({ label, valor, pedidos });
  }
  return data;
}

export function getChannelData() {
  return [
    { name: "Loja Virtual", value: 42, color: "#7C3AED" },
    { name: "PDV", value: 35, color: "#0284C7" },
    { name: "WhatsApp", value: 18, color: "#16A34A" },
    { name: "Outros", value: 5, color: "#627271" },
  ];
}

export function getPaymentData() {
  return [
    { name: "PIX", value: 48, color: "#86cb92" },
    { name: "Cartão Crédito", value: 28, color: "#7C3AED" },
    { name: "Cartão Débito", value: 14, color: "#0284C7" },
    { name: "Dinheiro", value: 7, color: "#D97706" },
    { name: "Boleto", value: 3, color: "#627271" },
  ];
}

export function getTopProducts() {
  return [
    { nome: "Tênis Running Profissional", vendas: 47, total: 25803.0, variacao: "+12%" },
    { nome: "Vestido de Festa Azul Royal", vendas: 39, total: 19028.1, variacao: "+8%" },
    { nome: "Blazer Feminino Cinza", vendas: 34, total: 11896.6, variacao: "+21%" },
    { nome: "Camiseta Premium Branca", vendas: 82, total: 7373.8, variacao: "-3%" },
    { nome: "Polo Masculina Azul", vendas: 58, total: 6954.2, variacao: "+5%" },
    { nome: "Calça Slim Preta", vendas: 29, total: 5217.1, variacao: "+14%" },
    { nome: "Jaqueta Jeans Feminina", vendas: 18, total: 5222.0, variacao: "-1%" },
    { nome: "Bolsa Couro Caramelo", vendas: 15, total: 4800.0, variacao: "+33%" },
  ];
}

export function getWeekdayData() {
  return [
    { dia: "Dom", pedidos: 42, valor: 7560 },
    { dia: "Seg", pedidos: 68, valor: 12240 },
    { dia: "Ter", pedidos: 73, valor: 13140 },
    { dia: "Qua", pedidos: 61, valor: 10980 },
    { dia: "Qui", pedidos: 79, valor: 14220 },
    { dia: "Sex", pedidos: 95, valor: 17100 },
    { dia: "Sáb", pedidos: 88, valor: 15840 },
  ];
}
