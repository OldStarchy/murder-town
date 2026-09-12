import type GameObject from '../../core/GameObject';
import Module from '../../core/Module';
import {
	MeepleControls,
	type ManualMeepleControls,
} from '../../MeepleControls';

export default class MeepleNpcController extends Module {
	controls: ManualMeepleControls;

	constructor(owner: GameObject) {
		super(owner);

		this.controls = MeepleControls.fromManual(this.game.input.manual);
	}

	timer: number = 0;
	protected update(): void {
		if (this.timer <= 0) {
			this.timer += 0.5 * Math.random() * 2;
			this.changeMovements();
		}

		this.timer -= this.game.secondsPerFrame;
	}

	private changeMovements() {
		this.controls.Walk.x.nextValueRaw = Math.floor(Math.random() * 3) - 1;
		this.controls.Walk.y.nextValueRaw = Math.floor(Math.random() * 3) - 1;
	}

	static {
		Module.serializer.registerSerializationType(
			'MeepleNpcController',
			this,
		);
	}
}
