import { flatten, intersection, sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

// a sack has two compartments, and each compartment has items identified by a number (their "priority")
type Sack = [ number[], number[] ];
type SackTriplet = [ Sack, Sack, Sack ];

function parseInput( input: string ): Sack[] {
    return input.split( '\n' ).map( line => {
        const items = line.split( '' ).map( convertLetterToPriority );
        const compartmentA = items.slice( 0, items.length / 2 );
        const compartmentB = items.slice( items.length / 2 );
        return [ compartmentA, compartmentB ];
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

function splitIntoThrees( sacks: Sack[] ): SackTriplet[] {
    const groupsOfThree = [];
    for ( let i = 0; i < sacks.length; i += 3 ) {
        groupsOfThree.push([ sacks[i], sacks[i+1], sacks[i+2] ]);
    }
    return groupsOfThree;
}

/** finds the common item in a group of three sacks */
function findCommonInGroup( triplet: SackTriplet ): number {
    return intersection( flatten(triplet[0]), flatten(triplet[1]), flatten(triplet[2]) )[0];
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => sum( parseInput(input).map(findCommonItem) ), // function that solves part 1
    ( input: string ) => sum( splitIntoThrees(parseInput(input)).map(findCommonInGroup) ) // function that solves part 2
);
