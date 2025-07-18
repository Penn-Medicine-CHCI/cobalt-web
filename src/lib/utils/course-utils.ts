import {
	CourseModuleModel,
	CourseSessionModel,
	CourseSessionUnitStatusId,
	CourseUnitLockTypeId,
	CourseUnitModel,
	CourseVideoModel,
} from '@/lib/models';

export const getRequiredCourseModules = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	return courseModules.filter((cm) => !optionalCourseModuleIds.includes(cm.courseModuleId));
};

export const getOptionalCourseModules = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	return courseModules.filter((cm) => optionalCourseModuleIds.includes(cm.courseModuleId));
};

export const getRequiredCourseUnits = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	const requiredModules = getRequiredCourseModules(courseModules, optionalCourseModuleIds);
	return requiredModules.flatMap((cm) => cm.courseUnits);
};

export const getOptionalCourseUnits = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	const optionalModules = getOptionalCourseModules(courseModules, optionalCourseModuleIds);
	return optionalModules.flatMap((cm) => cm.courseUnits);
};

export const getOrderedCourseUnits = (courseModules: CourseModuleModel[], optionalCourseModuleIds: string[]) => {
	const requiredCourseUnits = getRequiredCourseUnits(courseModules, optionalCourseModuleIds);
	const optionalCourseUnits = getOptionalCourseUnits(courseModules, optionalCourseModuleIds);
	return [...requiredCourseUnits, ...optionalCourseUnits];
};

export const getCompletedCourseUnitIds = (courseSession: CourseSessionModel) => {
	return Object.entries(courseSession.courseSessionUnitStatusIdsByCourseUnitId)
		.filter(([, status]) => status === CourseSessionUnitStatusId.COMPLETED)
		.map(([courseUnitId]) => courseUnitId);
};

export const getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession = (
	courseModules: CourseModuleModel[],
	courseSession: CourseSessionModel
) => {
	const courseUnitsOrdered = getOrderedCourseUnits(courseModules, courseSession.optionalCourseModuleIds);
	const unlockedCourseUnitIds = Object.entries(courseSession.courseUnitLockStatusesByCourseUnitId)
		.filter(([, { courseUnitLockTypeId }]) => courseUnitLockTypeId === CourseUnitLockTypeId.UNLOCKED)
		.map(([courseUnitId]) => courseUnitId);
	const completedCourseUnitIds = getCompletedCourseUnitIds(courseSession);
	const nextCourseUnit = courseUnitsOrdered.find(
		(u) => unlockedCourseUnitIds.includes(u.courseUnitId) && !completedCourseUnitIds.includes(u.courseUnitId)
	);

	return nextCourseUnit?.courseUnitId;
};

export const getNextIncompleteAndNotStronglyLockedCourseUnitIdByCourseSession = (
	courseUnit: CourseUnitModel,
	courseModules: CourseModuleModel[],
	courseSession: CourseSessionModel
) => {
	const courseUnitsOrdered = getOrderedCourseUnits(courseModules, courseSession.optionalCourseModuleIds);
	const currentCourseUnitIndex = courseUnitsOrdered.findIndex((cu) => cu.courseUnitId === courseUnit.courseUnitId);

	if (currentCourseUnitIndex === -1) return undefined;

	const preCurrentCourseUnits = courseUnitsOrdered.slice(0, currentCourseUnitIndex);
	const postCurrentCourseUnits = courseUnitsOrdered.slice(currentCourseUnitIndex + 1);
	const desiredUnits = postCurrentCourseUnits.length > 0 ? postCurrentCourseUnits : preCurrentCourseUnits;
	const unlockedCourseUnitIds = Object.entries(courseSession.courseUnitLockStatusesByCourseUnitId)
		.filter(([, { courseUnitLockTypeId }]) => courseUnitLockTypeId !== CourseUnitLockTypeId.STRONGLY_LOCKED)
		.map(([courseUnitId]) => courseUnitId);
	const completedCourseUnitIds = getCompletedCourseUnitIds(courseSession);

	const nextCourseUnit = desiredUnits.find(
		(u) => unlockedCourseUnitIds.includes(u.courseUnitId) && !completedCourseUnitIds.includes(u.courseUnitId)
	);

	return nextCourseUnit?.courseUnitId;
};

export const getCurrentCourseModule = (courseModules: CourseModuleModel[], courseSession?: CourseSessionModel) => {
	if (!courseSession) {
		return courseModules[0];
	}

	const currentCourseUnitId = getFirstUnlockedAndIncompleteCourseUnitIdByCourseSession(courseModules, courseSession);

	return courseModules.find((cm) =>
		cm.courseUnits.map((u) => u.courseUnitId).find((uid) => uid === currentCourseUnitId)
	);
};

export const getKalturaScriptForVideo = ({
	videoPlayerId,
	courseVideo,
	eventCallback,
	errorCallback,
}: {
	videoPlayerId: string;
	courseVideo: CourseVideoModel;
	eventCallback: (eventName: string, event: string | number | object) => void;
	errorCallback: (error: unknown) => void;
}) => {
	const script = document.createElement('script');
	script.src = `//cdnapisec.kaltura.com/p/${courseVideo.kalturaPartnerId}/sp/${courseVideo.kalturaPartnerId}00/embedIframeJs/uiconf_id/${courseVideo.kalturaUiconfId}/partner_id/${courseVideo.kalturaPartnerId}`;
	script.async = true;
	script.onload = () => {
		// @ts-ignore
		window.kWidget.embed({
			targetId: videoPlayerId,
			wid: courseVideo.kalturaWid,
			uiconf_id: courseVideo.kalturaUiconfId,
			entry_id: courseVideo.kalturaEntryId,
			readyCallback: (playerID: string) => {
				const kdp = document.getElementById(playerID);
				const events = [
					'layoutBuildDone',
					'playerReady',
					'mediaLoaded',
					'mediaError',
					'playerStateChange',
					'firstPlay',
					'playerPlayed',
					'playerPaused',
					'preSeek',
					'seek',
					'seeked',
					'playerUpdatePlayhead',
					'openFullScreen',
					'closeFullScreen',
					'volumeChanged',
					'mute',
					'unmute',
					'bufferChange',
					'cuePointReached',
					'playerPlayEnd',
					'onChangeMedia',
					'onChangeMediaDone',
				];

				for (let i = 0; i < events.length; i++) {
					if (!kdp) return;

					// @ts-ignore
					kdp.kBind(events[i], (event: string | number | object) => {
						eventCallback(events[i], event);
					});
				}
			},
		});
	};
	script.onerror = errorCallback;

	return {
		script,
	};
};
