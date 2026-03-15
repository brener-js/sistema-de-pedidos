import { useState } from 'react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import { fetchWithAuth } from '@/lib/api'

export default function OrderCard({ order, userRole, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [newDescription, setNewDescription] = useState(order.description)

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

  const handleDelete = async () => {
    if (!window.confirm("Certeza que deseja cancelar este pedido?")) return;
    
    setLoading(true)
    try {
      await fetchWithAuth(`/orders/${order.id}`, { method: 'DELETE' })
      onUpdate()
    } catch (err) {
      alert("Erro ao excluir: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSave = async () => {
    if (!newDescription.trim() || newDescription === order.description) {
      setIsEditing(false);
      return;
    }
    
    setLoading(true)
    try {
      await fetchWithAuth(`/orders/${order.id}`, {
        method: 'PUT',
        body: JSON.stringify({ description: newDescription })
      })
      setIsEditing(false)
      onUpdate() 
    } catch (err) {
      alert("Erro ao editar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const isPending = order.status === 'Pendente';

  return (
    <Card className="w-full transition-all hover:shadow-md relative group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-4">
          
          {isEditing ? (
            <div className="flex-1 flex gap-2 w-full">
               <Input 
                 value={newDescription} 
                 onChange={(e) => setNewDescription(e.target.value)}
                 className="h-8 text-sm"
                 autoFocus
               />
               <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={handleEditSave} disabled={loading}>
                 <Check className="h-4 w-4" />
               </Button>
               <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setIsEditing(false)} disabled={loading}>
                 <X className="h-4 w-4" />
               </Button>
            </div>
          ) : (
            <CardTitle className="text-lg line-clamp-2 pr-12">{order.description}</CardTitle>
          )}

          <div className={`px-2.5 py-0.5 whitespace-nowrap rounded-full text-xs font-semibold border ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
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

      <CardFooter className="pt-2 flex flex-col gap-2">
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
           <div className="w-full flex justify-between items-center text-xs text-muted-foreground py-2 border-t border-border mt-2">
             <span>{isPending ? 'Você ainda pode alterar este pedido.' : 'Pedido em andamento/finalizado.'}</span>
             
             {isPending && !isEditing && (
               <div className="flex gap-1">
                 <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => setIsEditing(true)} disabled={loading}>
                   <Edit2 className="h-4 w-4" />
                 </Button>
                 <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={handleDelete} disabled={loading}>
                   <Trash2 className="h-4 w-4" />
                 </Button>
               </div>
             )}
           </div>
        )}
      </CardFooter>
    </Card>
  )
}
