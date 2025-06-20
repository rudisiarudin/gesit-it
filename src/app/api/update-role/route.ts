import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId, role } = await req.json();

  console.log('➡️ Updating user metadata for:', userId, 'with role:', role);

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { role },
  });

  if (error) {
    console.error('❌ Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log('✅ Success:', data);
  return NextResponse.json({ success: true, data });
}
