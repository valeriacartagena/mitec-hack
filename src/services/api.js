const API_BASE = 'http://localhost:5000/api';

export const analyzeSite = async (lat, lon, projectType) => {
  try {
    // Step 1: Get AlphaEarth embeddings
    const embeddingsResponse = await fetch(`${API_BASE}/get-embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon })
    });
    const { embeddings } = await embeddingsResponse.json();
    
    // Step 2: Send to Sphinx AI for analysis
    const analysisResponse = await fetch(`${API_BASE}/analyze-site`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeddings,
        location: { lat, lon },
        projectType
      })
    });
    
    const result = await analysisResponse.json();
    return result.data;
    
  } catch (error) {
    console.error('Error analyzing site:', error);
    throw error;
  }
};

export const rankSites = async (sites, projectType) => {
  try {
    // Get embeddings for all sites
    const sitesWithEmbeddings = await Promise.all(
      sites.map(async (site) => {
        const embeddingsResponse = await fetch(`${API_BASE}/get-embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: site.lat, lon: site.lon })
        });
        const { embeddings } = await embeddingsResponse.json();
        return { ...site, embeddings };
      })
    );
    
    // Send to Sphinx for ranking
    const response = await fetch(`${API_BASE}/rank-sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sites: sitesWithEmbeddings,
        projectType
      })
    });
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Error ranking sites:', error);
    throw error;
  }
};

export const compareSites = async (sites, projectType) => {
  try {
    const response = await fetch(`${API_BASE}/compare-sites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sites, projectType })
    });
    
    const result = await response.json();
    return result.data;
    
  } catch (error) {
    console.error('Error comparing sites:', error);
    throw error;
  }
};