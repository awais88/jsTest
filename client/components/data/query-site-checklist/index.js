import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';

export default function QuerySiteChecklist( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestSiteChecklist( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteChecklist.propTypes = { siteId: PropTypes.number.isRequired };
