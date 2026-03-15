import { useState } from 'react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchWithAuth } from '@/lib/api'

export default function OrderCard({ order, userRole, onUpdate }) {
  const [loading, setLoading] = useState(false)

  // Map to apply tailwind colors based on status
  const statusColors = {
    'Pendente': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    'Em Preparo': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Enviado': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Entregue': 'bg-green-500/10 text-green-500 border-green-500/20'
  }

  const handleStatusChange = async (new_status) => {
    if (new_status === order.status) return;
    
    setLoading(true)
    try {
      await fetchWithAuth(`/orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ new_status })
      })
      onUpdate() // refetch the data to show changes
    } catch (err) {
      alert("Erro ao alterar status: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-lg line-clamp-1">{order.description}</CardTitle>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
            {order.status}
          </div>
        </div>
        <CardDescription className="text-xs">
          Pedido gerado em: {new Date(order.created_at).toLocaleString()}
        </CardDescription>
      </CardHeader>

      <CardContent>
         <span className="text-sm font-medium text-muted-foreground">ID do Pedido:</span> 
         <span className="text-xs ml-2 font-mono text-muted-foreground/80">{order.id}</span>
      </CardContent>

      <CardFooter className="pt-2">
        {userRole === 'Administrador' ? (
          <div className="w-full space-y-2">
             <label className="text-xs text-muted-foreground font-medium">Alterar Status:</label>
             <Select 
                defaultValue={order.status} 
                onValueChange={handleStatusChange} 
                disabled={loading}
             >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Preparo">Em Preparo</SelectItem>
                  <SelectItem value="Enviado">Enviado</SelectItem>
                  <SelectItem value="Entregue">Entregue</SelectItem>
                </SelectContent>
             </Select>
          </div>
        ) : (
          <div className="w-full text-center text-xs text-muted-foreground py-2 border-t border-border mt-2">
            Em caso de dúvidas sobre o seu pedido, entre em contato com o suporte.
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
