import handler from './api/og.js';

const req = {
  query: { product: '7da289be-38cf-448c-9c98-dfefbd792f58' },
  headers: { host: 'localhost:5173' },
  url: 'http://localhost:5173/?product=7da289be-38cf-448c-9c98-dfefbd792f58'
};

const res = {
  setHeader: (k, v) => console.log('Set Header:', k, v),
  status: (c) => ({
    send: (html) => console.log('HTML Output Length:', html.length, 'Contains OG Image?', html.includes('og:image'))
  })
};

// Simulate env
process.env.VITE_SUPABASE_URL = 'https://rwnpdfiyrfcnfcrfnemy.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bnBkZml5cmZjbmZjcmZuZW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NjIwNDksImV4cCI6MjA5ODAzODA0OX0.bEx6QvIbtlsoTfBval6RYKA2Iu_JRzgGwKMmksCOEnA';

handler(req, res);
