export function getUserScopedCookie(userId: string): string | null {
    const name = `lastSelectedCity_${userId}`;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(';').shift()!);
    return null;
}