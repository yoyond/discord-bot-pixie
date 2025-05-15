const fs = require('fs');
const path = require('path');

class FileManager {
  constructor() {
    this.dataDir = process.env.NODE_ENV === 'production' 
      ? '/data'  // Diretório persistente no Fly.io
      : path.join(process.cwd(), 'data');
    
    this.learnedPath = path.join(this.dataDir, 'learned.json');
    
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  readLearnedData() {
    try {
      if (fs.existsSync(this.learnedPath)) {
        return JSON.parse(fs.readFileSync(this.learnedPath, 'utf8'));
      }
    } catch (e) {
      console.error('Erro ao ler learned.json:', e);
    }
    return {};
  }

  writeLearnedData(data) {
    try {
      fs.writeFileSync(this.learnedPath, JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      console.error('Erro ao escrever learned.json:', e);
      return false;
    }
  }

  debug() {
    return {
      dataDir: this.dataDir,
      learnedPath: this.learnedPath,
      dirExists: fs.existsSync(this.dataDir),
      fileExists: fs.existsSync(this.learnedPath),
      dirContent: fs.existsSync(this.dataDir) ? fs.readdirSync(this.dataDir) : []
    };
  }
}

module.exports = new FileManager();