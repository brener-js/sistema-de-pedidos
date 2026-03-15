const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - description
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogerado no banco (UUID)
 *         user_id:
 *           type: string
 *           description: ID do dono do pedido do Supabase (UUID)
 *         description:
 *           type: string
 *           description: Descrição ou itens do pedido
 *         status:
 *           type: string
 *           description: Estado atual do pedido (Pendente, Em Preparo, Enviado, Entregue)
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: O pedido foi criado com sucesso
 *       400:
 *         description: Erro ao inserir o pedido
 *       401:
 *         description: Não autorizado (Token ausente ou inválido)
 */
router.post('/', authMiddleware, async (req, res) => {
  const { description } = req.body;
  const userId = req.user.id; // Vinculo com usuário extraido do JWT

  if (!description) {
    return res.status(400).json({ error: 'Apenas description é obrigatória' });
  }

  try {
    const { data, error } = await req.supabase
      .from('orders')
      .insert([{ user_id: userId, description }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Retorna a lista de pedidos baseados na sua role ('Cliente' vê os próprios, 'Administrador' vê todos)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Não autorizado
 */
router.get('/', authMiddleware, async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let query = req.supabase.from('orders').select('*').order('created_at', { ascending: false });

    // Cliente só encontra os dele, Administrador passa direto trazendo tudo
    if (role === 'Cliente') {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: Altera o status do pedido (Apenas Administradores)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID (UUID) do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_status
 *             properties:
 *               new_status:
 *                 type: string
 *                 enum: [Pendente, Em Preparo, Enviado, Entregue]
 *     responses:
 *       200:
 *         description: Estatus atualizado com sucesso e log registrado
 *       403:
 *         description: Acesso restrito apenas a Administradores
 *       404:
 *         description: Pedido não encontrado
 */
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { new_status } = req.body;
  const { role } = req.user;

  if (role !== 'Administrador') {
    return res.status(403).json({ error: 'Acesso Restrito: Apenas administradores podem alterar o status de um pedido.' });
  }

  const validStatuses = ['Pendente', 'Em Preparo', 'Enviado', 'Entregue'];
  if (!validStatuses.includes(new_status)) {
    return res.status(400).json({ error: 'Status invÃ¡lido.' });
  }

  try {
    // Busca o status antigo
    const { data: order, error: fetchError } = await req.supabase
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({ error: 'Pedido nÃ£o encontrado' });
    }

    const old_status = order.status;

    // Atualiza o pedido
    const { error: updateError } = await req.supabase
      .from('orders')
      .update({ status: new_status })
      .eq('id', id);

    if (updateError) throw updateError;

    // Registra  no history (Rastreabilidade)
    const { error: historyError } = await req.supabase
      .from('status_history')
      .insert([{ order_id: id, old_status, new_status }]);

    if (historyError) throw historyError;

    res.status(200).json({ message: 'Status atualizado com sucesso', old_status, new_status });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Edita a descrição de um pedido existente (Apenas o Cliente dono)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID (UUID) do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pedido editado com sucesso
 *       400:
 *         description: O pedido não pode ser alterado pois não está Pendente
 *       403:
 *         description: Você não tem permissão para editar este pedido
 *       404:
 *         description: Pedido não encontrado
 */
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const { id: userId, role } = req.user;

  if (!description) {
    return res.status(400).json({ error: 'A descriçāo é obrigatória' });
  }

  try {
    const { data: order, error: fetchError } = await req.supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) return res.status(404).json({ error: 'Pedido nâo encontrado' });

    // Regras de Negócio de Ediçāo
    if (role !== 'Administrador' && order.user_id !== userId) {
      return res.status(403).json({ error: 'Acesso Negado: Este pedido pertence a outro usuário' });
    }

    if (order.status !== 'Pendente') {
      return res.status(400).json({ error: 'Impossível editar. O pedido já está em andamento ou finalizado.' });
    }

    const { error: updateError } = await req.supabase
      .from('orders')
      .update({ description })
      .eq('id', id);

    if (updateError) throw updateError;

    res.status(200).json({ message: 'Pedido atualizado com sucesso' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Exclui/Cancela um pedido (Apenas o Cliente dono)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID (UUID) do pedido
 *     responses:
 *       200:
 *         description: Pedido deletado com sucesso
 *       400:
 *         description: Pedido não pode ser deletado pois já começou a ser preparado
 *       403:
 *         description: Você não tem permissão
 *       404:
 *         description: Pedido não encontrado
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    const { data: order, error: fetchError } = await req.supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) return res.status(404).json({ error: 'Pedido nāo encontrado' });

    // Regras de Negócio de Exclusão
    if (role !== 'Administrador' && order.user_id !== userId) {
      return res.status(403).json({ error: 'Acesso Negado: Este pedido pertence a outro usuário' });
    }

    if (order.status !== 'Pendente') {
      return res.status(400).json({ error: 'Impossível excluir. O pedido já está em andamento ou finalizado.' });
    }

    // Como o status_history tem FK cascade default ou rules, deletamos as associacoes dele antes (ou deixamos o banco lidar dependendo do sql, aqui forçamos limpar historico pra nao dar FK Error)
    await req.supabase.from('status_history').delete().eq('order_id', id);

    const { error: deleteError } = await req.supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    res.status(200).json({ message: 'Pedido deletado com sucesso' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
