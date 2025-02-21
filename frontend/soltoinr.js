async function getSolPriceInUsd() {
    try {
      const response = await fetch('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      return parseFloat(data.data.So11111111111111111111111111111111111111112.price);
    } catch (error) {
      console.error('Error fetching SOL price in USD:', error);
      throw error;
    }
  }
  
  async function convertSolToInr(solAmount) {
    try {
      const solPriceInUsd = await getSolPriceInUsd();
      const usdToInrRate = 86.64; // Update this rate as needed
      const solValueInInr = solAmount * solPriceInUsd * usdToInrRate;
      return parseFloat(solValueInInr.toFixed(2));
    } catch (error) {
      console.error('Error converting SOL to INR:', error);
      throw error;
    }
  }
  
  async function convertInrToSol(inrAmount) {
    try {
      const solPriceInUsd = await getSolPriceInUsd();
      const usdToInrRate = 86.64; // Update this rate as needed
      const solValue = inrAmount / (solPriceInUsd * usdToInrRate);
      return parseFloat(solValue.toFixed(6));
    } catch (error) {
      console.error('Error converting INR to SOL:', error);
      throw error;
    }
  }
  
  export { convertSolToInr, convertInrToSol };
  