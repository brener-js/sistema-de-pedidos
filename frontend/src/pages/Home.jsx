import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-3xl space-y-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-primary">
          Sistema de Gestão de Pedidos
        </h1>
        <p className="text-lg text-muted-foreground">
          Gerencie pedidos em tempo real. Interface elegante, autenticação segura via Supabase, e consumo RESTful flexível.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/login">
            <Button size="lg" className="w-full sm:w-auto">Entrar no Sistema</Button>
          </Link>
          <Link to="https://sgp-backend-api.onrender.com/api-docs/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-12 text-base shadow-sm hover:bg-secondary/80">
              Ver Documentação API
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
