import { createAnonClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

function getSubmittedHash(request: Request): string | null {
  try {
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0]?.trim() : request.headers.get('x-real-ip')?.trim() ?? 'unknown'
    const ua = request.headers.get('user-agent') ?? ''
    return createHash('sha256').update(`${ip}:${ua}`).digest('hex')
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  // Guest-only: reject authenticated users so insert runs as anon (same as guest reviews).
  const supabaseAuth = createClient()
  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (session?.user) {
    return NextResponse.json(
      { error: 'When signed in, your submission is sent from the page.' },
      { status: 400 }
    )
  }

  let body: { brand_name?: string; product_name?: string; image_url?: string; notes?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const brandName = typeof body.brand_name === 'string' ? body.brand_name.trim() : ''
  const productName = typeof body.product_name === 'string' ? body.product_name.trim() : ''
  const imageUrl = typeof body.image_url === 'string' ? body.image_url.trim() || null : null
  const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null

  if (!brandName || !productName) {
    return NextResponse.json(
      { error: 'Brand name and product name are required.' },
      { status: 400 }
    )
  }

  const submittedHash = getSubmittedHash(request)
  const supabase = createAnonClient()

  const { data: inserted, error } = await supabase
    .from('product_submissions')
    .insert({
      brand_name: brandName,
      product_name: productName,
      image_url: imageUrl,
      notes: notes,
      status: 'pending',
      submitted_hash: submittedHash,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Product submission insert error:', error.message)
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ id: inserted?.id }, { status: 201 })
}
