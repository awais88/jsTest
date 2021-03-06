import { getUrlParts, getUrlFromParts } from '@automattic/calypso-url';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

export default function getJetpackRecommendationsUrl( state: AppState ): string | undefined {
	const site = getSelectedSite( state );

	if ( ! site?.jetpack ) {
		return undefined;
	}

	const adminUrl = site?.options?.admin_url;

	return adminUrl
		? getUrlFromParts( {
				...getUrlParts( adminUrl + 'admin.php' ),
				search: '?page=jetpack',
				hash: '/recommendations',
		  } ).href
		: undefined;
}
