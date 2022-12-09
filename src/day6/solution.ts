import { uniq } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/** The packet starts after `numUnique` unique characters in a row have appeared in the string */
function findPacketStart( input: string, numUnique: number ) {
    const letters = input.split( '' );
    return letters.findIndex(
        ( letter, i ) => uniq( letters.slice(i, i + numUnique) ).length === numUnique
    ) + numUnique;
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => findPacketStart( input, 4 ), // function that solves part 1
    ( input: string ) => findPacketStart( input, 14 ) // function that solves part 2
);
