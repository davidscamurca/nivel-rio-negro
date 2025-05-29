// API serverless para newsletter do Rio Negro
// Vercel Edge Function

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Adicionar email
      const { email } = req.body;
      
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email inválido' 
        });
      }

      // Buscar emails existentes
      const emails = await kv.get('newsletter_emails') || [];
      
      // Verificar se já existe
      if (emails.includes(email)) {
        return res.status(409).json({ 
          success: false, 
          error: 'Email já cadastrado' 
        });
      }

      // Adicionar novo email
      emails.push(email);
      await kv.set('newsletter_emails', emails);

      // Atualizar contador público
      await kv.set('newsletter_count', emails.length);

      return res.status(200).json({ 
        success: true, 
        message: 'Email cadastrado com sucesso!',
        total: emails.length
      });

    } else if (req.method === 'GET') {
      // Retornar apenas contador (não expor emails)
      const count = await kv.get('newsletter_count') || 0;
      
      return res.status(200).json({
        total_subscribers: count,
        status: 'active',
        last_updated: new Date().toISOString()
      });

    } else {
      return res.status(405).json({ error: 'Método não permitido' });
    }

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
} 