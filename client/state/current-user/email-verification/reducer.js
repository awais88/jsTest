import {
	EMAIL_VERIFY_REQUEST,
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
	EMAIL_VERIFY_STATE_RESET,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const status = ( state = null, action ) => {
	switch ( action.type ) {
		case EMAIL_VERIFY_REQUEST:
			return 'requesting';
		case EMAIL_VERIFY_REQUEST_SUCCESS:
			return 'sent';
		case EMAIL_VERIFY_REQUEST_FAILURE:
			return 'error';
		case EMAIL_VERIFY_STATE_RESET:
			return null;
	}

	return state;
};

export const errorMessage = ( state = '', action ) => {
	switch ( action.type ) {
		case EMAIL_VERIFY_REQUEST:
			return '';
		case EMAIL_VERIFY_REQUEST_SUCCESS:
			return '';
		case EMAIL_VERIFY_REQUEST_FAILURE: {
			const { message } = action;
			return message;
		}
		case EMAIL_VERIFY_STATE_RESET:
			return '';
	}

	return state;
};

export default combineReducers( {
	status,
	errorMessage,
} );
