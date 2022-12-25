import { sum } from 'lodash';
import { officialInput, testInput } from './inputs';

const glyphs = [ '=', '-', '0', '1', '2' ]
const [ base, offset ] = [ 5, 2 ];

/** converts SNAFU to decimal */
function toDecimal( snafu: string ): number {
    return snafu.split( '' ).reverse().reduce(
        (total, symbol, i) => total + base**i * (glyphs.indexOf(symbol) - offset),
        0
    );
}

/** converts decimal to SNAFU */
function toSnafu( num: number ): string {
    const digits = [];
    while ( num > 0 ) {
        // SNAFU is base 5, but each digits place is shifted by 2
        num += offset;
        digits.unshift( num % base );
        num = Math.floor( num / base );
    }
    // convert regular digits to SNAFU glyphs
    return digits.map( digit => glyphs[digit] ).join( '' );
}

const solve = (input: string) => toSnafu( sum( input.split('\n').map(toDecimal) ) );

console.log( 'Answer for test input:', solve(testInput) );
console.log( 'Answer:', solve(officialInput ) );
