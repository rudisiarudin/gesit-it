// app/supabase-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session, User } from '@supabase/supabase-js'

const Context = createContext<any>(null)

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClientComponentClient()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      const currentUser = data.session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await saveUserToDatabase(currentUser)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await saveUserToDatabase(currentUser)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const saveUserToDatabase = async (user: User) => {
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || user.email,
        },
        { onConflict: 'id' }
      )
    if (error) {
      console.error('Gagal menyimpan user:', error.message)
    }
  }

  return (
    <Context.Provider value={{ supabase, session, user }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => useContext(Context)
