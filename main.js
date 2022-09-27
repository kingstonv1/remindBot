const axios = require('axios');

console.log('start');
async function ummm() 
{
    const res = await axios.get('https://api.sampleapis.com/cartoons/cartoons2D');
    console.log(res.status);
}