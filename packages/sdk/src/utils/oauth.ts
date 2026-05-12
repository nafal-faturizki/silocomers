export function googleAuthUrl({ clientId, redirectUri, scope = 'openid email profile', state = '' }: { clientId: string; redirectUri: string; scope?: string; state?: string }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    state,
    prompt: 'consent'
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export function githubAuthUrl({ clientId, redirectUri, scope = 'read:user user:email', state = '' }: { clientId: string; redirectUri: string; scope?: string; state?: string }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state
  })
  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

// Note: Exchange code for token requires client secret and network call — left as placeholder for dev.
export async function exchangeCodePlaceholder(provider: 'google' | 'github', code: string) {
  // In real implementation: perform POST to provider token endpoint with client_secret.
  return { provider, code, externalUserId: `ext-${code}` }
}
