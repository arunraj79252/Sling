const { REACT_APP_CLIENT_ID, REACT_APP_REDIRECT_URL } = process.env;

function getGoogleUrl() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
    const options = {
        redirect_uri: REACT_APP_REDIRECT_URL,
        client_id: REACT_APP_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            // 'https://googleapis.com/auth/userinfo.openid'
        ].join(" ")
    }
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs}`;
}
export default getGoogleUrl;  
