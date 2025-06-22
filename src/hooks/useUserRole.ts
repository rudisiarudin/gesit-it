import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useUserRole = () => {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (data?.role) setRole(data.role);
        if (error) console.error('Role error:', error.message);
      }
    };

    fetchRole();
  }, []);

  return { role, userId };
};
