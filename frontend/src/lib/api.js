import { supabase } from '@/lib/supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export async function fetchWithAuth(endpoint, options = {}) {
  // Pega o token da sessão atual do Supabase
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) {
    throw new Error("Não autenticado")
  }

  // Prepara os headers com JWT Bearer
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Retorna json e valida Erros
  const responseData = await response.json()

  if (!response.ok) {
    throw new Error(responseData.error || 'Erro na requisição da API')
  }

  return responseData
}
