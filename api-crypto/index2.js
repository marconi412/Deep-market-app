const express = require('express');
const cors = require('cors');
const { getTopCryptos, getCryptoHistory } = require('./services/criptoservices');

const app = express();
const PORT = 3005;

app.use(cors());

//  Rota pra obter top 10 criptos
app.get('/cryptos', async (req, res) => {
  try {
    const data = await getTopCryptos();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter dados das criptos' });
  }
});

//  Rota pra obter histórico da cripto
app.get('/cryptos/:id/history', async (req, res) => {
  const { id } = req.params;
  const { range } = req.query;

  try {
    const data = await getCryptoHistory(id, range);
    res.json(data);
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
