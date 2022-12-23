import { isEqual, sum } from "lodash";

/** A class that gives convenient tools for dealing with 2D or 3D coordinates */
export class XYZ {

    /** Adds multiple coordinates together and returns a new object */
    static sum( ...coords: XYZ[] ): XYZ;
    static sum( ...coords: number[][] ): XYZ;
    static sum( ...coords: any[] ): XYZ {
        // convert to XYZ object if necessary
        if ( !(coords[0] instanceof XYZ) ) {
            coords = coords.map( c => new XYZ(c) );
        }
        return new XYZ(
            sum( coords.map(c => c.x) ),
            sum( coords.map(c => c.y) ),
            sum( coords.map(c => c.z) )
        );
    }

    public x: number;
    public y: number;
    public z: number;

    /** Initialize the object with either ([x,y,z]) or (x, y) or (x, y, z) */
    constructor( x: number, y: number );
    constructor( x: number, y: number, z: number );
    constructor( nums: number[] );
    constructor( ...args: any[] ) {
        if ( Array.isArray(args[0]) ) {
            this.x = args[0][0];
            this.y = args[0][1];
            this.z = args[0][2] ?? 0;
        } else {
            this.x = args[0];
            this.y = args[1];
            this.z = args[2] ?? 0;
        }
    }

    /** Adds additional coordinates, modifying the current one, and returns the original object */
    plus( ...coords: XYZ[] ): XYZ;
    plus( ...coords: number[][] ): XYZ;
    plus( ...coords: any[] ): XYZ {
        // convert to XYZ object if necessary
        if ( !(coords[0] instanceof XYZ) ) {
            coords = coords.map( c => new XYZ(c) );
        }
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] += sum( coords.map(c => c[prop]) ) );
        return this;
    }

    /** Subtracts additional coordinates, modifying the current one, and returns the original object */
    minus( ...coords: XYZ[] ): XYZ;
    minus( ...coords: number[][] ): XYZ;
    minus( ...coords: any[] ): XYZ {
        // convert to XYZ object if necessary
        if ( !(coords[0] instanceof XYZ) ) {
            coords = coords.map( c => new XYZ(c) );
        }
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] += sum( coords.map(c => -c[prop]) ) );
        return this;
    }

    /** Multiplies all values by a given scalar. Modifies the original object */
    times( scalar: number ): XYZ {
        [ 'x', 'y', 'z' ].forEach( prop => this[prop] *= scalar );
        return this;
    }

    /** Returns a copy of the object */
    copy(): XYZ {
        return new XYZ( this.x, this.y, this.z );
    }

    /**
     * Returns a new XYZ object whose values are either 0, 1, or -1, representing whether the x, y, and z values are
     * positive, negative, or 0
     */
    toSign(): XYZ {
        return new XYZ(
            this.x === 0 ? 0 : this.x / Math.abs( this.x ),
            this.y === 0 ? 0 : this.y / Math.abs( this.y ),
            this.z === 0 ? 0 : this.z / Math.abs( this.z )
        );
    }

    eq( coord: XYZ ): boolean {
        return coord != null && this.x === coord.x && this.y === coord.y && this.z === coord.z;
    }

    toString(): string {
        return `${this.x},${this.y},${this.z}`;
    }
}