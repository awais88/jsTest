import { CONCIERGE_INITIAL_REQUEST, CONCIERGE_INITIAL_UPDATE } from 'calypso/state/action-types';

export const appointmentTimespan = ( state = null, action ) => {
	switch ( action.type ) {
		case CONCIERGE_INITIAL_REQUEST:
			return null;
		case CONCIERGE_INITIAL_UPDATE: {
			const { initial } = action;
			return initial.appointmentTimespan;
		}
	}

	return state;
};

export default appointmentTimespan;
