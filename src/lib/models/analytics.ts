export enum AnalyticsNativeEventTypeId {
	SESSION_STARTED = 'SESSION_STARTED',
	BROUGHT_TO_FOREGROUND = 'BROUGHT_TO_FOREGROUND',
	SENT_TO_BACKGROUND = 'SENT_TO_BACKGROUND',
	URL_CHANGED = 'URL_CHANGED',
	API_CALL_ERROR = 'API_CALL_ERROR',
	ACCOUNT_SIGNED_IN = 'ACCOUNT_SIGNED_IN',
	ACCOUNT_SIGNED_OUT = 'ACCOUNT_SIGNED_OUT',
	PAGE_VIEW_SIGN_IN = 'PAGE_VIEW_SIGN_IN',
	PAGE_VIEW_SIGN_IN_EMAIL = 'PAGE_VIEW_SIGN_IN_EMAIL',
	PAGE_VIEW_HOME = 'PAGE_VIEW_HOME',
	PAGE_VIEW_TOPIC_CENTER = 'PAGE_VIEW_TOPIC_CENTER',
	PAGE_VIEW_RESOURCE_LIBRARY = 'PAGE_VIEW_RESOURCE_LIBRARY',
	PAGE_VIEW_RESOURCE_LIBRARY_TAG_GROUP = 'PAGE_VIEW_RESOURCE_LIBRARY_TAG_GROUP',
	PAGE_VIEW_RESOURCE_LIBRARY_TAG = 'PAGE_VIEW_RESOURCE_LIBRARY_TAG',
	PAGE_VIEW_RESOURCE_LIBRARY_DETAIL = 'PAGE_VIEW_RESOURCE_LIBRARY_DETAIL',
}

export enum AnalyticsNativeEventAccountSignedOutSource {
	CONSENT_FORM = 'CONSENT_FORM',
	PATIENT_HEADER = 'PATIENT_HEADER',
	ADMIN_HEADER = 'ADMIN_HEADER',
	MHIC_HEADER = 'MHIC_HEADER',
	ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
	STUDY_ONBOARDING = 'STUDY_ONBOARDING',
}
