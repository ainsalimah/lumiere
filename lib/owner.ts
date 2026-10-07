export function ownerEmail(): string { return (process.env.OWNER_EMAIL || '').trim().toLowerCase() }
export function isOwner(email: string): boolean { return !!ownerEmail() && email.trim().toLowerCase() === ownerEmail() }
