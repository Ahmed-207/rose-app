export function getUserScopedCookieData(userId: string): { city: string; id: string } | null {
    const name = `lastSelectedCity_${userId}`;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        try {
            return JSON.parse(decodeURIComponent(parts.pop()!.split(';').shift()!));
        } catch {
            return null;
        }
    }
    return null;
}