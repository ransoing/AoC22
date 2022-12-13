import { cloneDeep, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

function solve( input: string ) {
    return sum(
        input.split( '\n\n' ).map( (linesPair, i) => {
            // map to 0 if in the wrong order; map to the index if in the right order
            const pair = linesPair.split( '\n' ).map( line => JSON.parse(line) );
            return compare( pair[0], pair[1] ) < 0 ? i + 1 : 0; // use i + 1 because the puzzle's "indeces" are 1-indexed
        })
    );
}

function solve2( input: string ) {
    const decoders = [ [[2]], [[6]] ];
    let packets = input.split( '\n' ).filter( line => line != '' ).map( line => JSON.parse(line) ).concat( decoders );
    packets.sort( compare );
    return ( packets.indexOf(decoders[0]) + 1 ) * ( packets.indexOf(decoders[1]) + 1 );
}

function compare( a: number | number[], b: number | number[] ): number {
    if ( typeof a === 'number' && typeof b === 'number' ) {
        return (a as number) - (b as number);
    }
    if ( typeof a === 'number' ) {
        a = [ a ];
    } else if ( typeof b === 'number' ) {
        b = [ b ];
    }
    a = cloneDeep( a ) as number[];
    b = cloneDeep( b ) as number[];
    while ( a.length > 0 ) {
        if ( b.length === 0 ) {
            return 1;
        }
        const result = compare( a.shift(), b.shift() );
        if ( result !== 0 ) {
            return result;
        }
    }
    return b.length === 0 ? 0 : -1;
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => solve( input ), // function that solves part 1
    ( input: string ) => solve2( input ) // function that solves part 2
);
