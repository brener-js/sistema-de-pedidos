const { supabase, getAuthClient } = require('../config/supabaseClient');

const authMiddleware = async (req, res, next) => {
  // Ignora auth middleware no tempo de teste Jest
  if (process.env.NODE_ENV === 'test') {
    req.user = { id: 'test-user', role: 'Administrador' };
    req.supabase = supabase; // Fallback mock client
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Não autorizado. Token Inválido.' });
    }

    // Busca a Role do public.users
    const { data: userRoleData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError) {
      return res.status(403).json({ error: 'Falha ao validar os privilégios da conta.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: userRoleData.role
    };

    // Repassa o cliente autenticado pra dentro das rotas para o RLS funcionar
    req.supabase = getAuthClient(token);

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Erro de validação interna do token' });
  }
};

module.exports = authMiddleware;
