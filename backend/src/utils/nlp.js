import natural from 'natural';

const tokenizer = new natural.WordTokenizer();

const alertPatterns = {
  testnet: {
    keywords: ['testnet', 'test network', 'beta', 'launch on testnet', 'test launch', 'test phase'],
    weight: 1.0
  },
  nft: {
    keywords: ['nft', 'nft collection', 'nft drop', 'nft project', 'nft marketplace', 'digital collectible'],
    weight: 1.0
  },
  funding: {
    keywords: ['funding round', 'series a', 'series b', 'series c', 'seed round', 'investment', 'raised', 'funding'],
    weight: 1.0
  },
  launch: {
    keywords: ['launch', 'launching', 'go live', 'now live', 'now available', 'release'],
    weight: 0.8
  },
  partnership: {
    keywords: ['partnership', 'partner', 'collaboration', 'partners with', 'announces partnership'],
    weight: 0.7
  }
};

export async function detectAlertType(content) {
  const tokens = tokenizer.tokenize(content.toLowerCase());
  const scores = {};

  for (const [alertType, pattern] of Object.entries(alertPatterns)) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      const keywordTokens = keyword.split(' ');
      for (let i = 0; i <= tokens.length - keywordTokens.length; i++) {
        const slice = tokens.slice(i, i + keywordTokens.length).join(' ');
        if (slice === keyword) {
          score += pattern.weight;
        }
      }
    }
    scores[alertType] = Math.min(score / 2, 1.0);
  }

  const maxType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  
  return {
    alertType: maxType,
    confidence: scores[maxType],
    scores
  };
}
