import { createElement } from 'react';
import Subscription from './subscription';

export function subscription( context, next ) {
	const subscriptionId = context.params.subscriptionId;

	if ( subscriptionId ) {
		context.primary = createElement( Subscription, { subscriptionId: subscriptionId } );
	}
	next();
}
