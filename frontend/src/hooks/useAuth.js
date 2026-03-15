import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Busca sessao inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchRole(session.user.id)
      else setLoading(false);
    })

    // Escuta mudancas (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchRole(session.user.id)
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Buscar Role da tabela pública extra
  const fetchRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      
      if (!error && data) {
        setUserRole(data.role)
      }
    } catch (err) {
      console.error("Erro ao buscar role", err)
    } finally {
      setLoading(false)
    }
  }

  return { session, userRole, loading }
}
