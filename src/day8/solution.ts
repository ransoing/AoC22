import { cloneDeep, identity } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

type Direction = 'up' | 'down' | 'left' | 'right';
interface ITreeInfo {
    viewDistance: number;
    canSeeOutside: boolean;
}
const allDirections: Direction[] = [ 'up', 'down', 'left', 'right' ];

/** Parses the raw string and returns a 2D array of numbers */
function parseInput( input: string ): number[][] {
    return input.split( '\n' ).map( row => row.split('').map(Number) );
}

/** Returns an object containing info about visibility from the tree at [i,j] in the grid, looking in the specified direction */
function getTreeInfo( grid: number[][], i: number, j: number, direction: Direction ): ITreeInfo {
    // build an array that represents the line of trees in the requested direction, from (but not including) the starting tree to the edge
    const treeLine = direction === 'left' ? grid[i].slice( 0, j ).reverse() :
        direction === 'right' ? grid[i].slice( j + 1 ) :
        direction === 'up' ? grid.slice( 0, i ).map( row => row[j] ).reverse() :
        grid.slice( i + 1 ).map( row => row[j] );

    return {
        // if the tree line has a tree as tall as the starting tree, the view distance ends at, and includes, the first tree of such height
        viewDistance: Math.max( ...treeLine ) >= grid[i][j] ? treeLine.findIndex( tree => tree >= grid[i][j] ) + 1 : treeLine.length,
        canSeeOutside: Math.max( ...treeLine ) < grid[i][j]
    }
}

function isVisible( grid: number[][], i: number, j: number ): boolean {
    // a tree is visible if it can see outside the grid in any direction
    return allDirections.map( dir => getTreeInfo(grid, i, j, dir) ).some( info => info.canSeeOutside );
}

function getScenicScore( grid: number[][], i: number, j: number ): number {
    return allDirections.map( dir => getTreeInfo(grid, i, j, dir).viewDistance ).reduce( (total, score) => total * score, 1 );
}

/** converts a grid of tree heights to other values */
function convertTrees<T>( grid: number[][], convertFunc: (grid: number[][], i: number, j: number) => T ): T[][] {
    return cloneDeep( grid ).map(
        ( row, i ) => row.map( (tree, j) => convertFunc(grid, i, j) )
    );
}

outputAnswers(
    testInput,
    officialInput,
    ( input: string ) => convertTrees( parseInput(input), isVisible ).flat().filter( identity ).length, // function that solves part 1
    ( input: string ) => Math.max( ...convertTrees(parseInput(input), getScenicScore).flat() ) // function that solves part 2
);
