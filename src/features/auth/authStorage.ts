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
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
}

