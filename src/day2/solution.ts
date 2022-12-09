import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

// the value is equal to the score when you throw the shape, and is also used to determine what beats what
enum HandShape {
    Rock = 1,
    Paper = 2,
    Scissors = 3
}

/** Takes raw puzzle input and returns a 2D array of hand shapes */
function parseInputPart1( input: string ): HandShape[][] {
    return input.split( '\n' ).map( line => line.split(' ').map( convertToHandShape ) );
}

function convertToHandShape( letter: string ): HandShape {
    return 'AX'.includes( letter ) ? HandShape.Rock :
        'BY'.includes( letter ) ? HandShape.Paper :
        HandShape.Scissors;
}

function parseInputPart2( input: string ): HandShape[][] {
    return input.split( '\n' ).map( line => convertPart2LineToHandShapes(line.split(' ')) );
}

// converts something like ['A', 'X'] to an array of two HandShapes, assuming that X, Y, and Z means lose, draw, and win (respectively)
function convertPart2LineToHandShapes( parts: string[] ): HandShape[] {
    const theirShape = convertToHandShape( parts[0] );
    const myShape = parts[1] === 'X' ? theirShape - 1 :
        parts[1] === 'Y' ? theirShape : theirShape + 1;
    // return the opponent's hand shape, and normalize `myShape` to a range of between 1-3 (inclusive)
    return [ theirShape, ( myShape + 3 - 1 ) % 3 + 1 ];
}

/* Returns the score of a round of rock-paper-scissors */
function scoreRound( shapes: [ HandShape, HandShape ] ): number {
    // a shape beats the number value of the shape that is 1 less (except rock/scissors)
    const shapeDiff = shapes[1] - shapes[0];
    return shapes[1] + ( shapeDiff === 1 || shapeDiff === -2 ? 6 : shapeDiff === 0 ? 3 : 0 );
}

function addRounds( handShapes: HandShape[][] ): number {
    return sum( handShapes.map(scoreRound) );
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => addRounds( parseInputPart1(input) ), // function that solves part 1
    ( input: string ) => addRounds( parseInputPart2(input) )  // function that solves part 2
);
