import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { fetchWithAuth } from '@/lib/api'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import OrderCard from '@/components/OrderCard'

export default function Dashboard() {
  const { session, userRole } = useAuth()
  const navigate = useNavigate()
  
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWithAuth('/orders')
      setOrders(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, []) // Runs once on mount (meaning auth is already resolved by PrivateRoute)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Componente Reutilizável de Esqueleto (Para UX)
  const SkeletonsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar Superior */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
               Painel SGP
             </h1>
             <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
               {userRole || 'Carregando Role...'}
             </span>
           </div>
           
           <div className="flex items-center gap-4 text-sm">
             <span className="hidden md:inline-block text-muted-foreground">{session?.user?.email}</span>
             <Button variant="outline" size="sm" onClick={handleLogout}>Sair</Button>
           </div>
         </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Meus Pedidos</h2>
          <Button onClick={fetchOrders} variant="secondary" size="sm">Atualizar</Button>
        </div>

        {error && (
          <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Dynamic Display */}
        {loading ? (
          <SkeletonsGrid />
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center">
            <p className="text-muted-foreground">Nenhum pedido encontrado na base.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {orders.map(order => (
               <OrderCard 
                 key={order.id} 
                 order={order} 
                 userRole={userRole} 
                 onUpdate={fetchOrders} 
               />
             ))}
          </div>
        )}

      </main>
    </div>
  )
}
