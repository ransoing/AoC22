import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

type Instruction = number[]; // [ x, y, z ], like "move x from y to z"
type Stack = string[]; // an array of single letters. Index 0 is the bottom of the stack

function moveCrates( input: string, oneAtATime = true ) {
    const lines = input.split( '\n' );
    const indexOfStackNumbers = lines.findIndex( line => line.startsWith(' 1') );
    const stacks = parseStacks( lines.slice(0, indexOfStackNumbers) );
    const instructions = parseInstructions( lines.slice(indexOfStackNumbers + 2) ); // `+2` to skip the stack labels and an empty line

    instructions.forEach( instruction => {
        const removedCrates = stacks[instruction[1]].splice( -instruction[0], instruction[0] );
        stacks[instruction[2]] = stacks[instruction[2]].concat( oneAtATime ? removedCrates.reverse() : removedCrates );
    });

    // return letters representing the top of each stack
    return stacks.map( stack => stack.pop() ).join( '' );
}

/** Parses strings representing vertical stacks of crates into an array of Stack objects */
function parseStacks( lines: string[] ): Stack[] {
    // each crate looks like `[X]`, where X could be any letter. Crates are always followed by either a space or a line terminator.
    // When there is no crate in a given spot, there are three spaces instead of a letter in brackets, i.e. `   `
    // First create an array of arrays, initialized with the correct number of empty stacks
    const stacks = new Array( (lines[0].length + 1) / 4 ).fill( 0 ).map( i => [] );
    lines.forEach( line => {
        // match spots where crates are in the string, converting either to an empty string or a single letter
        const crates = line.match( /.{3}( |$)/g )?.map(
            crate => crate.trim().replace( /\[|\]/g, '' )
        );
        // convert from horizontal representation to vertical representation
        crates.forEach(
            ( crate, i ) => crate === '' ? null : stacks[i].unshift( crate )
        );
    });
    return stacks;
}

function parseInstructions( lines: string[] ): Instruction[] {
    // extract the numbers from the instruction string and subtract 1 from the stack numbers, because our stacks array is zero-indexed
    return lines.map(
        line => line.match( /\d+/g )?.map( Number ).map(
            ( num, i ) => i === 0 ? num : num - 1
        )
    );
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => moveCrates( input, true ), // function that solves part 1
    ( input: string ) => moveCrates( input, false ) // function that solves part 2
);
