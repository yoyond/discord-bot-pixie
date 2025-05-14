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

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .replace(/\s{2,}/g, ' ')
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
      normalizedQuestion: normalizeText(item.question)
    })
  ));
  
  fuse = new Fuse(questions, fuseOptions);
}

// Carrega os dados inicialmente
refreshLearnedData();

function findBestMatch(message) {
  const normalized = normalizeText(message);
  const results = fuse.search(normalized);
  
  if (results.length === 0) return null;
  
  return results[0].score < 0.4 ? results[0].item : null;
}

module.exports = { findBestMatch, refreshLearnedData };