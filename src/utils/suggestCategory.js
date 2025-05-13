module.exports = function suggestCategory(frase, categorias) {
  let melhorCategoria = null;
  let maiorScore = 0;

  for (const [categoria, frases] of Object.entries(categorias)) {
    for (const entrada of frases) {
      const similaridade = similarity(frase, entrada.frase);
      if (similaridade > maiorScore) {
        maiorScore = similaridade;
        melhorCategoria = categoria;
      }
    }
  }

  return maiorScore > 0.3 ? melhorCategoria : null;
};

function similarity(a, b) {
  a = a.toLowerCase().split(' ');
  b = b.toLowerCase().split(' ');
  const comuns = a.filter(palavra => b.includes(palavra)).length;
  return comuns / Math.max(a.length, b.length);
}