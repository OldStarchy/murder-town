import ManualAxis from './ManualAxis';
import ManualButton from './ManualButton';
import type { ManualInput } from './ManualInput';

/**
 * "Manual" inputs are made for NPC agent control.
 *
 * They are not tied to a real input device but can instead be set by code.
 */
export default class Manual {
	#inputs: Set<ManualInput>;

	constructor() {
		this.#inputs = new Set();
	}

	createButton(name: string): ManualButton {
		const button = new ManualButton(name, () =>
			this.#inputs.delete(button),
		);
		this.#inputs.add(button);
		return button;
	}

	createAxis(name: string): ManualAxis {
		const axis = new ManualAxis(name, () => this.#inputs.delete(axis));
		this.#inputs.add(axis);
		return axis;
	}

	step() {
		this.#inputs.values().forEach((input) => input.step());
	}
}
