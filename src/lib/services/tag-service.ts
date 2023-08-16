import { httpSingleton } from '@/lib/singletons/http-singleton';
import { TagGroup } from '../models';

interface TagGroupsResponse {
	tagGroups: TagGroup[];
}

export const tagService = {
	getTagGroups() {
		return httpSingleton.orchestrateRequest<TagGroupsResponse>({
			method: 'get',
			url: '/tags/tag-groups',
		});
	},
};
