import api from '../utils/axios';

export const fetchFacebookAdsStatus = () => api.get('/facebook-ads/status');

export const fetchFacebookOAuthUrl = () => api.get('/facebook-ads/oauth-url');

export const launchFacebookQuickCampaign = (payload) =>
  api.post('/facebook-ads/launch', payload);

