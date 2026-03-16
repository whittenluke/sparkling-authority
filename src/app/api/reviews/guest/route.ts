import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'sparkling_guest_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function computeGuestHash(guestId: string, productId: string, salt: string): string {
  const payload = `${guestId}:${productId}:${salt}`
  return createHash('sha256').update(payload).digest('hex')
}

export async function POST(request: Request) {
  // Reject authenticated users; they should use client-side submit
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session?.user) {
    return NextResponse.json(
      { error: 'Use the in-page form to submit when signed in.' },
      { status: 400 }
    )
  }

  const salt = process.env.GUEST_REVIEW_SALT
  if (!salt) {
    console.error('GUEST_REVIEW_SALT is not set')
    return NextResponse.json(
      { error: 'Server configuration error.' },
      { status: 500 }
    )
  }

  let body: { productId?: string; rating?: number; reviewText?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const productId = typeof body.productId === 'string' ? body.productId.trim() : undefined
  const rating =
    typeof body.rating === 'number' && Number.isInteger(body.rating) ? body.rating : undefined
  const reviewText =
    body.reviewText !== undefined
      ? (typeof body.reviewText === 'string' ? body.reviewText : '').trim()
      : ''

  if (!productId || rating == null || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'productId (string) and rating (1–5) are required.' },
      { status: 400 }
    )
  }

  const cookieStore = await cookies()
  let guestId = cookieStore.get(COOKIE_NAME)?.value
  let setCookie = false
  if (!guestId) {
    guestId = crypto.randomUUID()
    setCookie = true
  }

  const guestHash = computeGuestHash(guestId, productId, salt)

  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('guest_hash', guestHash)
    .is('user_id', null)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: "You've already reviewed this product." },
      { status: 409 }
    )
  }

  const moderationStatus = reviewText ? 'pending' : 'approved'
  const { data: inserted, error } = await supabase
    .from('reviews')
    .insert({
      product_id: productId,
      user_id: null,
      guest_hash: guestHash,
      overall_rating: rating,
      review_text: reviewText,
      moderation_status: moderationStatus,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Guest review insert error:', error.message)
    return NextResponse.json(
      { error: 'Failed to submit review. Please try again.' },
      { status: 500 }
    )
  }

  const res = NextResponse.json({ id: inserted?.id }, { status: 201 })
  if (setCookie) {
    res.cookies.set(COOKIE_NAME, guestId!, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })
  }
  return res
}
