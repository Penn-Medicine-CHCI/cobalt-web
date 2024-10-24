import { AnalyticsNativeEventTypeId } from '@/lib/models';

export const analyticsService = {
	persistEvent(analyticsNativeEventTypeId: AnalyticsNativeEventTypeId, data: Record<string, any> = {}): boolean {
		// Delegate to object configured on the window.
		// See public/static/js/analytics.js for implementation and public/index.html for initialization.
		try {
			return (window as any).cobaltAnalytics.persistEvent(analyticsNativeEventTypeId, data);
		} catch (e) {
			console.warn('Unable to persist native analytics event', e);
			return false;
		}
	},

	getFingerprint(): String {
		return (window as any).cobaltAnalytics.getFingerprint();
	},

	getFingerprintQueryParameterName(): String {
		return (window as any).cobaltAnalytics.getFingerprintQueryParameterName();
	},

	getSessionId(): String {
		return (window as any).cobaltAnalytics.getSessionId();
	},

	getSessionIdQueryParameterName(): String {
		return (window as any).cobaltAnalytics.getSessionIdQueryParameterName();
	},

	getReferringMessageId(): String | undefined {
		return (window as any).cobaltAnalytics.getReferringMessageId();
	},

	getReferringMessageIdQueryParameterName(): String {
		return (window as any).cobaltAnalytics.getReferringMessageIdQueryParameterName();
	},

	getReferringCampaign(): String | undefined {
		return (window as any).cobaltAnalytics.getReferringCampaign();
	},

	getReferringCampaignQueryParameterName(): String {
		return (window as any).cobaltAnalytics.getReferringCampaignQueryParameterName();
	},
};
