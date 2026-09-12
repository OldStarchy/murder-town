import { Axis } from './Axis';
import type { Button } from './Button';

/**
 * A pair of buttons made to work like an axis. Eg. [Right, Left] buttons can be used to emulate an x-axis
 */
export class ButtonsAxis extends Axis {
	get valueRaw(): number {
		return (this.positive.isDown ? 1 : 0) - (this.negative.isDown ? 1 : 0);
	}
	get previousValueRaw(): number {
		return (
			(this.positive.wasDown ? 1 : 0) - (this.negative.wasDown ? 1 : 0)
		);
	}
	get name(): string {
		return `Buttons(+${this.positive.name}, -${this.negative.name})`;
	}

	constructor(
		readonly positive: Button,
		readonly negative: Button,
	) {
		super(0);
	}
}
