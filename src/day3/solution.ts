import { flatten, intersection, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

// a sack has two compartments, and each compartment has items identified by a number (their "priority")
type Sack = [ number[], number[] ];

function parseInput( input: string ): Sack[] {
    return input.split( '\n' ).map( line => {
        const items = line.split( '' ).map( convertLetterToPriority );
        return divideArray( items, items.length / 2 ) as Sack;
    });
}

function convertLetterToPriority( letter: string ): number {
    // charCodes in javascript: a-z maps to 97-122, and A-Z maps to 65-90
    // convert these to ranges of 1-26 and 27-52.
    const charCode = letter.charCodeAt( 0 );
    return charCode - ( charCode >= 97 ? (97 - 1) : (65 - 27) );
}

/** returns the single item that appears in both compartments of a sack */
function findCommonItem( sack: Sack ): number {
    return intersection( sack[0], sack[1] )[0];
}

/**
 * Divides an array into multiple equal parts.
 * I.e. when dividing into groups of 2, turns [ 1, 2, 3, 4, 5, 6 ] into [ [1, 2], [3, 4], [5, 6] ]
 */
function divideArray<T>( arr: T[], groupSize: number ): T[][] {
    return new Array( arr.length / groupSize ).fill( 0 ).map(
        ( item, i ) => arr.slice( i * groupSize, i * groupSize + groupSize )
    );
}

/** finds the single common item in a group of sacks */
function findCommonInGroup( sackGroup: Sack[] ): number {
    return intersection( ...sackGroup.map(flatten) )[0];
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => sum( parseInput(input).map(findCommonItem) ), // function that solves part 1
    ( input: string ) => sum( divideArray(parseInput(input), 3).map(findCommonInGroup) ) // function that solves part 2
);
