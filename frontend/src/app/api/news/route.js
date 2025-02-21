import axios from 'axios';

// Helper function to prepare search query
const prepareQuery = (incident, location) => {
  // Clean and normalize input
  const cleanText = (text) => text.trim().toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Create query with location context
  const cleanIncident = cleanText(incident);
  const cleanLocation = cleanText(location);
  
  // Combine terms with proper GDELT query syntax
  return encodeURIComponent(`${cleanIncident} near10:"${cleanLocation}"`);
};

// Check news using GDELT Context API
async function checkGDELTContext(incident, location) {
  try {
    const query = prepareQuery(incident, location);
    const timespan = '72h'; // Context API limited to 72 hours
    
    // Use Context 2.0 API for sentence-level analysis
    const url = `https://api.gdeltproject.org/api/v2/context/context?format=json&timespan=${timespan}&query=${query}&mode=artlist&maxrecords=75`;
    
    const response = await axios.get(url);
    
    if (response.data && response.data.articles) {
      return {
        articles: response.data.articles.map(article => ({
          title: article.title,
          url: article.url,
          context: article.context, // Sentence snippet showing the match
          timestamp: article.seendate,
          domain: article.domain
        })),
        status: getVerificationStatus(response.data.articles)
      };
    }
    
    return { articles: [], status: 'UNVERIFIED' };
  } catch (error) {
    console.error('GDELT API error:', error);
    return { articles: [], status: 'ERROR', error: error.message };
  }
}

// Determine verification status based on results
function getVerificationStatus(articles) {
  if (!articles || articles.length === 0) {
    return 'UNVERIFIED';
  }
  
  if (articles.length >= 3) {
    return 'VERIFIED';
  }
  
  if (articles.length >= 1) {
    return 'PARTIALLY_VERIFIED';
  }
  
  return 'UNVERIFIED';
}

export async function POST(req) {
  try {
    const { incident, location } = await req.json();
    
    if (!incident || !location) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Both incident and location are required"
        }),
        { status: 400 }
      );
    }
    
    // Get news from GDELT Context API
    const result = await checkGDELTContext(incident, location);
    
    // Prepare response
    const response = {
      success: true,
      status: result.status,
      data: {
        articles: result.articles,
        summary: {
          totalSources: result.articles.length,
          latestUpdate: result.articles.length > 0 ? 
            Math.max(...result.articles.map(a => new Date(a.timestamp))) : null,
          uniqueDomains: [...new Set(result.articles.map(a => a.domain))].length
        }
      },
      metadata: {
        incident,
        location,
        timestamp: new Date().toISOString()
      }
    };
    
    return new Response(
      JSON.stringify(response),
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500 }
    );
  }
}