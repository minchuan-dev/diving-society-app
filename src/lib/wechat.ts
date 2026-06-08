const WECHAT_AUTH_URL = "https://open.weixin.qq.com/connect/qrconnect";
const WECHAT_TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token";
const WECHAT_USERINFO_URL = "https://api.weixin.qq.com/sns/userinfo";

export function isWeChatConfigured() {
  return Boolean(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);
}

export function getWeChatRedirectUri(origin: string) {
  return process.env.WECHAT_REDIRECT_URI ?? `${origin}/api/auth/wechat/callback`;
}

export function buildWeChatAuthUrl(state: string, origin: string) {
  const appId = process.env.WECHAT_APP_ID!;
  const redirectUri = encodeURIComponent(getWeChatRedirectUri(origin));
  const params = new URLSearchParams({
    appid: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "snsapi_login",
    state,
  });

  return `${WECHAT_AUTH_URL}?${params.toString()}#wechat_redirect`;
}

type WeChatTokenResponse = {
  access_token?: string;
  openid?: string;
  errcode?: number;
  errmsg?: string;
};

type WeChatUserInfo = {
  openid?: string;
  nickname?: string;
  headimgurl?: string;
  errcode?: number;
  errmsg?: string;
};

export async function exchangeWeChatCode(code: string) {
  const appId = process.env.WECHAT_APP_ID!;
  const secret = process.env.WECHAT_APP_SECRET!;
  const params = new URLSearchParams({
    appid: appId,
    secret,
    code,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(`${WECHAT_TOKEN_URL}?${params.toString()}`);
  const tokenData = (await tokenRes.json()) as WeChatTokenResponse;

  if (!tokenData.access_token || !tokenData.openid) {
    throw new Error(tokenData.errmsg ?? "WECHAT_TOKEN_FAILED");
  }

  const userParams = new URLSearchParams({
    access_token: tokenData.access_token,
    openid: tokenData.openid,
    lang: "zh_CN",
  });

  const userRes = await fetch(`${WECHAT_USERINFO_URL}?${userParams.toString()}`);
  const userData = (await userRes.json()) as WeChatUserInfo;

  if (!userData.openid) {
    throw new Error(userData.errmsg ?? "WECHAT_USERINFO_FAILED");
  }

  return {
    openId: userData.openid,
    nickname: userData.nickname ?? "WeChat User",
  };
}