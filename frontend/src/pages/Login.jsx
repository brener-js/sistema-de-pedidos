import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function Login() {
  const navigate = useNavigate()
  
  // Estados compartilhados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    // O Supabase exigirá pelo menos 6 caracteres na senha por padrão
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      // Se a confirmação de email estiver desligada no Supabase, ele loga direto
      // Senão, ele pede para checar a caixa de entrada.
      if (data.session) {
        navigate('/dashboard')
      } else {
        setSuccessMsg('Conta criada! Bem-vindo(a) ao SGP. (Faça login agora ou confirme seu e-mail caso o provedor exija).')
      }
    }
    setLoading(false)
  }

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-center">Acesso ao SGP</CardTitle>
            <CardDescription className="text-center">
              Faça login ou crie sua conta para gerenciar pedidos.
            </CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
            </TabsList>
          </CardHeader>

          {/* ABA 1: LOGIN */}
          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login">E-mail corporativo ou pessoal</Label>
                  <Input id="email-login" type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login">Senha segura</Label>
                  <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {errorMsg && <p className="text-sm font-medium text-destructive">{errorMsg}</p>}
                {successMsg && <p className="text-sm font-medium text-green-500">{successMsg}</p>}
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Entrando..." : "Acessar Sistema"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          {/* ABA 2: REGISTRO */}
          <TabsContent value="register" className="mt-0">
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-register">Seu melhor E-mail</Label>
                  <Input id="email-register" type="email" placeholder="novo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Crie uma Senha (mín. 6 caracteres)</Label>
                  <Input id="password-register" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                {errorMsg && <p className="text-sm font-medium text-destructive">{errorMsg}</p>}
                {successMsg && <p className="text-sm font-medium text-green-500">{successMsg}</p>}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="secondary" type="submit" disabled={loading}>
                  {loading ? "Registrando..." : "Criar Nova Conta Grátis"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
        </Tabs>
      </Card>
    </div>
  )
}
