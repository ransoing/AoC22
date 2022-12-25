import { sum } from 'lodash';
import { officialInput, testInput } from './inputs';

const snafmap = { '=': -2, '-': -1, '0': 0, '1': 1, '2': 2 };

/** converts SNAFU to decimal */
function toDecimal( snafu: string ): number {
    return snafu.split( '' ).reverse().reduce( (total, symbol, i) => total + 5**i * snafmap[symbol], 0 );
}

/** converts decimal to SNAFU */
function toSnafu( num: number ): string {
    const digits = [];
    while ( num > 0 ) {
        // SNAFU is base 5, but each digits place is shifted by 2
        num += 2;
        digits.unshift( num % 5 );
        num = Math.floor( num / 5 );
    }
    // convert regular digits to SNAFU glyphs
    return digits.map( digit => [ '=', '-', 0, 1, 2 ][digit] ).join( '' );
}

const solve = (input: string) => toSnafu( sum( input.split('\n').map(toDecimal) ) );

console.log( 'Answer for test input:', solve(testInput) );
console.log( 'Answer:', solve(officialInput ) );
