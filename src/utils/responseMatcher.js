const Fuse = require('fuse.js');
const path = require('path');
const fs = require('fs');

const learnedPath = path.join(process.cwd(), 'learned.json');

function loadLearnedData() {
  try {
    return JSON.parse(fs.readFileSync(learnedPath));
  } catch (error) {
    console.error('Erro ao carregar learned.json:', error);
    return {};
  }
}

function normalizeInput(text) {
  const slangMap = {
  // Servidor/serviço
  "sv": "servidor", "serve": "servidor", "svr": "servidor", "server": "servidor",
  "serv": "servidor", "srvdor": "servidor", "srv": "servidor", "servee": "servidor",
  "disc": "discord", "dc": "discord", "ds": "discord", "discordz": "discord",
  "mine": "minecraft", "mc": "minecraft", "maincra": "minecraft", "maine": "minecraft",
  
  // Versões
   "versao": "versão", "vers": "versão", "vrs": "versão", "vers.": "versão",
  "verzão": "versão", "vrsao": "versão",
  
  // Pessoas/pronomes
  "mano": "", "mn": "", "mno": "", "man": "", "mae": "", "mãe": "", "bro": "", "brah": "",
  "vc": "você", "voce": "você", "cê": "você", "ocê": "você", "tu": "você", "tk": "você",
  "vcs": "vocês", "nois": "nós", "noiz": "nós", "nós": "nós", "nos": "nós", "nxs": "nós",
  "geral": "todos", "glr": "todos", "gl": "todos", "glra": "todos",
  
  // Perguntas
  "oq": "o que", "q": "que", "qu": "que", "qe": "que", "k": "que", "qualq": "qualquer",
  "qualé": "qual é", "qul": "qual", "ql": "qual", "qal": "qual", "qulq": "qualquer",
  "cm": "como", "cmo": "como", "komo": "como", "cumu": "como", "c": "como",
  "pq": "porque", "pq?": "porque", "pqp": "", "pqq": "porque", "pork": "porque",
  "onde": "onde", "ond": "onde", "ondi": "onde", "ondeq": "onde que",
  
  // Conectivos
  "eh": "é", "e": "é", "ehh": "é", "éé": "é", "ee": "é", "ehhh": "é",
  "ai": "aí", "aí": "aí", "ay": "aí", "ae": "aí", "aee": "aí",
  "tá": "está", "ta": "está", "tah": "está", "to": "estou", "tô": "estou",
  "tb": "também", "tbm": "também", "tmb": "também", "tambem": "também", "tbmn": "também",
  
  // Whitelist
  "wl": "whitelist", "white": "whitelist", "wt": "whitelist", "wtl": "whitelist",
  "witelist": "whitelist", "whiteliste": "whitelist", "white list": "whitelist",
  "lista": "whitelist", "list": "whitelist", "listw": "whitelist", "wlst": "whitelist",
  
  // conexão/jogo
  "entrar": "entrar", "entr": "entrar", "entra": "entrar", "entrei": "entrar",
  "logar": "entrar", "log": "entrar", "logi": "entrar", "logono": "entrar",
  "conectar": "conectar", "conect": "conectar", "conct": "conectar", "conecta": "conectar",
  "porta": "porta", "port": "porta", "prt": "porta", "portaa": "porta", "portinha": "porta",
  "ip": "ip", "ipe": "ip", "ipz": "ip", "ipzin": "ip",
  
  // problemas
  "caiu": "caiu", "cay": "caiu", "cail": "caiu", "cai": "caiu", "caiuu": "caiu",
  "bug": "bug", "buguei": "bug", "bugou": "bug", "bugado": "bug", "buga": "bug",
  "lag": "lag", "lagado": "lag", "lagando": "lag", "lagei": "lag", "lagzin": "lag",
  
  // celular
  "cel": "celular", "celu": "celular", "cllr": "celular", "cell": "celular", "celz": "celular",
  "mobile": "celular", "mbl": "celular", "móbile": "celular", "celula": "celular",
  
  // sobe novatos
  "novato": "novato", "nvt": "novato", "nv": "novo", "new": "novato", "noob": "novato",
  "novin": "novato", "nvto": "novato", "nvtin": "novato", "novatin": "novato",
  
  // expressoes
  "pfv": "por favor", "pf": "por favor", "pls": "por favor", "pvf": "por favor", "porfavor": "por favor",
  "vlw": "valeu", "vlew": "valeu", "vlu": "valeu", "valew": "valeu", "vlws": "valeu",
  "obg": "obrigado", "obgd": "obrigado", "brigado": "obrigado", "obrigad": "obrigado", "obgg": "obrigado",
  "socorro": "ajuda", "help": "ajuda", "ajud": "ajuda", "ajd": "ajuda", "socorru": "ajuda",
  
  // now
  "agr": "agora", "agoraa": "agora", "agrq": "agora que", "agorinha": "agora", "agrmsm": "agora mesmo",
  "hj": "hoje", "hojeh": "hoje", "oj": "hoje", "hojee": "hoje", "hoje]": "hoje",
  
  // others
  "derrepente": "de repente", "drepente": "de repente", "dirrepente": "de repente", "drep": "de repente",
  "tipo": "", "tipo assim": "", "tipo...": "", "tipo assim...": "", "tipo... assim": "",
  "sla": "não sei", "slá": "não sei", "sei lá": "não sei", "seila": "não sei", "nsei": "não sei"
};

  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,\/#!$%^&*;:{}=\-_`~()?]/g, '')
    .split(' ')
    .map(word => slangMap[word] || word)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  minMatchCharLength: 3,
  keys: ['question'],
  ignoreLocation: true,
  distance: 100
};

let fuse;
let questions = [];

function refreshLearnedData() {
  const learnedData = loadLearnedData();
  questions = Object.values(learnedData).flatMap(category => 
    category.map(item => ({
      ...item,
      normalizedQuestion: normalizeInput(item.question)
    }))
  );
  fuse = new Fuse(questions, fuseOptions);
}

function findBestMatch(message) {
  const normalized = normalizeInput(message);
  
 
  const aliasMatch = questions.find(item => 
    item.aliases?.some(alias => 
      normalizeInput(alias) === normalized
    )
  );


  const mainMatch = questions.find(item => 
    normalizeInput(item.question) === normalized
  );

 
  const fuzzyMatch = fuse.search(normalized)[0]?.item;

  return aliasMatch || mainMatch || fuzzyMatch;
}


refreshLearnedData();

module.exports = { findBestMatch, refreshLearnedData };


