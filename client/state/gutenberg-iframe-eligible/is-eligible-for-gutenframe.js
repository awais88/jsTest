import { get } from 'lodash';
import shouldCalypsoifyJetpack from 'calypso/state/selectors/should-calypsoify-jetpack';

export const isEligibleForGutenframe = ( state, siteId ) => {
	return (
		shouldCalypsoifyJetpack( state, siteId ) &&
		get( state, [ 'gutenbergIframeEligible', siteId ], true )
	);
};

export default isEligibleForGutenframe;
