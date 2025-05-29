// API protegida para GitHub Actions buscar emails
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Verificar autenticação
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.NEWSLETTER_API_TOKEN;
  
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Buscar todos os emails
    const emails = await kv.get('newsletter_emails') || [];
    
    return res.status(200).json({
      emails: emails,
      total: emails.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar emails:', error);
    return res.status(500).json({ error: 'Erro interno' });
  }
} 