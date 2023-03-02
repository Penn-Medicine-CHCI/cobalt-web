import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import {
	AccountModel,
	ActivePatientOrderCountModel,
	PatientOrderCountModel,
	PatientOrderModel,
	PatientOrderNoteModel,
	PatientOrderOutreachModel,
	PatientOrderStatusId,
} from '@/lib/models';

export const integratedCareService = {
	importPatientOrders(data: { csvContent: string }) {
		return httpSingleton.orchestrateRequest<any>({
			method: 'POST',
			url: '/patient-order-imports',
			data,
		});
	},
	getPatientOrders(queryParameters?: {
		patientOrderPanelTypeId?: string;
		panelAccountId?: string;
		searchQuery?: string;
		pageNumber?: string;
		pageSize?: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				patientOrders: PatientOrderModel[];
				totalCount: number;
				totalCountDescription: string;
			};
			activePatientOrdersCount: number;
			activePatientOrdersCountDescription: string;
			activePatientOrderCountsByPatientOrderStatusId: Record<PatientOrderStatusId, ActivePatientOrderCountModel>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/patient-orders', queryParameters),
		});
	},
	getPanelAccounts() {
		return httpSingleton.orchestrateRequest<{
			panelAccounts: AccountModel[];
			activePatientOrderCountsByPanelAccountId: Record<string, PatientOrderCountModel>;
			overallActivePatientOrderCount: number;
			overallActivePatientOrderCountDescription: string;
		}>({
			method: 'GET',
			url: '/integrated-care/panel-accounts',
		});
	},
	getOpenOrderForCurrentPatient() {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
		}>({
			method: 'GET',
			url: `/patient-orders/open`,
		});
	},
	getPatientOrder(patientOrderId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrder: PatientOrderModel;
			associatedPatientOrders: PatientOrderModel[];
			patientAccount?: AccountModel;
		}>({
			method: 'GET',
			url: `/patient-orders/${patientOrderId}`,
		});
	},
	postNote(data: { patientOrderId: string; note: string }) {
		return httpSingleton.orchestrateRequest<{
			patientOrderNote: PatientOrderNoteModel;
		}>({
			method: 'POST',
			url: '/patient-order-notes',
			data,
		});
	},
	updateNote(patientOrderNoteId: string, data: { note: string }) {
		return httpSingleton.orchestrateRequest<{
			patientOrderNote: PatientOrderNoteModel;
		}>({
			method: 'PUT',
			url: `/patient-order-notes/${patientOrderNoteId}`,
			data,
		});
	},
	deleteNote(patientOrderNoteId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrderNote: PatientOrderNoteModel;
		}>({
			method: 'DELETE',
			url: `/patient-order-notes/${patientOrderNoteId}`,
		});
	},
	postPatientOrderOutreach(data: {
		patientOrderId: string;
		outreachDate: string;
		outreachTime: string;
		note: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			patientOrderOutreach: PatientOrderOutreachModel;
		}>({
			method: 'POST',
			url: '/patient-order-outreaches',
			data,
		});
	},
	updatePatientOrderOutreach(
		patientOrderOutreachId: string,
		data: {
			outreachDate: string;
			outreachTime: string;
			note: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			patientOrderOutreach: PatientOrderOutreachModel;
		}>({
			method: 'PUT',
			url: `/patient-order-outreaches/${patientOrderOutreachId}`,
			data,
		});
	},
	deletePatientOrderOutreach(patientOrderOutreachId: string) {
		return httpSingleton.orchestrateRequest<{
			patientOrderOutreach: PatientOrderOutreachModel;
		}>({
			method: 'DELETE',
			url: `/patient-order-outreaches/${patientOrderOutreachId}`,
		});
	},
};
