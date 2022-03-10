import debugFactory from 'debug';
import { find, flatten, includes, map, startsWith } from 'lodash';
import { countries, dialCodeMap } from 'calypso/components/phone-input/data';

const debug = debugFactory( 'phone-input:metadata' );

export const DIGIT_PLACEHOLDER = '\u7003';
const STANDALONE_DIGIT_PATTERN = /\d(?=[^,}][^,}])/g;
const CHARACTER_CLASS_PATTERN = /\[([^[\]])*]/g;
const LONGEST_NUMBER = '999999999999999';
const LONGEST_NUMBER_MATCH = /9/g;
export const MIN_LENGTH_TO_FORMAT = 3;

/**
 * Removes non digit characters from the string
 *
 * @param {string} inputNumber - Text to remove non-digits from
 * @returns {string} - Text with non-digits removed
 */
export const stripNonDigits = ( inputNumber ) => inputNumber.replace( /\D/g, '' );

function prefixSearch( prefixQuery ) {
	return flatten(
		Object.keys( dialCodeMap )
			.filter( ( dialCode ) => startsWith( prefixQuery, dialCode ) )
			.map( ( dialCode ) => dialCodeMap[ dialCode ] )
	);
}

export function findCountryFromNumber( inputNumber ) {
	let lastExactMatch;

	for ( let i = 1; i <= 6; i++ ) {
		const query = stripNonDigits( inputNumber ).replace( /^0+/, '' ).substr( 0, i );
		if ( Object.prototype.hasOwnProperty.call( dialCodeMap, query ) ) {
			const exactMatch = dialCodeMap[ query ];
			if ( exactMatch.length === 1 ) {
				return countries[ exactMatch[ 0 ] ];
			}
			if ( exactMatch.length > 1 ) {
				lastExactMatch = exactMatch;
			}
		}

		const prefixMatch = prefixSearch( query );

		if ( ! prefixMatch.length && lastExactMatch ) {
			// the one with high priority
			return map( lastExactMatch, ( key ) => countries[ key ] )[ 0 ];
		}

		if ( prefixMatch.length === 1 ) {
			// not an exact match, but there is only one option with this prefix
			return countries[ prefixMatch[ 0 ] ];
		}
	}

	if ( lastExactMatch ) {
		return map( lastExactMatch, ( key ) => countries[ key ] )[ 0 ];
	}

	return null;
}

export const findPattern = ( inputNumber, patterns ) =>
	find( patterns, ( { match, leadingDigitPattern } ) => {
		if ( leadingDigitPattern && inputNumber.search( leadingDigitPattern ) !== 0 ) {
			return false;
		}
		return new RegExp( '^(?:' + match + ')$' ).test( inputNumber );
	} );

/**
 * Creates a template that is long enough to capture the length of phoneNumber
 * e.g. makeTemplate( '4259999999', countryData.us.patterns ) === '(...) ...-....' (where . is actually
 * DIGIT_PLACEHOLDER)
 *
 * @param {string} phoneNumber - The phone number
 * @param {Array} patterns - The list of patterns
 * @returns {string} The template string
 */
export function makeTemplate( phoneNumber, patterns ) {
	const selectedPattern = find( patterns, ( pattern ) => {
		if ( includes( pattern.format, '|' ) ) {
			return false;
		}
		if ( pattern.leadingDigitPattern && phoneNumber.search( pattern.leadingDigitPattern ) !== 0 ) {
			return false;
		}
		debug( 'pattern.match = ', pattern );
		const match = pattern.match
			.replace( CHARACTER_CLASS_PATTERN, '\\d' )
			.replace( STANDALONE_DIGIT_PATTERN, '\\d' );
		const matchingNumber = LONGEST_NUMBER.match( new RegExp( match ) )[ 0 ];

		return matchingNumber.length >= phoneNumber.length;
	} );

	if ( ! selectedPattern ) {
		return phoneNumber.replace( /./g, DIGIT_PLACEHOLDER );
	}

	const selectedPatternMatch = selectedPattern.match
		.replace( CHARACTER_CLASS_PATTERN, '\\d' )
		.replace( STANDALONE_DIGIT_PATTERN, '\\d' );

	const matchingNumber = LONGEST_NUMBER.match( new RegExp( selectedPatternMatch ) )[ 0 ];
	const template = matchingNumber.replace(
		new RegExp( selectedPatternMatch, 'g' ),
		selectedPattern.replace
	);
	return template.replace( LONGEST_NUMBER_MATCH, DIGIT_PLACEHOLDER );
}

/**
 * Applies a template to a phone number with the option for cursor position tracking
 *
 * @param {string} phoneNumber - The phone number in national number format
 * @param {string} template - The template string generated by `makeTemplate`
 * @param {{pos: number}} [positionTracking={pos:0}] - Optional object with 'pos' property matching to the cursor
 *   position. The function will update the pos property to the match the new position after applying the template.
 * @returns {string} The formatted number
 */
export function applyTemplate( phoneNumber, template, positionTracking = { pos: 0 } ) {
	let res = '';
	let phoneNumberIndex = 0;

	const originalPosition = positionTracking.pos;
	for ( let i = 0; i < template.length && phoneNumberIndex < phoneNumber.length; i++ ) {
		const char = template[ i ];
		if ( char === DIGIT_PLACEHOLDER ) {
			res += phoneNumber[ phoneNumberIndex++ ];
		} else {
			res += template[ i ];
			if ( phoneNumberIndex <= originalPosition ) {
				positionTracking.pos++;
			}
		}
	}
	return res;
}

/**
 * Processes a non-formatted input and generates a dial prefix and national phone number. This method does not format
 * the string.
 * This is an opinionated function, it assumes that
 * If the number starts with a "+", it will use an international format.
 * If the number starts with a "1" and is a NANPA number, it will use the national format with "1 " as prefix
 * If the number starts does not start with a "1" but is a NANPA number, it will just use the national format with no
 * prefix. For everything else it will use the `nationalPrefix` for the given region.
 *
 * @param {string} inputNumber - Unformatted number
 * @param {object} numberRegion - The local/region for which we process the number
 * @returns {{nationalNumber: string, prefix: string}} - Phone is the national phone number and prefix is to be
 *   shown before the phone number
 */
export function processNumber( inputNumber, numberRegion ) {
	let prefix = numberRegion.nationalPrefix || '';

	let nationalNumber = stripNonDigits( inputNumber );
	// If the number starts with a '+', then it most likely starts with an international dialing code
	// that should be removed. Otherwise, the prefix is probably part of the national number.
	// NANPA countries (with dial code or country dial code '1') also should have the '1' removed here.
	if (
		inputNumber[ 0 ] === '+' ||
		numberRegion.dialCode === '1' ||
		numberRegion.countryDialCode === '1'
	) {
		nationalNumber = nationalNumber.replace(
			new RegExp( '^(0*' + numberRegion.dialCode + ')?(' + numberRegion.nationalPrefix + ')?' ),
			''
		);
	}

	// If the prefix has already been added, remove it because it will be added again later.
	let prefixRegexp = new RegExp( `^${ prefix }` );
	if ( numberRegion.nationalPrefix?.length === 1 ) {
		prefixRegexp = new RegExp( `^${ prefix }+` );
	}
	nationalNumber = nationalNumber.replace( prefixRegexp, '' );

	debug( `National Number: ${ nationalNumber } for ${ inputNumber } in ${ numberRegion.isoCode }` );

	if ( inputNumber[ 0 ] === '+' ) {
		prefix = '+' + numberRegion.dialCode + ' ';
	} else if ( numberRegion.dialCode === '1' ) {
		prefix = stripNonDigits( inputNumber )[ 0 ] === '1' ? '1 ' : '';
	}

	return { nationalNumber, prefix };
}

/**
 * Formats a phone number within the given region.
 * Formatting numbers is a beast. In order to reduce the amount of the complexity this can bring, this function makes a
 * few assumptions.
 *
 * If the number starts with a "+", the international formats are preferred. Not all of the countries have different
 * international and nationals formats. So you might not see a difference apart from having an international prefix or a
 * national one.
 *
 * For example NANPA countries have international formats `+1 555-666-7777 which are different than
 * national ones: `(555) 666-7777`. NANPA countries can also have a special format where the number starts with `1`, in
 * which case the format will be `1 (555) 666-7777).
 *
 * For the most part of the world except NANPA, the national dial prefix is 0. So you might see `0555 666 7777` as a
 * national format and `+90 5556667777` as international format.
 *
 * This function also supports partial formatting, i.e. it can format incomplete numbers as well.
 *
 * @param {string} inputNumber - Unformatted number
 * @param {object} country - The region for which we are formatting
 * @returns {string} - Formatted number
 */
export function formatNumber( inputNumber, country ) {
	const digitCount = stripNonDigits( inputNumber ).length;
	if ( digitCount < MIN_LENGTH_TO_FORMAT || digitCount < ( country.dialCode || '' ).length ) {
		if ( inputNumber[ 0 ] === '+' ) {
			return '+' + stripNonDigits( inputNumber.substr( 1 ) );
		}
		return stripNonDigits( inputNumber );
	}

	// Some countries don't have their own patterns, but share / follow another country's patterns. Here we switch the
	// country to the one with the patterns.
	if ( country.patternRegion ) {
		country = countries[ country.patternRegion ];
	}

	const { nationalNumber, prefix } = processNumber( inputNumber, country );

	const patterns =
		( [ '+', '1' ].includes( inputNumber[ 0 ] ) && country.internationalPatterns ) ||
		country.patterns ||
		[];
	const pattern = findPattern( nationalNumber, patterns );

	if ( pattern ) {
		debug(
			`Will replace "${ nationalNumber }" with "${ pattern.match }" and "${ pattern.replace }" with prefix "${ prefix }"`
		);
		return prefix + nationalNumber.replace( new RegExp( pattern.match ), pattern.replace );
	}

	debug( `Couldn't find a ${ country.isoCode } pattern for ${ inputNumber }` );

	const template = makeTemplate( nationalNumber, patterns );
	if ( template ) {
		debug( `Will replace "${ nationalNumber }" with "${ template }" with prefix "${ prefix }"` );
		return prefix + applyTemplate( nationalNumber, template );
	}
	return inputNumber;
}

export function toE164( inputNumber, country ) {
	const { nationalNumber } = processNumber( inputNumber, country );
	return '+' + country.dialCode + nationalNumber;
}

export function toIcannFormat( inputNumber, country ) {
	if ( ! country ) {
		return inputNumber;
	}

	const { nationalNumber } = processNumber( inputNumber, country );
	const countryCode = country.countryDialCode || country.dialCode;
	const dialCode = country.countryDialCode && country.regionCode ? country.regionCode : '';

	return '+' + countryCode + '.' + dialCode + nationalNumber;
}

/**
 * Given two masked strings, old and new, approximates the
 * expected cursor position in new after the (unknown) edit
 * operation(s) changing old into new.
 *
 * Assumptions:
 *   - masking and unmasking (as defined here) are mutual inverses
 *   - edits are made from left to right
 *       (maybe relevant for rtl languages)
 *   - w is a strict subsequence of mask(w)
 *       (as defined in indexOfStrictSubsequenceEnd)
 *   - the cursor position should be at the right edge of
 *       the rightmost "changed" digit
 *
 * Known weird behaviors:
 *   - If newValue is obtained from oldValue by e.g. replacing
 *     'oba' in 'foobar' by 'iba', via pasting, then the cursor
 *     position may be placed after 'i', rather than after 'a',
 *     depending on where the cursor position is before the edit.
 *
 * @param {string} oldValue Masked original string
 * @param {string} newValue Masked updated string
 * @param {number} oldCursorPosition Index of the cursor in oldValue
 * @returns {number} The new cursor position
 */
export function getUpdatedCursorPosition( oldValue, newValue, oldCursorPosition ) {
	const toList = ( str ) => str.split( '' );
	const unmask = ( list ) => list.filter( ( char ) => /\d/.test( char ) );

	if ( newValue.match( /^\+$/ ) ) {
		return 1;
	}

	// Find the leftmost index point from the right end where
	// the old and new (unmasked!) values agree (from right to
	// left). We start by assuming this point is where the edits
	// stopped. (This may be wrong; see below)
	const [ idxOld, idxNew ] = indexOfLongestCommonSuffix(
		unmask( toList( oldValue ) ),
		unmask( toList( newValue ) )
	);

	// Find the cursor position in the unmasked old string.
	const oldUnmaskedCursorPosition = numDigitsBeforeIndex( toList( oldValue ), oldCursorPosition );

	// Our assumption about the portion of the string actually
	// updated is definitely wrong if the old cursor point is
	// to the right of the index of the longest common suffix.
	// We can correct for this by adding this offset to that index.
	const idxOffset = Math.max( 0, oldUnmaskedCursorPosition - idxOld );

	// NB: indexOfLongestCommonSuffix mutates its arguments;
	// this expression is also passed to that function above
	// but we can't factor it out.
	const newDigits = unmask( toList( newValue ) );

	// Now the unmasked new value appears in the masked new
	// value as a subsequence, and the new cursor position
	// is the corresponding index.
	const [ offset ] = indexOfStrictSubsequenceEnd(
		newDigits.slice( 0, idxNew + idxOffset ),
		toList( newValue )
	);

	return offset;
}

/**
 * Given two arrays w1 and w2, a /common suffix/ is an array v such that
 * there exist arrays w1' and w2' where
 *
 *   w1 === w1'.concat(v)   and   w2 === w2'.concat(v)
 *
 * If, in addition, w1' and w2' have no common suffix except for [],
 * then v is the /longest common suffix/ of w1 and w2. (This is analogous
 * to the definition of greatest common divisor for integers.)
 *
 * For two arrays array1 and array2, this function finds the /index/
 * of the first item in their longest common suffix /in array2/ --
 * that is, it computes w2'.length.
 *
 * @param array1 An array
 * @param array2 An array
 * @returns [number, number] Index of the longest common suffix
 *   in each argument
 */
export function indexOfLongestCommonSuffix( array1, array2 ) {
	if ( array1.length === 0 || array2.length === 0 ) {
		return [ array1.length, array2.length ];
	}
	const c1 = array1.pop(); // mutate!
	const c2 = array2.pop(); // mutate!
	if ( c1 !== c2 ) {
		return [ 1 + array1.length, 1 + array2.length ]; // add 1 since we popped
	}
	return indexOfLongestCommonSuffix( array1, array2 );
}

/**
 * Given two integer indexed arrays w1 and w2, we say that w1
 * is a /subsequence/ of w2 if there is a monotone function f
 * such that
 *
 *   w1[k] === w2[f(k)]
 *
 * for all integers k such that w1[k] exists. We say the
 * subsequence is /strict/ if, in addition, for all k in
 * the support of w1, f(k) is minimal among [k+1,...] such that
 * w1[k] === w2[f(k)]. If w1 is a strict subsequence of w2
 * then the function f that witnesses this is unique.
 *
 * That is a mouthful, but it captures this intuition:
 *
 *   w1 is a strict subsequence of w2 if the items of w1
 *   appear in w2, in order, and such that corresponding
 *   w1 items in w2 are pushed "as far to the left" as
 *   possible.
 *
 * Suppose we have two arrays, array1 and array2, such that
 * array1 is a strict subsequence of a2. This function
 * computes the index after the last array1 item in array2.
 * That is, it finds the (unique) index 1 + f( array1.length ),
 * where f is the subsequence witness.
 *
 * @param array1 An array
 * @param array2 An array, which includes array1 as a strict subsequence
 * @returns [number, array] Index after the last array1 item in
 *   array2, as well as the remainder of array2
 */
export function indexOfStrictSubsequenceEnd( array1, array2 ) {
	const accumulate = ( a1, a2, offset ) => {
		if ( a1.length === 0 ) {
			return [ offset, a2 ];
		}
		// if array1 is actually a subsequence this case shouldn't happen.
		if ( a2.length === 0 ) {
			return [ offset, a2 ];
		}
		const c1 = a1.shift(); // mutate!
		const c2 = a2.shift(); // mutate!
		if ( c1 !== c2 ) {
			a1.unshift( c1 );
		}
		return accumulate( a1, a2, 1 + offset );
	};

	return accumulate( array1, array2, 0 );
}

/**
 * Counts the number of non-digit characters appearing
 * at the front of an array of characters.
 *
 * @param array An array of characters
 * @returns number Number of non-digit characters appearing at the start
 */
export function nonDigitsAtStart( array ) {
	const accumulate = ( a, offset ) => {
		if ( a.length === 0 ) {
			return offset;
		}
		const c = a.shift(); // mutate!
		if ( /\d/.test( c ) ) {
			return offset;
		}
		return accumulate( a, 1 + offset );
	};

	return accumulate( array, 0 );
}

/**
 * Count the number of digits appearing left of a given
 * index in an array of strings.
 *
 * @param array An array
 * @param index Index at which to cut off the count
 */
export function numDigitsBeforeIndex( array, index ) {
	return array.slice( 0, index ).filter( ( x ) => /\d/.test( x ) ).length;
}
