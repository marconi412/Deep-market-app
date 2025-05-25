const axios = require('axios');

const BASE_URL = 'https://api.coingecko.com/api/v3';

async function getTopCryptos() {
  const response = await axios.get(`${BASE_URL}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 10,
      page: 1,
      sparkline: false,
      price_change_percentage: '24h,7d,30d,1y'
    }
  });

  return response.data;
}

async function getCryptoHistory(id, range) {
  let days;

  switch (range) {
    case '5d':
      days = 5;
      break;
    case '7d':
      days = 7;
      break;
    case '1m':
      days = 30;
      break;
    case '1y':
      days = 365;
      break;
    default:
      days = 5;
  }

  const response = await axios.get(`${BASE_URL}/coins/${id}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days: days,
      interval: 'daily'
    }
  });

  return response.data;
}

module.exports = { getTopCryptos, getCryptoHistory };
