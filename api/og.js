export default async function handler(req, res) {
  const { product } = req.query;

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  let html = '';
  try {
    const urlToFetch = `${protocol}://${host}/index.html`;
    const response = await fetch(urlToFetch);
    html = await response.text();
    if (!html.includes('<div id="root">')) {
      throw new Error("Invalid HTML fetched");
    }
  } catch (err) {
    console.error("Failed to fetch index.html:", err);
    // Fallback: minimal valid HTML with a meta refresh just in case, but bots might not like it.
    // It's better to return the raw HTML if possible.
    html = '<!DOCTYPE html><html><head><title>Rawbilla Store</title></head><body><p>Loading...</p></body></html>';
  }

  if (product && html.includes('<meta property="og:image"')) {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const productRes = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${product}&select=name,description,images`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        const products = await productRes.json();
        if (products && products.length > 0) {
          const item = products[0];
          
          let appLogoUrl = 'https://lh3.googleusercontent.com/d/1vz13kD11gFg38ik-U2Be7S0_0pvy7-ww';
          const matchLogo = html.match(/<meta property="og:image" content="([^"]*)" />/);
          if (matchLogo && matchLogo[1]) {
            appLogoUrl = matchLogo[1];
          }

          const safeTitle = (item.name || '').replace(/"/g, '&quot;');
          const safeDesc = (item.description || '').replace(/"/g, '&quot;');
          const safeImg = appLogoUrl;

          html = html.replace(/<meta property="og:title" content="[^"]*" />/g, `<meta property="og:title" content="${safeTitle}" />`);
          html = html.replace(/<meta property="og:description" content="[^"]*" />/g, `<meta property="og:description" content="${safeDesc}" />`);
          html = html.replace(/<meta property="og:image" content="[^"]*" />/g, `<meta property="og:image" content="${safeImg}" />`);
          html = html.replace(/<title>.*</title>/, `<title>${safeTitle} | Rawbilla Store</title>`);
          
          html = html.replace('</head>', `
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <meta name="twitter:image" content="${safeImg}" />
  </head>`);
        }
      }
    } catch (e) {
      console.error("Error fetching product for OG tags:", e);
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
}
