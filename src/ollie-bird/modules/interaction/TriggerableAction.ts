import type GameObject from '../../core/GameObject';
import Module from '../../core/Module';

export default class TriggerableAction extends Module {
	action?: () => void;

	constructor(owner: GameObject, action?: () => void) {
		super(owner);
		this.action = action;
	}

	activate() {
		this.action?.();
	}
}
