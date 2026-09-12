import { Axis } from '../Axis';
import type { ManualInput } from './ManualInput';

export default class ManualAxis extends Axis implements ManualInput {
	override get valueRaw(): number {
		return this.#valueRaw;
	}
	override get previousValueRaw(): number {
		return this.#previousValueRaw;
	}
	override get name(): string {
		return this.#name;
	}

	#valueRaw: number;
	#previousValueRaw: number;
	nextValueRaw: number;

	readonly #name: string;
	#onDispose?: () => void;
	constructor(name: string, onDispose: () => void) {
		super();
		this.#name = name;
		this.#valueRaw = 0;
		this.#previousValueRaw = 0;
		this.nextValueRaw = 0;
		this.#onDispose = onDispose;
	}

	step() {
		this.#previousValueRaw = this.#valueRaw;
		this.#valueRaw = this.nextValueRaw;
	}
	[Symbol.dispose]() {
		this.#onDispose?.();
		this.#onDispose = undefined;
	}
}
