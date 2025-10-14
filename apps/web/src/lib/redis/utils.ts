/**
 * Extract the client's IP address from the request headers
 * Handles common proxy headers like CF-Connecting-IP, X-Forwarded-For, etc.
 *
 * @param request - The HTTP request object
 * @returns The client's IP address
 */
export function getClientIdentifier(request: Request): string {
  // Check Cloudflare connecting IP
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Check X-Forwarded-For header
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    return ips[0];
  }

  // Check X-Real-IP header
  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  // Fallback to a default identifier
  return "unknown";
}

/**
 * Get the client identifier with a custom prefix
 * Useful for different rate limiting strategies (per-user, per-IP, per-chatbot, etc.)
 *
 * @param request - The HTTP request object
 * @param prefix - Optional prefix to add to the identifier
 * @returns The prefixed client identifier
 */
export function getClientIdentifierWithPrefix(
  request: Request,
  prefix?: string,
): string {
  const ip = getClientIdentifier(request);
  return prefix ? `${prefix}:${ip}` : ip;
}
