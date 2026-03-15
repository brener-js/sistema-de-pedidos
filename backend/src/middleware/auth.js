const supabase = require('../config/supabaseClient');

/**
 * Middleware para autenticação via Supabase JWT
 * Valida o token e insere as informações do usuário (incluindo role da tabela public.users) no req.user
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Nenhum token fornecido ou em formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica e decodifica o JWT usando a validação do próprio Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado', details: authError?.message });
    }

    // Busca o 'role' preenchido na tabela public.users
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (dbError || !dbUser) {
      return res.status(403).json({ error: 'Usuário não existe na base de dados pública' });
    }

    // Adiciona o usuário na requisição para acesso pelas rotas
    req.user = {
      id: user.id,
      email: user.email,
      role: dbUser.role
    };

    next();

  } catch (err) {
    console.error('Erro no middleware de auth:', err);
    res.status(500).json({ error: 'Erro interno na validação de autenticação' });
  }
};

module.exports = authMiddleware;
