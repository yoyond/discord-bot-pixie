const Fuse = require('fuse.js');
const learnedData = require('../../learned.json');

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

const questions = Object.values(learnedData).flatMap(category => 
  category.map(item => ({
    ...item,
    normalizedQuestion: normalizeText(item.question)
  })
));

const fuse = new Fuse(questions, fuseOptions);

function findBestMatch(message) {
  const normalized = normalizeText(message);
  const results = fuse.search(normalized);
  
  if (results.length === 0) return null;
  
  // Retorna apenas se o score for bom o suficiente
  return results[0].score < 0.4 ? results[0].item : null;
}

module.exports = { findBestMatch };