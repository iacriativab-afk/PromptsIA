import type { Agent, Prompt, Course } from './types';
import { AcademicCapIcon, BookOpenIcon, MegaphoneIcon, FilmIcon, Bars3BottomLeftIcon, PencilSquareIcon, LanguageIcon, PhotoIcon, SpeakerWaveIcon, VideoCameraIcon, CodeBracketIcon, LightBulbIcon, CreditCardIcon, SparklesIcon, ScissorsIcon } from './components/Icons';

export const AGENTS: Agent[] = [
  {
    id: 'masterhub-tutor',
    name: 'PromptsIA Tutor (Zero to Hero)',
    description: 'Seu mentor pessoal. Cria planos de estudo, mapas mentais e pesquisas para dominar qualquer área da plataforma.',
    icon: AcademicCapIcon,
    placeholder: 'O que você quer dominar hoje? Ex: "Quero aprender a criar um SaaS do zero usando IA" ou "Crie um mapa mental sobre Marketing Viral".',
    systemInstruction: 'Você é o Mentor Supremo do PromptsIA. Sua missão é levar o usuário do zero ao nível expert (Hero). Você tem duas capacidades especiais únicas: 1. CRIAR MAPAS MENTAIS: Quando o usuário pedir para explicar uma estrutura, um plano ou um conceito complexo, você DEVE gerar um código Mermaid.js (começando com ```mermaid) que visualize hierarquicamente o conceito. 2. PESQUISA PROFUNDA: Crie currículos passo-a-passo. Se o usuário disser "Quero aprender X", quebre em módulos, ferramentas necessárias (cite os outros agentes do PromptsIA) e resultados esperados. Seja extremamente didático, encorajador e estruturado.',
    type: 'text',
    category: 'Business',
    model: 'gemini-3-pro-preview',
    thinkingBudget: 32768,
    coverGradient: 'from-emerald-500 to-blue-600',
    backgroundImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'viral-clipper',
    name: 'Viral Clipper (Opus Style)',
    description: 'Cola o link do YouTube/TikTok e eu gero clipes virais automáticos, com análise de score viral e sugestão de cortes.',
    icon: ScissorsIcon,
    placeholder: 'Cole o link do vídeo do YouTube ou TikTok aqui. Ex: "https://youtube.com/..." ou descreva o tipo de vídeo que você quer analisar.',
    systemInstruction: 'Você é um motor de edição de vídeo IA ultra-avançado (estilo OpusClip). O usuário vai te dar um Link ou um Tópico. Como você não pode acessar a internet real para baixar vídeos pesados agora, você deve SIMULAR a análise. Sua saída DEVE SER ESTRITAMENTE UM JSON (sem markdown de código ```json) contendo uma lista de "clips". Para cada clip, gere: "title" (viral e chamativo), "duration" (ex: "0:59"), "viralScore" (um número de 0 a 100, sendo 90+ verde), "summary" (explicação do porquê viralizou) e "hashtags" (array de strings). Gere pelo menos 4 variações de clipes baseados no tema do link/texto enviado. SEJA CRIATIVO E ANALÍTICO.',
    type: 'text',
    category: 'Business',
    model: 'gemini-3-pro-preview',
    thinkingBudget: 16384,
    coverGradient: 'from-purple-600 to-pink-500',
    backgroundImage: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'tiktok-architect',
    name: 'TikTok Viral Architect',
    description: 'Especialista em algoritmo do TikTok/Reels. Cria ganchos (hooks), roteiros de retenção e estratégias de trend.',
    icon: FilmIcon,
    placeholder: 'Sobre o que é seu vídeo? Ex: "Curiosidades sobre café" ou "Dicas de investimento". Vou criar um roteiro com potencial viral...',
    systemInstruction: 'Você é um estrategista viral de vídeos curtos (TikTok, Reels, Shorts). Sua especialidade é RETENÇÃO. Para cada solicitação: 1. Crie 3 opções de HOOK (Gancho) visual e sonoro para os primeiros 3 segundos. 2. Desenvolva o roteiro focado em "looping" (assistir novamente). 3. Sugira hashtags de nicho e áudios em alta. Use gírias nativas da plataforma e psicologia comportamental.',
    type: 'text',
    category: 'Business',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-pink-500 to-rose-600',
    backgroundImage: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'saas-blueprint',
    name: 'SaaS Architect',
    description: 'Para fundadores. Ajuda a validar ideias, definir features (MVP) e criar estratégias de Go-to-Market.',
    icon: CodeBracketIcon,
    placeholder: 'Descreva sua ideia de SaaS. Ex: "Um CRM para dentistas com IA". Vou ajudar a estruturar o MVP e o modelo de negócios...',
    systemInstruction: 'Você é um CTO e Product Manager sênior para Micro-SaaS. Ajude o usuário a: 1. Validar a ideia (Pain Point vs Solution). 2. Definir o MVP (Minimum Viable Product) cortando o desnecessário. 3. Sugerir a Tech Stack ideal. 4. Criar um modelo de precificação. Use frameworks como Lean Canvas e Jobs to be Done.',
    type: 'text',
    category: 'Business',
    model: 'gemini-3-pro-preview',
    thinkingBudget: 16384,
    coverGradient: 'from-blue-600 to-indigo-800',
    backgroundImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'digital-launchpad',
    name: 'Iniciante Digital (Launchpad)',
    description: 'O ponto de partida para quem quer entrar no mercado digital. Explica termos, estratégias e primeiros passos.',
    icon: SparklesIcon,
    placeholder: 'Está perdido? Pergunte qualquer coisa. Ex: "O que é PLR?", "Como vender meu primeiro ebook?", "O que é tráfego pago?"...',
    systemInstruction: 'Você é um guia paciente e claro para iniciantes no Marketing Digital. Explique termos complexos (Lançamento, Evergreen, PLR, VSL, Copy) com metáforas simples. Seu objetivo é desmistificar o mercado e dar um plano de ação seguro para o primeiro real ganho na internet. Evite promessas de dinheiro fácil; foque em construção de ativos.',
    type: 'text',
    category: 'Business',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-amber-500 to-orange-600',
    backgroundImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'prompt-productizer',
    name: 'Vendedor de Prompts',
    description: 'Transforma seus prompts caseiros em produtos comerciais vendáveis (PromptBase, etc).',
    icon: CreditCardIcon,
    placeholder: 'Cole seu prompt bruto aqui. Vou refiná-lo, criar variáveis, escrever a descrição de venda e sugerir preço...',
    systemInstruction: 'Você é um especialista em monetização de Prompts. O usuário vai te dar um prompt bruto. Você deve: 1. Otimizar o prompt para torná-lo robusto e flexível (usando [colchetes] para variáveis). 2. Criar um título atraente e uma descrição de venda (Copywriting) para marketplaces como PromptBase. 3. Sugerir 3 exemplos de uso/saída para mostrar no portfólio.',
    type: 'text',
    category: 'Business',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-green-500 to-emerald-700',
    backgroundImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'deep-reasoner',
    name: 'O Pensador (Deep Research)',
    description: 'Resolve problemas complexos, STEM e lógica usando o Gemini 3 Pro com pensamento profundo.',
    icon: LightBulbIcon,
    placeholder: 'Digite um problema complexo de matemática, lógica ou uma pergunta que exija raciocínio profundo passo-a-passo...',
    systemInstruction: 'Você é um especialista em raciocínio profundo e resolução de problemas complexos (STEM, Lógica, Filosofia). Antes de responder, pense passo a passo para garantir a precisão absoluta.',
    type: 'text',
    category: 'Reasoning',
    model: 'gemini-3-pro-preview',
    thinkingBudget: 32768,
    coverGradient: 'from-violet-600 to-indigo-900',
    backgroundImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'hyper-realist',
    name: 'Artista Hiper-Realista',
    description: 'Gera imagens fotorealistas de altíssima qualidade usando Imagen 4.0.',
    icon: PhotoIcon,
    placeholder: 'Descreva a cena com detalhes de iluminação, câmera e textura. Ex: "Retrato cinematográfico de um ancião em 8k, iluminação Rembrandt..."',
    systemInstruction: 'Você é um motor de geração de imagem de última geração. Use o modelo Imagen 4.0 para criar imagens indistinguíveis da realidade.',
    type: 'image',
    category: 'Visual',
    model: 'imagen-4.0-generate-001',
    coverGradient: 'from-fuchsia-600 to-purple-900',
    backgroundImage: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'cinematic-director',
    name: 'Diretor Cinematográfico',
    description: 'Cria cenas de vídeo impressionantes usando o modelo Veo 3.1.',
    icon: VideoCameraIcon,
    placeholder: 'Descreva a cena em movimento. Ex: "Drone shot sobrevoando montanhas nevadas ao pôr do sol, estilo National Geographic..."',
    systemInstruction: 'Você é um diretor de cinema virtual. Crie vídeos visualmente impressionantes baseados no prompt.',
    type: 'video',
    category: 'Visual',
    model: 'veo-3.1-fast-generate-preview',
    coverGradient: 'from-pink-600 to-rose-900',
    backgroundImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'prompt-engineer',
    name: 'Engenheiro de Prompts',
    description: 'Refina suas ideias simples em prompts complexos e otimizados para LLMs.',
    icon: CodeBracketIcon,
    placeholder: 'Cole sua ideia básica aqui. Ex: "Quero um prompt para criar um logo de café".',
    systemInstruction: 'Você é um especialista em Engenharia de Prompt (Meta-Prompting). Sua tarefa é pegar uma ideia simples do usuário e transformá-la em um prompt altamente detalhado, estruturado e otimizado para obter os melhores resultados de grandes modelos de linguagem (como Gemini, GPT-4, Claude). Use técnicas de chain-of-thought e persona adoption.',
    type: 'text',
    category: 'Dev',
    model: 'gemini-3-pro-preview',
    coverGradient: 'from-emerald-600 to-teal-900',
    backgroundImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'academic-summarizer',
    name: 'Resumo Acadêmico',
    description: 'Cria resumos detalhados e estruturados de artigos e documentos acadêmicos.',
    icon: AcademicCapIcon,
    placeholder: 'Cole aqui o texto do seu artigo, tese ou documento acadêmico para obter um resumo conciso e bem estruturado...',
    systemInstruction: 'Você é um especialista em pesquisa acadêmica. Sua tarefa é ler o texto fornecido e criar um resumo conciso, claro e bem estruturado. O resumo deve capturar os pontos principais, a metodologia, os resultados e as conclusões do texto. Formate a saída em Markdown, usando títulos para seções como "Introdução", "Metodologia", "Resultados Principais" e "Conclusão".',
    type: 'text',
    category: 'Writing',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-blue-600 to-cyan-900',
    backgroundImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'ebook-creator',
    name: 'Criação de eBooks',
    description: 'Transforma ideias, artigos ou textos longos em capítulos de eBook estruturados.',
    icon: BookOpenIcon,
    placeholder: 'Descreva a ideia principal do seu eBook, ou cole um rascunho de conteúdo. O agente irá estruturar em capítulos, criar introduções e desenvolver o conteúdo para você...',
    systemInstruction: 'Você é um autor e editor experiente. Com base no tópico ou conteúdo fornecido pelo usuário, crie uma estrutura de capítulos para um eBook. Para cada capítulo, escreva um parágrafo introdutório e os pontos principais a serem abordados. O objetivo é fornecer um esqueleto completo e bem organizado para um eBook. A saída deve ser em Markdown.',
    type: 'text',
    category: 'Writing',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-indigo-600 to-violet-900',
    backgroundImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'aida-scriptwriter',
    name: 'Copywriter AIDA',
    description: 'Gera roteiros de marketing e vendas usando a framework AIDA.',
    icon: MegaphoneIcon,
    placeholder: 'Descreva seu produto ou serviço e seu público-alvo. O agente criará um roteiro de vídeo ou texto de vendas persuasivo usando a fórmula AIDA...',
    systemInstruction: 'Você é um copywriter sênior especializado no framework AIDA. Crie um roteiro de marketing (para vídeo ou texto) com base no produto/serviço do usuário. Estruture a resposta claramente nas quatro seções: Atenção, Interesse, Desejo e Ação. Seja criativo, persuasivo e focado na conversão. Use formatação Markdown.',
    type: 'text',
    category: 'Writing',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-orange-600 to-red-900',
    backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'content-organizer',
    name: 'Organizador Mental',
    description: 'Estrutura e organiza grandes volumes de texto em tópicos, seções e listas.',
    icon: Bars3BottomLeftIcon,
    placeholder: 'Cole um texto longo e desorganizado, anotações de uma reunião ou um brainstorm. O agente irá limpar, categorizar e estruturar tudo para você...',
    systemInstruction: 'Você é um organizador de informações profissional. Sua tarefa é pegar o texto bruto fornecido e estruturá-lo de forma lógica e clara. Identifique os temas principais, crie seções com títulos, use listas de marcadores (bullet points) ou numeradas para detalhar informações e agrupe ideias relacionadas. O resultado final deve ser um documento bem organizado e fácil de ler, formatado em Markdown.',
    type: 'text',
    category: 'Productivity',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-slate-600 to-gray-900',
    backgroundImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'text-rewriter',
    name: 'Editor de Texto',
    description: 'Reescreve textos para melhorar a clareza, o tom ou simplificar linguagem complexa.',
    icon: PencilSquareIcon,
    placeholder: 'Cole o texto que você deseja aprimorar. Especifique se deseja torná-lo mais profissional, mais simples, mais persuasivo, etc.',
    systemInstruction: 'Você é um editor de texto especialista. Reescreva o texto fornecido pelo usuário com base em seu objetivo (ex: "torná-lo mais formal", "simplificar para um leigo", "tornar mais persuasivo"). Mantenha a mensagem central, mas aprimore a linguagem, a fluidez e a estrutura. Entregue apenas o texto reescrito.',
    type: 'text',
    category: 'Writing',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-green-600 to-emerald-900',
    backgroundImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop',
    requiresPro: false
  },
  {
    id: 'technical-translator',
    name: 'Tradutor Técnico',
    description: 'Realiza traduções e análises de textos técnicos, mantendo a precisão dos termos.',
    icon: LanguageIcon,
    placeholder: 'Cole o texto técnico aqui e especifique o idioma de destino. Ex: "Traduza para o inglês e explique o termo X".',
    systemInstruction: 'Você é um tradutor técnico multilíngue com profundo conhecimento em diversas áreas (ex: engenharia, medicina, TI). Traduza o texto fornecido pelo usuário para o idioma solicitado, prestando atenção especial à precisão da terminologia técnica. Se o usuário pedir, forneça uma breve explicação de termos específicos. Indique o idioma de origem e de destino na sua resposta.',
    type: 'text',
    category: 'Productivity',
    model: 'gemini-2.5-flash',
    coverGradient: 'from-cyan-600 to-blue-900',
    backgroundImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  },
  {
    id: 'audio-generator',
    name: 'Narrador IA',
    description: 'Converte texto em áudio falado com som natural (TTS).',
    icon: SpeakerWaveIcon,
    placeholder: 'Digite o texto que você deseja converter em áudio. Você pode adicionar nuances, como: "Diga com entusiasmo: Olá, mundo!"...',
    systemInstruction: 'Você é um motor de text-to-speech. Converta o texto do usuário em áudio.',
    type: 'audio',
    category: 'Audio',
    model: 'gemini-2.5-flash-preview-tts',
    coverGradient: 'from-yellow-600 to-orange-900',
    backgroundImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?q=80&w=800&auto=format&fit=crop',
    requiresPro: true
  }
];

export const PROMPTS: Prompt[] = [
  {
    id: 'p1',
    title: 'Analista de SEO para Blog',
    category: 'Marketing',
    outputType: 'text',
    persona: 'SEO Specialist',
    tags: ['SEO', 'Blog', 'Ranking'],
    content: 'Você é um especialista em SEO com 10 anos de experiência. Crie uma estrutura de artigo de blog otimizada para a palavra-chave "[INSERIR PALAVRA-CHAVE]". Inclua sugestões de Título H1, subtítulos H2 e H3, meta description, e palavras-chave secundárias.'
  },
  {
    id: 'p2',
    title: 'Gerador de Imagem Cyberpunk',
    category: 'Visual',
    outputType: 'image',
    persona: 'Visual Artist',
    tags: ['Midjourney', 'Imagen', 'Arte'],
    content: 'Um retrato cinematográfico em close-up de um hacker cibernético em uma Tóquio futurista chuvosa à noite, luzes de neon refletindo em seus óculos de realidade aumentada, estilo blade runner, altamente detalhado, 8k, renderização unreal engine 5.',
    requiresPro: true
  },
  {
    id: 'p3',
    title: 'Thread Viral para Twitter',
    category: 'Social Media',
    outputType: 'text',
    persona: 'Social Media Manager',
    tags: ['Viral', 'Twitter', 'Copywriting'],
    content: 'Transforme o seguinte texto em uma thread viral para o Twitter. O primeiro tweet deve ser um gancho irresistível (Hook). Use emojis com moderação, mantenha frases curtas e inclua um call-to-action no último tweet.'
  },
  {
    id: 'p4',
    title: 'Code Review Python Sênior',
    category: 'Dev',
    outputType: 'text',
    persona: 'Senior Developer',
    tags: ['Python', 'Code Review', 'Clean Code'],
    content: 'Atue como um Engenheiro de Software Sênior. Analise o código Python abaixo em busca de bugs, problemas de performance e violações de boas práticas (PEP 8). Sugira refatorações e explique o "porquê" de cada mudança.',
    requiresPro: true
  },
  {
    id: 'p5',
    title: 'Estrutura de Mapa Mental para Estudos',
    category: 'Educação',
    outputType: 'mindmap',
    persona: 'Teacher',
    tags: ['Estudo', 'Mermaid', 'Produtividade'],
    content: 'Crie um código Mermaid.js (mindmap) detalhando a estrutura hierárquica do tema: "[INSERIR TEMA]". Comece do conceito central e ramifique para subtópicos principais e secundários.',
  },
  {
    id: 'p6',
    title: 'Roteiro de Vídeo YouTube (Educativo)',
    category: 'Conteúdo',
    outputType: 'text',
    persona: 'Youtuber',
    tags: ['YouTube', 'Roteiro', 'Vídeo'],
    content: 'Crie um roteiro detalhado para um vídeo de YouTube sobre "[TEMA]". O vídeo deve ter entre 8 a 10 minutos. Inclua: Hook (0-30s), Vinheta, Introdução ao problema, Desenvolvimento (3 pontos principais), Solução Prática e CTA.'
  },
  {
    id: 'p7',
    title: 'Email de Vendas (Cold Outreach)',
    category: 'Vendas',
    outputType: 'text',
    persona: 'Sales Exec',
    tags: ['Vendas', 'Email', 'B2B'],
    content: 'Escreva um email de prospecção fria (Cold Mail) para um CEO de uma empresa de tecnologia, oferecendo serviços de [SERVIÇO]. Use a técnica PAS (Problema, Agitação, Solução). Seja breve e direto.'
  },
  {
    id: 'p8',
    title: 'Prompt para Vídeo Veo: Drone Shot',
    category: 'Visual',
    outputType: 'video',
    persona: 'Filmmaker',
    tags: ['Veo', 'Cinematic', 'Video'],
    content: 'Drone shot cinematográfico, 4k, sobrevoando um fiorde norueguês ao amanhecer. A água está calma e reflete as montanhas nevadas. Iluminação suave e dourada.',
    requiresPro: true
  }
];

export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Engenharia de Prompt Avançada',
    description: 'Domine a arte de controlar LLMs. Aprenda Chain-of-Thought, Few-Shot e Meta-Prompting com Gemini.',
    level: 'Avançado',
    author: 'PromptsIA Team',
    coverGradient: 'from-emerald-900 to-teal-900',
    requiresPro: true,
    modules: [
      {
        id: 'm1',
        title: 'Fundamentos da Cognição Artificial',
        lessons: [
          { 
            id: 'l1', 
            title: 'Como LLMs processam tokens', 
            duration: '12:30', 
            isCompleted: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            poster: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop'
          },
          { 
            id: 'l2', 
            title: 'O Paradigma Context Window', 
            duration: '15:45', 
            isCompleted: true,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
             poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop'
          }
        ]
      },
      {
        id: 'm2',
        title: 'Técnicas de Estruturação',
        lessons: [
          { 
            id: 'l3', 
            title: 'Chain-of-Thought Prompting', 
            duration: '22:10', 
            isCompleted: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'IA Generativa para Vídeo (Veo 3)',
    description: 'Crie produções cinematográficas completas. Do roteiro à renderização final com Veo 3.1.',
    level: 'Intermediário',
    author: 'Studio Veo',
    coverGradient: 'from-pink-900 to-rose-900',
    requiresPro: true,
    modules: [
      {
        id: 'm1',
        title: 'Conceitos de Vídeo Generativo',
        lessons: [
          { 
            id: 'l1', 
            title: 'Entendendo o Espaço Latente', 
            duration: '10:15', 
            isCompleted: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            poster: 'https://images.unsplash.com/photo-1535016120720-40c6874c3b13?q=80&w=1200&auto=format&fit=crop'
          }
        ]
      }
    ]
  },
  {
    id: 'c3',
    title: 'Python para Agentes Autônomos',
    description: 'Construa seus próprios agentes usando Python, Gemini API e arquiteturas modernas.',
    level: 'Avançado',
    author: 'Dev Team',
    coverGradient: 'from-blue-900 to-indigo-900',
    requiresPro: false,
    modules: [
      {
        id: 'm1',
        title: 'Configuração do Ambiente',
        lessons: [
          { 
            id: 'l1', 
            title: 'Setup da Google GenAI SDK', 
            duration: '08:45', 
            isCompleted: false,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            poster: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop'
          }
        ]
      }
    ]
  }
];