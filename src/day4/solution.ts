import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

/**
 * Converts the raw input into an array like [ [number, number], [number, number] ][]
 * The first index is the elf pair, the second index is the range of a single elf, and the third index is either the start or end of a range
 */
function parseInput( input: string ): number[][][] {
    return input.split( '\n' ).map(
        line => line.split( ',' ).map(
            range => range.split( '-' ).map( Number )
        )
    );
}

/** Determines if A is a subrange of B (B fully contains A) */
function isSubrange( rangeA: number[], rangeB: number[] ): boolean {
    return rangeA[0] >= rangeB[0] && rangeA[1] <= rangeB[1];
}

function rangesOverlap( ranges: number[][] ): boolean {
    return ranges[0][0] <= ranges[1][1] && ranges[0][1] >= ranges[1][0];
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => parseInput( input ).filter(
        pair => isSubrange(pair[0], pair[1]) || isSubrange(pair[1], pair[0])
    ).length, // function that solves part 1
    ( input: string ) => parseInput( input ).filter( pair => rangesOverlap(pair) ).length // function that solves part 2
);
