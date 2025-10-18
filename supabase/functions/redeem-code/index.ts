import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { code } = await req.json()

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Código inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const trimmedCode = code.trim().toUpperCase()

    // Buscar código
    const { data: rechargeCode, error: codeError } = await supabaseClient
      .from('recharge_codes')
      .select('*')
      .eq('code', trimmedCode)
      .single()

    if (codeError || !rechargeCode) {
      console.log('Código não encontrado:', trimmedCode)
      return new Response(
        JSON.stringify({ error: 'Código não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar código
    if (!rechargeCode.is_active) {
      return new Response(
        JSON.stringify({ error: 'Código inativo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (rechargeCode.expires_at && new Date(rechargeCode.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Código expirado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (rechargeCode.current_uses >= rechargeCode.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Código já foi totalmente utilizado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se usuário já usou este código
    const { data: existingRedemption } = await supabaseClient
      .from('code_redemptions')
      .select('*')
      .eq('code_id', rechargeCode.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingRedemption) {
      return new Response(
        JSON.stringify({ error: 'Você já resgatou este código' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Iniciar transação: buscar ou criar user_credits
    const { data: userCredits } = await supabaseClient
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const currentBalance = userCredits?.balance || 0
    const newBalance = currentBalance + rechargeCode.credits_amount

    if (userCredits) {
      // Atualizar saldo existente
      await supabaseClient
        .from('user_credits')
        .update({
          balance: newBalance,
          total_purchased: (userCredits.total_purchased || 0) + rechargeCode.credits_amount,
        })
        .eq('user_id', user.id)
    } else {
      // Criar registro de créditos
      await supabaseClient
        .from('user_credits')
        .insert({
          user_id: user.id,
          balance: newBalance,
          total_purchased: rechargeCode.credits_amount,
        })
    }

    // Registrar resgate
    await supabaseClient
      .from('code_redemptions')
      .insert({
        code_id: rechargeCode.id,
        user_id: user.id,
        credits_added: rechargeCode.credits_amount,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      })

    // Atualizar contador de usos do código
    await supabaseClient
      .from('recharge_codes')
      .update({ current_uses: rechargeCode.current_uses + 1 })
      .eq('id', rechargeCode.id)

    // Registrar transação
    await supabaseClient
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        amount: rechargeCode.credits_amount,
        type: 'recharge',
        description: `Código resgatado: ${trimmedCode}`,
        metadata: { code_id: rechargeCode.id, code: trimmedCode },
        balance_after: newBalance,
      })

    // Aplicar benefícios premium se houver
    if (rechargeCode.benefits && Object.keys(rechargeCode.benefits).length > 0) {
      await supabaseClient
        .from('profiles')
        .update({
          is_premium: true,
          premium_benefits: rechargeCode.benefits,
        })
        .eq('user_id', user.id)
    }

    console.log(`Código ${trimmedCode} resgatado com sucesso por ${user.email}`)

    return new Response(
      JSON.stringify({
        success: true,
        credits_added: rechargeCode.credits_amount,
        new_balance: newBalance,
        benefits: rechargeCode.benefits || {},
        message: 'Código resgatado com sucesso!',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro ao resgatar código:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
