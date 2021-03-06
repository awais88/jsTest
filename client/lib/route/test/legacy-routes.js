import config from '@automattic/calypso-config';
import { expect } from 'chai';
import sinon from 'sinon';
import { isLegacyRoute } from '../legacy-routes';

let features = [];

describe( 'legacy-routes', () => {
	describe( '#isLegacyRoute()', () => {
		beforeAll( () => {
			sinon.stub( config, 'isEnabled' ).callsFake( ( flag ) => {
				return features.indexOf( flag ) > -1;
			} );
		} );

		afterAll( () => {
			config.isEnabled.restore();
		} );

		test( 'should return false for /settings/general', () => {
			expect( isLegacyRoute( '/settings/general' ) ).to.be.false;
		} );

		test( 'should return true for / when reader is disabled', () => {
			// config.isEnabled( 'reader' ) === false
			features = [];
			expect( isLegacyRoute( '/' ) ).to.be.true;
		} );

		test( 'should return false for / when reader is enabled', () => {
			// config.isEnabled( 'reader' ) === true
			features = [ 'reader' ];
			expect( isLegacyRoute( '/' ) ).to.be.false;
		} );

		test( 'should return true for any path ending in .php', () => {
			expect( isLegacyRoute( '/test.php' ) ).to.be.true;
			expect( isLegacyRoute( 'test.php' ) ).to.be.true;
			expect( isLegacyRoute( '/some/nested/page.php' ) ).to.be.true;
		} );

		test( 'should return false for /me', () => {
			expect( isLegacyRoute( '/me' ) ).to.be.false;
		} );

		test( 'should return false for /me/billing', () => {
			expect( isLegacyRoute( '/me/billing' ) ).to.be.false;
		} );
	} );
} );
