export default async function handler(req, res) {
  const { product } = req.query;

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  let html = '';
  try {
    const response = await fetch(`${protocol}://${host}/index.html`);
    html = await response.text();
  } catch (err) {
    html = '<!DOCTYPE html><html><head><title>Rawbilla Store</title></head><body></body></html>';
  }

  if (product) {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const productRes = await fetch(`${supabaseUrl}/rest/v1/menu_items?id=eq.${product}&select=name,description,image`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        const products = await productRes.json();
        if (products && products.length > 0) {
          const item = products[0];
          
          let imgUrl = item.image || '';
          if (imgUrl.includes('drive.google.com')) {
            const driveRegexes = [
              /drive\.google\.com\/file\/d\/([^/]+)/,
              /drive\.google\.com\/open\?id=([^&]+)/,
              /drive\.google\.com\/uc\?.*id=([^&]+)/,
              /drive\.google\.com.*\/d\/([a-zA-Z0-9_-]+)/
            ];
            for (const regex of driveRegexes) {
              const match = imgUrl.match(regex);
              if (match && match[1]) {
                imgUrl = `https://lh3.googleusercontent.com/d/${match[1]}`;
                break;
              }
            }
          }

          const safeTitle = (item.name || '').replace(/"/g, '&quot;');
          const safeDesc = (item.description || 'أجود أنواع الشوكولا والحلويات. اطلب الآن واستمتع بالمذاق الرائع.').replace(/"/g, '&quot;');
          const safeImg = imgUrl.replace(/"/g, '&quot;');

          html = html.replace(/<meta property="og:title" content="[^"]*" \/>/g, `<meta property="og:title" content="${safeTitle}" />`);
          html = html.replace(/<meta property="og:description" content="[^"]*" \/>/g, `<meta property="og:description" content="${safeDesc}" />`);
          html = html.replace(/<meta property="og:image" content="[^"]*" \/>/g, `<meta property="og:image" content="${safeImg}" />`);
          html = html.replace(/<title>.*<\/title>/, `<title>${safeTitle} | Rawbilla Store</title>`);
          
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
