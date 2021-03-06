import { WORDADS_STATUS_RECEIVE } from 'calypso/state/action-types';
import { keyedReducer, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { wordadsStatusSchema } from './schema';

export const items = withSchemaValidation(
	wordadsStatusSchema,
	keyedReducer(
		'siteId',
		withPersistence( ( state, action ) => {
			switch ( action.type ) {
				case WORDADS_STATUS_RECEIVE:
					return action.status;
				default:
					return state;
			}
		} )
	)
);

export default items;
