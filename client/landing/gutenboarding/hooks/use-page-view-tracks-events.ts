import { recordTracksPageViewWithPageParams } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageViewTracksEvents() {
	const { pathname } = useLocation();

	useEffect( () => {
		// Use the location from `window` so that we get the full path, not just
		// the fragment that react-router deals with.
		recordTracksPageViewWithPageParams( window.location.pathname );
	}, [ pathname ] );
}
