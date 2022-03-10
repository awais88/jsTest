import type { GoogleEmailSubscription, TitanEmailSubscription } from 'calypso/lib/domains/types';

export interface SiteDomain {
	aftermarketAuction?: boolean;
	autoRenewalDate?: string;
	autoRenewing?: boolean;
	blogId?: number;
	canSetAsPrimary?: boolean;
	currentUserCanAddEmail?: boolean;
	currentUserCanManage?: boolean;
	domain: string;
	expired?: boolean;
	expiry?: string | null;
	expirySoon?: boolean;
	googleAppsSubscription?: GoogleEmailSubscription | null;
	titanMailSubscription?: TitanEmailSubscription | null;
	hasRegistration?: boolean;
	hasWpcomNameservers?: boolean;
	hasZone?: boolean;
	isPendingIcannVerification?: boolean;
	isIcannVerificationSuspended?: boolean;
	isPendingRenewal?: boolean;
	isPremium?: boolean;
	isPrimary?: boolean;
	isSubdomain?: boolean;
	isWPCOMDomain?: boolean;
	manualTransferRequired?: boolean;
	newRegistration?: boolean;
	name?: string;
	owner?: string;
	partnerDomain?: boolean;
	pendingRegistration?: boolean;
	pendingRegistrationTime?: string;
	pointsToWpcom?: boolean;
	registrar?: string;
	registrationDate?: string;
	subscriptionId?: string | null;
	supportsDomainConnect?: boolean;
	supportsGdprConsentManagement: boolean;
	type?: string;
	transferStartDate?: string | null;
	transferEndDate?: string | null;
}