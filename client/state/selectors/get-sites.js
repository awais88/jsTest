import { createSelector } from '@automattic/state-utils';
import { partition, sortBy } from 'lodash';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { getSite } from 'calypso/state/sites/selectors';

const sortByNameAndUrl = ( list ) => sortBy( list, [ 'name', 'URL' ] );

/**
 * Get all sites
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Sites objects
 */
export default createSelector(
	( state ) => {
		const primarySiteId = getPrimarySiteId( state );
		const [ primarySite, sites ] = partition( getSitesItems( state ), { ID: primarySiteId } );

		return [ ...primarySite, ...sortByNameAndUrl( sites ) ].map( ( site ) =>
			getSite( state, site.ID )
		);
	},
	( state ) => [ getSitesItems( state ), state.currentUser.capabilities ]
);
