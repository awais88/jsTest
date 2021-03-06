import { createSelector } from '@automattic/state-utils';
import { get, orderBy } from 'lodash';

import 'calypso/state/posts/init';

export const getPostRevisions = createSelector(
	( state, siteId, postId ) => {
		const revisions = get( state.posts.revisions.diffs, [ siteId, postId, 'revisions' ] );
		return orderBy( revisions, [ 'post_modified_gmt', 'id' ], [ 'desc', 'desc' ] );
	},
	( state ) => [ state.posts.revisions.diffs ]
);
