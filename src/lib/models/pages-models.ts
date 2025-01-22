export enum PAGE_STATUS_ID {
	LIVE = 'LIVE',
	DRAFT = 'DRAFT',
}

export enum PAGE_TYPE_ID {
	TOPIC_CENTER = 'TOPIC_CENTER',
	COMMUNITY = 'COMMUNITY',
}

export enum BACKGROUND_COLOR_ID {
	WHITE = 'WHITE',
	NEUTRAL = 'NEUTRAL',
}

export enum ROW_TYPE_ID {
	RESOURCES = 'RESOURCES',
	GROUP_SESSIONS = 'GROUP_SESSIONS',
	TAG_GROUP = 'TAG_GROUP',
	ONE_COLUMN_IMAGE = 'ONE_COLUMN_IMAGE',
	TWO_COLUMN_IMAGE = 'TWO_COLUMN_IMAGE',
	THREE_COLUMN_IMAGE = 'THREE_COLUMN_IMAGE',
}

export interface PageModel {
	pageId: string;
	name: string;
	urlName: string;
	pageTypeId: PAGE_TYPE_ID;
	pageStatusId: PAGE_STATUS_ID;
	headline: string;
	description: string;
	imageFileUploadId: string;
	imageAltText: string;
	publishedDate: string;
	publishedDateDescription: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
}

export interface PageSectionModel {
	pageSectionId: string;
	pageId: string;
	name: string;
	headline: string;
	description: string;
	backgroundColorId: BACKGROUND_COLOR_ID;
	displayOrder: number;
}

export interface PageRowModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: string;
	displayOrder: number;
}

export interface PageFriendlyUrlValidationResult {
	available: boolean;
	recommendation: string;
}

export interface PageDetailModel {
	pageId: string;
	name: string;
	urlName: string;
	pageTypeId: string;
	pageStatusId: PAGE_STATUS_ID;
	publishedDate: string;
	publishedDateDescription: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	pageSections: PageSectionDetailModel[];
}

export interface PageSectionDetailModel {
	pageSectionId: string;
	pageId: string;
	name: string;
	headline: string;
	description: string;
	backgroundColorId: BACKGROUND_COLOR_ID;
	displayOrder: number;
	pageRows: PageRowUnionModel[];
}

export type PageRowUnionModel =
	| ResourcesRowModel
	| GroupSessionsRowModel
	| TagGroupRowModel
	| OneColumnImageRowModel
	| TwoColumnImageRowModel
	| ThreeColumnImageRowModel;

export interface PageRowDetailModel {
	pageRowId: string;
	pageSectionId: string;
	rowTypeId: ROW_TYPE_ID;
	displayOrder: number;
}

export interface ResourcesRowModel extends PageRowDetailModel {
	contents: {
		pageRowContentId: string;
		contentId: string;
		contentDisplayOrder: number;
	}[];
}

export interface GroupSessionsRowModel extends PageRowDetailModel {
	groupSessions: {
		pageRowGroupSessionId: string;
		groupSessionId: string;
		groupSessionDisplayOrder: number;
		pageRowId: string;
	}[];
}

export interface TagGroupRowModel extends PageRowDetailModel {
	tagGroup: {
		pageRowTagGroupId: string;
		tagGroupId: string;
	};
}

export interface OneColumnImageRowModel extends PageRowDetailModel {
	pageRowOneColumn: {
		pageRowId: string;
		displayOrder: number;
		columnOne: ColumnImageModel;
	};
}

export interface TwoColumnImageRowModel extends PageRowDetailModel {
	pageRowTwoColumn: {
		pageRowId: string;
		displayOrder: number;
		columnOne: ColumnImageModel;
		columnTwo: ColumnImageModel;
	};
}

export interface ThreeColumnImageRowModel extends PageRowDetailModel {
	pageRowThreeColumn: {
		pageRowId: string;
		displayOrder: number;
		columnOne: ColumnImageModel;
		columnTwo: ColumnImageModel;
		columnThree: ColumnImageModel;
	};
}

interface ColumnImageModel {
	pageRowColumnId: string;
	pageRowId: string;
	headline: string;
	description: string;
	imageFileUploadId: string;
	imageAltText: string;
	columnDisplayOrder: number;
}

export const isResourcesRow = (x: any): x is ResourcesRowModel => {
	return x.hasOwnProperty('contents');
};

export const isGroupSessionsRow = (x: any): x is GroupSessionsRowModel => {
	return x.hasOwnProperty('groupSessions');
};

export const isTagGroupRow = (x: any): x is TagGroupRowModel => {
	return x.hasOwnProperty('tagGroup');
};

export const isOneColumnImageRow = (x: any): x is OneColumnImageRowModel => {
	return x.hasOwnProperty('pageRowOneColumn');
};

export const isTwoColumnImageRow = (x: any): x is TwoColumnImageRowModel => {
	return x.hasOwnProperty('pageRowTwoColumn');
};

export const isThreeColumnImageRow = (x: any): x is ThreeColumnImageRowModel => {
	return x.hasOwnProperty('pageRowThreeColumn');
};
