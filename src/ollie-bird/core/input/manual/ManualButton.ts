import { Button } from '../Button';
import type { ManualInput } from './ManualInput';

export default class ManualButton extends Button implements ManualInput {
	willBeDown: boolean;

	#isDown: boolean;
	#wasDown: boolean;

	/**
	 * Is the button currently down now?
	 */
	override get isDown(): boolean {
		return this.#isDown;
	}
	/**
	 * Was the button down in the previous frame?
	 */
	override get wasDown(): boolean {
		return this.#wasDown;
	}
	override get name(): string {
		return this.#name;
	}

	readonly #name: string;
	#onDispose?: () => void;
	constructor(name: string, onDispose: () => void) {
		super();
		this.#name = name;
		this.#isDown = false;
		this.#wasDown = false;
		this.willBeDown = false;
		this.#onDispose = onDispose;
	}

	step() {
		this.#wasDown = this.#isDown;
		this.#isDown = this.willBeDown;
	}

	[Symbol.dispose]() {
		this.#onDispose?.();
		this.#onDispose = undefined;
	}
}
