import { connect } from 'react-redux';
import QueryCountries from 'calypso/components/data/query-countries';
import { fetchSmsCountries } from 'calypso/state/countries/actions';

export default connect( null, { requestCountries: fetchSmsCountries } )( QueryCountries );
