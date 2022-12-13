import { sum } from 'lodash';
import { outputAnswers } from '../output-answers';
import { officialInput, testInput } from './inputs';

interface INode {
    name: string;
    type: 'file' | 'directory'
    size?: number; // has size if it's a file
    children?: INode[]; //has children if it's a directory
    parent?: INode; // has a parent if it's a non-root directory
}

/** Parses the raw input, builds a filesystem tree, and returns a flat array of all directories */
function parseToFlatDirs( input: string ): INode[] {
    const root = addDirectory( null, 'dir /' );
    let cd = root;

    // slice( 1 ) to ignore the first line because it's always `$ cd /`
    input.split( '\n' ).slice( 1 ).forEach( line => {
        if ( line.startsWith('$ cd') ) {
            const dirName = line.match( /cd (.*)/ )[1];
            cd = dirName === '..' ? cd.parent : cd.children.find( child => child.type === 'directory' && child.name === dirName );
        } else if ( line.startsWith('dir') ) {
            addDirectory( cd, line );
        } else if ( line.match(/^\d/) != null ) {
            addFile( cd, line );
        }
    });

    return flattenTree( root );
}

/** Returns a flat array of all directories */
function flattenTree( startNode: INode ): INode[] {
    return startNode.children.filter(
        child => child.type === 'directory'
    ).reduce(
        ( flat, child ) => flat.concat( ...flattenTree(child) ),
        [ startNode ]
    );
}

/** Recursively adds the size of all files within the directory */
function getTotalSize( dir: INode ): number {
    return dir.children.reduce(
        ( total, node ) => total + ( node.type === 'file' ? node.size : getTotalSize(node) ),
        0
    );
}

function addDirectory( cd: INode, inputLine: string ): INode {
    const newDir: INode = {
        name: inputLine.match( / (.*)$/ )?.[1],
        type: 'directory',
        children: [],
        parent: cd
    };
    cd?.children?.push( newDir );
    return newDir;
}

function addFile( cd: INode, inputLine: string ) {
    const props = inputLine.match( /(.*) (.*)/ );
    cd.children.push({
        name: props[2],
        type: 'file',
        size: parseInt( props[1] )
    });
}

outputAnswers(
    testInput,
    officialInput,
    // function that solves part 1
    ( input: string ) => sum(
        parseToFlatDirs( input ).map( getTotalSize ).filter( size => size <= 100000 )
    ),
    // function that solves part 2
    ( input: string ) => {
        const dirSizes = parseToFlatDirs( input ).map( getTotalSize );
        const freeSpace = 70000000 - dirSizes[0];
        const addlSpaceNeeded = 30000000 - freeSpace;
        return Math.min( ...dirSizes.filter(size => size >= addlSpaceNeeded) );
    }
);
