import html from '../content/site.html?raw';
export const dynamic = 'force-dynamic';
export function GET(){
  const preview=import.meta.env.DEV?'<meta name="storage-mode" content="preview">':'';
  return new Response(html.replace('</head>',preview+'</head>'),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}});
}
