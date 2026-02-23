const TOKEN_KEY = 'token'

export const getAuthToken = () : string | null => {

    const localToken = localStorage.getItem(TOKEN_KEY);
    if (localToken) {
        return localToken
    }
    const sessionToken = sessionStorage.getItem(TOKEN_KEY)
    return sessionToken;

}

export const setAuthToken = (token: string, remember: boolean): void => {
    // очищаем оба хранилища
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)

    if (remember) {
        localStorage.setItem(TOKEN_KEY, token)
    } else {
        sessionStorage.setItem(TOKEN_KEY, token)
    }
}

export const removeAuthToken = (): void => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
}