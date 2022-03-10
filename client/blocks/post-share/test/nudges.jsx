jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view-tracker', () => 'PageViewTracker' );
jest.mock( 'calypso/blocks/upsell-nudge', () => 'UpsellNudge' );

import {
	PLAN_FREE,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_BUSINESS_2_YEARS,
	PLAN_PREMIUM,
	PLAN_PREMIUM_2_YEARS,
	PLAN_PERSONAL,
	PLAN_PERSONAL_2_YEARS,
	PLAN_BLOGGER,
	PLAN_BLOGGER_2_YEARS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_ECOMMERCE,
	PLAN_ECOMMERCE_2_YEARS,
} from '@automattic/calypso-products';
import { shallow } from 'enzyme';
import { UpgradeToPremiumNudgePure } from '../nudges';

const props = {
	translate: ( x ) => x,
	canUserUpgrade: true,
};

describe( 'UpgradeToPremiumNudgePure basic tests', () => {
	test( 'should not blow up', () => {
		const comp = shallow( <UpgradeToPremiumNudgePure { ...props } /> );
		expect( comp.find( 'UpsellNudge' ).length ).toBe( 1 );
	} );

	test( 'hide when user cannot upgrade', () => {
		const localProps = {
			translate: ( x ) => x,
			canUserUpgrade: false,
		};
		const comp = shallow( <UpgradeToPremiumNudgePure { ...localProps } /> );
		expect( comp.find( 'UpsellNudge' ).length ).toBe( 0 );
	} );
} );

describe( 'UpgradeToPremiumNudgePure.render()', () => {
	[
		PLAN_JETPACK_FREE,
		PLAN_JETPACK_PERSONAL,
		PLAN_JETPACK_PERSONAL_MONTHLY,
		PLAN_JETPACK_PREMIUM,
		PLAN_JETPACK_PREMIUM_MONTHLY,
		PLAN_JETPACK_BUSINESS,
		PLAN_JETPACK_BUSINESS_MONTHLY,
		PLAN_FREE,
		PLAN_BLOGGER,
		PLAN_PERSONAL,
		PLAN_PREMIUM,
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_ECOMMERCE,
		PLAN_BLOGGER_2_YEARS,
		PLAN_PERSONAL_2_YEARS,
		PLAN_PREMIUM_2_YEARS,
		PLAN_BUSINESS_2_YEARS,
		PLAN_ECOMMERCE_2_YEARS,
	].forEach( ( plan ) => {
		test( `Should pass 2-years wp.com premium plan for 2-years plans ${ plan }`, () => {
			const comp = shallow(
				<UpgradeToPremiumNudgePure { ...props } isJetpack={ false } planSlug={ plan } />
			);
			expect( comp.find( 'UpsellNudge' ).props().plan ).toBe( plan );
		} );
	} );
} );