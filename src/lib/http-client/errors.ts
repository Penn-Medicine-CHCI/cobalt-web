import axios, { AxiosError } from 'axios';

export enum ERROR_CODES {
	GENERIC = 'GENERIC',
	REQUEST_ABORTED = 'REQUEST_ABORTED',
}

export class CobaltError extends Error {
	static fromApiError(error: ApiError) {
		const instance = new CobaltError(error.message);

		instance.code = error.code;
		instance.apiError = error;

		return instance;
	}

	static fromAxiosError(error: AxiosError) {
		let instance: CobaltError;
		const errorData = error.response?.data;
		const apiError = isApiError(errorData) ? errorData : undefined;

		if (axios.isCancel(error)) {
			instance = new CobaltError('Sorry, the request was cancelled.');
			instance.code = ERROR_CODES.REQUEST_ABORTED;
		} else if (apiError) {
			instance = CobaltError.fromApiError(apiError);
		} else {
			instance = new CobaltError('Sorry, an error occurred.');
		}

		instance.axiosError = error;

		return instance;
	}

	static fromUnknownError(error: unknown) {
		const instance = new CobaltError('Sorry, an error occurred.');

		instance.unknownError = error;

		return instance;
	}

	code: string = ERROR_CODES.GENERIC;
	apiError?: ApiError;
	axiosError?: AxiosError;
	unknownError?: unknown;

	constructor(public message: string) {
		super(message);
	}
}

export type ApiError = {
	code: string;
	stackTrace: string;
	message: string;
	globalErrors?: string;
	fieldErrors?: FieldError[];
	metadata?: Record<string, string | boolean>;
	accessTokenStatus?: 'PARTIALLY_EXPIRED' | 'FULLY_EXPIRED';
	signOnUrl?: string;
};

type FieldError = {
	field: string;
	error: string;
};

export function isApiError(error: unknown): error is ApiError {
	return (
		typeof error === 'object' && error !== null && Object.hasOwn(error, 'code') && Object.hasOwn(error, 'message')
	);
}
