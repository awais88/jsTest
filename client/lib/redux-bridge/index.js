let reduxStore = null;

let resolveReduxStorePromise;
const reduxStorePromise = new Promise( ( resolve ) => {
	resolveReduxStorePromise = resolve;
} );

export function setReduxStore( store ) {
	reduxStore = store;
	resolveReduxStorePromise( store );
}

/**
 * Asynchronously get the current Redux store. Returns a Promise that gets resolved only
 * after the store is set by `setReduxStore`.
 *
 * @returns {Promise<object>} Promise of the Redux store object.
 */
export function getReduxStore() {
	return reduxStorePromise;
}

/**
 * Get the state of the current redux store
 *
 * @returns {object} Redux state
 */
export function reduxGetState() {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.getState();
}

/**
 * Dispatch an action against the current redux store
 *
 * @returns {any} Result of the dispatch
 */
export function reduxDispatch( ...args ) {
	if ( ! reduxStore ) {
		return;
	}
	return reduxStore.dispatch( ...args );
}
