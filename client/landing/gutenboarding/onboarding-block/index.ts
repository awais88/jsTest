import edit from './edit';
import type { Attributes } from './types';
import type { BlockConfiguration } from '@wordpress/blocks';

export const name = 'automattic/onboarding';

export const settings: BlockConfiguration< Attributes > = {
	title: 'WordPress.com onboarding block',
	category: 'layout',
	description: '',
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
	},
	supports: {
		align: [ 'full' ],
		html: false,
		inserter: false,
		multiple: false,
		reusable: false,
	},
	edit,
	save: () => null,
	getEditWrapperProps() {
		return { tabIndex: -1 };
	},
};
