import { createHash } from 'crypto'

/**
 * Server-only: shared guest review hash logic so API and product page
 * compute the same guest_hash for the same guest + product.
 * Used to show the current guest's own review (including pending) on the product page.
 */

export const GUEST_REVIEW_COOKIE_NAME = 'sparkling_guest_id'

export function computeGuestHash(
  guestId: string,
  productId: string,
  salt: string
): string {
  const payload = `${guestId}:${productId}:${salt}`
  return createHash('sha256').update(payload).digest('hex')
}

/** Same IP extraction as guest API route (must stay in sync). */
export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}

/**
 * Resolve guestId from cookie or from IP-based hash (when no cookie).
 * Same logic as POST /api/reviews/guest.
 */
export function resolveGuestId(
  cookieValue: string | undefined,
  headers: Headers,
  salt: string
): string {
  if (cookieValue) return cookieValue
  const ip = getClientIpFromHeaders(headers)
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex')
}

/**
 * Compute the guest_hash for the current request and product.
 * Returns null if not a guest context or GUEST_REVIEW_SALT is missing.
 */
export async function getCurrentGuestHashForProduct(
  productId: string,
  cookieValue: string | undefined,
  headers: Headers
): Promise<string | null> {
  const salt = process.env.GUEST_REVIEW_SALT
  if (!salt) return null
  const guestId = resolveGuestId(cookieValue, headers, salt)
  return computeGuestHash(guestId, productId, salt)
}
