import { createClient, createAnonClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  GUEST_REVIEW_COOKIE_NAME,
  computeGuestHash,
  resolveGuestId,
} from '@/lib/guest-review-server'

export const dynamic = 'force-dynamic'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function fail500(message: string, devDetail?: string) {
  const error =
    process.env.NODE_ENV === 'development' && devDetail
      ? `${message}: ${devDetail}`
      : message
  return NextResponse.json({ error }, { status: 500 })
}

export async function POST(request: Request) {
  try {
    // Reject authenticated users; they should use client-side submit
    const supabaseAuth = createClient()
    const {
      data: { session },
    } = await supabaseAuth.auth.getSession()
    if (session?.user) {
      return NextResponse.json(
        { error: 'Use the in-page form to submit when signed in.' },
        { status: 400 }
      )
    }

    const supabase = createAnonClient()

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
    const cookieValue = cookieStore.get(GUEST_REVIEW_COOKIE_NAME)?.value
    const guestId = resolveGuestId(cookieValue, request.headers, salt)
    const setCookie = !cookieValue
    const guestHash = computeGuestHash(guestId, productId, salt)

    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('guest_hash', guestHash)
      .is('user_id', null)
      .maybeSingle()

    if (existing) {
      const { data: updatedId, error: rpcError } = await supabase.rpc('update_guest_review', {
        review_id: existing.id,
        guest_hash_input: guestHash,
        new_rating: rating,
        new_review_text: reviewText,
      })
      if (rpcError || updatedId == null) {
        console.error('Guest review update RPC error:', rpcError?.message ?? 'no row updated')
        return fail500('Failed to update review. Please try again.', rpcError?.message)
      }
      return NextResponse.json({ id: existing.id }, { status: 200 })
    }

    const { data: inserted, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_id: null,
        guest_hash: guestHash,
        overall_rating: rating,
        review_text: reviewText,
        moderation_status: 'approved',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Guest review insert error:', error.message, error)
      return fail500('Failed to submit review. Please try again.', error.message)
    }

    const res = NextResponse.json({ id: inserted?.id }, { status: 201 })
    if (setCookie) {
      res.cookies.set(GUEST_REVIEW_COOKIE_NAME, guestId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
      })
    }
    return res
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('Guest review API uncaught error:', msg, stack)
    return fail500('Failed to submit review. Please try again.', msg)
  }
}
