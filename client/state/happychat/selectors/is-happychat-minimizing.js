import { get } from 'lodash';

import 'calypso/state/happychat/init';

/**
 * Gets the current happychat minimizing status
 *
 * @param {object} state - global redux state
 * @returns {string} current state value
 */
export default ( state ) => get( state, 'happychat.ui.isMinimizing' );
