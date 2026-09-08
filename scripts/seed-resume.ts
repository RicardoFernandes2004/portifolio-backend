/**
 * Carga do currículo no banco, a partir de `curriculum (2).pdf`.
 *
 *   npm run seed:resume
 *
 * Substitui o conteúdo das tabelas de currículo (header, experiências,
 * formação, projetos, skills e idiomas). Não toca em usuários, posts,
 * categorias nem comentários. Rodar de novo repõe o mesmo estado — o que vale
 * enquanto o currículo vier do PDF; depois de editar pelo painel, isto
 * sobrescreve a edição.
 *
 * Campos `*En` ficam nulos: o PDF só tem português e o frontend cai no PT.
 */
import '../src/env';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const HEADER = {
    name: 'Ricardo Fernandes de Aquino',
    jobTitle: 'Full-stack Developer',
    summary: [
        'Desenvolvedor Full-Stack com forte perfil de ownership e experiência prática no ciclo completo de desenvolvimento de software (SDLC). Proficiência na construção de sistemas e APIs utilizando o ecossistema Node.js (NestJS/TypeScript) e Java (Spring Framework).',
        'Foco na resolução de problemas de ponta a ponta, assumindo a responsabilidade arquitetural e operacional das entregas, com aplicação de princípios como Clean Architecture, modelagem de dados e conteinerização para construir bases de código limpas, testáveis e prontas para produção.',
    ].join('\n\n'),
    location: 'São Paulo, SP',
    email: 'ricardo.fernandes02082004@gmail.com',
    phone: '+5511972210332',
    website: 'https://ricardo-fernandes-dev.vercel.app',
    linkedin: 'https://www.linkedin.com/in/ricardo-fernandes-8017b5261/',
    github: 'https://github.com/RicardoFernandes2004',
};

const EXPERIENCES = [
    {
        company: 'Milkbox',
        position: 'Fullstack Developer',
        startDate: new Date('2026-07-01'),
        endDate: null,
        description: [
            'Atuo no desenvolvimento end-to-end da MilkBox, plataforma SaaS de infraestrutura premium para campanhas de cold email — provisionamento de domínios, warm-up, entregabilidade e billing por slot — operando cerca de 16 mil domínios e mais de 15 mil mailboxes em produção. Trabalho nos dois lados da stack e também na operação: backend em TypeScript/Node com PostgreSQL, filas Redis/BullMQ e integrações com Cloudflare, Stripe, Airtable, Warmy e sequenciadores de mercado (Smartlead, Instantly, EmailBison, PlusVibe); frontend em React; e a infraestrutura de e-mail em si, incluindo servidor SMTP/IMAP próprio e DNS.',
            'Nas primeiras quatro semanas entreguei 55 issues de produto e infraestrutura — 71 pull requests mergeados, cerca de 193 commits e ~20 mil linhas em cinco repositórios — entre 23 bugs de produção corrigidos, 9 features e 7 vulnerabilidades de segurança fechadas.',
            'O trabalho de maior impacto foi o balanceador de contas Cloudflare. O parque tinha 69% dos domínios sob um único par de nameserver, o que concentrava risco de reputação e travava o crescimento; o allocator existente lia capacidade de um rollup do Airtable que divergia da realidade em 40x (428 domínios declarados contra 17.256 zonas reais numa mesma conta). Medi a regra real da Cloudflare — zonas pendentes nunca podem passar das ativas, e a capacidade só volta quando o nameserver é apontado no registrar — e desenhei um ciclo que consulta essa capacidade ao vivo, distribui domínio a domínio para a conta menos carregada, reivindica linhas por lease para tolerar execuções concorrentes, escreve nameserver no registrar de forma automatizada sob dupla autorização por lote, e alerta no Slack apenas quando a intervenção humana é realmente necessária. Foram 6 issues e 11 PRs, do estudo de capacidade ao cron em produção com tela de administração. O primeiro lote de 1.000 domínios saiu de zero a totalmente ativo em cerca de 4 horas.',
            'Encontrei e corrigi uma classe inteira de defeitos silenciosos de leitura no banco. A contagem de slots — que é o que a empresa fatura — congelava em 1.000 porque o PostgREST trunca respostas nesse teto sem avisar: um cliente com 2.500 domínios ativos era medido como 1.000, e a trava de criação de pedido oferecia 1.500 slots que não existiam. O mesmo teto fazia o cron diário de verificação de nameserver enxergar 1.000 dos 2.944 domínios elegíveis, deixando o restante permanentemente sem checagem e marcado como não verificado na tela de admin. Ao paginar, esbarrei no segundo teto — o PostgREST devolve a query string inteira em um header de resposta e o fetch do Node a rejeita acima de 16 KB, o que derrubava clientes grandes com um erro sem status nem mensagem. Medi o limite (1.600 ids passam, 2.000 falham), estabeleci fragmentação por bytes e paginação determinística como padrão do repositório, e cobri tudo com testes de regressão.',
            'Conduzi uma auditoria de segurança que fechou 7 vulnerabilidades em quatro dias. A mais grave era um SSRF em webhook controlado pelo cliente que alcançava o endpoint de metadata da cloud; resolvi validando no momento da conexão, com resolvedor de DNS próprio que recusa faixas privadas, o que também fecha DNS rebinding — coisa que validação em tempo de configuração não pega — e elimina o vetor de redirect. Além dele: endpoints de leitura devolviam chaves de API de registrar e senhas de sequencer em texto puro para qualquer usuário com papel de operador; o painel de administração era alcançável por manipulação de estado no front; havia segredos em localStorage; e a API pública não tinha gate de billing, aceitando chamadas de contas suspensas. Estabeleci a regra de que credencial é write-only sobre HTTP, com booleanos derivados para a UI saber se algo está configurado sem receber o valor.',
            'Também recuperei o pipeline de analytics, que reportava saúde enquanto não coletava nada. Havia 2.482 registros perdidos por credencial inválida sem qualquer alerta, 56 linhas de coleta impossível sendo enfileiradas para providers que sequer têm API de estatística, um cliente sem métrica há semanas porque erros não classificados eram marcados como permanentes na primeira tentativa, e a ordenação por métrica da tabela era inerte no filtro padrão — as duas metades da consulta liam janelas de data diferentes, então toda chave de ordenação vinha nula e a tela silenciosamente ordenava por nome. No lugar de um alerta ingênuo por idade do dado, que dispararia para 45 dos 54 clientes e seria ignorado em uma semana, medi a produção e desenhei o sinal sobre regressão de dado utilizável: o mesmo dia rendeu 2 casos, os dois reais. Antes disso, substituí uma leitura de reputação que fazia 3.500 requisições concorrentes ao provider por requisição de usuário — 350 de 350 respondiam 429 e a tela levava 8 segundos para não mostrar nada — por snapshots diários lidos do banco.',
            'Uma parte relevante do meu trabalho é diagnóstico de coisas que falham sem deixar rastro. Descobri que a automação de bulk-add de mailboxes nunca havia disparado desde que foi escrita: a consulta buscava o record id do Airtable dentro de um campo de link, que resolve para o valor primário da tabela ligada, e portanto retornava zero para todo domínio, sempre, falhando como "sem mailbox disponível". Reconciliei o histórico de migrations do Supabase — 38 arquivos locais sem registro no remoto e 13 registros órfãos, o que tornava o deploy de schema impraticável e empurrava a evolução do banco para SQL colado no dashboard — e no processo encontrei uma migration que nunca havia rodado, cuja função o backend chamava havia três semanas, falhando em silêncio em produção. Fechei o caso de erro 422 nos testes de inbox placement por evidência, sem executar um único teste: das mailboxes que falharam, 7 de 7 estavam em estado crítico no provider; das que passaram, nenhuma. O campo já vinha na mesma resposta — era um parâmetro da nossa chamada que o descartava — e virou pré-checagem que recusa a mailbox antes de gastar crédito de entregabilidade.',
            'Do lado de operação, sustento o parque de warm-up: 15.831 de 15.963 mailboxes no ar com 100% de SMTP e IMAP verificados, o setup completo de domínio (NS, DNS, SPF, DKIM, DMARC), e uma auditoria que removeu 5.064 contas obsoletas do servidor Stalwart com evidência levantada grupo a grupo antes de qualquer exclusão. Também migrei duas landing pages para o Vercel reduzindo custo de hospedagem, e mantenho a documentação de arquitetura do repositório viva como parte da mesma mudança que altera o comportamento — decisões, limites medidos e o porquê de cada escolha não óbvia — para que a próxima pessoa não precise redescobrir por incidente.',
            'Stack: TypeScript, Node.js, Express, PostgreSQL, Supabase/PostgREST, plpgsql, Redis, BullMQ, Jest, React, Docker, Cloudflare API, Stripe, Airtable API, Render, Vercel, Stalwart (SMTP/IMAP) e DNS.',
        ].join('\n\n'),
    },
    {
        company: 'Lexitype',
        position: 'Developer',
        startDate: new Date('2025-11-01'),
        endDate: null,
        description: [
            'Desenvolvi uma plataforma gamificada para aprendizado e prática de inglês, atuando em todo o ciclo de vida do software, desde o planejamento e modelagem de dados até a publicação em produção. O projeto foi conduzido sob mentoria técnica de Kennedy Florentino, com o desafio de projetar e entregar a primeira versão funcional (MVP) em um prazo estrito de um mês, com arquitetura e código rigorosamente validados e revisados.',
            'Entre as principais entregas, destaco a construção do back-end através de uma API REST com NestJS e Prisma ORM, onde implementei a autenticação segura via JWT, recuperação de senhas e fluxos de verificação de e-mail integrados ao Nodemailer. No front-end, estruturei a aplicação utilizando Next.js 16, React 19 e Tailwind CSS, desenvolvendo hooks customizados essenciais para o gerenciamento de estado complexo do jogo de digitação em tempo real.',
            'Tive papel central na infraestrutura e garantia de qualidade, implementando testes E2E com Jest e Supertest para assegurar a confiabilidade das funcionalidades da API. A aplicação foi conteinerizada com Docker e hospedada na Fly.io, utilizando o PostgreSQL via Supabase para a persistência de dados. Todo o processo de desenvolvimento e tomada de decisão técnica foi guiado pelos princípios de Clean Architecture, garantindo uma base de código limpa, escalável e de fácil manutenção.',
            'Principais Tecnologias: Node.js, TypeScript, NestJS, Next.js 16, React 19, Tailwind CSS, Prisma ORM, PostgreSQL (Supabase), Nodemailer, Jest, Supertest, Docker, Fly.io.',
            'Principais Conceitos: Clean Architecture, RESTful, Testes E2E, Autenticação e Autorização, Ciclo Completo de Desenvolvimento (SDLC), Conteinerização.',
        ].join('\n\n'),
    },
    {
        company: 'LumePath — FIAP, DASA',
        position: 'Back-end Developer',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-10-31'),
        description: [
            'Atuei como desenvolvedor na criação de uma solução inteligente de gestão de estoques para a DASA, desenvolvida durante o Challenge Anual da FIAP. O objetivo estratégico do produto foi mitigar a incidência de erro humano e acelerar drasticamente o processo de registro de entradas e saídas, substituindo fluxos manuais por automação. O impacto técnico e funcional da solução a classificou entre os 10 melhores projetos de Engenharia de Software, resultando na apresentação da ferramenta no evento de inovação FIAP NEXT e no reconhecimento acadêmico com dispensa de avaliações globais.',
            'Entre as principais entregas, destaco a engenharia de um sistema híbrido de Inteligência Artificial para o reconhecimento de itens. No front-end, construído com React e TypeScript, implementei a captura e a primeira camada de detecção visual. Desenvolvi e treinei um modelo YOLO (You Only Look Once), permitindo uma identificação inicial de altíssima velocidade e viabilizando o treinamento contínuo pelo próprio usuário final.',
            'No back-end, desenvolvido com Spring Framework, orquestrei a lógica de negócio e as integrações RESTful. Após o reconhecimento inicial pelo YOLO e cruzamento de dados, estruturei um fluxo onde as imagens eram convertidas e enviadas via API para o Google Gemini, garantindo uma segunda camada de validação e análise profunda. Toda a infraestrutura foi conteinerizada utilizando Docker e implantada em servidores locais, garantindo um ambiente isolado, estável e de fácil execução para as integrações entre a interface, os serviços de IA e a API Java.',
            'Principais Tecnologias: Java, Spring Framework, TypeScript, React, YOLO (You Only Look Once), API Google Gemini, Docker.',
            'Principais Conceitos: Visão Computacional, Inteligência Artificial Híbrida, RESTful, Conteinerização, Arquitetura Cliente-Servidor.',
        ].join('\n\n'),
    },
];

const EDUCATIONS = [
    {
        school: 'FIAP - Centro Universitário',
        degree: 'Bacharelado',
        fieldOfStudy: 'Engenharia de Software',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2027-12-01'),
    },
];

const PROJECTS = [
    {
        title: 'Portfolio Backend',
        technologies: ['NestJS', 'TypeScript', 'Prisma', 'PostgreSQL', 'Supabase', 'Fly.io', 'Vercel', 'JWT', 'Swagger / OpenAPI', 'Docker', 'Jest'],
        description: [
            'API REST que roda o meu portfólio: blog (posts, categorias, comentários, likes e views), currículo dinâmico com geração de PDF on-demand e área administrativa protegida por JWT. Construída com NestJS + Prisma + PostgreSQL em arquitetura hexagonal (um módulo por recurso), com documentação Swagger gerada a partir do próprio código, rate limiting nos endpoints públicos e deploy sem lock-in (Fly.io, Vercel ou Docker). Open source: qualquer dev pode clonar e hospedar o próprio backend.',
            'O link live leva ao meu próprio portfólio, que consome essa API :)',
        ].join('\n\n'),
        link: 'https://ricardo-fernandes-dev.vercel.app',
        githubLink: 'https://github.com/RicardoFernandes2004/portifolio-backend',
        images: [],
        collaborators: [],
    },
    {
        title: 'Lexitype',
        technologies: ['NestJS', 'TypeScript', 'Prisma', 'Fly.io', 'PostgreSQL', 'Supabase', 'React', 'Next.js', 'Tailwind', 'Nodemailer', 'JWT', 'REST', 'Jest', 'Supertest'],
        description: [
            'Plataforma gamificada para aprendizado e prática de inglês, com atuação em todo o ciclo de vida do software, do planejamento e modelagem de dados até a publicação em produção. Conduzido sob mentoria técnica de Kennedy Florentino, com o desafio de entregar o MVP em um prazo estrito de um mês, com arquitetura e código rigorosamente validados e revisados.',
            'Back-end em API REST com NestJS e Prisma ORM, com autenticação segura via JWT, recuperação de senhas e verificação de e-mail via Nodemailer. Front-end em Next.js 16, React 19 e Tailwind CSS, com hooks customizados para o estado complexo do jogo de digitação em tempo real. Testes E2E com Jest e Supertest, aplicação conteinerizada com Docker e hospedada na Fly.io, PostgreSQL via Supabase e Clean Architecture como guia das decisões técnicas.',
        ].join('\n\n'),
        link: 'https://lexitype.fly.dev',
        githubLink: null,
        images: [],
        collaborators: [],
    },
];

const SKILLS: Array<[string, number]> = [
    ['API Development', 5],
    ['Back-end Development', 5],
    ['Docker', 5],
    ['Express.js', 5],
    ['Java', 5],
    ['Jest', 5],
    ['NestJS', 5],
    ['PostgreSQL', 5],
    ['Prisma ORM', 5],
    ['Python', 5],
    ['REST and RESTful services', 5],
    ['Spring Boot', 5],
    ['Supertest', 5],
    ['TypeScript', 5],
    ['AI Agent Coordination', 4],
    ['Algorithms and Data Structures (DSA)', 4],
    ['ASP.NET', 4],
    ['AWS', 4],
    ['DevOps', 4],
    ['Google Developer Program', 4],
    ['Kubernetes (K8s)', 4],
    ['Process Automation', 4],
    ['Software Architecture', 4],
    ['Vercel', 4],
    ['AI Development', 3],
    ['Cyber Security', 3],
    ['Django', 3],
    ['Front-end Development', 3],
    ['Machine Learning Models', 3],
    ['Next.js', 3],
    ['React', 3],
];

const LANGUAGES: Array<[string, string, number]> = [
    ['Inglês', 'English', 5],
    ['Português', 'Portuguese', 5],
    ['Japonês', 'Japanese', 3],
    ['Alemão', 'German', 1],
];

async function main(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL is not set');

    const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
    });

    try {
        await prisma.$transaction([
            prisma.resumeHeader.deleteMany(),
            prisma.experience.deleteMany(),
            prisma.education.deleteMany(),
            prisma.project.deleteMany(),
            prisma.skill.deleteMany(),
            prisma.language.deleteMany(),

            prisma.resumeHeader.create({ data: HEADER }),
            prisma.experience.createMany({ data: EXPERIENCES }),
            prisma.education.createMany({ data: EDUCATIONS }),
            prisma.project.createMany({ data: PROJECTS }),
            prisma.skill.createMany({
                data: SKILLS.map(([name, level]) => ({ name, level })),
            }),
            prisma.language.createMany({
                data: LANGUAGES.map(([name, nameEn, level]) => ({ name, nameEn, level })),
            }),
        ]);

        console.log(
            [
                'currículo carregado:',
                `  header       1`,
                `  experiências ${EXPERIENCES.length}`,
                `  formação     ${EDUCATIONS.length}`,
                `  projetos     ${PROJECTS.length}`,
                `  skills       ${SKILLS.length}`,
                `  idiomas      ${LANGUAGES.length}`,
            ].join('\n'),
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
