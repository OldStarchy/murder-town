import Vec2 from '../math/Vec2';
import type { Axis } from './Axis';

/**
 * A pair of axes
 */
export default class Axis2d<T extends Axis = Axis> {
	constructor(
		readonly x: T,
		readonly y: T,
	) {}

	get vec(): Vec2 {
		return new Vec2(this.x.value, this.y.value);
	}
}
