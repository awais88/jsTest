import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestLanguageNames } from 'calypso/state/i18n/language-names/actions';

export default function QueryLanguageNames() {
	const dispatch = useDispatch();
	const { localeSlug } = useTranslate();

	useEffect( () => {
		dispatch( requestLanguageNames() );
	}, [ dispatch, localeSlug ] );

	return null;
}
